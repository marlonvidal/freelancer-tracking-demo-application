# Story 5.1: Implement summary metrics cards and edge case handling

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **user**,
I want **to see earnings summary metrics and helpful messages when data is missing**,
so that **I understand my revenue at a glance and know what to do if there's no data**.

## Acceptance Criteria

1. **Given** I have tasks with time entries and rates
   **When** I view the dashboard
   **Then** I see summary cards displaying:
   - Total Revenue (FR21)
   - Billable Revenue (FR22)
   - Non-Billable Revenue (FR23)
   - Average Hourly Rate (FR24)
   - Task Count (FR25)

2. **Given** I have no tasks at all
   **When** I view the dashboard
   **Then** I see an empty state message: "No tasks tracked yet. Start tracking time to see earnings data." (FR46)
   **And** the metric cards grid is NOT rendered

3. **Given** I have tasks, but none fall within the selected date range
   **When** I view the dashboard
   **Then** I see a message: "No data for this period. Try adjusting the date range." (FR47)
   **And** the metric cards grid is NOT rendered

4. **Given** I filter to show billable-only work, but have no billable tasks in the period
   **When** I view the dashboard
   **Then** I see a message: "No billable work in this period." (FR48)
   **And** the metric cards grid is NOT rendered

5. **Given** the calculation encounters an error
   **When** I view the dashboard
   **Then** I see a clear error message: "Unable to calculate metrics. Try refreshing the page." (FR49)
   **And** the metric cards grid is NOT rendered

6. **Given** I have edge case data (zero revenue, single client, all non-billable tasks)
   **When** I view the dashboard
   **Then** the metrics display correctly (e.g., `$0.00` for revenue, `0/0` task counts) and the dashboard remains functional (FR50)

---

## Tasks / Subtasks

- [x] **Add 4 new i18n keys to `src/context/LanguageContext.tsx`** (AC: 2, 3, 4, 5)
  - [x] Add to `Translations` interface: `earningsEmptyNoTasks`, `earningsEmptyNoPeriodData`, `earningsNoBillableWork`, `earningsCalculationError`
  - [x] Add English values (see Dev Notes for exact strings)
  - [x] Add Portuguese values (see Dev Notes for exact strings)

- [x] **Modify `src/pages/EarningsDashboard.tsx`** (AC: 1–6)
  - [x] Wrap `calculateSummaryMetrics` call in try-catch inside `useMemo`; return `{ metrics, metricsError }` (AC: 5)
  - [x] Replace the metrics `useMemo` destructuring to extract both `metrics` and `metricsError`
  - [x] Add the conditional metrics render block (see Dev Notes for full logic and JSX)
  - [x] Ensure `data-testid="earnings-metrics"` is ONLY rendered when metric cards are shown (AC: 1)
  - [x] Add `data-testid="earnings-calculation-error"` for error state (AC: 5)
  - [x] Add `data-testid="earnings-empty-no-tasks"` for FR46 state (AC: 2)
  - [x] Add `data-testid="earnings-empty-no-period-data"` for FR47 state (AC: 3)
  - [x] Add `data-testid="earnings-empty-no-billable-work"` for FR48 state (AC: 4)

- [x] **Create `tests/e2e/story-5-1-implement-summary-metrics-cards-and-edge-case-handling-atdd.spec.ts`** (AC: 1–4, 6)
  - [x] P0: Normal data → metric cards visible (AC: 1)
  - [x] P0: No tasks globally → `earnings-empty-no-tasks` visible, `earnings-metrics` absent (AC: 2)
  - [x] P0: Tasks outside date range → `earnings-empty-no-period-data` visible (AC: 3)
  - [x] P0: Billable filter active + no billable tasks → `earnings-empty-no-billable-work` visible (AC: 4)
  - [x] P1: Edge case zero-revenue data → metric cards show `$0.00` (AC: 6)

---

## Dev Notes

### Pre-Implementation Audit (CRITICAL — READ BEFORE CODING)

**What is ALREADY implemented (do NOT re-implement):**

The 5 metric cards (`data-testid="earnings-metrics"`) are **fully implemented** in `EarningsDashboard.tsx` from Story 2.2. The grid renders these `<Card>` components:
- Total Revenue → `formatCurrency(metrics.totalRevenue)`
- Billable Revenue → `formatCurrency(metrics.billableRevenue)`
- Non-Billable Revenue → `formatCurrency(metrics.nonBillableRevenue)`
- Average Hourly Rate → `formatCurrency(metrics.averageHourlyRate)`
- Task Count → `{metrics.totalTaskCount} {t.earningsTaskCountTotal} / {metrics.billableTaskCount} {t.earningsTaskCountBillable}`

`calculateSummaryMetrics` is already imported and called via `useMemo` in `EarningsDashboardContent`. The `formatCurrency` is already imported from `@/lib/utils`.

**What this story adds:**
- Conditional rendering: replace the metrics grid with a contextual empty state message in 4 scenarios
- Error boundary for `calculateSummaryMetrics` failures
- i18n keys for the 4 new messages
- E2E ATDD tests for all empty states

---

### AC2–4 Condition Priority Order

The empty state conditions must be evaluated in this exact order:

```
1. metricsError !== null        → FR49 error state
2. appState.tasks.length === 0  → FR46 no tasks globally
3. metrics.totalTaskCount === 0 AND state.billableFilter === 'billable'  → FR48 no billable work
4. metrics.totalTaskCount === 0 (catch-all for no data in period)        → FR47 no data for period
5. Otherwise                    → show metric cards grid
```

**Why this order matters:**
- FR46 checks `appState.tasks.length` (GLOBAL tasks count, not filtered). If no tasks exist globally, the user needs a "start tracking" message — not a "no data for this period" hint.
- FR48 must come before FR47: when `billableFilter === 'billable'`, `filterTasksForEarnings` returns only billable tasks. `totalTaskCount === 0` could mean "no tasks in range" OR "no billable tasks in range" — the billableFilter check distinguishes them.
- FR47 is the catch-all for `totalTaskCount === 0` with tasks existing globally.

---

### `useMemo` Refactor for Error Handling

**BEFORE (current state in `EarningsDashboard.tsx`):**

```tsx
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

**AFTER (required change):**

```tsx
const { metrics, metricsError } = useMemo(() => {
  try {
    return {
      metrics: calculateSummaryMetrics(
        appState.tasks,
        appState.clients,
        resolveDateRangeMs(state, Date.now()),
        state.billableFilter,
      ),
      metricsError: null,
    };
  } catch (err) {
    return { metrics: null, metricsError: err as Error };
  }
}, [appState.tasks, appState.clients, state]);
```

**Critical:** TypeScript `strict` is OFF — no strict null checks. The `metrics` variable can be `null` when there's an error. In the render, always check `metricsError` first, then `metrics` can be safely used.

---

### Metrics Section Conditional Render JSX

Replace the existing metrics grid `<div>` with the following conditional block. Preserve the rest of the layout (heading, chart section, filter controls) exactly as-is.

```tsx
{/* METRICS SECTION — replaces the single <div data-testid="earnings-metrics"> block */}
{metricsError ? (
  <div
    data-testid="earnings-calculation-error"
    className="flex items-center justify-center rounded-lg border border-dashed p-8"
  >
    <p className="text-muted-foreground text-sm text-center">
      {t.earningsCalculationError}
    </p>
  </div>
) : appState.tasks.length === 0 ? (
  <div
    data-testid="earnings-empty-no-tasks"
    className="flex items-center justify-center rounded-lg border border-dashed p-8"
  >
    <p className="text-muted-foreground text-sm text-center">
      {t.earningsEmptyNoTasks}
    </p>
  </div>
) : metrics && metrics.totalTaskCount === 0 && state.billableFilter === 'billable' ? (
  <div
    data-testid="earnings-empty-no-billable-work"
    className="flex items-center justify-center rounded-lg border border-dashed p-8"
  >
    <p className="text-muted-foreground text-sm text-center">
      {t.earningsNoBillableWork}
    </p>
  </div>
) : metrics && metrics.totalTaskCount === 0 ? (
  <div
    data-testid="earnings-empty-no-period-data"
    className="flex items-center justify-center rounded-lg border border-dashed p-8"
  >
    <p className="text-muted-foreground text-sm text-center">
      {t.earningsEmptyNoPeriodData}
    </p>
  </div>
) : metrics ? (
  <div
    data-testid="earnings-metrics"
    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
  >
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t.earningsTotalRevenue}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{formatCurrency(metrics.totalRevenue)}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t.earningsBillableRevenue}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{formatCurrency(metrics.billableRevenue)}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t.earningsNonBillableRevenue}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{formatCurrency(metrics.nonBillableRevenue)}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t.earningsAvgHourlyRate}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{formatCurrency(metrics.averageHourlyRate)}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t.earningsTaskCount}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">
          {metrics.totalTaskCount} {t.earningsTaskCountTotal} / {metrics.billableTaskCount} {t.earningsTaskCountBillable}
        </p>
      </CardContent>
    </Card>
  </div>
) : null}
```

**Note:** The `metrics ? (...)` final guard prevents the normal card grid from rendering if `metrics` is null (error path). This is redundant with the `metricsError` check at the top, but keeps TypeScript happy without strict mode.

---

### i18n Keys — Exact Strings

Add these 4 keys to the `Translations` interface and both locale objects.

**Interface additions (in `Translations` type, after `earningsChartAllHidden`):**

```typescript
earningsEmptyNoTasks: string;
earningsEmptyNoPeriodData: string;
earningsNoBillableWork: string;
earningsCalculationError: string;
```

**English values:**

```typescript
earningsEmptyNoTasks: 'No tasks tracked yet. Start tracking time to see earnings data.',
earningsEmptyNoPeriodData: 'No data for this period. Try adjusting the date range.',
earningsNoBillableWork: 'No billable work in this period.',
earningsCalculationError: 'Unable to calculate metrics. Try refreshing the page.',
```

**Portuguese values:**

```typescript
earningsEmptyNoTasks: 'Nenhuma tarefa rastreada ainda. Comece a rastrear o tempo para ver os dados de ganhos.',
earningsEmptyNoPeriodData: 'Sem dados para este período. Tente ajustar o intervalo de datas.',
earningsNoBillableWork: 'Nenhum trabalho faturável neste período.',
earningsCalculationError: 'Não foi possível calcular as métricas. Tente atualizar a página.',
```

**RULE:** Never hardcode any of these strings in JSX — always use `t.<key>`. Project-context.md rule enforced since Epic 1.

---

### Edge Case Logic for FR50

`calculateSummaryMetrics` already handles FR50 edge cases safely (from Story 2.2):
- `timeSpent = 0` on all tasks → `averageHourlyRate = 0` (no NaN/Infinity)
- `clientId: null` → rate falls back to 0 via nullish chain
- Zero revenue tasks → `$0.00` displays cleanly via `formatCurrency`
- Single client → renders as a single metric card without issue

**No code changes needed for FR50** — the display path (showing metric cards) already handles these correctly. The E2E test for AC6 seeds a zero-revenue task and verifies the cards render without error.

---

### ATDD Spec — Full Implementation

**File:** `tests/e2e/story-5-1-implement-summary-metrics-cards-and-edge-case-handling-atdd.spec.ts`

**Standard imports:**

```typescript
import { test, expect } from '../support/fixtures';
import { blockKnownThirdPartyHosts } from '../support/helpers/network';
```

**Seed helpers (define at module level, outside `test.describe`):**

```typescript
// Seed: two billable tasks created within last30 range
const buildNormalSeed = () => ({
  tasks: [
    {
      id: 't1', title: 'Task 1', columnId: 'col-1', clientId: 'c1',
      isBillable: true, hourlyRate: 100, timeSpent: 3600,
      createdAt: Date.now() - 5 * 86400000,
      priority: 'medium', description: '', timeEstimate: null, dueDate: null, tags: [], order: 0,
    },
    {
      id: 't2', title: 'Task 2', columnId: 'col-1', clientId: 'c1',
      isBillable: true, hourlyRate: 50, timeSpent: 7200,
      createdAt: Date.now() - 3 * 86400000,
      priority: 'low', description: '', timeEstimate: null, dueDate: null, tags: [], order: 1,
    },
  ],
  columns: [{ id: 'col-1', title: 'In Progress', order: 0 }],
  clients: [{ id: 'c1', name: 'Acme Corp', hourlyRate: 100, color: '#6366f1' }],
  version: 1,
});

// Seed: no tasks at all — required for FR46 test (app default has 5 sample tasks)
const buildEmptySeed = () => ({
  tasks: [],
  columns: [{ id: 'col-1', title: 'In Progress', order: 0 }],
  clients: [],
  version: 1,
});

// Seed: tasks exist but ALL are older than 30 days (outside last30 preset)
const buildOutOfRangeSeed = () => ({
  tasks: [
    {
      id: 't1', title: 'Old Task', columnId: 'col-1', clientId: 'c1',
      isBillable: true, hourlyRate: 100, timeSpent: 3600,
      createdAt: Date.now() - 60 * 86400000,  // 60 days ago — outside last30
      priority: 'medium', description: '', timeEstimate: null, dueDate: null, tags: [], order: 0,
    },
  ],
  columns: [{ id: 'col-1', title: 'In Progress', order: 0 }],
  clients: [{ id: 'c1', name: 'Acme Corp', hourlyRate: 100, color: '#6366f1' }],
  version: 1,
});

// Seed: tasks exist, none are billable, for testing FR48 with billable filter active
const buildNonBillableSeed = () => ({
  tasks: [
    {
      id: 't1', title: 'Non-billable Task', columnId: 'col-1', clientId: null,
      isBillable: false, hourlyRate: null, timeSpent: 3600,
      createdAt: Date.now() - 5 * 86400000,
      priority: 'medium', description: '', timeEstimate: null, dueDate: null, tags: [], order: 0,
    },
  ],
  columns: [{ id: 'col-1', title: 'In Progress', order: 0 }],
  clients: [],
  version: 1,
});

// Seed: task with zero timeSpent and zero hourlyRate — edge case for FR50
const buildZeroRevenueSeed = () => ({
  tasks: [
    {
      id: 't1', title: 'Zero Task', columnId: 'col-1', clientId: null,
      isBillable: true, hourlyRate: 0, timeSpent: 0,
      createdAt: Date.now() - 5 * 86400000,
      priority: 'low', description: '', timeEstimate: null, dueDate: null, tags: [], order: 0,
    },
  ],
  columns: [{ id: 'col-1', title: 'In Progress', order: 0 }],
  clients: [],
  version: 1,
});
```

**Dashboard state seed helper (ALWAYS build complete valid `EarningsDashboardPersistedState` — never partial spread):**

```typescript
const buildDashboardStateBillable = () => ({
  version: 1,
  dateRangePreset: 'last30',
  billableFilter: 'billable',
  activeChart: 'customer',
});
```

**Full test structure:**

```typescript
test.describe('Story 5.1 — Summary Metrics Cards and Edge Case Handling', () => {

  // ── AC1: Normal data shows all 5 metric cards ─────────────────────────────

  test('[P0] normal data renders all 5 metric cards (AC1)', async ({ page }) => {
    await page.addInitScript((data) => {
      localStorage.setItem('app-language', 'en');
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(data));
    }, buildNormalSeed());
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    const metricsGrid = page.getByTestId('earnings-metrics');
    await expect(metricsGrid).toBeVisible();

    // Verify all 5 card labels are present
    await expect(metricsGrid.getByText('Total Revenue', { exact: true })).toBeVisible();
    await expect(metricsGrid.getByText('Billable Revenue', { exact: true })).toBeVisible();
    await expect(metricsGrid.getByText('Non-Billable Revenue', { exact: true })).toBeVisible();
    await expect(metricsGrid.getByText('Average Hourly Rate', { exact: true })).toBeVisible();
    await expect(metricsGrid.getByText('Task Count', { exact: true })).toBeVisible();
  });

  // ── AC2: No tasks globally → FR46 empty state ────────────────────────────

  test('[P0] no tasks shows empty-no-tasks message (AC2 / FR46)', async ({ page }) => {
    await page.addInitScript((data) => {
      localStorage.setItem('app-language', 'en');
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(data));
    }, buildEmptySeed());
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    await expect(page.getByTestId('earnings-empty-no-tasks')).toBeVisible();
    await expect(page.getByTestId('earnings-metrics')).not.toBeVisible();
  });

  // ── AC3: Tasks exist but none in date range → FR47 ───────────────────────

  test('[P0] tasks outside date range shows no-period-data message (AC3 / FR47)', async ({ page }) => {
    await page.addInitScript((data) => {
      localStorage.setItem('app-language', 'en');
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(data));
    }, buildOutOfRangeSeed());
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    // Default preset is last30 — the task is 60 days old, outside range
    await expect(page.getByTestId('earnings-empty-no-period-data')).toBeVisible();
    await expect(page.getByTestId('earnings-metrics')).not.toBeVisible();
  });

  // ── AC4: Billable filter active + no billable tasks → FR48 ───────────────

  test('[P0] billable filter with no billable tasks shows no-billable-work message (AC4 / FR48)', async ({ page }) => {
    await page.addInitScript((taskData, dashData) => {
      localStorage.setItem('app-language', 'en');
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(taskData));
      localStorage.setItem('earnings-dashboard-state', JSON.stringify(dashData));
    }, buildNonBillableSeed(), buildDashboardStateBillable());
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    await expect(page.getByTestId('earnings-empty-no-billable-work')).toBeVisible();
    await expect(page.getByTestId('earnings-metrics')).not.toBeVisible();
  });

  // ── AC6: Edge case data (zero revenue) → cards render without error ───────

  test('[P1] zero-revenue edge case renders metric cards correctly (AC6 / FR50)', async ({ page }) => {
    await page.addInitScript((data) => {
      localStorage.setItem('app-language', 'en');
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(data));
    }, buildZeroRevenueSeed());
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    // Task has timeSpent=0 and hourlyRate=0 — should show $0.00 not crash
    const metricsGrid = page.getByTestId('earnings-metrics');
    await expect(metricsGrid).toBeVisible();
    await expect(metricsGrid.getByText('$0.00').first()).toBeVisible();
  });
});
```

---

### data-testid Inventory for This Story

| `data-testid` | Condition | AC |
|---|---|---|
| `earnings-metrics` | Normal data (cards rendered) | AC1, AC6 |
| `earnings-empty-no-tasks` | `appState.tasks.length === 0` | AC2 |
| `earnings-empty-no-period-data` | `metrics.totalTaskCount === 0` (tasks exist) | AC3 |
| `earnings-empty-no-billable-work` | `billableFilter === 'billable'` + `totalTaskCount === 0` | AC4 |
| `earnings-calculation-error` | `calculateSummaryMetrics` throws | AC5 |

**Existing `data-testid` to NOT change:**
- `earnings-dashboard` — dashboard root container (all tests use it)
- `earnings-metrics` — the card grid (exists in Story 2.2; preserved in normal path)

---

### Architecture Compliance

**DO:**
- Keep all 5 metric cards exactly as-is in the normal render path — zero UI changes to the cards themselves
- Add empty state divs using the same `flex items-center justify-center rounded-lg border border-dashed p-8` pattern as `chart-all-hidden-message` (story 4.4) for visual consistency
- Import from `@/lib/utils` for `formatCurrency` — do NOT add a local copy
- Use `useApp()` and `useEarningsDashboardState()` — both already imported in `EarningsDashboard.tsx`

**DO NOT:**
- Change the `calculateSummaryMetrics` function signature or implementation — it is proven correct from Story 2.2
- Move metric display to a separate component file — `EarningsDashboard.tsx` is the right home
- Add a new localStorage key — this story only reads state
- Change `AppState`, reducer, or storage layer
- Add a new context or provider
- Change the chart section behavior — charts independently handle their own `data.length === 0` empty state via `earningsChartNoData`
- Use `||` for null coalescing on rate/revenue fields — use `??` if you touch any rate logic (project rule from Epic 2)
- Hardcode any message strings in JSX — all must go through `t.<key>`

---

### File Structure

| Action | Path | Notes |
|--------|------|-------|
| Edit | `src/context/LanguageContext.tsx` | Add 4 i18n keys to `Translations` interface, `en` object, and `pt` object |
| Edit | `src/pages/EarningsDashboard.tsx` | Refactor `metrics` useMemo, add conditional render block |
| Create | `tests/e2e/story-5-1-implement-summary-metrics-cards-and-edge-case-handling-atdd.spec.ts` | E2E ATDD spec |

No new npm dependencies. No new files in `src/`. No changes to `src/lib/earnings-calculations.ts`.

---

### Previous Story Intelligence (Story 4.4 — last completed)

**Baseline at start of Story 5.1:**
- Vitest: **207 unit tests** passing
- Playwright E2E: **132 tests** passing (no pre-existing flakes after Story 4.4 timing fixes)

**Patterns established — replicate exactly:**
- Commit message pattern: `"Implemented story 5.1"` — ONE commit, bundle all changed files
- `data-testid` on all new user-visible containers — required for E2E targeting
- `blockKnownThirdPartyHosts(page)` is `async` — must be `await`ed in `beforeEach` (review finding from Story 4.4)
- Import from `tests/support/fixtures`, never directly from `@playwright/test`
- `{ exact: true }` with `getByText()` — "Billable Revenue" is a substring of "Non-Billable Revenue" (E2E bug from Story 2.2 debug log — always exact-match label text)
- E2E seed via `addInitScript`, never via `page.evaluate()` with partial spread
- `buildDashboardStateBillable()` must be a **complete, valid `EarningsDashboardPersistedState`** (all four fields: `version`, `dateRangePreset`, `billableFilter`, `activeChart`) — `coercePersisted` rejects incomplete objects (Story 4.2 ATDD bug)
- Run Playwright locally with `--workers=1`

**Files confirmed stable from Story 4.4 (do not reopen):**
- `src/lib/utils.ts` — `formatCurrency` and `cn` already exported
- `src/components/CustomerRevenueChart.tsx` / `ProjectRevenueChart.tsx` / `TagRevenueChart.tsx` — `useEffect` reset for `hiddenKeys`, all-hidden guard, no local `formatCurrency`
- `src/context/EarningsDashboardStateContext.tsx` — no changes needed
- `src/lib/earnings-dashboard-storage.ts` — no changes needed
- `src/lib/earnings-calculations.ts` — no changes needed

**D1 Action Item from Epic 4 retro (hard gate for ATDD spec):**
The ATDD spec template MUST NOT include a `🔴 RED PHASE` comment or `test.skip()` header. This was a two-epic recurring bug (Stories 4.1 and 4.2 both had it auto-patched in code review). The spec above is written clean — do not add these comments.

---

### Git Intelligence

Recent commits (context):
```
8e03bf4 Retro and project context update
534edcb Implemented story 4.4
b23ab60 Implemented story 4.3
a31ec59 Implemented story 4.3
```

Target: single clean commit `"Implemented story 5.1"` bundling all 3 changed/created files.

---

### FR / NFR Coverage

| Requirement | AC | Implementation |
|---|---|---|
| FR21: Total revenue display | AC1 | Metric card — `metrics.totalRevenue` (existing) |
| FR22: Billable revenue display | AC1 | Metric card — `metrics.billableRevenue` (existing) |
| FR23: Non-billable revenue display | AC1 | Metric card — `metrics.nonBillableRevenue` (existing) |
| FR24: Average hourly rate | AC1 | Metric card — `metrics.averageHourlyRate` (existing) |
| FR25: Task count | AC1 | Metric card — `metrics.totalTaskCount / billableTaskCount` (existing) |
| FR46: Empty state — no tasks | AC2 | `earnings-empty-no-tasks` message when `appState.tasks.length === 0` |
| FR47: No data for period | AC3 | `earnings-empty-no-period-data` when `totalTaskCount === 0` (tasks exist) |
| FR48: No billable work | AC4 | `earnings-empty-no-billable-work` when `billableFilter === 'billable'` + `totalTaskCount === 0` |
| FR49: Error recovery | AC5 | try-catch around `calculateSummaryMetrics`; `earnings-calculation-error` message |
| FR50: Edge case data functional | AC6 | `formatCurrency(0)` = `$0.00`; no NaN/Infinity guaranteed by Story 2.2 guard |
| FR27: Metrics update on filter change | AC1 | `useMemo([appState.tasks, appState.clients, state])` dep array unchanged |

---

### References

- [Story 5.1 ACs — `_bmad-output/planning-artifacts/epics.md` — Epic 5, Story 5.1]
- [Pre-audit: existing metrics grid — `src/pages/EarningsDashboard.tsx` (current state)]
- [Calculation function — `src/lib/earnings-calculations.ts` — `calculateSummaryMetrics`]
- [Storage types — `src/lib/earnings-dashboard-storage.ts` — `EarningsDashboardPersistedState`]
- [Dashboard state context — `src/context/EarningsDashboardStateContext.tsx`]
- [i18n — `src/context/LanguageContext.tsx`]
- [Previous story 4.4 — `_bmad-output/implementation-artifacts/4-4-chart-ux-polish-and-test-stability.md`]
- [Project context rules — `_bmad-output/project-context.md`]
- [Epic 4 retro — `_bmad-output/implementation-artifacts/epic-4-retro-2026-04-06.md`]
- [Deferred work — `_bmad-output/implementation-artifacts/deferred-work.md`]

---

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Completion Notes List

- Story 5.1 context engine analysis: the 5 metric cards are ALREADY fully implemented from Story 2.2. This story's primary work is conditional rendering of 4 empty state variants (FR46-FR49) and their i18n keys. FR50 requires no code changes — the calculation layer already handles edge cases safely.
- The `useMemo` refactor from `metrics` → `{ metrics, metricsError }` is the only structural change to the existing state logic. The try-catch wraps `calculateSummaryMetrics` only (not the entire useMemo body) to prevent false positives from framework errors.
- Empty state detection uses `appState.tasks.length === 0` for FR46 (GLOBAL task count, not filtered), and `metrics.totalTaskCount` for FR47/FR48 (filtered count from `filterTasksForEarnings`). This distinction is critical — see Condition Priority Order section.
- D1 action item from Epic 4 retro (remove stale RED PHASE comment) applied — ATDD spec is written clean with no `test.skip()` or RED PHASE header.
- The `addInitScript` callback for FR48 test passes TWO arguments (task seed + dashboard state seed). `page.addInitScript` signature accepts a callback and a single arg — use an array approach if needed or two separate `addInitScript` calls. **Correction**: Playwright `addInitScript` accepts a callback + one serializable arg. For two seeds, use two calls:
  ```typescript
  await page.addInitScript((taskData) => {
    localStorage.setItem('freelancer-kanban-data', JSON.stringify(taskData));
    localStorage.setItem('app-language', 'en');
  }, buildNonBillableSeed());
  await page.addInitScript((dashData) => {
    localStorage.setItem('earnings-dashboard-state', JSON.stringify(dashData));
  }, buildDashboardStateBillable());
  ```
- `{ exact: true }` is used on `getByText('Total Revenue')`, `getByText('Billable Revenue')`, etc. — "Billable Revenue" is a substring of "Non-Billable Revenue" (Story 2.2 debug log documented this exact Playwright strict-mode failure).

### File List

| Action | Path |
|--------|------|
| Edit | `src/context/LanguageContext.tsx` |
| Edit | `src/pages/EarningsDashboard.tsx` |
| Create | `tests/e2e/story-5-1-implement-summary-metrics-cards-and-edge-case-handling-atdd.spec.ts` |

### Review Findings

- [x] [Review][Patch] Missing unit test for AC5/FR49 error boundary [`src/pages/EarningsDashboard.test.tsx`] — Auto-fixed: added `[P0] calculation error shows earnings-calculation-error message` using `vi.spyOn(earningsCalc, "calculateSummaryMetrics").mockImplementation(() => { throw ... })`. Verifies `earnings-calculation-error` is rendered and `earnings-metrics` is absent.

### Change Log

| Date | Change |
|------|--------|
| 2026-04-06 | Story 5.1 created: ready-for-dev. Adds 4 empty state variants (FR46–FR49) to existing metric cards display (FR21–FR25 already implemented in Story 2.2). Single story for all of Epic 5. |
| 2026-04-06 | Story 5.1 implemented: added 4 i18n keys to LanguageContext.tsx, refactored useMemo with try-catch error handling, replaced unconditional metrics grid with conditional render block (5 states: error, no-tasks, no-billable-work, no-period-data, metrics). Updated 3 pre-existing tests (2 unit, 1 E2E) that expected empty task lists to show $0.00 metric cards — now correctly expect earnings-empty-no-tasks message. All 249 unit tests and 141 E2E tests pass. |
| 2026-04-06 | Story 5.1 code review complete. 1 patch finding auto-fixed (missing FR49 unit test). 3 findings dismissed. Story status: done. |
