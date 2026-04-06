---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-04-06'
story_id: '4-1'
tdd_phase: 'RED'
inputDocuments:
  - '_bmad-output/implementation-artifacts/4-1-implement-date-range-filter-and-presets.md'
  - '_bmad/tea/config.yaml'
  - 'playwright.config.ts'
  - 'tests/e2e/story-3-4-chart-responsiveness-performance-atdd.spec.ts'
  - 'tests/e2e/story-3-1-customer-revenue-chart-atdd.spec.ts'
  - 'tests/api/story-2-1-earnings-calculations-atdd.spec.ts'
  - 'tests/support/fixtures/index.ts'
  - 'tests/support/helpers/network.ts'
  - 'src/context/EarningsDashboardStateContext.test.tsx'
---

# ATDD Checklist: Story 4.1 — Implement Date Range Filter and Presets

**TDD Phase:** 🔴 RED — All tests skipped (failing before implementation)  
**Story:** `_bmad-output/implementation-artifacts/4-1-implement-date-range-filter-and-presets.md`  
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

- [x] Story has clear acceptance criteria (6 ACs covering FR11, FR12, FR13, FR14, FR40, NFR-P2)
- [x] `playwright.config.ts` exists — Playwright E2E and API test projects configured
- [x] `tests/support/fixtures/index.ts` and `tests/support/helpers/network.ts` exist (required imports)
- [x] Existing E2E patterns available (stories 3.1–3.4) for convention reference
- [x] Dev environment: node_modules present, devServer available via `npm run dev`

### Story Summary

**Story 4.1** replaces the interim date-range `<Select>` in `EarningsDashboard.tsx` with a proper `DateRangeFilter` component featuring:
- Four preset buttons: "Last 30 days" (`last30`), "Quarter" (`quarter`), "Year" (`year`), "All time" (`all`)
- A `Popover`-wrapped shadcn `Calendar` for custom date range selection (`mode="range"`)
- A new `setCustomDateRange` action in `EarningsDashboardStateContext`
- Two new i18n keys (`earningsDateRangeCustom`, `earningsPickDateRange`)
- Full localStorage persistence across navigation

### Acceptance Criteria (Extracted)

| # | AC | Requirements |
|---|-----|-------------|
| AC1 | Calendar popover opens on date range control click | FR11 |
| AC2 | "Last 30 days" preset filters and visually highlights | FR12 |
| AC3 | Four preset buttons visible: Last 30 days, Quarter, Year, All time | FR12 |
| AC4 | All three charts (Customer, Project, Tag) apply the date filter | FR13 |
| AC5 | Date range persists across navigation (localStorage) | FR14, FR40 |
| AC6 | UI responds within 500ms | NFR-P2 |

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
**Rationale:** Acceptance criteria are clear; scenarios are standard UI interaction (preset buttons, calendar popover, localStorage persistence, timing); feature not yet implemented so browser recording is not useful.  
**Browser automation config (`tea_browser_automation: auto`):** Skipped recording — feature not implemented.

---

## Step 3: Test Strategy

### Acceptance Criteria → Test Scenario Mapping

| AC | Scenario | Level | Priority | File |
|----|----------|-------|----------|------|
| AC3 | Four preset buttons visible on earnings dashboard | E2E | P0 | `tests/e2e/story-4-1-...atdd.spec.ts` |
| AC2 | Clicking "Last 30 days" filters dashboard and persists preset | E2E | P0 | `tests/e2e/story-4-1-...atdd.spec.ts` |
| AC1 | Calendar popover opens on date picker trigger click | E2E | P0 | `tests/e2e/story-4-1-...atdd.spec.ts` |
| AC1+AC4 | Custom date range via calendar updates all charts | E2E | P0 | `tests/e2e/story-4-1-...atdd.spec.ts` |
| AC5 | Preset date range persists across navigation | E2E | P0 | `tests/e2e/story-4-1-...atdd.spec.ts` |
| AC6 | Filter interaction responds within 500ms | E2E | P1 | `tests/e2e/story-4-1-...atdd.spec.ts` |
| AC4+AC5 | `setCustomDateRange` persists dateRange without clearing preset | Unit/API | P0 | `tests/api/story-4-1-...atdd.spec.ts` |
| AC5 | `setCustomDateRange(undefined)` clears dateRange from storage | Unit/API | P0 | `tests/api/story-4-1-...atdd.spec.ts` |

### Test Level Rationale

- **E2E (P0+P1):** 6 scenarios — critical UI journeys requiring full browser rendering of React components, shadcn Popover/Calendar, and localStorage reads. These are the primary ATDD artifacts.
- **API/Unit (P0):** 2 scenarios — storage contract tests for the new `setCustomDateRange` action. These use Playwright's programmatic runner with dynamic module imports (same pattern as `tests/api/story-2-1-...`). Hook-level tests (requiring `renderHook`/`act`) must be added to `src/context/EarningsDashboardStateContext.test.tsx` in Vitest format after implementation.

### Red Phase Requirements

All tests designed to FAIL before implementation:
- E2E tests fail because `data-testid="date-range-presets"`, `data-testid="preset-*"`, `data-testid="date-range-picker-trigger"` elements do not exist in current DOM
- API/unit tests fail because `setCustomDateRange` hook action does not exist in context
- All tests wrapped in `test.skip()` to document red-phase intent without breaking CI

### Conventions Applied (from project-context.md)

- Import from `../support/fixtures` (not `@playwright/test`) in E2E tests
- Call `blockKnownThirdPartyHosts(page)` before every `page.goto()`
- Seed `app-language='en'` and `freelancer-kanban-data` via `addInitScript` in `beforeEach`
- Use `data-testid` selectors for bilingual surfaces
- Capture `Date.now()` **after** `page.goto()` in timing tests
- Use `{ exact: true }` with `getByText()` when text could be a substring
- Use `.first()` on SVG locators from recharts containers
- Apply `test.describe.configure({ retries: 1 })` for timing-sensitive tests

---

## Step 4: Test Generation

### Worker A — API/Unit Tests (Sequential)

**Status:** ✅ Complete  
**Output file:** `tests/api/story-4-1-earnings-context-atdd.spec.ts`  
**Tests:** 2 (all `test.skip()`)  
**TDD Phase:** RED

### Worker B — E2E Tests (Sequential)

**Status:** ✅ Complete  
**Output file:** `tests/e2e/story-4-1-implement-date-range-filter-and-presets-atdd.spec.ts`  
**Tests:** 6 (all `test.skip()`)  
**TDD Phase:** RED

### TDD Red Phase Validation

- [x] All tests use `test.skip()` ← documented intentional failing
- [x] No placeholder assertions (`expect(true).toBe(true)`) — all assertions target expected behavior
- [x] All tests marked `expected_to_fail: true`
- [x] Resilient selectors used (`getByTestId`, `getByRole`, `getByLabel`)
- [x] No keyboard navigation tests (deferred to Story 4.3 per dev notes)
- [x] `Date.now()` captured after `page.goto()` in timing test (AC6)

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total tests generated | 8 |
| E2E tests (RED) | 6 |
| API/unit tests (RED) | 2 |
| P0 tests | 7 |
| P1 tests | 1 |
| All tests skipped | ✅ yes |
| Expected to fail | ✅ yes |
| Execution mode | SEQUENTIAL |

---

## Acceptance Criteria Coverage

| AC | E2E Tests | API Tests | Status |
|----|-----------|-----------|--------|
| AC1 (calendar popover, FR11) | 2 scenarios | — | ✅ Covered |
| AC2 (Last 30 days preset, FR12) | 1 scenario | — | ✅ Covered |
| AC3 (four presets visible, FR12) | 1 scenario | — | ✅ Covered |
| AC4 (all charts apply filter, FR13) | 1 scenario | 1 scenario | ✅ Covered |
| AC5 (persistence, FR14, FR40) | 1 scenario | 2 scenarios | ✅ Covered |
| AC6 (500ms, NFR-P2) | 1 scenario | — | ✅ Covered |

All 6 acceptance criteria covered.

---

## Generated Test Files

| File | Type | Tests | Phase |
|------|------|-------|-------|
| `tests/e2e/story-4-1-implement-date-range-filter-and-presets-atdd.spec.ts` | E2E | 6 | 🔴 RED |
| `tests/api/story-4-1-earnings-context-atdd.spec.ts` | API/Unit | 2 | 🔴 RED |

---

## Next Steps (TDD Green Phase)

After implementing Story 4.1 (create `DateRangeFilter.tsx`, add `setCustomDateRange` to context, update dashboard, add i18n keys):

1. Remove `test.skip()` from `tests/e2e/story-4-1-implement-date-range-filter-and-presets-atdd.spec.ts`
2. Remove `test.skip()` from `tests/api/story-4-1-earnings-context-atdd.spec.ts`
3. Add the two Vitest unit tests to `src/context/EarningsDashboardStateContext.test.tsx` (as specified in the story dev notes)
4. Run: `npx playwright test` — verify all 8 ATDD tests pass
5. Run: `npx vitest run` — verify unit tests pass (baseline: 153 + 2 new = 155)
6. Verify no regressions (baseline: 103 E2E tests + 6 new = 109)
7. Commit: `"Implemented story 4.1"`

## Implementation Guidance

**UI components to implement:**
- `src/components/DateRangeFilter.tsx` — preset buttons with `data-testid="date-range-presets"`, `data-testid="preset-{id}"`, popover trigger `data-testid="date-range-picker-trigger"`
- Replace interim `<Select>` in `src/pages/EarningsDashboard.tsx`

**Context actions to add:**
- `setCustomDateRange(range: { startMs: number; endMs: number } | undefined): void` in `EarningsDashboardStateContext.tsx`

**i18n keys to add:**
- `earningsDateRangeCustom` and `earningsPickDateRange` in both `en` and `pt` objects in `LanguageContext.tsx`

**CLI sessions:** N/A — AI generation mode used (no browser recording sessions to close)  
**Temp artifacts:** All artifacts saved to `_bmad-output/test-artifacts/` per config

---

## Validation Checklist (Step 5)

- [x] Prerequisites satisfied (playwright.config.ts, support fixtures, story ACs present)
- [x] Test files created at correct paths
- [x] Checklist matches all 6 acceptance criteria
- [x] Tests designed to fail before implementation (`test.skip()`)
- [x] No orphaned browser sessions (AI generation mode — no CLI sessions opened)
- [x] All temp artifacts stored in `_bmad-output/test-artifacts/` (not random /tmp locations)
- [x] No duplication in checklist sections
- [x] Terminology consistent throughout
- [x] All sections populated
- [x] Markdown formatting clean

**Recommended next workflow:** `bmad-dev-story` — implement story 4.1, then remove `test.skip()` to verify green phase.
