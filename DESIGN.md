---
name: Agent4All Blog
description: An Agent Cloud-styled blog and CMS workspace.
colors:
  app-canvas: "#f7f7f4"
  background: "#ffffff"
  foreground: "#171717"
  secondary: "#efeee9"
  muted: "#f4f4f2"
  muted-foreground: "#5f6068"
  accent: "#f1f5f9"
  border: "#deded8"
  input: "#e7e5e4"
  ring: "#37598f"
  destructive: "#dc2626"
  selection: "#2563eb2e"
typography:
  ui:
    fontFamily: "Satoshi, Avenir Next, Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif"
    usage: "All public pages, CMS surfaces, headings, labels, controls, and body text"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
    usage: "Markdown editor, inline code, fenced code blocks"
rounded:
  sm: 10px
  md: 16px
  lg: 20px
  xl: 24px
  pill: 999px
---

# Design System: Agent4All Blog

## North Star

**Agent Cloud Surface.** The public blog and CMS now share the visual language of the Agent4All Agent Cloud web app: warm off-white canvas, white rounded panels, near-black actions, muted gray copy, restrained borders, and soft product shadows.

The site should feel like a sibling route inside the Agent Cloud product rather than a separate editorial publication.

## Source Of Truth

The target URL publicly exposes the Agent Cloud unauthenticated login page and its CSS tokens. Authenticated Agent Cloud workspace screens are not publicly available from the provided URL, so the CMS workspace adapts the visible login-page system plus the extracted product UI tokens.

## Color Rules

- The page canvas is `#f7f7f4` with subtle blue/slate radial glow.
- Primary text and primary actions use near-black `#171717`.
- Primary buttons are black with white text.
- Surfaces are white; secondary sidebars and panels use `#efeee9` or `#f4f4f2`.
- Blue is limited to focus, selection, and ambient glow.
- Destructive actions use `#dc2626`.
- Avoid teal, editorial serif color identity, gradient text, decorative stripes, and glassmorphism.

## Typography

- Use one product sans stack everywhere.
- Public article text remains readable at a slightly larger body size, but it is still sans.
- Headings are compact and bold, with letter spacing no tighter than `-0.04em`.
- Product UI labels and metadata stay between `0.75rem` and `0.875rem`.
- Long-form content keeps a 65-75ch measure.

## Layout

- Home uses the target two-panel login-page composition on desktop and a single direct panel on mobile.
- Blog index uses a rounded workspace panel with search controls and list rows.
- Article pages use a rounded document panel and a muted table-of-contents side panel when headings exist.
- CMS auth uses the target two-panel login layout.
- CMS editor uses a sidebar plus main editor panel.
- CMS media uses a rounded library panel and repeated asset cards.

## Components

- Agent marks are black rounded squares with white/inverted mark content.
- Inputs and buttons use 14-16px radius.
- Panels use 16-24px radius and thin borders.
- Buttons, inputs, nav tabs, post rows, media cards, messages, and empty states share one component vocabulary across public and CMS routes.
- Active rows use a full outline and subtle blue selection background, never a side stripe.

## Motion

Motion is limited to hover, focus, and active feedback around 150-200ms. Page-load choreography is not part of the system. `prefers-reduced-motion` disables transitions.

## Implementation

The shared production stylesheet is `public/theme.css`. Static Astro pages and Cloudflare Pages Functions all link to it directly so `/`, `/blog`, `/blog/:slug`, `/admin`, and `/admin/media` remain visually aligned.
