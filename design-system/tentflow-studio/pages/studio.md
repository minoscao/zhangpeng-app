# Studio Page Overrides

> **PROJECT:** TentFlow Studio
> **Generated:** 2026-09-04 19:41:52
> **Page Type:** Dashboard / Data View

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1400px or full-width
- **Grid:** 12-column grid for data flexibility

### Spacing Overrides

- **Content Density:** High — optimize for information display

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- No overrides — use Master colors

### Component Overrides

- 镜头景别选项必须在辅助说明中直接显示产品占画面比例：近景 80%–95%、中景 45%–60%、远景 12%–25%。
- 最终提示词把所选景别作为最高构图优先级，明确摄影距离、等效焦段、产品占比、环境占比和禁止回落的景别。
- 用户修改景别后，最终提示词确认状态必须回到“待确认”。

---

## Page-Specific Components

- `shot-distance-option`: 景别名称 + 可量化的产品画面占比 + 对应构图硬约束。

---

## Recommendations

- Effects: Hover tooltips, chart zoom on click, row highlighting on hover, smooth filter animations, data loading spinners
