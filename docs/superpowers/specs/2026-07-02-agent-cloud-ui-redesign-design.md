# Agent Cloud UI Redesign Design

Date: 2026-07-02

## Goal

Transform every visible surface in this blog CMS into the visual language of the referenced Agent4All Agent Cloud web app:

- Public home page at `/`.
- Public blog index at `/blog`.
- Public article pages at `/blog/:slug`.
- CMS post editor at `/admin`, including auth and authenticated workspace states.
- CMS media manager at `/admin/media`, including auth and authenticated workspace states.

The implementation must keep the existing CMS data model, API behavior, authentication flow, publishing flow, media upload flow, and Cloudflare Pages Functions behavior. The change is visual and structural at the HTML/CSS layer unless a small markup adjustment is required to express the target style.

## Target Evidence

The referenced Agent Cloud URL currently resolves publicly to an unauthenticated login page. The visible target includes:

- Warm off-white application canvas.
- Two large rounded panels on desktop.
- Single sign-in panel on mobile.
- Black Agent4All icon mark in a rounded square.
- Dense but polished sans typography using `Satoshi, Avenir Next, Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif`.
- Near-black foreground and primary action color.
- Muted gray body copy.
- Large rounded text inputs.
- Black primary button with white text.
- Small circular icon controls in the top-right corner.
- Light gray borders, soft panel shadows, and restrained radial page glow.

The target CSS exposes the following visual tokens and they are the source of truth for this redesign:

- `--background: #fff`
- `--foreground: #171717`
- `--card: #fff`
- `--primary: #171717`
- `--primary-foreground: #fff`
- `--secondary: #efeee9`
- `--muted: #f4f4f2`
- `--muted-foreground: #71717a`
- `--accent: #f1f5f9`
- `--border: #deded8`
- `--input: #e7e5e4`
- `--ring: #d6d3d1`
- `--destructive: #dc2626`
- `--app-canvas: #f7f7f4`
- `--app-glow-left: #2563eb14`
- `--app-glow-right: #0f172a0f`
- `--selection: #2563eb2e`
- `--shadow-resting: 0 1px 2px #0f172a0a`
- `--shadow-floating: 0 12px 40px #0f172a0f`
- `--shadow-panel: 0 10px 24px #0f172a0d`
- `--radius: 1rem`

Because the authenticated Agent Cloud workspace is not publicly visible from the provided URL, the authenticated CMS views will adapt the visible login-page system plus the exposed product UI tokens. They will not invent a different brand system.

## Design Principles

1. Use one product UI family everywhere. Public pages and CMS pages must feel like different routes in the same Agent Cloud app, not a public editorial site plus a separate admin tool.
2. Preserve user workflows. The writer can still search posts, create drafts, publish, delete, upload covers, insert images, inspect media references, and delete media.
3. Favor familiar product UI over ornamental branding. The target style is restrained, high polish, and task-focused.
4. Use black and warm gray as the dominant system. Blue is only a subtle selection, focus, and ambient glow role.
5. Keep all UI responsive. Desktop can use two-panel layouts; mobile must collapse into a direct single-column task flow.

## Visual System

### Typography

Replace the current serif-led system with the target product stack:

```css
Satoshi, Avenir Next, Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif
```

If Satoshi is not installed locally, the fallback stack must preserve the same rounded modern sans feel. Headings use the same family as labels and body text. Public article body copy may be slightly larger for readability but must remain sans.

Type scale:

- Labels and metadata: 0.75rem to 0.875rem.
- Body text: 0.9375rem to 1rem.
- Card and panel titles: 1.25rem to 1.875rem.
- Public home headline: capped at 3rem desktop and smaller on mobile.

No display serif, no oversized editorial title, no fluid hero typography beyond bounded responsive adjustments.

### Color

Map local tokens in `public/theme.css` to the Agent Cloud system:

- Background canvas: `#f7f7f4`.
- Main surfaces and cards: `#fff`.
- Secondary panels and sidebars: `#efeee9` or `#f4f4f2`.
- Primary text and primary action: `#171717`.
- Muted text: `#71717a`, darkened where needed for WCAG AA.
- Borders and inputs: `#deded8` and `#e7e5e4`.
- Focus and selection: transparent blue based on `#2563eb`.
- Danger: `#dc2626`.

The page body should use the target radial glow:

```css
radial-gradient(circle at 8% 0, var(--app-glow-left), transparent 24rem),
radial-gradient(circle at 92% 8%, var(--app-glow-right), transparent 22rem),
var(--app-canvas)
```

### Shape, Borders, and Shadows

- Panels: 1rem to 1.5rem radius.
- Inputs and primary buttons: 0.875rem to 1rem radius.
- Icon mark: 0.875rem to 1rem radius square.
- Thin borders use `#deded8`.
- Panel shadows use the target soft shadow tokens.
- Avoid combining decorative heavy borders and broad shadows on the same small control.

### Motion

Motion is limited to product feedback:

- 150ms to 200ms hover, focus, and active transitions.
- No page-load choreography.
- Respect `prefers-reduced-motion: reduce`.

## Public Pages

### Home Page

Replace the current editorial title page with an Agent Cloud-style two-panel landing surface.

Desktop:

- Centered app frame within the warm canvas.
- Left panel: Agent4All icon mark, small product label, concise blog positioning, and a bordered feature callout.
- Right panel: direct navigation actions into latest posts and CMS. The visual grammar should echo the sign-in card from the target page without pretending public readers need to sign in.
- Top-right circular controls are included as static visual controls matching the target shape. They must be marked non-interactive unless real theme/language behavior is implemented.

Mobile:

- Collapse to a single primary panel.
- Keep icon mark, title, description, and primary action visible without horizontal scrolling.

### Blog Index

Convert the current journal rail into a product workspace list:

- A rounded shell panel contains search controls and the post list.
- Search inputs use target rounded input styling.
- Posts render as list rows or compact cards with title, excerpt, date, optional cover thumbnail, and a rounded "Open" action.
- Empty state appears inside the panel with concise guidance.

### Article Detail

Article pages should read like a document preview inside Agent Cloud:

- Rounded main article panel with white surface.
- Preserve the existing table-of-contents behavior when headings exist, rendering it as a desktop side panel with muted background and thin border.
- Article title, metadata, author mark, and cover image all use the shared sans system.
- Markdown content preserves readability with 65-75ch measure.
- Code blocks use the exposed code-block tokens: muted header/body treatment, 18px-ish rounding, inset border, and monospace text.
- Blockquotes use thin left or full border only if it matches the target markdown style; avoid colored side accents.

## CMS Pages

### Shared CMS Shell

The admin surfaces should become the closest local equivalent of Agent Cloud workspace UI:

- Warm app canvas.
- Compact top bar with brand mark, route tabs, user state, and logout.
- Rounded app frame on desktop.
- Muted secondary sidebar/list panels.
- White main content panels.
- Consistent black primary buttons and muted secondary/text buttons.
- Same form field shape across login, editor, media, and search.

### Admin Auth

Use the target login page directly:

- Desktop two-panel layout with a left "Agent Cloud" style intro card and right login/setup form card.
- Right form includes icon mark, heading, helper text, email, password, optional setup token, primary button, and status message.
- Mobile hides or collapses the intro card and keeps the form direct.

The setup-required state uses the same card but changes text to administrator setup.

### Post Editor Workspace

Desktop layout:

- Left panel: search and post list in a rounded muted sidebar.
- Right panel: editor in a white rounded main panel.
- Editor header is sticky within the panel, with draft/published status, title, and actions.
- Form sections should be grouped with spacing, not nested decorative cards.
- Markdown textarea uses the target code/editor treatment with monospace and softened muted background.
- Post list active state uses muted/selection background and full outline, not a side stripe.

Mobile layout:

- Topbar stacks cleanly.
- Post list appears above editor or collapses structurally without clipping controls.
- All primary actions retain usable touch height.

### Media Manager

Use the same workspace shell:

- Toolbar inside a rounded panel.
- Media assets display as target-style cards with preview, metadata, reference toggle, and delete action.
- Empty and error states are panel-contained.
- Reference details use standard text/list treatment and avoid inline styles where practical.

## Components and States

Every shared component should have consistent default, hover, focus-visible, active, disabled, success, and error treatment:

- `.button`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-text`.
- Inputs, search fields, textareas, file selector button.
- Nav tabs and topbar links.
- Post rows.
- Media cards.
- Messages and empty states.

Focus states must be visible and use the target ring/blue selection color. Color may not be the only state indicator.

## Implementation Boundaries

Expected code touch points:

- `public/theme.css`: primary design token and component rewrite.
- `src/pages/index.astro`: home page structure.
- `src/pages/admin.astro`: CMS auth and editor shell markup/classes.
- `src/pages/admin/media.astro`: CMS auth and media shell markup/classes.
- `functions/blog/index.ts`: blog index HTML structure/classes.
- `functions/blog/[slug].ts`: article detail HTML structure/classes.
- `DESIGN.md`: update design system documentation after implementation.

Avoid touching:

- Database migrations.
- CMS data modules unless a test exposes a markup-generated data bug.
- Authentication/session API behavior.
- Post/media CRUD API behavior.

## Testing and Verification

Run these checks after implementation:

```bash
npm run build
npm run typecheck
npm test
```

Run browser screenshots for at least:

- `/`
- `/blog`
- one `/blog/:slug` page using existing local content or a temporary local test post if the database is empty
- `/admin` unauthenticated state
- `/admin/media` unauthenticated state

If authenticated CMS data is not available locally, verify authenticated workspace markup through static inspection and any testable unauthenticated shell states. If local auth/data is available, also capture the editor and media workspace after login.

Visual QA checklist:

- The current teal/editorial serif identity is gone.
- Public and CMS pages share the Agent Cloud warm canvas and rounded panel system.
- Buttons and inputs match the target black/white/gray system.
- No text overlaps or horizontal overflow at mobile width.
- Contrast meets WCAG AA for body text and controls.
- Reduced motion is respected.

## Risks

- The provided target URL does not expose the authenticated Agent Cloud workspace without credentials. The design therefore treats the public login page and extracted CSS tokens as authoritative and adapts internal CMS layouts from those tokens.
- The current app uses Cloudflare Pages Functions for blog routes, so public route HTML changes need matching CSS class support in the shared stylesheet.
- The admin pages contain inline JavaScript templates. Any class or structure change must preserve event selectors and data attributes used by existing scripts.
