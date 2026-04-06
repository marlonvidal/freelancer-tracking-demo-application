---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-04-06'
story_id: '4-4'
tdd_phase: 'RED'
inputDocuments:
  - '_bmad-output/implementation-artifacts/4-4-chart-ux-polish-and-test-stability.md'
  - 'playwright.config.ts'
  - 'vitest.config.ts'
  - 'tests/e2e/story-4-3-ensure-filter-responsiveness-and-keyboard-accessibility-atdd.spec.ts'
  - 'tests/support/fixtures/index.ts'
  - 'tests/support/helpers/network.ts'
  - '_bmad-output/test-artifacts/atdd-checklist-4-3.md'
---

# ATDD Checklist: Story 4.4 — Chart UX Polish and Test Stability

**TDD Phase:** 🔴 RED — All tests skipped (failing before implementation)  
**Story:** `_bmad-output/implementation-artifacts/4-4-chart-ux-polish-and-test-stability.md`  
**Generated:** 2026-04-06

---

## Step 1: Preflight & Context

### Stack Detection

- **`detected_stack`:** `frontend` (React + Vite detected via `package.json`, `vite.config.ts`, `playwright.config.ts`)
- **Test framework:** Playwright (E2E: `tests/e2e/`, API: `tests/api/`) + Vitest (unit: `src/**/*.test.ts`)

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

- [x] Story has clear acceptance criteria (5 ACs covering chart state, shared utility, empty state, timing, import consistency)
- [x] `playwright.config.ts` exists — Playwright E2E and API test projects configured
- [x] `vitest.config.ts` exists — Vitest configured for unit tests in `src/`
- [x] `tests/support/fixtures/index.ts` and `tests/support/helpers/network.ts` exist (required imports)
- [x] Existing E2E patterns available (stories 3.1–4.3) for convention reference
- [x] `data-testid` values for all interactive elements exist (from Stories 4.1–4.3 — must not change)
- [x] Story dev notes contain the complete ATDD test file template with all selector patterns
- [x] recharts legend click pattern documented: `page.locator('[data-testid="...chart..."] svg text').filter({ hasText: '...' }).click()`
- [x] `data-testid="chart-all-hidden-message"` — new testid specified in story (shared across all 3 charts)
- [x] Dev environment: node_modules present; current test baseline 207 Vitest + 132 Playwright tests (128/132 passing)

### Story Summary

**Story 4.4** is the final story in Epic 4 — a polish and technical debt payoff story closing 5 deferred debt items:

1. **AC1:** `hiddenKeys` not reset on filter/date change → fix with `useEffect([data])` in each chart component
2. **AC2:** `formatCurrency` duplicated in 4 files → extract to `src/lib/utils.ts` as a named export
3. **AC3:** All-slices-hidden blank chart → add `data-testid="chart-all-hidden-message"` guard with i18n message
4. **AC4:** `Date.now()` before `page.goto()` in timing tests → move after navigation completes
5. **AC5:** Mixed `./pages` and `@/pages` imports in `App.tsx` → normalize to `@/pages/`

### Acceptance Criteria (Extracted)

| # | AC | Requirements |
|---|-----|-------------|
| AC1 | Hidden legend items become visible again when date range or billable filter changes | FR7, recharts state |
| AC2 | Single shared `formatCurrency` from `src/lib/utils.ts` used by all 4 consumer files | code quality, DRY |
| AC3 | All legend items hidden → informative message shown (`data-testid="chart-all-hidden-message"`) | FR9, UX |
| AC4 | `Date.now()` captured AFTER `page.goto()` in Stories 1.1 and 3.2 timing tests | NFR-P1, CI stability |
| AC5 | All imports in `App.tsx` use `@/` alias consistently | code quality, convention |

### Knowledge Fragments Used

- `selector-resilience.md` — `getByTestId` with stable testids; recharts SVG text selector pattern
- `timing-debugging.md` — post-goto `Date.now()` mandatory rule (AC4 timing fix)
- `data-factories.md` — `buildTwoClientSeed` factory with two billable tasks inside last30
- `component-tdd.md` — component-level TDD red-phase; `useEffect` state reset testing patterns
- `test-quality.md` — red-phase `test.skip()` requirement; `it.skip()` for Vitest
- `test-healing-patterns.md` — recharts SVG text targeting; filter/date change state reset patterns

---

## Step 2: Generation Mode

**Mode:** AI Generation  
**Rationale:** Story dev notes provide the complete ATDD test file template with all selector patterns and seed factories. The features under test (AC1: `useEffect` reset, AC3: `chart-all-hidden-message` guard) are not yet implemented — browser recording would find no target elements to record against.  
**Browser automation config (`tea_browser_automation: auto`):** Skipped recording — target elements and behaviors not yet in DOM.

---

## Step 3: Test Strategy

### Acceptance Criteria → Test Scenario Mapping

| AC | Scenario | Level | Priority | File |
|----|----------|-------|----------|------|
| AC3 | Hide all legend items → `data-testid="chart-all-hidden-message"` appears | E2E | P0 | `tests/e2e/story-4-4-...atdd.spec.ts` |
| AC1 | Hide all items, change billable filter → all-hidden message disappears, chart renders | E2E | P0 | `tests/e2e/story-4-4-...atdd.spec.ts` |
| AC1 | Hide all items, change date preset → all-hidden message disappears, chart renders | E2E | P0 | `tests/e2e/story-4-4-...atdd.spec.ts` |
| AC1 + AC3 | Project chart: hide single legend, all-hidden message appears, date change resets | E2E | P1 | `tests/e2e/story-4-4-...atdd.spec.ts` |
| AC2 | `formatCurrency` exported from `src/lib/utils.ts` formats USD amounts correctly | Vitest unit | P1 | `src/lib/utils.test.ts` |
| AC2 | `formatCurrency` formats thousands with comma separator | Vitest unit | P1 | `src/lib/utils.test.ts` |
| AC2 | `formatCurrency` formats fractional amounts to 2 decimal places | Vitest unit | P1 | `src/lib/utils.test.ts` |
| AC2 | `formatCurrency` formats zero as $0.00 | Vitest unit | P1 | `src/lib/utils.test.ts` |

**ACs not covered by new tests (intentional):**

| AC | Rationale |
|----|-----------|
| AC4 | Covered by modifying existing E2E tests (earnings-dashboard-route.spec.ts, story-3-2-project-revenue-chart-atdd.spec.ts) — ATDD creates new tests, not modifications to existing ones. The existing timing tests will fail until fixed. |
| AC5 | Code-only import path change — no observable runtime behavior difference. Covered by linting / import resolution checks. |

### Test Level Rationale

- **E2E (P0+P1):** 4 scenarios — all require a real browser to verify recharts SVG legend click behavior, DOM state changes, and filter interactions that update the `data` prop reference.
- **Vitest unit (P1):** 4 scenarios — `formatCurrency` is a pure function; unit test is the appropriate level (no DOM, no browser needed). Vitest format with dynamic import tests the function is actually exported from `src/lib/utils.ts`.
- **No API tests:** Story 4.4 makes no changes to the API layer, localStorage schema, or context actions.

### Red Phase Requirements

All tests designed to FAIL before implementation:

- **E2E tests:** `chart-all-hidden-message` element does not exist in the DOM yet (AC3 guard not implemented). `useEffect([data])` reset not in chart components (AC1 state stays stale after filter change).
- **Vitest unit tests:** `formatCurrency` is not yet exported from `src/lib/utils.ts` — the dynamic `import("./utils")` will not find the named export, causing the test to throw.
- All tests wrapped in `test.skip()` / `it.skip()` — TDD red-phase intent documented.

### Conventions Applied (from project-context.md and Story 4.4 dev notes)

- Import from `../support/fixtures` (not `@playwright/test`)
- Call `blockKnownThirdPartyHosts(page)` in `beforeEach` (before each test's `page.goto()`)
- Seed `app-language='en'` and `freelancer-kanban-data` via `addInitScript` in `beforeEach`
- Use `data-testid` selectors (all existing testids stable — must not change)
- recharts legend click: `page.locator('[data-testid="...chart..."] svg text').filter({ hasText: '...' }).click()`
- Seed uses two clients (two legend items in customer chart) — enables "hide all" scenario
- `data-testid="chart-all-hidden-message"` is the target for AC3 assertions
- `Date.now()` captured after `page.goto()` in any timing assertions (mandatory E2E timing rule)

---

## Step 4: Test Generation

### Worker A — API Tests (Sequential, AI Generation)

**Status:** ✅ N/A — No API tests needed for Story 4.4  
**Rationale:** No new API endpoints, no storage schema changes, no context action changes.

### Worker B — E2E Tests (Sequential, AI Generation)

**Status:** ✅ Complete  
**Output file:** `tests/e2e/story-4-4-chart-ux-polish-and-test-stability-atdd.spec.ts`  
**Tests:** 4 (all `test.skip()`)  
**TDD Phase:** RED

### Worker C — Unit Tests (Sequential, AI Generation)

**Status:** ✅ Complete  
**Output file:** `src/lib/utils.test.ts`  
**Tests:** 4 (all `it.skip()`)  
**TDD Phase:** RED

### TDD Red Phase Validation

- [x] All E2E tests use `test.skip()` ← documented intentional failing
- [x] All Vitest unit tests use `it.skip()` ← documented intentional failing
- [x] No placeholder assertions (`expect(true).toBe(true)`) — all assertions target expected behavior
- [x] All tests marked with inline RED-phase comments explaining why they fail
- [x] Resilient selectors used: `getByTestId`, `getByLabel`, `getByRole`, recharts SVG text filter pattern
- [x] Two-client seed used — enables "hide all 2 legend items" scenario without edge cases
- [x] `blockKnownThirdPartyHosts(page)` called in `beforeEach`
- [x] Vitest unit tests use dynamic `import('./utils')` to test the actual export (not mocked)
- [x] No linter errors in generated test files (double quotes, semicolons, trailing commas consistent with project style)

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total tests generated | 8 |
| E2E tests (RED) | 4 |
| Vitest unit tests (RED) | 4 |
| API tests | 0 (N/A) |
| P0 tests | 3 |
| P1 tests | 5 |
| All tests skipped | ✅ yes |
| Expected to fail | ✅ yes |
| Execution mode | SEQUENTIAL (AI generation) |

---

## Acceptance Criteria Coverage

| AC | Test Scenarios | Status |
|----|---------------|--------|
| AC1 — `hiddenKeys` resets on filter/date change | 3 E2E scenarios (billable filter change, date preset change, project chart reset) | ✅ Covered |
| AC2 — Shared `formatCurrency` from `src/lib/utils.ts` | 4 Vitest unit scenarios (standard amount, thousands, fractional, zero) | ✅ Covered |
| AC3 — All-hidden empty state message | 1 E2E scenario (hide all customer chart items → message appears) | ✅ Covered |
| AC4 — `Date.now()` moved after `page.goto()` | N/A — modifying existing E2E files (not creating new tests) | ⚠️ Not in new test files |
| AC5 — `App.tsx` import consistency | N/A — code-only change, no observable runtime behavior | ⚠️ Not in new test files |

All testable ACs covered. AC4 and AC5 are handled by implementation changes, not new ATDD tests.

---

## Generated Test Files

| File | Type | Tests | Phase |
|------|------|-------|-------|
| `tests/e2e/story-4-4-chart-ux-polish-and-test-stability-atdd.spec.ts` | E2E (Playwright) | 4 | 🔴 RED |
| `src/lib/utils.test.ts` | Unit (Vitest) | 4 | 🔴 RED |

---

## Next Steps (TDD Green Phase)

After implementing Story 4.4 (all 5 ACs):

1. Remove `test.skip()` from all 4 tests in `tests/e2e/story-4-4-chart-ux-polish-and-test-stability-atdd.spec.ts`
2. Remove `it.skip()` from all 4 tests in `src/lib/utils.test.ts`
3. Update comment block headers: change `TDD Phase: RED` → `TDD Phase: GREEN` in both files
4. Run: `npx vitest run src/lib/utils.test.ts` — verify all 4 formatCurrency tests pass
5. Run: `npx playwright test tests/e2e/story-4-4-*` — verify all 4 E2E ATDD tests pass
6. Run: `npx playwright test` — verify no regressions (baseline: 132 Playwright tests)
7. Run: `npx vitest run` — verify no regressions (baseline: 207 Vitest tests)
8. Commit: `"Implemented story 4.4"`

## Implementation Guidance

**`src/lib/utils.ts` — Add `formatCurrency` export (AC2):**
```typescript
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
```

**`src/context/LanguageContext.tsx` — Add translation key (AC3):**
```typescript
earningsChartAllHidden: 'No visible data — click a legend item to restore',  // en
earningsChartAllHidden: 'Nenhum dado visível — clique em um item da legenda para restaurar',  // pt
```

**Each of `CustomerRevenueChart.tsx`, `ProjectRevenueChart.tsx`, `TagRevenueChart.tsx` — AC1 + AC2 + AC3:**
- Remove local `formatCurrency`; add `import { formatCurrency } from '@/lib/utils'`
- Add `useEffect(() => { setHiddenKeys(new Set()); }, [data])` after `hiddenKeys` state
- Add all-hidden guard: when `data.length > 0 && visibleData.length === 0`, render `<div data-testid="chart-all-hidden-message">` with `t.earningsChartAllHidden` text

**`src/pages/EarningsDashboard.tsx` — AC2:**
- Remove local `formatCurrency`; add `import { formatCurrency } from '@/lib/utils'`

**`src/App.tsx` — AC5:**
- `import Index from "@/pages/Index"` (was `./pages/Index`)
- `import NotFound from "@/pages/NotFound"` (was `./pages/NotFound`)

**`tests/e2e/earnings-dashboard-route.spec.ts` — AC4:**
- Move `const start = Date.now()` to AFTER `await page.goto('/earnings')` and dashboard visibility check

**`tests/e2e/story-3-2-project-revenue-chart-atdd.spec.ts` — AC4:**
- Move `const start = Date.now()` to AFTER `await page.goto('/earnings')` and dashboard visibility check

**CLI sessions:** N/A — AI generation mode used (no browser recording sessions to close)  
**Temp artifacts:** All artifacts saved to `_bmad-output/test-artifacts/` per config

---

## Validation Checklist (Step 5)

- [x] Prerequisites satisfied (playwright.config.ts, vitest.config.ts, support fixtures, story ACs present)
- [x] E2E test file created at correct path (`tests/e2e/story-4-4-...atdd.spec.ts`)
- [x] Vitest unit test file created at correct path (`src/lib/utils.test.ts`)
- [x] Checklist covers all 5 acceptance criteria (AC1–AC5), with rationale for AC4+AC5 not having new tests
- [x] Tests designed to fail before implementation (`test.skip()` / `it.skip()` on all 8 tests)
- [x] No orphaned browser sessions (AI generation mode — no CLI sessions opened)
- [x] All artifacts stored in `_bmad-output/test-artifacts/` (not random /tmp locations)
- [x] No duplication in checklist sections
- [x] Terminology consistent throughout
- [x] All sections populated
- [x] Markdown formatting clean
- [x] Seed uses two clients — enables "hide all legend items" scenario
- [x] recharts SVG text selector pattern applied: `.locator('...svg text').filter({ hasText: '...' }).click()`
- [x] `blockKnownThirdPartyHosts(page)` called in `beforeEach` before `page.goto()`
- [x] `Date.now()` captured after `page.goto()` in any timing context (no timing tests in new file)
- [x] Vitest unit tests use `it.skip()` (not `test.skip()`) — Vitest `it` alias convention
- [x] Dynamic `import('./utils')` used in Vitest tests — tests actual named export, not a mock
- [x] No linter errors on generated test files

**Recommended next workflow:** `bmad-dev-story` — implement story 4.4 changes, then remove `test.skip()`/`it.skip()` to verify green phase.
