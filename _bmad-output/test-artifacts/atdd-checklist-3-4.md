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
story: 3-4-ensure-chart-responsiveness-and-performance
tddPhase: RED
totalTests: 6
e2eTests: 6
apiTests: 0
allTestsSkipped: true
inputDocuments:
  - _bmad-output/implementation-artifacts/3-4-ensure-chart-responsiveness-and-performance.md
  - tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts
  - tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts
  - tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts
  - tests/support/fixtures/index.ts
  - tests/support/helpers/network.ts
  - playwright.config.ts
  - _bmad-output/test-artifacts/atdd-checklist-3-3.md
---

# ATDD Checklist: Story 3.4 — Ensure Chart Responsiveness and Performance

## TDD Red Phase (Current)

**Status:** 🔴 RED — Failing tests generated. Feature not yet implemented.

- E2E Tests: **6 tests** (all use `test.skip()`)
- API Tests: **0** (frontend SPA — no API calls; all data flows from `AppContext`)
- All tests assert **expected behavior** (no `expect(true).toBe(true)` placeholders)

---

## Step 1: Preflight & Context Summary

### Stack Detection

- `test_stack_type`: `auto` → detected as **`frontend`**
- Indicators: `package.json` (React/Vite SPA with recharts), `playwright.config.ts` present, no backend markers (`pyproject.toml`, `go.mod`, etc.)
- Test framework: **Playwright** (confirmed via `playwright.config.ts`)
- Projects configured:
  - `chromium` → `tests/e2e/` (browser E2E tests)
  - `atdd-api` → `tests/api/` (no API tests for this story)
- Base URL: `http://localhost:8080`

### Prerequisites

- [x] Story 3.4 status: `ready-for-dev` with 4 clear acceptance criteria
- [x] `playwright.config.ts` present and configured (`testDir: "./tests/e2e"`)
- [x] Development environment available
- [x] recharts `^2.15.4` confirmed — `isAnimationActive` prop available on `<Pie>`
- [x] All three chart components exist: `CustomerRevenueChart.tsx`, `ProjectRevenueChart.tsx`, `TagRevenueChart.tsx`
- [x] `data-testid="customer-revenue-chart"` / `"project-revenue-chart"` / `"tag-revenue-chart"` confirmed from Stories 3.1–3.3

### Story Context Loaded

- **File:** `_bmad-output/implementation-artifacts/3-4-ensure-chart-responsiveness-and-performance.md`
- **ACs:** 4 (320px responsive, 2s perf, tooltip non-blocking, 500ms chart switch)
- **Affected components:**
  - `src/components/CustomerRevenueChart.tsx` (edit: add `isAnimationActive={false}`)
  - `src/components/ProjectRevenueChart.tsx` (edit: add `isAnimationActive={false}`)
  - `src/components/TagRevenueChart.tsx` (edit: add `isAnimationActive={false}`)
  - `src/pages/EarningsDashboard.tsx` (conditional edit: `p-6` → `p-3 sm:p-6` only if 320px test fails)
  - `tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts` (new — this file)

### Framework & Patterns Loaded

- Existing E2E pattern: `tests/e2e/story-3-3-tag-revenue-chart-atdd.spec.ts` (direct precedent)
- Existing E2E pattern: `tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts`
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

**Rationale:** All 4 acceptance criteria are specific and testable. UI interactions are standard (Select component, SVG hover, viewport sizing). Story 3.3 patterns are directly applicable — same chart infrastructure, same selector conventions. No live browser recording needed. The primary implementation change (`isAnimationActive={false}`) is a pure prop addition verifiable through timing assertions.

---

## Step 3: Test Strategy

### Acceptance Criteria → Test Mapping

| AC | Description | Test Level | Priority | Test Name |
|----|-------------|-----------|----------|-----------|
| AC1 | All charts readable at 320px with no horizontal scroll | E2E | P0 | `[P0] all charts readable at 320px viewport with no horizontal scroll` |
| AC2, FR43, NFR-P1 | Dashboard renders within 2s with 5000 tasks | E2E | P0 | `[P0] dashboard and charts render within 2 seconds with 5000-task dataset` |
| AC3, FR45 | Tooltip remains responsive during redraw | E2E | P1 | `[P1] tooltip interaction not blocked — tooltip appears on hover` |
| AC4, NFR-P2 | Chart switch completes within 500ms | E2E | P1 | `[P1] chart transition Customer→Project completes within 500ms` |
| AC1 | Customer chart SVG not clipped at 320px (bounding box) | E2E | P2 | `[P2] customer chart SVG has meaningful dimensions at 320px — not clipped` |
| AC1 | Tag chart SVG not clipped at 320px after view switch | E2E | P2 | `[P2] tag chart visible and not clipped at 320px viewport` |

### ACs Without Dedicated Tests (covered implicitly)

| AC | Reason |
|----|--------|
| AC1 (project chart at 320px) | Covered implicitly — same `ResponsiveContainer width="100%"` layout used in all three charts; if customer chart passes P0+P2, project chart is structurally equivalent |
| AC2 (project/tag charts within 2s) | Covered implicitly — performance is an app-level concern; customer chart timing test (P0) validates the full dashboard load including the memoized calculation layer |

### Test Levels Decision

- **E2E only** — this is a frontend-only SPA with no network API calls; all data flows from `AppContext`
- **No API tests** — timing requirements are UI-side; calculation functions are already covered by Vitest unit tests
- **No component tests** — covered at E2E level per project convention

### Red Phase Requirements

All 6 tests use `test.skip()` and will fail (as skipped) because:
- `isAnimationActive={false}` is NOT yet added to `<Pie>` in any chart component
- Without it: 400ms recharts animation overhead makes the 500ms switch budget (AC4) impossible to meet
- With 5000 tasks and animation enabled, the 2s render budget (AC2) is at risk
- Animation tween can block pointer events, causing tooltip tests (AC3) to be unreliable
- Mobile layout fix (conditional `p-3 sm:p-6`) not yet verified/applied for AC1

---

## Step 4: Generated E2E Tests

### Test File

**Path:** `tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts`

### Test Scenarios (6 total — all `test.skip()`)

#### P0 — Critical Path (2 tests)

1. **`[P0] all charts readable at 320px viewport with no horizontal scroll (AC1)`**
   - Seeds: `buildSingleTaskSeed()` — 1 billable task, 1 column, 1 client
   - Setup: `page.setViewportSize({ width: 320, height: 568 })` BEFORE `page.goto()`
   - Actions: navigate `/earnings`
   - Assertions:
     - `getByTestId("customer-revenue-chart")` is visible
     - `document.body.scrollWidth > window.innerWidth` evaluates to `false`
   - Will fail (skipped): mobile layout not yet verified; `p-6` padding may cause overflow at 320px

2. **`[P0] dashboard and charts render within 2 seconds with 5000-task dataset (AC2, FR43, NFR-P1)`**
   - Seeds: `build5000TaskSeed()` — 5000 tasks, 5 columns, 10 clients
   - Actions: `Date.now()` timer started BEFORE `page.goto()`; wait for customer chart SVG
   - Assertion: `Date.now() - start < 2000`
   - Will fail (skipped): `isAnimationActive={true}` (default) adds 400ms+ overhead with large datasets

#### P1 — Important (2 tests)

3. **`[P1] tooltip interaction not blocked — tooltip appears on hover (AC3, FR45)`**
   - Seeds: `buildSmallSeed()` — 2 tasks, 2 clients (multiple pie slices for tooltip)
   - Actions: navigate → hover at bounding-box center of customer chart SVG
   - Assertion: `.rounded-md.border.bg-popover` visible within 3000ms
   - Will fail (skipped): animation tween may block pointer events during pie redraw

4. **`[P1] chart transition Customer→Project completes within 500ms (AC4, NFR-P2)`**
   - Seeds: `buildSmallSeed()` — 2 tasks, 2 clients
   - Actions: wait for customer chart → start timer → click Chart label → select "Project"
   - Assertion: `getByTestId("project-revenue-chart")` visible; `Date.now() - switchStart < 500`
   - Will fail (skipped): 400ms recharts animation alone exceeds the 500ms budget

#### P2 — Nice-to-Have (2 tests)

5. **`[P2] customer chart SVG has meaningful dimensions at 320px — not clipped (AC1)`**
   - Seeds: `buildSingleTaskSeed()`
   - Setup: `page.setViewportSize({ width: 320, height: 568 })`
   - Assertions: SVG `boundingBox().width > 100` and `boundingBox().height > 100`
   - Will fail (skipped): layout overflow at 320px may clip SVG dimensions

6. **`[P2] tag chart visible and not clipped at 320px viewport (AC1)`**
   - Seeds: `buildSingleTaskSeed()`
   - Setup: `page.setViewportSize({ width: 320, height: 568 })`
   - Actions: navigate → switch to Tag view
   - Assertion: `[data-testid="tag-revenue-chart"] svg` bounding box `width > 100`
   - Will fail (skipped): layout overflow at 320px may clip SVG after chart switch

### Key Implementation Patterns Applied

```typescript
// SVG locator — always use .first() (recharts Legend renders extra SVG icons)
page.locator('[data-testid="customer-revenue-chart"] svg').first()

// Viewport must be set BEFORE page.goto()
await page.setViewportSize({ width: 320, height: 568 });
await blockKnownThirdPartyHosts(page);
await page.goto('/earnings');

// Performance timing — timer starts before goto (established pattern from Stories 3.1–3.3)
const start = Date.now();
await page.goto('/earnings');
await expect(page.locator('[data-testid="customer-revenue-chart"] svg').first()).toBeVisible();
expect(Date.now() - start).toBeLessThan(2000);

// Horizontal scroll check
const hasHorizontalScroll = await page.evaluate(
  () => document.body.scrollWidth > window.innerWidth,
);
expect(hasHorizontalScroll).toBe(false);

// Tooltip hover — compute bounding box center dynamically (fixed offsets miss pie at narrow widths)
const chartSvg = page.locator('[data-testid="customer-revenue-chart"] svg').first();
const bbox = await chartSvg.boundingBox();
const cx = bbox ? bbox.width / 2 : 160;
const cy = bbox ? bbox.height / 2 : 160;
await chartSvg.hover({ position: { x: cx, y: cy } });
await expect(page.locator('.rounded-md.border.bg-popover')).toBeVisible({ timeout: 3000 });

// Chart switch timing
const switchStart = Date.now();
await page.getByLabel('Chart').click();
await page.getByRole('option', { name: 'Project' }).click();
await expect(page.getByTestId('project-revenue-chart')).toBeVisible();
expect(Date.now() - switchStart).toBeLessThan(500);

// Seed data passed as arg to addInitScript (factory runs in Node.js, not browser)
await page.addInitScript(
  (seed) => { localStorage.setItem('freelancer-kanban-data', JSON.stringify(seed)); },
  build5000TaskSeed(), // called once in Node context, result serialized into browser
);
```

---

## Step 4C: Aggregation

### TDD Red Phase Validation

- [x] All 6 tests use `test.skip()` — confirmed (first call inside test body)
- [x] No placeholder assertions (`expect(true).toBe(true)`) — confirmed
- [x] All tests assert expected UI and timing behavior — confirmed
- [x] All tests intentionally failing/skipped (TDD red phase) — confirmed

### Execution Mode

- **Requested:** `auto` → resolved to **`sequential`** (single agent context, no subagent capability)
- **Performance:** baseline sequential (API→E2E; no API tests for this story)

### Fixture Needs

- `build5000TaskSeed()` — defined inline in test file (factory, not a separate fixture)
- `buildSmallSeed()` — defined inline in test file
- `buildSingleTaskSeed()` — defined inline in test file
- `blockKnownThirdPartyHosts` — already exists in `tests/support/helpers/network.ts`
- `test`, `expect` from `../support/fixtures` — already exists in `tests/support/fixtures/index.ts`

**No new fixture files created;** all infrastructure already in place.

---

## Step 5: Validate & Complete

### Validation Checklist

- [x] Story 3.4 has clear acceptance criteria (4 ACs covering AC1–AC4)
- [x] Test file created at `tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts`
- [x] All 6 tests use `test.skip()` (TDD red phase compliant)
- [x] All tests assert expected behavior (no placeholder assertions)
- [x] All ACs covered by at least one dedicated test (AC1 covered by 4 tests)
- [x] Imports follow project convention (`../support/fixtures`, not `@playwright/test`)
- [x] `blockKnownThirdPartyHosts(page)` called before every `page.goto()`
- [x] `app-language` seeded to `'en'` in `beforeEach`
- [x] `page.setViewportSize()` called BEFORE `page.goto()` in all mobile tests
- [x] `.first()` used on all `[data-testid="*-revenue-chart"] svg` locators
- [x] Explicit `localStorage` seeding for all tests (never relying on app defaults)
- [x] Seed factories use `addInitScript(fn, seed)` pattern (browser context isolation)
- [x] Timer starts before `page.goto()` in performance tests (established pattern)
- [x] `{ timeout: 3000 }` used on tooltip assertion (hover timing buffer)
- [x] No orphaned browser sessions (no CLI recording used)
- [x] Checklist saved to `_bmad-output/test-artifacts/atdd-checklist-3-4.md`

### Coverage Summary

| AC | Description | Tests Covering |
|----|-------------|----------------|
| AC1 | 320px responsive — no horizontal scroll | Test 1 (P0) |
| AC1 | 320px responsive — SVG not clipped (customer) | Test 5 (P2) |
| AC1 | 320px responsive — SVG not clipped (tag) | Test 6 (P2) |
| AC1 | 320px responsive — project chart (implicit) | Tests 1, 5 (structural equivalence) |
| AC2, FR43, NFR-P1 | 2s render with 5000 tasks | Test 2 (P0) |
| AC3, FR45 | Tooltip not blocked during redraw | Test 3 (P1) |
| AC4, NFR-P2 | 500ms chart switch transition | Test 4 (P1) |

### Risks & Assumptions

1. **P0 mobile test might pass without layout fix** — The story notes that at 320px with `p-6` (24px each side), the available width is 272px which recharts fills correctly. The P0 horizontal-scroll test may not detect overflow because the layout may already work. If so, the test transitions immediately to green after the `isAnimationActive` fix.

2. **2s performance budget with `test.skip()` removed** — With `isAnimationActive={false}` added, the 2s budget should be achievable. If it fails on slow CI machines, the `playwright.config.ts` global `expect.timeout: 15_000` doesn't cover the `Date.now()` timing check. This is a known trade-off from Stories 3.1–3.3.

3. **Tooltip hover reliability** — Test 3 uses bounding-box center; recharts pie center is at `cx="50%"`, `cy="50%"`. If headless Chromium renders the pie differently from headed mode, the hover may miss. Fallback: use `{ x: 100, y: 100 }` fixed offset within the pie area (precedent from Stories 3.1–3.2).

4. **500ms chart-switch timing on CI** — `Date.now()` includes Playwright's inter-step overhead. On slow CI machines, 500ms may be tight even with animation disabled. If flaky, consider relaxing to 600ms or using `performance.now()` inside the page for precise measurement.

5. **`data-testid="project-revenue-chart"`** — Test 4 asserts this testid. Confirmed from Story 3.2 implementation. If it doesn't exist, the chart switch test fails for the wrong reason.

6. **`data-testid="tag-revenue-chart"`** — Test 6 asserts this testid. Confirmed from Story 3.3 implementation.

---

## Required data-testid Attributes

All required `data-testid` attributes are already implemented from Stories 3.1–3.3:

| data-testid | Component | Status |
|-------------|-----------|--------|
| `customer-revenue-chart` | `CustomerRevenueChart.tsx` | ✅ Exists (Story 3.1) |
| `project-revenue-chart` | `ProjectRevenueChart.tsx` | ✅ Exists (Story 3.2) |
| `tag-revenue-chart` | `TagRevenueChart.tsx` | ✅ Exists (Story 3.3) |
| `earnings-dashboard` | `EarningsDashboard.tsx` | ✅ Exists (Story 3.1) |

No new `data-testid` attributes required for Story 3.4.

---

## Implementation Files Required

| Action | Path | Purpose |
|--------|------|---------|
| Edit | `src/components/CustomerRevenueChart.tsx` | Add `isAnimationActive={false}` to `<Pie>` |
| Edit | `src/components/ProjectRevenueChart.tsx` | Add `isAnimationActive={false}` to `<Pie>` |
| Edit | `src/components/TagRevenueChart.tsx` | Add `isAnimationActive={false}` to `<Pie>` |
| Conditional Edit | `src/pages/EarningsDashboard.tsx` | Change `p-6` to `p-3 sm:p-6` ONLY IF Test 1 fails due to overflow |
| Test | `tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts` | This ATDD spec (remove `test.skip()` after implementation) |

---

## Next Steps (TDD Green Phase)

After implementing Story 3.4:

1. **Remove `test.skip()`** from all 6 tests in `tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts`
2. **Run tests:** `npx playwright test tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts --workers=1`
3. **Verify all 6 tests PASS** (green phase)
4. If any tests fail:
   - If P0/P2 mobile test fails with overflow → apply `p-3 sm:p-6` fix in `EarningsDashboard.tsx`
   - If P0 performance test fails → check that `isAnimationActive={false}` is applied to all 3 chart files
   - If P1 chart-switch test fails → verify timing; recharts animation must be fully disabled
   - If P1 tooltip test fails → try fixed offset `{ x: 100, y: 100 }` as fallback (see Risk 3 above)
5. **Regression check:** Verify 99 existing Playwright E2E tests still pass (baseline from Story 3.3 completion)
6. **Commit:** `CustomerRevenueChart.tsx` + `ProjectRevenueChart.tsx` + `TagRevenueChart.tsx` + E2E spec (+ optional `EarningsDashboard.tsx`)

## Running Tests

```bash
# Run all failing tests for this story (should all be skipped — red phase)
npx playwright test tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts --workers=1

# Run tests in headed mode (see browser interactions)
npx playwright test tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts --workers=1 --headed

# Debug specific test
npx playwright test tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts --workers=1 --debug

# Run all E2E tests (regression check)
npx playwright test --workers=1
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All 6 tests written and skipped (TDD red phase)
- ✅ Seed factories `build5000TaskSeed()`, `buildSmallSeed()`, `buildSingleTaskSeed()` defined inline
- ✅ No external services or mocks needed (SPA — all data from localStorage)
- ✅ `data-testid` requirements confirmed (all exist from Stories 3.1–3.3)
- ✅ Implementation file checklist created (3 edits + 1 conditional edit + 1 new test file)

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. Pick P0 tests first (Tests 1–2): add `isAnimationActive={false}` to all 3 chart files; conditionally fix `EarningsDashboard.tsx` padding if P0 mobile test fails
2. Pick P1 tests next (Tests 3–4): verify tooltip responsiveness and 500ms chart switch with animation disabled
3. Pick P2 tests last (Tests 5–6): verify SVG bounding box dimensions at 320px for customer and tag charts

### REFACTOR Phase (DEV Team - After All Tests Pass)

After all 6 tests pass: code review, confirm all 3 chart files have consistent `isAnimationActive={false}`, Epic 3 retrospective.

---

## Knowledge Base References Applied

- **data-factories.md** — Seed data factory patterns (`build5000TaskSeed()`, `buildSmallSeed()`, `buildSingleTaskSeed()`)
- **test-quality.md** — Given-When-Then structure, deterministic seeding, no reliance on app defaults
- **selector-resilience.md** — `data-testid` scoping, `.first()` on recharts SVG, `getByLabel` for shadcn Select
- **timing-debugging.md** — `boundingBox()` center hover, `{ timeout: 3000 }` on tooltip assertion, `Date.now()` timer before `goto()`
- **network-first.md** — `blockKnownThirdPartyHosts(page)` before every `page.goto()`
- **component-tdd.md** — `test.skip()` red-phase pattern, mobile viewport testing via `setViewportSize()`

---

**Generated by BMad TEA Agent** — 2026-04-06
