# Story 1.3: Implement earnings dashboard state persistence

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **my filter selections to persist when I leave and return to the dashboard**,
so that **I don't lose my analysis context between sessions**.

## Acceptance Criteria

1. **Given** I am on the Earnings Dashboard  
   **When** I set a date range (e.g., Last 30 days) and a billable filter  
   **Then** my selections are saved to `localStorage` under the key **`earnings-dashboard-state`** (exact key string from epics/architecture expectations).

2. **Given** I have saved dashboard filter state  
   **When** I navigate away from the dashboard and later return via the `/earnings` route  
   **Then** my previous **date range** and **billable filter** settings are restored (FR40, FR41, FR3, FR14).

3. **Given** I have saved dashboard filter state  
   **When** I close the browser entirely and later open FreelanceFlow and go to `/earnings`  
   **Then** my filter state still matches what I saved (FR3, FR40, FR41).

4. **Given** I reset application data using the same mechanism as clearing Kanban storage  
   **When** I reload the dashboard  
   **Then** the dashboard shows **default** filter state (nothing “stuck” from old persisted earnings preferences) (FR42).  
   **Implementation hint:** extending `clearState()` in `src/lib/storage.ts` to also remove the earnings dashboard key is the canonical way to keep behavior aligned with “clear app data” for this SPA.

5. **Additional product coverage (same story, same storage):** Persist **selected chart view** (Customer / Project / Tag) for FR39 in the **same** `earnings-dashboard-state` document so Epic 3 UI can read/write it without introducing a second key. It is acceptable if **no chart switcher UI** exists yet—default to **`customer`** and expose updaters via context/hook for later stories.

6. **Out of scope for this story:** Full **date picker**, **presets UX**, and polished **billable toggle** from Epic 4 (replace interim controls when those stories land); earnings **calculations** and **charts** (Epics 2–3); changing the shape of **`freelancer-kanban-data`** / core `AppState` beyond coordinated `clearState()` behavior.

## Tasks / Subtasks

- [x] **Define persisted model + storage helpers** (AC: 1, 5)
  - [x] Add a small module (e.g. `src/lib/earnings-dashboard-storage.ts`) exporting:
    - Constant `EARNINGS_DASHBOARD_STORAGE_KEY = 'earnings-dashboard-state'`.
    - Type `EarningsDashboardPersistedState` (or similar) with at least:
      - **Date range:** support both **preset** enum (e.g. `last30`, `quarter`, `year`, `all`) **and/or** explicit `{ startMs, endMs }` so Epic 4 can evolve without breaking serialization—pick one approach **documented in code** and stay consistent with timestamps as **epoch ms** per project rules. [Source: `_bmad-output/project-context.md` — Timestamps]
      - **Billable filter:** `'all' | 'billable' | 'nonBillable'` (maps to FR15–FR17 intent).
      - **Active chart:** `'customer' | 'project' | 'tag'` (FR39).
      - Optional: `version: number` for future migrations of the JSON shape.
    - `loadEarningsDashboardState(): EarningsDashboardPersistedState` — `try/catch`, corrupt/missing JSON → **defaults**.
    - `saveEarningsDashboardState(state: EarningsDashboardPersistedState): void` — `try/catch`, no throw into UI.
  - [x] Do **not** store non-serializable values; keep payload small.

- [x] **React integration: context or hook** (AC: 1–3, 5)
  - [x] Provide `EarningsDashboardStateProvider` (recommended under `src/context/` or colocate under `src/components/EarningsDashboard/` if you introduce that folder) **inside** `EarningsDashboard` tree (below `AppProvider` so both coexist as today).
  - [x] Initialize state from `loadEarningsDashboardState()` on mount.
  - [x] **Persist on change** — either debounced `save` (e.g. 100–300ms) or save in `useEffect` when state changes; avoid synchronous write on every keystroke if Epic 4 adds text inputs later.
  - [x] Expose setters: `setDateRangeSelection`, `setBillableFilter`, `setActiveChartView` (names flexible but keep public API obvious for Epic 3/4).

- [x] **Minimal UI on `EarningsDashboard` to satisfy AC1** (AC: 1–3)
  - [x] Because Epic 4 controls are not implemented yet, add **minimal, accessible** controls (e.g. shadcn `Select` + labels) for:
    - Date range preset (must include at least **Last 30 days** as an example from epic text).
    - Billable filter (all / billable / non-billable).
  - [x] All **visible strings** via `useLanguage().t` — add keys to **both** `en` and `pt` in `LanguageContext.tsx`. [Source: `_bmad-output/project-context.md` — i18n]
  - [x] Document in code comments that these controls are **interim** until Epic 4 replaces them; **do not** rip out persistence when UI is swapped.

- [x] **`clearState()` coordination** (AC: 4)
  - [x] Update `clearState()` in `src/lib/storage.ts` to also `localStorage.removeItem(EARNINGS_DASHBOARD_STORAGE_KEY)` (import key from earnings module to avoid typos).
  - [x] Ensure no circular dependency issues (extract key to a tiny `src/lib/earnings-dashboard-storage-key.ts` if needed).

- [x] **Tests** (AC: 1–4)
  - [x] **Vitest:** unit tests for load/save (corrupt JSON, missing key, round-trip). Prefer mocking `localStorage` via standard jsdom patterns used elsewhere.
  - [x] **Vitest:** provider/hook test — changing filter updates persisted value (read back from mocked storage).
  - [x] **Playwright:** extend or add spec under `tests/e2e/` — set state via UI (or `page.evaluate` to pre-seed then reload), assert after navigation / reload. Use `blockKnownThirdPartyHosts(page)` before `page.goto()`. Seed `localStorage` language to `en` in `beforeEach` if asserting visible labels. [Source: `_bmad-output/project-context.md` — Testing]

## Dev Notes

### Epic context (Epic 1: Dashboard Infrastructure)

- **Epic goal:** Routing (1.1 **done**), navigation (1.2 **done**), and **dashboard state persistence** (this story).
- **Downstream:** Epic 4 will replace interim filter UI; Epic 3 will consume `activeChartView`; calculations remain Epic 2. Persistence **must not** block those stories.

### Technical requirements / guardrails

- **Storage key:** `earnings-dashboard-state` — required by `_bmad-output/planning-artifacts/epics.md` Story 1.3.
- **Separate from Kanban data** — domain tasks/clients remain in `freelancer-kanban-data` (`src/lib/storage.ts`). Dashboard preferences are a **second** key. [Source: `docs/architecture.md` — Persistence Layer]
- **Path alias:** `@/` imports for app code.
- **No new backend** — client-only JSON in `localStorage`. [Source: `docs/architecture.md`]
- **Do not** persist PII beyond what’s implied by filter selections; only enums/ranges as needed.

### Architecture compliance

- App already persists `AppState` via `loadState` / `saveState` + `useEffect` in `AppProvider`. Mirror **defensive** parse + log patterns from `src/lib/storage.ts` for the new earnings dashboard module.
- `LanguageContext` already uses `localStorage` for `app-language` — earnings dashboard persistence must use its **own** key; do not merge into `AppState` unless PRD changes (it does not). [Source: `_bmad-output/planning-artifacts/prd.md` — State Persistence]

### Library / framework

- **React 18** + **TypeScript** — context + hooks; no new state library. [Source: `docs/architecture.md`]
- **date-fns** `^3.6.0` is available if computing preset boundaries server/client-side; keep **stored** values as ms or preset IDs per notes above.
- No new npm dependencies expected for persistence.

### File structure

| Action | Path | Notes |
|--------|------|------|
| Add | `src/lib/earnings-dashboard-storage.ts` (or split key file if needed) | load/save + types |
| Edit | `src/lib/storage.ts` | `clearState()` also clears earnings dashboard key |
| Edit | `src/pages/EarningsDashboard.tsx` | Wrap with provider; interim filter UI |
| Add | `src/context/EarningsDashboardStateContext.tsx` (suggested) | or feature folder equivalent |
| Edit | `src/context/LanguageContext.tsx` | i18n keys for interim controls |
| Add/Edit | `src/**/*.test.tsx` + `tests/e2e/*.spec.ts` | coverage per Testing section |

### Testing

- Follow colocated Vitest and Playwright conventions in repo. [Source: `_bmad-output/project-context.md`]
- Prefer `getByRole` / `data-testid` on dashboard root (`data-testid="earnings-dashboard"` already on page).

### Previous story intelligence (Story 1.2)

- **Header** on `/earnings` uses `<Header />` without `onAddTask`; Kanban-only controls hidden. Do not regress nav or `document.title` behavior from `EarningsDashboard.tsx`.
- **i18n in tests:** seed `app-language` / use `data-testid` — English-only assertions broke under PT in earlier reviews.
- **`NavLink` `end` prop** on `/` — unrelated but don’t break routing while editing surrounding layout.
- **Import style:** prefer `@/` for new files; `App.tsx` may still mix patterns — new code stays on `@/`. [Source: `1-2-integrate-earnings-dashboard-into-main-navigation.md` — Code Review / deferred items]

### Git intelligence

Recent commits on branch: `f741fb3` Implemented story 1.2; `de0d5d9` Implemented story 1.1 — pattern is route + i18n + tests + small scoped files. Persistence should follow the same judicious file split.

### Latest technical specifics

- **`localStorage`:** synchronous API; keep writes error-handled (private mode / quota edge cases — log and continue). No `localStorage` events required for MVP single-tab use.
- **Defaults:** choose sensible defaults (e.g. preset **Last 30 days**, billable **all**, chart **customer**) and document them in one place so FR42 “default state” is unambiguous.

### UX / planning artifacts

- No standalone UX markdown in `_bmad-output/planning-artifacts/` — follow existing shadcn/Tailwind patterns and mobile-friendly layout on the dashboard page. [Source: `_bmad-output/planning-artifacts/epics.md` — UX Design Requirements]

### References

- [Story 1.3 acceptance criteria — `_bmad-output/planning-artifacts/epics.md` — Epic 1, Story 1.3]
- [FR3, FR14, FR39–FR42 — `_bmad-output/planning-artifacts/epics.md` — Requirements Inventory]
- [Persistence assumptions — `_bmad-output/planning-artifacts/prd.md` — State Persistence / Technical Architecture]
- [Storage patterns — `docs/architecture.md` — Persistence Layer]
- [AI guardrails — `_bmad-output/project-context.md`]
- [Previous story — `_bmad-output/implementation-artifacts/1-2-integrate-earnings-dashboard-into-main-navigation.md`]

## Dev Agent Record

### Agent Model Used

Cursor agent (implementation session).

### Debug Log References

- Playwright AC4: `page.addInitScript` re-ran on `reload()`, re-seeding `earnings-dashboard-state`; test updated to one-shot seed via `evaluate` + `reload`.

### Completion Notes List

- Implemented `earnings-dashboard-state` load/save with typed presets, optional `dateRange` ms pair, billable filter, `activeChart`, and `version`.
- `EarningsDashboardStateProvider` + `useEarningsDashboardState` under the earnings route; persists on each Select change (discrete actions, stable for E2E).
- `clearState()` clears Kanban and earnings keys; **Clear app data** on the dashboard calls `clearAppData()` so QA can exercise the same mechanism as Kanban reset without reintroducing a persisted key until the user changes a filter again.
- Interim `Select` UI + i18n (en/pt); chart view control included for FR39.
- Vitest: storage + provider tests; ATDD unit + E2E unskipped and green.

### File List

- `src/lib/earnings-dashboard-storage.ts`
- `src/lib/earnings-dashboard-storage.test.ts`
- `src/lib/storage.ts`
- `src/lib/storage.story-1-3-clear-state.test.ts`
- `src/context/EarningsDashboardStateContext.tsx`
- `src/context/EarningsDashboardStateContext.test.tsx`
- `src/context/LanguageContext.tsx`
- `src/pages/EarningsDashboard.tsx`
- `tests/e2e/earnings-dashboard-persistence.spec.ts`
- `_bmad-output/implementation-artifacts/1-3-implement-earnings-dashboard-state-persistence.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-04-04: Story 1.3 — earnings dashboard localStorage persistence, `clearState` coordination, interim UI, tests, sprint/story status → review.
- 2026-04-03: Code review complete — patch fixes merged; story and sprint status → **done**.

---

## Story completion status

**Status:** done

Code review (2026-04-03): adversarial + edge-case + AC audit — three **patch** items auto-fixed (finite `dateRange` coercion, AC4 E2E default UI assertions, shared storage key constant in clear-state test). No `decision-needed` items. Trivial impure `setState` + `save` pattern accepted for discrete Select updates.
