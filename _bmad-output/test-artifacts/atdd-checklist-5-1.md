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
inputDocuments:
  - _bmad-output/implementation-artifacts/5-1-implement-summary-metrics-cards-and-edge-case-handling.md
  - playwright.config.ts
  - tests/support/fixtures/index.ts
  - tests/support/fixtures/base.ts
  - tests/support/helpers/network.ts
  - tests/e2e/story-4-4-chart-ux-polish-and-test-stability-atdd.spec.ts
---

# ATDD Checklist: Story 5.1 — Summary Metrics Cards and Edge Case Handling

## Step 1: Preflight & Context

### Stack Detection

- **Detected stack:** `frontend`
- **Indicators:** `playwright.config.ts` present, `package.json` with React/Vite dependencies

### Prerequisites

- [x] Story approved with clear acceptance criteria (6 ACs defined)
- [x] Playwright configured (`playwright.config.ts` present)
- [x] Development environment available
- [x] Support fixtures confirmed: `tests/support/fixtures/index.ts`, `helpers/network.ts`

### Story Context Loaded

- **Story:** 5.1 — Implement summary metrics cards and edge case handling
- **Status:** ready-for-dev
- **Acceptance Criteria:** 6 (AC1–AC6)
- **Affected components:**
  - `src/pages/EarningsDashboard.tsx` (conditional render block)
  - `src/context/LanguageContext.tsx` (4 new i18n keys)
- **Test file target:** `tests/e2e/story-5-1-implement-summary-metrics-cards-and-edge-case-handling-atdd.spec.ts`

### Existing Patterns Loaded

- Import: `from "../support/fixtures"` (not `@playwright/test`)
- Network stub: `await blockKnownThirdPartyHosts(page)` before `page.goto()`
- Seeding: `page.addInitScript` with serializable data arg
- Selectors: `data-testid` for all user-visible containers
- Text matching: `{ exact: true }` on `getByText()` (substring collision guard)

---

## Step 2: Generation Mode

- **Mode selected:** AI Generation
- **Rationale:** Acceptance criteria are clear; scenarios are standard conditional render checks;
  no complex drag/drop or multi-step wizard interactions requiring live browser recording.

---

## Step 3: Test Strategy

### Acceptance Criteria → Test Scenarios

| AC | Scenario | Level | Priority | data-testid asserted |
|----|----------|-------|----------|----------------------|
| AC1 | Normal data (2 billable tasks in last30) → all 5 metric card labels visible | E2E | P0 | `earnings-metrics` |
| AC2 | No tasks globally → FR46 empty state visible; metrics grid absent | E2E | P0 | `earnings-empty-no-tasks`, `earnings-metrics` (absent) |
| AC3 | Tasks exist but 60 days old (outside last30) → FR47 message visible; metrics grid absent | E2E | P0 | `earnings-empty-no-period-data`, `earnings-metrics` (absent) |
| AC4 | Billable filter active + all tasks non-billable → FR48 message visible; metrics grid absent | E2E | P0 | `earnings-empty-no-billable-work`, `earnings-metrics` (absent) |
| AC5 | `calculateSummaryMetrics` throws → FR49 error message visible; metrics grid absent | — | — | `earnings-calculation-error` (implicit; no dedicated E2E test — unit-level coverage) |
| AC6 | Zero-revenue task (timeSpent=0, hourlyRate=0) → metric cards render with `$0.00` | E2E | P1 | `earnings-metrics`, `$0.00` |

### Test Level Rationale

- **E2E only** for all testable scenarios: this story is purely about conditional rendering based
  on filtered data and persisted dashboard state; the business logic (`calculateSummaryMetrics`)
  is already unit-tested from Story 2.2.
- **AC5** (error state) requires simulating a thrown exception from `calculateSummaryMetrics`;
  doing so in a real browser environment is fragile. Unit or component test coverage is preferred.
  No E2E test generated for AC5.

### Condition Priority Order (from story — must be reflected in tests)

```
1. metricsError !== null           → FR49 (not E2E tested)
2. appState.tasks.length === 0     → FR46 (AC2)
3. totalTaskCount === 0 AND billableFilter === 'billable' → FR48 (AC4)
4. totalTaskCount === 0            → FR47 (AC3)
5. otherwise                       → show metric cards (AC1, AC6)
```

### Red Phase Confirmation

All tests assert behavior that does NOT yet exist in the codebase:
- `earnings-empty-no-tasks` testid is not yet rendered in `EarningsDashboard.tsx`
- `earnings-empty-no-period-data` testid is not yet rendered
- `earnings-empty-no-billable-work` testid is not yet rendered
- The conditional logic replacing the always-on metrics grid does not yet exist

AC1 and AC6 may pass against the current codebase (metrics grid already renders always).
AC2, AC3, AC4 will **fail** — these are the primary red-phase tests.

**Project override (D1 action item from Epic 4 retro):** `test.skip()` is NOT used.
Tests assert expected behavior and will fail naturally against the pre-implementation codebase.
This override is intentional and documented in the story's Dev Notes.

---

## Step 4: Test Generation

### Execution Mode

- **Resolved mode:** sequential (single agent, no subagent dispatch)
- **Worker A (API tests):** N/A — this is a pure frontend story; no API endpoints to test
- **Worker B (E2E tests):** Generated directly (sequential mode)

### E2E Tests Generated

**File:** `tests/e2e/story-5-1-implement-summary-metrics-cards-and-edge-case-handling-atdd.spec.ts`

#### Seed Factories

| Factory | Purpose | AC |
|---------|---------|-----|
| `buildNormalSeed()` | 2 billable tasks within last30 | AC1 |
| `buildEmptySeed()` | No tasks at all | AC2 |
| `buildOutOfRangeSeed()` | 1 task at 60 days old | AC3 |
| `buildNonBillableSeed()` | 1 non-billable task within last30 | AC4 |
| `buildZeroRevenueSeed()` | 1 billable task with timeSpent=0, hourlyRate=0 | AC6 |
| `buildDashboardStateBillable()` | Complete `EarningsDashboardPersistedState` with `billableFilter: "billable"` | AC4 |

#### Test Cases

| Test ID | Priority | AC | Assertion |
|---------|----------|-----|-----------|
| `[P0] normal data renders all 5 metric cards (AC1)` | P0 | AC1 | `earnings-metrics` visible; all 5 card label texts present with `{ exact: true }` |
| `[P0] no tasks shows empty-no-tasks message (AC2 / FR46)` | P0 | AC2 | `earnings-empty-no-tasks` visible; `earnings-metrics` not visible |
| `[P0] tasks outside date range shows no-period-data message (AC3 / FR47)` | P0 | AC3 | `earnings-empty-no-period-data` visible; `earnings-metrics` not visible |
| `[P0] billable filter with no billable tasks shows no-billable-work message (AC4 / FR48)` | P0 | AC4 | `earnings-empty-no-billable-work` visible; `earnings-metrics` not visible |
| `[P1] zero-revenue edge case renders metric cards correctly (AC6 / FR50)` | P1 | AC6 | `earnings-metrics` visible; `$0.00` text visible |

**Total E2E test scenarios: 5**

#### Key Implementation Decisions

- **FR48 seed uses two separate `addInitScript` calls** — Playwright's `addInitScript` accepts
  one serializable argument per call. Seeding both `freelancer-kanban-data` and
  `earnings-dashboard-state` requires two calls. (Correction from Dev Agent Record.)
- **`{ exact: true }` on all `getByText()` calls** — "Billable Revenue" is a substring of
  "Non-Billable Revenue"; without `exact: true` both would match.
- **No `beforeEach` hook** — each test seeds its own unique localStorage state. Shared
  `beforeEach` would require all tests to use the same seed, preventing per-AC isolation.

---

## Step 4C: Aggregation

### TDD Compliance Check

| Criterion | Status |
|-----------|--------|
| Tests assert expected (not implemented) behavior | ✅ AC2, AC3, AC4 testids don't exist yet |
| No placeholder assertions (`expect(true).toBe(true)`) | ✅ All assertions are meaningful |
| Project D1 override: no `test.skip()` required | ✅ Respected — tests designed to fail naturally |

### Files Written

| File | Status |
|------|--------|
| `tests/e2e/story-5-1-implement-summary-metrics-cards-and-edge-case-handling-atdd.spec.ts` | ✅ Created |

### Fixture Infrastructure

No new fixture files needed. The test uses:
- Existing `tests/support/fixtures/index.ts` (via `test` import)
- Existing `tests/support/helpers/network.ts` (via `blockKnownThirdPartyHosts`)
- Inline seed factories defined at module level in the spec file

---

## Step 5: Validation & Completion

### Validation Checklist

- [x] Story has clear acceptance criteria (6 ACs)
- [x] Test framework configured (Playwright)
- [x] Test file created at correct path under `tests/e2e/`
- [x] All 5 test scenarios generated (AC1–AC4, AC6)
- [x] Tests import from `../support/fixtures` (not `@playwright/test`)
- [x] `blockKnownThirdPartyHosts(page)` called before `page.goto()` in every test
- [x] All seeds use `addInitScript` (not `page.evaluate`)
- [x] `{ exact: true }` applied to all `getByText()` calls
- [x] FR48 test uses two separate `addInitScript` calls
- [x] `buildDashboardStateBillable()` returns complete 4-field state object
- [x] No hardcoded message strings — tests use `data-testid` selectors
- [x] No `test.skip()` or RED PHASE comment (D1 action item honoured)
- [x] ATDD checklist saved to `_bmad-output/test-artifacts/atdd-checklist-5-1.md`
- [x] No temp artifacts in random locations

### Coverage Summary

| Functional Requirement | AC | Test Scenario | Covered |
|-----------------------|-----|---------------|---------|
| FR21: Total revenue display | AC1 | `[P0] normal data renders all 5 metric cards` | ✅ |
| FR22: Billable revenue display | AC1 | `[P0] normal data renders all 5 metric cards` | ✅ |
| FR23: Non-billable revenue display | AC1 | `[P0] normal data renders all 5 metric cards` | ✅ |
| FR24: Average hourly rate | AC1 | `[P0] normal data renders all 5 metric cards` | ✅ |
| FR25: Task count | AC1 | `[P0] normal data renders all 5 metric cards` | ✅ |
| FR46: Empty state — no tasks | AC2 | `[P0] no tasks shows empty-no-tasks message` | ✅ |
| FR47: No data for period | AC3 | `[P0] tasks outside date range shows no-period-data message` | ✅ |
| FR48: No billable work | AC4 | `[P0] billable filter with no billable tasks shows no-billable-work message` | ✅ |
| FR49: Error recovery | AC5 | No E2E test (unit/component level preferred) | ⚠️ Not E2E |
| FR50: Edge case data functional | AC6 | `[P1] zero-revenue edge case renders metric cards correctly` | ✅ |

### Key Risks & Assumptions

- **AC1 may pass before implementation** — the metrics grid currently renders unconditionally
  (Story 2.2 output). This is expected; AC1 validates existing behaviour is preserved.
- **AC5 (FR49) has no E2E coverage** — simulating a thrown exception from `calculateSummaryMetrics`
  in a real browser is impractical. Unit test coverage is the correct level.
- **Seed timing** — `Date.now()` is called at module-load time (outside `test.describe`). This is
  safe because test files are loaded immediately before each test run.
- **Default date preset** — tests assume `last30` is the default preset. If this changes,
  the out-of-range seed (AC3) may need updating.

### Next Steps (TDD Green Phase)

After implementing Story 5.1:

1. Run the full E2E suite:
   ```
   npx playwright test tests/e2e/story-5-1-implement-summary-metrics-cards-and-edge-case-handling-atdd.spec.ts --workers=1
   ```
2. Verify all 5 tests **PASS** (green phase confirmed)
3. If any tests fail:
   - Either fix the implementation (feature bug)
   - Or fix the test (test bug — document in Dev Agent Record)
4. Run the full regression suite to confirm no regressions:
   ```
   npx playwright test --workers=1
   ```
5. Commit all changed files in a single commit: `"Implemented story 5.1"`

### Recommended Next Workflow

→ **`bmad-dev-story`** — implement story 5.1 using this ATDD spec as the acceptance gate.
