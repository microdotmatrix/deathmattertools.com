# PRD: Dashboard ↔ Entry View Transitions

## 1. Overview

This document defines the initial scope and implementation strategy for adopting **React9s experimental View Transitions component** to add subtle, high-quality animations between the **Dashboard** and **Entry** routes.

**Primary goal:** When a user opens an entry from the dashboard, the **entry thumbnail image** and **entry name** should visually persist and smoothly morph into their new positions on the entry page, rather than popping abruptly.

This PRD focuses on a **single, well-scoped shared-element transition** as a foundation for future view transitions across the app.

## 2. Motivation & Goals

- **Reduce cognitive load:** Preserve context as users move from the high-level workspace (Dashboard) into a specific entry.
- **Increase perceived polish:** Introduce motion that feels premium but restrained, matching the existing visual language.
- **Respect performance & accessibility:** Avoid jank, and respect user motion preferences.
- **Align with React guidance:** Implement using **React9s ViewTransition component** and the recommended **View Transition Class** styling strategy instead of low-level `view-transition-name` hacks.

### In-scope

- **Routes:**
  - `src/app/dashboard/page.tsx` (`DashboardPage`)
  - `src/app/[entryId]/page.tsx` (`EntryEditPage` / `EntryEditContent`)
- **Elements to transition:**
  - The entry **thumbnail** (image)
  - The entry **name** (title text)
- **Triggers:**
  - Opening an entry from:
    - The **Featured Entry** card (`FeaturedEntryCard`)
    - The **Entry list rows** (`EntryRow` in `EntryList`)
- **Mechanics:**
  - Use React9s `<ViewTransition>` component (experimental) to define shared-element transitions between dashboard and entry page.
  - Rely on Next.js App Router9s use of React transitions (e.g., navigation done via `Link`) as the underlying `Transition` trigger.

### Out-of-scope (for this PRD)

- Animations for:
  - Other routes (e.g., image create flows, auth, settings).
  - Non-critical UI (buttons, stats cards, etc.).
- Complex "page sliding" or full-screen navigation transitions.
- Custom router implementations beyond Next.js App Router.
- Browser-specific CSS View Transition tuning beyond a minimal, tasteful default.

## 3. Current State (as of this PRD)

### 3.1 Next.js configuration

File: `next.config.ts`

- React features:
  - `reactCompiler: true`
  - `cacheComponents: true` with per-profile `cacheLife` configuration.
- Experiments:
  - `experimental.viewTransition: true` (Next.js-level experimental View Transitions toggle)
  - `experimental.useLightningcss: true`
  - `experimental.authInterrupts: true`
  - `experimental.optimizePackageImports` configured.

Implication: the app is already **opted into Next9s experimental viewTransition support**, which integrates with the browser9s CSS View Transitions API. This PRD layers **React9s ViewTransition component** on top, for more precise control over **what** animates.

### 3.2 Dashboard route

File: `src/app/dashboard/page.tsx`

Key elements:

- **Featured entry hero** (`FeaturedEntryCard`):
  - Large `Image` displaying `entry.image` (or a default portrait).
  - Prominent `Link href={"/" + entry.id}` containing the entry name (`{entry.name}`).
  - Actions including an "Open" button / "View Entry" link which also navigate to `/{entry.id}`.
- **Entry list** (`EntryList` → `EntryRow`):
  - Thumbnail `Image` for each entry.
  - `Link href={"/" + entry.id}` wrapping the entry name text.

These give us **two potential source elements** for shared transitions:

- Source A: Featured entry image + title.
- Source B: List row thumbnail + title.

### 3.3 Entry route

File: `src/app/[entryId]/page.tsx`

Key elements:

- `EntryEditPage` fetches access and data, then renders:
  - `<EntryEditContent ... />` inside a `Suspense` boundary.
- `EntryEditContent` layout:
  - "Back to Dashboard" button.
  - A primary `Card` containing:
    - An optional `entry.image` rendered as a square image.
    - Either an editable `EntryForm` or a view-only details panel.
  - Additional cards for details, photos, feedback, obituaries, etc.

There is currently **no dedicated hero header** purely for the entry image + name. Instead, the image is on the left and the main name field is either in the form or in a read-only layout.

Implication: for the best shared-element effect we may want to **designate a small, stable header region** on the entry page where the image + name live, even if the form/view-only layout stays mostly unchanged.

## 4. React View Transitions: Best-Practice Notes

(References from React.dev View Transitions docs via Context7.)

- **What they do:** View Transitions animate UI changes that happen inside a **React Transition** (`startTransition`, Suspense, deferred updates, etc.).
- **How we declare them:**
  - Wrap candidates in `<ViewTransition>`.
  - Use the `name` prop to participate in **shared element transitions** (matching names across removed and inserted subtrees).
- **Activation triggers:**
  - `enter`: ViewTransition component gets inserted.
  - `exit`: ViewTransition component gets removed.
  - `update`: Mutations inside a ViewTransition boundary or its size/position change.
  - `share`: A named ViewTransition disappears in one subtree and appears in another within the same Transition (used for shared elements between screens).
- **Styling guidance:**
  - Prefer **View Transition Classes** via props like `enter`, `exit`, `update`, and `share`.
  - Avoid directly using `view-transition-name` and `::view-transition-*` selectors.
- **Scope:**
  - Meant for **navigation, expansion, reordering**, not every small micro-animation.
  - Should coexist with other CSS/JS animations.

## 5. UX Requirements

### 5.1 Primary flow: Dashboard → Entry

When a user clicks an entry on the dashboard (either from the featured card or from the list):

- **Before:**
  - On Dashboard, the entry has a recognizable thumbnail and name.
- **Action:**
  - User navigates via a standard `Link` or button that leads to `/{entry.id}`.
- **Transition:**
  - The thumbnail **visually persists**, scaling and moving from its dashboard position to its entry-page position.
  - The entry name **persists**, moving and resizing into its primary place on the entry page (e.g., hero header or name field area).
  - Other content can cross-fade in/out using the default view transition; no elaborate choreography needed.
- **After:**
  - On the entry page, the user should clearly see that they are viewing the **same person** they clicked on.

### 5.2 Optional flow: Entry → Dashboard

For this first iteration, the back navigation experience can be **simple**, but ideally:

- Tapping "Back to Dashboard" produces a **reverse-feeling** motion where the hero image/name transition back toward their dashboard positions.
- If this adds too much complexity for v1, we can accept a default fade and revisit later.

### 5.3 Accessibility & motion

- Respect `prefers-reduced-motion`: if enabled, **disable or greatly reduce** these transitions (e.g., immediate state changes or minimal fades only).
- Ensure that transitions:
  - Do not obscure focus outlines.
  - Do not interfere with keyboard navigation.
  - Do not delay screen-reader-meaningful updates.

## 6. Technical Design

### 6.1 High-level architecture

1. **Global setup (App Router):**
   - Confirm that route navigations are already occurring inside React transitions (Next.js App Router typically does this for Suspense-enabled routes).
   - Ensure `experimental.viewTransition` remains enabled in `next.config.ts`.

2. **Shared element mapping:**
   - Use React9s `<ViewTransition name="...">` to wrap **both source and target elements** for:
     - Entry thumbnail.
     - Entry name.
   - Adopt a stable naming scheme such as:
     - Thumbnail: `entry-${entry.id}-thumb`
     - Name: `entry-${entry.id}-name`

3. **Where to wrap elements:**
   - **Dashboard (sources):**
     - `FeaturedEntryCard`: wrap the hero `Image` and the title `Link` in ViewTransitions.
     - `EntryRow`: wrap the thumbnail `Image` and the entry name `Link` in ViewTransitions.
   - **Entry page (targets):**
     - Designate a central header region (e.g., within `EntryEditContent`) that always renders:
       - A primary entry image (or placeholder).
       - A primary name heading.
     - Wrap these in ViewTransitions with the same names as their dashboard counterparts.

4. **Styling via View Transition Classes:**
   - Define a small set of CSS classes that describe how these elements animate:
     - E.g., `vt-entry-share` for the shared-element morph.
     - Optional separate classes for enter/exit/update if needed.
   - Connect these classes via ViewTransition props (`share`, `default`) rather than `view-transition-name` attributes.

### 6.2 Data & layout considerations

- **Consistency of structure:**
  - Both source and target should be visible and rendered when transitions run.
  - The entry page target image/name should be present even when the form is in different modes (edit vs view-only).
- **Suspense boundaries:**
  - The entry route uses `Suspense` around `EntryEditContent`.
  - Ensure that the **ViewTransition wrapping the target elements lives in a part of the tree that is reliably present** when the navigation resolves, to avoid odd animations from fallback content.
- **Server vs client components:**
  - We may need to introduce a small client wrapper for ViewTransition usage in layouts that are currently server components.
  - Keep any new client components **narrowly scoped** to motion concerns.

### 6.3 Progressive enhancement & failure modes

- Browsers without View Transition support or with the feature disabled should:
  - Continue to navigate as usual with no errors.
  - Show at most the existing subtle fades/loads.
- If React9s ViewTransition is not available in a given environment:
  - The app should fall back to static elements without throwing.

## 7. Implementation Plan (Phased)

### Phase 1  Foundation & spike

- Confirm React / Next.js versions and whether React9s ViewTransition component is available in the current runtime.
- Identify exactly where to place **client components** (if needed) so that:
  - ViewTransitions can be used around dashboard and entry header elements.
  - We avoid over-client-ifying large trees unnecessarily.
- Create a small internal playground (could be a non-routed component) to verify basic ViewTransition behaviors in this codebase.

**Exit criteria:**

- Basic ViewTransition animations can be triggered in a controlled environment.
- We have a clear pattern for where client components will live.

### Phase 2  Dashboard instrumentation

- Wrap the **featured entry** image and name with ViewTransitions (source A).
- Wrap the **entry list row** thumbnail and name with ViewTransitions (source B).
- Ensure the navigation actions (`Link`, buttons) still use standard Next.js App Router links.

**Exit criteria:**

- When an entry is opened, the dashboard-side elements are properly tagged as shared-element sources.

### Phase 3  Entry page target & layout adjustment

- Introduce a **stable entry header region** in `EntryEditContent` that always renders:
  - A primary image for the entry.
  - A primary name text element.
- Wrap these in ViewTransitions with the same naming scheme used on the dashboard.
- Verify that this header still works well with existing layout (form, cards, feedback, etc.).

**Exit criteria:**

- Opening an entry from the dashboard produces a **visible morphing effect** of thumbnail + name into the entry header.
- The rest of the page content fades or appears normally without visual glitches.

### Phase 4  Styling, accessibility, and polish

- Introduce **View Transition Classes** to fine-tune:
  - Duration and easing.
  - Slight scale/translation behavior.
- Honor `prefers-reduced-motion` by:
  - Disabling or reducing animation intensity based on the media query.
- Test for:
  - Keyboard navigation and focus stability.
  - Screen-reader announcements.

**Exit criteria:**

- Transitions feel smooth and respectful of motion preferences.
- No regression in accessibility or keyboard flow.

### Phase 5  QA & rollout strategy

- QA scenarios:
  - Open from featured entry vs from list rows.
  - Entries with and without custom images.
  - Slow network / loading states (ensure Suspense fallbacks do not produce jarring transitions).
  - Different viewport sizes (mobile vs desktop).
- Decide on rollout strategy:
  - Optionally gate under an environment flag (e.g., `NEXT_PUBLIC_ENABLE_VIEW_TRANSITIONS`).
  - If issues arise, allow a quick toggle back to non-animated behavior.

**Exit criteria:**

- No significant regressions observed.
- Team is comfortable enabling view transitions in production.

## 8. Risks & Open Questions

- **API stability:** React View Transitions are experimental; future React versions may adjust the API surface.
- **Interaction with Next.js experimental.viewTransition:** Need to ensure there are no surprising conflicts between React-level transitions and Next9s integration with the browser9s CSS View Transitions.
- **Suspense timing:** If data fetching causes long delays, the default cross-fade and shared morph may feel disconnected; we may need to refine where the ViewTransition boundaries sit relative to async loading.
- **Client/server boundaries:** We must avoid inadvertently converting large, performance-critical server components into client components solely for motion.

## 9. Success Metrics

Subjective but observable metrics for this initial iteration:

- **Perceived smoothness:** Team members report that transitioning from dashboard to entry feels more cohesive and pleasant.
- **Zero functional regressions:** No reports of broken navigation, layout shifts, or focus issues attributable to the transitions.
- **Low maintenance overhead:** The ViewTransition usage is localized and understandable (no sprawling motion logic across the tree).
