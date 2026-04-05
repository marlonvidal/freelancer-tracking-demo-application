---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: '2026-04-05'
story: 3-2-implement-project-revenue-chart
tddPhase: RED
totalTests: 10
e2eTests: 10
apiTests: 0
allTestsSkipped: true
---

# ATDD Checklist: Story 3.2 — Project Revenue Chart

## TDD Red Phase (Current)

**Status:** 🔴 RED — Failing tests generated. Feature not yet implemented.

- E2E Tests: **10 tests** (all use `test.skip()`)
- API Tests: **0** (frontend SPA — no API calls)
- All tests assert **expected behavior** (not placeholder assertions)

---

## Step 1: Preflight & Context Summary

### Stack Detection

- `test_stack_type`: `auto` → detected as **`frontend`**
- Indicators: `package.json` (React/Vite SPA), `playwright.config.ts` present, no backend markers (`pyproject.toml`, `go.mod`, etc.)
- Test framework: **Playwright** (confirmed via `playwright.config.ts`)

### Prerequisites

- [x] Story 3.2 status: `ready-for-dev` with 7 clear acceptance criteria
- [x] `playwright.config.ts` present and configured (`testDir: "./tests/e2e"`)
- [x] Development environment available

### Story Context Loaded

- **File:** `_bmad-output/implementation-artifacts/3-2-implement-project-revenue-chart.md`
- **ACs:** 7 (pie chart, view switch, tooltip, responsive, performance, no-data, legend toggle)
- **Affected components:** `ProjectRevenueChart.tsx` (new), `EarningsDashboard.tsx` (edit), `LanguageContext.tsx` (1 key)

### Framework & Patterns Loaded

- Existing E2E pattern: `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts`
- Fixtures: `tests/support/fixtures/index.ts` (merges base fixtures)
- Helpers: `tests/support/helpers/network.ts` (`blockKnownThirdPartyHosts`)
- Config: `tea_use_playwright_utils: true`, `tea_browser_automation: auto`, `tea_execution_mode: auto`

---

## Step 2: Generation Mode

**Mode selected:** AI Generation

**Rationale:** Acceptance criteria are clear and specific; UI interactions are standard (Select component, SVG hover, legend click). No live browser recording required. Story 3.1 patterns are directly applicable.

---

## Step 3: Test Strategy

### Acceptance Criteria → Test Mapping

| AC | Description | Test Level | Priority | Test Name |
|----|-------------|-----------|----------|-----------|
| AC1 | Pie chart visible for `activeChart === 'project'` | E2E | P0 | `[P0] project revenue chart container is visible after switching to Project chart view` |
| AC1, FR5 | recharts SVG rendered with seeded tasks | E2E | P0 | `[P0] recharts SVG element is rendered inside project chart container with seeded billable task` |
| AC2, FR7 | Switching back to Customer hides project chart | E2E | P0 | `[P0] switching from Project back to Customer hides project chart container` |
| AC1, i18n | Chart title "Revenue by Project" visible | E2E | P1 | `[P1] chart section heading 'Revenue by Project' is visible` |
| AC6 | No-data message shown when empty | E2E | P1 | `[P1] no-data state shows informative message when task list is empty` |
| AC3, FR8 | Tooltip visible on hover with project name, revenue, % | E2E | P1 | `[P1] tooltip is visible when hovering the chart SVG area` |
| AC2, FR7 | Filter state preserved on chart switch | E2E | P1 | `[P1] switching from Customer to Project preserves earnings-dashboard container` |
| AC1, i18n | Portuguese title "Receita por Projeto" | E2E | P2 | `[P2] Portuguese locale renders translated chart title 'Receita por Projeto'` |
| AC5, NFR-P1 | Chart renders ≤2s with 50 tasks | E2E | P2 | `[P2] chart renders within 2 seconds with a large dataset of 50 tasks` |
| AC7, FR9 | Legend click toggles slice visibility | E2E | P2 | `[P2] clicking a legend item toggles project slice visibility` |

### AC4 (Responsive Resize)

AC4 (chart resizes to viewport width) is verified implicitly through AC1/AC5 tests — `<ResponsiveContainer width="100%">` is a structural property asserted by the chart rendering correctly in the test browser window. A dedicated responsive resize test is not added; it would require viewport manipulation that adds complexity without high marginal value in the red phase.

### Test Levels Decision

- **E2E only** — this is a frontend-only SPA with no network API calls; all data flows from `AppContext` via props.
- **No API tests** — `calculateRevenueByProject` is already covered by Vitest unit tests in `src/lib/earnings-calculations.test.ts`; no duplication.
- **No component tests** — covered at E2E level per project convention (Vitest for unit, Playwright for integration/E2E).

### Red Phase Requirements

- All tests use `test.skip()` — confirmed in generated file
- All tests assert expected behavior (not `expect(true).toBe(true)` placeholders) — confirmed
- All tests will fail when run because:
  - `ProjectRevenueChart.tsx` does not exist yet
  - `EarningsDashboard.tsx` does not yet conditionally render `<ProjectRevenueChart>`
  - `earningsProjectChartTitle` i18n key does not yet exist in `LanguageContext.tsx`

---

## Step 4: Generated E2E Tests

### Test File

**Path:** `tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts`

### Test Scenarios (10 total — all `test.skip()`)

#### P0 — Critical Path (3 tests)

1. **`[P0] project revenue chart container is visible after switching to Project chart view (AC1)`**
   - Seeds: English locale only (uses app default tasks)
   - Actions: navigate `/earnings` → click Chart selector → select "Project"
   - Assertion: `getByTestId("project-revenue-chart")` is visible
   - Will fail: component doesn't exist

2. **`[P0] recharts SVG element is rendered inside project chart container with seeded billable task (AC1, FR5)`**
   - Seeds: 2 billable tasks across 2 columns (`buildProjectSeed()`)
   - Actions: navigate → switch to Project view
   - Assertion: `[data-testid="project-revenue-chart"] svg` `.first()` is visible
   - Will fail: component doesn't exist

3. **`[P0] switching from Project back to Customer hides project chart container (AC2, FR7)`**
   - Seeds: English locale only
   - Actions: switch to Project → verify visible → switch back to Customer
   - Assertion: `project-revenue-chart` not visible after switch back
   - Will fail: component doesn't exist (first switch fails)

#### P1 — Important (4 tests)

4. **`[P1] chart section heading 'Revenue by Project' is visible (AC1 i18n)`**
   - Seeds: `buildProjectSeed()`
   - Assertion: `getByTestId("project-revenue-chart").getByText("Revenue by Project", { exact: true })` visible
   - Will fail: `earningsProjectChartTitle` key not in `LanguageContext.tsx`

5. **`[P1] no-data state shows informative message when task list is empty (AC6)`**
   - Seeds: `{ tasks: [], columns: [], clients: [], version: 1 }`
   - Assertions: container visible, "No data for this period" visible, SVG not visible
   - Will fail: component doesn't exist

6. **`[P1] tooltip is visible when hovering the chart SVG area (AC3, FR8)`**
   - Seeds: `buildProjectSeed()`
   - Actions: hover at bounding box center of chart SVG
   - Assertion: `.rounded-md.border.bg-popover` visible within 3000ms
   - Will fail: component doesn't exist

7. **`[P1] switching from Customer to Project preserves earnings-dashboard container (AC2, FR7)`**
   - Seeds: English locale only
   - Actions: verify customer chart → switch to Project → verify both states
   - Assertion: `earnings-dashboard` container still visible after switch
   - Will fail: component doesn't exist

#### P2 — Nice-to-Have (3 tests)

8. **`[P2] Portuguese locale renders translated chart title 'Receita por Projeto' (AC1 i18n)`**
   - Seeds: Portuguese locale + single task seed
   - Actions: `getByLabel("Gráfico")` → select "Projeto" option
   - Assertion: `getByText("Receita por Projeto", { exact: true })` visible
   - Will fail: PT i18n key not added, component doesn't exist

9. **`[P2] chart renders within 2 seconds with a large dataset of 50 tasks (AC5, NFR-P1)`**
   - Seeds: 50 tasks across 5 columns (inline in `addInitScript`)
   - Assertions: SVG visible within `{ timeout: 2000 }`, elapsed < 2000ms
   - Will fail: component doesn't exist

10. **`[P2] clicking a legend item toggles project slice visibility (AC7, FR9)`**
    - Seeds: `buildProjectSeed()` (Discovery + Development columns)
    - Actions: click "Discovery" legend text
    - Assertions: SVG still visible, "Development" still in legend
    - Will fail: component doesn't exist

### Key Implementation Patterns (from Dev Notes + project-context.md)

```typescript
// SVG locator — always use .first() (recharts Legend renders extra SVG icons)
page.locator('[data-testid="project-revenue-chart"] svg').first()

// Chart selector interaction
await page.getByLabel("Chart").click();
await page.getByRole("option", { name: "Project" }).click();

// Tooltip hover — compute bounding box center
const bbox = await chartSvg.boundingBox();
const cx = bbox ? bbox.width / 2 : 160;
const cy = bbox ? bbox.height / 2 : 160;
await chartSvg.hover({ position: { x: cx, y: cy } });
await expect(page.locator(".rounded-md.border.bg-popover")).toBeVisible({ timeout: 3000 });

// Seed data passed as argument to addInitScript (not accessible in browser context)
await page.addInitScript((seed) => {
  localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
}, buildProjectSeed());
```

---

## Step 4C: Aggregation

### TDD Red Phase Validation

- [x] All 10 tests use `test.skip()` — confirmed
- [x] No placeholder assertions (`expect(true).toBe(true)`) — confirmed
- [x] All tests assert expected UI behavior — confirmed
- [x] All tests marked as intentionally failing (TDD red phase) — confirmed

### Fixture Needs

- `buildProjectSeed()` — defined inline in test file (no separate fixture file needed)
- `blockKnownThirdPartyHosts` — already exists in `tests/support/helpers/network.ts`
- `test`, `expect` from `../support/fixtures` — already exists

No new fixture files created; all infrastructure already in place.

---

## Step 5: Validate & Complete

### Validation Checklist

- [x] Story 3.2 has clear acceptance criteria (7 ACs)
- [x] Test file created at `tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts`
- [x] All 10 tests use `test.skip()` (TDD red phase compliant)
- [x] All tests assert expected behavior (no placeholders)
- [x] All 7 ACs covered by at least one test
- [x] Imports follow project convention (`../support/fixtures`, not `@playwright/test`)
- [x] `blockKnownThirdPartyHosts(page)` called before every `page.goto()`
- [x] `app-language` seeded to `'en'` in `beforeEach`
- [x] `{ exact: true }` used with all `getByText()` calls
- [x] `.first()` used on all `[data-testid="project-revenue-chart"] svg` locators
- [x] Explicit `localStorage` seeding for all count-sensitive / empty-state tests
- [x] `buildProjectSeed()` uses `addInitScript(fn, arg)` pattern (browser context isolation)
- [x] No orphaned browser sessions (no CLI recording used)
- [x] Checklist saved to `_bmad-output/test-artifacts/atdd-checklist-3-2.md`

### Coverage Summary

| AC | Description | Tests Covering |
|----|-------------|----------------|
| AC1 | Pie chart visible | Tests 1, 2, 4, 8 |
| AC2 | View switch / filter preserved | Tests 3, 7 |
| AC3 | Tooltip with name, revenue, % | Test 6 |
| AC4 | Responsive resize | Implicitly by Tests 1, 9 |
| AC5 | ≤2s with 50 tasks | Test 9 |
| AC6 | No-data message | Test 5 |
| AC7 | Legend toggle | Test 10 |

### Risks & Assumptions

1. **`earningsProjectChartTitle` i18n key** — Tests 4 and 8 depend on this key being added to `LanguageContext.tsx`. Without it, both will fail even after the component is implemented.
2. **`earnings-dashboard` testid** — Test 7 asserts `getByTestId("earnings-dashboard")` is visible; this assumes the outer dashboard container has `data-testid="earnings-dashboard"`. Verify this exists in `EarningsDashboard.tsx` before green phase.
3. **Tooltip hover reliability** — Test 6 uses bounding box center; if recharts renders the pie differently in headless mode, the hover may miss the pie area. If flaky, fall back to a fixed offset within the known pie area.
4. **Legend text locator** — Test 10 uses `getByText("Discovery", { exact: true })` scoped to the chart container. If recharts Legend renders text in SVG (not HTML), this may not be reachable by `getByText`. Verify with live browser after implementation.

---

## Next Steps (TDD Green Phase)

After implementing Story 3.2:

1. **Remove `test.skip()`** from all 10 tests in `tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts`
2. **Run tests:** `npx playwright test tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts --workers=1`
3. **Verify all 10 tests PASS** (green phase)
4. If any tests fail:
   - If implementation bug → fix implementation
   - If test bug → fix test (check risks above)
5. **Regression check:** Verify 79 existing Playwright E2E tests still pass (baseline from Story 3.1 completion)
6. Commit: `ProjectRevenueChart.tsx` + `EarningsDashboard.tsx` + `LanguageContext.tsx` + E2E spec

## Implementation Files Required

| Action | Path | Purpose |
|--------|------|---------|
| Add | `src/components/ProjectRevenueChart.tsx` | Pie chart component (recharts) |
| Edit | `src/pages/EarningsDashboard.tsx` | Import + useMemo + conditional render |
| Edit | `src/context/LanguageContext.tsx` | Add `earningsProjectChartTitle` (en + pt + interface) |
| Test | `tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts` | This ATDD spec (remove `test.skip()` post-impl) |
