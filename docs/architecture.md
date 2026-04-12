# Portfolio Architecture

This document explains how the portfolio currently works, what its strengths are, and how the repository should evolve from a deployment-oriented static site into a cleaner flagship product repository.

## Current architecture

The current portfolio is a static site with a lightweight client-side rendering layer.

### Runtime model

- HTML entrypoints (`index.html`, `experience.html`, `cases.html`, `case.html`, `news.html`) provide page shells
- `data.js` contains the main content model for experiences, cases, and case narratives
- `portfolio.js` renders navigation, listing pages, case pages, and experience pages in the browser
- `chat.js` powers the portfolio copilot experience
- `styles.css` contains the shared design system and presentation layer

### Strengths of the current setup

- fast to iterate
- easy to deploy on GitHub Pages
- content-rich and self-contained
- supports a distinctive interactive portfolio layer through the copilot

### Main weaknesses

- content and rendering are too tightly coupled
- repository structure is optimized for deployment, not for reviewer comprehension
- the most important product signals are buried in implementation files
- case content is harder to inspect than it should be
- architecture is implied rather than documented

## Target architecture

The desired target state is a repository that is easier to understand at a glance and easier to evolve.

```text
/
  README.md
  index.html
  overview.html
  /src
    portfolio.js
    chat.js
    styles.css
  /content
    featured-cases.json
    proof-points.json
    featured-experiences.json
  /docs
    architecture.md
    content-model.md
    repo-organization.md
  /assets
    /diagrams
      portfolio-architecture.svg
```

## Why this structure is better

### 1. It separates concerns more clearly

A visitor to the repository should be able to distinguish quickly between:

- product content
- rendering logic
- styling
- documentation
- supporting assets

### 2. It improves hiring-manager readability

Top-level reviewers should not need to reverse-engineer the implementation to understand:

- what the product is
- what the portfolio is trying to signal
- where the case material lives
- how the copilot fits into the portfolio

### 3. It supports future public artifacts

As new repos and artifacts are added around AI evals, product memos, and demos, this portfolio repository should function as the flagship entrypoint rather than a single-page static bundle.

## Recommended migration order

### Phase A — non-breaking organization

- add docs that explain architecture and content model
- add structured content files for featured material
- add diagrams and repo organization notes
- keep current runtime unchanged

### Phase B — internal cleanup

- move rendering logic into `/src`
- mirror or gradually migrate content into `/content`
- reduce the amount of business-critical content embedded directly in `data.js`
- standardize naming conventions across files and routes

### Phase C — experience cleanup

- rework the homepage so the copilot becomes secondary to proof and featured cases
- unify site titles and positioning around Staff-level AI product leadership
- add screenshots and richer artifact framing in the repository root

## Guiding principle

The repository should feel like a flagship product artifact, not only a deployment package.
