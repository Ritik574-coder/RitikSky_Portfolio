import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest } from '../worker.mjs';

const origin = 'https://ritik574-coder.github.io';
const env = { ALLOWED_ORIGINS: origin };

function makeRequest(path, body, ip = '198.51.100.7') {
  return new Request(`https://assistant.test${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Origin: origin, 'CF-Connecting-IP': ip, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const validBody = { message: 'Explain my warehouse project', context: 'Verified project facts.', history: [] };

test('rejects unlisted origins and malformed or oversized questions', async () => {
  const denied = await handleRequest(new Request('https://assistant.test/chat', { method: 'POST', headers: { Origin: 'https://bad.example' }, body: '{}' }), env, { now: 1 });
  assert.equal(denied.status, 403);
  const malformed = await handleRequest(makeRequest('/chat', { ...validBody, message: '  ' }), env, { now: 2 });
  assert.equal(malformed.status, 400);
  const tooLong = await handleRequest(makeRequest('/chat', { ...validBody, message: 'x'.repeat(1201) }), env, { now: 3 });
  assert.equal(tooLong.status, 400);
  const oversizedBody = await handleRequest(makeRequest('/chat', { ...validBody, context: 'x'.repeat(24001) }), env, { now: 4 });
  assert.equal(oversizedBody.status, 413);
});

test('moves to another provider after a temporary network failure without retrying the first', async () => {
  let calls = 0;
  const response = await handleRequest(makeRequest('/chat', validBody, '198.51.100.11'), {
    ...env,
    GEMINI_API_KEY: 'temporary-key',
    MISTRAL_API_KEY: 'second-server-key',
  }, {
    now: 100000,
    fetch: async () => {
      calls += 1;
      if (calls === 1) throw new Error('simulated timeout');
      return Response.json({ choices: [{ message: { content: 'Fallback answer.' } }] });
    },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { answer: 'Fallback answer.' });
  assert.equal(calls, 2);
});

test('falls through a rate-limited provider and returns only a generated answer', async () => {
  const calls = [];
  const response = await handleRequest(makeRequest('/chat', validBody, '198.51.100.8'), {
    ...env,
    GEMINI_API_KEY: 'server-only-test-key',
    MISTRAL_API_KEY: 'second-server-key',
  }, {
    now: 200000,
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      if (calls.length === 1) return new Response('{}', { status: 429 });
      return Response.json({ choices: [{ message: { content: 'The verified answer.' } }] });
    },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { answer: 'The verified answer.' });
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /generativelanguage\.googleapis\.com/);
  assert.equal(calls[0].init.headers['x-goog-api-key'], 'server-only-test-key');
  assert.equal(calls[1].init.headers.Authorization, 'Bearer second-server-key');
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
});

test('returns a graceful unavailable response when configured providers fail', async () => {
  const response = await handleRequest(makeRequest('/chat', validBody, '198.51.100.9'), {
    ...env,
    GEMINI_API_KEY: 'temporary-key',
  }, {
    now: 300000,
    fetch: async () => new Response('{}', { status: 503 }),
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'All AI providers are temporarily unavailable.' });
});

test('reports unconfigured state and enforces the per-isolate request cap', async () => {
  const health = await handleRequest(makeRequest('/health'), env, { now: 400000 });
  assert.deepEqual(await health.json(), { available: false });
  let last;
  for (let count = 0; count < 9; count += 1) {
    last = await handleRequest(makeRequest('/chat', validBody, '198.51.100.10'), env, { now: 500000 + count });
  }
  assert.equal(last.status, 429);
});

test('uses Gemini generateContent format and extracts its text response', async () => {
  let requestDetails;
  const response = await handleRequest(makeRequest('/chat', validBody, '198.51.100.12'), {
    ...env,
    GEMINI_API_KEY: 'gemini-server-secret',
  }, {
    now: 600000,
    fetch: async (url, init) => {
      requestDetails = { url: String(url), init, body: JSON.parse(init.body) };
      return Response.json({ candidates: [{ content: { parts: [{ text: 'Gemini answer.' }] } }] });
    },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { answer: 'Gemini answer.' });
  assert.match(requestDetails.url, /gemini-3\.5-flash-lite:generateContent$/);
  assert.equal(requestDetails.init.headers['x-goog-api-key'], 'gemini-server-secret');
  assert.equal(requestDetails.body.generationConfig.maxOutputTokens, 320);
});

test('attributes OpenRouter requests to the portfolio', async () => {
  let requestDetails;
  const response = await handleRequest(makeRequest('/chat', validBody, '198.51.100.13'), {
    ...env,
    OPENROUTER_API_KEY: 'openrouter-server-secret',
  }, {
    now: 700000,
    fetch: async (url, init) => {
      requestDetails = { url: String(url), init };
      return Response.json({ choices: [{ message: { content: 'OpenRouter answer.' } }] });
    },
  });
  assert.equal(response.status, 200);
  assert.match(requestDetails.url, /openrouter\.ai\/api\/v1\/chat\/completions$/);
  assert.equal(requestDetails.init.headers['HTTP-Referer'], 'https://ritik574-coder.github.io/RitikSky_Portfolio/');
  assert.equal(requestDetails.init.headers['X-Title'], 'Ritik Kumar Portfolio Assistant');
});

test('portfolio mode system prompt requires verified facts and forbids invented rankings', async () => {
  let prompt;
  const response = await handleRequest(makeRequest('/chat', {
    message: 'What is your main focus?',
    context: 'Primary career focus: Data Engineering.',
    mode: 'portfolio',
    history: [],
  }, '198.51.100.14'), {
    ...env,
    GEMINI_API_KEY: 'gemini-server-secret',
  }, {
    now: 800000,
    fetch: async (_url, init) => {
      prompt = JSON.parse(init.body).systemInstruction.parts[0].text;
      return Response.json({ candidates: [{ content: { parts: [{ text: 'My main focus is Data Engineering.' }] } }] });
    },
  });
  assert.equal(response.status, 200);
  assert.match(prompt, /Answer mode: portfolio/);
  assert.match(prompt, /Only state personal claims supported/);
  assert.match(prompt, /strongest.*do not invent a ranking/i);
  assert.doesNotMatch(prompt, /outside my portfolio scope/i);
});

test('general technical mode allows ordinary explanations without portfolio rejection', async () => {
  let prompt;
  const response = await handleRequest(makeRequest('/chat', {
    message: 'Tell me what is AI.',
    context: 'Answer mode: general_technical.',
    mode: 'general_technical',
    history: [],
  }, '198.51.100.15'), {
    ...env,
    GEMINI_API_KEY: 'gemini-server-secret',
  }, {
    now: 900000,
    fetch: async (_url, init) => {
      prompt = JSON.parse(init.body).systemInstruction.parts[0].text;
      return Response.json({ candidates: [{ content: { parts: [{ text: 'AI is the field of building systems that perform tasks that typically require human intelligence.' }] } }] });
    },
  });
  assert.equal(response.status, 200);
  assert.match(prompt, /Answer mode: general_technical/);
  assert.match(prompt, /Do not reject the question merely because it is not covered/);
  assert.doesNotMatch(prompt, /Only state personal claims supported/);
});

test('greeting mode keeps a short welcome prompt', async () => {
  let prompt;
  const response = await handleRequest(makeRequest('/chat', {
    message: 'Hi',
    context: 'Answer mode: greeting.',
    mode: 'greeting',
    history: [],
  }, '198.51.100.16'), {
    ...env,
    GEMINI_API_KEY: 'gemini-server-secret',
  }, {
    now: 1000000,
    fetch: async (_url, init) => {
      prompt = JSON.parse(init.body).systemInstruction.parts[0].text;
      return Response.json({ candidates: [{ content: { parts: [{ text: 'Hi! Ask me about my portfolio or a technical topic.' }] } }] });
    },
  });
  assert.equal(response.status, 200);
  assert.match(prompt, /Answer mode: greeting/);
  assert.match(prompt, /Do not dump a full biography/);
});

test('follow-up history is forwarded to the provider', async () => {
  let body;
  const response = await handleRequest(makeRequest('/chat', {
    message: 'How is that different from a data lake?',
    context: 'Answer mode: general_technical.',
    mode: 'general_technical',
    history: [
      { role: 'user', content: 'What is a data warehouse?' },
      { role: 'assistant', content: 'A curated analytical store.' },
    ],
  }, '198.51.100.17'), {
    ...env,
    GEMINI_API_KEY: 'gemini-server-secret',
  }, {
    now: 1100000,
    fetch: async (_url, init) => {
      body = JSON.parse(init.body);
      return Response.json({ candidates: [{ content: { parts: [{ text: 'A lake stores raw data more flexibly.' }] } }] });
    },
  });
  assert.equal(response.status, 200);
  assert.equal(body.contents.length, 3);
  assert.equal(body.contents[0].parts[0].text, 'What is a data warehouse?');
  assert.equal(body.contents[2].parts[0].text, 'How is that different from a data lake?');
});

test('missing credentials fail gracefully without claiming success', async () => {
  const response = await handleRequest(makeRequest('/chat', {
    message: 'What technologies do you use?',
    context: 'Listed technologies: Python.',
    mode: 'portfolio',
    history: [],
  }, '198.51.100.18'), env, { now: 1200000 });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'All AI providers are temporarily unavailable.' });
});
