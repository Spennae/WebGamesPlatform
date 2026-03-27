# Frontend Style Guide

> **Note:** This document is the authoritative source for all frontend styling. All developers and agents must follow these rules.

## Overview

The platform uses a dark minimal design inspired by Catppuccin Mocha palette. The system prioritizes consistency over creativity.

---

## Design Philosophy

- **90% neutral, 10% accent** - UI remains predominantly neutral
- **Use tone differences** instead of borders
- **Layers should feel blended**, not stacked
- **No harsh contrasts** - soft transitions between surfaces
- **Subtle shadows and glows** for depth
- **Rounded corners** for a modern feel

---

## Color System

### CSS Variables (`:root`)

```css
:root {
  /* Background Colors */
  --bg-primary: #1e1e2e;
  --bg-secondary: #181825;
  
  /* Surface Colors */
  --surface: #2b2c3f;
  --surface-soft: #313244;
  --highlight: #45475a;
  
  /* Text Colors */
  --text-primary: #cdd6f4;
  --text-secondary: #a6adc8;
  --text-muted: #6c7086;
  
  /* Accent Colors */
  --accent-blue: #89b4fa;
  --accent-mauve: #cba6f7;
  --accent-green: #a6e3a1;
  --accent-yellow: #f9e2af;
  --accent-red: #f38ba8;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 20px 50px rgba(0, 0, 0, 0.4);
}
```

### Color Usage Rules

| Element | Allowed Colors |
|---------|---------------|
| Page background | `--bg-primary`, `--bg-secondary` |
| Card/surface | `--surface`, `--surface-soft` |
| Text | `--text-primary`, `--text-secondary`, `--text-muted` |
| Primary buttons | `--accent-blue` (gradient allowed) |
| Success | `--accent-green` |
| Error | `--accent-red` |
| Borders | `--highlight`, `--surface-soft` |

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
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
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
--text-4xl: 2.25rem;
```

---

## Border Radius

```css
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-full: 9999px;
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
- Border: 1px `--highlight`
- Border-radius: `--radius-xl`
- Padding: `--space-6` to `--space-8`
- Shadow: `--shadow-md`
- Hover: border changes to `--accent-blue`

---

### Button

**Variants:**

| Variant | Background | Text | Shadow |
|---------|-----------|------|--------|
| Primary | Gradient `--accent-blue` | `--bg-primary` | Blue glow |
| Secondary | `--surface-soft` | `--text-primary` | None |
| Danger | Gradient `--accent-red` | `--bg-primary` | Red glow |
| Ghost | transparent | `--text-secondary` | None |

**States:**
- Hover: `translateY(-1px)` + increased shadow
- Active: `translateY(0)` + reduced shadow
- Disabled: 50% opacity, no transform

---

### Input
- Background: `--bg-secondary`
- Border: 2px `--surface`
- Border-radius: `--radius-lg`
- Focus: border `--accent-blue` + blue ring

---

### Tag/Label
- Border-radius: `--radius-full`
- Background: accent at 15% opacity
- Border: 1px accent at 30% opacity
- Text: uppercase, font-weight 600

---

### Auth Page
- Container: gradient background `--bg-primary` to `--bg-secondary`
- Card: `--shadow-lg`, centered, max-width 28rem
- Title: font-weight 700, centered

---

### Game Card
- Background: `--surface`
- Border-radius: `--radius-xl`
- Hover: `translateY(-4px)` + blue shadow
- Contains: title, description, tag, action button

---

## Global Rules

### DO:
- ✅ Use CSS variables for all colors
- ✅ Use spacing tokens for padding/margin
- ✅ Use border-radius tokens
- ✅ Add subtle shadows to cards
- ✅ Use gradient for primary buttons
- ✅ Add hover transforms to interactive elements
- ✅ Keep surfaces neutral
- ✅ Use accents sparingly

### DO NOT:
- ❌ Use raw hex colors
- ❌ Use inline styles
- ❌ Use large/bright animations
- ❌ Add glow effects to all elements (only buttons)
- ❌ Create arbitrary spacing values
- ❌ Override component styles locally

---

## File Structure

```
frontend/src/
├── styles/
│   └── design-tokens.css    # CSS variables
├── components/
│   └── Navbar.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── HomePage.tsx
│   ├── PlayPage.tsx
│   └── NotFoundPage.tsx
├── hooks/
│   ├── useAuth.tsx
│   └── ProtectedRoute.tsx
├── services/
│   └── index.ts
├── types/
│   └── index.ts
├── index.css                 # Base styles + components
└── App.tsx
```

---

## Implementation Notes

### Tailwind Extended Theme
Custom colors, spacing, and border-radius are mapped in `tailwind.config.js` to CSS variables.

### CSS Classes Available
- `.card` - Surface card with shadow
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger` / `.btn-ghost`
- `.input` / `.input-error`
- `.tag` / `.tag-blue` / `.tag-green` / `.tag-red`
- `.spinner` / `.spinner-lg`
- `.alert-error` - Error message box
- `.auth-container` / `.auth-card` - Auth page layout
- `.navbar` / `.navbar-brand` - Navigation
- `.game-card` - Game listing card
- `.page-header` / `.page-title` / `.page-subtitle` - Section headers

---

## Enforcement

This style guide is **enforceable**. Any code violating these rules should be flagged during code review.

When in doubt, prefer:
- Neutral over colorful
- Subtle over dramatic
- Consistent over creative
