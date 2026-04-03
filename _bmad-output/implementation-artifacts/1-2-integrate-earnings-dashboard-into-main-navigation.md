# Story 1.2: Integrate Earnings Dashboard into Main Navigation

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **user**,
I want **an "Earnings" link in the main navigation**,
so that **I can easily access the dashboard from any page**.

## Acceptance Criteria

1. **Given** I am on any page in FreelanceFlow  
   **When** I look at the main navigation (header)  
   **Then** I see an "Earnings" link or tab (FR1)  
   **And** the link text is translated via `useLanguage().t` — not hardcoded English.

2. **Given** I click the "Earnings" link  
   **When** the page loads  
   **Then** I am on the `/earnings` route and the `EarningsDashboard` component is displayed.

3. **Given** the "Earnings" link is active (I am on `/earnings`)  
   **When** I view the navigation  
   **Then** the link is visually highlighted to indicate the current page.

4. **Given** I am on the Earnings Dashboard  
   **When** I click a link back to the Kanban board (the brand/logo or a "Board" link)  
   **Then** I return to `/` without errors or data loss.

5. **Given** the navigation renders on both pages  
   **When** I view the header on any viewport ≥ 320px  
   **Then** the navigation links are usable and do not break the layout. On small screens, the "Earnings" link must remain accessible (it may collapse to icon-only or be in a compact layout).

6. **Out of scope for this story:** Filter state persistence (Story **1.3**); charts, metrics, or earnings calculations (Epics **2–3**); the `EarningsDashboard` component internals beyond receiving the nav link.

## Tasks / Subtasks

- [x] **Add i18n keys for navigation** (AC: 1, 5)
  - [x] Add translation keys to `Translations` interface and both `en`/`pt` objects in `src/context/LanguageContext.tsx`: `earningsNavLink` (en: `"Earnings"`, pt: `"Ganhos"`), and `boardNavLink` (en: `"Board"`, pt: `"Quadro"`).
- [x] **Refactor Header into shared navigation** (AC: 1, 2, 3, 4, 5)
  - [x] Extract the Header into a component that can render on **both** `/` and `/earnings` routes. Currently `Header` is only used inside `IndexContent` and depends on `onAddTask` prop and `useApp()` — evaluate the best approach:
    - **Option A (recommended):** Add navigation links (using `NavLink` from `src/components/NavLink.tsx`) directly into the existing `Header` component, alongside the logo. Make `Header` usable on the earnings page too by conditionally rendering the "Add Task" button and Kanban-specific stats only when on `/` (use `useLocation()` or pass a prop). This keeps the brand, language toggle, and dark-mode toggle shared.
    - **Option B:** Create a new shared `AppHeader` or `NavigationBar` component for nav-only concerns and keep the current `Header` for Kanban-specific controls.
  - [x] The nav links should use the `NavLink` component from `src/components/NavLink.tsx` which wraps `react-router-dom`'s `NavLink` and supports `activeClassName` for active-state highlighting.
  - [x] Active link styling: use a visual indicator such as underline, bold weight, or accent color on the active `NavLink`. Leverage existing Tailwind tokens (`primary`, `accent`, `border`) and `cn()` from `@/lib/utils`.
- [x] **Integrate Header/nav on EarningsDashboard page** (AC: 1, 2, 4)
  - [x] Add the shared header/nav to `src/pages/EarningsDashboard.tsx`. The `Header` currently calls `useApp()` — since `EarningsDashboard` already wraps in `<AppProvider>`, the hook will resolve. If Kanban-specific controls (Add Task, revenue stats) are conditionally hidden, the header works on both pages.
- [x] **Responsive layout** (AC: 5)
  - [x] On viewports < 640px (`sm` breakpoint), the nav links may need compact treatment. The existing header already hides some items with `hidden sm:flex` / `hidden sm:inline`. Apply the same pattern: show icon-only or abbreviated nav on small screens.
- [x] **Verification** (AC: 1–5)
  - [x] Navigate to `/` — see "Board" and "Earnings" links; "Board" highlighted.
  - [x] Click "Earnings" — navigate to `/earnings`; "Earnings" highlighted; dashboard renders.
  - [x] Click logo or "Board" — back to `/`; no data loss.
  - [x] Toggle language to PT — links show "Quadro" and "Ganhos".
  - [x] Resize to mobile — links remain accessible.

## Dev Notes

### Epic context (Epic 1: Dashboard Infrastructure)

- **Epic goal:** Foundational routing, navigation (this story), and dashboard state persistence (1.3).
- **Story 1.1 (done):** Established `/earnings` route, `EarningsDashboard` component with `AppProvider`, i18n keys, and `document.title` management. The route and page shell are fully working.
- **This story** adds the nav link so users can discover and access the dashboard without typing the URL.
- **Story 1.3 (next):** Filter state persistence in `localStorage` — do NOT implement persistence here.

### Technical requirements / guardrails

- **React Router v6** — `BrowserRouter` and `Routes` in `App.tsx`; routes are already defined. This story adds **navigation links**, not new routes.
- **`NavLink` component** exists at `src/components/NavLink.tsx` — use it for route-aware active-state links. It wraps `react-router-dom`'s `NavLink` and accepts `className`, `activeClassName`, and `pendingClassName` props.
- **Path alias:** import app code with `@/...` → `src/...`.
- **i18n:** Every user-visible string needs `en` + `pt` keys in `LanguageContext.tsx`. The nav link text MUST use `t.<key>` — never hardcode.
- **Do not** add routes, change `AppState`/persistence, or modify the `EarningsDashboard` component internals (beyond adding the shared header).
- **Do not** create new UI primitives — check `src/components/ui/` first (49 shadcn components available including `navigation-menu.tsx`).

### Architecture compliance

- SPA client-only; no backend. Navigation is purely client-side via react-router-dom. [Source: `docs/architecture.md`]
- The `Header` component currently lives at `src/components/Header.tsx` and is used only by `IndexContent` (`src/pages/Index.tsx`). It depends on `useApp()` (from `AppContext`) and `useTimer()`, plus receives `onAddTask` callback. [Source: `src/components/Header.tsx`]
- Both `Index` and `EarningsDashboard` wrap their content in `<AppProvider>`, so `useApp()` is available on both pages. [Source: `src/pages/Index.tsx`, `src/pages/EarningsDashboard.tsx`]

### Current Header structure (critical for implementation)

The `Header` component (`src/components/Header.tsx`) currently renders:
- **Left side:** Logo (Clock icon + "FreelanceFlow" brand), active timer display
- **Right side:** Revenue stats (`$totalRevenue`, billable hours), "Add Task" button, language dropdown, dark mode toggle
- The Header takes `onAddTask: () => void` as a required prop

**Implementation approach for adding nav:**
- Add nav links between the logo and the timer display (or right after the logo section).
- Make `onAddTask` optional (`onAddTask?: () => void`) and conditionally render the "Add Task" button and revenue/billable stats only when `onAddTask` is provided (i.e., on the Kanban page).
- On the earnings page, render the Header without `onAddTask` — nav links, language toggle, and dark mode toggle still show.

### Library / framework

- **react-router-dom** `^6.30.1` — `NavLink` for active-state aware links (already wrapped in `src/components/NavLink.tsx`).
- **lucide-react** `^0.462.0` — icons for nav links if needed (e.g., `LayoutDashboard`, `BarChart3`, `Kanban`).
- No new dependencies required.

### File structure

| Action | Path | Notes |
|--------|------|-------|
| Edit | `src/context/LanguageContext.tsx` | Add `earningsNavLink` and `boardNavLink` translation keys |
| Edit | `src/components/Header.tsx` | Add nav links using `NavLink`; make `onAddTask` optional; conditionally render Kanban-specific controls |
| Edit | `src/pages/EarningsDashboard.tsx` | Add `Header` component to the dashboard page layout |
| Edit | `src/pages/Index.tsx` | No change expected if Header prop becomes optional (still pass `onAddTask`) |

### Testing

- **Vitest** + Testing Library: add/extend unit test for Header to verify nav links render and active state works. Colocate as `src/components/Header.test.tsx` or similar.
- **Playwright** E2E: verify clicking "Earnings" link navigates to `/earnings`, clicking "Board" goes back to `/`. Use `getByRole('link', { name: ... })` or `data-testid`. Import from `tests/support/fixtures` and call `blockKnownThirdPartyHosts(page)` before `page.goto()`.
- Prefer accessible selectors: `getByRole`, `data-testid` — not CSS selectors or brittle text matching. [Source: `_bmad-output/project-context.md`]

### Previous Story Intelligence (Story 1.1)

Key learnings from Story 1.1 implementation:

1. **Import alias:** Story 1.1 review found that the initial import in `App.tsx` used relative `./pages` instead of `@/pages` — new code should use `@/` alias consistently.
2. **i18n in tests:** E2E tests initially asserted English-only text which would fail in PT locale. Fix: seed `localStorage` language to `en` in `beforeEach`, or use `data-testid` selectors, or match translated strings per locale.
3. **`document.title` effect:** Use mount-only ref + cleanup pattern (not per-render ref capture). This is already implemented correctly in the dashboard — no changes needed here.
4. **Test patterns established:**
   - `data-testid="earnings-dashboard"` on root element
   - `blockKnownThirdPartyHosts(page)` before `page.goto()`
   - Vitest smoke test at `src/pages/EarningsDashboard.test.tsx`
   - E2E at `tests/e2e/earnings-dashboard-route.spec.ts`

### Git intelligence

Recent commits show story 1.1 work pattern:
- `de0d5d9` — "Implemented story 1.1" (added route, page component, i18n keys, tests)
- Files created/modified: `src/App.tsx`, `src/pages/EarningsDashboard.tsx`, `src/context/LanguageContext.tsx`, `src/pages/EarningsDashboard.test.tsx`, `tests/e2e/earnings-dashboard-route.spec.ts`

### References

- [Epic 1 & Story 1.2 — `_bmad-output/planning-artifacts/epics.md` — Epic 1: Dashboard Infrastructure, Story 1.2]
- [FR1 (nav access), FR2 (route) — `_bmad-output/planning-artifacts/prd.md`]
- [Stack, routing rules, i18n rules — `_bmad-output/project-context.md`]
- [Component hierarchy, Header spec — `docs/architecture.md`]
- [Previous story learnings — `_bmad-output/implementation-artifacts/1-1-set-up-earnings-route-and-earnings-dashboard-component.md`]
- [NavLink component — `src/components/NavLink.tsx`]
- [Current Header — `src/components/Header.tsx`]

## Dev Agent Record

### Agent Model Used

claude-4.6-opus-high (Cursor IDE)

### Debug Log References

No debug issues encountered. All tests passed on first implementation attempt.

### Completion Notes List

- Added `earningsNavLink` and `boardNavLink` i18n keys to `Translations` interface and both `en`/`pt` translation objects
- Chose Option A: refactored existing `Header` component to support shared navigation across both pages
- Made `onAddTask` prop optional; Kanban-specific controls (Add Task button, revenue stats, active timer) render only when `onAddTask` is provided
- Added `<nav role="navigation">` with two `NavLink` components ("Board" → `/`, "Earnings" → `/earnings`) between logo and timer
- Active link styling uses `font-bold border-b-2 border-primary` for clear visual highlighting
- Used `end` prop on the "/" NavLink to prevent it matching `/earnings`
- Responsive: on screens < `sm` (640px), nav links show Lucide icons (`Kanban`, `BarChart3`) with `sr-only` text for accessibility; on larger screens, translated text is visible
- Integrated `<Header />` (without `onAddTask`) into `EarningsDashboard` page
- All 8 E2E tests unskipped and passing; all 29 E2E tests pass (zero regressions); all 39 unit tests pass

### File List

- `src/context/LanguageContext.tsx` — added `earningsNavLink` and `boardNavLink` to interface + en/pt translations
- `src/components/Header.tsx` — added nav links, made `onAddTask` optional, conditional Kanban controls
- `src/pages/EarningsDashboard.tsx` — added `Header` component import and rendering
- `tests/e2e/earnings-nav-integration.spec.ts` — removed `test.skip()` from all 8 tests

## Code Review Record

### Review Date
2026-04-03

### Review Model
claude-4.6-opus-high (Cursor IDE)

### Findings Summary

| Category | Count |
|----------|-------|
| patch (auto-fixed) | 1 |
| defer | 3 |
| dismissed | 1 |
| decision-needed | 0 |
| **Total** | **5** |

### Findings Detail

#### BH-3 — `<nav>` accessibility (patch — auto-fixed)
- **File:** `src/components/Header.tsx`
- **Issue:** `role="navigation"` is redundant on a `<nav>` element and no `aria-label` was present to distinguish this navigation landmark.
- **Fix applied:** Removed `role="navigation"`, added `aria-label="Main"`.

#### BH-1 — Variable shadowing of `t` (defer)
- **File:** `src/components/Header.tsx`
- **Issue:** Arrow function parameters `t` in `.find()`, `.filter()`, `.reduce()` shadow the outer `t` from `useLanguage()`. Pre-existing issue, not introduced by this story.

#### BH-2 — Unnecessary computation on earnings page (defer)
- **File:** `src/components/Header.tsx`
- **Issue:** `totalRevenue` and `totalBillableHours` are computed even when `onAddTask` is undefined (earnings page). Minor; computation is cheap.

#### BH-4 — Import path inconsistency in App.tsx (defer)
- **File:** `src/App.tsx`
- **Issue:** Mixed relative (`./pages/Index`) and alias (`@/pages/EarningsDashboard`) imports. Pre-existing, flagged in story 1.1 review.

#### EC-3 — Active timer hidden on earnings page (dismissed)
- **File:** `src/components/Header.tsx`
- **Issue:** Timer display is gated on `onAddTask`, hiding it on the earnings page. Matches spec intent — Kanban-specific controls should be hidden.

### Test Results After Fix
- **Unit tests (Vitest):** 39/39 passed
- **E2E tests (Playwright):** 29/29 passed
- **Regressions:** None

### Final Status
All findings resolved or deferred. Story status set to **done**.
