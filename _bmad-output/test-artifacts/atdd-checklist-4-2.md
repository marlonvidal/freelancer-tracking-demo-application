---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-04-06'
story_id: '4-2'
tdd_phase: 'RED'
inputDocuments:
  - '_bmad-output/implementation-artifacts/4-2-implement-billable-non-billable-toggle.md'
  - 'playwright.config.ts'
  - 'tests/e2e/story-4-1-implement-date-range-filter-and-presets-atdd.spec.ts'
  - 'tests/api/story-4-1-earnings-context-atdd.spec.ts'
  - 'tests/support/fixtures/index.ts'
  - 'tests/support/helpers/network.ts'
  - 'src/lib/earnings-dashboard-storage.ts'
  - '_bmad-output/test-artifacts/atdd-checklist-4-1.md'
---

# ATDD Checklist: Story 4.2 — Implement Billable/Non-Billable Toggle

**TDD Phase:** 🔴 RED — All tests skipped (failing before implementation)  
**Story:** `_bmad-output/implementation-artifacts/4-2-implement-billable-non-billable-toggle.md`  
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
| `tea_execution_mode` | `auto` → resolved `sequential` (no subagent capability in this run) |
| `tea_capability_probe` | `true` |
| `test_artifacts` | `{project-root}/_bmad-output/test-artifacts` |

### Prerequisites Check

- [x] Story has clear acceptance criteria (6 ACs covering FR15, FR16, FR17, FR18, FR19, FR20, FR41, NFR-P2)
- [x] `playwright.config.ts` exists — Playwright E2E and API test projects configured
- [x] `tests/support/fixtures/index.ts` and `tests/support/helpers/network.ts` exist (required imports)
- [x] Existing E2E patterns available (stories 3.1–4.1) for convention reference
- [x] `src/lib/earnings-dashboard-storage.ts` exports `loadEarningsDashboardState`, `saveEarningsDashboardState`, `EARNINGS_DASHBOARD_STORAGE_KEY`
- [x] Dev environment: node_modules present, devServer available via `npm run dev`

### Story Summary

**Story 4.2** replaces the interim billable filter `<Select>` in `EarningsDashboard.tsx` with a proper `BillableToggle` component featuring:
- Three toggle buttons: "All" (`all`), "Billable" (`billable`), "Non-billable" (`nonBillable`)
- Active button uses `variant="default"`; inactive uses `variant="outline"`, `size="sm"`
- `data-testid="billable-toggle"` on wrapper div; `data-testid="billable-toggle-{filter}"` on each button
- Calls `setBillableFilter(filter)` — already implemented in `EarningsDashboardStateContext.tsx`
- Persistence is automatic (`setBillableFilter` already writes to localStorage)
- No new i18n keys, no new context actions, no new localStorage schema changes needed

### Acceptance Criteria (Extracted)

| # | AC | Requirements |
|---|-----|-------------|
| AC1 | Three toggle buttons (All, Billable, Non-billable) visible on dashboard | FR15, FR16, FR17 |
| AC2 | "Billable" click → billable-only tasks in all calculations and charts | FR15, FR18 |
| AC3 | "Non-billable" click → non-billable-only tasks in all calculations and charts | FR16 |
| AC4 | "All" click → all tasks included | FR17 |
| AC5 | Billable filter setting persists across navigation | FR19, FR41 |
| AC6 | Separate billable/non-billable metrics visible (already satisfied by existing cards) | FR20 |

### Knowledge Fragments Used

- `selector-resilience.md` — resilient locator strategies (`getByTestId`, `getByRole`)
- `timing-debugging.md` — NFR-P2 timing test patterns, post-goto `Date.now()` rule
- `data-factories.md` — seed factory patterns (inlined as `buildStandardSeed`)
- `component-tdd.md` — component-level TDD red-phase approach
- `test-quality.md` — red-phase `test.skip()` requirement
- `test-healing-patterns.md` — `retries: 1` for timing-sensitive tests

---

## Step 2: Generation Mode

**Mode:** AI Generation  
**Rationale:** Acceptance criteria are clear; scenarios are standard UI interaction (button group toggle, localStorage persistence, timing); `BillableToggle` component does not exist yet so browser recording is not useful.  
**Browser automation config (`tea_browser_automation: auto`):** Skipped recording — feature not implemented.

---

## Step 3: Test Strategy

### Acceptance Criteria → Test Scenario Mapping

| AC | Scenario | Level | Priority | File |
|----|----------|-------|----------|------|
| AC1 | Three toggle buttons (All, Billable, Non-billable) visible on earnings dashboard | E2E | P0 | `tests/e2e/story-4-2-...atdd.spec.ts` |
| AC2 | "Billable" click → billable filter in localStorage, chart visible | E2E | P0 | `tests/e2e/story-4-2-...atdd.spec.ts` |
| AC3 | "Non-billable" click → nonBillable filter in localStorage, chart visible | E2E | P0 | `tests/e2e/story-4-2-...atdd.spec.ts` |
| AC4 | "All" click (after billable) → all filter in localStorage, chart visible | E2E | P0 | `tests/e2e/story-4-2-...atdd.spec.ts` |
| AC5 | Filter persists across navigation away and back | E2E | P1 | `tests/e2e/story-4-2-...atdd.spec.ts` |
| AC1 | Active toggle button visually distinguished (default vs outline variant) | E2E | P1 | `tests/e2e/story-4-2-...atdd.spec.ts` |
| NFR-P2 | Filter interaction responds within 500ms | E2E | P1 | `tests/e2e/story-4-2-...atdd.spec.ts` |
| AC5+FR19 | `setBillableFilter` persists billableFilter to localStorage | API | P0 | `tests/api/story-4-2-...atdd.spec.ts` |
| AC4+FR17 | `coercePersisted` returns 'all' for invalid billableFilter values | API | P0 | `tests/api/story-4-2-...atdd.spec.ts` |

### Test Level Rationale

- **E2E (P0+P1):** 7 scenarios — critical UI journeys requiring full browser rendering of React components, shadcn Button group, and localStorage reads. These are the primary ATDD artifacts.
- **API/Unit (P0):** 2 scenarios — storage contract tests for the billable filter persistence and coercion logic. These use Playwright's programmatic runner with dynamic module imports (same pattern as `tests/api/story-4-1-earnings-context-atdd.spec.ts`).

### Red Phase Requirements

All tests designed to FAIL before implementation:
- E2E tests fail because `data-testid="billable-toggle"`, `data-testid="billable-toggle-{filter}"` elements do not exist in current DOM (`BillableToggle` component not created, `EarningsDashboard.tsx` not updated)
- API tests test existing storage functions — these may pass on existing code but are included to document the storage contract and will gate regressions
- All tests wrapped in `test.skip()` to document red-phase intent without breaking CI

### Conventions Applied (from project-context.md)

- Import from `../support/fixtures` (not `@playwright/test`) in E2E tests
- Call `blockKnownThirdPartyHosts(page)` before every `page.goto()`
- Seed `app-language='en'` and `freelancer-kanban-data` via `addInitScript` in `beforeEach`
- Use `data-testid` selectors for bilingual surfaces (critical: "Billable" vs "Não faturável")
- Capture `Date.now()` **after** `page.goto()` in timing tests
- Use `{ exact: true }` with `getByText()` to avoid "Billable" substring matching "Non-billable"
- Apply `test.describe.configure({ retries: 1 })` for timing-sensitive tests
- DO NOT write keyboard navigation tests — deferred to Story 4.3

---

## Step 4: Test Generation

### Worker A — API/Unit Tests (Sequential)

**Status:** ✅ Complete  
**Output file:** `tests/api/story-4-2-billable-toggle-storage-atdd.spec.ts`  
**Tests:** 2 (all `test.skip()`)  
**TDD Phase:** RED

### Worker B — E2E Tests (Sequential)

**Status:** ✅ Complete  
**Output file:** `tests/e2e/story-4-2-implement-billable-non-billable-toggle-atdd.spec.ts`  
**Tests:** 7 (all `test.skip()`)  
**TDD Phase:** RED

### TDD Red Phase Validation

- [x] All tests use `test.skip()` ← documented intentional failing
- [x] No placeholder assertions (`expect(true).toBe(true)`) — all assertions target expected behavior
- [x] All tests marked `expected_to_fail: true`
- [x] Resilient selectors used (`getByTestId` with `data-testid` attributes specified in story)
- [x] `{ exact: true }` applied where "Billable" could substring-match "Non-billable"
- [x] No keyboard navigation tests (deferred to Story 4.3 per dev notes)
- [x] `Date.now()` captured after `page.goto()` in timing test (NFR-P2)
- [x] Both tasks seeded: one `isBillable: true`, one `isBillable: false` — both within last30 window
- [x] `test.describe.configure({ retries: 1 })` applied for timing test resilience
- [x] No linter errors in either file

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total tests generated | 9 |
| E2E tests (RED) | 7 |
| API/unit tests (RED) | 2 |
| P0 tests | 6 |
| P1 tests | 3 |
| All tests skipped | ✅ yes |
| Expected to fail | ✅ yes |
| Execution mode | SEQUENTIAL |

---

## Acceptance Criteria Coverage

| AC | E2E Tests | API Tests | Status |
|----|-----------|-----------|--------|
| AC1 (three toggle buttons visible, FR15/16/17) | 2 scenarios | — | ✅ Covered |
| AC2 (billable-only filter, FR15, FR18) | 1 scenario | — | ✅ Covered |
| AC3 (non-billable-only filter, FR16) | 1 scenario | — | ✅ Covered |
| AC4 (all tasks filter, FR17) | 1 scenario | 1 scenario | ✅ Covered |
| AC5 (persistence, FR19, FR41) | 1 scenario | 1 scenario | ✅ Covered |
| AC6 (separate metrics, FR20) | — | — | N/A — already implemented; existing Vitest tests cover |
| NFR-P2 (500ms response) | 1 scenario | — | ✅ Covered |

All 5 implementable acceptance criteria + NFR-P2 covered. AC6 is marked N/A (existing metric cards satisfy it; no new UI required per story dev notes).

---

## Generated Test Files

| File | Type | Tests | Phase |
|------|------|-------|-------|
| `tests/e2e/story-4-2-implement-billable-non-billable-toggle-atdd.spec.ts` | E2E | 7 | 🔴 RED |
| `tests/api/story-4-2-billable-toggle-storage-atdd.spec.ts` | API/Unit | 2 | 🔴 RED |

---

## Next Steps (TDD Green Phase)

After implementing Story 4.2 (create `BillableToggle.tsx`, update `EarningsDashboard.tsx`, update `EarningsDashboard.test.tsx`, update `earnings-dashboard-persistence.spec.ts`):

1. Remove `test.skip()` from `tests/e2e/story-4-2-implement-billable-non-billable-toggle-atdd.spec.ts`
2. Remove `test.skip()` from `tests/api/story-4-2-billable-toggle-storage-atdd.spec.ts`
3. Update `src/pages/EarningsDashboard.test.tsx` — replace combobox selector with `getByTestId("billable-toggle-billable")` assertion (Story 1.3 regression guard)
4. Update `tests/e2e/earnings-dashboard-persistence.spec.ts` — replace `getByRole("combobox", { name: /billable/i })` with `getByTestId("billable-toggle-*")` button clicks (4 tests)
5. Run: `npx playwright test` — verify all 9 ATDD tests pass
6. Run: `npx vitest run` — verify no regressions (baseline: 188 Vitest tests)
7. Verify no E2E regressions (baseline: 113 Playwright tests)
8. Commit: `"Implemented story 4.2"`

## Implementation Guidance

**UI components to implement:**
- `src/components/BillableToggle.tsx` — three-button group with `data-testid="billable-toggle"` on wrapper, `data-testid="billable-toggle-{filter}"` on each button (`all`, `billable`, `nonBillable`)
- Active button: `variant="default"`; inactive: `variant="outline"`, `size="sm"`

**Dashboard update:**
- Replace `<div className="space-y-2">…</div>` billable `<Select>` block in `src/pages/EarningsDashboard.tsx` with `<BillableToggle />`
- Add import; remove unused `BillableFilter` type import and `setBillableFilter` from destructure

**Regression guards:**
- `src/pages/EarningsDashboard.test.tsx` line ~81: replace combobox assertion with `getByTestId("billable-toggle-billable")`
- `tests/e2e/earnings-dashboard-persistence.spec.ts`: 4 tests using combobox billable selector → button testid pattern

**CLI sessions:** N/A — AI generation mode used (no browser recording sessions to close)  
**Temp artifacts:** All artifacts saved to `_bmad-output/test-artifacts/` per config

---

## Validation Checklist (Step 5)

- [x] Prerequisites satisfied (playwright.config.ts, support fixtures, story ACs present, storage exports verified)
- [x] Test files created at correct paths (`tests/e2e/story-4-2-...atdd.spec.ts`, `tests/api/story-4-2-...atdd.spec.ts`)
- [x] Checklist matches all 6 acceptance criteria (AC6 marked N/A per story dev notes)
- [x] Tests designed to fail before implementation (`test.skip()`)
- [x] No orphaned browser sessions (AI generation mode — no CLI sessions opened)
- [x] All temp artifacts stored in `_bmad-output/test-artifacts/` (not random /tmp locations)
- [x] No duplication in checklist sections
- [x] Terminology consistent throughout
- [x] All sections populated
- [x] Markdown formatting clean
- [x] Seed uses both billable and non-billable tasks within last30 date window
- [x] `{ exact: true }` applied on "Billable" text assertions (prevents "Non-billable" substring match)
- [x] No linter errors on either generated test file

**Recommended next workflow:** `bmad-dev-story` — implement story 4.2, then remove `test.skip()` to verify green phase.
