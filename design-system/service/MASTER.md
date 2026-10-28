# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/service/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Service
**Category:** Web development agency / service business
**Sources:** UI UX Pro Max (curated) + the portfolio theme (`../port`), so the site feels like part of the portfolio it is linked from.

> The raw `--persist` output was replaced by hand: keyword matching classified the project as "NFT/Web3 · Cyberpunk", which does not fit. The parts kept from UI UX Pro Max are the *Dark Mode (OLED)* style, the *Trust & Authority* pattern, the *Pricing-Focused* landing pattern, the Astro stack rules, and the UX checklist.

---

## Global Rules

### Color Palette

Dark only, monochrome, same grays as the portfolio (Tailwind v4 `gray`). Defined as semantic tokens in `apps/web/src/styles/global.css`, so use `bg-canvas`, `text-muted`, etc., never raw hex.

| Role | Token / class | Value | Usage |
|------|---------------|-------|-------|
| Canvas | `canvas` | `gray-950` | Page background |
| Surface | `surface` | `gray-900` | Cards, panels |
| Raised | `raised` | `gray-800` | Hover / elevated surfaces, skeletons |
| Ink | `ink` | `gray-50` | Headings, primary text, primary button background |
| Ink soft | `ink-soft` | `gray-200` | Body text on cards |
| Muted | `muted` | `gray-400` | Secondary text. **Darkest allowed text color** |
| Line | `line` | `white / 8%` | Borders, dividers |
| Line strong | `line-strong` | `white / 15%` | Hover borders, inputs |

Status colors (functional only, never decorative): success `emerald-400`, warning `amber-400`, danger `red-400`.

**Contrast (WCAG):**

| Text \ Background | gray-950 | gray-900 | gray-800 |
|---|---|---|---|
| gray-50 | 19.3 | 17.0 | 14.0 |
| gray-200 | 16.3 | 14.3 | 11.9 |
| gray-400 | 7.9 | 7.0 | 5.8 |
| gray-500 | 4.2 ❌ | 3.7 ❌ | 3.0 ❌ |

`gray-500` and darker fail 4.5:1 on every surface. Do not use them for text.

### Typography

- **Sans:** Geist (headings + body), same as the portfolio
- **Mono:** Geist Mono, for small labels: `font-mono text-xs uppercase tracking-[0.14em] text-muted`
- **Headings:** `font-medium tracking-tight`, `text-balance`
- **Body:** `text-base` (16px minimum on mobile), `leading-relaxed`, max line length `max-w-prose` (~65ch)

### Shape & Spacing

| Element | Rule |
|---------|------|
| Container | `max-w-6xl mx-auto px-4 sm:px-6`. Use the same width everywhere |
| Section | `py-12 sm:py-20` |
| Buttons, nav, badges | `rounded-full` |
| Cards | `rounded-2xl`; large panels `rounded-3xl` |
| Touch targets | Minimum 44×44px (`h-11`) |
| z-index scale | 10 content overlays · 20 dropdowns · 30 sticky bars · 50 nav · 60 modals |

### Effects

- Transitions: `transition-colors duration-200` (150–300ms). Animate only color, opacity, border, shadow, transform
- Hover: change color, border, or background. **No scale transforms** (they shift layout)
- Glass is reserved for the floating nav: `bg-gray-900/90 backdrop-blur-xl border-line`
- Shadows: `shadow-2xl shadow-black/40` for floating elements only
- Focus: the `focus-ring` utility (2px `white/70` outline, 2px offset) on every interactive element
- Respect `prefers-reduced-motion` (handled globally in `global.css`)

---

## Component Specs

### Buttons

| Variant | Classes |
|---------|---------|
| Primary | `bg-ink text-canvas hover:bg-white/85` |
| Secondary | `border border-line-strong text-ink hover:bg-white/6` |
| Ghost | `text-muted hover:text-ink` |

All: `inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium cursor-pointer` (ghost has no horizontal padding). One primary button per section.

Do not override a component's own utilities from outside (e.g. passing `hidden` or `px-0` to `Button`): two utilities for the same property resolve by CSS order, not by which was passed last. Add a prop/variant, or wrap the component in an element that handles layout and visibility.

### Cards

`rounded-2xl border border-line bg-surface p-6`. Clickable cards add `transition-colors hover:border-line-strong hover:bg-raised cursor-pointer`.

### Navigation

Two navigations, on every page (both in `BaseLayout`):

1. **Portfolio sidebar** (`layout/PortfolioSidebar.astro`): the same floating icon rail as the portfolio, because visitors arrive from it. Items mirror the portfolio's sidebar plus *Services* (always active here). Vertical on the left from `sm`, a bottom bar on phones (like the portfolio's Projects page). Icon-only with `aria-label` + hover/focus tooltip. If the portfolio's sidebar items change, update `portfolioNavItems` too.
2. **Site navbar** (`layout/Navbar.astro`): floating top pill for this site's own pages, glass style, active item `bg-ink text-canvas`. Text labels, not icon-only. Clients must understand every menu item.

Spacing so nothing hides behind them: main content `pt-24`; page wrapper `pb-24` on phones (bottom bar) and `sm:pl-20` until `2xl`; navbar `sm:left-20` until `2xl`. At `xl` the centered `max-w-6xl` container still touches the sidebar, so the offset stays until `2xl`.

### Icons

Lucide only (same set as the portfolio), 24×24 viewBox, `size-4`/`size-5`, `stroke-width 1.8`. Icon-only buttons need `aria-label`.

---

## Page Patterns

### Home: Trust & Authority

Section order follows the `Homepage` single type in `docs/content-model.md`. The pattern's usual metrics strip is left out because the content model has no field for it.

1. Hero: value proposition, primary CTA *Lihat paket* + secondary CTA *Konsultasi gratis*, both above the fold
2. Featured packages
3. Portfolio highlights: case studies **with measurable results** in the summary
4. Work process
5. Testimonials
6. Final CTA (layout only, no content fields)

### Packages / Pricing: Pricing-Focused

Hero → 3 tier cards (middle tier highlighted with a *Paling populer* badge) → feature comparison → FAQ (address objections) → final CTA.

---

## Stack Rules (Astro + Vue)

- Static content = `.astro` components. Vue **only** for interactive islands (order form, availability, consultation booking, filters, gallery)
- Hydration directives: `client:load` only for above-the-fold interactions; `client:visible` below the fold; `client:idle` for non-critical
- Images: `<Image />` / `<Picture />` from `astro:assets`, never a bare `<img>` for local images; always `alt`
- Content comes from `src/services/` (typed). Pages never hardcode content

---

## Anti-Patterns (Do NOT Use)

- ❌ Light mode, or a light/dark toggle (the site is dark only, like the portfolio)
- ❌ AI purple/pink gradients, neon glow, cyberpunk effects
- ❌ Generic copy and claims without proof (prefer numbers, case studies, testimonials)
- ❌ Emojis as icons
- ❌ `gray-500` or darker for text
- ❌ Scale-on-hover / layout-shifting hovers
- ❌ Hydrating static content with Vue, or `client:load` everywhere
- ❌ Missing `cursor-pointer` or invisible focus states

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (Lucide SVG only)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms), no layout shift
- [ ] Text contrast 4.5:1 minimum (nothing darker than `muted`)
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind the floating nav
- [ ] No horizontal scroll on mobile
- [ ] Only interactive parts are Vue islands
