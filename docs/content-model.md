# Content Model

This document explains the intended content model for the portfolio.

**Where it shows up today:** structured case bodies in [`cases-content.js`](../public/cases-content.js) and the main graph in [`data.js`](../public/data.js); [live cases](https://james-goulart.github.io/cases.html).

## Goal

The portfolio should make it easy to understand three layers of information:

1. positioning and proof
2. experience chapters
3. case studies

## Current state

At the moment, most content lives in `data.js` as a browser-global object.

This is workable for a static site, but it creates a few problems:

- content is harder to inspect in GitHub
- editorial changes look like code changes
- reviewers cannot easily find the most important proof first
- the content system is implicit rather than explicit

## Recommended logical entities

### 1. Proof points

A small set of short, scan-friendly statements that explain why the portfolio is worth reading.

Suggested fields:

- `title`
- `body`
- `theme`
- `linked_case_id`

### 2. Featured cases

A curated subset of the strongest cases for top-of-funnel reviewers.

Suggested fields:

- `id`
- `title`
- `summary`
- `why_it_matters`
- `url`

### 3. Experiences

The broader chronological portfolio content.

Suggested fields:

- `id`
- `company`
- `role`
- `location`
- `track`
- `tenure`
- `org_scope`
- `chapter_summary`
- `highlights`

### 4. Cases

The deepest content layer.

Suggested fields:

- `id`
- `experience_id`
- `name`
- `narrative`
- `long_narrative`
- `results`
- `related_news`
- `tags`

## Publishing model

The portfolio does not need a heavy CMS.

A better model is:

- keep the source of truth in structured JSON or Markdown files under `/content`
- let the rendering layer read those files or use a build step to generate a browser-friendly bundle
- keep long-form case writing separate from rendering code whenever possible

## Editorial hierarchy

The portfolio should prioritize information in this order:

### Level 1

- who James is
- what kind of roles he is targeting
- what proof exists

### Level 2

- featured cases
- strongest outcomes
- AI, search, and systems relevance

### Level 3

- full experience chronology
- full case narratives
- press and mentions

## Naming principle

The repository should treat content like product material, not just page filler.

That means:

- concise names
- stable IDs
- predictable structure
- clear distinction between editorial and rendering concerns
