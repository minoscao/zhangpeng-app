# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Primary users are internal product, e-commerce, and creative-operations staff preparing image assets for multiple product SKUs.
- Users work from a product library and need to produce, review, and archive many visual variants without losing the link to the source SKU.

## Product Purpose

The product turns real product base images into organized batches of AI-generated creative assets. Success means a user can select products, combine reusable prompt groups, review the exact output count, generate variants, and save approved results back to each SKU.

## Positioning

The workspace treats the SKU and its real product image as the system of record, while prompt combinations and model providers remain reusable production tools around it.

## Operating Context

- Users maintain product information, clean e-commerce base images, specifications, and generation history.
- A production run may include several SKUs and several prompt dimensions such as location, color, style, scene, and output purpose.
- Generated assets must remain traceable to both the SKU and the prompt combination that produced them.

## Capabilities and Constraints

- Product-library images must be clean product base images, preferably white-background e-commerce photography, rather than arbitrary generated scene examples.
- Product rows open a right-side detail drawer with product information and generated-assets tabs.
- The batch workspace supports multiple selected products, reusable prompt groups, live combination totals, a confirmation step, grouped progress/results, per-image regenerate/delete, and one-click save back to product history.
- Data must persist across refreshes in the local/static-hosting experience.
- The deployed client must never expose API credentials.
- Open decision: “2D storage mode” may mean image-only storage or a two-dimensional SKU-by-tag organization; the current implementation treats outputs as 2D image assets grouped by SKU and tags.

## Brand Commitments

- Keep the existing “创想设计平台” identity and the restrained purple, neutral, high-density professional workspace visual system.
- Use clear Chinese operational copy and familiar dashboard interaction patterns.

## Evidence on Hand

- Boss feedback and reference screenshots supplied in the Codex conversation on 2026-09-07.
- Consolidated requirements: `docs/第二轮老板反馈-修改需求整理-2026-09-07.md`.
- Existing visual system: `design-system/tentflow-studio/MASTER.md` and page overrides.
- Existing production implementation: `app/index.html`, `app/styles.css`, and `app/app.js`.

## Product Principles

- Real products before generated scenes.
- Every generated image remains attributable to a SKU and prompt combination.
- Progressive disclosure keeps dense prompt libraries manageable.
- Users see quantity, cost, and time before committing a batch.
- Review and correction happen before assets are saved back to the product library.

## Accessibility & Inclusion

- All core controls require visible keyboard focus, descriptive labels, non-color-only selected states, and touch targets of at least 44 × 44 px.
- Drawers and dialogs must support Escape-to-close and predictable focus behavior.
