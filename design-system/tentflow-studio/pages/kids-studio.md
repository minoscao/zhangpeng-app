# Kids Studio Page Overrides

> **PROJECT:** TentFlow Studio
> **Generated:** 2026-09-04 20:15:44
> **Page Type:** General

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px (standard)
- **Layout:** Full-width sections, centered content

### Spacing Overrides

- No overrides — use Master spacing

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- No overrides — use Master colors

### Component Overrides

- Use image-led selection cards instead of dropdowns for structure, scene, material, theme, and style.
- Every selectable card has a visible label, `aria-pressed`, a minimum 44px target, and a non-color-only selected check.
- Category cards use a two-column layout: descriptive copy on the left, original product illustration on the right.
- The design control panel may scroll independently only on wide desktop; it becomes document-flow content below 1180px.

---

## Page-Specific Components

- `visual-choice`: original SVG preview + label + selected check.
- `points-pill`: persistent top-bar balance using tabular figures.
- `generation-meta`: latest generation time and points deducted.
- `scene-upload`: local JPG/PNG/WebP preview that becomes the background layer for concept fusion.

---

## Recommendations

- Effects: Inner+outer shadows (subtle, no hard lines), soft press (200ms ease-out), fluffy elements, smooth transitions
