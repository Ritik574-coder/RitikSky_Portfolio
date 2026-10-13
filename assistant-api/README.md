# Portfolio Assistant API

This is an isolated Cloudflare Worker for the floating terminal. GitHub Pages remains the static frontend host. The Worker does not store conversations and keeps provider credentials in Cloudflare secrets.

## Providers

The router currently supports these free-access options, enabled only when their server secret exists:

- Gemini Developer API, `gemini-3.5-flash-lite`. Google's free tier has model-specific rate limits; free-tier prompts and responses may be used to improve Google products. Keep the Google project on its no-billing Free tier to avoid paid usage. See [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) and [model IDs](https://ai.google.dev/gemini-api/docs/models).
- Mistral Studio Free mode, `mistral-small-latest`. Mistral says Free mode is available without a credit card, with limited usage and rate limits. Keep the account in Free mode. See [Mistral Free mode setup](https://docs.mistral.ai/getting-started/quickstarts/studio/activate-and-generate-api-key).
- OpenRouter Free plan, `openrouter/free`. This selects a currently available free model; OpenRouter currently documents a 50 requests/day Free plan ceiling. Provider availability and the selected model can change. See [OpenRouter free models](https://openrouter.ai/openrouter/free) and [plan limits](https://openrouter.ai/pricing).

NVIDIA API Catalog access is trial/evaluation access and is not configured as a lasting free fallback. Groq's current production model documentation shows paid or sales-tier models; I could not verify a stable free inference allocation for this portfolio use, so the Worker does not assume one. Provider eligibility and quotas can change; the router never promises continuous service.

## Deploy

1. Install Wrangler and authenticate a Cloudflare account with Workers enabled.
2. From this directory, run `npx wrangler deploy`.
3. Add at least one eligible provider key as a Cloudflare secret. For example: `npx wrangler secret put GEMINI_API_KEY`. Supported names are `GEMINI_API_KEY`, `MISTRAL_API_KEY`, and `OPENROUTER_API_KEY`. Never put keys in `[vars]`, frontend `VITE_*` variables, or Git.
4. Set `ALLOWED_ORIGINS` in `wrangler.toml` to the exact deployed portfolio origins, comma-separated, with no paths or trailing slashes. The defaults cover the portfolio's GitHub Pages origin and Vite's local origin. CORS is not authentication.
5. Add the public Worker base URL as the GitHub Actions repository variable `VITE_ASSISTANT_API_URL` (for example `https://ritik-portfolio-assistant.<account>.workers.dev`) so the Pages build can call the Worker. This URL is public and is not a secret. Re-run the Pages workflow to publish the configured frontend.

The frontend reads `VITE_ASSISTANT_API_URL` at build time. If it is absent or the API has no configured keys, AI is shown as offline and terminal commands continue to work.

## Protections and limits

The Worker accepts only configured origins, validates the request shape and sizes, limits each Cloudflare client IP to 8 requests per five minutes per Worker isolate, returns at most 320 generated tokens, and times each provider call out after 9 seconds. It tries each eligible provider at most once per request. 429, 5xx, timeout, malformed-response, and authentication failures trigger provider cooldowns; no same-provider retry loop is used. The in-memory request limit and cooldown are best-effort per isolate, not a global quota. Cloudflare's account-level free Worker allowance currently includes 100,000 requests/day. See [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [limits](https://developers.cloudflare.com/workers/platform/limits/).

No chats are written to storage or logs by this code. Provider-side data handling remains governed by each provider's current terms and account settings.

## Local checks

Run the Worker unit tests with `node --test test/worker.test.mjs`. `npx wrangler dev` can run the API locally after adding secrets to a local `.dev.vars` file; that file must never be committed.
