---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-04-06'
story_id: '4-3'
tdd_phase: 'RED'
inputDocuments:
  - '_bmad-output/implementation-artifacts/4-3-ensure-filter-responsiveness-and-keyboard-accessibility.md'
  - 'playwright.config.ts'
  - 'tests/e2e/story-4-2-implement-billable-non-billable-toggle-atdd.spec.ts'
  - 'tests/e2e/story-4-1-implement-date-range-filter-and-presets-atdd.spec.ts'
  - 'tests/support/fixtures/index.ts'
  - 'tests/support/helpers/network.ts'
  - '_bmad-output/test-artifacts/atdd-checklist-4-2.md'
---

# ATDD Checklist: Story 4.3 — Ensure Filter Responsiveness and Keyboard Accessibility

**TDD Phase:** 🔴 RED — All tests skipped (failing before implementation)  
**Story:** `_bmad-output/implementation-artifacts/4-3-ensure-filter-responsiveness-and-keyboard-accessibility.md`  
**Generated:** 2026-04-06

---

## Step 1: Preflight & Context

### Stack Detection

- **`detected_stack`:** `frontend` (React + Vite detected via `package.json`, `vite.config.ts`, `playwright.config.ts`)
- **Test framework:** Playwright (E2E: `tests/e2e/`, API: `tests/api/`) + Vitest (unit: `src/**/*.test.tsx`)

### Config Values

| Key | Value |
|-----|-------|
| `test_stack_type` | `auto` → resolved `frontend` |
| `tea_use_playwright_utils` | `true` |
| `tea_use_pactjs_utils` | `false` |
| `tea_pact_mcp` | `none` |
| `tea_browser_automation` | `auto` |
| `tea_execution_mode` | `auto` → resolved `sequential` |
| `tea_capability_probe` | `true` |
| `test_artifacts` | `{project-root}/_bmad-output/test-artifacts` |

### Prerequisites Check

- [x] Story has clear acceptance criteria (5 ACs covering FR33, FR35, NFR-A2, NFR-A7, NFR-P2)
- [x] `playwright.config.ts` exists — Playwright E2E and API test projects configured
- [x] `tests/support/fixtures/index.ts` and `tests/support/helpers/network.ts` exist (required imports)
- [x] Existing E2E patterns available (stories 3.1–4.2) for convention reference
- [x] C3 spike (keyboard accessibility E2E patterns) resolved in story dev notes — `.focus()` over Tab-counting, `toBeFocused()` over CSS class inspection, `page.getByRole('grid')` for calendar
- [x] `data-testid` values for all interactive elements exist (from Stories 4.1 and 4.2 — must not change)
- [x] Dev environment: node_modules present; current test baseline 188 Vitest + 113 Playwright

### Story Summary

**Story 4.3** hardens the accessibility contract of the two filter components created in Stories 4.1 and 4.2:

- **`BillableToggle.tsx`:** Add `aria-pressed`, `type="button"`, `role="group"`, `aria-label`
- **`DateRangeFilter.tsx`:** Add `aria-pressed` to preset buttons, `type="button"`, `role="group"`, `aria-label` on preset wrapper; `type="button"` + `aria-label` on PopoverTrigger Button
- **No new filter logic, i18n keys, context actions, or localStorage schema changes**
- Tests cover keyboard navigation (Tab/Enter/Space/Escape), `aria-pressed` state reflection, and 500ms timing

### Acceptance Criteria (Extracted)

| # | AC | Requirements |
|---|-----|-------------|
| AC1 | Filter change applies within 500ms | NFR-P2 |
| AC2 | Tab to filter control → focus with visible indicator | FR35, NFR-A2 |
| AC3 | Focus on date preset → Enter/Space selects preset and applies filter | FR33 |
| AC4 | Focus on toggle button → Enter/Space selects option; aria-pressed reflects state | FR33 |
| AC5 | Keyboard-only can complete all filtering tasks | NFR-A7 |

### Knowledge Fragments Used

- `selector-resilience.md` — `.focus()` + `toBeFocused()` pattern; `getByRole('grid')` for calendar
- `timing-debugging.md` — NFR-P2 timing, post-goto `Date.now()` mandatory rule
- `data-factories.md` — `buildStandardSeed` factory with billable + non-billable tasks inside last30
- `component-tdd.md` — component-level TDD red-phase approach; `aria-pressed` assertion patterns
- `test-quality.md` — red-phase `test.skip()` requirement
- `test-healing-patterns.md` — `retries: 1` for timing-sensitive tests; C3 spike `.focus()` resolution

---

## Step 2: Generation Mode

**Mode:** AI Generation  
**Rationale:** Story dev notes contain the complete resolved keyboard accessibility patterns (C3 spike resolution). All `data-testid` values exist in the DOM. The feature under test (ARIA attribute additions) is not yet implemented, so browser recording is not useful.  
**Browser automation config (`tea_browser_automation: auto`):** Skipped recording — ARIA attributes not yet in DOM.

---

## Step 3: Test Strategy

### Acceptance Criteria → Test Scenario Mapping

| AC | Scenario | Level | Priority | File |
|----|----------|-------|----------|------|
| AC2 + AC3 | Date preset: `.focus()` focuses, Tab moves to sibling, Enter activates and persists to localStorage | E2E | P0 | `tests/e2e/story-4-3-...atdd.spec.ts` |
| AC3 | Date preset: Space activates preset and persists to localStorage | E2E | P0 | `tests/e2e/story-4-3-...atdd.spec.ts` |
| AC2 + AC4 | Billable toggle: `.focus()` focuses, Tab moves to sibling, Enter activates and persists | E2E | P0 | `tests/e2e/story-4-3-...atdd.spec.ts` |
| AC4 | Billable toggle: Space activates and persists to localStorage | E2E | P0 | `tests/e2e/story-4-3-...atdd.spec.ts` |
| AC2 | Calendar trigger: `.focus()` focuses, Enter opens popover (role="grid"), Escape closes | E2E | P0 | `tests/e2e/story-4-3-...atdd.spec.ts` |
| AC4 | `aria-pressed` reflects active billable filter state reactively (default + after click) | E2E | P0 | `tests/e2e/story-4-3-...atdd.spec.ts` |
| AC3 | `aria-pressed` reflects active date preset state reactively (default + after click) | E2E | P0 | `tests/e2e/story-4-3-...atdd.spec.ts` |
| AC5 | Keyboard-only: set both date preset and billable filter without any mouse action | E2E | P0 | `tests/e2e/story-4-3-...atdd.spec.ts` |
| AC1 + NFR-P2 | Keyboard date preset Enter → chart visible within 500ms | E2E | P1 | `tests/e2e/story-4-3-...atdd.spec.ts` |
| AC1 + NFR-P2 | Keyboard billable toggle Enter → chart visible within 500ms | E2E | P1 | `tests/e2e/story-4-3-...atdd.spec.ts` |

### Test Level Rationale

- **E2E only (P0+P1):** 10 scenarios — all tests require a real browser to verify keyboard focus behaviour, ARIA attribute values in the DOM, and timing. No API-layer storage tests needed (Story 4.3 adds no new storage contract — reuses existing `earnings-dashboard-state` fields). Unit tests for ARIA rendering would be valuable but fall within Story 4.3 component task scope (Vitest), not ATDD scope.

### Red Phase Requirements

All tests designed to FAIL before implementation:

- `aria-pressed` assertions (`toHaveAttribute('aria-pressed', 'true'/'false')`) will fail because the attribute is not yet present in `BillableToggle.tsx` or `DateRangeFilter.tsx`
- `role="group"` and `aria-label` checks are not directly asserted in E2E tests (they are implicit — the ARIA contract is tested via `aria-pressed` which requires the full implementation), so focus and activation tests could partially pass, but are wrapped in `test.skip()` to document red-phase intent and prevent premature CI green
- All tests wrapped in `test.skip()` — red-phase intent documented

### Conventions Applied (from project-context.md and C3 spike)

- Import from `../support/fixtures` (not `@playwright/test`)
- Call `blockKnownThirdPartyHosts(page)` in `beforeEach` (before each test's `page.goto()`)
- Seed `app-language='en'` and `freelancer-kanban-data` via `addInitScript` in `beforeEach`
- Use `data-testid` selectors (all testids stable from Stories 4.1/4.2 — must not change)
- Use `.focus()` + `toBeFocused()` — not global Tab-counting (C3 spike resolved pattern)
- Capture `Date.now()` **after** `page.goto()` in timing tests (mandatory E2E timing rule)
- Apply `test.describe.configure({ retries: 1 })` for timing-sensitive tests
- Use `page.getByRole('grid')` for calendar popover visibility (react-day-picker renders as role="grid")
- `aria-pressed` is asserted as string `"true"` / `"false"` (HTML attribute form)
- Do NOT inspect CSS classes for focus ring — use `toBeFocused()` only

---

## Step 4: Test Generation

### Worker A — E2E Tests (Sequential, AI Generation)

**Status:** ✅ Complete  
**Output file:** `tests/e2e/story-4-3-ensure-filter-responsiveness-and-keyboard-accessibility-atdd.spec.ts`  
**Tests:** 10 (all `test.skip()`)  
**TDD Phase:** RED

### TDD Red Phase Validation

- [x] All tests use `test.skip()` ← documented intentional failing
- [x] No placeholder assertions (`expect(true).toBe(true)`) — all assertions target expected ARIA + keyboard behaviour
- [x] All tests marked with inline RED-phase comments explaining why they fail
- [x] Resilient selectors used (`getByTestId` with `data-testid` values specified in story; `getByRole('grid')` for calendar)
- [x] `.focus()` + `toBeFocused()` pattern used — not global Tab-counting (C3 spike resolution)
- [x] `aria-pressed` asserted as string `"true"` / `"false"` (HTML attribute form — matches React boolean-to-string rendering)
- [x] `Date.now()` captured after `page.goto()` in timing tests (mandatory timing rule)
- [x] `test.describe.configure({ retries: 1 })` applied for timing-sensitive tests
- [x] Both tasks seeded: one `isBillable: true`, one `isBillable: false` — both within last30 window
- [x] `blockKnownThirdPartyHosts(page)` called in `beforeEach` (before each test's `page.goto()`)
- [x] No keyboard navigation tests for calendar internal navigation (react-day-picker handles natively — not in ATDD scope)
- [x] No linter errors in generated test file (double quotes, semicolons, trailing commas consistent with project style)

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total tests generated | 10 |
| E2E tests (RED) | 10 |
| API/unit tests (RED) | 0 |
| P0 tests | 8 |
| P1 tests | 2 |
| All tests skipped | ✅ yes |
| Expected to fail | ✅ yes |
| Execution mode | SEQUENTIAL (AI generation) |

---

## Acceptance Criteria Coverage

| AC | E2E Scenarios | Status |
|----|--------------|--------|
| AC1 — 500ms filter response (NFR-P2) | 2 scenarios (date preset + billable toggle, both keyboard-activated) | ✅ Covered |
| AC2 — Tab to control → focus with visible indicator (FR35) | 3 scenarios (preset focus+Tab, toggle focus+Tab, calendar trigger focus) | ✅ Covered |
| AC3 — Date preset: Enter/Space → selected + applied (FR33) | 3 scenarios (Enter + Tab chain, Space, aria-pressed state) | ✅ Covered |
| AC4 — Toggle: Enter/Space → selected; aria-pressed reflects state (FR33) | 3 scenarios (Enter + Tab chain, Space, aria-pressed state) | ✅ Covered |
| AC5 — Keyboard-only completes all filtering tasks (NFR-A7) | 1 scenario (keyboard-only: set date preset + billable filter) | ✅ Covered |

All 5 acceptance criteria covered. NFR-P2 covered by 2 dedicated timing scenarios.

---

## Generated Test Files

| File | Type | Tests | Phase |
|------|------|-------|-------|
| `tests/e2e/story-4-3-ensure-filter-responsiveness-and-keyboard-accessibility-atdd.spec.ts` | E2E | 10 | 🔴 RED |

---

## Next Steps (TDD Green Phase)

After implementing Story 4.3 (ARIA attribute changes to `BillableToggle.tsx` and `DateRangeFilter.tsx`):

1. Remove `test.skip()` from all 10 tests in `tests/e2e/story-4-3-ensure-filter-responsiveness-and-keyboard-accessibility-atdd.spec.ts`
2. Update comment block header: change `TDD Phase: RED` → `TDD Phase: GREEN`
3. Run: `npx playwright test tests/e2e/story-4-3-*` — verify all 10 ATDD tests pass
4. Run: `npx playwright test` — verify no regressions (baseline: 113 Playwright tests)
5. Run: `npx vitest run` — verify no regressions (baseline: 188 Vitest tests)
6. Commit: `"Implemented story 4.3"`

## Implementation Guidance

**`src/components/BillableToggle.tsx` changes:**

- Add `role="group"` + `aria-label={t.earningsBillableFilterLabel}` to `<div data-testid="billable-toggle">`
- Add `type="button"` + `aria-pressed={state.billableFilter === filter}` to each `Button`
- Preserve all existing `data-testid`, `variant`, `size`, `onClick` attributes

**`src/components/DateRangeFilter.tsx` changes:**

- Add `role="group"` + `aria-label={t.earningsDateRangeLabel}` to `<div data-testid="date-range-presets">`
- Add `type="button"` + `aria-pressed={isPresetActive(preset)}` to each preset `Button`
- Add `type="button"` + `aria-label={t.earningsPickDateRange}` to the `PopoverTrigger` `Button`
- Do NOT add `aria-expanded` to PopoverTrigger — Radix manages this automatically
- Preserve all existing `data-testid`, `variant`, `size`, `onClick` attributes

**No other files require changes** — no new context actions, i18n keys, or localStorage schema changes.

**CLI sessions:** N/A — AI generation mode used (no browser recording sessions to close)  
**Temp artifacts:** All artifacts saved to `_bmad-output/test-artifacts/` per config

---

## Validation Checklist (Step 5)

- [x] Prerequisites satisfied (playwright.config.ts, support fixtures, story ACs present, C3 spike resolved)
- [x] Test file created at correct path (`tests/e2e/story-4-3-...atdd.spec.ts`)
- [x] Checklist covers all 5 acceptance criteria (AC1–AC5)
- [x] Tests designed to fail before implementation (`test.skip()` on all 10 tests)
- [x] No orphaned browser sessions (AI generation mode — no CLI sessions opened)
- [x] All artifacts stored in `_bmad-output/test-artifacts/` (not random /tmp locations)
- [x] No duplication in checklist sections
- [x] Terminology consistent throughout
- [x] All sections populated
- [x] Markdown formatting clean
- [x] Seed uses both billable and non-billable tasks within last30 date window
- [x] `.focus()` + `toBeFocused()` pattern applied (C3 spike resolved — not global Tab-counting)
- [x] `aria-pressed` asserted as string `"true"` / `"false"` (HTML attribute form)
- [x] `Date.now()` captured after `page.goto()` in timing tests
- [x] `test.describe.configure({ retries: 1 })` applied for timing-sensitive scenarios
- [x] `blockKnownThirdPartyHosts(page)` called in `beforeEach` before `page.goto()`
- [x] No linter errors on generated test file

**Recommended next workflow:** `bmad-dev-story` — implement story 4.3 ARIA attribute changes, then remove `test.skip()` to verify green phase.
