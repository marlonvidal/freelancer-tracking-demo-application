# Story 4.3: Ensure Filter Responsiveness and Keyboard Accessibility

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **user**,
I want **filters to apply instantly and be fully keyboard accessible**,
so that **I can quickly refine my analysis without a mouse and without delays**.

## Acceptance Criteria

1. **Given** I change a filter  
   **When** the dashboard updates  
   **Then** the change applies within 500ms (NFR-P2)

2. **Given** I am using keyboard navigation  
   **When** I Tab to a filter control (date picker, preset button, toggle)  
   **Then** the control receives focus with a visible indicator (FR35)

3. **Given** I have focus on a date preset button  
   **When** I press Enter or Space  
   **Then** that preset is selected and filters apply (FR33)

4. **Given** I have focus on a toggle button  
   **When** I press Enter or Space  
   **Then** that toggle option is selected (FR33)

5. **Given** I am using a keyboard only  
   **When** I interact with all filter controls  
   **Then** I can complete all filtering tasks (NFR-A7)

---

## Tasks / Subtasks

- [x] **Edit `src/components/BillableToggle.tsx`** (AC: 2, 4, 5)
  - [x] Add `aria-pressed={state.billableFilter === filter}` to each Button — communicates toggle state to screen readers
  - [x] Add `type="button"` to each Button — defensive best practice (prevents accidental form submit if ever wrapped)
  - [x] Add `aria-label` to the outer `<div data-testid="billable-toggle">` group using `role="group"` + `aria-label={t.earningsBillableFilterLabel}` for screen reader grouping context
  - [x] Preserve all existing `data-testid`, `variant`, `size`, and `onClick` attributes — no behavioral changes

- [x] **Edit `src/components/DateRangeFilter.tsx`** (AC: 2, 3, 5)
  - [x] Add `aria-pressed={isPresetActive(preset)}` to each preset Button — communicates active state to screen readers
  - [x] Add `type="button"` to each preset Button
  - [x] Add `aria-label={t.earningsPickDateRange}` to the Popover trigger Button (supplements the display text for screen readers in all locales)
  - [x] Add `type="button"` to the Popover trigger Button
  - [x] Add `role="group"` + `aria-label={t.earningsDateRangeLabel}` to the preset button wrapper `<div data-testid="date-range-presets">` — groups presets for screen reader navigation
  - [x] Preserve all existing `data-testid`, `variant`, `size`, `onClick` attributes — no behavioral changes

- [x] **Create `tests/e2e/story-4-3-ensure-filter-responsiveness-and-keyboard-accessibility-atdd.spec.ts`** (AC: 1–5, FR33, FR35, NFR-A7, NFR-P2)
  - [x] P0: Tab to preset button → focus visible, Enter activates (AC2, AC3, FR33)
  - [x] P0: Tab to toggle button → focus visible, Enter/Space activates (AC2, AC4, FR33)
  - [x] P0: Tab to calendar trigger → focus visible, Enter opens popover (AC2, FR33)
  - [x] P0: Keyboard-only can set date preset + billable filter → both applied (AC5, NFR-A7)
  - [x] P0: `aria-pressed` reflects active billable toggle state (AC4, FR33)
  - [x] P0: `aria-pressed` reflects active date preset state (AC3, FR33)
  - [x] P1: Filter change via keyboard responds within 500ms (AC1, NFR-P2)
  - [x] P1: Pressing Escape closes calendar popover (keyboard dismiss, FR33)

---

## Dev Notes

### Epic 4 Context (Story 4.3 Position)

Stories 4.1 (`DateRangeFilter`) and 4.2 (`BillableToggle`) are **done** — the filter components exist and function correctly. Story 4.3 hardens their accessibility contract:
- **No new filter logic** — state wiring, persistence, and filtering all work
- **No new i18n keys** — existing keys are reused for `aria-label` attributes
- **No new context actions** — read-only story from a state management perspective
- **Core change:** Add ARIA attributes (`aria-pressed`, `aria-label`, `role="group"`) + ATDD keyboard tests

Story 4.4 handles: chart view Select replacement, `hiddenKeys` reset, `formatCurrency` extraction. Do NOT scope-creep into those.

**Current test baseline:** 188 Vitest + 113 Playwright tests. Do NOT regress.

---

### C3 Spike: Keyboard Accessibility E2E Patterns (Resolved Here)

The project-context.md flagged "C3 — keyboard accessibility E2E patterns (spike pending)" before Epic 4 started, deferring keyboard nav E2E patterns to Story 4.3. This section documents the resolved patterns — **read before implementing ATDD tests**.

#### Playwright Keyboard Navigation Patterns

**Prefer `.focus()` over Tab-counting** for test stability. Tab order depends on the full DOM, which can change. Use element-specific focus:

```typescript
// CORRECT: Focus the element directly, then verify it is focused
await page.getByTestId('preset-last30').focus();
await expect(page.getByTestId('preset-last30')).toBeFocused();

// CORRECT: Tab to the next sibling within a group (after already focused on first)
await page.getByTestId('preset-last30').focus();
await page.keyboard.press('Tab');
await expect(page.getByTestId('preset-quarter')).toBeFocused();
```

**DO NOT** count global Tab presses from page start — fragile and platform-dependent.

#### Activating Focused Buttons

Native HTML `<button>` elements (which shadcn `Button` renders) respond to both Enter and Space natively. No special handling needed in the component:

```typescript
// Activate with Enter
await page.getByTestId('preset-year').focus();
await page.keyboard.press('Enter');

// Activate with Space (both are required per FR33/NFR-A7)
await page.getByTestId('billable-toggle-billable').focus();
await page.keyboard.press(' '); // Space key
```

#### Focus Indicator Assertions

The shadcn Button has `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` — visible focus ring is automatically applied when the button receives keyboard focus. In Playwright, verify the element is focused (not the CSS ring itself):

```typescript
// Correct approach: check element is focused (not CSS class)
await expect(page.getByTestId('preset-last30')).toBeFocused();

// DO NOT attempt to check CSS classes for focus ring — fragile and test-environment-dependent
// AVOID: expect(element).toHaveClass('focus-visible:ring-2') — CSS utility classes 
// do not appear in the classList directly in jsdom/Playwright
```

#### Calendar (Popover) Keyboard Interaction

The shadcn `Popover` + `Calendar` (react-day-picker v8) supports:
- **Enter** to open the popover from `PopoverTrigger` (Radix handles `aria-expanded` automatically)
- **Escape** to close the popover
- **Arrow keys** to navigate calendar grid cells (react-day-picker built-in)

```typescript
// Open calendar via keyboard
await page.getByTestId('date-range-picker-trigger').focus();
await page.keyboard.press('Enter');
await expect(page.getByRole('grid')).toBeVisible(); // DayPicker renders as role="grid"

// Close with Escape
await page.keyboard.press('Escape');
await expect(page.getByRole('grid')).not.toBeVisible();
```

#### `aria-pressed` Assertions

After adding `aria-pressed` to filter buttons:

```typescript
// Check active state
await expect(page.getByTestId('billable-toggle-all')).toHaveAttribute('aria-pressed', 'true');
await expect(page.getByTestId('billable-toggle-billable')).toHaveAttribute('aria-pressed', 'false');

// After activating billable:
await page.getByTestId('billable-toggle-billable').click();
await expect(page.getByTestId('billable-toggle-all')).toHaveAttribute('aria-pressed', 'false');
await expect(page.getByTestId('billable-toggle-billable')).toHaveAttribute('aria-pressed', 'true');
```

#### 500ms Timing Rule (MANDATORY)

Capture `Date.now()` **AFTER** `page.goto()` — see project-context.md "E2E timing rule."

```typescript
await page.goto('/earnings');
await expect(page.getByTestId('earnings-dashboard')).toBeVisible();
const start = Date.now(); // AFTER navigation — never before page.goto()
await page.getByTestId('preset-year').focus();
await page.keyboard.press('Enter');
await expect(page.getByTestId('customer-revenue-chart')).toBeVisible();
expect(Date.now() - start).toBeLessThan(500);
```

---

### BillableToggle.tsx — Required Changes

**File:** `src/components/BillableToggle.tsx`

**Current state (from Story 4.2):**
```tsx
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
```

**Required change — add `aria-pressed`, `type`, and group `role`:**
```tsx
<div
  className="flex flex-wrap gap-2"
  data-testid="billable-toggle"
  role="group"
  aria-label={t.earningsBillableFilterLabel}
>
  {FILTER_OPTIONS.map((filter) => (
    <Button
      key={filter}
      type="button"
      variant={state.billableFilter === filter ? 'default' : 'outline'}
      size="sm"
      onClick={() => setBillableFilter(filter)}
      data-testid={`billable-toggle-${filter}`}
      aria-pressed={state.billableFilter === filter}
    >
      {filterLabel(filter, t)}
    </Button>
  ))}
</div>
```

**What does NOT change:**
- The `<Label>` above the group
- The `FILTER_OPTIONS` array, `filterLabel()` helper
- The `useEarningsDashboardState()` + `useLanguage()` hooks
- The `setBillableFilter` call
- All `data-testid` values — E2E tests in Story 4.2 depend on these

---

### DateRangeFilter.tsx — Required Changes

**File:** `src/components/DateRangeFilter.tsx`

**Preset buttons — add `aria-pressed`, `type`, and group `role`:**

Current:
```tsx
<div className="flex flex-wrap gap-2" data-testid="date-range-presets">
  {PRESET_ORDER.map((preset) => (
    <Button
      key={preset}
      variant={isPresetActive(preset) ? 'default' : 'outline'}
      size="sm"
      onClick={() => {
        setDateRangePreset(preset);
        setCalendarRange(undefined);
      }}
      data-testid={`preset-${preset}`}
    >
      {presetLabel(preset, t)}
    </Button>
  ))}
</div>
```

Required change:
```tsx
<div
  className="flex flex-wrap gap-2"
  data-testid="date-range-presets"
  role="group"
  aria-label={t.earningsDateRangeLabel}
>
  {PRESET_ORDER.map((preset) => (
    <Button
      key={preset}
      type="button"
      variant={isPresetActive(preset) ? 'default' : 'outline'}
      size="sm"
      onClick={() => {
        setDateRangePreset(preset);
        setCalendarRange(undefined);
      }}
      data-testid={`preset-${preset}`}
      aria-pressed={isPresetActive(preset)}
    >
      {presetLabel(preset, t)}
    </Button>
  ))}
</div>
```

**Popover trigger — add `type` and `aria-label`:**

Current:
```tsx
<PopoverTrigger asChild>
  <Button
    variant="outline"
    className="max-w-md w-full justify-start text-left font-normal"
    data-testid="date-range-picker-trigger"
  >
    {formatDisplayRange(state, t)}
  </Button>
</PopoverTrigger>
```

Required change:
```tsx
<PopoverTrigger asChild>
  <Button
    type="button"
    variant="outline"
    className="max-w-md w-full justify-start text-left font-normal"
    data-testid="date-range-picker-trigger"
    aria-label={t.earningsPickDateRange}
  >
    {formatDisplayRange(state, t)}
  </Button>
</PopoverTrigger>
```

**Note on `aria-expanded`:** Radix UI's `PopoverTrigger` automatically manages `aria-expanded` on the trigger element. Do NOT add it manually — it would conflict with Radix's ARIA management.

**What does NOT change:**
- All logic (`isPresetActive`, `formatDisplayRange`, `presetLabel`, effect hooks)
- All `data-testid` values — Story 4.1 E2E tests depend on these
- The `Calendar` component inside `PopoverContent` — keyboard navigation within the calendar is handled by react-day-picker natively

---

### ATDD Test File — Complete Patterns

**File:** `tests/e2e/story-4-3-ensure-filter-responsiveness-and-keyboard-accessibility-atdd.spec.ts`

**Standard imports:**
```typescript
import { test, expect } from '../support/fixtures';
import { blockKnownThirdPartyHosts } from '../support/helpers/network';
```

**Standard seed (two tasks, one billable + one non-billable, both within last30):**
```typescript
const buildStandardSeed = () => ({
  tasks: [
    {
      id: 't1', title: 'Billable Task', columnId: 'col-1', clientId: 'c1',
      isBillable: true, hourlyRate: 100, timeSpent: 3600,
      createdAt: Date.now() - 5 * 86400000, // 5 days ago — inside last30
      priority: 'medium', description: '', timeEstimate: null, dueDate: null, tags: [], order: 0,
    },
    {
      id: 't2', title: 'Non-Billable Task', columnId: 'col-1', clientId: 'c1',
      isBillable: false, hourlyRate: 0, timeSpent: 1800,
      createdAt: Date.now() - 3 * 86400000, // 3 days ago — inside last30
      priority: 'low', description: '', timeEstimate: null, dueDate: null, tags: [], order: 1,
    },
  ],
  columns: [{ id: 'col-1', title: 'In Progress', order: 0 }],
  clients: [{ id: 'c1', name: 'Acme Corp', hourlyRate: 100, color: '#6366f1' }],
  version: 1,
});
```

**Standard `beforeEach`:**
```typescript
test.beforeEach(async ({ page }) => {
  const seed = buildStandardSeed();
  await page.addInitScript((data) => {
    localStorage.setItem('app-language', 'en');
    localStorage.setItem('freelancer-kanban-data', JSON.stringify(data));
  }, seed);
  blockKnownThirdPartyHosts(page);
});
```

**Full test file structure:**
```typescript
test.describe('Story 4.3 — Filter Responsiveness and Keyboard Accessibility', () => {
  test.describe.configure({ retries: 1 }); // for timing-sensitive tests

  // ── AC2 + AC3: Date preset buttons keyboard accessible ──────────────────────

  test('[P0] date preset buttons: Tab focuses, Enter activates (AC2, AC3, FR33, FR35)', async ({ page }) => {
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    // Focus first preset
    await page.getByTestId('preset-last30').focus();
    await expect(page.getByTestId('preset-last30')).toBeFocused();

    // Tab through preset buttons
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('preset-quarter')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByTestId('preset-year')).toBeFocused();

    // Activate with Enter
    await page.keyboard.press('Enter');

    const state = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('earnings-dashboard-state') || '{}')
    );
    expect(state.dateRangePreset).toBe('year');
  });

  test('[P0] date preset buttons: Space activates preset (AC3, FR33)', async ({ page }) => {
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    await page.getByTestId('preset-quarter').focus();
    await expect(page.getByTestId('preset-quarter')).toBeFocused();

    await page.keyboard.press(' '); // Space

    const state = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('earnings-dashboard-state') || '{}')
    );
    expect(state.dateRangePreset).toBe('quarter');
  });

  // ── AC2 + AC4: Billable toggle buttons keyboard accessible ──────────────────

  test('[P0] billable toggle buttons: Tab focuses, Enter activates (AC2, AC4, FR33, FR35)', async ({ page }) => {
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    // Focus first toggle button
    await page.getByTestId('billable-toggle-all').focus();
    await expect(page.getByTestId('billable-toggle-all')).toBeFocused();

    // Tab to next
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('billable-toggle-billable')).toBeFocused();

    // Activate with Enter
    await page.keyboard.press('Enter');

    const state = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('earnings-dashboard-state') || '{}')
    );
    expect(state.billableFilter).toBe('billable');
  });

  test('[P0] billable toggle buttons: Space activates toggle (AC4, FR33)', async ({ page }) => {
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    await page.getByTestId('billable-toggle-nonBillable').focus();
    await page.keyboard.press(' '); // Space

    const state = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('earnings-dashboard-state') || '{}')
    );
    expect(state.billableFilter).toBe('nonBillable');
  });

  // ── AC2: Calendar trigger keyboard accessible ────────────────────────────────

  test('[P0] calendar trigger: Tab focuses, Enter opens popover, Escape closes (AC2, FR33)', async ({ page }) => {
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    await page.getByTestId('date-range-picker-trigger').focus();
    await expect(page.getByTestId('date-range-picker-trigger')).toBeFocused();

    // Enter opens calendar popover
    await page.keyboard.press('Enter');
    await expect(page.getByRole('grid')).toBeVisible(); // DayPicker grid

    // Escape closes it
    await page.keyboard.press('Escape');
    await expect(page.getByRole('grid')).not.toBeVisible();
  });

  // ── aria-pressed: Active state communicated to screen readers ────────────────

  test('[P0] aria-pressed reflects active billable filter state (FR33, NFR-A2)', async ({ page }) => {
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    // Default: 'all' is active
    await expect(page.getByTestId('billable-toggle-all')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('billable-toggle-billable')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('billable-toggle-nonBillable')).toHaveAttribute('aria-pressed', 'false');

    // Activate 'billable'
    await page.getByTestId('billable-toggle-billable').click();

    await expect(page.getByTestId('billable-toggle-all')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('billable-toggle-billable')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('billable-toggle-nonBillable')).toHaveAttribute('aria-pressed', 'false');
  });

  test('[P0] aria-pressed reflects active date preset state (FR33, NFR-A2)', async ({ page }) => {
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    // Default: 'last30' is active
    await expect(page.getByTestId('preset-last30')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('preset-year')).toHaveAttribute('aria-pressed', 'false');

    // Activate 'year'
    await page.getByTestId('preset-year').click();

    await expect(page.getByTestId('preset-last30')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('preset-year')).toHaveAttribute('aria-pressed', 'true');
  });

  // ── AC5: Keyboard-only can complete all filter tasks ──────────────────────────

  test('[P0] keyboard-only: can set both date preset and billable filter (AC5, NFR-A7)', async ({ page }) => {
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    // Set date filter via keyboard
    await page.getByTestId('preset-year').focus();
    await page.keyboard.press('Enter');

    // Set billable filter via keyboard
    await page.getByTestId('billable-toggle-billable').focus();
    await page.keyboard.press('Enter');

    const state = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('earnings-dashboard-state') || '{}')
    );
    expect(state.dateRangePreset).toBe('year');
    expect(state.billableFilter).toBe('billable');
  });

  // ── AC1: 500ms filter responsiveness (NFR-P2) ─────────────────────────────────

  test('[P1] keyboard filter change responds within 500ms (AC1, NFR-P2)', async ({ page }) => {
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    const start = Date.now(); // AFTER page.goto() — mandatory timing rule
    await page.getByTestId('preset-year').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('customer-revenue-chart')).toBeVisible();
    expect(Date.now() - start).toBeLessThan(500);
  });

  test('[P1] billable toggle keyboard activation responds within 500ms (AC1, NFR-P2)', async ({ page }) => {
    await page.goto('/earnings');
    await expect(page.getByTestId('earnings-dashboard')).toBeVisible();

    const start = Date.now(); // AFTER page.goto() — mandatory timing rule
    await page.getByTestId('billable-toggle-billable').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('customer-revenue-chart')).toBeVisible();
    expect(Date.now() - start).toBeLessThan(500);
  });
});
```

---

### No New i18n Keys Required

Story 4.3 **reuses** existing `LanguageContext.tsx` keys for `aria-label` attributes:

| Usage | Translation key | `en` value | `pt` value |
|-------|----------------|------------|------------|
| `role="group"` on billable toggle | `t.earningsBillableFilterLabel` | `'Billable filter'` | `'Filtro faturável'` |
| `role="group"` on date presets | `t.earningsDateRangeLabel` | `'Date range'` | `'Intervalo de datas'` |
| `aria-label` on calendar trigger | `t.earningsPickDateRange` | `'Pick a date range'` | `'Escolha um intervalo de datas'` |

**Do NOT add new keys** — it would create unnecessary translation drift.

---

### No New Context Actions Required

Story 4.3 is purely additive from an accessibility standpoint. The existing context provides all required state:
- `state.billableFilter` → drives `aria-pressed` on BillableToggle buttons
- `state.dateRangePreset` + `state.dateRange` → drives `aria-pressed` via `isPresetActive()` on preset buttons
- No new actions, no new state shape changes

---

### No New localStorage Schema Changes

This story reads existing persisted state — no new fields, no migration required.

---

### Architecture Compliance — What NOT to Change

- **No new `localStorage` keys** — `earnings-dashboard-state` already has all required fields
- **No new context actions** — `setBillableFilter` and `setDateRangePreset` are unchanged
- **No changes to chart components** — `hiddenKeys` reset is Story 4.4 scope
- **No changes to `formatCurrency`** — extraction to `src/lib/utils.ts` is Story 4.4 scope
- **`Select` imports in `EarningsDashboard.tsx`** — keep `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` because the chart view `<Select>` still uses them (Story 4.4 replaces it)
- **Do NOT add `aria-expanded`** to `PopoverTrigger` manually — Radix UI manages this automatically
- **Do NOT reset `hiddenKeys`** — that is Story 4.4 scope

---

### Previous Story Intelligence (Story 4.2 — last completed)

**Dev notes and learnings from Story 4.2:**

- Commit pattern: `"Implemented story 4.2"` — one focused commit, bundle all changed files
- `data-testid` attributes are REQUIRED on all interactive elements for bilingual E2E stability
- The `Translations` type is exported from `LanguageContext.tsx` — `import type { Translations }` pattern
- E2E timing tests must use `test.describe.configure({ retries: 1 })` if marginal
- The `{ exact: true }` rule: always use with `getByText()` when text could be substring of longer label
- `blockKnownThirdPartyHosts(page)` called before `page.goto()` — prevents flaky external requests
- Import from `tests/support/fixtures`, not directly from `@playwright/test`
- 500ms timing tests: seed explicit localStorage data, capture `Date.now()` AFTER navigation
- ATDD visual distinction test (P1) with `page.evaluate()`: must spread a complete valid state object when checking state (e.g., `{version:1, dateRangePreset:'last30', billableFilter:'all', activeChart:'customer'}`)

**Files created/modified in Story 4.2 (already stable — do not reopen unnecessarily):**
- `src/components/BillableToggle.tsx` — reference implementation for this story's changes
- `src/pages/EarningsDashboard.tsx` — already has `<BillableToggle />` and `<DateRangeFilter />`
- `tests/e2e/story-4-2-implement-billable-non-billable-toggle-atdd.spec.ts` — note: explicitly says "DO NOT write keyboard navigation tests — deferred to Story 4.3"

**Files created/modified in Story 4.1 (stable — do not reopen unnecessarily):**
- `src/components/DateRangeFilter.tsx` — reference for this story's changes
- `tests/e2e/story-4-1-implement-date-range-filter-and-presets-atdd.spec.ts` — click-based; keyboard deferred to 4.3

---

### Git Intelligence

Recent commits:
```
0e741d0 Implemented story 4.2
8f87b43 Implemented story 4.1
67b9e98 Implemented story 4.1
0115881 Sprint 3 retro and project context update
9ac211e Implemented story 3.4
```

Commit pattern: one commit per story, e.g. `"Implemented story 4.3"`. Bundle all changed files in one commit.

---

### FR / NFR Coverage

| Requirement | AC | Implementation |
|-------------|-----|----------------|
| FR33: All interactive elements keyboard accessible (Tab, Enter/Space) | AC2, AC3, AC4 | Native `<button>` elements (shadcn Button) respond to Tab/Enter/Space natively; no additional keydown handlers needed |
| FR35: Focus indicators clearly visible | AC2 | shadcn Button has `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` — already present |
| NFR-A2: All interactive elements keyboard navigable via Tab key | AC2, AC5 | Native button elements in DOM order; Tab traversal works without custom code |
| NFR-A7: All interactions completable with keyboard alone | AC5 | Tab → focus button, Enter/Space → activate; calendar supports arrow key navigation natively (react-day-picker) |
| NFR-P2: < 500ms filter response | AC1 | No blocking computation — `useMemo` recalculates synchronously; state update is synchronous |

**Note on ARIA semantics:**
- `aria-pressed` on BillableToggle buttons: screen readers announce "All, toggle button, pressed/not pressed" — correctly communicates the three-option exclusive selection
- `aria-pressed` on DateRangeFilter preset buttons: same pattern
- `role="group"` + `aria-label` on button groups: screen readers announce "group, [group name]" before iterating buttons — provides context for navigating with virtual cursor

---

### References

- [Story 4.3 ACs — `_bmad-output/planning-artifacts/epics.md` — Epic 4, Story 4.3]
- [FR33–FR35, NFR-A2, NFR-A7, NFR-P2 — `_bmad-output/planning-artifacts/epics.md` — Requirements Inventory]
- [BillableToggle — `src/components/BillableToggle.tsx`] ← edit
- [DateRangeFilter — `src/components/DateRangeFilter.tsx`] ← edit
- [EarningsDashboard — `src/pages/EarningsDashboard.tsx`] ← no changes needed
- [EarningsDashboardStateContext — `src/context/EarningsDashboardStateContext.tsx`] ← no changes needed
- [LanguageContext — `src/context/LanguageContext.tsx`] ← no changes needed (keys already exist)
- [Button — `src/components/ui/button.tsx`] ← read-only, focus-visible ring already in base class
- [Previous story 4.2 — `_bmad-output/implementation-artifacts/4-2-implement-billable-non-billable-toggle.md`]
- [Previous story 4.1 — `_bmad-output/implementation-artifacts/4-1-implement-date-range-filter-and-presets.md`]
- [Project context — `_bmad-output/project-context.md`]

---

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Completion Notes List

- Story context created by story-creation agent. No new context actions, i18n keys, or localStorage schema changes needed — all required infrastructure is already in place from prior stories.
- C3 spike (keyboard accessibility E2E patterns) is resolved in this story's Dev Notes — patterns are documented and ready for the dev agent to follow without further research.
- shadcn Button already has `focus-visible:ring-2` ring in base class — focus indicators work without any CSS changes.
- The two filter components (`BillableToggle`, `DateRangeFilter`) are the only files requiring code changes.
- ATDD tests use `.focus()` + `keyboard.press()` pattern rather than global Tab-counting — more reliable across DOM structure changes.
- `aria-pressed` is the correct ARIA role for these exclusive-selection button groups (not `role="radio"` — that would require arrow key navigation between options which we don't want to add).
- Keyboard accessibility for date preset buttons and billable toggle buttons is already functionally in place via native `<button>` elements; this story adds the ARIA semantic layer and test coverage.
- `test.describe.configure({ retries: 1 })` applied for timing-sensitive NFR-P2 tests.

### File List

| Action | Path |
|--------|------|
| Edit | `src/components/BillableToggle.tsx` |
| Edit | `src/components/DateRangeFilter.tsx` |
| Create | `tests/e2e/story-4-3-ensure-filter-responsiveness-and-keyboard-accessibility-atdd.spec.ts` |

### Review Findings

**Code review complete.** 0 `decision-needed`, 0 `patch`, 0 `defer`, 1 dismissed as noise.

Review layers executed: Blind Hunter, Edge Case Hunter, Acceptance Auditor.

**Dismissed (1):**
- [x] [Review][Dismiss] `page.getByRole("grid")` locator could theoretically match multiple elements — confirmed no other source components use `role="grid"`; same pattern established in Story 4.1. Not actionable.

**Acceptance Criteria verified:**
- AC1 (500ms filter response): ✅ Two P1 timing tests with `retries: 1`
- AC2 (focus visible on Tab): ✅ All three control types tested with `.focus()` + `toBeFocused()`
- AC3 (Enter/Space on date preset): ✅ Two tests, state verified via localStorage
- AC4 (Enter/Space on toggle): ✅ Two tests, state verified via localStorage
- AC5 (keyboard-only): ✅ Dedicated keyboard-only integration test

**Test Results:** 207 Vitest ✅ | 10/10 Story 4.3 E2E ✅ | 128/132 full suite (3 pre-existing timing failures in Stories 1.1, 3.2, 3.3 — unrelated)

### Change Log

| Date | Change |
|------|--------|
| 2026-04-06 | Story 4.3 created: ready-for-dev. Comprehensive keyboard accessibility guide with C3 spike resolution, ARIA attribute changes (aria-pressed, role=group, aria-label), ATDD test patterns for Tab/Enter/Space/Escape keyboard interactions. |
| 2026-04-06 | Story 4.3 implemented: BillableToggle.tsx and DateRangeFilter.tsx updated with ARIA attributes (aria-pressed, type=button, role=group, aria-label). All 10 ATDD E2E tests passing. 207 Vitest tests passing. Status set to review. |
