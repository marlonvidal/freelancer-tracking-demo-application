# Story 3.1: Implement Customer Revenue Chart

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **user**,
I want **to see my revenue broken down by customer in a pie chart on the Earnings Dashboard**,
so that **I can quickly identify my most profitable clients for the selected date range and filter**.

## Acceptance Criteria

1. **Given** I have tasks assigned to multiple clients  
   **When** I view the Earnings Dashboard with "Customer" chart view selected (`state.activeChart === 'customer'`)  
   **Then** I see a pie chart showing each client's revenue as a proportional slice, with client name labels (FR4)

2. **Given** I hover over a chart segment  
   **When** I view the tooltip  
   **Then** I see the client name, exact revenue formatted as currency, and percentage of total revenue (FR8)

3. **Given** I click a legend item  
   **When** that client's slice is toggled  
   **Then** it is hidden from the chart and the remaining slices proportionally fill the chart (FR9)

4. **Given** I resize my browser window  
   **When** I view the chart  
   **Then** the chart automatically resizes to fit the available viewport width without horizontal scrolling (FR10)

5. **Given** the chart has many data points  
   **When** the page loads  
   **Then** the chart renders within 2 seconds with up to 5,000 tasks (FR43, NFR-P1)

6. **Given** there are no tasks in the selected date range (or all tasks filtered out by billable toggle)  
   **When** I view the customer chart  
   **Then** an informative "no data" message is shown instead of an empty chart

7. **Given** I switch from "Customer" chart view to "Project" or "Tag"  
   **When** the chart changes  
   **Then** the Customer chart is no longer rendered, and the date range and billable filter are preserved (FR7)

---

## Tasks / Subtasks

- [x] **Create `src/components/CustomerRevenueChart.tsx`** (AC: 1–6)
  - [x] Import from recharts: `PieChart`, `Pie`, `Cell`, `Tooltip`, `Legend`, `ResponsiveContainer`
  - [x] Define `CustomerRevenueChartProps` interface: `{ data: RevenueByCustomerRow[] }`
  - [x] Add `data-testid="customer-revenue-chart"` on the root wrapper div
  - [x] Implement stable color mapping (see Dev Notes — use `colorMap` keyed on `customerName`)
  - [x] Add `useState<Set<string>>` for `hiddenKeys` — toggle on legend click
  - [x] Implement `CustomTooltip` showing client name, `formatCurrency(revenue)`, and `(pct%)` (AC 2)
  - [x] Render `<Legend onClick={...}>` that toggles visibility of clicked slice (AC 3)
  - [x] Wrap chart in `<ResponsiveContainer width="100%" height={320}>` (AC 4)
  - [x] Render "no data" state using `t.earningsChartNoData` when `data.length === 0` (AC 6)
  - [x] Show chart section heading using `t.earningsCustomerChartTitle` (AC 1)
  - [x] Export single default component (react-refresh rule)

- [x] **Integrate `CustomerRevenueChart` into `src/pages/EarningsDashboard.tsx`** (AC: 1, 7)
  - [x] Import `calculateRevenueByCustomer` from `@/lib/earnings-calculations`
  - [x] Import `CustomerRevenueChart` from `@/components/CustomerRevenueChart`
  - [x] Add `useMemo` for `customerData`: call `calculateRevenueByCustomer(appState.tasks, appState.clients, resolveDateRangeMs(state, Date.now()), state.billableFilter)` (same deps as `metrics` memo)
  - [x] Conditionally render `<CustomerRevenueChart data={customerData} />` when `state.activeChart === 'customer'`
  - [x] Remove `t.earningsDashboardPlaceholder` paragraph (now replaced by chart/no-data message) or update it to no longer reference "later release"
  - [x] Insert chart section between metrics grid and filter controls

- [x] **Add i18n translation keys to `src/context/LanguageContext.tsx`** (AC: 1, 6)
  - [x] Add `earningsCustomerChartTitle` to both `en` and `pt` (see Dev Notes for values)
  - [x] Add `earningsChartNoData` to both `en` and `pt` (see Dev Notes for values)
  - [x] Add to TypeScript interface `Translations` (after existing earnings keys)
  - [x] **Never hardcode English/Portuguese text in JSX** — use `t.<key>` exclusively

- [x] **Add ATDD E2E spec `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts`** (AC: 1–7)
  - [x] Import from `../support/fixtures` (not directly from `@playwright/test`)
  - [x] Call `blockKnownThirdPartyHosts(page)` before all `page.goto()` calls
  - [x] Seed `app-language` to `'en'` via `addInitScript` in `beforeEach`
  - [x] P0 test: chart container `data-testid="customer-revenue-chart"` is visible when default `activeChart === 'customer'`
  - [x] P0 test: chart SVG element is present inside the container (`locator('[data-testid="customer-revenue-chart"] svg')`)
  - [x] P0 test: switching chart view selector to "Project" hides the customer chart container
  - [x] P1 test: no-data state shows no-data message when empty task list seeded (explicit `addInitScript` seeding required)
  - [x] P1 test: chart title text is visible (use `getByTestId` + `locator` to avoid SVG `getByText` issues)

---

## Dev Notes

### Component Architecture

**File:** `src/components/CustomerRevenueChart.tsx` — single default export, no named exports (react-refresh `only-export-components` rule).

**Props interface:**
```typescript
import type { RevenueByCustomerRow } from '@/lib/earnings-calculations';

interface CustomerRevenueChartProps {
  data: RevenueByCustomerRow[];
}
```

`RevenueByCustomerRow` is already exported from `src/lib/earnings-calculations.ts`:
```typescript
export type RevenueByCustomerRow = {
  customerId: string | null;
  customerName: string;
  totalRevenue: number;
  taskCount: number;
};
```

**Do NOT re-implement the aggregation** — `calculateRevenueByCustomer` already handles:
- Date-range filtering (via `filterTasksForEarnings`)
- Billable filter (via `filterTasksForEarnings`)
- Null `clientId` → "Unassigned" group name
- Revenue per customer via `getTaskBillableRevenue`

### recharts API — Exact Usage Pattern (v2.15.4)

recharts `^2.15.4` is already in `package.json`. **Do NOT add any new dependencies.**

```typescript
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
```

**Full component skeleton:**
```tsx
const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#06b6d4',
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const CustomerRevenueChart: React.FC<CustomerRevenueChartProps> = ({ data }) => {
  const { t } = useLanguage();
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  // Stable color assignment keyed on customerName — colors don't shift when items are hidden
  const colorMap = useMemo(
    () => new Map(data.map((row, i) => [row.customerName, CHART_COLORS[i % CHART_COLORS.length]])),
    [data],
  );

  const total = useMemo(
    () => data.reduce((sum, row) => sum + row.totalRevenue, 0),
    [data],
  );

  const visibleData = data.filter((row) => !hiddenKeys.has(row.customerName));

  const handleLegendClick = (entry: { value: string }) => {
    const key = entry.value;
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (data.length === 0) {
    return (
      <div data-testid="customer-revenue-chart" className="flex items-center justify-center h-48 rounded-lg border border-dashed">
        <p className="text-muted-foreground text-sm">{t.earningsChartNoData}</p>
      </div>
    );
  }

  return (
    <div data-testid="customer-revenue-chart" className="space-y-2">
      <h2 className="text-lg font-semibold">{t.earningsCustomerChartTitle}</h2>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={visibleData}
            dataKey="totalRevenue"
            nameKey="customerName"
            cx="50%"
            cy="50%"
            outerRadius="70%"
          >
            {visibleData.map((entry) => (
              <Cell
                key={`cell-${entry.customerId ?? 'unassigned'}`}
                fill={colorMap.get(entry.customerName) ?? '#6366f1'}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as RevenueByCustomerRow;
              const pct = total > 0 ? ((row.totalRevenue / total) * 100).toFixed(1) : '0.0';
              return (
                <div className="rounded-md border bg-popover p-2 text-sm shadow-md">
                  <p className="font-medium">{row.customerName}</p>
                  <p className="text-muted-foreground">
                    {formatCurrency(row.totalRevenue)} ({pct}%)
                  </p>
                </div>
              );
            }}
          />
          <Legend
            onClick={handleLegendClick}
            formatter={(value: string) => (
              <span
                style={{
                  textDecoration: hiddenKeys.has(value) ? 'line-through' : 'none',
                  opacity: hiddenKeys.has(value) ? 0.5 : 1,
                  cursor: 'pointer',
                }}
              >
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
```

**Key recharts v2 conventions:**
- `ResponsiveContainer` **must** have a numeric or string `height` — `height="100%"` alone fails; use `height={320}` (a number in px)
- `Pie` `nameKey` is the field used by `Legend` for display names — must match the data field name exactly
- `Pie` `dataKey` is the numeric field for slice sizes — must be a positive number per slice
- `Cell` `key` must be unique; use `customerId ?? 'unassigned'` not array index (prevents React key warning on re-renders)
- `Legend` `onClick` receives `{ value: string, payload: ... }` — `entry.value` equals the `nameKey` value of that item

### EarningsDashboard.tsx Integration

**Add memo for customer data** (alongside existing `metrics` memo):
```tsx
const customerData = useMemo(
  () =>
    calculateRevenueByCustomer(
      appState.tasks,
      appState.clients,
      resolveDateRangeMs(state, Date.now()),
      state.billableFilter,
    ),
  [appState.tasks, appState.clients, state],
);
```

**Import additions to EarningsDashboard.tsx:**
```tsx
import { calculateRevenueByCustomer, calculateSummaryMetrics, resolveDateRangeMs } from '@/lib/earnings-calculations';
import CustomerRevenueChart from '@/components/CustomerRevenueChart';
```

**Conditional render** — insert between metrics grid and filter controls section:
```tsx
{state.activeChart === 'customer' && (
  <CustomerRevenueChart data={customerData} />
)}
```

**Placeholder text:** Remove `<p className="mt-4 text-muted-foreground max-w-2xl">{t.earningsDashboardPlaceholder}</p>` — the charts now replace this placeholder. This does NOT require removing the `earningsDashboardPlaceholder` i18n key from `LanguageContext.tsx` (other tests or future stories may reference it via the key, but the UI element is removed here). If the E2E test for Story 1.1 relies on the placeholder text, check `tests/e2e/story-1-1-*.spec.ts` — if so, update that test to assert on the chart heading instead.

### i18n Keys to Add

Add ALL of the following to **both `en` and `pt`** objects AND the `Translations` interface in `src/context/LanguageContext.tsx`:

| Key | English | Portuguese |
|-----|---------|------------|
| `earningsCustomerChartTitle` | `'Revenue by Customer'` | `'Receita por Cliente'` |
| `earningsChartNoData` | `'No data for this period'` | `'Sem dados para este período'` |

Place them after the existing earnings keys (after `earningsTaskCountBillable`).

**Never hardcode English or Portuguese text in JSX** — all visible strings must use `t.<key>`. This is a non-negotiable project rule from Epic 1 retro.

### Currency Formatting

No shared formatter exists yet. Add a local `formatCurrency` to `CustomerRevenueChart.tsx`:
```typescript
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
```

This duplicates the formatter from `EarningsDashboard.tsx`. Per project-context.md: keep local for now — Epic 6's retro will handle consolidation. **Do NOT move to `src/lib/utils.ts`** yet.

### Color Palette

Use the hardcoded hex array `CHART_COLORS` defined at module level (outside the component). These are intentionally not Tailwind CSS variables because recharts SVG `fill` attributes require resolved color values, not `hsl(var(--...))` CSS variables (CSS variables do not resolve inside SVG `fill` inline styles).

### Performance — useMemo

Wrap `calculateRevenueByCustomer` call in `useMemo` in `EarningsDashboard.tsx`. With 5,000 tasks, the aggregation remains fast (linear scan), but avoiding re-computation on unrelated re-renders keeps the 2-second render budget (FR43, NFR-P1). Match the dependency array `[appState.tasks, appState.clients, state]` used by the existing `metrics` memo.

**Do NOT compute `Date.now()` inside `useMemo` to use as a reactive dependency** — match the established pattern from Story 2.2 (`Date.now()` captured once at memo evaluation time).

### Architecture Compliance

- **Client-only SPA** — no network calls; data flows from `AppContext` via props into the chart component
- **No new localStorage keys** — this story reads only existing state
- **No new dependencies** — recharts is already in `package.json`; do not `npm install` anything
- **No changes to `AppState`, reducer, or `loadState/saveState`** — pure display + calculation
- **Filter state preserved on chart switch** — handled by existing `EarningsDashboardStateContext`; no special code needed

### File Structure

| Action | Path | Notes |
|--------|------|-------|
| Add | `src/components/CustomerRevenueChart.tsx` | New pie chart component — single default export |
| Edit | `src/pages/EarningsDashboard.tsx` | Add `customerData` memo + conditional chart render + remove placeholder `<p>` |
| Edit | `src/context/LanguageContext.tsx` | Add 2 new i18n keys to `en`, `pt`, and `Translations` interface |
| Add | `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts` | Playwright E2E ATDD |

### E2E Testing — Playwright Patterns (CRITICAL)

**Standing conventions (from Epic 2 retro — already in `project-context.md`):**
- **Always use `--workers=1`** for local E2E runs: `npx playwright test --workers=1`
- **Always use `{ exact: true }`** with `getByText()` when text could match as substring
- **Always seed explicit app state** via `addInitScript` for count-sensitive or empty-state tests — the app default ships 5 sample tasks

**recharts SVG assertions (from project-context.md Action B2):**
- SVG `<text>` elements are NOT reached by standard `getByText()` — instead scope to the chart container:
  ```typescript
  // Chart container must exist
  await expect(page.getByTestId('customer-revenue-chart')).toBeVisible();
  // SVG element present (chart rendered, not just container)
  await expect(page.locator('[data-testid="customer-revenue-chart"] svg')).toBeVisible();
  ```
- Tooltip hover: call `hover()` on the chart area SVG, then await the tooltip container's visibility (not its text content directly):
  ```typescript
  const chartSvg = page.locator('[data-testid="customer-revenue-chart"] svg');
  await chartSvg.hover({ position: { x: 100, y: 100 } });
  await expect(page.locator('.rounded-md.border.bg-popover')).toBeVisible({ timeout: 3000 });
  ```
- Legend click assertions: assert on the strikethrough text style or chart data change, not on the legend element's internal DOM directly
- **Do NOT use `page.getByText()` to assert on SVG text content** (e.g., customer names rendered inside the pie chart legend) — recharts renders these inside `<svg><text>` elements not traversable by aria role queries

**E2E spec template:**
```typescript
import { test, expect } from '../support/fixtures';
import { blockKnownThirdPartyHosts } from '../support/helpers/network';

test.describe('Story 3.1 ATDD — Customer Revenue Chart', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('app-language', 'en');
    });
  });

  test('[P0] customer revenue chart container is visible in default customer chart view', async ({ page }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('customer-revenue-chart')).toBeVisible();
  });

  test('[P0] recharts SVG element is rendered inside the chart container', async ({ page }) => {
    await page.addInitScript(() => {
      const now = Date.now();
      const seed = {
        tasks: [{ id: 't1', title: 'Task', columnId: 'col-1', clientId: 'c1', isBillable: true,
          hourlyRate: 100, timeSpent: 3600, createdAt: now, priority: 'medium', description: '',
          timeEstimate: null, dueDate: null, tags: [], order: 0 }],
        columns: [{ id: 'col-1', title: 'Todo', order: 0 }],
        clients: [{ id: 'c1', name: 'Acme Corp', hourlyRate: 100, color: '#6366f1' }],
        version: 1,
      };
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(seed));
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.locator('[data-testid="customer-revenue-chart"] svg')).toBeVisible();
  });

  test('[P0] switching to Project view hides the customer chart container (FR7)', async ({ page }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    // Default is customer view
    await expect(page.getByTestId('customer-revenue-chart')).toBeVisible();
    // Switch to project view via the chart selector
    await page.getByLabel('Chart').click();
    // ...select Project item from the dropdown
    // customer chart should no longer be visible
    await expect(page.getByTestId('customer-revenue-chart')).not.toBeVisible();
  });

  test('[P1] no-data state shows no-data message when task list is empty', async ({ page }) => {
    await page.addInitScript(() => {
      const empty = { tasks: [], columns: [], clients: [], version: 1 };
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(empty));
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('customer-revenue-chart')).toBeVisible();
    await expect(page.getByText('No data for this period', { exact: true })).toBeVisible();
  });
});
```

**Note on chart selector interaction:** The chart view selector in `EarningsDashboard.tsx` is a shadcn `<Select>` with label `{t.earningsChartViewLabel}` (= 'Chart'). To switch views in Playwright:
```typescript
await page.getByLabel('Chart').click();
await page.getByRole('option', { name: 'Project' }).click();
```

### Previous Story Intelligence (Story 2.2 + 2.1)

- **Do NOT re-implement** `calculateRevenueByCustomer`, `filterTasksForEarnings`, `getTaskBillableRevenue`, or date range resolution — all exported from `src/lib/earnings-calculations.ts`
- **`BillableFilter`** type: import from `@/lib/earnings-calculations` (re-exported there); do not import from `earnings-dashboard-storage` directly
- **`useApp()` hook:** exported as `useApp` (not `useAppContext`) from `@/context/AppContext`
- **EarningsDashboard component tree:** `EarningsDashboard` → `AppProvider` → `EarningsDashboardStateProvider` → `EarningsDashboardContent` — all contexts accessible without prop drilling inside `EarningsDashboardContent`
- **Vitest test count at Epic 2 completion:** 101 passing; Playwright: 69 passing — protect this baseline, do not introduce regressions
- **Story 2.2 Review Fix:** `getByText("Billable Revenue")` without `{ exact: true }` matched "Non-Billable Revenue" in Playwright strict mode — always use `{ exact: true }` for label assertions

### Git Intelligence

- Recent commit pattern: focused bundles (e.g., `Implemented story 2.2` bundled calculations + display + i18n + tests)
- For Story 3.1, expect: `CustomerRevenueChart.tsx` (new) + `EarningsDashboard.tsx` (edit) + `LanguageContext.tsx` (2 keys) + E2E spec (new)
- No `package.json` changes expected (no new dependencies)
- Previous story files bundled in single commit — follow same pattern

### Latest Technical Notes

- **recharts v2.15.4:** Current stable 2.x API. `ResponsiveContainer` + `PieChart` + `Pie` + `Cell` + `Tooltip` + `Legend` — all available, no breaking changes between 2.x minor versions for these components
- **TypeScript + recharts:** recharts ships its own types; `payload[0].payload` in Tooltip `content` prop is typed as `any` — cast with `as RevenueByCustomerRow` for type safety (TypeScript strict is off, so this won't error)
- **`outerRadius="70%"`:** Using percentage string keeps the chart proportional inside `ResponsiveContainer` on different viewport widths — prefer over fixed pixel values for responsiveness (FR10)
- **shadcn/ui `Card`:** Already used for metrics grid; not required for the chart section but can wrap `CustomerRevenueChart` in `EarningsDashboard` for visual consistency: `<Card><CardContent className="pt-4"><CustomerRevenueChart data={customerData} /></CardContent></Card>`

### References

- [Story 3.1 ACs — `_bmad-output/planning-artifacts/epics.md` — Epic 3, Story 3.1]
- [FR4, FR8, FR9, FR10, FR43 — `_bmad-output/planning-artifacts/epics.md` — Requirements Inventory]
- [recharts SVG Playwright patterns — `_bmad-output/project-context.md` — E2E Standing Conventions]
- [Calculation API — `src/lib/earnings-calculations.ts` — `calculateRevenueByCustomer`, `RevenueByCustomerRow`]
- [Earnings filter state — `src/lib/earnings-dashboard-storage.ts` — `ActiveChartView`, `EarningsDashboardPersistedState`]
- [Dashboard state context — `src/context/EarningsDashboardStateContext.tsx`]
- [App state hook `useApp` — `src/context/AppContext.tsx`]
- [Dashboard component tree — `src/pages/EarningsDashboard.tsx`]
- [Domain types — `src/types/index.ts` — `Task`, `Client`, `Column`]
- [i18n pattern + existing earnings keys — `src/context/LanguageContext.tsx`]
- [Previous story learnings — `_bmad-output/implementation-artifacts/2-2-implement-summary-metrics-calculations.md`]
- [Epic 2 retro action items B1, B2 — `_bmad-output/implementation-artifacts/epic-2-retro-2026-04-05.md`]
- [shadcn Card — `src/components/ui/card.tsx`]
- [E2E fixture pattern — `tests/support/fixtures/`]

---

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (2026-04-05)

### Debug Log References

- ResizeObserver not defined in jsdom test environment — fixed by adding global mock in `src/test/setup.ts`
- recharts Legend renders small SVG icons per item, causing strict mode violation for `[data-testid="customer-revenue-chart"] svg` locator — fixed by appending `.first()` to target main chart SVG
- Tooltip test hover position (100, 100) was outside pie chart slice (pie center at 50%/50% with outerRadius=70%) — fixed by computing bounding box center dynamically
- Unit tests for `EarningsDashboard.test.tsx` checked for removed placeholder paragraph text — updated tests to reflect new heading-only state

### Completion Notes List

- Created `src/components/CustomerRevenueChart.tsx`: recharts PieChart with ResponsiveContainer, stable colorMap, hiddenKeys legend toggle, custom tooltip with formatCurrency + percentage, no-data state, i18n strings
- Updated `src/pages/EarningsDashboard.tsx`: added `calculateRevenueByCustomer` import + `customerData` useMemo, conditional render of `<CustomerRevenueChart>` when `activeChart === 'customer'`, removed placeholder paragraph
- Updated `src/context/LanguageContext.tsx`: added `earningsCustomerChartTitle` and `earningsChartNoData` to Translations interface + en/pt values
- Updated `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts`: removed all 10 `test.skip()` markers; fixed SVG locators to use `.first()` and tooltip hover to use bounding box center
- Updated `src/test/setup.ts`: added global ResizeObserver mock for jsdom compatibility
- Updated `src/pages/EarningsDashboard.test.tsx`: removed assertions on placeholder text (removed per story spec)
- All tests pass: 109 unit tests + 79 E2E tests (10 new story 3.1 tests)

### File List

- `src/components/CustomerRevenueChart.tsx` (new)
- `src/pages/EarningsDashboard.tsx` (modified)
- `src/context/LanguageContext.tsx` (modified)
- `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts` (modified — test.skip removed, locator fixes)
- `src/test/setup.ts` (modified — ResizeObserver mock)
- `src/pages/EarningsDashboard.test.tsx` (modified — removed placeholder text assertions)

### Review Findings

- [x] [Review][Patch] Stale "TDD RED PHASE" comment in E2E spec misleads future readers [tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts:7-14] — fixed
- [x] [Review][Defer] `visibleData` not memoized — `data.filter()` runs on every render [src/components/CustomerRevenueChart.tsx:40] — deferred, pre-existing optimization pattern
- [x] [Review][Defer] `hiddenKeys` not reset on filter/date range change — hidden customers persist across filter switches [src/components/CustomerRevenueChart.tsx:28] — deferred, not in spec ACs
- [x] [Review][Defer] All-slices-hidden shows blank SVG with no user-facing explanation [src/components/CustomerRevenueChart.tsx:40] — deferred, not in spec scope
- [x] [Review][Defer] Performance E2E test timing fragility — `elapsed` includes full page.goto overhead, may flake in slow CI [tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts:375-385] — deferred, consistent with existing deferred-work.md entry (story 1-1)
