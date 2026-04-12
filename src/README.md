# Source Layer

This directory is the intended future home for the portfolio implementation layer.

## Purpose

Over time, the current root-level implementation files should be consolidated conceptually under `/src`:

- `portfolio.js`
- `chat.js`
- `styles.css`

## Why this matters

Moving toward a source-oriented structure makes the repository easier to understand because it separates:

- runtime implementation
- structured content
- documentation
- static assets

## Current status

This Phase 3 pass is intentionally non-breaking, so the live site still uses the current root-level files.

This directory exists to make the target structure explicit and to reduce ambiguity for the next refactor.
