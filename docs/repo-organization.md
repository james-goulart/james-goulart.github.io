# Repo Organization

This document describes the purpose of the new directories added in the Phase 3 organization pass.

**Live portfolio:** [Overview (site home)](https://james-goulart.github.io/overview.html) · [Repository root](../README.md)

## Objective

Make the repository easier to understand for:

- hiring managers
- recruiters
- engineers evaluating product-technical fluency
- James himself, when extending the portfolio

## Added layers

### `/docs`

Repository-level documentation.

This is where architecture, content model, migration notes, and positioning rationale should live.

### `/content`

Structured editorial content.

This layer should gradually become the readable home for:

- featured proof points
- featured cases
- curated experience summaries
- possibly later, case study Markdown files

### `/assets/diagrams`

Visual explanation assets.

This is the right place for:

- architecture diagrams
- system maps
- future screenshots or visual walkthroughs

## What this organization pass does not do

This pass is intentionally non-breaking.

It does **not**:

- move the existing runtime files
- change current site routing
- rewire the live pages to consume the new `/content` layer yet
- refactor the current rendering architecture

## Why this is still useful

A non-breaking organization pass creates immediate value:

- reviewers can understand the repository faster
- future refactors become safer
- architecture and intent are no longer hidden
- the repo starts to look like a flagship artifact rather than only a static site bundle

## Next likely repo-level changes

1. mirror key content into `/content`
2. move implementation files into `/src`
3. make [`/overview.html`](https://james-goulart.github.io/overview.html) the stronger first stop for applications (done for the live site; root `index.html` redirects there)
4. add diagrams and screenshots to support repository scanning
