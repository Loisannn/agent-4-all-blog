---
name: Agent4All Blog
description: A linear product-blog reading system with a precise CMS workspace.
colors:
  bg: oklch(0.992 0.002 205)
  canvas: oklch(1.000 0.000 0)
  surface: oklch(0.972 0.004 205)
  surface-strong: oklch(0.935 0.007 205)
  ink: oklch(0.145 0.025 235)
  ink-soft: oklch(0.320 0.025 235)
  muted: oklch(0.420 0.022 235)
  border: oklch(0.860 0.012 225)
  border-strong: oklch(0.720 0.026 220)
  primary: oklch(0.335 0.075 195)
  primary-hover: oklch(0.270 0.075 195)
  primary-soft: oklch(0.940 0.028 195)
  accent: oklch(0.580 0.180 31)
  accent-soft: oklch(0.965 0.032 31)
  success: oklch(0.430 0.130 157)
  success-soft: oklch(0.955 0.032 157)
  danger: oklch(0.480 0.180 25)
  danger-soft: oklch(0.955 0.026 25)
  code-bg: oklch(0.180 0.023 235)
  code-ink: oklch(0.965 0.004 235)
typography:
  editorial:
    fontFamily: "Iowan Old Style, Palatino Linotype, Palatino, Georgia, ui-serif, serif"
    usage: "Public page wordmark, blog title, article title, post titles, article headings"
  ui:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    usage: "CMS, nav, forms, body, metadata"
  code:
    fontFamily: "SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace"
    usage: "Markdown editor, inline code, fenced code blocks"
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  4xl: 64px
---

# Design System: Agent4All Blog

## North Star

**Linear Journal.** The public surface reads like a product blog for builders: a strong editorial title, a top-to-bottom sequence of posts, and focused article pages with a quiet reading rail. The CMS remains a dense product workspace for drafting and publishing.

The system is shared, but the surfaces have different jobs:

- Reader pages use editorial serif headings, generous vertical rhythm, and a mallard-teal identity.
- Admin pages use compact sans UI, predictable controls, and the same mallard-teal only for primary actions, selection, and focus.
- Vermilion appears rarely for warnings, destructive states, or category emphasis. It never decorates.

## Color Rules

- Backgrounds stay cold white/graphite, not cream, sand, or warm paper.
- Mallard teal owns the reader identity and product selection states.
- Vermilion is a rare accent and semantic danger/warning neighbor.
- Every text color must meet WCAG AA contrast.
- Do not use gradient text, purple-blue gradients, glassmorphism, decorative orbs, or card side stripes.

## Typography

- Public titles and article headings use the editorial serif stack.
- CMS, navigation, forms, metadata, and body copy use the UI sans stack.
- Product UI type is fixed and compact. Reader headlines can use bounded `clamp()` sizing.
- Body measure stays around 65-75ch for long-form reading.
- Letter spacing on display type must not go tighter than `-0.04em`.

## Layout

- Public browsing is linear downward reading, not a dashboard grid.
- Blog entries are rows in a chronological journal: date/meta, title/excerpt, action.
- Article pages use a reading rail on desktop and collapse into a single column on mobile.
- Admin uses a two-pane product layout: post list/sidebar plus editor, collapsing structurally on smaller screens.
- Cards are reserved for real bounded tools and empty states. No nested cards.

## Components

- Buttons: 4px radius, full 44px touch target, teal primary, border default, vermilion danger.
- Inputs: white canvas, strong border, visible focus ring, readable placeholders.
- Post rows: selected state uses a soft teal surface and full border, not a side stripe.
- Empty states: explain what is empty and give the next action.
- Messages: success and error use semantic color plus text, never color alone.

## Motion

Motion is limited to state feedback: hover, focus, pressed, and responsive transitions. Transitions run around 160ms with an ease-out curve. `prefers-reduced-motion` disables motion.

## Implementation

The shared production stylesheet lives at `public/theme.css`. Static Astro pages and Cloudflare Pages Functions link to it directly, so design tokens stay aligned across `/`, `/blog`, `/blog/:slug`, and `/admin`.
