# Frontend Style Guide

> **Note:** This document is the authoritative source for all frontend styling. All developers and agents must follow these rules.

## Overview

The platform uses a **soft dark minimal** design inspired by Catppuccin Mocha. The system prioritizes cohesion, using tone differences for layering instead of borders.

---

## Design Philosophy

- **90% neutral, 10% accent** - UI remains predominantly neutral
- **Use tone differences** instead of borders for layering
- **Layers should feel like one continuous surface**, not stacked boxes
- **No harsh contrasts** - soft transitions between surfaces
- **No borders** - separation comes from subtle tone shifts
- **Rounded corners** for a modern, cohesive feel

---

## Color System

### CSS Variables (`:root`)

```css
:root {
  /* Background Colors */
  --bg-primary: #1e1e2e;
  --bg-secondary: #181825;
  
  /* Surface Colors (3-tone system) */
  --surface: #2b2c3f;      /* Base layer */
  --surface-soft: #313244;  /* Elevated layer */
  --highlight: #45475a;      /* Highlight layer */
  
  /* Text Colors */
  --text-primary: #cdd6f4;
  --text-secondary: #a6adc8;
  --text-muted: #6c7086;
  
  /* Accent Colors (use sparingly) */
  --accent-blue: #89b4fa;
  --accent-mauve: #cba6f7;
  --accent-green: #a6e3a1;
  --accent-yellow: #f9e2af;
  --accent-red: #f38ba8;
}
```

### Tone System (3 Layers)

| Layer | Color | Usage |
|-------|-------|-------|
| Base | `--surface` | Cards, containers |
| Elevated | `--surface-soft` | Stat boxes, nested elements |
| Highlight | `--highlight` | Hover states, rank badges |

### Color Usage Rules

| Element | Allowed Colors |
|---------|---------------|
| Page background | `--bg-primary` |
| Card/surface | `--surface` |
| Nested elements | `--surface-soft` |
| Hover states | `--highlight` |
| Text | `--text-primary`, `--text-secondary`, `--text-muted` |
| Primary actions | `--accent-blue` (with opacity) |
| Success stats | `--accent-green` |
| Error stats | `--accent-red` |
| Rank badges | Accent colors with 20-25% opacity |

---

## Spacing System

Uses an **8px base scale**.

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
```

---

## Typography

### Font Stack
```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Text Scale
```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
```

### Hierarchy Rules
- Titles: `font-weight: 600` (semibold), not bold
- Secondary text: muted color
- Hierarchy comes from size, not color

---

## Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 9999px;  /* Pills, badges */
```

---

## Transitions

```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
```

---

## Components

### Card
- Background: `--surface`
- Border-radius: `--radius-lg` or `--radius-xl`
- **NO borders**
- Padding: `--space-4`
- Hover: subtle tone shift to `--surface-soft`

### Button

**Soft Tinted Style (recommended):**
```css
background: rgba(137, 180, 250, 0.15);  /* 15% opacity */
color: var(--accent-blue);
```
- Hover: increase opacity to 25%
- **NO gradients**
- **NO shadows/glows**
- **NO transforms on hover**

**Button Variants:**

| Variant | Background | Text |
|---------|-----------|------|
| Primary | `accent/15%` | `--accent-blue` |
| Secondary | `--surface-soft` | `--text-primary` |
| Danger | `red/15%` | `--accent-red` |

**States:**
- Hover: background opacity increases slightly
- Disabled: 50% opacity

---

### Input
- Background: `--bg-secondary`
- **NO borders**
- Border-radius: `--radius-lg`
- Focus: change background to `--surface`
- **NO outline, NO ring**

---

### Tag/Label
- Border-radius: `--radius-full` (pill shape)
- Background: accent at **15% opacity**
- **NO borders**
- Font-size: `--text-xs`

---

### Leaderboard Row
- Background: `--surface` (or alternating)
- Border-radius: `--radius-md`
- Hover: `--surface-soft`
- **NO borders**

### Rank Badges
- Size: 24x24px (small)
- Border-radius: 50% (circle)
- Background: accent at **25% opacity**
- Top 3: yellow, mauve, green
- Others: `--highlight`

---

### Auth Page
- Container: `--bg-primary` (solid)
- Card: `--surface`, centered
- **NO gradients**

---

### Rules Card
- Used for game rules/instructions pages
- Container: `.rules-card` - centered, max-width 500px
- Inner: `.rules-card-inner` - surface background
- Title: `.rules-title` - 24px semibold
- Description: `.rules-description` - muted text
- Steps: `.rules-steps`, `.rules-step` - vertical list with number badges
- Number badge: `.number-badge` - 24x24px circle, accent at 20% opacity

### Game Stats
- Grid: `.stats-grid` - 2-column layout
- Card: `.stat-card` - surface-soft background, centered text
- Value: `.stat-value` - 28px semibold, accent color
- Label: `.stat-label` - secondary text

### Leaderboard
- Container: `.leaderboard` - vertical list
- Item: `.leaderboard-item` - row with rank, name, score
- Rank: `.leaderboard-rank` - 24px width, muted
- Top 3: `.leaderboard-rank.top-3` - accent-yellow color
- Current user: `.leaderboard-item.current-user` - surface-soft background

### Results Card
- Used for game results/end screens
- Card: `.results-card` - surface background
- Title: `.results-title` - centered, 20px semibold
- Subtitle: `.results-subtitle` - secondary text
- Actions: `.results-actions` - vertical button stack

### Guest Prompt
- `.guest-prompt` - yellow tint background at 10% opacity
- Text: `.guest-prompt-text` - yellow accent color

### Game Header
- `.game-header` - flex row, space-between
- Stats: `.game-stats` - inline stats with monospace numbers

---

### Game Card
- Background: `--surface`
- Border-radius: `--radius-lg`
- Hover: `--surface-soft`
- **NO borders, NO transforms, NO shadows**

---

## Global Rules

### DO:
- ✅ Use CSS variables for all colors
- ✅ Use spacing tokens for padding/margin
- ✅ Use border-radius tokens
- ✅ Use 3-tone system for layering
- ✅ Use soft tinted backgrounds for buttons
- ✅ Use accent colors at low opacity (15-25%)
- ✅ Add subtle hover tone shifts
- ✅ Keep surfaces neutral
- ✅ Use accents sparingly - one per component

### DO NOT:
- ❌ Use raw hex colors (use CSS variables)
- ❌ Use borders for separation
- ❌ Use gradients on buttons
- ❌ Use shadows/glows on buttons
- ❌ Use transforms on hover
- ❌ Use solid accent backgrounds
- ❌ Use Tailwind's bright color classes (e.g., `bg-yellow-500`)
- ❌ Create arbitrary spacing values
- ❌ Use high contrast between layers

---

## File Structure

```
frontend/src/
├── styles/
│   └── design-tokens.css    # CSS variables
├── components/
│   ├── Navbar.tsx
│   ├── Highlight.tsx        # Text highlighting
│   ├── Leaderboard.tsx      # Leaderboard display
│   ├── NumberBadge.tsx      # Circular number badge
│   ├── RuleStep.tsx         # Rules step item
│   ├── RulesCard.tsx        # Rules page container
│   ├── StatCard.tsx         # Stat display card
│   ├── StatsGrid.tsx        # Stats grid container
│   └── index.ts             # Barrel export
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── HomePage.tsx
│   ├── PlayPage.tsx
│   ├── Typeracer.tsx
│   └── NotFoundPage.tsx
├── hooks/
│   ├── useAuth.tsx
│   ├── useWebSocket.ts
│   └── ProtectedRoute.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── index.css                 # Base styles + components
└── App.tsx
```

---

## Implementation Notes

### React Components
For reusable UI patterns, use the component library in `/components`:

```tsx
import { RulesCard, RuleStep, Highlight, StatCard, StatsGrid, Leaderboard } from '../components';
```

**Rules Components:**
- `<RulesCard title="Game" description="Desc">{children}</RulesCard>` - Rules page container
- `<RuleStep number={1}>Step text</RuleStep>` - Numbered step
- `<Highlight color="var(--accent-green)">text</Highlight>` - Colored text

**Stats Components:**
- `<StatsGrid>{children}</StatsGrid>` - 2-column grid
- `<StatCard value={100} label="WPM" unit="words" color="var(--accent-green)" />` - Stat display

**Leaderboard:**
- `<Leaderboard entries={[{rank, username, value}]} currentUserId={1} />` - Leaderboard list

### Tailwind Extended Theme
Custom colors and border-radius are mapped in `tailwind.config.js`.

### Available CSS Classes

**Base:**
- `.card` - Surface card
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger` - Buttons
- `.btn-primary-solid` - Solid accent button (primary CTAs)
- `.input` - Clean input
- `.tag` / `.tag-blue` / `.tag-green` / `.tag-red` - Tags/labels
- `.spinner` - Loading spinner

**Layout:**
- `.auth-container` / `.auth-card` - Auth page layout
- `.navbar` / `.navbar-brand` - Navigation
- `.game-card` - Game listing card
- `.page-header` / `.page-title` / `.page-subtitle` - Section headers
- `.form-actions` - Form action container
- `.text-link` / `.text-link-with-margin` - Text links

**Rules:**
- `.rules-card` / `.rules-card-inner` - Rules page container
- `.rules-title` / `.rules-description` / `.rules-section-title` - Text styles
- `.rules-steps` / `.rules-step` / `.rules-step-text` - Step list
- `.number-badge` - Circular number badge

**Stats:**
- `.stats-grid` - 2-column grid
- `.stat-card` / `.stat-value` / `.stat-label` - Stat display

**Leaderboard:**
- `.leaderboard` / `.leaderboard-item` - Container and rows
- `.leaderboard-rank` / `.leaderboard-name` / `.leaderboard-score` - Cell styles
- `.leaderboard-rank.top-3` - Top 3 ranking
- `.leaderboard-item.current-user` - Current user highlight

**Game UI:**
- `.game-header` / `.game-stats` - Game header
- `.game-text-container` / `.game-text` / `.game-footer` - Game area
- `.results-card` / `.results-title` / `.results-subtitle` - Results screen
- `.results-actions` / `.results-actions-with-margin` - Action buttons
- `.results-title-left` / `.results-card-centered` - Results variants
- `.guest-prompt` / `.guest-prompt-text` - Guest prompt box

---

## Visual Balance Check

Before shipping, verify:

1. **Layering:** Does the UI feel like one surface? Are tone differences subtle?
2. **Accents:** Are accents guiding attention, not overwhelming?
3. **Borders:** Are there any visible borders? Remove them.
4. **Contrast:** Is contrast between layers low and soft?
5. **Balance:** Is the UI 90% neutral?

If any check fails, revise before merging.

---

## Enforcement

This style guide is **enforceable**. Any code violating these rules should be flagged during code review.

When in doubt, prefer:
- Neutral over colorful
- Subtle over dramatic
- Tone over border
- Cohesion over creativity
