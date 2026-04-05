---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: "2026-04-05"
workflowType: testarch-atdd
inputDocuments:
  - _bmad-output/implementation-artifacts/2-1-implement-earnings-calculation-utilities.md
  - playwright.config.ts
  - tests/e2e/story-2-1-earnings-calculations-atdd.spec.ts
  - tests/api/story-2-1-earnings-calculations-atdd.spec.ts
  - src/types/index.ts
  - src/lib/earnings-dashboard-storage.ts
generationMode: AI generation (no browser recording)
executionMode: sequential (single agent; no subagent dispatch)
primaryTestLevel: Unit / programmatic acceptance (Playwright runner for ATDD harness)
---

# ATDD Checklist — Epic 2, Story 2.1: Implement earnings calculation utilities

**Date:** 2026-04-05  
**Author:** BMad TEA (ATDD workflow)  
**Primary test level:** Programmatic acceptance — pure `src/lib/earnings-calculations` API (no REST endpoints for this story)

---

## Step 1 — Preflight and context

- **Stack:** `frontend` (Vite + React; Playwright + Vitest).
- **Prerequisites:** Story has explicit AC; `playwright.config.ts` present; dev dependencies installable.
- **Story loaded:** `_bmad-output/implementation-artifacts/2-1-implement-earnings-calculation-utilities.md`
- **Conventions:** Existing E2E live under `tests/e2e/` with shared fixtures from `tests/support/fixtures`. This story’s product code tests remain specified in-story as `src/lib/earnings-calculations.test.ts` (Vitest); ATDD additions use Playwright `test.skip()` per workflow RED rules.

---

## Step 2 — Generation mode

- **Selected:** AI generation (acceptance criteria are explicit; no backend HTTP API; no recording required).

---

## Step 3 — Test strategy

| AC area | Level | Priority | Notes |
|--------|--------|----------|--------|
| Date presets + custom range | Programmatic (`tests/api`) | P0–P1 | `resolveDateRangeFromPreset`, `resolveDateRangeMs` |
| Filter tasks (date + billable) | Programmatic | P0–P1 | `filterTasksForEarnings` |
| FR26 rate + revenue | Programmatic | P0 | `getEffectiveHourlyRate`, `getTaskBillableRevenue` |
| Aggregations by customer / project / tag | Programmatic (`tests/e2e` file for Playwright project `chromium`) | P0–P1 | Pure functions; file colocated with E2E suite |
| Edge cases (empty, non-billable revenue 0) | Programmatic | P0–P1 | Safe arrays, taskCount vs revenue |

**Red phase:** Every scenario uses `test.skip()` so CI stays green until implementation; bodies use **dynamic `import()`** of `src/lib/earnings-calculations` so the spec files load before the module exists.

**Duplicate coverage avoided:** No separate UI/E2E navigation tests — AC10 marks summary cards and charts out of scope.

---

## Story summary

**As a** developer  
**I want** pure utilities to calculate earnings by customer, project (column), and tag with date range and billable filtering  
**So that** Epic 3 charts and Epic 2.2 metrics share accurate, testable revenue data (FR13, FR15–FR18, FR21–FR26, FR50).

---

## Acceptance criteria (testable excerpts)

1. `calculateRevenueByCustomer` → rows with `customerId`, `customerName`, `totalRevenue`, `taskCount`; null id → **Unassigned**.
2. `calculateRevenueByProject` → rows keyed by column with `columnTitle` from `Column.title`.
3. `calculateRevenueByTag` → tag/Untagged, revenue split `taskRevenue / tags.length`, trimmed keys; multi-tag taskCount increments each tag row.
4. `billableFilter === 'billable'` → only `isBillable === true`.
5. `nonBillable` → only `isBillable === false`; revenue 0 but counts preserved.
6. `all` → both flags; non-billable revenue 0.
7. Date range → `startMs <= Task.createdAt <= endMs` inclusive.
8. Edge cases → no throws; empty safe outputs.
9. Revenue matches `getTaskRevenue` semantics (`??` for rate, `timeSpent` only).
10. Out of scope: metric cards, recharts wiring, persistence changes.

---

## Failing tests created (RED phase)

### Programmatic “API” tier (`tests/api`) — 10 tests

**File:** `tests/api/story-2-1-earnings-calculations-atdd.spec.ts`

| Test | Status | Verifies |
|------|--------|----------|
| resolveDateRangeFromPreset last30 | skipped | Finite ordered window |
| resolveDateRangeFromPreset all | skipped | Unbounded / documented semantics |
| resolveDateRangeMs + persisted override | skipped | Custom `dateRange` wins when valid |
| filterTasksForEarnings date inclusive | skipped | AC7 |
| filter billable / nonBillable / all | skipped | AC4–6 |
| getEffectiveHourlyRate | skipped | AC9 nullish `??` |
| getTaskBillableRevenue billable / non | skipped | AC9 FR26 |

### Aggregation tier (`tests/e2e` harness) — 9 tests

**File:** `tests/e2e/story-2-1-earnings-calculations-atdd.spec.ts`

| Test | Status | Verifies |
|------|--------|----------|
| Unassigned customer row | skipped | AC1 |
| Customer sums | skipped | AC1 |
| Project column title | skipped | AC2 |
| Tag split + trim | skipped | AC3 |
| Multi-tag taskCount | skipped | AC3 |
| Untagged bucket | skipped | AC3 |
| nonBillable revenue 0, count 1 | skipped | AC5 |
| Date window on aggregators | skipped | AC7 |
| Empty tasks | skipped | AC8 |

### Component tests

- **N/A** — no new isolated UI components in scope.

---

## Data factories / fixtures

- **Factories:** Inline `task()` helpers in each spec (minimal `Task` shapes). Optional later: extend `tests/support/fixtures/factories/task-factory.ts` for shared builders.
- **Playwright fixtures:** Default `@playwright/test` only; no browser `page` usage in these specs.

---

## Mock requirements

- **None** — pure functions; no HTTP.

---

## Required data-testid attributes

- **None for Story 2.1** (dashboard metrics UI deferred to 2.2 / Epic 3 per AC10).

---

## Implementation checklist (green phase)

1. Add `src/lib/earnings-calculations.ts` with exports matching spec names (`resolveDateRangeFromPreset`, `resolveDateRangeMs`, `filterTasksForEarnings`, `getEffectiveHourlyRate`, `getTaskBillableRevenue`, `calculateRevenueByCustomer`, `calculateRevenueByProject`, `calculateRevenueByTag`).
2. Reuse `BillableFilter` / `DateRangePreset` compatibility from `earnings-dashboard-storage.ts` as in story Dev Notes.
3. Implement date windows with **date-fns**, **local** timezone per story comment.
4. Delegate `AppContext` revenue helpers to this module (story subtask).
5. Add `src/lib/earnings-calculations.test.ts` (Vitest) for fast inner-loop coverage.
6. Remove `test.skip()` from ATDD specs and run Playwright; fix implementation until all pass.
7. Run `npm test` (Vitest) and `npm run test:e2e` for full regression.

---

## Running tests

```bash
# Story 2.1 ATDD only (both Playwright projects)
npx playwright test story-2-1-earnings-calculations-atdd

# API-tier project only
npx playwright test story-2-1-earnings-calculations-atdd --project=atdd-api

# Aggregation file under default E2E project
npx playwright test story-2-1-earnings-calculations-atdd --project=chromium
```

---

## Red — green — refactor

### RED (complete)

- 19 scenarios added, all `test.skip()`, non-placeholder assertions.
- **Verification run:** `npx playwright test story-2-1-earnings-calculations-atdd` → **19 skipped** (module not required at load time).

### GREEN (dev)

- Implement module; unskip ATDD tests; add Vitest unit tests; keep FR26 parity with `AppContext`.

### REFACTOR

- DRY between aggregators; ensure single revenue primitive.

---

## Test execution evidence (RED)

**Command:** `npx playwright test story-2-1-earnings-calculations-atdd --project=atdd-api --project=chromium` (with `CI=true` in verification environment)

**Result:** `19 skipped` — RED phase documented; no passing execution until implementation removes `test.skip()`.

---

## Configuration change

- **`playwright.config.ts`:** Split `testDir` per project — `chromium` → `./tests/e2e`, `atdd-api` → `./tests/api` — so programmatic ATDD files live under `tests/api` while matching Playwright conventions.

---

## Summary statistics

| Metric | Value |
|--------|------|
| Total scenarios | **19** |
| `tests/api` | 10 |
| `tests/e2e` (ATDD aggregation) | 9 |
| TDD phase | RED (all skipped) |
| Fixture files created | 0 (inline helpers only) |

---

## Knowledge base references (workflow)

- Core concepts applied: data-factories (inline builders), test-quality (explicit assertions), component-tdd N/A.
- Playwright harness used for RED `test.skip` contract per `step-04a` / `step-04b` patterns adapted to **library** surface (no REST).

---

**Generated by BMad TEA ATDD workflow** — 2026-04-05
