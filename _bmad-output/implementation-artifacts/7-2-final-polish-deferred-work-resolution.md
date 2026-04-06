# Story 7.2: Final Polish & Deferred Work Resolution

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **user and developer**,
I want **all outstanding deferred work items resolved and the codebase polished before MVP release**,
so that **the application is genuinely accessible, well-tested, and internally consistent with no known quality gaps**.

## Acceptance Criteria

1. **Given** I use a screen reader on the dashboard
   **When** I encounter the dark mode toggle button
   **Then** it is announced with a locale-aware name ("Dark mode" / "Light mode" in EN; "Modo escuro" / "Modo claro" in PT) (WCAG 2.1 SC 4.1.2 — resolves deferred item from Story 7.1 review)

2. **Given** a screen reader user navigates the dashboard by landmarks
   **When** they traverse ARIA regions
   **Then** the metrics section appears as a named `region` landmark (not an anonymous div) (resolves deferred item from Story 7.1 review)

3. **Given** I open the custom date range picker and select a start date
   **When** I then select the end date
   **Then** the calendar popover closes automatically without requiring a manual click outside (resolves D4 — deferred since Story 4.1 review, 5 epics ago)

4. **Given** I view the chart view control in the filter section
   **When** I compare it with the date range presets and billable toggle
   **Then** the chart view control is a button group (not a `<Select>` dropdown), visually and structurally consistent with the other filter controls (resolves D5 — deferred since Epic 4 retro)

5. **Given** chart components render revenue data
   **When** the `visibleData` array is computed from the full data filtered by `hiddenKeys`
   **Then** the computation is memoized with `useMemo` in all three chart components (resolves performance deferred item from Stories 3.1–3.3)

6. **Given** the sr-only `<ul>` data summary in each chart component has both `aria-labelledby` and `aria-label`
   **When** the ARIA spec is applied (aria-labelledby takes precedence)
   **Then** the redundant `aria-label` attribute is removed — leaving only `aria-labelledby` (resolves ARIA dead code deferred item from Story 7.1 review)

7. **Given** E2E performance tests capture elapsed time for chart render
   **When** the timer starts and ends
   **Then** `const start = Date.now()` is placed AFTER `await page.goto()` completes (not before), eliminating navigation latency from the render budget (resolves deferred items from Stories 3.1–3.4)

8. **Given** the `[P0]` calculation error E2E test in story-7-1 spec currently has no guaranteed assertion path
   **When** it is rewritten
   **Then** it makes a real assertion — verifying that corrupt localStorage data triggers the storage fallback and the dashboard renders safely with default data (resolves zombie test from Story 7.1 review)

9. **Given** a task has a corrupt negative `timeSpent` value
   **When** `calculateSummaryMetrics` runs
   **Then** negative `timeSpent` values are clamped to 0, preventing a negative `averageHourlyRate` from appearing in the UI (resolves edge case deferred from Story 2.2 review)

---

## Tasks / Subtasks

- [x] **Add `lightModeLabel` and `darkModeLabel` translation keys to `src/context/LanguageContext.tsx`** (AC: 1)
  - [x] Add to `Translations` interface: `lightModeLabel: string` and `darkModeLabel: string`
  - [x] EN: `lightModeLabel: 'Light mode'`, `darkModeLabel: 'Dark mode'`
  - [x] PT: `lightModeLabel: 'Modo claro'`, `darkModeLabel: 'Modo escuro'`

- [x] **Fix dark mode toggle `aria-label` in `src/components/Header.tsx`** (AC: 1)
  - [x] Add `aria-label={state.isDarkMode ? t.lightModeLabel : t.darkModeLabel}` to the dark mode `<Button>` at line 121
  - [x] Confirm `t` is not shadowed at the call site (see Dev Notes)

- [x] **Add `role="region"` to metrics div in `src/pages/EarningsDashboard.tsx`** (AC: 2)
  - [x] Add `role="region"` to `<div data-testid="earnings-metrics" aria-live="polite" aria-label={...}>` (line 158)

- [x] **Calendar popover auto-close in `src/components/DateRangeFilter.tsx`** (AC: 3)
  - [x] Add `setOpen(false)` inside the `useEffect` when `calendarRange?.from && calendarRange?.to` (see Dev Notes — one-line fix)

- [x] **Convert chart view selector to button group in `src/pages/EarningsDashboard.tsx`** (AC: 4)
  - [x] Remove `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` imports (unused after change)
  - [x] Replace `<Select>` block with a `role="group"` div containing three `<Button>` elements (see Dev Notes)
  - [x] Each button uses `variant={state.activeChart === chart ? 'default' : 'outline'}` and `aria-pressed`
  - [x] Add `data-testid="chart-view-selector"` on wrapper div, `data-testid="chart-view-{chart}"` on each button
  - [x] Remove `Label htmlFor` (no longer targeting an `id`); keep label text via `<Label>` without `htmlFor`

- [x] **Memoize `visibleData` in all three chart components** (AC: 5)
  - [x] `src/components/CustomerRevenueChart.tsx` — wrap `data.filter(...)` in `useMemo([data, hiddenKeys])`
  - [x] `src/components/ProjectRevenueChart.tsx` — same pattern
  - [x] `src/components/TagRevenueChart.tsx` — same pattern

- [x] **Remove `aria-label` dead code from sr-only `<ul>` in all three chart components** (AC: 6)
  - [x] `src/components/CustomerRevenueChart.tsx` — remove `aria-label={...}` from `<ul className="sr-only">`; keep `aria-labelledby`
  - [x] `src/components/ProjectRevenueChart.tsx` — same
  - [x] `src/components/TagRevenueChart.tsx` — same

- [x] **Move E2E performance timers to start after `page.goto()` in timing tests** (AC: 7)
  - [x] `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts`
  - [x] `tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts`
  - [x] `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts`
  - [x] `tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts`

- [x] **Rewrite zombie test in story-7-1 ATDD spec** (AC: 8)
  - [x] Replace the conditional `if (errorEl.isVisible())` / `if (emptyEl.isVisible())` test with a real assertion about storage fallback behavior (see Dev Notes)
  - [x] Update the chart-switch test to use button `data-testid` instead of `page.getByRole('combobox')` (broken by AC4)

- [x] **Guard negative `timeSpent` in `src/lib/earnings-calculations.ts`** (AC: 9)
  - [x] In `calculateSummaryMetrics`, change `billableTimeSpentSec += task.timeSpent` to `billableTimeSpentSec += Math.max(0, task.timeSpent)`

- [x] **Create `tests/e2e/story-7-2-final-polish-deferred-work-resolution-atdd.spec.ts`** (AC: 1, 2, 3, 4)
  - [x] [P0] Dark mode button has locale-aware aria-label in EN ("Dark mode")
  - [x] [P0] Dark mode button has locale-aware aria-label in PT ("Modo escuro")
  - [x] [P0] Metrics div has `role="region"`
  - [x] [P1] Calendar popover auto-closes after full date range selection
  - [x] [P1] Chart view buttons visible; switching to project chart shows project heading

---

## Dev Notes

### Pre-Implementation Audit — Current Code State

**`src/components/Header.tsx`** (current state as of Story 7.1):
- `t` is destructured at line 22: `const { language, setLanguage, t } = useLanguage();`
- SHADOWING RISK: Line 24 uses `state.tasks.find(t => t.id === activeTaskId)` — the `t` here is an arrow function parameter scoped to the `find()` callback, NOT shadowing the outer `t`. `t.lightModeLabel` is safe to use at line 121.
- Dark mode button at lines 121–131: currently has **no `aria-label`**. Fix: add `aria-label={state.isDarkMode ? t.lightModeLabel : t.darkModeLabel}`.

**`src/components/DateRangeFilter.tsx`** (current state as of Story 6.1):
- `const [open, setOpen] = useState(false)` already exists (line 52)
- `<Popover open={open} onOpenChange={setOpen}>` already exists (line 92)
- The `useEffect` at lines 54–61 runs when `calendarRange` changes and dispatches `setCustomDateRange` when both dates are set
- **D4 fix is literally one line**: add `setOpen(false)` inside the if-block of the `useEffect`

**`src/pages/EarningsDashboard.tsx`** (current state as of Story 7.1):
- Metrics div at line 157–162: has `aria-live="polite"` and `aria-label` but is missing `role="region"`. Fix: add `role="region"`.
- Chart selector at lines 233–248: uses `<Select>` with `setActiveChartView`. The `Select` imports at lines 19–25 will become unused after conversion.
- `setActiveChartView` is the correct dispatch function to call; it accepts `ActiveChartView` type (`'customer' | 'project' | 'tag'`).

**`src/components/CustomerRevenueChart.tsx`** (current state as of Story 7.1):
- Line 42: `const visibleData = data.filter((row) => !hiddenKeys.has(row.customerName));` — NOT memoized.
- Line 67–80: sr-only `<ul>` has BOTH `aria-labelledby="customer-chart-heading"` AND `aria-label={...}`. The `aria-label` attribute is dead code per ARIA spec.
- `useMemo` is already imported (line 1).

---

### AC1 — Dark Mode Button `aria-label`

**In `src/context/LanguageContext.tsx`**, add to the `Translations` interface (after `earningsChartSrDataSummary`):

```typescript
// Color scheme toggle
lightModeLabel: string;
darkModeLabel: string;
```

Add to `en` object:
```typescript
lightModeLabel: 'Light mode',
darkModeLabel: 'Dark mode',
```

Add to `pt` object:
```typescript
lightModeLabel: 'Modo claro',
darkModeLabel: 'Modo escuro',
```

**In `src/components/Header.tsx`**, add `aria-label` to the dark mode button (currently lines 121–131):

```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
  aria-label={state.isDarkMode ? t.lightModeLabel : t.darkModeLabel}
>
  {state.isDarkMode ? (
    <Sun className="h-4 w-4" />
  ) : (
    <Moon className="h-4 w-4" />
  )}
</Button>
```

---

### AC2 — Metrics Div `role="region"`

**In `src/pages/EarningsDashboard.tsx`**, at the metrics `<div>` (line 157–162):

```tsx
{/* BEFORE */}
<div
  data-testid="earnings-metrics"
  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
  aria-live="polite"
  aria-label={t.earningsDashboardHeading}
>

{/* AFTER */}
<div
  data-testid="earnings-metrics"
  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
  role="region"
  aria-live="polite"
  aria-label={t.earningsDashboardHeading}
>
```

That's the entire change — one attribute added.

---

### AC3 — Calendar Popover Auto-Close (D4 — One-Line Fix)

**In `src/components/DateRangeFilter.tsx`**, update the `useEffect` at lines 54–61:

```tsx
// BEFORE
useEffect(() => {
  if (calendarRange?.from && calendarRange?.to) {
    setCustomDateRange({
      startMs: startOfDay(calendarRange.from).getTime(),
      endMs: endOfDay(calendarRange.to).getTime(),
    });
  }
}, [calendarRange, setCustomDateRange]);

// AFTER
useEffect(() => {
  if (calendarRange?.from && calendarRange?.to) {
    setCustomDateRange({
      startMs: startOfDay(calendarRange.from).getTime(),
      endMs: endOfDay(calendarRange.to).getTime(),
    });
    setOpen(false);  // ← D4 resolved: auto-close after full range selection
  }
}, [calendarRange, setCustomDateRange]);
```

No other changes to `DateRangeFilter.tsx`. The `open` state and `Popover open={open} onOpenChange={setOpen}` pattern are already in place from Story 4.1.

---

### AC4 — Chart View Selector → Button Group (D5)

**In `src/pages/EarningsDashboard.tsx`**:

**Step 1** — Remove unused Select imports (lines 19–25):
```tsx
// REMOVE these imports entirely (unused after conversion):
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
```

**Step 2** — Replace the `<Select>` block (lines 233–248) with a button group:

```tsx
{/* BEFORE */}
<div className="space-y-2">
  <Label htmlFor="earnings-chart-view">{t.earningsChartViewLabel}</Label>
  <Select
    value={state.activeChart}
    onValueChange={(v) => setActiveChartView(v as ActiveChartView)}
  >
    <SelectTrigger id="earnings-chart-view" className="max-w-md">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="customer">{t.earningsChartCustomer}</SelectItem>
      <SelectItem value="project">{t.earningsChartProject}</SelectItem>
      <SelectItem value="tag">{t.earningsChartTag}</SelectItem>
    </SelectContent>
  </Select>
</div>

{/* AFTER */}
<div className="space-y-2">
  <Label>{t.earningsChartViewLabel}</Label>
  <div
    className="flex flex-wrap gap-2"
    data-testid="chart-view-selector"
    role="group"
    aria-label={t.earningsChartViewLabel}
  >
    {(['customer', 'project', 'tag'] as const).map((chart) => (
      <Button
        key={chart}
        type="button"
        variant={state.activeChart === chart ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActiveChartView(chart)}
        data-testid={`chart-view-${chart}`}
        aria-pressed={state.activeChart === chart}
      >
        {chart === 'customer'
          ? t.earningsChartCustomer
          : chart === 'project'
          ? t.earningsChartProject
          : t.earningsChartTag}
      </Button>
    ))}
  </div>
</div>
```

**Important:** `setActiveChartView` already accepts `ActiveChartView` type; no type assertion needed since the array is typed `as const`. The `ActiveChartView` import at line 8 is still needed.

**`data-testid` inventory for new control:**

| `data-testid` | Element |
|---|---|
| `chart-view-selector` | wrapper `div` (the group) |
| `chart-view-customer` | Customer button |
| `chart-view-project` | Project button |
| `chart-view-tag` | Tag button |

---

### AC5 — Memoize `visibleData` in Chart Components

Apply identical pattern to all three chart components.

**`src/components/CustomerRevenueChart.tsx`** — current line 42:
```tsx
// BEFORE (runs on every render)
const visibleData = data.filter((row) => !hiddenKeys.has(row.customerName));

// AFTER (memoized)
const visibleData = useMemo(
  () => data.filter((row) => !hiddenKeys.has(row.customerName)),
  [data, hiddenKeys],
);
```

**`src/components/ProjectRevenueChart.tsx`** — same pattern, with `row.columnTitle` instead of `row.customerName`.

**`src/components/TagRevenueChart.tsx`** — same pattern, with the tag key used in that component (check actual field name).

`useMemo` is already imported in all three files — no new imports needed.

---

### AC6 — Remove `aria-label` Dead Code from sr-only `<ul>`

**`src/components/CustomerRevenueChart.tsx`** — line 67–70:
```tsx
{/* BEFORE */}
<ul
  className="sr-only"
  aria-labelledby="customer-chart-heading"
  aria-label={`${t.earningsCustomerChartTitle} — ${t.earningsChartSrDataSummary}`}
>

{/* AFTER */}
<ul
  className="sr-only"
  aria-labelledby="customer-chart-heading"
>
```

Apply the same removal to `ProjectRevenueChart.tsx` and `TagRevenueChart.tsx` — remove only the `aria-label` attribute from the `<ul className="sr-only">`. Keep `aria-labelledby`.

Also: `t.earningsChartSrDataSummary` will no longer be used in any chart component after this change. Confirm it's still used elsewhere before removing the translation key. (**It is not used elsewhere** — but keep the key in `LanguageContext.tsx`; removing translation keys that may have been used in a previous story's E2E test assertions is risky and provides no benefit.)

---

### AC7 — Fix E2E Performance Timer Position

In each timing test across stories 3.1–3.4, locate the pattern:

```typescript
// BEFORE — timer starts before goto, includes navigation latency
const start = Date.now();
await page.goto('/earnings');
// ... wait for chart ...
const elapsed = Date.now() - start;
expect(elapsed).toBeLessThan(2000);
```

Fix by moving `const start = Date.now()` to AFTER the `await page.goto()` call:

```typescript
// AFTER — timer starts after navigation, measures only chart render
await page.goto('/earnings');
const start = Date.now();
// ... wait for chart ...
const elapsed = Date.now() - start;
expect(elapsed).toBeLessThan(2000);
```

**Files to update:**
- `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts` — check around line 370
- `tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts` — same pattern
- `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts` — same pattern
- `tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts` — may have multiple timer instances; fix all of them

**IMPORTANT:** Do NOT change the `expect(elapsed).toBeLessThan(2000)` threshold. Only move the timer start.

---

### AC8 — Fix Zombie Test in Story 7.1 ATDD Spec

**File:** `tests/e2e/story-7-1-implement-accessibility-wcag-2-1-aa-for-dashboard-atdd.spec.ts`

**Change 1 — Rewrite the zombie test** (currently `[P0] Calculation error state has role="alert"`):

```typescript
// BEFORE — always passes unconditionally; both if-branches can be skipped
test('[P0] Calculation error state has role="alert" (AC1/NFR-A1)', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('freelancer-kanban-data', 'not-valid-json{{{');
  });
  await blockKnownThirdPartyHosts(page);
  await page.goto('/earnings');
  await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

  const errorEl = page.getByTestId('earnings-calculation-error');
  if (await errorEl.isVisible()) {
    await expect(errorEl).toHaveAttribute('role', 'alert');
  }
  const emptyEl = page.getByTestId('earnings-empty-no-tasks');
  if (await emptyEl.isVisible()) {
    await expect(emptyEl).toHaveAttribute('role', 'status');
  }
});

// AFTER — real assertion: corrupt JSON triggers storage fallback, app renders safely
test('[P0] Corrupt storage data — dashboard falls back to default state without crashing (AC1/NFR-A1)', async ({ page }) => {
  await page.addInitScript(() => {
    // loadState() catches JSON.parse errors and returns getDefaultState() (5 sample tasks)
    // This test verifies the fallback path: dashboard still renders, not blank or crashed
    localStorage.setItem('freelancer-kanban-data', 'not-valid-json{{{');
  });
  await blockKnownThirdPartyHosts(page);
  await page.goto('/earnings');
  await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

  // Storage layer falls back to default state — metrics grid must be visible (not error state)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('earnings-metrics')).toBeVisible();
});
```

**Change 2 — Update chart-switch test** (currently uses `page.getByRole('combobox')` — broken by AC4 converting to buttons):

```typescript
// BEFORE — targets <Select> combobox (no longer exists after AC4)
const chartSelect = page.getByRole('combobox');
await chartSelect.selectOption('project');
// ...
await chartSelect.selectOption('tag');

// AFTER — targets button group data-testids
await page.getByTestId('chart-view-project').click();
// ...
await page.getByTestId('chart-view-tag').click();
```

**Change 3 — Update keyboard nav test** (currently checks `getByRole('combobox')` focusability):

```typescript
// BEFORE
const chartSelect = page.getByRole('combobox');
await expect(chartSelect).toBeVisible();
await chartSelect.focus();
await expect(chartSelect).toBeFocused();

// AFTER — test chart view button is focusable (same keyboard accessibility intent)
const customerBtn = page.getByTestId('chart-view-customer');
await expect(customerBtn).toBeVisible();
await customerBtn.focus();
await expect(customerBtn).toBeFocused();
```

---

### AC9 — Guard Negative `timeSpent` in `calculateSummaryMetrics`

**In `src/lib/earnings-calculations.ts`**, at the `billableTimeSpentSec` accumulation (currently line 326):

```typescript
// BEFORE
billableTimeSpentSec += task.timeSpent;

// AFTER — clamp negative values to 0; prevents negative averageHourlyRate
billableTimeSpentSec += Math.max(0, task.timeSpent);
```

This is a single-character change in a well-tested utility. Existing unit tests will continue to pass (they don't test negative values). The unit test for this guard should be added in the ATDD spec or as a Vitest test (see ATDD spec below).

---

### ATDD Spec — Full Implementation

**File:** `tests/e2e/story-7-2-final-polish-deferred-work-resolution-atdd.spec.ts`

```typescript
import { test, expect } from '../support/fixtures';
import { blockKnownThirdPartyHosts } from '../support/helpers/network';

// Normal seed: two billable tasks within last30 range (renders metrics + charts)
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

test.describe('Story 7.2 — Final Polish & Deferred Work Resolution', () => {

  // ── AC1: Dark mode button has locale-aware aria-label ──────────────────────

  test('[P0] Dark mode toggle has locale-aware aria-label in English (AC1)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('app-language', 'en');
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    // In light mode (default), button should say "Dark mode" (action available)
    const darkModeBtn = page.getByRole('button', { name: 'Dark mode' });
    await expect(darkModeBtn).toBeVisible();
  });

  test('[P0] Dark mode toggle has locale-aware aria-label in Portuguese (AC1)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('app-language', 'pt');
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    // PT: button should say "Modo escuro"
    const darkModeBtn = page.getByRole('button', { name: 'Modo escuro' });
    await expect(darkModeBtn).toBeVisible();
  });

  // ── AC2: Metrics region is a named ARIA landmark ───────────────────────────

  test('[P0] Metrics section has role="region" making it a named landmark (AC2)', async ({ page }) => {
    await page.addInitScript((data) => {
      localStorage.setItem('app-language', 'en');
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(data));
    }, buildNormalSeed());
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    const metricsDiv = page.getByTestId('earnings-metrics');
    await expect(metricsDiv).toBeVisible();
    await expect(metricsDiv).toHaveAttribute('role', 'region');
  });

  // ── AC3: Calendar popover auto-closes after range selection (D4) ──────────

  test('[P1] Date picker popover closes automatically after selecting both dates (AC3/D4)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('app-language', 'en');
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    // Open the calendar popover
    const trigger = page.getByTestId('date-range-picker-trigger');
    await trigger.click();

    // Popover should be visible
    const calendar = page.locator('[data-radix-popper-content-wrapper]');
    await expect(calendar).toBeVisible();

    // Select two dates by clicking calendar day cells
    // Click the first available day (any day in the visible month)
    const days = page.locator('button[name]').filter({ hasText: /^\d+$/ });
    await days.first().click();
    await days.nth(5).click(); // click a later day for end date

    // After both dates selected, popover should close automatically
    await expect(calendar).not.toBeVisible();
  });

  // ── AC4: Chart view control is a button group (D5) ────────────────────────

  test('[P1] Chart view control is a button group with correct data-testids (AC4/D5)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('app-language', 'en');
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    // Button group exists
    const selector = page.getByTestId('chart-view-selector');
    await expect(selector).toBeVisible();

    // All three chart buttons exist
    await expect(page.getByTestId('chart-view-customer')).toBeVisible();
    await expect(page.getByTestId('chart-view-project')).toBeVisible();
    await expect(page.getByTestId('chart-view-tag')).toBeVisible();

    // No combobox/select should exist for chart view anymore
    await expect(page.getByRole('combobox')).not.toBeVisible();

    // Clicking project button switches the chart
    await page.getByTestId('chart-view-project').click();
    await expect(page.getByTestId('project-revenue-chart')).toBeVisible();
    await expect(page.getByTestId('customer-revenue-chart')).not.toBeVisible();
  });

});
```

---

### Story 7.1 ATDD Spec Updates Required

The following changes must be made to the **existing** file `tests/e2e/story-7-1-implement-accessibility-wcag-2-1-aa-for-dashboard-atdd.spec.ts`:

1. **Zombie test rewrite** — replace the conditional `if (isVisible())` test with the storage fallback assertion (see AC8 dev notes above)

2. **Chart-switch test** — find the test `[P0] All three chart headings render with translated text` and replace the `page.getByRole('combobox')` interactions with `page.getByTestId('chart-view-project')` and `page.getByTestId('chart-view-tag')` clicks

3. **Keyboard nav test** — find `[P1] Chart view Select is reachable via Tab` and update to focus `page.getByTestId('chart-view-customer')` instead of `getByRole('combobox')`

---

### Architecture Compliance

**DO:**
- Use `Math.max(0, task.timeSpent)` — not `task.timeSpent > 0 ? task.timeSpent : 0` (readability and correctness equivalent, but `Math.max` is the standard idiom)
- Use `useMemo([data, hiddenKeys])` for `visibleData` — `hiddenKeys` is a `Set`; React compares Sets by reference, and the state setter always returns a new Set, so memo invalidation is correct
- Use `data-testid` on all new interactive elements (`chart-view-{chart}`, `chart-view-selector`)
- Keep `aria-labelledby` on sr-only `<ul>` elements — only remove `aria-label` (dead code)
- Keep `isAnimationActive={false}` on all `<Pie>` elements — NFR-P1/P3 contract, do NOT change
- Keep the `useEffect` for `hiddenKeys` reset — `setHiddenKeys(new Set())` on `[data]` change — Story 4.4 contract

**DO NOT:**
- Remove `t.earningsChartSrDataSummary` from `LanguageContext.tsx` — keep it even if no longer referenced in chart JSX
- Add `htmlFor` to the new chart view `<Label>` — there's no single form element to associate it with in a button group; remove `htmlFor` attribute (the group has `aria-label` instead)
- Change `Popover onOpenChange={setOpen}` — it must remain for the user to still be able to close the popover manually (clicking outside still works)
- Use `||` for revenue or rate fields — always `??` (project-wide rule since Epic 2)
- Hardcode any strings in JSX — all strings must go through `t.<key>`
- Modify `getTaskBillableRevenue` — the guard goes in `calculateSummaryMetrics` only

---

### File Structure

| Action | Path | Notes |
|--------|------|-------|
| Edit | `src/context/LanguageContext.tsx` | Add `lightModeLabel` + `darkModeLabel` to interface + both locales |
| Edit | `src/components/Header.tsx` | Add `aria-label` to dark mode button |
| Edit | `src/pages/EarningsDashboard.tsx` | Add `role="region"` to metrics div; convert chart selector to button group; remove unused Select imports |
| Edit | `src/components/CustomerRevenueChart.tsx` | Memoize `visibleData`; remove `aria-label` dead code from sr-only `<ul>` |
| Edit | `src/components/ProjectRevenueChart.tsx` | Same pattern as CustomerRevenueChart |
| Edit | `src/components/TagRevenueChart.tsx` | Same pattern as CustomerRevenueChart |
| Edit | `src/components/DateRangeFilter.tsx` | Add `setOpen(false)` in useEffect (D4 — one line) |
| Edit | `src/lib/earnings-calculations.ts` | `Math.max(0, task.timeSpent)` guard |
| Edit | `tests/e2e/story-7-1-implement-accessibility-wcag-2-1-aa-for-dashboard-atdd.spec.ts` | Rewrite zombie test; update chart-switch test to use button data-testids |
| Edit | `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts` | Move performance timer after goto |
| Edit | `tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts` | Move performance timer after goto |
| Edit | `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts` | Move performance timer after goto |
| Edit | `tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts` | Move performance timer(s) after goto |
| Create | `tests/e2e/story-7-2-final-polish-deferred-work-resolution-atdd.spec.ts` | New ATDD spec |

No new npm dependencies. No new `src/` files beyond the one test file created.

---

### Previous Story Intelligence (Story 7.1 — last completed)

**Baseline at start of Story 7.2:**
- Vitest: **264 unit tests** passing
- Playwright E2E: **157 tests** passing

**Patterns — replicate exactly:**
- Commit message: `"Implemented story 7.2"` — ONE commit, bundle all changed/created files
- `blockKnownThirdPartyHosts(page)` is `async` — must be `await`ed
- Import from `tests/support/fixtures`, never directly from `@playwright/test`
- `{ exact: true }` with `getByText()` where text could be substring
- E2E seed via `addInitScript`, never via `page.evaluate()` with partial spread
- Run Playwright locally with `--workers=1`
- No `test.skip()` or RED PHASE headers in ATDD spec

**Files confirmed stable from Story 7.1 (do not reopen):**
- `src/lib/earnings-dashboard-storage.ts` — no changes needed
- `src/context/EarningsDashboardStateContext.tsx` — no changes needed
- `src/context/AppContext.tsx` — no changes needed
- `src/components/BillableToggle.tsx` — fully accessible from Story 4.3, do not reopen

---

### Git Intelligence

Recent commits:
```
ad70e0b Implemented story 7.1
ee16e8b Implemented story 5.1
8e03bf4 Retro and project context update
```

Target: single clean commit `"Implemented story 7.2"` bundling all changed/created files.

---

### FR / NFR Coverage

| Requirement | AC | Implementation |
|---|---|---|
| WCAG 2.1 SC 4.1.2: Name, Role, Value | AC1 | Dark mode button `aria-label` — locale-aware via `t.lightModeLabel` / `t.darkModeLabel` |
| WCAG 2.1 SC 1.3.6: Named ARIA region | AC2 | `role="region"` on metrics `<div aria-label={...}>` |
| D4: Calendar popover auto-close | AC3 | `setOpen(false)` in `useEffect` when both dates selected |
| D5: Chart view selector visual consistency | AC4 | `<Select>` → button group with `role="group"` and `aria-pressed` |
| Performance: `visibleData` memoization | AC5 | `useMemo([data, hiddenKeys])` in all 3 chart components |
| ARIA correctness: sr-only `<ul>` dead code | AC6 | Remove redundant `aria-label`; `aria-labelledby` retained |
| Test quality: E2E timer includes navigation | AC7 | Timer start moved after `page.goto()` in all timing tests |
| Test quality: Zombie `[P0]` test | AC8 | Real assertion: storage fallback renders dashboard safely |
| Edge case: negative `timeSpent` | AC9 | `Math.max(0, task.timeSpent)` in `calculateSummaryMetrics` |

---

### References

- [Epic 5-6-7 retrospective — `_bmad-output/implementation-artifacts/epic-5-6-7-retro-2026-04-06.md`]
- [Deferred work log — `_bmad-output/implementation-artifacts/deferred-work.md`]
- [Story 7.1 — `_bmad-output/implementation-artifacts/7-1-implement-accessibility-wcag-2-1-aa-for-dashboard.md`]
- [Header.tsx — `src/components/Header.tsx`]
- [DateRangeFilter.tsx — `src/components/DateRangeFilter.tsx`]
- [EarningsDashboard.tsx — `src/pages/EarningsDashboard.tsx`]
- [CustomerRevenueChart.tsx — `src/components/CustomerRevenueChart.tsx`]
- [earnings-calculations.ts — `src/lib/earnings-calculations.ts`]
- [LanguageContext.tsx — `src/context/LanguageContext.tsx`]
- [Project context rules — `_bmad-output/project-context.md`]

---

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Completion Notes List

- AC1 ✅: Added `lightModeLabel`/`darkModeLabel` to `Translations` interface and both EN/PT locales in `LanguageContext.tsx`. Added `aria-label={state.isDarkMode ? t.lightModeLabel : t.darkModeLabel}` to dark mode button in `Header.tsx`. `t` variable confirmed safe at call site (no shadowing).
- AC2 ✅: Added `role="region"` to the metrics `<div>` in `EarningsDashboard.tsx`.
- AC3 ✅: Added `setOpen(false)` in the `useEffect` if-block in `DateRangeFilter.tsx` — one-line fix resolves D4.
- AC4 ✅: Replaced `<Select>` chart view with button group (`role="group"`, `data-testid="chart-view-{chart}"`, `aria-pressed`). Removed unused Select imports. Removed `ActiveChartView` type import (no longer explicitly referenced). Updated 7 test files that used old `page.getByLabel("Chart")` + `page.getByRole("option")` pattern.
- AC5 ✅: Memoized `visibleData` with `useMemo([data, hiddenKeys])` in all three chart components. `useMemo` was already imported in all three files.
- AC6 ✅: Removed redundant `aria-label` from `<ul className="sr-only">` in all three chart components. `aria-labelledby` retained.
- AC7 ✅: Moved `const start = Date.now()` to after `await page.goto()` in story-3-1, story-3-3, story-3-4 performance tests (story-3-2 was already correct). Also updated chart switch interactions in these files to use button data-testids.
- AC8 ✅: Rewrote zombie test in story-7-1 spec — replaced conditional if/isVisible pattern with real assertion verifying storage fallback renders dashboard safely. Updated chart-switch test and keyboard nav test to use button data-testids instead of combobox.
- AC9 ✅: Changed `billableTimeSpentSec += task.timeSpent` to `billableTimeSpentSec += Math.max(0, task.timeSpent)` in `calculateSummaryMetrics`. Prevents negative `averageHourlyRate`.

**Additional fixes required:** AC4 chart selector change broke many existing tests across story-3-1, 3-2, 3-3, 3-4, 4-4, earnings-dashboard-persistence, and EarningsDashboard unit test. All updated to use button group data-testids.

**Test results:** 306 unit tests passing, 167 E2E tests passing. No regressions.

### File List

- `src/context/LanguageContext.tsx` — Added `lightModeLabel`/`darkModeLabel` to interface and both locales
- `src/components/Header.tsx` — Added `aria-label` to dark mode button
- `src/pages/EarningsDashboard.tsx` — Added `role="region"` to metrics div; converted chart selector to button group; removed Select imports and ActiveChartView import
- `src/components/CustomerRevenueChart.tsx` — Memoized `visibleData`; removed `aria-label` dead code from sr-only `<ul>`
- `src/components/ProjectRevenueChart.tsx` — Same pattern as CustomerRevenueChart
- `src/components/TagRevenueChart.tsx` — Same pattern as CustomerRevenueChart
- `src/components/DateRangeFilter.tsx` — Added `setOpen(false)` in useEffect (D4 one-line fix)
- `src/lib/earnings-calculations.ts` — `Math.max(0, task.timeSpent)` guard in `calculateSummaryMetrics`
- `src/pages/EarningsDashboard.test.tsx` — Updated combobox assertion to use button group aria-pressed
- `tests/e2e/story-7-2-final-polish-deferred-work-resolution-atdd.spec.ts` — New ATDD spec (already existed from ATDD phase)
- `tests/e2e/story-7-1-implement-accessibility-wcag-2-1-aa-for-dashboard-atdd.spec.ts` — Rewrote zombie test; updated chart-switch and keyboard nav tests
- `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts` — Fixed chart switch interactions; moved performance timer after goto
- `tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts` — Fixed chart switch interactions; updated PT locale pattern
- `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts` — Fixed chart switch interactions; moved performance timer after goto; updated PT locale pattern
- `tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts` — Fixed chart switch interactions; moved performance timer after goto
- `tests/e2e/story-4-4-chart-ux-polish-and-test-stability-atdd.spec.ts` — Fixed chart switch interaction
- `tests/e2e/earnings-dashboard-persistence.spec.ts` — Fixed combobox assertion to use button group
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Updated status to review

### Review Findings

**Reviewed:** 2026-04-06 | **Reviewer:** Code Review Agent | **Mode:** full (spec + 3-layer adversarial)

**Diff scope:** commit `157bbfa` ("Implemented story 7.2") — 20 files changed, 691 insertions, 137 deletions

**Layer results:** Blind Hunter ✅ | Edge Case Hunter ✅ | Acceptance Auditor ✅

**AC verification:** All 9 ACs confirmed implemented and correct.

- [x] [Review][Defer] `button[name]` selector in calendar auto-close E2E test may be fragile if `react-day-picker` changes its day button attributes [tests/e2e/story-7-2-final-polish-deferred-work-resolution-atdd.spec.ts] — deferred, pre-existing test selector design; tests pass in current environment (167 E2E verified by dev agent)
- [x] [Review][Defer] `Math.max(0, task.timeSpent)` in `calculateSummaryMetrics` does not guard against `NaN` timeSpent (only negative values) [src/lib/earnings-calculations.ts:326] — deferred, pre-existing edge case; AC9 spec only required negative guard; NaN would be caught by data validation upstream

**Summary:** 0 decision-needed, 0 patch, 2 deferred (pre-existing), 4 dismissed as noise. Clean review — no blocking issues. Story promoted to `done`.

### Change Log

| Date | Change |
|------|--------|
| 2026-04-06 | Story 7.2 created: ready-for-dev. Resolves all deferred items from Epic 4 retro (D4, D5) and Stories 5.1–7.1 review deferrals. 14 files to change/create. Final story before MVP release. |
| 2026-04-06 | Story 7.2 implemented: all 9 ACs resolved. 306 unit tests passing, 167 E2E tests passing. Status → review. |
