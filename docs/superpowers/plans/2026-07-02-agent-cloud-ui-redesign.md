# Agent Cloud UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Restyle every public blog and CMS surface to match the visible Agent4All Agent Cloud app style.

**Architecture:** Keep the existing Astro pages and Cloudflare Pages Functions, but replace the shared visual system in `public/theme.css` and update markup classes where the old editorial/CMS vocabulary does not express the Agent Cloud layout. Preserve all JavaScript selectors and API behavior. Tests assert the new rendered shell class names so the public route HTML cannot regress to the old journal/rail style.

**Tech Stack:** Astro 6, Cloudflare Pages Functions, TypeScript, Vitest, shared static CSS in `public/theme.css`.

---

### Task 1: Public Route Contract Tests

**Files:**
- Modify: `tests/pages/blog-render.test.ts`

- [x] **Step 1: Write failing tests for the Agent Cloud public shell**

Replace the old journal/rail class expectations with Agent Cloud shell expectations:

```ts
expect(html).toContain('class="agent-page blog-page"');
expect(html).toContain('class="workspace-panel blog-index-panel"');
expect(html).toContain('class="agent-list"');
expect(html).toContain('class="agent-list-item"');
expect(html).toContain('class="agent-open-link"');

expect(html).toContain('class="agent-page article-page"');
expect(html).toContain('class="article-shell"');
expect(html).toContain('class="article-toc-panel"');
expect(html).toContain('class="agent-mark author-mark"');
```

- [x] **Step 2: Run test to verify RED**

Run:

```bash
npm test -- tests/pages/blog-render.test.ts
```

Expected: fails because the current implementation still renders `journal-list` and `reading-rail`.

### Task 2: Shared Agent Cloud Theme

**Files:**
- Modify: `public/theme.css`

- [x] **Step 1: Replace design tokens**

Rewrite `:root` with Agent Cloud tokens:

```css
--font-ui: Satoshi, "Avenir Next", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
--color-app-canvas: #f7f7f4;
--color-background: #fff;
--color-foreground: #171717;
--color-muted: #f4f4f2;
--color-muted-foreground: #5f6068;
--color-secondary: #efeee9;
--color-border: #deded8;
--color-input: #e7e5e4;
--color-primary: #171717;
--color-primary-foreground: #fff;
--color-selection: #2563eb2e;
--radius: 1rem;
```

- [x] **Step 2: Replace global shell and component CSS**

Implement shared classes for:

```css
.agent-page
.agent-frame
.agent-panel
.agent-mark
.agent-controls
.agent-icon-button
.topbar
.cms-nav
.workspace
.sidebar
.editor
.media-page
.button
.btn-primary
.btn-secondary
.btn-danger
.btn-text
input
textarea
select
.message
.empty-state
```

- [x] **Step 3: Preserve responsive and accessibility behavior**

Keep `:focus-visible`, `@media (max-width: ...)`, `@media (pointer: coarse)`, and `@media (prefers-reduced-motion: reduce)` coverage. Ensure mobile layouts collapse structurally.

### Task 3: Public Home Page Markup

**Files:**
- Modify: `src/pages/index.astro`

- [x] **Step 1: Replace the old home hero**

Render an Agent Cloud two-panel page:

```html
<div class="agent-page home-page">
  <div class="agent-controls" aria-hidden="true">...</div>
  <main class="agent-frame home-frame">
    <section class="agent-panel home-intro-panel">...</section>
    <section class="agent-panel home-action-panel">...</section>
  </main>
</div>
```

- [x] **Step 2: Preserve navigation targets**

Keep links to `/blog` and `/admin`; do not add non-working theme or language behavior.

### Task 4: Public Blog Function Markup

**Files:**
- Modify: `functions/blog/index.ts`
- Modify: `functions/blog/[slug].ts`

- [x] **Step 1: Update blog index shell**

Replace journal classes with Agent Cloud classes:

```html
<div class="agent-page blog-page">
<header class="site-header agent-topbar">
<main class="agent-frame blog-frame">
<section class="workspace-panel blog-index-panel">
<div class="agent-list">
<article class="agent-list-item">
<a class="agent-open-link">
```

- [x] **Step 2: Update article shell**

Replace reading rail classes with:

```html
<div class="agent-page article-page">
<main class="agent-frame article-frame">
<aside class="article-toc-panel">
<article class="agent-panel article-shell">
<span class="agent-mark author-mark">
```

- [x] **Step 3: Run public route tests to verify GREEN**

Run:

```bash
npm test -- tests/pages/blog-render.test.ts
```

Expected: passes.

### Task 5: CMS Markup and Runtime Template Classes

**Files:**
- Modify: `src/pages/admin.astro`
- Modify: `src/pages/admin/media.astro`

- [x] **Step 1: Update admin auth markup**

Use the target two-panel auth layout:

```html
<section id="authPanel" class="auth-page">
  <div class="agent-panel auth-intro-panel">...</div>
  <form id="authForm" class="agent-panel auth-form">...</form>
</section>
```

- [x] **Step 2: Update admin workspace shell**

Keep existing element IDs and JavaScript selectors while changing layout classes:

```html
<div id="workspace" class="workspace admin-workspace" hidden>
<aside class="sidebar posts-sidebar">
<form id="editor" class="editor editor-panel">
```

- [x] **Step 3: Update media workspace shell**

Use the same shell vocabulary:

```html
<div id="media-workspace" class="media-page media-workspace" hidden>
<div class="workspace-panel media-library-panel">
```

- [x] **Step 4: Remove inline styles from media reference buttons where practical**

Move button sizing into CSS classes while preserving `data-id` and `data-key` attributes.

### Task 6: Documentation and Full Verification

**Files:**
- Modify: `DESIGN.md`

- [x] **Step 1: Update design documentation**

Replace the old Linear Journal / teal design system with Agent Cloud token and layout documentation.

- [x] **Step 2: Run full automated verification**

Run:

```bash
npm run build
npm run typecheck
npm test
```

Expected: all pass.

- [x] **Step 3: Run local visual verification**

Start a local server and capture screenshots for:

```text
/
/blog
/admin
/admin/media
```

If local data is available, also capture a `/blog/:slug` page.

- [x] **Step 4: Final git review and commit**

Run:

```bash
git status --short
git diff --stat
```

Commit the implementation with:

```bash
git add public/theme.css src/pages/index.astro src/pages/admin.astro src/pages/admin/media.astro functions/blog/index.ts functions/blog/[slug].ts tests/pages/blog-render.test.ts DESIGN.md docs/superpowers/plans/2026-07-02-agent-cloud-ui-redesign.md
git commit -m "feat: restyle site as agent cloud"
```
