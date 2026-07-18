# Celerey Design System Reference

This file exists so the admin app's agent can match the visual language of the
Celerey client dashboard (the consumer-facing app this was copied from). Read
this before building any UI. The `public/` folder and `rules/` folder were
already copied over, so logos and coding conventions are available; this file
covers colors, typography, and general layout patterns that live in code
rather than in the rules.

## 1. What Celerey is

Celerey is a wealth/financial advisory platform. The client app (this app's
sibling) lets individual clients track assets, goals, insurance, cash flow,
retirement, and legacy planning, and chat with an AI advisor. The admin app
you're building is for advisors and Celerey staff: it needs to browse the
client database, view/manage each client's financial data, and support them.

Visual tone: calm, premium, "private bank" feel. Deep navy as the anchor
color, generous white space, soft neutral grays, small-caps-style uppercase
section labels, rounded-but-not-bubbly corners (0.625rem base radius).

## 2. Colors

### Brand navy (the core identity color)

There are a few navy shades in use across the codebase because pages were
built at different times. Treat these as one family, not four different
colors:

| Hex | Where it's used |
|---|---|
| `#151339` | Most common "primary" constant used in dashboard pages (`PRIMARY` in assets, dashboard, insurance, legacy, support pages) |
| `#18163f` | `--primary` and `--sidebar` in `globals.css` (the shadcn theme tokens) |
| `#1B1856` / `#1a1856` | Avatar fallback, some badges, concierge accents |
| `#1e3a5f` | Secondary/lighter navy used for links and hover states (AI chat, retirement charts) |

**For a new admin app, pick one canonical navy and use it everywhere** rather
than importing all four. Recommend `#151339` as primary (it's the most
frequently used "brand" constant) with `#18163f` reserved specifically for the
sidebar background if you want a subtle two-tone distinction, matching the
client app's sidebar/primary split.

### Theme tokens (shadcn CSS variables, from `app/globals.css`)

These are the actual Tailwind v4 `@theme` tokens. Copy this block as your
starting `globals.css` `:root` if you want 1:1 consistency:

```css
:root {
  --radius: 0.625rem;
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: #18163f;
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: #18163f;
  --sidebar-foreground: rgba(255, 255, 255, 0.8);
  --sidebar-primary: #ffffff;
  --sidebar-primary-foreground: #18163f;
  --sidebar-accent: rgba(255, 255, 255, 0.1);
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: rgba(255, 255, 255, 0.1);
  --sidebar-ring: rgba(255, 255, 255, 0.3);
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}
```

The sidebar is navy with white/translucent-white text and hover states
(`rgba(255,255,255,0.1)` accents) - a dark sidebar against a light main
content area. Replicate this for the admin nav.

### Status / semantic colors

Used for things like gain/loss, risk levels, alerts:

| Purpose | Color |
|---|---|
| Positive / success | `#10b981` (green) |
| Info / neutral-positive | `#2563eb` / `#7eb8e8` (blue) |
| Warning | `#f59e0b` / `#d97706` (amber) |
| Negative / destructive | `#ef4444` |
| Accent purple (rare, used for AI/tour highlights) | `#8c80f8` / `#A855F7` |

Use `--destructive` (shadcn token, currently `oklch(0.577 0.245 27.325)`, a
red) for destructive actions/buttons rather than a raw hex, to stay
consistent with shadcn conventions.

### Neutral surfaces

- Page background (dashboard main area): `rgb(247, 247, 247)` via the
  `.dashboard-surface` class - a very light gray, not pure white, so cards
  (`bg-card` / white) pop against it.
- `not-found` / empty-state background: `#f9f9fb`.

## 3. Typography

- **Font**: [Manrope](https://fonts.google.com/specimen/Manrope) via
  `next/font/google`, loaded as a CSS variable and wired into Tailwind:

```tsx
// app/layout.tsx
import { Manrope } from "next/font/google";
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
// <html className={manrope.variable}>
```

```css
/* globals.css */
@theme inline {
  --font-sans: var(--font-manrope);
}
```

Use the same font for the admin app. No serif or secondary display font is
used anywhere, keep it to Manrope only.

- **Section labels** (small caps-style eyebrow text above a block of cards):

```
text-[11px] font-medium uppercase tracking-wider text-muted-foreground
```

- **Headings**: semibold weight, tight tracking on large display text (e.g.
  `text-3xl sm:text-4xl font-semibold leading-tight`, `tracking-widest` only
  on tiny uppercase labels, `letter-spacing: -0.01em` on popover titles).
- **Body text**: `text-sm` is the default for most UI copy; `text-xs` for
  secondary/meta text; `font-medium` for buttons and emphasis, not `font-bold`
  (the whole app favors medium/semibold over bold).

## 4. Components

- **UI library**: [shadcn/ui](https://ui.shadcn.com), style `new-york`, base
  color `neutral`, icon library `lucide-react`. The `components.json` at the
  project root has the exact config, copy it as-is for the admin app so `npx
  shadcn add <component>` behaves identically.
- **Rule of thumb** (already encoded in `rules/ui-components.mdc`, copied to
  your project): use shadcn primitives for buttons/cards/inputs/dialogs/
  tables, don't hand-roll them. Only theme tokens (colors) are expected to
  change from stock shadcn, keep spacing/padding/radius as shadcn ships them.
- **Radius**: base `--radius: 0.625rem` (~10px), with `sm/md/lg/xl/2xl/3xl/4xl`
  scale derived from it in `@theme inline`. Cards, inputs, and buttons use
  `rounded-md`/`rounded-lg`/`rounded-xl` depending on size, not fully rounded
  pill shapes (except badges and avatars, which use `rounded-full`).
- **Cards**: `bg-card border border-border/60` - a plain white card with a
  faint border, no heavy shadows by default.
- **Icons**: mostly [FontAwesome](https://fontawesome.com) solid icons for
  nav/sidebar items (`@fortawesome/react-fontawesome`), with
  [lucide-react](https://lucide.dev) for smaller inline UI icons (chevrons,
  close buttons, etc). Either is fine; lucide is the shadcn default so lean on
  it unless you need a specific FontAwesome glyph already used elsewhere.
- **Charts**: [Recharts](https://recharts.org), styled with the `--chart-1`
  through `--chart-5` tokens or the navy family above for financial data
  (asset allocation, income/expense breakdowns).

## 5. Layout patterns

- **Shell**: dark navy sidebar (fixed) + light gray main content area, with a
  topbar inside the content area. Built with shadcn's `Sidebar` /
  `SidebarProvider` / `SidebarInset` primitives (`components/ui/sidebar.tsx`),
  not a custom sidebar implementation.
- **Page container**: `mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8`.
- **Section labels sit above grouped cards**, e.g. "At a glance" in small
  uppercase muted text, then a grid/row of cards below it.
- There's a single `lib/dashboard-theme.ts` file acting as the source of
  truth for shell-level styling tokens (surface background, card classes, KPI
  tile classes, section label classes, page container spacing). **Recommend
  creating an equivalent file in the admin app** so admin-specific surfaces
  (e.g. a data table shell, client detail page) share one set of constants
  instead of hardcoding classes per page.

## 6. Assets already copied

- `public/logos/` - `logoDark.png`, `logoWhite.png`, plus symbol-only marks.
  Use `logoWhite.png` on the navy sidebar, `logoDark.png` on light
  backgrounds.
- `public/celerey_symbol_dark.png` - standalone symbol mark, useful for
  favicons/loading states.

## 7. What's intentionally NOT prescriptive here

The admin app will have different needs (data tables, filters, bulk actions,
client search) that don't exist in the client app. Use the color/type/
component rules above, but design new patterns (e.g. a data table layout)
fresh rather than hunting for a client-app equivalent that doesn't exist.
