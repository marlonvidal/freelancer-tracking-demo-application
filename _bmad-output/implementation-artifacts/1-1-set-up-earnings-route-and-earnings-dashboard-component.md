# Story 1.1: Set up /earnings route and EarningsDashboard component

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **developer**,
I want **a new `/earnings` route with the `EarningsDashboard` component**,
so that **users can access the dashboard via URL** (main navigation arrives in Story 1.2).

## Acceptance Criteria

1. **Given** the FreelanceFlow app is running  
   **When** I navigate to `/earnings`  
   **Then** the `EarningsDashboard` component renders successfully  
   **And** the visible page heading and browser tab title reflect the earnings dashboard (see Dev Notes for i18n and `document.title` pattern).

2. **Given** the user opened `/earnings` from another in-app route (e.g. `/`)  
   **When** I use the browser back button  
   **Then** I return to the previous route without errors  
   **And** persisted app data in `localStorage` (e.g. `freelancer-kanban-data`) is not cleared or corrupted by merely visiting `/earnings`.

3. **Given** the app has multiple routes  
   **When** I access `/earnings`  
   **Then** initial render meets **NFR-P5** — navigation completes in **&lt; 1 second** under normal conditions on a dev build (no heavy chart/data work in this story; keep the route and component lightweight).

4. **Out of scope for this story (do not implement):** “Earnings” link in the header/main navigation (Story **1.2**); filter `localStorage` key `earnings-dashboard-state` (Story **1.3**); charts, metrics, or earnings calculations (Epics **2–3**).

## Tasks / Subtasks

- [x] **Routing** (AC: 1, 3, 4)
  - [x] Add `Route path="/earnings"` in `src/App.tsx` **above** the catch-all `path="*"` route.
  - [x] Lazy-load the page component **optional** — acceptable either way if bundle stays small; NFR-P5 is the guardrail.
- [x] **Page component** (AC: 1, 2, 4)
  - [x] Create `src/pages/EarningsDashboard.tsx` (default export, single component file — match `Index` / `NotFound` pattern). [Source: `_bmad-output/planning-artifacts/prd.md` — technical assumptions]
  - [x] Wrap inner content with `AppProvider` the same way `Index` wraps `IndexContent`, so later stories can use `useApp()` without restructuring routes. [Source: `docs/architecture.md` — component hierarchy]
  - [x] Render a minimal dashboard shell: layout region + main heading; placeholder copy is fine but **must** use `useLanguage().t` — no raw English/Portuguese strings in JSX.
- [x] **i18n + document title** (AC: 1)
  - [x] Extend `Translations` in `src/context/LanguageContext.tsx` with new keys (e.g. `earningsDashboardHeading` and optional `earningsDashboardPlaceholder`); add **both** `en` and `pt` entries.
  - [x] Set `document.title` on mount to a translated earnings title; **on unmount**, restore the previous `document.title` (save to a ref before overwriting) so other routes are unaffected — do not add `react-helmet` unless the project already has it (it does not).
- [x] **Verification** (AC: 1–3)
  - [x] Manually verify `/earnings` loads, heading visible, tab title updates, back navigation works.
  - [x] Optional: small Vitest test that the route renders without throw if you add a stable `data-testid` on the root element — not required by epic but encouraged for regression safety.

### Review Findings

- [x] [Review][Patch] E2E AC1 asserts English-only `/earnings/i` on heading and tab title [`tests/e2e/earnings-dashboard-route.spec.ts` around lines 20–23] — with `app-language` = `pt`, copy is “Painel de ganhos” / “Ganhos — …”, so the test can fail or give false confidence vs “i18n” in the spec. Prefer `getByTestId('earnings-dashboard')`, seed `localStorage` language to `en` in `beforeEach`, or match translated strings per locale. **Resolved:** `beforeEach` seeds `en`; `getByTestId`; dedicated PT scenario.
- [x] [Review][Patch] Route import bypasses `@/` alias [`src/App.tsx:8`] — Dev Notes / project-context expect `@/pages/EarningsDashboard` for app imports; `Index` still uses `./pages` but new code should follow the stated alias rule. **Resolved:** `@/pages/EarningsDashboard`.
- [x] [Review][Patch] `document.title` effect overwrites the “save before first write” ref on every dependency run [`src/pages/EarningsDashboard.tsx` lines 9–16] — when `t.earningsDashboardDocumentTitle` changes (language toggle), cleanup restores `previousTitleRef` captured at the start of the prior run, which can flash a non–earnings title. Story asked to save once before overwriting and restore on unmount; use a ref set only on mount (or restore only in a true unmount path). **Resolved:** mount-only ref + cleanup; separate effect updates title when `t` changes.
- [x] [Review][Defer] NFR-P5 E2E uses wall-clock around `page.goto` [`tests/e2e/earnings-dashboard-route.spec.ts` lines 69–76] — deferred, pre-existing risk of flakes on slow CI/cold caches; not a functional bug in app code.

## Dev Notes

### Epic context (Epic 1: Dashboard Infrastructure)

- **Epic goal:** Foundational routing, navigation (1.2), and dashboard state persistence (1.3).
- **This story** only establishes the route and a real `EarningsDashboard` page shell. Follow-on stories add nav link, persistence, calculations, and charts.
- **Cross-story dependency:** Epic 2+ assume dashboard UI and `useApp` access on `/earnings` — use `AppProvider` at this route from the start.

### Technical requirements / guardrails

- **React Router v6** — `BrowserRouter` and `Routes` already in `App.tsx`; new routes must stay **above** `<Route path="*" element={<NotFound />} />`. [Source: `_bmad-output/project-context.md`]
- **Path alias:** import app code with `@/...` → `src/...`.
- **i18n:** Every user-visible string on this page needs `en` + `pt` keys in `LanguageContext.tsx`. [Source: `_bmad-output/project-context.md`]
- **Do not** persist new domain fields or change `AppState` / `lib/storage` for this story — persistence for dashboard filters is Story **1.3**.
- **Do not** add the header “Earnings” navigation item here — that is Story **1.2** (FR1).

### Architecture compliance

- SPA client-only; no backend. Routing is client-side only. [Source: `docs/architecture.md`]
- Align with documented target structure: page lives under `src/pages/EarningsDashboard.tsx`. [Source: `_bmad-output/planning-artifacts/prd.md`]

### Library / framework

- **react-router-dom** `^6.30.1` — standard `<Route>` + `element` prop.
- No new dependencies for title management; `useEffect` + ref is sufficient.

### File structure

| Action | Path |
|--------|------|
| Edit | `src/App.tsx` — register `/earnings` |
| Create | `src/pages/EarningsDashboard.tsx` — dashboard page (default export) |
| Edit | `src/context/LanguageContext.tsx` — new translation keys |

### Testing

- **Vitest** + Testing Library if adding unit coverage; colocate `*.test.tsx` or match repo conventions.
- **Playwright** E2E can wait unless you extend existing suites; manual check is acceptable for this foundation story.
- Prefer `getByRole('heading', { name: ... })` or `data-testid` over brittle selectors. [Source: `_bmad-output/project-context.md`]

### References

- [Epic 1 & Story 1.1 — `_bmad-output/planning-artifacts/epics.md` — Epic 1: Dashboard Infrastructure, Story 1.1]
- [FR2, NFR-P5, route/file placement — `_bmad-output/planning-artifacts/prd.md`]
- [Stack & routing rules — `_bmad-output/project-context.md`]
- [Component hierarchy — `docs/architecture.md`]

## Dev Agent Record

### Agent Model Used

Composer (GPT-5.2)

### Debug Log References

- E2E AC2: strict `toEqual` on seeded `localStorage` failed because `Index` normalizes state on load; assertion updated to require seeded task/column and `meta.atdd` preserved (aligns with “not cleared or corrupted”).

### Completion Notes List

- Registered `/earnings` before the catch-all route; added `EarningsDashboard` with `AppProvider`, i18n-only copy, `data-testid="earnings-dashboard"`, and `document.title` set/restored via ref.
- Extended `LanguageContext` with `earningsDashboardHeading`, `earningsDashboardPlaceholder`, `earningsDashboardDocumentTitle` (en + pt).
- ATDD: unskipped Playwright scenarios in `tests/e2e/earnings-dashboard-route.spec.ts`; adjusted localStorage assertion after green run.
- Added `src/pages/EarningsDashboard.test.tsx` (Vitest smoke).

### File List

- `src/App.tsx`
- `src/context/LanguageContext.tsx`
- `src/pages/EarningsDashboard.tsx`
- `src/pages/EarningsDashboard.test.tsx`
- `tests/e2e/earnings-dashboard-route.spec.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-04-03 — Story 1.1 implemented: `/earnings` route, dashboard shell, i18n + tab title, E2E green, sprint status → review.
