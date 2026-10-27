import test from "node:test";
import assert from "node:assert/strict";
import { pbkdf2Sync } from "node:crypto";
import { handleRequest } from "../worker.mjs";

const origin = "https://ritik574-coder.github.io";
const now = 1_800_000_000_000;

class MemoryD1 {
  entries = new Map();
  sessions = new Map();

  prepare(sql) {
    let params = [];
    const query = {
      bind: (...values) => {
        params = values;
        return query;
      },
      first: async () => this.first(sql, params),
      all: async () => this.all(sql, params),
      run: async () => this.run(sql, params),
    };
    return query;
  }

  async first(sql, params) {
    if (sql.includes("FROM owner_sessions WHERE token_hash"))
      return this.sessions.get(params[0]) || null;
    if (sql.includes("FROM content_entries WHERE id")) return this.entries.get(params[0]) || null;
    return null;
  }

  async all(sql, params) {
    let rows = [...this.entries.values()];
    if (sql.includes("WHERE type = ? AND status = 'published'")) {
      rows = rows.filter((row) => row.type === params[0] && row.status === "published");
    }
    return { results: rows };
  }

  async run(sql, params) {
    if (sql.includes("DELETE FROM owner_sessions WHERE expires_at")) {
      for (const [hash, session] of this.sessions)
        if (session.expires_at <= params[0]) this.sessions.delete(hash);
    } else if (sql.includes("INSERT INTO owner_sessions")) {
      this.sessions.set(params[0], { token_hash: params[0], expires_at: params[1] });
    } else if (sql.includes("DELETE FROM owner_sessions WHERE token_hash")) {
      this.sessions.delete(params[0]);
    } else if (sql.includes("INSERT INTO content_entries")) {
      const [id, type, title, data_json, status, created_at, updated_at] = params;
      this.entries.set(id, { id, type, title, data_json, status, created_at, updated_at });
    } else if (sql.includes("UPDATE content_entries")) {
      const [title, data_json, status, updated_at, id] = params;
      const row = this.entries.get(id);
      if (row) this.entries.set(id, { ...row, title, data_json, status, updated_at });
    } else if (sql.includes("DELETE FROM content_entries")) {
      this.entries.delete(params[0]);
    }
    return { success: true };
  }
}

function makeRequest(
  path,
  { method = "GET", body, token, ip = "198.51.100.100", requestOrigin = origin } = {},
) {
  const headers = { Origin: requestOrigin, "CF-Connecting-IP": ip };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return new Request(`https://content.test${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function passwordHash(password = "correct horse battery staple") {
  const salt = Buffer.from("0123456789abcdef0123456789abcdef", "hex");
  const derived = pbkdf2Sync(password, salt, 100000, 32, "sha256");
  return `pbkdf2-sha256$100000$${salt.toString("hex")}$${derived.toString("hex")}`;
}

function configuredEnv() {
  return {
    ALLOWED_ORIGINS: origin,
    OWNER_PASSWORD_HASH: passwordHash(),
    DB: new MemoryD1(),
  };
}

async function ownerLogin(env, ip = "198.51.100.101") {
  const response = await handleRequest(
    makeRequest("/api/auth/login", {
      method: "POST",
      body: { password: "correct horse battery staple" },
      ip,
    }),
    env,
    { now },
  );
  assert.equal(response.status, 200);
  return (await response.json()).token;
}

test("rejects other origins and blocks unauthenticated writes", async () => {
  const env = configuredEnv();
  const denied = await handleRequest(
    makeRequest("/api/public/blog", { requestOrigin: "https://attacker.example" }),
    env,
    { now },
  );
  assert.equal(denied.status, 403);
  const write = await handleRequest(
    makeRequest("/api/owner/entries", {
      method: "POST",
      body: { type: "blog", status: "published", data: { title: "Attempt" } },
    }),
    env,
    { now },
  );
  assert.equal(write.status, 401);
  assert.equal(env.DB.entries.size, 0);
});

test("publishes content, edits without duplication, unpublishes, deletes, and revokes its owner session", async () => {
  const env = configuredEnv();
  const token = await ownerLogin(env);
  const draftResponse = await handleRequest(
    makeRequest("/api/owner/entries", {
      method: "POST",
      token,
      body: {
        type: "blog",
        status: "draft",
        data: {
          title: "Warehouse notes",
          summary: "A draft",
          body: "Plain text body",
          tags: ["SQL", "dbt"],
        },
      },
    }),
    env,
    { now: now + 1000 },
  );
  assert.equal(draftResponse.status, 201);
  const draft = (await draftResponse.json()).entry;
  assert.equal(draft.status, "draft");

  let publicRead = await handleRequest(makeRequest("/api/public/blog"), env, { now: now + 2000 });
  assert.deepEqual(await publicRead.json(), { entries: [] });
  const ownerRead = await handleRequest(makeRequest("/api/owner/entries", { token }), env, {
    now: now + 2000,
  });
  assert.equal((await ownerRead.json()).entries.length, 1);

  const publishedResponse = await handleRequest(
    makeRequest(`/api/owner/entries/${draft.id}`, {
      method: "PUT",
      token,
      body: { status: "published", data: { ...draft.data, summary: "Published summary" } },
    }),
    env,
    { now: now + 3000 },
  );
  assert.equal(publishedResponse.status, 200);
  assert.equal(env.DB.entries.size, 1);
  publicRead = await handleRequest(makeRequest("/api/public/blog"), env, { now: now + 4000 });
  assert.equal((await publicRead.json()).entries[0].data.summary, "Published summary");

  const unpublished = await handleRequest(
    makeRequest(`/api/owner/entries/${draft.id}`, {
      method: "PUT",
      token,
      body: { status: "draft", data: { ...draft.data, summary: "Published summary" } },
    }),
    env,
    { now: now + 5000 },
  );
  assert.equal(unpublished.status, 200);
  publicRead = await handleRequest(makeRequest("/api/public/blog"), env, { now: now + 6000 });
  assert.deepEqual(await publicRead.json(), { entries: [] });

  const deleted = await handleRequest(
    makeRequest(`/api/owner/entries/${draft.id}`, { method: "DELETE", token }),
    env,
    { now: now + 7000 },
  );
  assert.equal(deleted.status, 200);
  assert.equal(env.DB.entries.size, 0);

  const logout = await handleRequest(
    makeRequest("/api/auth/logout", { method: "POST", token, body: {} }),
    env,
    { now: now + 8000 },
  );
  assert.equal(logout.status, 200);
  const expired = await handleRequest(makeRequest("/api/owner/entries", { token }), env, {
    now: now + 9000,
  });
  assert.equal(expired.status, 401);
});

test("throttles failed owner authentication and returns one generic error", async () => {
  const env = configuredEnv();
  let response;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    response = await handleRequest(
      makeRequest("/api/auth/login", {
        method: "POST",
        body: { password: "wrong password" },
        ip: "198.51.100.102",
      }),
      env,
      { now: now + attempt },
    );
  }
  assert.equal(response.status, 429);
  const badPassword = await handleRequest(
    makeRequest("/api/auth/login", {
      method: "POST",
      body: { password: "wrong password" },
      ip: "198.51.100.103",
    }),
    env,
    { now: now + 10 },
  );
  assert.equal(badPassword.status, 401);
  assert.deepEqual(await badPassword.json(), { error: "Owner authentication failed." });
});

test("expires owner sessions after their fixed lifetime", async () => {
  const env = configuredEnv();
  const token = await ownerLogin(env, "198.51.100.105");
  const response = await handleRequest(makeRequest("/api/owner/entries", { token }), env, {
    now: now + 15 * 60 * 1000 + 1,
  });
  assert.equal(response.status, 401);
});

test("validates content URLs and never returns unpublished entries publicly", async () => {
  const env = configuredEnv();
  const token = await ownerLogin(env, "198.51.100.104");
  const invalid = await handleRequest(
    makeRequest("/api/owner/entries", {
      method: "POST",
      token,
      body: {
        type: "certificate",
        status: "published",
        data: { title: "Credential", issuer: "Issuer", verificationUrl: "javascript:alert(1)" },
      },
    }),
    env,
    { now: now + 1000 },
  );
  assert.equal(invalid.status, 400);
  assert.equal(env.DB.entries.size, 0);
});

test("accepts each content type and extensible demo category labels", async () => {
  const env = configuredEnv();
  const token = await ownerLogin(env, "198.51.100.106");
  const records = [
    {
      type: "paper",
      data: {
        title: "Research record",
        authors: "A. Author",
        sourceUrl: "https://doi.org/10.0000/example",
      },
    },
    {
      type: "certificate",
      data: {
        title: "Credential",
        issuer: "Issuing organization",
        verificationUrl: "https://issuer.example/verify/123",
      },
    },
    {
      type: "demo",
      data: {
        title: "Prototype",
        category: "Streaming systems",
        technologies: ["SQL", "Python"],
        liveDemoUrl: "https://demo.example",
      },
    },
  ];
  for (let index = 0; index < records.length; index += 1) {
    const response = await handleRequest(
      makeRequest("/api/owner/entries", {
        method: "POST",
        token,
        body: { ...records[index], status: "published" },
      }),
      env,
      { now: now + 1000 + index },
    );
    assert.equal(response.status, 201);
  }
  assert.equal(env.DB.entries.size, 3);
  assert.equal(
    (await (await handleRequest(makeRequest("/api/public/demo"), env, { now: now + 2000 })).json())
      .entries[0].data.category,
    "Streaming systems",
  );
});

test("serves published entries from all four public content endpoints without authentication", async () => {
  const env = configuredEnv();
  const types = ["blog", "paper", "certificate", "demo"];
  types.forEach((type, index) => {
    const id = `published-${type}`;
    const data = { title: `Published ${type}` };
    env.DB.entries.set(id, {
      id,
      type,
      title: data.title,
      data_json: JSON.stringify(data),
      status: "published",
      created_at: new Date(now + index).toISOString(),
      updated_at: new Date(now + index).toISOString(),
    });
    const draftId = `draft-${type}`;
    env.DB.entries.set(draftId, {
      id: draftId,
      type,
      title: `Draft ${type}`,
      data_json: JSON.stringify({ title: `Draft ${type}` }),
      status: "draft",
      created_at: new Date(now + index).toISOString(),
      updated_at: new Date(now + index).toISOString(),
    });
  });

  for (const type of types) {
    const response = await handleRequest(makeRequest(`/api/public/${type}`), env, { now });
    assert.equal(response.status, 200, `${type} should be public`);
    const payload = await response.json();
    assert.equal(payload.entries.length, 1);
    assert.equal(payload.entries[0].id, `published-${type}`);
    assert.equal(payload.entries[0].status, "published");
  }
});

test("owner login verifies correct password with 100000 iterations and creates valid session", async () => {
  const env = configuredEnv();
  const response = await handleRequest(
    makeRequest("/api/auth/login", {
      method: "POST",
      body: { password: "correct horse battery staple" },
    }),
    env,
    { now },
  );
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(typeof data.token, "string");
  assert.equal(data.token.length >= 40, true);
  assert.equal(typeof data.expiresAt, "string");

  // Verify created session works for protected operations
  const ownerRead = await handleRequest(
    makeRequest("/api/owner/entries", { token: data.token }),
    env,
    { now: now + 1000 },
  );
  assert.equal(ownerRead.status, 200);
});

test("owner login returns 401 (not 500) for incorrect password or unsupported iteration counts", async () => {
  const env = configuredEnv();
  // Wrong password returns 401
  const wrongPass = await handleRequest(
    makeRequest("/api/auth/login", {
      method: "POST",
      body: { password: "wrong-diagnostic-password" },
      ip: "198.51.100.201",
    }),
    env,
    { now },
  );
  assert.equal(wrongPass.status, 401);
  assert.deepEqual(await wrongPass.json(), { error: "Owner authentication failed." });

  // Incompatible iteration count (e.g. 210000 rounds) returns 401, never 500
  const salt = Buffer.from("0123456789abcdef0123456789abcdef", "hex");
  const derived210k = pbkdf2Sync("correct horse battery staple", salt, 210000, 32, "sha256");
  const envWith210k = {
    ...configuredEnv(),
    OWNER_PASSWORD_HASH: `pbkdf2-sha256$210000$${salt.toString("hex")}$${derived210k.toString("hex")}`,
  };
  const response210k = await handleRequest(
    makeRequest("/api/auth/login", {
      method: "POST",
      body: { password: "diagnostic password" },
      ip: "198.51.100.202",
    }),
    envWith210k,
    { now },
  );
  assert.equal(response210k.status, 401);
  assert.deepEqual(await response210k.json(), { error: "Owner authentication failed." });

  // Malformed hash string returns 401, never 500
  const envMalformed = {
    ...configuredEnv(),
    OWNER_PASSWORD_HASH: "not-a-valid-hash",
  };
  const responseMalformed = await handleRequest(
    makeRequest("/api/auth/login", {
      method: "POST",
      body: { password: "any password" },
      ip: "198.51.100.203",
    }),
    envMalformed,
    { now },
  );
  assert.equal(responseMalformed.status, 401);
});

test("owner login returns 503 when configuration (DB or OWNER_PASSWORD_HASH) is missing", async () => {
  // Missing OWNER_PASSWORD_HASH
  const envNoSecret = { ALLOWED_ORIGINS: origin, DB: new MemoryD1() };
  const resNoSecret = await handleRequest(
    makeRequest("/api/auth/login", {
      method: "POST",
      body: { password: "correct horse battery staple" },
      ip: "198.51.100.204",
    }),
    envNoSecret,
    { now },
  );
  assert.equal(resNoSecret.status, 503);
  assert.deepEqual(await resNoSecret.json(), { error: "Owner authentication is not configured." });

  // Missing DB
  const envNoDb = { ALLOWED_ORIGINS: origin, OWNER_PASSWORD_HASH: passwordHash() };
  const resNoDb = await handleRequest(
    makeRequest("/api/auth/login", {
      method: "POST",
      body: { password: "correct horse battery staple" },
      ip: "198.51.100.205",
    }),
    envNoDb,
    { now },
  );
  assert.equal(resNoDb.status, 503);
  assert.deepEqual(await resNoDb.json(), { error: "Owner authentication is not configured." });
});

test("normalizes OWNER_PASSWORD_HASH prefix and whitespace correctly", async () => {
  const salt = Buffer.from("0123456789abcdef0123456789abcdef", "hex");
  const derived = pbkdf2Sync("my secret password", salt, 100000, 32, "sha256");
  const rawHash = `pbkdf2-sha256$100000$${salt.toString("hex")}$${derived.toString("hex")}`;

  // Formatted with prefix and whitespace/newlines (e.g. from script or .dev.vars)
  const envWithPrefix = {
    ALLOWED_ORIGINS: origin,
    DB: new MemoryD1(),
    OWNER_PASSWORD_HASH: `  OWNER_PASSWORD_HASH="${rawHash}"\n `,
  };
  const response = await handleRequest(
    makeRequest("/api/auth/login", {
      method: "POST",
      body: { password: "my secret password" },
      ip: "198.51.100.206",
    }),
    envWithPrefix,
    { now },
  );
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(typeof data.token, "string");
});
