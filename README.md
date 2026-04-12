# James Goulart — AI Product Leader

This repository powers my public portfolio site: **[james-goulart.github.io](https://james-goulart.github.io/)** (landing: [Overview](https://james-goulart.github.io/overview.html)).

It is designed to present the kind of work I want to keep doing next: high-leverage product leadership at the intersection of AI, search, marketplaces, retrieval, trust, and product systems.

## Positioning

I am a product leader with experience across proptech and fintech, with a particular focus on:

- AI-native product experiences
- search, recommendations, retrieval, and qualification
- marketplace design and operating-model redesign
- trust-sensitive user journeys
- financial and transactional product systems

My strongest work has usually sat in one of two places:

1. turning ambiguous structural problems into clear product direction
2. translating technical system behavior into measurable business outcomes

## What this portfolio highlights

### 1. AI, search, and retrieval

I led QuintoAndar's first serious LLM product: a conversational and multimodal search experience built on top of prior work in search qualification, geographic retrieval, and trust.  
**On the site:** [Conversational Search, Qualification, and Trust](https://james-goulart.github.io/case.html#quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision) · [Search, Qualification, and Quality](https://james-goulart.github.io/case.html#quintoandar-sr-head-of-product-search-recs-app-comms-ai-search-qualification-quality)

### 2. Marketplace and operating-model redesign

I led transformations in discovery, liquidity, and sales operations, including work that helped drive a 9x increase in signed contracts in the for-sale business.  
**On the site:** [From Marketplace Clone to Sales Engine](https://james-goulart.github.io/case.html#quintoandar-group-product-manager-forsale-marketplace-casa-mineira-integration-9x-forsale-growth) · [all cases](https://james-goulart.github.io/cases.html)

### 3. Financial product systems

I built and scaled financial add-ons on top of rental rails, improving unit economics through products that solved real cash-flow and flexibility problems.  
**On the site:** [Growing Profitability from the Installed Base](https://james-goulart.github.io/case.html#quintoandar-sr-product-manager-rental-financial-products-improving-rental-economics-through-desirable-finantial-add-ons) · [fintech cases (Nexoos)](https://james-goulart.github.io/cases.html?cat=Fintech)

## Signature proof points

- Built QuintoAndar's first LLM product in search, combining natural language, visual retrieval, and qualification logic — [case](https://james-goulart.github.io/case.html#quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision)
- Improved signed contracts through search evolutions, with especially strong leverage in the for-sale marketplace — [cases](https://james-goulart.github.io/cases.html)
- Helped drive 9x growth in for-sale signed contracts through operating-model and funnel redesign — [case](https://james-goulart.github.io/case.html#quintoandar-group-product-manager-forsale-marketplace-casa-mineira-integration-9x-forsale-growth)
- Built financial add-ons that improved rental profitability and reached meaningful adoption — [case](https://james-goulart.github.io/case.html#quintoandar-sr-product-manager-rental-financial-products-improving-rental-economics-through-desirable-finantial-add-ons)
- Redesigned lending and investment flows in fintech with large conversion and operational gains — [cases](https://james-goulart.github.io/cases.html?cat=Fintech)

## Featured cases

### [Conversational Search, Qualification, and Trust](https://james-goulart.github.io/case.html#quintoandar-sr-head-of-product-search-recs-app-comms-ai-agent-search-w-machine-vision)

Built QuintoAndar's first LLM product around conversational and multimodal property search while preserving qualification rules and trust.

### [Search, Qualification, and Quality](https://james-goulart.github.io/case.html#quintoandar-sr-head-of-product-search-recs-app-comms-ai-search-qualification-quality)

Redesigned discovery around better intent capture, geographic precision, and result trust across rental and for-sale marketplaces.

### [From Marketplace Clone to Sales Engine](https://james-goulart.github.io/case.html#quintoandar-group-product-manager-forsale-marketplace-casa-mineira-integration-9x-forsale-growth)

Helped transform QuintoAndar's for-sale business from a rental-shaped marketplace into a more effective sales engine.

## Repository structure

Deployed artifact is **`public/`** (GitHub Actions). Authoring also keeps root-level mirrors of key entrypoints for local use.

- [`overview.html`](https://james-goulart.github.io/overview.html) / [`public/overview.html`](public/overview.html): positioning landing (site home)
- [`copilot.html`](https://james-goulart.github.io/copilot.html) / [`public/copilot.html`](public/copilot.html): [portfolio copilot](https://james-goulart.github.io/copilot.html) UI
- [`index.html`](public/index.html): redirects to `overview.html`
- [`experience.html`](https://james-goulart.github.io/experience.html), [`cases.html`](https://james-goulart.github.io/cases.html), [`case.html`](https://james-goulart.github.io/case.html), [`news.html`](https://james-goulart.github.io/news.html): page shells
- [`data.js`](public/data.js): portfolio content model, experiences, and cases
- [`portfolio.js`](public/portfolio.js): rendering logic for navigation, listings, and case pages
- [`chat.js`](public/chat.js): copilot client
- [`styles.css`](public/styles.css): presentation layer
- [`docs/`](docs/): architecture, content model, and positioning notes

## Why the site has a copilot

Most portfolios are optimized for passive reading.

This one is also optimized for active exploration: a recruiter, hiring manager, or peer can ask direct questions about AI experience, leadership scope, case studies, or measurable outcomes — **[open the copilot](https://james-goulart.github.io/copilot.html)**.

The copilot is not the main proof. The underlying cases are — **[browse cases](https://james-goulart.github.io/cases.html)**.

## What I am optimizing for next

The next version of this portfolio should make the public signal sharper for Staff / Principal / Head-level AI Product roles by making three things more obvious, faster:

- technical product credibility
- AI-specific operating judgment
- proof of business and systems impact

## Live site

**[https://james-goulart.github.io/](https://james-goulart.github.io/)** — [Overview](https://james-goulart.github.io/overview.html) · [Copilot](https://james-goulart.github.io/copilot.html) · [Cases](https://james-goulart.github.io/cases.html) · [Experiences](https://james-goulart.github.io/experience.html) · [News](https://james-goulart.github.io/news.html)

## Local development

This is a lightweight static portfolio setup.

```bash
npm install
npm start
```

Then open **http://localhost:3000** (serves `public/`). Do not rely on `file://` for the copilot; it needs the dev server and `/api/chat`.

See **[CLOUDFLARE_DEPLOY.md](CLOUDFLARE_DEPLOY.md)** for the Workers chat backend used in production.

## In progress

Current priorities for the next phase:

- sharpen the homepage above-the-fold positioning
- demote the copilot from hero to supporting element (partially reflected on [Overview](https://james-goulart.github.io/overview.html))
- add a stronger GitHub profile README layer
- publish public artifacts that show AI product evaluation and systems thinking more directly
