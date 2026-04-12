# Source Layer

This directory is the intended future home for the portfolio implementation layer.

**Live site (current implementation):** [Overview](https://james-goulart.github.io/overview.html) · [Copilot](https://james-goulart.github.io/copilot.html) — source of truth for deployment is still [`public/`](../public/) today (see [README](../README.md)).

## Purpose

Over time, the current root-level implementation files should be consolidated conceptually under `/src`:

- [`portfolio.js`](../public/portfolio.js) (today: [`../portfolio.js`](../portfolio.js) mirror)
- [`chat.js`](../public/chat.js) (today: [`../chat.js`](../chat.js) mirror)
- [`styles.css`](../public/styles.css) (today: [`../styles.css`](../styles.css) mirror)

## Why this matters

Moving toward a source-oriented structure makes the repository easier to understand because it separates:

- runtime implementation
- structured content
- documentation
- static assets

## Current status

This Phase 3 pass is intentionally non-breaking, so the live site still uses the current root-level and `public/` files.

This directory exists to make the target structure explicit and to reduce ambiguity for the next refactor.
