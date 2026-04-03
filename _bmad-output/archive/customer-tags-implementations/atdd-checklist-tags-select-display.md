---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: '2026-04-03'
story_id: tags-select-display
tdd_phase: RED
---

# ATDD Checklist: Tags — Select and Display on Task Cards

## Step 1 — Preflight & Context

| Item | Result |
|------|--------|
| Detected stack | `frontend` |
| Framework config | `playwright.config.ts` ✅ |
| Story status | Draft with approved intent & clear ACs ✅ |
| Test directory | `tests/e2e/` |
| Existing pattern | `../support/fixtures` + `../support/helpers/network` |
| Generation mode | AI Generation (no browser recording needed) |
| Execution mode | Sequential (single agent) |

**Input documents loaded:**
- `_bmad-output/implementation-artifacts/spec-wip.md`
- `playwright.config.ts`
- `tests/e2e/add-client-inline.spec.ts` (pattern reference)
- `tests/support/fixtures/base.ts`
- `tests/support/helpers/network.ts`
- `_bmad-output/project-context.md`

---

## Step 3 — Test Strategy

### Acceptance Criteria → Test Scenarios

| AC | Scenario | Level | Priority | Test ID |
|----|----------|-------|----------|---------|
| AC1 | Typing a tag + Enter adds chip in `AddTaskDialog` | E2E | P0 | `[P0] adds chip on Enter in AddTaskDialog` |
| AC2 | Clicking ✕ on chip in `AddTaskDialog` removes it | E2E | P0 | `[P0] removes chip on ✕ click in AddTaskDialog` |
| AC3 | Task created with `['design','ui']` → chips on `TaskCard` | E2E | P0 | `[P0] chips for all tags are visible on the TaskCard after creation` |
| AC4 | Task with no tags → no chip row on card | E2E | P1 | `[P1] no chip row appears on TaskCard when task has no tags` |
| AC5 | `TaskDetailPanel` add/remove → `UPDATE_TASK` dispatched, card updates | E2E | P0 | `[P0] TaskDetailPanel tag add/remove updates the TaskCard` |
| Edge1 | Comma-separated entry → multiple trimmed chips | E2E | P1 | `[P1] comma-separated entry creates multiple trimmed chips` |
| Edge2 | Duplicate tag → silently ignored | E2E | P2 | `[P2] duplicate tag entry is ignored` |
| Edge3 | Long tag (>20 chars) → chip truncates with ellipsis | E2E | P2 | `[P2] tag longer than 20 chars is truncated with ellipsis on the chip` |
| Edge4 | Portuguese locale → translated tag input labels | E2E | P3 | `[P3] Portuguese locale renders translated tag labels` |

### No API tests generated
This feature has no REST API — state is managed via React Context (`AppState`) and persisted to `localStorage`. The `UPDATE_TASK` dispatch is a synchronous in-memory reducer action verified through UI state assertions.

---

## Step 4 — TDD Red Phase: Test Generation

### TDD Compliance ✅

| Check | Result |
|-------|--------|
| All tests use `test.skip()` | ✅ |
| All tests assert EXPECTED behavior (not placeholders) | ✅ |
| All tests marked `expected_to_fail: true` | ✅ |
| No passing tests generated | ✅ |

### Generated Files

| File | Tests | TDD Phase |
|------|-------|-----------|
| `tests/e2e/tags-select-display.spec.ts` | 9 | 🔴 RED |

### Test Count by Priority

| Priority | Count |
|----------|-------|
| P0 | 4 |
| P1 | 2 |
| P2 | 2 |
| P3 | 1 |
| **Total** | **9** |

### Acceptance Criteria Coverage

- [x] AC1 — chip added on Enter in `AddTaskDialog`
- [x] AC2 — chip removed on ✕ click in `AddTaskDialog`
- [x] AC3 — chips visible on `TaskCard` after creation
- [x] AC4 — no chip row when task has no tags
- [x] AC5 — `TaskDetailPanel` add/remove updates card
- [x] Edge: comma-separated entry splits into chips
- [x] Edge: duplicate tag ignored
- [x] Edge: long tag truncated
- [x] Edge: Portuguese locale labels

### Fixture Needs Identified

| Fixture | Status |
|---------|--------|
| `blockKnownThirdPartyHosts` | Already exists in `tests/support/helpers/network.ts` |
| Custom `test` with `taskFactory` | Already exists in `tests/support/fixtures/base.ts` |
| No new fixtures required | — |

---

## Step 5 — Validation

### Checklist

- [x] Prerequisites satisfied (Playwright config, clear ACs)
- [x] All tests wrapped in `test.skip()` (TDD red phase)
- [x] Tests assert expected behavior, not placeholders
- [x] Selectors use resilient Playwright APIs: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`
- [x] `data-testid="tag-chip-row"` introduced as assumed testid (implementer must add)
- [x] No orphaned browser sessions (AI generation mode, no CLI recording)
- [x] Checklist saved to `_bmad-output/test-artifacts/`
- [x] No linter errors on generated file

### Assumptions & Risks

| Item | Detail |
|------|--------|
| `getByPlaceholder(/press enter or comma to add/i)` | Assumes `pressEnterToAddTag` key translates to this phrase in EN; implementer must match |
| `getByTestId("tag-chip-row")` | Assumes implementer adds `data-testid="tag-chip-row"` to the chip container in `TaskCard`; otherwise AC4 selector needs adjustment |
| PT placeholder text `/enter ou vírgula para adicionar/i` | Assumed PT translation for Edge4; implementer should verify against actual PT value in `LanguageContext.tsx` |
| Remove button selector `/remove {tag}\|×\|✕/i` | Assumes an accessible name is set on the ✕ button; implementer should use `aria-label={remove ${tag}}` |

---

## Next Steps — TDD Green Phase

After implementing the feature per `spec-wip.md`:

1. Remove all `test.skip()` calls from `tests/e2e/tags-select-display.spec.ts`
2. Run: `npx playwright test tests/e2e/tags-select-display.spec.ts`
3. Verify all 9 tests **PASS** (green phase)
4. If any fail: fix the implementation (or adjust the selector assumption noted above)
5. Run `npm run lint && npm run build` — expected: clean
6. Commit passing tests

**Recommended next workflow:** `bmad-quick-dev` → implement the feature → `bmad-testarch-atdd [V]` to validate.
