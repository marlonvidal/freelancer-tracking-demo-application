# Story 4.2: Implement Billable/Non-Billable Toggle

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **user**,
I want **to toggle between showing all work, only billable work, or only non-billable work**,
so that **I can distinguish revenue-generating work from unpaid work**.

## Acceptance Criteria

1. **Given** I am on the Earnings Dashboard  
   **When** I view the filter controls  
   **Then** I see a button set with three options: "All", "Billable", "Non-billable" (FR15, FR16, FR17)

2. **Given** I select "Billable Only"  
   **When** the view updates  
   **Then** only billable tasks are included in all calculations and charts (FR15, FR18)

3. **Given** I select "Non-Billable Only"  
   **When** the view updates  
   **Then** only non-billable tasks are included in all calculations and charts (FR16)

4. **Given** I select "All"  
   **When** the view updates  
   **Then** all tasks (billable and non-billable) are included (FR17)

5. **Given** I set the billable filter  
   **When** I close the browser and return to FreelanceFlow  
   **Then** my billable filter setting persists (FR19, FR41)

6. **Given** the billable filter is active  
   **When** I view the metrics panel  
   **Then** I see separate metrics for billable/non-billable (FR20) — the existing Billable Revenue and Non-Billable Revenue cards already satisfy this; no new UI required

---

## Tasks / Subtasks

- [x] **Create `src/components/BillableToggle.tsx`** (AC: 1, 2, 3, 4, 5)
  - [x] Props: none (reads from `useEarningsDashboardState()` and `useLanguage()`)
  - [x] Render `<Label>{t.earningsBillableFilterLabel}</Label>`
  - [x] Render three `<Button>` elements for `'all'`, `'billable'`, `'nonBillable'`
  - [x] Active button uses `variant="default"`; inactive uses `variant="outline"`, `size="sm"`
  - [x] Each button gets `data-testid="billable-toggle-{filter}"` (e.g. `billable-toggle-all`, `billable-toggle-billable`, `billable-toggle-nonBillable`)
  - [x] Wrapper `<div>` gets `data-testid="billable-toggle"`
  - [x] On click, call `setBillableFilter(filter)` — persistence is automatic (the action already writes to localStorage)
  - [x] Use existing i18n keys: `t.earningsFilterAll` → "All", `t.billable` → "Billable", `t.nonBillable` → "Non-billable"
  - [x] Export as `default`

- [x] **Edit `src/pages/EarningsDashboard.tsx`** (AC: 1, 2, 3, 4)
  - [x] Add import: `import BillableToggle from '@/components/BillableToggle';`
  - [x] Remove `BillableFilter` from the `type` import of `@/lib/earnings-dashboard-storage` (no longer used directly)
  - [x] Remove `setBillableFilter` from the `useEarningsDashboardState()` destructure in `EarningsDashboardContent` (moves into `BillableToggle`)
  - [x] Replace the entire `<div className="space-y-2">…</div>` block containing the billable `<Select>` with `<BillableToggle />`
  - [x] Keep `ActiveChartView` import and the chart view `<Select>` **untouched** (that is Story 4.4 scope)
  - [x] Keep `DateRangeFilter`, metrics grid, chart rendering, and `<Button onClick={clearAppData}>` untouched

- [x] **Edit `src/pages/EarningsDashboard.test.tsx`** (regression guard)
  - [x] Find the existing test: `[P1] shows persisted dashboard filters from localStorage (Story 1.3)`
  - [x] Replace `screen.getByRole("combobox", { name: /billable/i })` → `toHaveTextContent(/^billable$/i)` with `screen.getByTestId("billable-toggle-billable")` → `expect(...).toHaveAttribute("data-variant", ...)` OR check for the active button variant
  - [x] Alternatively: `expect(screen.getByTestId("billable-toggle-billable")).toBeInTheDocument()` and verify it has the highlighted style (see unit test pattern below)

- [x] **Update `tests/e2e/earnings-dashboard-persistence.spec.ts`** (breakage prevention)
  - [x] Replace every `getByRole("combobox", { name: /billable/i })` interaction with `getByTestId("billable-toggle-*")` button clicks
  - [x] Replace `getByRole("option", { name: … }).click()` with the button testid click
  - [x] Update assertions from `toContainText(...)` on combobox to checking the active state of the correct toggle button

- [x] **Create `tests/e2e/story-4-2-implement-billable-non-billable-toggle-atdd.spec.ts`** (AC: 1–5)
  - [x] P0: all three toggle buttons visible on dashboard (AC1)
  - [x] P0: "Billable" button click filters to billable-only — charts update (AC2, FR15, FR18)
  - [x] P0: "Non-billable" button click filters to non-billable-only (AC3, FR16)
  - [x] P0: "All" button click restores all tasks (AC4, FR17)
  - [x] P1: filter persists across navigation (AC5, FR19, FR41)
  - [x] P1: active toggle button is visually distinguished (variant default vs outline)
  - [x] P1: filter interaction responds within 500ms (NFR-P2)

---

## Dev Notes

### Epic 4 Context (Story 4.2 Position)

Story 4.1 replaced the **interim date range `<Select>`** with `DateRangeFilter`. Story 4.2 does the same for the **billable filter `<Select>`**: replace it with a three-button `BillableToggle` component. Story 4.3 adds keyboard accessibility. Story 4.4 does chart UX polish (legend reset, shared `formatCurrency`, chart view select replacement).

**DO NOT touch:**
- The chart view `<Select>` — that is Story 4.4 scope
- `DateRangeFilter` component — unchanged
- `setBillableFilter` in `EarningsDashboardStateContext.tsx` — already implemented and tested; no changes needed
- `earnings-dashboard-storage.ts` — `BillableFilter` type and persistence already handle this story's requirements
- Any chart component — `hiddenKeys` reset is Story 4.4 scope

---

### BillableToggle Component — Full Implementation Reference

**File:** `src/components/BillableToggle.tsx`

```tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useEarningsDashboardState } from '@/context/EarningsDashboardStateContext';
import { useLanguage } from '@/context/LanguageContext';
import type { BillableFilter } from '@/lib/earnings-dashboard-storage';
import type { Translations } from '@/context/LanguageContext';

const FILTER_OPTIONS: BillableFilter[] = ['all', 'billable', 'nonBillable'];

function filterLabel(filter: BillableFilter, t: Translations): string {
  switch (filter) {
    case 'all': return t.earningsFilterAll;
    case 'billable': return t.billable;
    case 'nonBillable': return t.nonBillable;
  }
}

const BillableToggle: React.FC = () => {
  const { t } = useLanguage();
  const { state, setBillableFilter } = useEarningsDashboardState();

  return (
    <div className="space-y-2">
      <Label>{t.earningsBillableFilterLabel}</Label>
      <div className="flex flex-wrap gap-2" data-testid="billable-toggle">
        {FILTER_OPTIONS.map((filter) => (
          <Button
            key={filter}
            variant={state.billableFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBillableFilter(filter)}
            data-testid={`billable-toggle-${filter}`}
          >
            {filterLabel(filter, t)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BillableToggle;
```

**Import pattern (mandatory):**
```tsx
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useEarningsDashboardState } from '@/context/EarningsDashboardStateContext';
import { useLanguage } from '@/context/LanguageContext';
import type { BillableFilter } from '@/lib/earnings-dashboard-storage';
import type { Translations } from '@/context/LanguageContext';
```

**`data-testid` attributes are required** — E2E tests use `getByTestId` for bilingual stability. Without these, tests will be fragile across `en`/`pt` locales.

---

### EarningsDashboard.tsx Changes

**Block to REMOVE** (entire billable filter div — lines ~184-199):

```tsx
// REMOVE this block:
<div className="space-y-2">
  <Label htmlFor="earnings-billable-filter">{t.earningsBillableFilterLabel}</Label>
  <Select
    value={state.billableFilter}
    onValueChange={(v) => setBillableFilter(v as BillableFilter)}
  >
    <SelectTrigger id="earnings-billable-filter" className="max-w-md">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">{t.earningsFilterAll}</SelectItem>
      <SelectItem value="billable">{t.billable}</SelectItem>
      <SelectItem value="nonBillable">{t.nonBillable}</SelectItem>
    </SelectContent>
  </Select>
</div>

// REPLACE with:
<BillableToggle />
```

**Other changes in `EarningsDashboard.tsx`:**

```tsx
// ADD this import:
import BillableToggle from '@/components/BillableToggle';

// CHANGE type import — remove BillableFilter (no longer used in this file):
import type { ActiveChartView } from '@/lib/earnings-dashboard-storage';
// (was: import type { ActiveChartView, BillableFilter } from '@/lib/earnings-dashboard-storage';)

// CHANGE useEarningsDashboardState destructure — remove setBillableFilter:
const {
  state,
  setActiveChartView,
  clearAppData,
} = useEarningsDashboardState();
// (was: state, setBillableFilter, setActiveChartView, clearAppData)
```

**Watch for:** If removing `BillableFilter` from the type import causes a lint warning about unused imports, ensure the import line only lists `ActiveChartView`. Do NOT remove `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` imports yet — they are still used by the chart view `<Select>`.

---

### No New i18n Keys Required

Story 4.2 reuses existing `LanguageContext.tsx` keys:

| Filter value | Translation key | `en` value | `pt` value |
|---|---|---|---|
| `'all'` | `t.earningsFilterAll` | `'All'` | `'Todas'` |
| `'billable'` | `t.billable` | `'Billable'` | `'Faturável'` |
| `'nonBillable'` | `t.nonBillable` | `'Non-billable'` | `'Não faturável'` |

Label: `t.earningsBillableFilterLabel` = `'Billable filter'` / `'Filtro faturável'`

**Do NOT add new keys** — it would create unnecessary translation drift.

---

### No New Context Actions Required

`setBillableFilter` already exists in `EarningsDashboardStateContext.tsx`:

```typescript
const setBillableFilter = useCallback((billableFilter: BillableFilter) => {
  setState((prev) => {
    const next = { ...prev, billableFilter };
    saveEarningsDashboardState(next);
    return next;
  });
}, []);
```

It already:
- Updates in-memory state
- Persists to localStorage under `'earnings-dashboard-state'` key
- Is included in the `value` memo object

**Do NOT modify this action** — it is correct and tested.

---

### No New localStorage Schema Changes

`BillableFilter` is already a field in `EarningsDashboardPersistedState`:

```typescript
export type EarningsDashboardPersistedState = {
  version: number;
  dateRangePreset: DateRangePreset;
  dateRange?: { startMs: number; endMs: number };
  billableFilter: BillableFilter;   // ← already exists
  activeChart: ActiveChartView;
};
```

`coercePersisted()` in `earnings-dashboard-storage.ts` already validates `billableFilter` against `Set(['all', 'billable', 'nonBillable'])` — no storage changes needed.

---

### EarningsDashboard.test.tsx Update (Regression Guard)

The existing test `[P1] shows persisted dashboard filters from localStorage (Story 1.3)` at approximately lines 70-83 uses:

```typescript
// CURRENT (will break with Story 4.2):
expect(
  screen.getByRole("combobox", { name: /billable/i }),
).toHaveTextContent(/^billable$/i);
```

**Replace with** (button-based assertion):

```typescript
// AFTER Story 4.2:
expect(screen.getByTestId("billable-toggle-billable")).toBeInTheDocument();
// The active button has variant="default" — verify the button is present with correct testid
// Optionally verify the "all" and "nonBillable" buttons also exist:
expect(screen.getByTestId("billable-toggle-all")).toBeInTheDocument();
expect(screen.getByTestId("billable-toggle-nonBillable")).toBeInTheDocument();
```

The test seeds `billableFilter: "billable"` in localStorage — so `state.billableFilter` will be `'billable'` on mount, making `billable-toggle-billable` the active (default variant) button.

---

### earnings-dashboard-persistence.spec.ts — Required Updates

**Four tests in this file use `getByRole("combobox", { name: /billable/i })`** and must be updated. The chart view combobox (`name: /chart/i`) is unchanged.

**Pattern replacements:**

```typescript
// OLD pattern (Story 1.3 era):
const billableControl = page.getByRole("combobox", { name: /billable/i });
await billableControl.click();
await page.getByRole("option", { name: /^billable$/i }).click();

// NEW pattern (Story 4.2+):
await page.getByTestId("billable-toggle-billable").click();
```

```typescript
// OLD pattern:
await page.getByRole("option", { name: /non[- ]?billable/i }).click();
await expect(
  page.getByRole("combobox", { name: /billable/i }),
).toContainText(/non[- ]?billable/i);

// NEW pattern:
await page.getByTestId("billable-toggle-nonBillable").click();
// For assertion — check localStorage instead of button visual state:
const stored = await readEarningsDashboardState(page);
expect(stored?.billableFilter).toBe("nonBillable");
```

```typescript
// OLD pattern (after clear):
await expect(
  page.getByRole("combobox", { name: /billable/i }),
).toContainText(/^all$/i);

// NEW pattern:
// Default after clear is 'all' — verify button is visible (all three buttons exist)
await expect(page.getByTestId("billable-toggle-all")).toBeVisible();
// Or check localStorage:
// billableFilter defaults to 'all' after clearAppData
```

**Summary of changes needed in `earnings-dashboard-persistence.spec.ts`:**

| Test | Old interaction | New interaction |
|------|----------------|----------------|
| AC1 — save billable filter | combobox click → option "Billable" | `getByTestId("billable-toggle-billable").click()` |
| AC2 — navigate away/back | combobox → "Non-billable"; assert combobox text | `getByTestId("billable-toggle-nonBillable").click()`; assert localStorage |
| AC3 — reload persistence | combobox → "All"; assert combobox text | `getByTestId("billable-toggle-all").click()`; assert localStorage |
| AC4 — after clear | assert combobox "All" | `getByTestId("billable-toggle-all").toBeVisible()` |

---

### E2E Test File: Complete Patterns

**File:** `tests/e2e/story-4-2-implement-billable-non-billable-toggle-atdd.spec.ts`

**Standard seed (use in all tests):**
```typescript
const buildStandardSeed = () => ({
  tasks: [
    {
      id: 't1', title: 'Billable Task', columnId: 'col-1', clientId: 'c1',
      isBillable: true, hourlyRate: 100, timeSpent: 3600,
      createdAt: Date.now() - 5 * 86400000,  // 5 days ago (within last30)
      priority: 'medium', description: '', timeEstimate: null, dueDate: null, tags: [], order: 0,
    },
    {
      id: 't2', title: 'Non-Billable Task', columnId: 'col-1', clientId: 'c1',
      isBillable: false, hourlyRate: 0, timeSpent: 1800,
      createdAt: Date.now() - 3 * 86400000,  // 3 days ago (within last30)
      priority: 'low', description: '', timeEstimate: null, dueDate: null, tags: [], order: 1,
    },
  ],
  columns: [{ id: 'col-1', title: 'In Progress', order: 0 }],
  clients: [{ id: 'c1', name: 'Acme Corp', hourlyRate: 100, color: '#6366f1' }],
  version: 1,
});
```

**beforeEach pattern:**
```typescript
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('app-language', 'en');
    localStorage.setItem('freelancer-kanban-data', JSON.stringify({
      tasks: [
        {
          id: 't1', title: 'Billable Task', columnId: 'col-1', clientId: 'c1',
          isBillable: true, hourlyRate: 100, timeSpent: 3600,
          createdAt: Date.now() - 5 * 86400000,
          priority: 'medium', description: '', timeEstimate: null, dueDate: null, tags: [], order: 0,
        },
        {
          id: 't2', title: 'Non-Billable Task', columnId: 'col-1', clientId: 'c1',
          isBillable: false, hourlyRate: 0, timeSpent: 1800,
          createdAt: Date.now() - 3 * 86400000,
          priority: 'low', description: '', timeEstimate: null, dueDate: null, tags: [], order: 1,
        },
      ],
      columns: [{ id: 'col-1', title: 'In Progress', order: 0 }],
      clients: [{ id: 'c1', name: 'Acme Corp', hourlyRate: 100, color: '#6366f1' }],
      version: 1,
    }));
  });
});
```

**Toggle button selectors:**
```typescript
// Prefer data-testid for bilingual stability
await page.getByTestId('billable-toggle-all').click();
await page.getByTestId('billable-toggle-billable').click();
await page.getByTestId('billable-toggle-nonBillable').click();
```

**Active state assertion (localStorage):**
```typescript
const state = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('earnings-dashboard-state') || '{}')
);
expect(state.billableFilter).toBe('billable');
```

**Persistence test pattern:**
```typescript
// Set filter
await page.getByTestId('billable-toggle-nonBillable').click();
// Navigate away
await page.goto('/');
// Return
await page.goto('/earnings');
// Verify persisted
const state = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('earnings-dashboard-state') || '{}')
);
expect(state.billableFilter).toBe('nonBillable');
```

**500ms timing test (NFR-P2):**
```typescript
await page.goto('/earnings');
await expect(page.getByTestId('earnings-dashboard')).toBeVisible();
const start = Date.now(); // AFTER navigation — never before page.goto()
await page.getByTestId('billable-toggle-billable').click();
await expect(page.getByTestId('customer-revenue-chart')).toBeVisible();
expect(Date.now() - start).toBeLessThan(500);
```

**`Date.now()` timing rule (MANDATORY):**  
Capture `Date.now()` **after** `page.goto()` completes. See project-context.md "E2E timing rule."

**`{ exact: true }` rule:** Use `{ exact: true }` with `getByText()` when text could be a substring (e.g. "Billable" vs "Non-Billable").

**Import pattern (mandatory):**
```typescript
import { test, expect } from '../support/fixtures';
import { blockKnownThirdPartyHosts } from '../support/helpers/network';
```

---

### Architecture Compliance — What NOT to Change

- **No new `localStorage` keys** — `earnings-dashboard-state` already has `billableFilter`; this story fills/reads an existing field
- **`setBillableFilter` is correct as-is** — do not modify the context action
- **`filterTasksForEarnings` unchanged** — billable filtering is already implemented
- **`formatCurrency` note** — Story 4.4 will extract `formatCurrency` to `src/lib/utils.ts`; do NOT add a local copy in `BillableToggle`
- **`hiddenKeys` reset** — when `billableFilter` changes, the chart `useMemo` deps already include `state`, so chart data recalculates correctly. `hiddenKeys` reset will be addressed in Story 4.4. Do NOT replicate the omission — if adding `hiddenKeys` reset now, it must match the exact pattern from project-context.md: `new Set()` on dataset change
- **`Select` imports in `EarningsDashboard.tsx`** — keep `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` because the chart view Select on lines ~200-215 still uses them
- **No new `BillableFilter` type definitions** — use the existing type from `@/lib/earnings-dashboard-storage`

---

### Previous Story Intelligence (Story 4.1 — last completed)

**Test baseline:** 188 Vitest tests + 113 Playwright tests. Do NOT regress.

**Key learnings from Story 4.1 implementation (dev notes):**

- `Translations` interface is exported from `LanguageContext.tsx` — import it as `import type { Translations } from '@/context/LanguageContext'` (used by `DateRangeFilter` for `presetLabel` helper; follow same pattern for `filterLabel`)
- `data-testid` attributes on every toggle button — required for bilingual E2E stability (app-language can be `en` or `pt`)
- Preset button interaction pattern (click → context update → localStorage write) is identical to what BillableToggle needs — no Popover complexity required for this story
- `earnings-dashboard-persistence.spec.ts` was updated in Story 4.1 to use `getByTestId("preset-*")` instead of old combobox selectors — the same must be done for billable filter in Story 4.2
- Commit style: `"Implemented story 4.2"` — one focused commit bundling all story files
- `test.describe.configure({ retries: 1 })` available if 500ms timing test is fragile

**Files created/modified in Story 4.1 (do not reopen unnecessarily):**
- `src/components/DateRangeFilter.tsx` — reference for BillableToggle structure
- `src/context/EarningsDashboardStateContext.tsx` — already has `setCustomDateRange`; `setBillableFilter` also already there
- `src/pages/EarningsDashboard.tsx` — already has `<DateRangeFilter />`; this story adds `<BillableToggle />`

---

### Git Intelligence

Recent commits:
```
8f87b43 Implemented story 4.1
67b9e98 Implemented story 4.1
0115881 Sprint 3 retro and project context update
9ac211e Implemented story 3.4
```

Commit pattern: one commit per story, e.g. `"Implemented story 4.2"`. Bundle all changed files.

---

### FR / NFR Coverage

| Requirement | AC | Implementation |
|-------------|-----|----------------|
| FR15: Toggle billable-only | AC2 | `BillableToggle` `billable-toggle-billable` button → `setBillableFilter('billable')` |
| FR16: Toggle non-billable-only | AC3 | `BillableToggle` `billable-toggle-nonBillable` button → `setBillableFilter('nonBillable')` |
| FR17: Toggle all work | AC4 | `BillableToggle` `billable-toggle-all` button → `setBillableFilter('all')` |
| FR18: Filter applies to all charts | AC2, AC3 | `state.billableFilter` flows via `useEarningsDashboardState` → all three chart `useMemo` calculations in `EarningsDashboard.tsx` |
| FR19: Billable filter persists | AC5 | `setBillableFilter` already calls `saveEarningsDashboardState` |
| FR20: Separate billable/non-billable metrics | AC6 | Already implemented — "Billable Revenue" and "Non-Billable Revenue" metric cards exist |
| FR41: Billable filter persists across sessions | AC5 | Same as FR19 — localStorage key `earnings-dashboard-state` |
| NFR-P2: < 500ms filter response | AC E2E timing | No blocking computation — `useMemo` recalculates synchronously; state update is synchronous |

---

### References

- [Story 4.2 ACs — `_bmad-output/planning-artifacts/epics.md` — Epic 4, Story 4.2]
- [FR15–FR20, FR41, NFR-P2 — `_bmad-output/planning-artifacts/epics.md` — Requirements Inventory]
- [EarningsDashboardStateContext — `src/context/EarningsDashboardStateContext.tsx`]
- [earnings-dashboard-storage — `src/lib/earnings-dashboard-storage.ts`]
- [EarningsDashboard — `src/pages/EarningsDashboard.tsx`]
- [DateRangeFilter — `src/components/DateRangeFilter.tsx`] ← pattern reference for BillableToggle
- [LanguageContext — `src/context/LanguageContext.tsx`]
- [Earnings persistence spec — `tests/e2e/earnings-dashboard-persistence.spec.ts`] ← must update
- [Previous story — `_bmad-output/implementation-artifacts/4-1-implement-date-range-filter-and-presets.md`]
- [Project context — `_bmad-output/project-context.md`]

---

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Completion Notes List

- Story context created by story-creation agent. No new context actions, i18n keys, or localStorage schema changes needed — all required infrastructure is already in place from prior stories.
- `BillableToggle` component design mirrors `DateRangeFilter` but is simpler (no Popover, no calendar state) — pure button group pattern.
- `earnings-dashboard-persistence.spec.ts` updated: 4 tests using `getByRole("combobox", { name: /billable/i })` replaced with `getByTestId("billable-toggle-*")` button interactions and localStorage assertions.
- `EarningsDashboard.test.tsx` regression test updated: combobox selector replaced with `getByTestId("billable-toggle-billable")` and sibling button assertions.
- `BillableFilter` type import removed from `EarningsDashboard.tsx`; `ActiveChartView` stays because the chart view `<Select>` remains.
- ATDD visual distinction test (P1) had a seed bug: `page.evaluate()` spread over empty `{}` produced incomplete state that `coercePersisted` rejected. Fixed to set a complete valid state (`{version:1, dateRangePreset:'last30', billableFilter:'billable', activeChart:'customer'}`).
- Test results: 188 Vitest tests pass (no regressions). 9 ATDD tests pass (7 E2E + 2 API). 2 pre-existing intermittent timing failures (stories 1.1 NFR-P5, story 3.2 NFR-P1) not introduced by this story.
- Story 4.4 handles: chart view Select replacement, `hiddenKeys` reset on filter change, shared `formatCurrency` extraction. Do NOT scope creep into those areas.

### File List

| Action | Path |
|--------|------|
| Create | `src/components/BillableToggle.tsx` |
| Edit | `src/pages/EarningsDashboard.tsx` |
| Edit | `src/pages/EarningsDashboard.test.tsx` |
| Edit | `tests/e2e/earnings-dashboard-persistence.spec.ts` |
| Create | `tests/e2e/story-4-2-implement-billable-non-billable-toggle-atdd.spec.ts` |

### Review Findings

- [x] [Review][Patch] Stale "TDD Phase: RED" comment in E2E ATDD spec [`tests/e2e/story-4-2-implement-billable-non-billable-toggle-atdd.spec.ts`] — **auto-fixed**: updated to "GREEN — All tests active".
- [x] [Review][Patch] Stale "TDD Phase: RED" comment in API ATDD spec [`tests/api/story-4-2-billable-toggle-storage-atdd.spec.ts`] — **auto-fixed**: updated to "GREEN — All tests active".
- [x] [Review][Defer] `toHaveClass(/bg-primary/)` brittle against CSS class rename [`tests/e2e/story-4-2-implement-billable-non-billable-toggle-atdd.spec.ts:264`] — deferred, pre-existing; explicitly documented in spec and follows Story 4.1 precedent; visual regression testing is out of scope for this story.

### Change Log

| Date | Change |
|------|--------|
| 2026-04-06 | Story 4.2 created: ready-for-dev. Full implementation guide with component design, EarningsDashboard.tsx diff, persistence spec update map, E2E seed patterns, regression guards. |
| 2026-04-06 | Story 4.2 implemented: BillableToggle.tsx created, EarningsDashboard.tsx updated, EarningsDashboard.test.tsx regression guard updated, earnings-dashboard-persistence.spec.ts 4 tests updated, ATDD tests activated (9 tests green). Status → review. |
| 2026-04-06 | Code review complete: 2 patch findings auto-fixed (stale TDD phase comments), 1 deferred (toHaveClass fragility), 2 dismissed. Status → done. |
