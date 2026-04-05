---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04a-subagent-api-failing
  - step-04b-subagent-e2e-failing
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: '2026-04-05'
storyId: '2-2'
storyTitle: Implement summary metrics calculations
tddPhase: RED
inputDocuments:
  - _bmad-output/implementation-artifacts/2-2-implement-summary-metrics-calculations.md
  - tests/api/story-2-1-earnings-calculations-atdd.spec.ts
  - tests/e2e/story-2-1-earnings-calculations-atdd.spec.ts
  - tests/support/fixtures/index.ts
  - tests/support/helpers/network.ts
  - tests/support/fixtures/base.ts
  - playwright.config.ts
  - src/lib/earnings-calculations.ts
---

# ATDD Checklist: Story 2.2 — Implement Summary Metrics Calculations

## Step 1: Preflight & Context

### Stack Detection

- **Detected stack:** `fullstack` (frontend indicators: `package.json` with React/Vite, `playwright.config.ts`; calculation logic in `src/lib/`)
- **Test framework:** Playwright (`playwright.config.ts` confirmed)
- **Projects configured:**
  - `atdd-api` → `tests/api/` (programmatic unit-level API tests)
  - `chromium` → `tests/e2e/` (browser E2E tests)
- **Base URL:** `http://localhost:8080`

### Prerequisites Satisfied

- [x] Story 2.2 has clear acceptance criteria (AC1–9)
- [x] `playwright.config.ts` exists and is configured
- [x] Story status: `ready-for-dev`
- [x] Previous story (2.1) primitives confirmed exported: `filterTasksForEarnings`, `getTaskBillableRevenue`, `getEffectiveHourlyRate`, `resolveDateRangeMs`

### Story Context Loaded

- Story file: `_bmad-output/implementation-artifacts/2-2-implement-summary-metrics-calculations.md`
- Target function: `calculateSummaryMetrics(tasks, clients, dateRangeMs, billableFilter) → SummaryMetrics`
- Target type: `SummaryMetrics` (6 fields: totalRevenue, billableRevenue, nonBillableRevenue, averageHourlyRate, totalTaskCount, billableTaskCount)
- UI target: `EarningsDashboard.tsx` — 5 metric cards in a responsive grid

---

## Step 2: Generation Mode

- **Selected mode:** AI Generation (no browser recording needed)
- **Reason:** Acceptance criteria are clear; API tests are programmatic (no UI); E2E tests target a not-yet-implemented UI component — browser recording would fail on missing elements
- **Execution mode:** Sequential (API → E2E)

---

## Step 3: Test Strategy

### Acceptance Criteria → Test Scenarios Mapping

| AC | Description | Test Level | Priority | Test Name |
|----|-------------|------------|----------|-----------|
| AC1 | Five metric cards displayed (totalRevenue, billableRevenue, nonBillableRevenue, averageHourlyRate, taskCount) | API + E2E | P0 | Basic billable task produces correct metrics; all five cards visible |
| AC2 | Date range preset "Last 30 days" filters by `createdAt` | API | P1 | Date range filter excludes tasks outside window |
| AC3 | Filter change recalculates metrics immediately | E2E | P1 | (deferred to integration testing — requires UI interaction with filter controls not yet implemented) |
| AC4 | No tasks → all revenues $0.00, count 0 total / 0 billable | API + E2E | P0 | Empty task list; zero-state rendering |
| AC5 | Billable-only filter excludes non-billable | API | P0 | billableFilter='billable' excludes non-billable |
| AC6 | Non-billable filter → zero revenue, non-billable task count | API | P1 | billableFilter='nonBillable' → zero revenue |
| AC7 | totalRevenue == getTaskBillableRevenue sum; earnings-calculations.ts is single source | API | P0 | totalRevenue equals billableRevenue; task hourlyRate override wins |
| AC8 | Edge cases (zero-rate, null clientId, timeSpent=0) → no NaN/Infinity/throw | API | P1 | clientId=null task; timeSpent=0 guard |
| AC9 | averageHourlyRate = 0 when all billable timeSpent === 0 | API | P0 | timeSpent=0 → averageHourlyRate=0 |

### Test Level Decisions

- **API tests** (`tests/api/`): Cover all calculation logic (ACs 1, 2, 4–9). Pure function calls via dynamic import — no browser needed.
- **E2E tests** (`tests/e2e/`): Cover rendered metric card presence and i18n labels (ACs 1, 4 — structural verification only per story spec). E2E does NOT verify exact numbers.
- **AC3 filter reactivity** (E2E): Deferred — requires billable filter UI interaction controls not yet implemented in this story.

### Red Phase Design

All tests use `test.skip()` wrapper so the Playwright suite sees them as intentionally deferred. No tests assert `true` to be `true` — all assertions describe the **expected production behavior**.

---

## Step 4: Test Generation (TDD Red Phase)

### Subagent A — API Tests

**File:** `tests/api/story-2-2-summary-metrics-atdd.spec.ts`

| # | Test Name | Priority | ACs Covered |
|---|-----------|----------|-------------|
| 1 | basic billable task → correct all six metrics | P0 | AC1 |
| 2 | non-billable task → totalRevenue=0, billableTaskCount=0 | P0 | AC6 |
| 3 | mixed billable/non-billable with filter='all' counts both | P0 | AC1, AC5 |
| 4 | billableFilter='billable' excludes non-billable | P0 | AC5, FR15, FR18 |
| 5 | billableFilter='nonBillable' → zero revenue, correct totalTaskCount | P1 | AC6, FR16 |
| 6 | empty task list → all-zero SummaryMetrics, no throw | P0 | AC4 |
| 7 | date range filter excludes tasks outside window | P1 | AC2, FR13 |
| 8 | timeSpent=0 on billable tasks → averageHourlyRate=0, no Infinity/NaN | P0 | AC9 |
| 9 | clientId=null + hourlyRate=null → 0 revenue safely, no throw | P1 | AC8, FR50 |
| 10 | task-level hourlyRate overrides client hourlyRate (nullish precedence) | P1 | AC7, FR26 |
| 11 | totalRevenue === billableRevenue always; nonBillableRevenue === 0 | P0 | AC7, FR26 |

**Total API tests:** 11  
**TDD phase:** RED — all wrapped in `test.skip()`  
**Pattern:** Mirrors `tests/api/story-2-1-earnings-calculations-atdd.spec.ts` (dynamic import, task() builder, [Pn] prefix)

### Subagent B — E2E Tests

**File:** `tests/e2e/story-2-2-summary-metrics-atdd.spec.ts`

| # | Test Name | Priority | ACs Covered |
|---|-----------|----------|-------------|
| 1 | all five metric cards visible on /earnings | P0 | AC1 |
| 2 | zero-state: $0.00 revenue and "0 total / 0 billable" with no tasks | P0 | AC4 |
| 3 | task count card shows "X total / Y billable" format with seeded data | P0 | AC1, FR25 |
| 4 | Portuguese locale renders translated labels | P1 | AC1 + i18n |
| 5 | metrics grid renders inside earnings-dashboard container | P1 | AC1 layout |

**Total E2E tests:** 5  
**TDD phase:** RED — all wrapped in `test.skip()`  
**Pattern:** Mirrors existing E2E specs (`earnings-dashboard-route.spec.ts`): fixtures import, `blockKnownThirdPartyHosts`, `addInitScript` for locale, `getByTestId` / `getByText` selectors

---

## Step 4C: Aggregation & TDD Validation

### TDD Red Phase Compliance

- [x] All 11 API tests use `test.skip()` — confirmed
- [x] All 5 E2E tests use `test.skip()` — confirmed
- [x] No placeholder assertions (`expect(true).toBe(true)`) — all assertions describe expected production behavior
- [x] All tests marked as expected_to_fail — feature (`calculateSummaryMetrics`, metric cards) not yet implemented

### Files Written to Disk

- [x] `tests/api/story-2-2-summary-metrics-atdd.spec.ts` ✅
- [x] `tests/e2e/story-2-2-summary-metrics-atdd.spec.ts` ✅
- [x] `_bmad-output/test-artifacts/atdd-checklist-2-2.md` ✅

### Fixture Needs

- **API tests:** None — uses inline `task()` builder + `Client[]` literals (mirrors story 2-1 pattern)
- **E2E tests:** `blockKnownThirdPartyHosts` from `tests/support/helpers/network` (already exists); `addInitScript` for `localStorage` seeding (no new fixtures needed)

### Summary Statistics

| Metric | Value |
|--------|-------|
| TDD Phase | RED |
| Total Tests | 16 |
| API Tests | 11 |
| E2E Tests | 5 |
| All Tests Skipped | ✅ Yes (test.skip()) |
| All Expected to Fail | ✅ Yes |
| Fixtures Created | 0 (existing infrastructure sufficient) |
| Execution Mode | Sequential (API → E2E) |

---

## Step 5: Validation & Completion

### Validation Checklist

- [x] Story 2.2 has clear acceptance criteria — prerequisites satisfied
- [x] `playwright.config.ts` covers both test directories (`tests/api/`, `tests/e2e/`)
- [x] API spec mirrors story 2-1 pattern: `dynamic import`, `task()` builder, `[Pn]` prefix, `test.skip()`
- [x] E2E spec mirrors existing specs: `../support/fixtures` import, `blockKnownThirdPartyHosts`, `addInitScript` for locale seeding
- [x] All tests target `data-testid="earnings-metrics"` (as specified in story Dev Notes)
- [x] E2E tests do NOT verify exact numbers (per story spec)
- [x] No temp artifacts left in `/tmp` — all outputs in `_bmad-output/test-artifacts/`
- [x] No orphaned browser sessions

### Key Risks & Assumptions

1. **`calculateSummaryMetrics` export name** — Tests import via `ec.calculateSummaryMetrics`. If the implementation uses a different export name, tests must be updated.
2. **`data-testid="earnings-metrics"`** — E2E tests require the grid wrapper to carry this attribute. Dev must add it to the JSX (per story Dev Notes).
3. **`SummaryMetrics` type shape** — Assumed from story Dev Notes: 6 fields. If shape changes during implementation, update corresponding assertions.
4. **Date range filter** — API test uses `{ startMs: 1000, endMs: 2000 }` absolute ms values. This relies on `filterTasksForEarnings` being the source of truth (confirmed from story 2.1 implementation).
5. **E2E "filter reactivity" (AC3)** — Not covered in E2E because billable filter UI controls are not yet implemented. Will be covered when filter UI is available (Epic 2 follow-up or integration test during green phase).

### Next Steps (TDD Green Phase)

After implementing story 2.2:

1. **Remove `test.skip()`** from all 16 tests
2. **Run API suite:** `npx playwright test --project=atdd-api tests/api/story-2-2-summary-metrics-atdd.spec.ts`
3. **Run E2E suite:** `npx playwright test --project=chromium tests/e2e/story-2-2-summary-metrics-atdd.spec.ts`
4. Verify all 16 tests **PASS** (green phase)
5. If any test fails: fix the implementation (not the test) unless the test itself has a bug
6. Commit both test files alongside implementation files

### Implementation Guidance

**Functions/types to implement in `src/lib/earnings-calculations.ts`:**
- `export type SummaryMetrics` (6 fields as defined in Dev Notes)
- `export function calculateSummaryMetrics(tasks, clients, dateRangeMs, billableFilter): SummaryMetrics`

**UI to implement in `src/pages/EarningsDashboard.tsx`:**
- Import `calculateSummaryMetrics` and `resolveDateRangeMs`
- `useMemo` computing metrics from `appState.tasks`, `appState.clients`, dashboard filter state
- Responsive grid of 5 `Card` components with `data-testid="earnings-metrics"` on the wrapper
- i18n keys: `earningsTotalRevenue`, `earningsBillableRevenue`, `earningsNonBillableRevenue`, `earningsAvgHourlyRate`, `earningsTaskCount` (add to `LanguageContext.tsx` for both `en` and `pt`)

### Recommended Next Workflow

After green phase is confirmed: run **`bmad-code-review`** skill on the implementation diff, then **`bmad-dev-story`** for story 2.3 (if applicable).
