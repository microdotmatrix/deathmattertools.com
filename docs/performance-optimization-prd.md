---
title: Performance & Bundle Optimization PRD
status: Draft
owners: Engineering
last_updated: 2025-12-04
---

## 1) Objectives

- Reduce client JS shipped (bundle size + hydration work) while keeping interactivity.
- Shift rendering to the server by default; isolate client code to the smallest leaves.
- Improve perceived performance (TTFB/LCP/CLS) and maintain or exceed current Lighthouse mid-90s.
- Establish measurement and guardrails to prevent regressions.

## 2) Current State (evidence)

- App Router with global Header/Footer; Suspense around Header in root layout.
- `reactCompiler` enabled; `optimizePackageImports` for lucide, date-fns, radix, motion.
- Dashboard shell is a large client component wrapping many routes.
- Entry edit and dashboard pages mix async server code with Suspense and client-heavy children.
- Obituary flows rely on multiple client-only/dynamic components (TipTap editor, AI chat, comments) with `ssr: false`.
- AI chat bubble and TipTap editor pull in heavy dependencies (AI SDK, Jotai, motion).
- Home page is server-rendered but sections likely include client children and animations.

## 3) Risks / Opportunities

- Large client shells force hydration across dashboard pages.
- `ssr: false` dynamic imports disable server rendering and increase client payload.
- Editor/chat bundles are heavyweight; loaded even when not actively editing/chatting.
- Global layout components may contain client hooks; reduces tree-shaking of server output.
- Missing explicit caching directives; repeated fetches and limited ISR/remote caching.
- No real-user monitoring to validate improvements; rely on Lighthouse only.

## 4) Strategy & Phases

**Phase A: Measure & profile**

- Add `useReportWebVitals` to send CWV to analytics/RUM.
- Run `next build --profile` (Turbopack) and a bundle analyzer; record per-route client JS.
- Identify top offenders (TipTap, AI chat, DashboardShell, marketing animations).

**Phase B: Rendering boundaries**

- Make server components the default; only promote to client when necessary.
- Refactor `DashboardShell` into a server layout; move sidebar toggle/path logic into a small client leaf.
- Audit Suspense usage; avoid wrapping client-only trees without meaningful fallbacks.

**Phase C: Heavy feature isolation**

- Keep TipTap/editor and AI chat behind `next/dynamic`; load only on intent/visibility.
- Split TipTap extensions; use a lightweight read-only renderer for viewers.
- Defer chat bubble mount until user opens it; remove default-expanded behavior unless required.
- Lazy-load non-critical marketing animations/carousels.

**Phase D: Data fetching, caching, revalidation**

- Add `revalidate`/`cache` directives per route; prefer static/ISR where acceptable.
- Use `cache()` for repeated fetchers; consider `use cache: remote` for expensive dynamic calls.
- Avoid `force-dynamic` unless strictly needed; use tag-based revalidation for comments/AI updates.

**Phase E: UI & assets**

- Ensure per-icon imports (lucide); verify shadcn components stay server by default.
- Use `next/image` with `sizes` and `priority` only for LCP media; reduce font variants.
- Respect prefers-reduced-motion; keep motion libs out of server components.
- Lazy-load AI Elements UI where non-essential.

**Phase F: Guardrails**

- CI check to fail if per-route client bundle exceeds thresholds (from analyzer output).
- ESLint rule to flag unintended `use client` at the top level.
- Script/codemod to list `ssr: false` dynamic imports with justification.

## 5) Recommendations by Area

- **Layouts & shells:** Server-ify DashboardShell; only sidebar trigger/pathname in a tiny client component. Keep Header/Footer server-only if possible.
- **Obituary flows:** Keep viewer SSR-friendly; drop `ssr: false` if no browser-only APIs. Gate TipTap editor load on explicit "Edit" action; preload on hover/focus. Gate AI chat on user intent; stream responses via RSC where feasible.
- **Dynamic rendering:** Use `dynamic = "force-dynamic"` sparingly. Prefer static/ISR with client refetch for freshness-sensitive data.
- **Data layer:** Memoize expensive queries with `cache()`; leverage prepared statements (Neon/Drizzle). Add segment configs (`revalidate`, `fetchCache`) per route.
- **Assets:** Audit Hero/marketing effects; lazy-load heavy motion. Trim fonts; confirm Tailwind v4 JIT purges unused styles.

## 6) Success Metrics

- > 20% reduction in client JS for heavy routes (dashboard, entry, obituary).
- LCP p75 < 2.5s; TTFB stable or improved.
- 80%+ of app directory components remain server by LOC; fewer top-level `use client` boundaries.
- Maintain Lighthouse mid-90s and Vercel Analytics CWV in "good" range.

## 7) Work Plan (sequenced)

1. Baseline: add web vitals reporter + bundle analyzer; snapshot current per-route JS and CWV.
2. Layout refactor: server-ify DashboardShell and shared shells; isolate client leaves.
3. Obituary/AI flows: intent-based loading for editor/chat; SSR-friendly viewer.
4. Caching pass: add `revalidate`/`cache` directives; remove unnecessary `force-dynamic`; add tag revalidation where needed.
5. UI/asset trim: icons/fonts/images/animations audit and fixes.
6. Guardrails: CI bundle threshold, `use client` lint, `ssr: false` audit script.
7. Re-measure: rerun Lighthouse/Analytics and bundle analyzer; compare against baseline.

## 8) Open Questions

- Which routes are highest traffic and should be prioritized for bundle trimming?
- Data freshness requirements for dashboard stats/comments (revalidate interval vs dynamic)?
- Marketing pages OK with aggressive static generation + ISR?
