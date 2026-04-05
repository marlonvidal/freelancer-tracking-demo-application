# Story 2.2: Implement summary metrics calculations

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **user**,
I want **to see total revenue, billable revenue, non-billable revenue, average hourly rate, and task counts on the Earnings Dashboard**,
so that **I have an immediate, accurate overview of my earnings for the selected period and filters**.

## Acceptance Criteria

1. **Given** tasks with time spent and hourly rates exist in the app  
   **When** I view the Earnings Dashboard  
   **Then** I see all five summary metrics displayed:
   - **Total Revenue** — sum of billable revenue from all filtered tasks (FR21)
   - **Billable Revenue** — revenue from billable tasks only (FR22)
   - **Non-Billable Revenue** — always $0 by formula, displayed for completeness (FR23)
   - **Average Hourly Rate** — weighted average effective hourly rate across billable tasks with `timeSpent > 0` (FR24)
   - **Task Count** — displayed as "X total / Y billable" (FR25)

2. **Given** the date range preset is "Last 30 days"  
   **When** I view metrics  
   **Then** only tasks whose `createdAt` falls within the resolved 30-day window are included (FR13)

3. **Given** I change a filter (date range preset or billable toggle)  
   **When** the view updates  
   **Then** all five metrics recalculate and re-render immediately (FR27)

4. **Given** I have no tasks at all  
   **When** I view the dashboard  
   **Then** all revenue metrics display as `$0.00` and task count displays `0 total / 0 billable` (FR46-equivalent)

5. **Given** the billable filter is set to "Billable Only"  
   **When** metrics compute  
   **Then** only `isBillable === true` tasks in the date range are included in all five metrics (FR15, FR18)

6. **Given** the billable filter is set to "Non-Billable Only"  
   **When** metrics compute  
   **Then** only `isBillable === false` tasks in the date range are included — all revenue metrics are `0`, task count reflects non-billable tasks (FR16)

7. **Given** all calculations complete  
   **When** the dashboard renders  
   **Then** `totalRevenue` matches calling `getTaskBillableRevenue` on each filtered task — no new revenue formula introduced; `earning-calculations.ts` primitives are the single source of truth (FR26, 100% accuracy)

8. **Given** edge cases (zero-rate tasks, single client, `clientId: null`, `timeSpent = 0`)  
   **When** metrics compute  
   **Then** results are safe: no `NaN`, no `Infinity`, no throws (FR50)

9. **Given** the Average Hourly Rate calculation  
   **When** all billable tasks in the filtered set have `timeSpent === 0`  
   **Then** `averageHourlyRate` is `0` (not `Infinity` or `NaN`)

---

## Tasks / Subtasks

- [x] **Add `calculateSummaryMetrics` to `src/lib/earnings-calculations.ts`** (AC: 1–9)
  - [x] Define and export `SummaryMetrics` type (see Dev Notes for exact shape)
  - [x] Implement `calculateSummaryMetrics(tasks, clients, dateRangeMs, billableFilter)` composing existing `filterTasksForEarnings` + `getTaskBillableRevenue` + `getEffectiveHourlyRate`
  - [x] Weighted average hourly rate: `totalBillableRevenue / (totalBillableTimeSpentSeconds / 3600)` — guard zero denominator → return `0`
  - [x] `nonBillableRevenue` is always `0` (formula; still include the field for UI completeness)

- [x] **Extend `src/lib/earnings-calculations.test.ts` with `calculateSummaryMetrics` tests** (AC: 1–9)
  - [x] Test: basic billable task produces correct totalRevenue, billableRevenue, averageHourlyRate, taskCounts
  - [x] Test: non-billable task produces `totalRevenue = 0`, `billableTaskCount = 0`
  - [x] Test: mixed billable/non-billable tasks with `billableFilter = 'all'`
  - [x] Test: `billableFilter = 'billable'` excludes non-billable tasks from counts and revenue
  - [x] Test: `billableFilter = 'nonBillable'` returns all-zero revenue but correct totalTaskCount
  - [x] Test: empty task list → all zeros, no throw
  - [x] Test: date range filter excludes tasks outside window
  - [x] Test: `timeSpent = 0` on all billable tasks → `averageHourlyRate = 0` (AC 9)
  - [x] Test: `clientId: null` task (nullish rate chain → 0)
  - [x] Test: task-level `hourlyRate` override wins over client rate (FR26 nullish precedence)

- [x] **Wire summary metrics display in `EarningsDashboard.tsx`** (AC: 1–3)
  - [x] Import `useApp` from `@/context/AppContext` — access `state.tasks` and `state.clients`
  - [x] Import `resolveDateRangeMs` and `calculateSummaryMetrics` from `@/lib/earnings-calculations`
  - [x] Use `useMemo` to compute metrics: `useMemo(() => calculateSummaryMetrics(tasks, clients, resolveDateRangeMs(state, Date.now()), state.billableFilter), [tasks, clients, state])`
  - [x] Render metrics in a responsive grid of cards (5 cards) using existing shadcn/ui primitives
  - [x] Format currency with `formatCurrency` helper or template literal — see Dev Notes for formatting rules
  - [x] Add i18n labels for all 5 metric cards (add keys to `LanguageContext.tsx`)

- [x] **Add i18n translation keys** (AC: 1)
  - [x] Add to `en` object in `LanguageContext.tsx`: `earningsTotalRevenue`, `earningsBillableRevenue`, `earningsNonBillableRevenue`, `earningsAvgHourlyRate`, `earningsTaskCount`
  - [x] Add equivalent `pt` translations (see Dev Notes for Portuguese strings)
  - [x] **Do NOT hardcode English labels in JSX** — use `t.<key>` exclusively (project rule)

- [x] **Add ATDD spec files** (AC: 1–9)
  - [x] Add `tests/api/story-2-2-summary-metrics-atdd.spec.ts` — programmatic unit-level ATDD for `calculateSummaryMetrics` (mirror story-2-1 `tests/api/` pattern)
  - [x] Add `tests/e2e/story-2-2-summary-metrics-atdd.spec.ts` — Playwright E2E verifying rendered metrics exist on the dashboard page

---

## Dev Notes

### Calculation Design

**`SummaryMetrics` type** (add to `src/lib/earnings-calculations.ts`):

```typescript
export type SummaryMetrics = {
  totalRevenue: number;         // sum of getTaskBillableRevenue for all filtered tasks
  billableRevenue: number;      // sum of getTaskBillableRevenue for isBillable===true filtered tasks
  nonBillableRevenue: number;   // always 0 per FR26; included for UI symmetry
  averageHourlyRate: number;    // totalBillableRevenue / totalBillableHours (guard 0)
  totalTaskCount: number;       // filtered.length
  billableTaskCount: number;    // count where isBillable===true
};
```

**`calculateSummaryMetrics` skeleton** (for dev reference — exact implementation may evolve):

```typescript
export function calculateSummaryMetrics(
  tasks: Task[],
  clients: Client[],
  dateRangeMs: EarningsDateRangeMs,
  billableFilter: BillableFilter,
): SummaryMetrics {
  const filtered = filterTasksForEarnings(tasks, dateRangeMs, billableFilter);
  let billableRevenue = 0;
  let billableTaskCount = 0;
  let billableTimeSpentSec = 0;

  for (const task of filtered) {
    const revenue = getTaskBillableRevenue(task, clients);
    if (task.isBillable) {
      billableRevenue += revenue;
      billableTaskCount += 1;
      billableTimeSpentSec += task.timeSpent;
    }
  }

  const billableHours = billableTimeSpentSec / 3600;
  const averageHourlyRate = billableHours > 0 ? billableRevenue / billableHours : 0;

  return {
    totalRevenue: billableRevenue,   // non-billable revenue is always 0 by formula
    billableRevenue,
    nonBillableRevenue: 0,
    averageHourlyRate,
    totalTaskCount: filtered.length,
    billableTaskCount,
  };
}
```

**Key invariant:** `totalRevenue === billableRevenue` always, because non-billable tasks contribute 0 to revenue by the FR26 formula. Both fields are kept because:
1. UI shows them as separate labeled cards
2. Epic 6 translations apply separate labels
3. Consistent shape with Epic 5's more refined display story

### React Integration Pattern

**Do NOT recompute `Date.now()` on every render.** Use `useMemo` with `state` as the dependency array entry; `Date.now()` is captured once at memo evaluation time (acceptable MVP trade-off — avoids real-time ticker complexity that belongs to a future story).

```tsx
// Inside EarningsDashboardContent
const { state } = useEarningsDashboardState();
const { state: appState } = useApp();

const metrics = useMemo(
  () =>
    calculateSummaryMetrics(
      appState.tasks,
      appState.clients,
      resolveDateRangeMs(state, Date.now()),
      state.billableFilter,
    ),
  [appState.tasks, appState.clients, state],
);
```

**`useApp` import:** `import { useApp } from '@/context/AppContext';`  
The hook is exported as `useApp` (not `useAppContext`) — confirmed from `src/context/AppContext.tsx` line 255.

**The component tree:** `EarningsDashboard` wraps `AppProvider`, which wraps `EarningsDashboardStateProvider`, which wraps `EarningsDashboardContent` — both contexts are accessible inside `EarningsDashboardContent` without prop drilling.

### Currency Formatting

No currency formatting utility exists yet in this codebase. Use a simple inline formatter:

```tsx
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
```

**Important:** Epic 6 (i18n Story 6.1) will replace this with locale-aware formatting. Keep the formatter local for now (do not add to `src/lib/utils.ts` — avoid premature abstraction). Epic 6's retro will handle consolidation.

### i18n Keys to Add

Add ALL of the following to **both `en` and `pt`** objects in `src/context/LanguageContext.tsx`:

| Key | English | Portuguese |
|-----|---------|------------|
| `earningsTotalRevenue` | `'Total Revenue'` | `'Receita Total'` |
| `earningsBillableRevenue` | `'Billable Revenue'` | `'Receita Faturável'` |
| `earningsNonBillableRevenue` | `'Non-Billable Revenue'` | `'Receita Não Faturável'` |
| `earningsAvgHourlyRate` | `'Average Hourly Rate'` | `'Taxa Horária Média'` |
| `earningsTaskCount` | `'Task Count'` | `'Total de Tarefas'` |

**Never hardcode English (or Portuguese) text in JSX.** This is a non-negotiable project rule enforced from Epic 1 retro — all visible strings must go through `t.<key>`.

### UI Layout for Metrics

Use existing shadcn/ui `Card` + `CardHeader` + `CardContent` pattern (check `src/components/ui/card.tsx` — already installed). Render a responsive grid of 5 metric cards. Suggested layout:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
  {/* One <Card> per metric */}
</div>
```

Each card shows:
- Label: `<p className="text-sm text-muted-foreground">{t.earningsTotalRevenue}</p>`
- Value: `<p className="text-2xl font-semibold">{formatCurrency(metrics.totalRevenue)}</p>`

For Task Count (FR25), display both counts in a single card:
- Label: `{t.earningsTaskCount}`
- Value: `{metrics.totalTaskCount} total / {metrics.billableTaskCount} billable`

### Empty State / Zero Data

When `metrics.totalTaskCount === 0`:
- Revenue cards show `$0.00` (from `formatCurrency(0)`) — this is acceptable for MVP
- Task count shows `0 total / 0 billable`
- **No separate "no data" message is needed for this story** (Epic 5 / Story 5.1 handles empty state UX with rich messages — do not implement FR46-FR49 here)

### Architecture Compliance

- **Client-only SPA** — no network calls; all data from context
- **`useApp().state`** provides `tasks: Task[]` and `clients: Client[]` — read-only consumption, no dispatch
- **Earnings filter state** lives in `EarningsDashboardStateContext` — do not duplicate to `AppState`
- **No new `localStorage` key** — this story only reads existing state
- **No changes to `AppState`, reducer, or `loadState/saveState`** — this story is pure display + calculation

### File Structure

| Action | Path | Notes |
|--------|------|-------|
| Edit | `src/lib/earnings-calculations.ts` | Add `SummaryMetrics` type + `calculateSummaryMetrics` |
| Edit | `src/lib/earnings-calculations.test.ts` | Extend with `calculateSummaryMetrics` tests |
| Edit | `src/pages/EarningsDashboard.tsx` | Wire metrics display using `useApp` + `calculateSummaryMetrics` |
| Edit | `src/context/LanguageContext.tsx` | Add 5 i18n keys to both `en` and `pt` |
| Add | `tests/api/story-2-2-summary-metrics-atdd.spec.ts` | Programmatic ATDD (Playwright) |
| Add | `tests/e2e/story-2-2-summary-metrics-atdd.spec.ts` | UI E2E ATDD (Playwright Chromium) |

### Testing Requirements

**Unit tests** (`src/lib/earnings-calculations.test.ts`):
- Use Vitest globals (`describe`, `it`, `expect`) — no imports needed per project config
- Import `calculateSummaryMetrics` and `SummaryMetrics` from `@/lib/earnings-calculations`
- Reuse the existing `task()` builder pattern already in the test file

**ATDD spec pattern** (`tests/api/story-2-2-summary-metrics-atdd.spec.ts`):
- Mirror the story 2-1 pattern: `test.describe`, dynamic `await import('../../src/lib/earnings-calculations')`
- Name tests with priority `[P0]` / `[P1]` prefix

**E2E spec** (`tests/e2e/story-2-2-summary-metrics-atdd.spec.ts`):
- Follow `tests/support/fixtures` import pattern (not `@playwright/test` directly)
- Call `blockKnownThirdPartyHosts(page)` before `page.goto()`
- Seed app language via `addInitScript`: `localStorage.setItem('app-language', 'en')`
- Use `data-testid` selectors for metrics container (add `data-testid="earnings-metrics"` to the grid wrapper)
- Verify metric elements exist on screen using `getByTestId` / `getByRole`
- E2E does NOT need to verify exact numbers — only structural presence

**E2E base URL:** `http://localhost:8080`; nav to `/earnings` route.

### Previous Story Intelligence (Story 2.1)

- **Do not re-implement** `filterTasksForEarnings`, `getTaskBillableRevenue`, `getEffectiveHourlyRate`, or date range resolution — these are all exported from `earnings-calculations.ts` and must be called, not reimplemented
- **`BillableFilter`** type is re-exported from `earnings-calculations.ts` via `export type { BillableFilter }` — import from there (not from `earnings-dashboard-storage`) to avoid drift
- **Tag split logic** (from 2.1 AC3) is NOT relevant to summary metrics — `calculateSummaryMetrics` counts task-level revenue, not tag-split revenue
- **`AppContext` `getTaskRevenue`** now delegates to `getTaskBillableRevenue` — story 2.1 completed this refactor. Do not re-read the pre-2.1 version of this helper
- **Vitest tests** pass; Playwright suite runs at 53 tests with `--workers=1` (use `--workers=1` if timing out locally)
- **Review findings from 2.1:** Inclusive `endMs` boundary is tested (`createdAt === endMs` is included). Duplicate-tag dedupe is tested. These patterns are established — follow them in 2.2 tests

### Git Intelligence

- Recent pattern: `bbbc67f Implemented story 2.1` bundled `earnings-calculations.ts` + test file + `AppContext.tsx` in one commit
- For 2.2, expect a similar focused bundle: `earnings-calculations.ts` (additive), `EarningsDashboard.tsx` (new display), `LanguageContext.tsx` (new keys), test files
- No `package.json` changes expected (no new dependencies)

### Latest Technical Notes

- **date-fns v3 / Vitest v3 / Playwright v1.59** — all confirmed in project; no version changes for this story
- **`Card` component:** `src/components/ui/card.tsx` is installed (shadcn). Import: `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'`
- **`cn()` utility:** `import { cn } from '@/lib/utils'` for conditional Tailwind classes
- **React 18 `useMemo` stability:** memoize by `[appState.tasks, appState.clients, state]` — `state` from `useEarningsDashboardState()` is a new object reference only when a setter is called (stable when unchanged)

### References

- [Story 2.2 ACs — `_bmad-output/planning-artifacts/epics.md` — Epic 2, Story 2.2]
- [FR21–FR27, FR50 — `_bmad-output/planning-artifacts/epics.md` — Requirements Inventory]
- [FR26 revenue formula + earnings rules — `_bmad-output/project-context.md` — Revenue formula]
- [Calculation primitives — `src/lib/earnings-calculations.ts`]
- [Dashboard state types — `src/lib/earnings-dashboard-storage.ts`]
- [Dashboard state context — `src/context/EarningsDashboardStateContext.tsx`]
- [App state hook `useApp` — `src/context/AppContext.tsx` line 255]
- [Domain types — `src/types/index.ts`]
- [i18n pattern + existing earnings keys — `src/context/LanguageContext.tsx`]
- [EarningsDashboard component structure — `src/pages/EarningsDashboard.tsx`]
- [Previous story learnings — `_bmad-output/implementation-artifacts/2-1-implement-earnings-calculation-utilities.md`]
- [shadcn Card — `src/components/ui/card.tsx`]
- [ATDD pattern reference — `tests/api/story-2-1-earnings-calculations-atdd.spec.ts`]

---

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

- Two E2E test bugs fixed during green phase:
  1. `getByText("Billable Revenue")` strict-mode violation: "Billable Revenue" is a substring of "Non-Billable Revenue". Fixed by adding `{ exact: true }` to the Playwright assertion.
  2. Zero-state test expected "0 total / 0 billable" but app default state has 5 sample tasks. Fixed by seeding explicit empty `freelancer-kanban-data` in the test's `addInitScript`.

### Completion Notes List

- Added `SummaryMetrics` type (6 fields) and `calculateSummaryMetrics` function to `src/lib/earnings-calculations.ts` — composes existing `filterTasksForEarnings` + `getTaskBillableRevenue`, guards zero-denominator for `averageHourlyRate`
- Extended `src/lib/earnings-calculations.test.ts` with 10 new unit tests covering all ACs (1–9)
- Wired `EarningsDashboard.tsx` with `useMemo` + `calculateSummaryMetrics` + `resolveDateRangeMs`; renders 5 responsive `Card` components with `data-testid="earnings-metrics"` on the grid wrapper
- Added 5 i18n keys to both `en` and `pt` in `LanguageContext.tsx`
- Removed `test.skip()` from all 11 API ATDD tests and all 5 E2E ATDD tests
- All 101 Vitest unit tests pass; all 69 Playwright tests (API + E2E) pass with no regressions

### File List

- `src/lib/earnings-calculations.ts` — added `SummaryMetrics` type and `calculateSummaryMetrics` function
- `src/lib/earnings-calculations.test.ts` — extended with 10 `calculateSummaryMetrics` unit tests
- `src/pages/EarningsDashboard.tsx` — wired metrics display with `useMemo`, `useApp`, 5 metric `Card` components
- `src/context/LanguageContext.tsx` — added 5 i18n keys to both `en` and `pt`
- `tests/api/story-2-2-summary-metrics-atdd.spec.ts` — removed all `test.skip()` (11 tests now active)
- `tests/e2e/story-2-2-summary-metrics-atdd.spec.ts` — removed all `test.skip()` (5 tests now active); fixed 2 test bugs (strict-mode, zero-state seeding)

### Review Findings

- [x] [Review][Patch] Hardcoded English "total / billable" in task count card value [`src/pages/EarningsDashboard.tsx:135`] — **Auto-fixed**: Added `earningsTaskCountTotal` and `earningsTaskCountBillable` i18n keys to `LanguageContext.tsx` (both `en` and `pt`); updated JSX to use `t.earningsTaskCountTotal` / `t.earningsTaskCountBillable`. English output is identical; Portuguese now renders "X total / Y faturável".
- [x] [Review][Defer] `getTaskBillableRevenue` called for non-billable tasks in metrics loop [`src/lib/earnings-calculations.ts:318`] — deferred, pre-existing pattern; result is 0 for non-billable tasks, harmless micro-inefficiency, consistent with spec skeleton
- [x] [Review][Defer] Negative `timeSpent` values could produce negative `averageHourlyRate` — deferred, pre-existing data integrity concern out of story scope; no guard specified by spec

