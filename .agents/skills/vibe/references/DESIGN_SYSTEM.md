# Design System Reference

Rules for generating websites that look like a $2,000 freelance site, not AI slop.

## Typography

### Font Pairing Library

Pick ONE pairing per site. NEVER reuse the same pairing across consecutive generations.

| Display Font | Body Font | Mood |
|-------------|-----------|------|
| Playfair Display | Source Sans 3 | Editorial, luxury |
| Fraunces | Outfit | Warm, approachable |
| Sora | DM Sans | Tech, contemporary |
| Libre Baskerville | Karla | Classic, trustworthy |
| Space Mono | Work Sans | Developer, technical |
| Cormorant Garamond | Montserrat | Elegant, refined |
| Cabinet Grotesk* | Satoshi* | Modern, premium (self-hosted) |
| Bricolage Grotesque | Geist* | Sharp, editorial |
| Instrument Serif | Inter Tight | Contrast, sophisticated |
| DM Serif Display | Manrope | Bold, contemporary |
| Lora | Nunito Sans | Warm, readable |
| Bitter | Raleway | Sturdy, professional |

*Fonts marked with * require self-hosting. For quick deploys, prefer Google Fonts alternatives.

### BANNED Fonts (Never Use as Primary)

Inter, Roboto, Arial, Helvetica, system-ui, -apple-system, sans-serif (as sole declaration),
Space Grotesk (overused in AI output), Poppins (overused in templates).

These may appear in fallback stacks only.

### Typography Scale

Use a modular scale based on the context:

**Compact (portfolios, dashboards):** ratio 1.200 (minor third)
```
--text-xs:  0.694rem    /* ~11px */
--text-sm:  0.833rem    /* ~13px */
--text-base: 1rem       /* 16px */
--text-lg:  1.2rem      /* ~19px */
--text-xl:  1.44rem     /* ~23px */
--text-2xl: 1.728rem    /* ~28px */
--text-3xl: 2.074rem    /* ~33px */
--text-4xl: 2.488rem    /* ~40px */
```

**Spacious (landing pages, marketing):** ratio 1.333 (perfect fourth)
```
--text-xs:  0.563rem    /* ~9px */
--text-sm:  0.75rem     /* 12px */
--text-base: 1rem       /* 16px */
--text-lg:  1.333rem    /* ~21px */
--text-xl:  1.777rem    /* ~28px */
--text-2xl: 2.369rem    /* ~38px */
--text-3xl: 3.157rem    /* ~51px */
--text-4xl: 4.209rem    /* ~67px */
```

### Typography Rules

- Body: 16-18px base, line-height 1.5-1.65
- Headings: line-height 1.1-1.25, letter-spacing -0.02em to -0.04em for large sizes
- `text-wrap: balance` on all headings
- `font-variant-numeric: tabular-nums` on number-heavy displays
- Maximum body line length: 65-75 characters (`max-width: 65ch`)
- Use `font-display: swap` on all `@font-face` or Google Fonts `&display=swap`

## Color

### Palette Construction

Define ALL colors as CSS custom properties on `:root`. Use the dominant + accent model:

```css
:root {
  --color-bg: #faf9f6;
  --color-surface: #ffffff;
  --color-text: #1a1a1a;
  --color-text-muted: #6b6b6b;
  --color-primary: #2d5016;        /* dominant */
  --color-primary-light: #4a7a2e;
  --color-accent: #c44e1b;         /* sharp accent */
  --color-border: #e5e2dc;
}
```

### BANNED Default Palettes

- Purple/indigo/violet gradients (the #1 AI tell)
- Tailwind default blue-500 as primary action color
- Any palette that is "evenly distributed" — one color MUST dominate
- Rainbow or multi-hue palettes without a clear hierarchy

### Palette Strategies by Mood

| Mood | Background | Text | Primary | Accent |
|------|-----------|------|---------|--------|
| Warm professional | `#faf9f6` cream | `#1a1a1a` | Deep forest `#2d5016` | Burnt orange `#c44e1b` |
| Cool minimal | `#f8f9fa` cool gray | `#111827` | Slate `#334155` | Teal `#0d9488` |
| Dark cinematic | `#0a0a0a` black | `#e5e5e5` | Warm white `#f5f0eb` | Gold `#d4a843` |
| Bold editorial | `#fffff0` ivory | `#1a1a1a` | Crimson `#b91c1c` | Near-black `#1e1e1e` |
| Soft natural | `#f5f1eb` sand | `#2c2c2c` | Sage `#7c9473` | Terracotta `#c67b5c` |
| Monochrome punch | `#ffffff` | `#000000` | Black `#000000` | Electric `#ff3b00` |
| Tech/dark | `#111111` | `#e0e0e0` | Neon green `#4ade80` | White `#ffffff` |

### Contrast Requirements

- Body text on background: minimum 4.5:1 (WCAG AA)
- Large text (24px+ or 19px bold): minimum 3:1
- Interactive elements: minimum 3:1 against adjacent colors
- Verify with: `contrast-ratio = (L1 + 0.05) / (L2 + 0.05)` where L1 > L2

## Spacing

### 8px Grid

ALL spacing uses multiples of 8px. Define as custom properties:

```css
:root {
  --space-1: 0.25rem;   /* 4px — line-heights only */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

### Spacing Rules

- Section padding: `var(--space-16)` to `var(--space-24)` vertical
- Card padding: `var(--space-6)` to `var(--space-8)`
- Component gaps: `var(--space-4)` to `var(--space-6)`
- Inline element gaps: `var(--space-2)` to `var(--space-3)`
- Internal spacing < external spacing (Gestalt proximity)
- Container max-width: 1200px with side padding `var(--space-6)` minimum

## Layout

### Break the Template

NEVER default to the generic SaaS pattern. For each site type, design a layout that fits the content.

**Layout techniques to use:**
- CSS Grid with named areas for semantic structure
- Asymmetric columns (60/40, 70/30, not always 50/50)
- Overlapping elements with `position: relative` + negative margins
- Full-bleed sections alternating with contained sections
- Sticky elements for navigation or sidebars
- `aspect-ratio` for consistent media containers

**Layout patterns to avoid:**
- Three equal columns with icon + heading + text (the AI features grid)
- Perfectly centered everything with no visual tension
- Identical section rhythm top to bottom
- Cards all the same height with forced uniform content

### Responsive Strategy

Design mobile-first. Three breakpoints:

```css
/* Mobile: default (< 768px) */
/* Tablet: */
@media (min-width: 768px) { }
/* Desktop: */
@media (min-width: 1024px) { }
```

- Navigation: hamburger on mobile, horizontal on desktop
- Grid: 1 column mobile, 2 on tablet, 2-3 on desktop
- Font sizes: use `clamp()` for fluid scaling
- Touch targets: minimum 44x44px
- Side padding: minimum 16px on mobile, 24px on tablet, 48px+ on desktop

## Animation

### One Orchestrated Entry

Prefer a single page-load animation sequence over scattered micro-interactions:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-in {
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animate-in:nth-child(2) { animation-delay: 0.1s; }
.animate-in:nth-child(3) { animation-delay: 0.2s; }
```

### Animation Rules

- Only animate `transform` and `opacity` (compositor-friendly)
- Duration: 150-300ms for UI transitions, 400-800ms for reveals
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for enters, `cubic-bezier(0.4, 0, 0.2, 1)` for general
- NEVER use `transition: all` — list properties: `transition: transform 0.3s, opacity 0.3s`
- Always respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Accessibility

### Non-Negotiable Rules

- Semantic HTML elements (`<button>`, `<a>`, `<nav>`, `<main>`, `<header>`, `<footer>`)
- All interactive elements have `:focus-visible` styles
- NEVER `outline: none` without a visible replacement
- All images have `alt` text (decorative images: `alt=""` with `role="presentation"`)
- Form inputs have associated `<label>` elements (not placeholder-only)
- Color is never the sole indicator of state (add icons or text)
- Skip link as first focusable element: `<a href="#main" class="sr-only focus:not-sr-only">`
- `lang` attribute on `<html>`
- Heading hierarchy: one `<h1>`, sequential `<h2>`-`<h6>`

## Dark Mode

### Implementation

```css
:root {
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0a0a0a;
    --color-surface: #1a1a1a;
    --color-text: #e5e5e5;
    --color-text-muted: #a0a0a0;
    --color-border: #2a2a2a;
    /* primary and accent may need lightened variants */
  }
}
```

- Add `<meta name="theme-color" content="#faf9f6" media="(prefers-color-scheme: light)">` and dark equivalent
- Test all text against dark backgrounds for legibility
- Shadows: use inset or lighter opacity in dark mode
- Images: consider `filter: brightness(0.9)` on dark backgrounds

## Images

### Strategy

For quick deploys with no asset pipeline, use one of:

1. **Unsplash direct URLs:** `https://images.unsplash.com/photo-{REAL_ID}?w=800&h=600&fit=crop`
   - ONLY use real Unsplash photo IDs that are known to exist
   - Always include `w`, `h`, and `fit=crop` params
2. **Inline SVG illustrations:** Simple geometric shapes, patterns, or icons
3. **CSS-only decorative elements:** Gradients, shapes with `clip-path`, `border-radius`
4. **No images:** Typography-driven designs that don't need photos

NEVER use placeholder.svg, placeholder.com, or via.placeholder.com.

All `<img>` tags MUST have explicit `width` and `height` attributes.
Below-fold images: `loading="lazy"`. Hero images: `fetchpriority="high"`.

## Meta & SEO

Every generated `index.html` must include:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{relevant description}">
  <meta name="theme-color" content="{bg-color}" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="{dark-bg-color}" media="(prefers-color-scheme: dark)">
  <title>{Site Title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family={fonts}&display=swap" rel="stylesheet">
</head>
```
