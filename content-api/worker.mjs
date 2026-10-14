const CONTENT_TYPES = new Set(['blog', 'paper', 'certificate', 'demo']);
const SESSION_TTL_MS = 15 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_LIMITS = new Map();
const MAX_BODY_BYTES = 64000;

const SELECT_COLUMNS = 'id, type, title, data_json, status, created_at, updated_at';

function json(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  const origins = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  return Boolean(origin && origins.includes(origin));
}

function corsHeaders(request) {
  return {
    'Access-Control-Allow-Origin': request.headers.get('Origin'),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function failure(status, message) {
  return Object.assign(new Error(message), { status });
}

function encodeBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function hexToBytes(value) {
  if (!/^(?:[a-f\d]{2})+$/i.test(value)) return null;
  return Uint8Array.from(value.match(/.{2}/g), byte => Number.parseInt(byte, 16));
}

async function verifyPassword(password, encodedHash) {
  const [algorithm, roundsText, saltHex, expectedHex, extra] = String(encodedHash || '').split('$');
  const rounds = Number(roundsText);
  const salt = hexToBytes(saltHex || '');
  const expected = hexToBytes(expectedHex || '');
  if (algorithm !== 'pbkdf2-sha256' || extra !== undefined || !Number.isInteger(rounds) || rounds < 100000 || rounds > 1000000 || !salt || salt.length < 16 || !expected || expected.length !== 32) {
    return false;
  }
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: rounds }, key, 256);
  const actual = new Uint8Array(bits);
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) difference |= actual[index] ^ expected[index];
  return difference === 0;
}

function consumeLoginAttempt(request, now) {
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  let window = LOGIN_LIMITS.get(address);
  if (!window || now - window.startedAt >= LOGIN_WINDOW_MS) {
    if (!window && LOGIN_LIMITS.size >= 5000) LOGIN_LIMITS.delete(LOGIN_LIMITS.keys().next().value);
    window = { startedAt: now, attempts: 0 };
    LOGIN_LIMITS.set(address, window);
  }
  window.attempts += 1;
  return window.attempts <= LOGIN_ATTEMPT_LIMIT;
}

async function digestToken(token) {
  return encodeBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))));
}

async function createSession(env, now) {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = encodeBase64Url(tokenBytes);
  const expiresAt = new Date(now + SESSION_TTL_MS).toISOString();
  await env.DB.prepare('DELETE FROM owner_sessions WHERE expires_at <= ?').bind(new Date(now).toISOString()).run();
  await env.DB.prepare('INSERT INTO owner_sessions (token_hash, expires_at) VALUES (?, ?)')
    .bind(await digestToken(token), expiresAt)
    .run();
  return { token, expiresAt };
}

async function sessionToken(request, env, now) {
  const authorization = request.headers.get('Authorization') || '';
  const match = authorization.match(/^Bearer ([A-Za-z0-9_-]{40,60})$/);
  if (!match || !env.DB) return null;
  const tokenHash = await digestToken(match[1]);
  const session = await env.DB.prepare('SELECT token_hash, expires_at FROM owner_sessions WHERE token_hash = ?')
    .bind(tokenHash)
    .first();
  const expiresAt = Date.parse(session?.expires_at);
  if (!session || !Number.isFinite(expiresAt) || expiresAt <= now) return null;
  return { token: match[1], tokenHash };
}

function validateUrl(value, field, optional = true) {
  if (value === undefined || value === null || value === '') {
    if (optional) return '';
    throw failure(400, `${field} is required.`);
  }
  if (typeof value !== 'string' || value.length > 2048) throw failure(400, `${field} is invalid.`);
  let parsed;
  try { parsed = new URL(value); } catch { throw failure(400, `${field} must be a valid HTTPS URL.`); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw failure(400, `${field} must be a valid HTTPS URL.`);
  return parsed.toString();
}

function textField(data, field, { required = false, max = 2000 } = {}) {
  const value = data[field];
  if (value === undefined || value === null || value === '') {
    if (required) throw failure(400, `${field} is required.`);
    return '';
  }
  if (typeof value !== 'string' || value.length > max) throw failure(400, `${field} is invalid or too long.`);
  return value.trim();
}

function listField(data, field, maxItems = 24) {
  const value = data[field];
  if (value === undefined || value === null || value === '') return [];
  if (!Array.isArray(value) && typeof value !== 'string') throw failure(400, `${field} must be a list or comma-separated text.`);
  const items = Array.isArray(value) ? value : value.split(',');
  if (items.length > maxItems || items.some(item => typeof item !== 'string' || item.length > 120)) {
    throw failure(400, `${field} contains invalid values.`);
  }
  return items.map(item => item.trim()).filter(Boolean);
}

function validateEntry(type, rawData) {
  if (!CONTENT_TYPES.has(type)) throw failure(400, 'Content type is invalid.');
  if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) throw failure(400, 'Content data is invalid.');
  const data = {};
  data.title = textField(rawData, 'title', { required: true, max: 180 });

  if (type === 'blog') {
    data.summary = textField(rawData, 'summary', { max: 1000 });
    data.body = textField(rawData, 'body', { max: 40000 });
    data.publicationDate = textField(rawData, 'publicationDate', { max: 40 });
    data.tags = listField(rawData, 'tags');
    data.projectReferences = listField(rawData, 'projectReferences');
    data.imageUrl = validateUrl(rawData.imageUrl, 'imageUrl');
    if (rawData.links !== undefined && !Array.isArray(rawData.links)) throw failure(400, 'links must be a list.');
    if (Array.isArray(rawData.links) && rawData.links.length > 12) throw failure(400, 'links contains too many values.');
    data.links = Array.isArray(rawData.links) ? rawData.links.map(link => ({
      label: typeof link?.label === 'string' ? link.label.slice(0, 120).trim() : 'Reference',
      url: validateUrl(link?.url, 'link URL', false),
    })) : [];
  } else if (type === 'paper') {
    data.authors = textField(rawData, 'authors', { max: 1000 });
    data.publicationYear = textField(rawData, 'publicationYear', { max: 10 });
    data.publicationDate = textField(rawData, 'publicationDate', { max: 40 });
    data.source = textField(rawData, 'source', { max: 300 });
    data.sourceUrl = validateUrl(rawData.sourceUrl, 'sourceUrl');
    data.summary = textField(rawData, 'summary', { max: 4000 });
    data.tags = listField(rawData, 'tags');
    data.personalNotes = textField(rawData, 'personalNotes', { max: 8000 });
  } else if (type === 'certificate') {
    data.issuer = textField(rawData, 'issuer', { required: true, max: 180 });
    data.issueDate = textField(rawData, 'issueDate', { max: 40 });
    data.credentialId = textField(rawData, 'credentialId', { max: 180 });
    data.certificateUrl = validateUrl(rawData.certificateUrl, 'certificateUrl');
    data.imageUrl = validateUrl(rawData.imageUrl, 'imageUrl');
    data.verificationUrl = validateUrl(rawData.verificationUrl, 'verificationUrl');
  } else {
    data.description = textField(rawData, 'description', { max: 3000 });
    data.category = textField(rawData, 'category', { required: true, max: 100 });
    data.technologies = listField(rawData, 'technologies');
    data.thumbnailUrl = validateUrl(rawData.thumbnailUrl, 'thumbnailUrl');
    data.screenshots = listField(rawData, 'screenshots', 12).map(value => validateUrl(value, 'screenshot URL', false));
    data.githubUrl = validateUrl(rawData.githubUrl, 'githubUrl');
    data.liveDemoUrl = validateUrl(rawData.liveDemoUrl, 'liveDemoUrl');
    data.creationDate = textField(rawData, 'creationDate', { max: 40 });
  }
  return data;
}

function serializeEntry(row) {
  let data;
  try { data = JSON.parse(row.data_json); } catch { data = {}; }
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    data,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function readRequestJson(request) {
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > MAX_BODY_BYTES) throw failure(413, 'Request body is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw failure(400, 'Request body must be valid JSON.');
  const chunks = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw failure(413, 'Request body is too large.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const text = new TextDecoder().decode(bytes);
  try { return JSON.parse(text); } catch { throw failure(400, 'Request body must be valid JSON.'); }
}

async function handleApi(request, env, now) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  if (request.method === 'GET' && path === '/health') return json({ available: Boolean(env.DB) }, 200);

  if (request.method === 'POST' && path === '/api/auth/login') {
    if (!consumeLoginAttempt(request, now)) throw failure(429, 'Too many login attempts. Try again later.');
    if (!env.DB || !env.OWNER_PASSWORD_HASH) throw failure(503, 'Owner authentication is not configured.');
    const body = await readRequestJson(request);
    if (!body || typeof body.password !== 'string' || body.password.length < 1 || body.password.length > 1024) {
      throw failure(401, 'Owner authentication failed.');
    }
    if (!await verifyPassword(body.password, env.OWNER_PASSWORD_HASH)) throw failure(401, 'Owner authentication failed.');
    LOGIN_LIMITS.delete(request.headers.get('CF-Connecting-IP') || 'unknown');
    const session = await createSession(env, now);
    return json({ token: session.token, expiresAt: session.expiresAt }, 200);
  }

  if (request.method === 'GET' && path.startsWith('/api/public/')) {
    if (!env.DB) throw failure(503, 'Content storage is not configured.');
    const type = decodeURIComponent(path.slice('/api/public/'.length));
    if (!CONTENT_TYPES.has(type)) throw failure(404, 'Content section not found.');
    const result = await env.DB.prepare(`SELECT ${SELECT_COLUMNS} FROM content_entries WHERE type = ? AND status = 'published' ORDER BY updated_at DESC`)
      .bind(type)
      .all();
    return json({ entries: (result.results || []).map(serializeEntry) }, 200);
  }

  const session = await sessionToken(request, env, now);
  if (!session) throw failure(401, 'Owner session is missing or expired.');
  if (!env.DB) throw failure(503, 'Content storage is not configured.');

  if (request.method === 'POST' && path === '/api/auth/logout') {
    await env.DB.prepare('DELETE FROM owner_sessions WHERE token_hash = ?').bind(session.tokenHash).run();
    return json({ ok: true }, 200);
  }

  if (request.method === 'GET' && path === '/api/owner/entries') {
    const result = await env.DB.prepare(`SELECT ${SELECT_COLUMNS} FROM content_entries ORDER BY updated_at DESC`).all();
    return json({ entries: (result.results || []).map(serializeEntry) }, 200);
  }

  if (request.method === 'POST' && path === '/api/owner/entries') {
    const body = await readRequestJson(request);
    const type = body?.type;
    const data = validateEntry(type, body?.data);
    const status = body.status === 'published' ? 'published' : body.status === 'draft' ? 'draft' : null;
    if (!status) throw failure(400, 'Publication status is invalid.');
    const timestamp = new Date(now).toISOString();
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO content_entries (id, type, title, data_json, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, type, data.title, JSON.stringify(data), status, timestamp, timestamp)
      .run();
    return json({ entry: { id, type, title: data.title, data, status, createdAt: timestamp, updatedAt: timestamp } }, 201);
  }

  const entryMatch = path.match(/^\/api\/owner\/entries\/([\w-]{1,80})$/);
  if (!entryMatch) throw failure(404, 'Content endpoint not found.');
  const id = entryMatch[1];
  if (request.method === 'PUT') {
    const body = await readRequestJson(request);
    const existing = await env.DB.prepare(`SELECT ${SELECT_COLUMNS} FROM content_entries WHERE id = ?`).bind(id).first();
    if (!existing) throw failure(404, 'Content entry not found.');
    const data = validateEntry(existing.type, body?.data);
    const status = body.status === 'published' ? 'published' : body.status === 'draft' ? 'draft' : null;
    if (!status) throw failure(400, 'Publication status is invalid.');
    const timestamp = new Date(now).toISOString();
    await env.DB.prepare('UPDATE content_entries SET title = ?, data_json = ?, status = ?, updated_at = ? WHERE id = ?')
      .bind(data.title, JSON.stringify(data), status, timestamp, id)
      .run();
    return json({ entry: { ...serializeEntry(existing), title: data.title, data, status, updatedAt: timestamp } }, 200);
  }
  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM content_entries WHERE id = ?').bind(id).run();
    return json({ ok: true }, 200);
  }
  throw failure(405, 'Method not allowed.');
}

export async function handleRequest(request, env, options = {}) {
  const now = options.now ?? Date.now();
  if (!allowedOrigin(request, env)) return json({ error: 'Origin not allowed.' }, 403);
  const headers = corsHeaders(request);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  try {
    const response = await handleApi(request, env, now);
    const responseHeaders = new Headers(response.headers);
    for (const [name, value] of Object.entries(headers)) responseHeaders.set(name, value);
    return new Response(response.body, { status: response.status, headers: responseHeaders });
  } catch (error) {
    const status = Number(error?.status) || 500;
    const message = status >= 500 ? 'Content service is temporarily unavailable.' : error.message;
    return json({ error: message }, status, headers);
  }
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  },
};
