# Deploy Chat Backend to Cloudflare Workers

The [portfolio copilot](https://james-goulart.github.io/copilot.html) on GitHub Pages calls this Worker for `/api/chat`. The static UI is still served from [GitHub Pages](https://james-goulart.github.io/); the Worker bundles `public/` for previews and hosts the chat API.

## 1) One-time setup

```bash
npm install
npm run worker:dev
```

In another terminal:

```bash
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
```

Paste the key **once** when prompted (no quotes, no spaces before/after). The value must be plain ASCII and start with **`sk-`**. If you see `INVALID_API_KEY_FORMAT` or `firstCharCode` is not `115` (`s`), delete and recreate the secret — the stored value was corrupted (wrong paste, binary, or not the API key).

- **If your key starts with `sk-proj-`**, it is already tied to one project. **Do not** set `OPENAI_PROJECT_ID` unless you also need a different project — a mismatched `OpenAI-Project` header can cause empty HTTP 400 responses. The Worker **skips** `OpenAI-Project` for `sk-proj-` keys by default.
- **If your key starts with `sk-` (not `sk-proj-`)** and the dashboard requires a project, set `OPENAI_PROJECT_ID` (and `OPENAI_ORG_ID` if required).
- To **force** sending `OpenAI-Project` even for `sk-proj-` keys, set Worker var `OPENAI_FORCE_PROJECT_HEADER` = `1`.

## 2) Deploy

```bash
npm run worker:deploy
```

After deploy, your site is available on the Worker URL and serves:
- Static frontend from `public/`
- Chat backend at `/api/chat`

## 3) Optional GitHub auto-deploy

Add these repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Then use the workflow file in `.github/workflows/deploy-worker.yml`.

## 4) Debugging OpenAI / 400 errors

1. **Live logs** — In a terminal (logged in with Wrangler), run:
   ```bash
   npx wrangler tail james-portfolio-chat
   ```
   Send a chat message; failed OpenAI calls log `firstError` / `lastError` snippets and metadata.

2. **Verbose JSON in the browser** — In the Cloudflare dashboard → Worker → Settings → Variables, add variable `CHAT_DEBUG` = `1` (or `true`), save, redeploy. The next `/api/chat` error response includes a `debug` object with raw error snippets. Remove when done.

3. **Header-based debug** — Set Worker secret `CHAT_DEBUG_SECRET` to a random string, then send header `X-Chat-Debug: <same string>` on POST `/api/chat` (e.g. curl or DevTools “Edit and resend”) to get the same `debug` payload without turning on global `CHAT_DEBUG`.
