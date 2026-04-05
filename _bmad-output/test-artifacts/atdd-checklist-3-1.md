---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04b-subagent-e2e-failing
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: '2026-04-05'
storyId: '3-1'
storyTitle: Implement Customer Revenue Chart
tddPhase: RED
inputDocuments:
  - _bmad-output/implementation-artifacts/3-1-implement-customer-revenue-chart.md
  - tests/e2e/story-2-2-summary-metrics-atdd.spec.ts
  - tests/e2e/story-2-1-earnings-calculations-atdd.spec.ts
  - tests/support/fixtures/index.ts
  - tests/support/helpers/network.ts
  - tests/support/fixtures/base.ts
  - playwright.config.ts
  - src/lib/earnings-calculations.ts
  - _bmad-output/project-context.md
---

# ATDD Checklist: Story 3.1 — Implement Customer Revenue Chart

## Step 1: Preflight & Context

### Stack Detection

- **Detected stack:** `fullstack` (frontend indicators: `package.json` with React/Vite/recharts, `playwright.config.ts`; calculation logic in `src/lib/`)
- **Test framework:** Playwright (`playwright.config.ts` confirmed)
- **Projects configured:**
  - `atdd-api` → `tests/api/` (programmatic unit-level API tests)
  - `chromium` → `tests/e2e/` (browser E2E tests)
- **Base URL:** `http://localhost:8080`

### Prerequisites Satisfied

- [x] Story 3.1 has clear acceptance criteria (AC1–7)
- [x] `playwright.config.ts` exists and is configured
- [x] Story status: `ready-for-dev`
- [x] `calculateRevenueByCustomer` and `RevenueByCustomerRow` confirmed exported from `src/lib/earnings-calculations.ts` (implemented in Story 2.1)
- [x] recharts `^2.15.4` confirmed in `package.json` — no new dependencies needed

### Story Context Loaded

- Story file: `_bmad-output/implementation-artifacts/3-1-implement-customer-revenue-chart.md`
- Target component: `src/components/CustomerRevenueChart.tsx` (new)
- Integration target: `src/pages/EarningsDashboard.tsx` (edit — conditional render when `activeChart === 'customer'`)
- i18n target: `src/context/LanguageContext.tsx` (add `earningsCustomerChartTitle`, `earningsChartNoData`)
- Key `data-testid`: `customer-revenue-chart` on the root wrapper div

---

## Step 2: Generation Mode

- **Selected mode:** AI Generation (no browser recording)
- **Reason:** ACs are clear and well-specified; component does not exist yet so browser recording would fail; story Dev Notes provide exact recharts API patterns and Playwright assertions
- **Execution mode:** E2E only (no API tests — calculation logic fully covered by Story 2.1 ATDD)

---

## Step 3: Test Strategy

### Acceptance Criteria → Test Scenarios Mapping

| AC | Description | Test Level | Priority | Test Name |
|----|-------------|------------|----------|-----------|
| AC1 | Pie chart visible when `activeChart === 'customer'` | E2E | P0 | Chart container visible in default customer chart view |
| AC1 | recharts SVG element rendered inside container | E2E | P0 | SVG element is rendered with seeded billable task |
| AC1 | Chart title heading visible (`earningsCustomerChartTitle`) | E2E | P1 | Chart heading 'Revenue by Customer' visible |
| AC2 | Tooltip shows client name, currency, percentage on hover | E2E | P1 | Tooltip visible on SVG hover |
| AC3 | Legend click toggles slice visibility | E2E | P1 | (deferred — legend DOM assertions are complex; covered in dev integration) |
| AC4 | Chart auto-resizes with viewport | E2E | P2 | (deferred — viewport resize tests require complex setup; ResponsiveContainer verified via SVG render) |
| AC5 | Renders within 2 seconds with large dataset | E2E | P2 | Chart renders within 2s with 50-task dataset |
| AC6 | No-data message shown when no tasks | E2E | P1 | No-data state shows 'No data for this period' |
| AC7 | Switching chart view hides customer chart | E2E | P0 | Switching to Project view hides customer chart container |
| AC7 | Switching chart view preserves filter state | E2E | P1 | Switching to Tag view preserves earnings dashboard container |
| i18n | Portuguese translations render correctly | E2E | P2 | Portuguese locale shows 'Receita por Cliente' |
| i18n | Portuguese no-data translation | E2E | P2 | Portuguese locale shows 'Sem dados para este período' |

### Test Level Decisions

- **E2E tests only** (`tests/e2e/`): Story 3.1 is a pure UI story — all data aggregation is delegated to `calculateRevenueByCustomer` (tested in Story 2.1). E2E covers chart presence, no-data state, view switching, tooltip, and i18n.
- **No API tests**: No new calculation functions introduced in this story.
- **AC3 (legend click)**: Deferred — recharts Legend DOM structure is internal; asserting on the SVG's path opacity changes is brittle. Covered in green phase integration testing.
- **AC4 (responsive resize)**: Deferred — `ResponsiveContainer` behavior is verified implicitly by SVG rendering (width="100%"); explicit resize assertion requires `page.setViewportSize` multi-step sequence beyond P2 scope.

### Red Phase Design

All tests use `test.skip()` wrapper — the `CustomerRevenueChart` component and integration in `EarningsDashboard.tsx` do not exist yet. All assertions describe the **expected production behavior**, not dummy assertions.

---

## Step 4: Test Generation (TDD Red Phase)

### E2E Tests

**File:** `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts`

| # | Test Name | Priority | ACs Covered |
|---|-----------|----------|-------------|
| 1 | `[P0]` customer revenue chart container is visible in default customer chart view | P0 | AC1 |
| 2 | `[P0]` recharts SVG element is rendered inside the chart container with seeded billable task | P0 | AC1, FR4 |
| 3 | `[P0]` switching to Project chart view hides the customer chart container | P0 | AC7, FR7 |
| 4 | `[P1]` chart section heading 'Revenue by Customer' is visible | P1 | AC1 i18n |
| 5 | `[P1]` no-data state shows informative message when task list is empty | P1 | AC6 |
| 6 | `[P1]` tooltip is visible when hovering the chart SVG area | P1 | AC2, FR8 |
| 7 | `[P1]` switching chart view preserves billable filter and date range state | P1 | AC7, FR7 |
| 8 | `[P2]` Portuguese locale renders translated chart title 'Receita por Cliente' | P2 | AC1 i18n |
| 9 | `[P2]` Portuguese locale no-data state shows translated message | P2 | AC6 i18n |
| 10 | `[P2]` chart renders within 2 seconds with a large dataset of 50 tasks | P2 | AC5, NFR-P1 |

**Total E2E tests:** 10
**TDD phase:** RED — all wrapped in `test.skip()`
**Pattern:** Mirrors `tests/e2e/story-2-2-summary-metrics-atdd.spec.ts` — `../support/fixtures` import, `blockKnownThirdPartyHosts`, `addInitScript` for locale seeding, `getByTestId`/`getByText`/`locator` selectors

---

## Step 4C: Aggregation & TDD Validation

### TDD Red Phase Compliance

- [x] All 10 E2E tests use `test.skip()` — confirmed
- [x] No placeholder assertions (`expect(true).toBe(true)`) — all assertions describe expected production behavior
- [x] All tests expected to fail — `CustomerRevenueChart` component not yet implemented; `EarningsDashboard` integration not yet added
- [x] No API test file needed — calculation logic fully covered by Story 2.1

### Files Written to Disk

- [x] `tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts` ✅
- [x] `_bmad-output/test-artifacts/atdd-checklist-3-1.md` ✅

### Fixture Needs

- **E2E tests:** `blockKnownThirdPartyHosts` from `tests/support/helpers/network` (exists); `addInitScript` for `localStorage` seeding (no new fixtures needed)
- Inline task/client seed objects used directly in each test (no shared factory needed for this story)

### Summary Statistics

| Metric | Value |
|--------|-------|
| TDD Phase | RED |
| Total Tests | 10 |
| API Tests | 0 |
| E2E Tests | 10 |
| All Tests Skipped | ✅ Yes (`test.skip()`) |
| All Expected to Fail | ✅ Yes |
| Fixtures Created | 0 (existing infrastructure sufficient) |
| Execution Mode | E2E only |

---

## Step 5: Validation & Completion

### Validation Checklist

- [x] Story 3.1 has clear acceptance criteria — prerequisites satisfied
- [x] `playwright.config.ts` covers `tests/e2e/` directory (`chromium` project)
- [x] E2E spec mirrors existing specs: `../support/fixtures` import, `blockKnownThirdPartyHosts`, `addInitScript` for locale seeding
- [x] All tests target `data-testid="customer-revenue-chart"` (as specified in story Dev Notes)
- [x] Tests do NOT use `page.getByText()` on SVG text content — scoped to container or use `locator()` for SVG
- [x] Tests use `{ exact: true }` with `getByText()` to avoid substring collisions (lesson from Story 2.2 retro)
- [x] No temp artifacts left — all outputs in `_bmad-output/test-artifacts/`
- [x] No orphaned browser sessions

### Key Risks & Assumptions

1. **`data-testid="customer-revenue-chart"`** — All E2E tests depend on this attribute being on the root wrapper. Dev must add it to both the no-data and chart variants (per story Dev Notes skeleton).
2. **Default `activeChart === 'customer'`** — P0 tests assume the Earnings Dashboard defaults to customer chart view. If the default changes, P0 tests 1 and 2 will need `addInitScript` to explicitly set the active chart.
3. **`getByLabel('Chart')` selector** — Tests 3 and 7 use `page.getByLabel('Chart')` to open the chart view selector. This relies on the shadcn `<Select>` having an accessible label matching `t.earningsChartViewLabel = 'Chart'`. Confirm label text matches implementation.
4. **Tooltip hover position** — Test 6 hovers at `{ x: 100, y: 100 }` inside the SVG. If the pie chart doesn't render a slice at this position (e.g., due to viewport size), the tooltip may not appear. Adjust position in green phase if needed.
5. **Performance test (test 10)** — Uses 50 tasks (not 5,000 as in FR43) to keep test runtime reasonable in CI. The `timeout: 2000` on `toBeVisible` covers the 2-second render budget. Full 5,000-task performance can be validated manually or in a dedicated perf suite.
6. **Legend click AC3** — Not covered in E2E (deferred). Will be added in green phase once the component's DOM structure is known and stable.

### Deferred Tests (Added in Green Phase)

| AC | Reason for Deferral | Green Phase Action |
|----|---------------------|--------------------|
| AC3 | Legend DOM structure internal to recharts; brittle to assert before implementation | Add assertion on `hiddenKeys` visual effect (line-through style or pie slice count) after component exists |
| AC4 | Responsive resize requires `page.setViewportSize` multi-step; `ResponsiveContainer` implicitly verified by SVG render | Add explicit viewport resize test if FR10 coverage gap identified in code review |

### Next Steps (TDD Green Phase)

After implementing story 3.1:

1. **Remove `test.skip()`** from all 10 tests
2. **Run E2E suite:** `npx playwright test --project=chromium tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts --workers=1`
3. Verify all 10 tests **PASS** (green phase)
4. If any test fails: fix the implementation (not the test) unless the test has a selector bug
5. Commit all files: `CustomerRevenueChart.tsx` + `EarningsDashboard.tsx` + `LanguageContext.tsx` + E2E spec

### Implementation Guidance

**Files to create/edit for Story 3.1:**

| Action | Path | Notes |
|--------|------|-------|
| Add | `src/components/CustomerRevenueChart.tsx` | New pie chart component — single default export; must include `data-testid="customer-revenue-chart"` on root div |
| Edit | `src/pages/EarningsDashboard.tsx` | Add `customerData` useMemo + conditional render `{state.activeChart === 'customer' && <CustomerRevenueChart data={customerData} />}` |
| Edit | `src/context/LanguageContext.tsx` | Add `earningsCustomerChartTitle` and `earningsChartNoData` to `en`, `pt`, and `Translations` interface |

**i18n keys required:**

| Key | English | Portuguese |
|-----|---------|------------|
| `earningsCustomerChartTitle` | `'Revenue by Customer'` | `'Receita por Cliente'` |
| `earningsChartNoData` | `'No data for this period'` | `'Sem dados para este período'` |

### Recommended Next Workflow

After green phase is confirmed: run **`bmad-code-review`** skill on the implementation diff, then **`bmad-dev-story`** for story 3.2 (if applicable).
