---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: '2026-04-06'
story: 3-3-implement-tag-revenue-chart
tddPhase: RED
totalTests: 10
e2eTests: 10
apiTests: 0
allTestsSkipped: true
inputDocuments:
  - _bmad-output/implementation-artifacts/3-3-implement-tag-revenue-chart.md
  - tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts
  - tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts
  - tests/support/fixtures/index.ts
  - tests/support/helpers/network.ts
  - tests/support/fixtures/base.ts
  - playwright.config.ts
  - _bmad-output/project-context.md
  - _bmad/tea/config.yaml
---

# ATDD Checklist: Story 3.3 — Implement Tag Revenue Chart

## TDD Red Phase (Current)

**Status:** 🔴 RED — Failing tests generated. Feature not yet implemented.

- E2E Tests: **10 tests** (all use `test.skip()`)
- API Tests: **0** (frontend SPA — no API calls; all data flows from `AppContext`)
- All tests assert **expected behavior** (not placeholder assertions)

---

## Step 1: Preflight & Context Summary

### Stack Detection

- `test_stack_type`: `auto` → detected as **`frontend`**
- Indicators: `package.json` (React/Vite SPA with recharts), `playwright.config.ts` present, no backend markers (`pyproject.toml`, `go.mod`, etc.)
- Test framework: **Playwright** (confirmed via `playwright.config.ts`)
- Projects configured:
  - `chromium` → `tests/e2e/` (browser E2E tests)
  - `atdd-api` → `tests/api/` (no API tests needed for this story)
- Base URL: `http://localhost:8080`

### Prerequisites

- [x] Story 3.3 status: `ready-for-dev` with 8 clear acceptance criteria
- [x] `playwright.config.ts` present and configured (`testDir: "./tests/e2e"`)
- [x] Development environment available
- [x] `calculateRevenueByTag` and `RevenueByTagRow` confirmed exported from `src/lib/earnings-calculations.ts`
- [x] recharts `^2.15.4` confirmed in `package.json` — no new dependencies needed
- [x] `activeChart === 'tag'` is already a valid `ActiveChartView` in `earnings-dashboard-storage.ts`

### Story Context Loaded

- **File:** `_bmad-output/implementation-artifacts/3-3-implement-tag-revenue-chart.md`
- **ACs:** 8 (pie chart, view switch, untagged grouping, tooltip, no-data, legend toggle, responsive, performance)
- **Affected components:**
  - `src/components/TagRevenueChart.tsx` (new)
  - `src/pages/EarningsDashboard.tsx` (edit: import + useMemo + conditional render)
  - `src/context/LanguageContext.tsx` (edit: add `earningsTagChartTitle` key)
  - `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts` (new — this file)

### Framework & Patterns Loaded

- Existing E2E pattern: `tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts` (direct precedent)
- Existing E2E pattern: `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts`
- Fixtures: `tests/support/fixtures/index.ts` (merges base fixtures)
- Helpers: `tests/support/helpers/network.ts` (`blockKnownThirdPartyHosts`)
- Config: `tea_use_playwright_utils: true`, `tea_browser_automation: auto`, `tea_execution_mode: auto`

### TEA Config Flags

| Flag | Value |
|------|-------|
| `tea_use_playwright_utils` | `true` |
| `tea_use_pactjs_utils` | `false` |
| `tea_pact_mcp` | `none` |
| `tea_browser_automation` | `auto` |
| `tea_execution_mode` | `auto` |
| `test_stack_type` | `auto` → `frontend` |

---

## Step 2: Generation Mode

**Mode selected:** AI Generation

**Rationale:** Acceptance criteria are clear and specific; UI interactions are standard (Select component, SVG hover, legend click). No live browser recording required. Story 3.2 (ProjectRevenueChart) patterns are directly applicable — this story is the same pattern keyed on `tag` instead of `columnTitle`.

---

## Step 3: Test Strategy

### Acceptance Criteria → Test Mapping

| AC | Description | Test Level | Priority | Test Name |
|----|-------------|-----------|----------|-----------|
| AC1, FR6 | Pie chart container visible for `activeChart === 'tag'` | E2E | P0 | `[P0] tag revenue chart container is visible after switching to Tag chart view` |
| AC1, FR6 | recharts SVG rendered with seeded tagged tasks | E2E | P0 | `[P0] recharts SVG element is rendered inside tag chart container with seeded task` |
| AC2, FR7 | Switching back to Customer hides tag chart | E2E | P0 | `[P0] switching from Tag back to Customer hides tag chart container` |
| AC1, i18n | Chart title "Revenue by Tag" visible | E2E | P1 | `[P1] chart section heading 'Revenue by Tag' is visible` |
| AC5 | No-data message shown when task list empty | E2E | P1 | `[P1] no-data state shows informative message when task list is empty` |
| AC4, FR8 | Tooltip visible on hover with tag name, revenue, % | E2E | P1 | `[P1] tooltip is visible when hovering chart SVG area` |
| AC3 | Untagged task appears as "Untagged" legend entry | E2E | P1 | `[P1] untagged task revenue appears as 'Untagged' legend entry` |
| AC2, FR7 | Filter state preserved on chart switch | E2E | P1 | `[P1] switching from Customer to Tag preserves earnings-dashboard container` |
| AC1, i18n | Portuguese title "Receita por Tag" | E2E | P2 | `[P2] Portuguese locale renders 'Receita por Tag' chart title` |
| AC8, NFR-P1 | Chart renders ≤2s with 50 tasks | E2E | P2 | `[P2] chart renders within 2 seconds with dataset of 50 tasks` |

### ACs Without Dedicated Tests (covered implicitly)

| AC | Reason |
|----|--------|
| AC6 (legend toggle) | Covered implicitly by Tests 2/7 (recharts Legend renders; click behavior is same pattern as Story 3.2 Test 10 — omitted to keep suite focused since AC3/untagged test already exercises the legend) |
| AC7 (responsive resize) | `<ResponsiveContainer width="100%">` is a structural property verified implicitly when chart SVG renders in Tests 1, 2, 10 — dedicated resize test adds complexity without high marginal value in red phase |

### Test Levels Decision

- **E2E only** — this is a frontend-only SPA with no network API calls; all data flows from `AppContext` via props into the chart component.
- **No API tests** — `calculateRevenueByTag` is already covered by Vitest unit tests in `src/lib/earnings-calculations.test.ts`; no duplication needed.
- **No component tests** — covered at E2E level per project convention (Vitest for unit, Playwright for integration/E2E).

### Red Phase Requirements

- All 10 tests use `test.skip()` — confirmed ✅
- All tests assert expected behavior (no `expect(true).toBe(true)` placeholders) — confirmed ✅
- All tests will fail when run because:
  - `TagRevenueChart.tsx` does not exist yet
  - `EarningsDashboard.tsx` does not yet conditionally render `<TagRevenueChart>`
  - `earningsTagChartTitle` i18n key does not yet exist in `LanguageContext.tsx`

---

## Step 4: Generated E2E Tests

### Test File

**Path:** `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts`

### Test Scenarios (10 total — all `test.skip()`)

#### P0 — Critical Path (3 tests)

1. **`[P0] tag revenue chart container is visible after switching to Tag chart view (AC1)`**
   - Seeds: English locale only (uses app default tasks; any non-empty state works)
   - Actions: navigate `/earnings` → `getByLabel("Chart").click()` → select "Tag" option
   - Assertion: `getByTestId("tag-revenue-chart")` is visible
   - Will fail: `TagRevenueChart.tsx` component doesn't exist, `EarningsDashboard.tsx` has no conditional block for `activeChart === 'tag'`

2. **`[P0] recharts SVG element is rendered inside tag chart container with seeded task (AC1, FR6)`**
   - Seeds: `buildTagSeed()` — 2 billable tasks with `tags: ['design']` and `tags: ['development']`
   - Actions: navigate → switch to Tag view
   - Assertion: `page.locator('[data-testid="tag-revenue-chart"] svg').first()` is visible
   - Will fail: component doesn't exist

3. **`[P0] switching from Tag back to Customer hides tag chart container (AC2, FR7)`**
   - Seeds: English locale only
   - Actions: switch to Tag → verify visible → switch back to Customer
   - Assertion: `tag-revenue-chart` not visible after switching back
   - Will fail: component doesn't exist (first switch fails)

#### P1 — Important (5 tests)

4. **`[P1] chart section heading 'Revenue by Tag' is visible (AC1 i18n)`**
   - Seeds: `buildTagSeed()`
   - Assertion: `getByTestId("tag-revenue-chart").getByText("Revenue by Tag", { exact: true })` visible
   - Will fail: `earningsTagChartTitle` key not in `LanguageContext.tsx`; component doesn't exist

5. **`[P1] no-data state shows informative message when task list is empty (AC5)`**
   - Seeds: `{ tasks: [], columns: [], clients: [], version: 1 }` (overrides default 5 sample tasks)
   - Assertions: container visible, "No data for this period" visible, SVG not visible
   - Will fail: component doesn't exist

6. **`[P1] tooltip is visible when hovering chart SVG area (AC4, FR8)`**
   - Seeds: `buildTagSeed()`
   - Actions: hover at bounding box center of chart SVG (dynamic computation, not fixed position)
   - Assertion: `.rounded-md.border.bg-popover` visible within 3000ms
   - Will fail: component doesn't exist

7. **`[P1] untagged task revenue appears as 'Untagged' legend entry (AC3)`**
   - Seeds: `buildUntaggedSeed()` — 1 billable task with `tags: []`
   - Assertion: SVG visible; `getByText("Untagged", { exact: true })` scoped to `tag-revenue-chart` container
   - Will fail: component doesn't exist; `calculateRevenueByTag` sentinel not rendered

8. **`[P1] switching from Customer to Tag preserves earnings-dashboard container (AC2, FR7)`**
   - Seeds: English locale only
   - Actions: verify dashboard visible → switch to Tag → verify dashboard still visible
   - Assertion: `getByTestId("earnings-dashboard")` visible before and after switch
   - Will fail: component doesn't exist (Tag switch fails)

#### P2 — Nice-to-Have (2 tests)

9. **`[P2] Portuguese locale renders 'Receita por Tag' chart title (i18n)`**
   - Seeds: `app-language: 'pt'` + `buildTagSeed()`
   - Actions: `getByLabel("Gráfico")` → select "Tag" option (same option name in PT)
   - Assertion: `getByText("Receita por Tag", { exact: true })` visible inside `tag-revenue-chart`
   - Will fail: PT i18n key not added, component doesn't exist

10. **`[P2] chart renders within 2 seconds with dataset of 50 tasks (AC8, NFR-P1)`**
    - Seeds: 50 tasks across 5 tag groups (inline `addInitScript`)
    - Assertions: SVG visible within `{ timeout: 2000 }`, `elapsed < 2000ms`
    - Will fail: component doesn't exist

### Key Implementation Patterns (from Dev Notes + project-context.md)

```typescript
// SVG locator — always use .first() (recharts Legend renders extra SVG icons)
page.locator('[data-testid="tag-revenue-chart"] svg').first()

// Chart selector interaction
await page.getByLabel("Chart").click();
await page.getByRole("option", { name: "Tag" }).click();

// Tooltip hover — compute bounding box center dynamically
const chartSvg = page.locator('[data-testid="tag-revenue-chart"] svg').first();
const bbox = await chartSvg.boundingBox();
const cx = bbox ? bbox.width / 2 : 160;
const cy = bbox ? bbox.height / 2 : 160;
await chartSvg.hover({ position: { x: cx, y: cy } });
await expect(page.locator(".rounded-md.border.bg-popover")).toBeVisible({ timeout: 3000 });

// Seed data passed as argument to addInitScript (not accessible in browser context)
await page.addInitScript((seed) => {
  localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
}, buildTagSeed());
```

---

## Step 4C: Aggregation

### TDD Red Phase Validation

- [x] All 10 tests use `test.skip()` — confirmed (static skip via `test.skip('name', async fn)`)
- [x] No placeholder assertions (`expect(true).toBe(true)`) — confirmed
- [x] All tests assert expected UI behavior — confirmed
- [x] All tests intentionally failing (TDD red phase) — confirmed

### Execution Mode

- **Requested:** `auto` → resolved to **`sequential`** (single agent context, no subagent capability)
- **Performance:** baseline sequential (API→E2E)

### Fixture Needs

- `buildTagSeed()` — defined inline in test file (no separate fixture file needed)
- `buildUntaggedSeed()` — defined inline in test file (no separate fixture file needed)
- `blockKnownThirdPartyHosts` — already exists in `tests/support/helpers/network.ts`
- `test`, `expect` from `../support/fixtures` — already exists in `tests/support/fixtures/index.ts`

**No new fixture files created;** all infrastructure already in place.

---

## Step 5: Validate & Complete

### Validation Checklist

- [x] Story 3.3 has clear acceptance criteria (8 ACs)
- [x] Test file created at `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts`
- [x] All 10 tests use `test.skip()` (TDD red phase compliant)
- [x] All tests assert expected behavior (no placeholders)
- [x] All ACs covered by at least one test (AC6 and AC7 covered implicitly)
- [x] Imports follow project convention (`../support/fixtures`, not `@playwright/test`)
- [x] `blockKnownThirdPartyHosts(page)` called before every `page.goto()`
- [x] `app-language` seeded to `'en'` in `beforeEach`
- [x] `{ exact: true }` used with all `getByText()` calls
- [x] `.first()` used on all `[data-testid="tag-revenue-chart"] svg` locators
- [x] Explicit `localStorage` seeding for all count-sensitive / empty-state tests
- [x] `buildTagSeed()` and `buildUntaggedSeed()` use `addInitScript(fn, arg)` pattern (browser context isolation)
- [x] No orphaned browser sessions (no CLI recording used)
- [x] Checklist saved to `_bmad-output/test-artifacts/atdd-checklist-3-3.md`

### Coverage Summary

| AC | Description | Tests Covering |
|----|-------------|----------------|
| AC1 | Pie chart visible, title, SVG rendered | Tests 1, 2, 4, 9 |
| AC2 | View switch / filter preserved | Tests 3, 8 |
| AC3 | Untagged grouping | Test 7 |
| AC4 | Tooltip with tag name, revenue, % | Test 6 |
| AC5 | No-data message | Test 5 |
| AC6 | Legend toggle | Implicitly by Tests 2, 7 |
| AC7 | Responsive resize | Implicitly by Tests 1, 10 |
| AC8 | ≤2s with 50 tasks | Test 10 |

### Risks & Assumptions

1. **`earningsTagChartTitle` i18n key** — Tests 4 and 9 depend on this key being added to `LanguageContext.tsx`. Without it, both will fail even after the component is implemented.
2. **`earnings-dashboard` testid** — Test 8 asserts `getByTestId("earnings-dashboard")` is visible; this assumes the outer dashboard container has `data-testid="earnings-dashboard"`. Verify this exists in `EarningsDashboard.tsx` before green phase (same assumption as Story 3.2 Test 7).
3. **Tooltip hover reliability** — Test 6 uses bounding box center; if recharts renders the pie differently in headless mode, the hover may miss the pie area. If flaky, fall back to a fixed offset within the known pie area (precedent from Stories 3.1 and 3.2).
4. **"Untagged" legend text locator** — Test 7 uses `getByText("Untagged", { exact: true })` scoped to the chart container. recharts Legend may render text in HTML spans (accessible by `getByText`) or SVG `<text>` elements (not accessible). Story 3.2 legend tests used HTML legend rendering — same behavior expected here.
5. **Portuguese "Tag" option** — Test 9 clicks `getByRole("option", { name: "Tag" })`. The `earningsChartTag = 'Tag'` / `'Tag'` i18n key is the same in both EN and PT (tag is a loanword in Portuguese). If this changes, update the test.

---

## Required data-testid Attributes

### TagRevenueChart Component

- `tag-revenue-chart` — root wrapper div (both data state and no-data state per dev notes)

**Implementation Example:**

```tsx
// Data state
<div data-testid="tag-revenue-chart" className="space-y-2">
  <h2 className="text-lg font-semibold">{t.earningsTagChartTitle}</h2>
  <ResponsiveContainer ...>...</ResponsiveContainer>
</div>

// No-data state (same testid)
<div data-testid="tag-revenue-chart" className="flex items-center justify-center h-48 ...">
  <p className="text-muted-foreground text-sm">{t.earningsChartNoData}</p>
</div>
```

---

## Implementation Files Required

| Action | Path | Purpose |
|--------|------|---------|
| Add | `src/components/TagRevenueChart.tsx` | Pie chart component (recharts) with `data-testid="tag-revenue-chart"` |
| Edit | `src/pages/EarningsDashboard.tsx` | Import + `calculateRevenueByTag` + `tagData` useMemo + conditional render |
| Edit | `src/context/LanguageContext.tsx` | Add `earningsTagChartTitle` (en: `'Revenue by Tag'`, pt: `'Receita por Tag'`) |
| Test | `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts` | This ATDD spec (remove `test.skip()` after implementation) |

---

## Next Steps (TDD Green Phase)

After implementing Story 3.3:

1. **Remove `test.skip()`** from all 10 tests in `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts`
2. **Run tests:** `npx playwright test tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts --workers=1`
3. **Verify all 10 tests PASS** (green phase)
4. If any tests fail:
   - If implementation bug → fix implementation
   - If test bug → check risks section above
5. **Regression check:** Verify 89 existing Playwright E2E tests still pass (baseline from Story 3.2 completion)
6. **Commit:** `TagRevenueChart.tsx` + `EarningsDashboard.tsx` + `LanguageContext.tsx` + E2E spec

## Running Tests

```bash
# Run all failing tests for this story (should all be skipped — red phase)
npx playwright test tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts --workers=1

# Run tests in headed mode (see browser)
npx playwright test tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts --workers=1 --headed

# Debug specific test
npx playwright test tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts --workers=1 --debug

# Run all E2E tests (regression check)
npx playwright test --workers=1
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All 10 tests written and skipped (TDD red phase)
- ✅ Seed factories `buildTagSeed()` and `buildUntaggedSeed()` defined inline
- ✅ Mock requirements documented (no external services — SPA)
- ✅ `data-testid` requirements listed (`tag-revenue-chart`)
- ✅ Implementation checklist created

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. Pick P0 tests first (Tests 1–3): implement `TagRevenueChart.tsx` + EarningsDashboard integration
2. Pick P1 tests next (Tests 4–8): add `earningsTagChartTitle` i18n key, verify no-data state, tooltip, untagged sentinel
3. Pick P2 tests last (Tests 9–10): verify Portuguese locale, verify performance budget

### REFACTOR Phase (DEV Team - After All Tests Pass)

After all 10 tests pass: code review, DRY check (shared `CHART_COLORS`, `formatCurrency`), Epic 6 retro consolidation.

---

## Knowledge Base References Applied

- **fixture-architecture.md** — Test fixture patterns (inline seed factories preferred over separate fixture files for this story)
- **data-factories.md** — Seed data factory patterns (`buildTagSeed()`, `buildUntaggedSeed()`)
- **test-quality.md** — Given-When-Then structure, `{ exact: true }` on text assertions, deterministic seeding
- **selector-resilience.md** — `data-testid` scoping, `.first()` on recharts SVG
- **timing-debugging.md** — `boundingBox()` center hover for tooltip, `{ timeout: 3000 }` on tooltip assertion
- **network-first.md** — `blockKnownThirdPartyHosts(page)` before every `page.goto()`

---

**Generated by BMad TEA Agent** — 2026-04-06
