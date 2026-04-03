---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: "2026-04-03"
storyId: "1-3-implement-earnings-dashboard-state-persistence"
inputDocuments:
  - _bmad-output/implementation-artifacts/1-3-implement-earnings-dashboard-state-persistence.md
  - src/lib/storage.ts
  - tests/e2e/earnings-dashboard-route.spec.ts
  - vitest.config.ts
  - playwright.config.ts
mode: Create
detected_stack: frontend
generation_mode: AI generation (no recording; acceptance criteria clear)
execution_mode: sequential (single agent; no subagent JSON outputs)
tdd_phase: RED
---

# ATDD Checklist: Story 1.3 — Earnings dashboard state persistence

## Step 1 — Preflight and context

- **Stack:** Frontend (Vite + React + TypeScript, Vitest jsdom, Playwright).
- **Prerequisites:** Story has explicit AC; `playwright.config` + `vitest.config` present; dev environment assumed available.
- **Story summary:** Persist date range, billable filter, and active chart view under localStorage key **`earnings-dashboard-state`**; restore on return/reload; `clearState()` must also clear this key; interim dashboard controls + i18n expected.

## Step 2 — Generation mode

- **Chosen:** AI generation (standard CRUD-style persistence + navigation; no live recording).

## Step 3 — Test strategy

| AC | Scenario | Level | Priority | Red-phase shape |
|----|----------|-------|----------|-----------------|
| 1 | Changing date range + billable filters writes JSON to `earnings-dashboard-state` | E2E | P0 | `test.skip` |
| 2 | Navigate to `/`, return to `/earnings` — UI reflects saved filters | E2E | P0 | `test.skip` |
| 3 | Full reload on `/earnings` — filters restored | E2E | P1 | `test.skip` |
| 4 | `clearState()` removes `earnings-dashboard-state` (aligned with Kanban clear) | Unit (Vitest) | P0 | **failing** until implementation |
| 5 | Persisted document includes `activeChart` (`customer` \| `project` \| `tag`) in same key | E2E | P1 | `test.skip` |

- **Negative / edge:** Corrupt JSON and load/save unit coverage are deferred to the green phase when `src/lib/earnings-dashboard-storage.ts` exists (avoid importing a non-existent module during RED).

## Step 4 — Generated artifacts

- **Vitest:** `src/lib/storage.story-1-3-clear-state.test.ts` — one **unskipped** test expected to **fail** until `clearState()` clears the earnings key.
- **Playwright:** `tests/e2e/earnings-dashboard-persistence.spec.ts` — five **`test.skip`** journeys (UI + provider not implemented).

## Step 4C — TDD compliance note

BMAD aggregation normally expects `test.skip` on **all** RED tests. This run follows the user instruction **failing *or* skipped**: one **failing** unit test documents AC4; E2E remains skipped so CI Playwright does not timeout on missing controls.

## Step 5 — Validation

- [x] Prerequisites satisfied
- [x] Test files created on disk under `tests/` (E2E) and `src/` (Vitest include pattern)
- [x] Checklist aligns with acceptance criteria
- [x] RED phase verified by running Vitest (expect 1 failed) and Playwright for the new spec (expect skipped only)
- [x] Artifacts under `_bmad-output/test-artifacts/`

## Scenario count

- **Total test cases:** 6 (1 Vitest + 5 Playwright)
- **Skipped:** 5 (Playwright)
- **Failing until implementation:** 1 (Vitest — `clearState` + `earnings-dashboard-state`)

## Green phase — next steps

1. Implement `earnings-dashboard-state` load/save, provider, interim controls, and extend `clearState()` per story.
2. Remove `test.skip()` from `tests/e2e/earnings-dashboard-persistence.spec.ts` and align labels/selectors with real i18n strings.
3. Re-run `npm test` and `npm run test:e2e` until green.
4. Optional: add Vitest tests for `earnings-dashboard-storage` (corrupt JSON, round-trip) colocated with the new module.

## Risks / assumptions

- E2E selectors assume accessible **English** labels matching `/date range/i` and `/billable/i`; implementation must expose comboboxes (or equivalent) with those accessible names **or** add stable `data-testid`s and update the spec.
- No in-app “clear data” UI was found; AC4 is asserted at **`clearState()`** unit level per story hint (`src/lib/storage.ts`).
