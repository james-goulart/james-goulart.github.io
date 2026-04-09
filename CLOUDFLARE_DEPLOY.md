# Deploy Chat Backend to Cloudflare Workers

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

If the key is **project-scoped**, also run `npx wrangler secret put OPENAI_PROJECT_ID` and (if required) `OPENAI_ORG_ID` with the ids from [platform.openai.com](https://platform.openai.com). Missing project headers often produce HTTP 400 with an empty response body on `POST /chat/completions`.

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
