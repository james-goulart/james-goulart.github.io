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
