# Story 3.3: Implement Tag Revenue Chart

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **user**,
I want **to see my revenue broken down by tags in a pie chart on the Earnings Dashboard**,
so that **I can strategically allocate my time across work categories**.

## Acceptance Criteria

1. **Given** I have tasks tagged with different categories  
   **When** I view the Earnings Dashboard with "Tag" chart view selected (`state.activeChart === 'tag'`)  
   **Then** I see a pie chart showing each tag's revenue as a proportional slice, with tag name labels (FR6)

2. **Given** I switch from another chart to "By Tag"  
   **When** the chart changes  
   **Then** my date range and billable filter remain applied, and the previous chart is no longer rendered (FR7)

3. **Given** a task has no tags  
   **When** I view the tag chart  
   **Then** the task's revenue is grouped under an "Untagged" slice (not silently dropped)

4. **Given** I hover over a chart segment  
   **When** I view the tooltip  
   **Then** I see the tag name, exact revenue formatted as currency, and percentage of total revenue (FR8)

5. **Given** there are no tasks in the selected date range (or all tasks filtered out by the billable toggle)  
   **When** I view the tag chart  
   **Then** an informative "no data" message is shown instead of an empty chart

6. **Given** I click a legend item  
   **When** that tag's slice is toggled  
   **Then** it is hidden from the chart and the remaining slices proportionally fill the chart (FR9)

7. **Given** I resize my browser window  
   **When** I view the chart  
   **Then** the chart automatically resizes to fit the available viewport width without horizontal scrolling (FR10)

8. **Given** the chart has many data points  
   **When** the page loads  
   **Then** the chart renders within 2 seconds with up to 5,000 tasks (FR43, NFR-P1)

---

## Tasks / Subtasks

- [x] **Create `src/components/TagRevenueChart.tsx`** (AC: 1, 3, 4, 5, 6, 7, 8)
  - [x] Import from recharts: `PieChart`, `Pie`, `Cell`, `Tooltip`, `Legend`, `ResponsiveContainer`
  - [x] Import `RevenueByTagRow` from `@/lib/earnings-calculations`
  - [x] Define `TagRevenueChartProps` interface: `{ data: RevenueByTagRow[] }`
  - [x] Add `data-testid="tag-revenue-chart"` on the root wrapper div (both data state and no-data state)
  - [x] Implement stable color mapping (use `colorMap` keyed on `tag`)
  - [x] Add `useState<Set<string>>` for `hiddenKeys` — toggle on legend click (keyed on `tag`)
  - [x] Implement `CustomTooltip` showing tag name (`row.tag`), `formatCurrency(revenue)`, and `(pct%)` (AC 4)
  - [x] Render `<Legend onClick={...}>` that toggles visibility of clicked slice (AC 6)
  - [x] Wrap chart in `<ResponsiveContainer width="100%" height={320}>` (AC 7)
  - [x] Render "no data" state using `t.earningsChartNoData` when `data.length === 0` (AC 5)
  - [x] Show chart section heading using `t.earningsTagChartTitle` (AC 1)
  - [x] Use identical `CHART_COLORS` array as `CustomerRevenueChart` and `ProjectRevenueChart`
  - [x] Export single default component (react-refresh rule)

- [x] **Integrate `TagRevenueChart` into `src/pages/EarningsDashboard.tsx`** (AC: 1, 2)
  - [x] Add `calculateRevenueByTag` to existing import from `@/lib/earnings-calculations`
  - [x] Import `TagRevenueChart` from `@/components/TagRevenueChart`
  - [x] Add `useMemo` for `tagData`: call `calculateRevenueByTag(appState.tasks, resolveDateRangeMs(state, Date.now()), state.billableFilter, appState.clients)` (deps: `[appState.tasks, appState.clients, state]`)
  - [x] Conditionally render `<TagRevenueChart data={tagData} />` when `state.activeChart === 'tag'`
  - [x] Insert chart conditional block immediately after the `ProjectRevenueChart` conditional block

- [x] **Add i18n translation key to `src/context/LanguageContext.tsx`** (AC: 1, 5)
  - [x] Add `earningsTagChartTitle` to the `Translations` TypeScript interface
  - [x] Add English value: `'Revenue by Tag'` to the `en` object
  - [x] Add Portuguese value: `'Receita por Tag'` to the `pt` object
  - [x] Place after `earningsProjectChartTitle` in all three locations
  - [x] **Never hardcode English/Portuguese text in JSX** — use `t.<key>` exclusively

- [x] **Add ATDD E2E spec `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts`** (AC: 1–8)
  - [x] Import from `../support/fixtures` (not directly from `@playwright/test`)
  - [x] Import `blockKnownThirdPartyHosts` from `../support/helpers/network`
  - [x] Call `blockKnownThirdPartyHosts(page)` before all `page.goto()` calls
  - [x] Seed `app-language` to `'en'` via `addInitScript` in `beforeEach`
  - [x] P0 test: switch to "Tag" chart view, verify `data-testid="tag-revenue-chart"` is visible (AC1)
  - [x] P0 test: recharts SVG element present inside tag chart container when seeded with tagged billable task (AC1, FR6)
  - [x] P0 test: switching from Tag back to Customer hides tag chart container (AC2, FR7)
  - [x] P1 test: chart title `'Revenue by Tag'` is visible inside `data-testid="tag-revenue-chart"` container (AC1, i18n)
  - [x] P1 test: no-data state shows `'No data for this period'` message when empty task list seeded (AC5)
  - [x] P1 test: tooltip visible when hovering chart SVG area (AC4, FR8)
  - [x] P1 test: untagged task revenue appears as "Untagged" slice (AC3)
  - [x] P1 test: switching from Customer to Tag preserves earnings-dashboard container (AC2, FR7)
  - [x] P2 test: Portuguese locale renders `'Receita por Tag'` chart title (i18n)
  - [x] P2 test: chart renders within 2 seconds with dataset of 50 tasks (AC8, NFR-P1)
  - [x] Use `.first()` on `[data-testid="tag-revenue-chart"] svg` locator (recharts renders multiple SVG elements including legend icons)
  - [x] Seed explicit `localStorage` data for all count-sensitive / empty-state tests

---

## Dev Notes

### Component Architecture

**File:** `src/components/TagRevenueChart.tsx` — single default export, no named exports (react-refresh `only-export-components` rule).

**Props interface:**
```typescript
import type { RevenueByTagRow } from '@/lib/earnings-calculations';

interface TagRevenueChartProps {
  data: RevenueByTagRow[];
}
```

`RevenueByTagRow` is already exported from `src/lib/earnings-calculations.ts`:
```typescript
export type RevenueByTagRow = {
  tag: string;        // Trimmed tag string, or "Untagged" sentinel
  totalRevenue: number;
  taskCount: number;
};
```

**Do NOT re-implement tag aggregation** — `calculateRevenueByTag` already handles:
- Date-range filtering (via `filterTasksForEarnings`)
- Billable filter (via `filterTasksForEarnings`)
- Revenue split: `taskRevenue / tags.length` per tag (strict 1/N split — project-context.md rule)
- Untagged grouping: tasks with no tags accumulate revenue under `"Untagged"` sentinel bucket

### recharts API — Exact Usage Pattern (mirrors CustomerRevenueChart and ProjectRevenueChart)

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
import React, { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useLanguage } from '@/context/LanguageContext';
import type { RevenueByTagRow } from '@/lib/earnings-calculations';

interface TagRevenueChartProps {
  data: RevenueByTagRow[];
}

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#06b6d4',
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const TagRevenueChart: React.FC<TagRevenueChartProps> = ({ data }) => {
  const { t } = useLanguage();
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  // Stable color assignment keyed on tag — colors don't shift when items are hidden
  const colorMap = useMemo(
    () => new Map(data.map((row, i) => [row.tag, CHART_COLORS[i % CHART_COLORS.length]])),
    [data],
  );

  const total = useMemo(
    () => data.reduce((sum, row) => sum + row.totalRevenue, 0),
    [data],
  );

  const visibleData = data.filter((row) => !hiddenKeys.has(row.tag));

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
      <div data-testid="tag-revenue-chart" className="flex items-center justify-center h-48 rounded-lg border border-dashed">
        <p className="text-muted-foreground text-sm">{t.earningsChartNoData}</p>
      </div>
    );
  }

  return (
    <div data-testid="tag-revenue-chart" className="space-y-2">
      <h2 className="text-lg font-semibold">{t.earningsTagChartTitle}</h2>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={visibleData}
            dataKey="totalRevenue"
            nameKey="tag"
            cx="50%"
            cy="50%"
            outerRadius="70%"
          >
            {visibleData.map((entry) => (
              <Cell
                key={`cell-${entry.tag}`}
                fill={colorMap.get(entry.tag) ?? '#6366f1'}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as RevenueByTagRow;
              const pct = total > 0 ? ((row.totalRevenue / total) * 100).toFixed(1) : '0.0';
              return (
                <div className="rounded-md border bg-popover p-2 text-sm shadow-md">
                  <p className="font-medium">{row.tag}</p>
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

export default TagRevenueChart;
```

**Key recharts v2 conventions (same as CustomerRevenueChart and ProjectRevenueChart):**
- `ResponsiveContainer` **must** have a numeric `height` — use `height={320}` (px), not `height="100%"` alone
- `Pie` `nameKey` is used by `Legend` for display names — must be `"tag"` (the field name in `RevenueByTagRow`)
- `Pie` `dataKey` is the numeric field for slice sizes — `"totalRevenue"`
- `Cell` `key` must be unique — use `entry.tag` (always a non-null string; includes "Untagged" sentinel)
- `Legend` `onClick` receives `{ value: string, payload: ... }` — `entry.value` equals the `nameKey` value (`tag`)

### EarningsDashboard.tsx Integration

**Update the existing import** to include `calculateRevenueByTag`:
```tsx
import { calculateRevenueByCustomer, calculateRevenueByProject, calculateRevenueByTag, calculateSummaryMetrics, resolveDateRangeMs } from '@/lib/earnings-calculations';
```

**Add import for `TagRevenueChart`:**
```tsx
import TagRevenueChart from '@/components/TagRevenueChart';
```

**Add memo for tag data** (alongside existing `customerData` and `projectData` memos):
```tsx
const tagData = useMemo(
  () =>
    calculateRevenueByTag(
      appState.tasks,
      resolveDateRangeMs(state, Date.now()),
      state.billableFilter,
      appState.clients,
    ),
  [appState.tasks, appState.clients, state],
);
```

**CRITICAL — `calculateRevenueByTag` signature:**
```typescript
calculateRevenueByTag(tasks, dateRangeMs, billableFilter, clients?)
```
- **No `columns` argument** — unlike `calculateRevenueByProject` which takes `columns` as the second argument, `calculateRevenueByTag` does NOT use columns at all.
- Argument order: `tasks`, `dateRangeMs`, `billableFilter`, `clients` (optional, default `[]`)
- Use `appState.clients` as the fourth argument to supply hourly rates for tasks without `task.hourlyRate`.

**Conditional render** — insert immediately after the `ProjectRevenueChart` conditional block:
```tsx
{state.activeChart === 'customer' && (
  <CustomerRevenueChart data={customerData} />
)}
{state.activeChart === 'project' && (
  <ProjectRevenueChart data={projectData} />
)}
{state.activeChart === 'tag' && (
  <TagRevenueChart data={tagData} />
)}
```

**No changes to filter controls** — the chart selector `<Select>` already has `earningsChartTag = 'Tag'` as a `<SelectItem value="tag">` option; `state.activeChart === 'tag'` is already a valid `ActiveChartView` in `earnings-dashboard-storage.ts`.

### i18n Key to Add

Add the following to **`en` and `pt`** objects AND the `Translations` interface in `src/context/LanguageContext.tsx`:

| Key | English | Portuguese |
|-----|---------|------------|
| `earningsTagChartTitle` | `'Revenue by Tag'` | `'Receita por Tag'` |

**Place after `earningsProjectChartTitle`** in all three locations (interface, `en` object, `pt` object):

```typescript
// Translations interface (after earningsProjectChartTitle)
earningsProjectChartTitle: string;
earningsTagChartTitle: string;   // ADD THIS LINE
earningsChartNoData: string;
```

**`earningsChartNoData` is already present** — do NOT add it again.

### Currency Formatting

Add a local `formatCurrency` to `TagRevenueChart.tsx` (same as `CustomerRevenueChart.tsx` and `ProjectRevenueChart.tsx`):
```typescript
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
```

Per project-context.md: keep local for now — Epic 6's retro will handle consolidation. **Do NOT move to `src/lib/utils.ts`** yet.

### Tag Revenue Split Contract (Critical)

Per `project-context.md` rule and `calculateRevenueByTag` implementation:
- Tasks with **multiple tags** have their revenue split equally: `taskRevenue / tags.length` per tag
- Tasks with **no tags** contribute their full revenue to the `"Untagged"` bucket
- Tag keys are trimmed and de-duplicated per task (by `normalizedUniqueTags` inside the lib)
- The "Untagged" string is a sentinel constant `UNTAGGED_KEY = "Untagged"` inside `earnings-calculations.ts`
- **Do NOT re-implement this logic** — `calculateRevenueByTag` returns the already-aggregated `RevenueByTagRow[]`

### Architecture Compliance

- **Client-only SPA** — no network calls; data flows from `AppContext` via props into the chart component
- **No new localStorage keys** — this story reads only existing state
- **No new dependencies** — recharts is already in `package.json`; do not `npm install` anything
- **No changes to `AppState`, reducer, or `loadState/saveState`** — pure display + calculation
- **Filter state preserved on chart switch** — handled by existing `EarningsDashboardStateContext`; no special code needed
- **`activeChart === 'tag'` is already a valid `ActiveChartView`** — no changes to `earnings-dashboard-storage.ts`
- **`ActiveChartView`** in `src/lib/earnings-dashboard-storage.ts`: already `'customer' | 'project' | 'tag'`

### File Structure

| Action | Path | Notes |
|--------|------|-------|
| Add | `src/components/TagRevenueChart.tsx` | New pie chart component — single default export |
| Edit | `src/pages/EarningsDashboard.tsx` | Add `calculateRevenueByTag` import + `tagData` useMemo + conditional chart render + `TagRevenueChart` import |
| Edit | `src/context/LanguageContext.tsx` | Add 1 new i18n key (`earningsTagChartTitle`) to `en`, `pt`, and `Translations` interface |
| Add | `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts` | Playwright E2E ATDD |

### E2E Testing — Playwright Patterns (CRITICAL)

**Standing conventions (from Epic 2 retro — already in `project-context.md`):**
- **Always use `--workers=1`** for local E2E runs: `npx playwright test --workers=1`
- **Always use `{ exact: true }`** with `getByText()` when text could match as substring
- **Always seed explicit app state** via `addInitScript` for count-sensitive or empty-state tests — the app default ships 5 sample tasks

**recharts SVG assertions (same as Stories 3.1 and 3.2):**
- SVG `<text>` elements are NOT reached by standard `getByText()` — scope to `data-testid` container
- Use `.first()` on `[data-testid="tag-revenue-chart"] svg` — recharts Legend renders small SVG icons per item
- Tooltip hover: compute bounding box center dynamically, then await tooltip container visibility:
  ```typescript
  const chartSvg = page.locator('[data-testid="tag-revenue-chart"] svg').first();
  const bbox = await chartSvg.boundingBox();
  const cx = bbox ? bbox.width / 2 : 160;
  const cy = bbox ? bbox.height / 2 : 160;
  await chartSvg.hover({ position: { x: cx, y: cy } });
  await expect(page.locator('.rounded-md.border.bg-popover')).toBeVisible({ timeout: 3000 });
  ```

**Chart selector interaction (same as Stories 3.1 and 3.2):**
```typescript
// Switch to Tag view
await page.getByLabel('Chart').click();
await page.getByRole('option', { name: 'Tag' }).click();

// Switch back to Customer view
await page.getByLabel('Chart').click();
await page.getByRole('option', { name: 'Customer' }).click();
```

The shadcn `<Select>` for chart view uses `id="earnings-chart-view"` and label text `t.earningsChartViewLabel = 'Chart'`.

**Seed data for tag chart tests:**
```typescript
const buildTagSeed = () => ({
  tasks: [
    {
      id: 't1', title: 'Task 1', columnId: 'col-1', clientId: 'c1',
      isBillable: true, hourlyRate: 100, timeSpent: 3600,
      createdAt: Date.now(), priority: 'medium', description: '',
      timeEstimate: null, dueDate: null, tags: ['design'], order: 0,
    },
    {
      id: 't2', title: 'Task 2', columnId: 'col-1', clientId: 'c1',
      isBillable: true, hourlyRate: 80, timeSpent: 7200,
      createdAt: Date.now(), priority: 'medium', description: '',
      timeEstimate: null, dueDate: null, tags: ['development'], order: 1,
    },
  ],
  columns: [{ id: 'col-1', title: 'In Progress', order: 0 }],
  clients: [{ id: 'c1', name: 'Acme Corp', hourlyRate: 100, color: '#6366f1' }],
  version: 1,
});
```

**Seed data for untagged test (AC3):**
```typescript
const buildUntaggedSeed = () => ({
  tasks: [
    {
      id: 't1', title: 'Task 1', columnId: 'col-1', clientId: 'c1',
      isBillable: true, hourlyRate: 100, timeSpent: 3600,
      createdAt: Date.now(), priority: 'medium', description: '',
      timeEstimate: null, dueDate: null, tags: [], order: 0,
    },
  ],
  columns: [{ id: 'col-1', title: 'In Progress', order: 0 }],
  clients: [{ id: 'c1', name: 'Acme Corp', hourlyRate: 100, color: '#6366f1' }],
  version: 1,
});
```

**E2E spec skeleton:**
```typescript
import { test, expect } from '../support/fixtures';
import { blockKnownThirdPartyHosts } from '../support/helpers/network';

const buildTagSeed = () => ({ /* ... see above ... */ });
const buildUntaggedSeed = () => ({ /* ... see above ... */ });

test.describe('Story 3.3 ATDD — Tag Revenue Chart', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('app-language', 'en');
    });
  });

  test('[P0] tag revenue chart container is visible after switching to Tag chart view (AC1)', async ({ page }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await page.getByLabel('Chart').click();
    await page.getByRole('option', { name: 'Tag' }).click();
    await expect(page.getByTestId('tag-revenue-chart')).toBeVisible();
  });

  test('[P0] recharts SVG element is rendered inside tag chart container with seeded task (AC1, FR6)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(buildTagSeed()));
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await page.getByLabel('Chart').click();
    await page.getByRole('option', { name: 'Tag' }).click();
    await expect(page.locator('[data-testid="tag-revenue-chart"] svg').first()).toBeVisible();
  });

  test('[P0] switching from Tag back to Customer hides tag chart container (AC2, FR7)', async ({ page }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await page.getByLabel('Chart').click();
    await page.getByRole('option', { name: 'Tag' }).click();
    await expect(page.getByTestId('tag-revenue-chart')).toBeVisible();
    await page.getByLabel('Chart').click();
    await page.getByRole('option', { name: 'Customer' }).click();
    await expect(page.getByTestId('tag-revenue-chart')).not.toBeVisible();
  });

  test('[P1] chart section heading "Revenue by Tag" is visible (AC1 i18n)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(buildTagSeed()));
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await page.getByLabel('Chart').click();
    await page.getByRole('option', { name: 'Tag' }).click();
    await expect(
      page.getByTestId('tag-revenue-chart').getByText('Revenue by Tag', { exact: true }),
    ).toBeVisible();
  });

  test('[P1] no-data state shows informative message when task list is empty (AC5)', async ({ page }) => {
    await page.addInitScript(() => {
      const empty = { tasks: [], columns: [], clients: [], version: 1 };
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(empty));
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await page.getByLabel('Chart').click();
    await page.getByRole('option', { name: 'Tag' }).click();
    await expect(page.getByTestId('tag-revenue-chart')).toBeVisible();
    await expect(page.getByText('No data for this period', { exact: true })).toBeVisible();
    await expect(page.locator('[data-testid="tag-revenue-chart"] svg')).not.toBeVisible();
  });

  test('[P1] tooltip is visible when hovering chart SVG area (AC4, FR8)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(buildTagSeed()));
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await page.getByLabel('Chart').click();
    await page.getByRole('option', { name: 'Tag' }).click();
    const chartSvg = page.locator('[data-testid="tag-revenue-chart"] svg').first();
    const bbox = await chartSvg.boundingBox();
    const cx = bbox ? bbox.width / 2 : 160;
    const cy = bbox ? bbox.height / 2 : 160;
    await chartSvg.hover({ position: { x: cx, y: cy } });
    await expect(page.locator('.rounded-md.border.bg-popover')).toBeVisible({ timeout: 3000 });
  });

  test('[P1] untagged task revenue appears as "Untagged" legend entry (AC3)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(buildUntaggedSeed()));
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await page.getByLabel('Chart').click();
    await page.getByRole('option', { name: 'Tag' }).click();
    await expect(page.locator('[data-testid="tag-revenue-chart"] svg').first()).toBeVisible();
    // "Untagged" appears as a legend label (SVG text inside the chart container)
    await expect(
      page.locator('[data-testid="tag-revenue-chart"]').getByText('Untagged', { exact: true }),
    ).toBeVisible();
  });

  test('[P1] switching from Customer to Tag preserves earnings-dashboard container (AC2, FR7)', async ({ page }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();
    await page.getByLabel('Chart').click();
    await page.getByRole('option', { name: 'Tag' }).click();
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();
  });

  test('[P2] Portuguese locale renders "Receita por Tag" chart title (i18n)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('app-language', 'pt');
      localStorage.setItem('freelancer-kanban-data', JSON.stringify(buildTagSeed()));
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto('/earnings');
    await page.getByLabel('Gráfico').click();
    await page.getByRole('option', { name: 'Tag' }).click();
    await expect(
      page.getByTestId('tag-revenue-chart').getByText('Receita por Tag', { exact: true }),
    ).toBeVisible();
  });

  test('[P2] chart renders within 2 seconds with dataset of 50 tasks (AC8, NFR-P1)', async ({ page }) => {
    await page.addInitScript(() => {
      const tasks = Array.from({ length: 50 }, (_, i) => ({
        id: `t${i}`, title: `Task ${i}`, columnId: 'col-1', clientId: 'c1',
        isBillable: true, hourlyRate: 100, timeSpent: 3600,
        createdAt: Date.now(), priority: 'medium', description: '',
        timeEstimate: null, dueDate: null, tags: [`tag-${i % 5}`], order: i,
      }));
      localStorage.setItem('freelancer-kanban-data', JSON.stringify({
        tasks,
        columns: [{ id: 'col-1', title: 'In Progress', order: 0 }],
        clients: [{ id: 'c1', name: 'Acme Corp', hourlyRate: 100, color: '#6366f1' }],
        version: 1,
      }));
    });
    await blockKnownThirdPartyHosts(page);
    const start = Date.now();
    await page.goto('/earnings');
    await page.getByLabel('Chart').click();
    await page.getByRole('option', { name: 'Tag' }).click();
    await expect(page.locator('[data-testid="tag-revenue-chart"] svg').first()).toBeVisible();
    expect(Date.now() - start).toBeLessThan(2000);
  });
});
```

### Previous Story Intelligence (Story 3.2 — Project Revenue Chart)

**Patterns to replicate exactly:**
- Component structure: local `CHART_COLORS` array, `formatCurrency` helper, `colorMap` useMemo, `total` useMemo, `visibleData` filter, `handleLegendClick` handler — all identical except keyed on `tag`
- No-data state: same `data-testid` on both branches (data and no-data), same border/dashed styling, same `t.earningsChartNoData`
- Tooltip container class: `"rounded-md border bg-popover p-2 text-sm shadow-md"` — must match so E2E tooltip selectors work
- E2E spec: use `.first()` on SVG locator, use bounding box center for hover, `{ exact: true }` on all `getByText()` calls

**Key differences from Story 3.2 (ProjectRevenueChart):**
- `data-testid` = `"tag-revenue-chart"` (not `"project-revenue-chart"`)
- `nameKey="tag"` (not `"columnTitle"`)
- `colorMap` keyed on `tag` (not `columnTitle`)
- `hiddenKeys` toggled by `tag` (not `columnTitle`)
- `Cell` key = `entry.tag` (tag string is always non-null; "Untagged" is returned as a string sentinel)
- Tooltip shows `row.tag` (not `row.columnTitle`)
- Chart title uses `t.earningsTagChartTitle` (not `t.earningsProjectChartTitle`)
- **No `columnId` field** — `RevenueByTagRow` has no separate ID; `tag` string itself is the unique key
- Import type is `RevenueByTagRow` (not `RevenueByProjectRow`)
- `calculateRevenueByTag` does NOT take `columns` — signature is `(tasks, dateRangeMs, billableFilter, clients?)`
- The "Untagged" sentinel is already handled inside `calculateRevenueByTag` — no special UI rendering needed; it will simply appear as a slice labeled "Untagged"

**Debug Log from Stories 3.1 and 3.2 (prevent recurrence):**
- `ResizeObserver not defined in jsdom` — already fixed in `src/test/setup.ts` with global mock; do NOT add a duplicate mock
- recharts Legend renders small SVG icons causing strict mode violation for `svg` locator — always append `.first()`
- Tooltip hover at fixed position (100, 100) misses pie chart — compute bounding box center dynamically

**Test baseline at Story 3.2 completion:** 89 Playwright E2E tests + 124 Vitest unit tests. Do NOT regress these.

### Git Intelligence

- Recent commit pattern: focused bundles per story (e.g., `"Implemented story 3.2"` bundled 4 files in one commit)
- For Story 3.3, expect: `TagRevenueChart.tsx` (new) + `EarningsDashboard.tsx` (edit) + `LanguageContext.tsx` (1 key) + E2E spec (new)
- No `package.json` changes expected (no new dependencies)
- Commit message style: `"Implemented story 3.3"` (matches project convention)

### Architecture and State Context

- **`ActiveChartView`** type in `src/lib/earnings-dashboard-storage.ts`: `'customer' | 'project' | 'tag'` — `'tag'` is already a valid value; no changes to storage
- **`EarningsDashboardStateContext`** provides `state.activeChart` and `setActiveChartView` — `EarningsDashboard.tsx` already reads `state.activeChart` for conditional chart rendering
- **`EarningsDashboardContent`** has access to `appState.tasks` and `appState.clients` via `const { state: appState } = useApp()` — both are needed for `calculateRevenueByTag` (no `appState.columns` needed unlike project chart)
- **Filter state is preserved automatically** — no custom code needed; switching chart view only calls `setActiveChartView`, not any date/billable state reset
- **`earningsChartTag` i18n key** already exists (`'Tag'` / `'Tag'`) — this is the Select option label. Only `earningsTagChartTitle` (chart heading) needs to be added.

### References

- [Story 3.3 ACs — `_bmad-output/planning-artifacts/epics.md` — Epic 3, Story 3.3]
- [FR6, FR7, FR8, FR9, FR10, FR43 — `_bmad-output/planning-artifacts/epics.md` — Requirements Inventory]
- [recharts SVG Playwright patterns — `_bmad-output/project-context.md` — E2E Standing Conventions]
- [Calculation API — `src/lib/earnings-calculations.ts` — `calculateRevenueByTag`, `RevenueByTagRow`]
- [Earnings filter state — `src/lib/earnings-dashboard-storage.ts` — `ActiveChartView`, `EarningsDashboardPersistedState`]
- [Dashboard state context — `src/context/EarningsDashboardStateContext.tsx`]
- [App state hook `useApp` — `src/context/AppContext.tsx`]
- [Dashboard component tree — `src/pages/EarningsDashboard.tsx`]
- [CustomerRevenueChart pattern — `src/components/CustomerRevenueChart.tsx`]
- [ProjectRevenueChart pattern — `src/components/ProjectRevenueChart.tsx`]
- [Domain types — `src/types/index.ts` — `Task`, `Client`]
- [i18n pattern + existing chart keys — `src/context/LanguageContext.tsx` — `earningsTagChartTitle` to add]
- [Previous story file — `_bmad-output/implementation-artifacts/3-2-implement-project-revenue-chart.md`]
- [E2E fixture pattern — `tests/support/fixtures/`]
- [Story 3.2 E2E spec — `tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts`]
- [Project context rules — `_bmad-output/project-context.md`]

---

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

No debug issues encountered. Implementation followed exact patterns from Story 3.2 (ProjectRevenueChart), substituting `tag` for `columnTitle` as the key field throughout.

### Completion Notes List

- Created `TagRevenueChart.tsx` mirroring `ProjectRevenueChart.tsx` structure exactly, using `tag` as the key field
- Added `earningsTagChartTitle` i18n key to `Translations` interface, `en` object (`'Revenue by Tag'`), and `pt` object (`'Receita por Tag'`) in `LanguageContext.tsx`
- Integrated `TagRevenueChart` into `EarningsDashboard.tsx` with `calculateRevenueByTag` useMemo and conditional render after the ProjectRevenueChart block
- Removed all `test.skip()` markers from the pre-generated ATDD spec — all 10 tests pass green
- Test baseline: 140 Vitest unit tests + 99 Playwright E2E tests (up from 89 prior to this story)

### File List

| Action | Path |
|--------|------|
| Create | `src/components/TagRevenueChart.tsx` |
| Modify | `src/pages/EarningsDashboard.tsx` |
| Modify | `src/context/LanguageContext.tsx` |
| Create | `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts` |

### Review Findings

- [x] [Review][Patch] Stale TDD-phase comment in E2E spec [`tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts:13`] — **auto-fixed**: updated 🔴 RED comment to 🟢 GREEN; all tests are active
- [x] [Review][Defer] `hiddenKeys` not reset when `data` prop changes [`src/components/TagRevenueChart.tsx:28`] — deferred, pre-existing pattern in CustomerRevenueChart and ProjectRevenueChart
- [x] [Review][Defer] E2E performance timer includes navigation latency (starts before `page.goto()`) [`tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts:382`] — deferred, pre-existing pattern in story 3.1 and 3.2 E2E specs
- [x] [Review][Defer] All-items-hidden edge case shows empty chart with no informative message [`src/components/TagRevenueChart.tsx:40`] — deferred, no AC covers this; pre-existing behavior in sibling components
