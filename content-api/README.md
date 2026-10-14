# Portfolio content API

This is a separate Cloudflare Worker for the About section's Blog, Papers, Certificates, and Project Demos cards. It does not share code, routes, storage, or secrets with `assistant-api/`. GitHub Pages contains only the public API URL; the owner password hash and session credentials remain server-side.

## Setup and deploy

Run these commands from the repository root, substituting the D1 database ID returned by Wrangler in `wrangler.toml`:

```sh
cd content-api
npx wrangler d1 create ritik-portfolio-content
# Put the returned database ID in the database_id field in wrangler.toml.
npx wrangler d1 migrations apply ritik-portfolio-content --remote
node scripts/hash-owner-password.mjs
npx wrangler secret put OWNER_PASSWORD_HASH
npx wrangler deploy
```

The password hash helper prompts without echo. Use a unique password with at least 14 characters; copy only the `pbkdf2-sha256$...` value it prints, then paste that value into Wrangler's prompt. The Worker verifies it with PBKDF2-SHA-256 (210,000 iterations). Do not commit the generated hash or put the password/hash in `[vars]`, `.env`, or frontend variables.

After deploy, set the GitHub repository Actions variable `VITE_CONTENT_API_URL` to the Worker origin Wrangler assigned, for example `https://ritik-portfolio-content.<account>.workers.dev`:

```sh
gh variable set VITE_CONTENT_API_URL --body "https://ritik-portfolio-content.<account>.workers.dev"
```

Then rerun the Pages workflow. For local Vite use, put the same public URL in an ignored `.env.local` as `VITE_CONTENT_API_URL=...`. The production `ALLOWED_ORIGINS` is restricted to `https://ritik574-coder.github.io`; change it only when the site's actual origin changes.

The Worker needs the D1 binding named `DB`, `OWNER_PASSWORD_HASH` as a Cloudflare secret, and `ALLOWED_ORIGINS` as a Worker variable. Sessions are random 256-bit bearer tokens returned to the owner browser; only their SHA-256 hashes are stored in D1, they expire after 15 minutes, and logout revokes them. The browser keeps a token only in component memory, and every owner endpoint checks it server-side. Failed logins are throttled per Worker isolate. This is best-effort rate limiting and should not be treated as a global login quota.

## API behavior

- `GET /api/public/{blog|paper|certificate|demo}` returns published entries only.
- `POST /api/auth/login` accepts a password and returns a short-lived owner token.
- `GET /api/owner/entries` lists drafts and published entries and requires that token.
- `POST /api/owner/entries`, `PUT /api/owner/entries/{id}`, and `DELETE /api/owner/entries/{id}` require the token.
- `POST /api/auth/logout` revokes the current session.

Text is rendered as plain text by the site (no HTML injection or Markdown HTML). Optional image, paper, credential, and demo references are HTTPS URLs; files are linked, not uploaded or copied into this service. Published data uses a shared type/title/JSON payload/status/timestamp schema; demo categories are strings so new labels need no database migration.

## Local checks

```sh
node --test test/worker.test.mjs
node --check worker.mjs
```

The unit tests use an in-memory D1-compatible fixture. They do not verify Cloudflare deployment, the configured secret, GitHub Pages configuration, or a live browser session.
