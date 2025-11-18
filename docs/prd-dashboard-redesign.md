# PRD: Dashboard & Entry Route Cosmetic Refresh

**Version:** 0.1  
**Author:** Cascade (AI Pair)  
**Created:** 2025-11-17  
**Branch:** `feature/dashboard-ui-redesign`

---

## 1. Executive Summary

Refresh the authenticated dashboard and entry detail routes to deliver a cohesive, elegant UI that emphasizes clarity, consistency, and future-ready navigation. The effort is **purely cosmetic**; functional flows (entry creation, editing, documents, etc.) must continue working unchanged unless a minor adjustment is required to support the new presentation.

---

## 2. Objectives & Success Metrics

### Primary Goals

1. Introduce a unified dashboard shell featuring:
   - A left-aligned sidebar with entry points for planned settings/preferences and user feedback surveys (links may target placeholder routes for now).
   - A consistent top section for creation CTAs and status messaging.
2. Redesign the entry list to emphasize scannability and parity across personal vs. team items.
3. Update entry detail layout patterns (header, sub-navigation, supporting cards) to match the refreshed dashboard language.

### Success Metrics

- ✅ Visual consistency score (internal heuristic) increases vs. current UI during design review.
- ✅ No regression in core dashboard actions (view entry, create entry, view stats) during QA.
- ✅ Sidebar navigation structure allows us to surface future routes without layout churn.

---

## 3. Current State & Pain Points

| Area              | Observation                                                                                          | Pain Point                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Dashboard frame   | Content centered in wide container without persistent nav                                            | Feels floating / lacks hierarchy                |
| Entry list        | Mixed card treatments between featured entry and list; filters rely on Tabs but lack contextual cues | Hard to scan at scale                           |
| Secondary actions | Stats panel separated but visually underpowered                                                      | Data feels detached; limited guidance           |
| Entry route       | Header/back CTA simple but lacks connection to dashboard styling                                     | Experience feels like a different product stage |

---

## 4. Scope & Non-Goals

### In Scope

- Layout, typography, spacing, and component styling updates across `/dashboard` and `[entryId]` routes.
- Introducing placeholder sidebar links for:
  - User feedback survey hub (e.g., `/dashboard/feedback-surveys`).
  - User profile settings (future route).
  - Organization preferences (future route).
- Content hierarchy improvements (e.g., consistent card headers, badges, statuses).

### Out of Scope

- Backend logic, data fetching, permissions, or Clerk auth changes.
- Entry creation/edit flows beyond visual polish of existing UI.
- Building the linked survey/settings pages (links may be TBD/disabled until implemented).

---

## 5. Design Principles

1. **Cohesion:** Shared typography scale, spacing system, and card skeletons across all dashboard modules.
2. **Hierarchy:** Clear primary CTA area, secondary stats, tertiary metadata.
3. **Future-ready:** Sidebar pattern should accommodate more links without redesign.
4. **Responsiveness:** Mobile-first approach with collapsible sidebar / sticky tools.
5. **Low-risk:** Avoid touching data mutations unless required for layout.

---

## 6. Proposed Experience

### 6.1 Dashboard Layout

```
┌───────────────────────────────────────────────┐
│ Top App Bar (logo, user menu)                 │
├──────────────┬───────────────────────────────┤
│ Sidebar      │ Main Canvas                    │
│ - Overview   │ ┌───────────────────────────┐ │
│ - Surveys    │ │ Hero / Featured Entry     │ │
│ - Settings   │ ├───────────────────────────┤ │
│ - Org Prefs  │ │ Entry List + Filters      │ │
│              │ ├───────────────────────────┤ │
│              │ │ Insights / Stats Column   │ │
└──────────────┴───────────────────────────────┘
```

#### Sidebar (new)

- Fixed on desktop, collapsible drawer on mobile.
- Contains section label ("Workspace") + nav groups (Entries, Feedback, Settings).
- Links to be implemented:
  - `Overview` → `/dashboard` (current view).
  - `Feedback Surveys` → `/dashboard/feedback-surveys` (TBD route; use `Link` with `aria-disabled`).
  - `User Settings` → `/dashboard/settings` (placeholder path).
  - `Organization Preferences` → `/dashboard/organization` (placeholder).
- Include icons consistent with existing `Icon` component.

#### Top Bar

- Retain `CreatePortal` button; align with headline and quick stats badges.
- Add optional helper text ("Welcome back" message) pulled from existing data when available.

### 6.2 Entry List

- Replace current `Tabs` + stacked cards with unified list component:
  - Row layout with thumbnail, metadata block, status badges, and quick actions in a consistent grid.
  - Filter controls remain as `Tabs`, but add pill counters and descriptive copy.
  - Introduce `EmptyState` component for each tab.
- Featured entry card adopts same typography scale but remains visually prominent.

### 6.3 Stats & Insights

- Convert `UserStats` into a "Insights" card stack with icon chips, optional trend arrows, and quick tips (static copy for now).
- Optionally add "Activity" micro-table (entries this month, pending feedback count placeholder).

### 6.4 Entry Detail Route (`/[entryId]`)

- Mirror top layout: hero panel with image, key facts, action buttons grouped.
- Introduce sticky sub-nav (Overview, Documents, Images, Feedback placeholder) to match dashboard nav.
- Keep existing functionality untouched (links, actions). Focus on reorganizing markup, spacing, and card styling.

---

## 7. Accessibility & Responsiveness

- Maintain semantic headings (h1 for page title, h2 for sections).
- Ensure sidebar toggle is keyboard accessible; trap focus when open on mobile.
- Preserve contrast ratios ≥ WCAG AA.
- Provide `aria-disabled` and tooltip copy for placeholder links.

---

## 8. Technical Considerations

- Mostly server components; only introduce client wrappers when necessary (e.g., sidebar drawer state on mobile).
- Centralize shared layout primitives in `src/components/layout/dashboard-shell.tsx` (new) for reuse.
- Reuse existing `buttonVariants`, `Card`, `Tabs`, etc., to avoid new dependencies.
- Keep data fetching identical; pass data props into new layout components.

---

## 9. Implementation Phases

| Phase | Focus                       | Key Deliverables                                                       |
| ----- | --------------------------- | ---------------------------------------------------------------------- |
| 1     | Layout Shell                | Sidebar component, updated `/dashboard` container, responsive behavior |
| 2     | Entry List Refresh          | Featured card styling, list rows, tabs UX polish                       |
| 3     | Insights & Supporting Cards | Updated stats card, helper text, empty states                          |
| 4     | Entry Route Polish          | Header redesign, sub-nav, consistent cards                             |
| 5     | QA & Polish                 | Cross-browser check, responsive QA, visual regression screenshots      |

---

## 10. Risks & Mitigations

| Risk                                            | Mitigation                                                |
| ----------------------------------------------- | --------------------------------------------------------- |
| Layout regressions break existing functionality | Keep business logic untouched, add snapshot QA checklist  |
| Placeholder links confuse users                 | Add `Coming Soon` tooltips and disable pointer events     |
| Responsive sidebar introduces hydration issues  | Use minimal client state hook and guard server boundaries |

---

## 11. Open Questions

1. Should the sidebar include organization logo/avatar? (Default to product logo unless provided.)
2. Do we surface counts for upcoming survey routes now (static) or later? (Recommend placeholders only.)
3. Are there brand color updates we should coordinate with marketing? (Pending confirmation.)

---

## 12. Next Steps

1. Review & approve this PRD with stakeholders.
2. Begin Phase 1 implementation on `feature/dashboard-ui-redesign`.
3. Create follow-up tickets for survey/settings actual pages when ready.
