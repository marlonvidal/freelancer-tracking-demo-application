---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: '2026-04-06'
story: 7-2-final-polish-deferred-work-resolution
storyFile: _bmad-output/implementation-artifacts/7-2-final-polish-deferred-work-resolution.md
inputDocuments:
  - _bmad-output/implementation-artifacts/7-2-final-polish-deferred-work-resolution.md
  - playwright.config.ts
  - tests/support/fixtures/index.ts
  - tests/support/helpers/network.ts
  - tests/e2e/story-7-1-implement-accessibility-wcag-2-1-aa-for-dashboard-atdd.spec.ts
tddPhase: RED
detectedStack: frontend
generationMode: ai
---

# ATDD Checklist — Story 7.2: Final Polish & Deferred Work Resolution

## Step 1: Preflight & Context Summary

### Stack Detection

- **Detected Stack:** `frontend`
- **Indicators:** `package.json` (React/Vite), `playwright.config.ts`, `tests/e2e/` directory
- **Test Framework:** Playwright (E2E), Vitest (unit tests)

### Prerequisites Check

- [x] Story 7.2 is `ready-for-dev` with clear acceptance criteria (9 ACs)
- [x] `playwright.config.ts` exists at project root
- [x] `tests/e2e/` directory exists with existing ATDD specs as reference patterns
- [x] `tests/support/fixtures/` and `tests/support/helpers/network.ts` available

### Story Context Loaded

**Story:** 7.2 — Final Polish & Deferred Work Resolution  
**Status:** ready-for-dev (implementation NOT yet done — RED PHASE)

**Acceptance Criteria:**

| AC | Description | Testable via E2E |
|----|-------------|-----------------|
| AC1 | Dark mode toggle has locale-aware aria-label (EN: "Dark mode", PT: "Modo escuro") | ✅ Yes |
| AC2 | Metrics section appears as named `region` landmark | ✅ Yes |
| AC3 | Calendar popover closes automatically after full date range selection (D4) | ✅ Yes |
| AC4 | Chart view control is a button group, not a `<Select>` (D5) | ✅ Yes |
| AC5 | `visibleData` memoized with `useMemo` in all three chart components | ⚠️ No observable DOM signal; skip E2E |
| AC6 | sr-only `<ul>` has no redundant `aria-label` (only `aria-labelledby`) | ✅ Yes |
| AC7 | E2E performance timer starts after `page.goto()` | ⚠️ Code fix to existing tests; no new test needed |
| AC8 | Zombie test rewritten with real storage fallback assertion | ⚠️ Changes to story-7-1 spec; out of scope for this file |
| AC9 | Negative `timeSpent` clamped to 0, no negative `averageHourlyRate` in UI | ✅ Yes |

### Existing Patterns (Project Conventions)

- Import: `import { test, expect } from '../support/fixtures'`
- Import: `import { blockKnownThirdPartyHosts } from '../support/helpers/network'`
- `await blockKnownThirdPartyHosts(page)` before every `page.goto()`
- Seed via `page.addInitScript()` — never `page.evaluate()` or app defaults
- **No `test.skip()`** — D1 retro project-wide convention; tests are written to pass after implementation
- `{ exact: true }` with `getByText()` where substring risk exists
- `data-testid` selectors for bilingual element targeting

---

## Step 2: Generation Mode

**Selected Mode:** AI Generation  
**Rationale:** Acceptance criteria are clear and well-specified. Story Dev Notes include an explicit ATDD spec implementation. Standard UI behavior tests (ARIA, buttons, popover, chart switching). No complex UI interactions requiring browser recording.

---

## Step 3: Test Strategy

### Test Level Selection

All scenarios → **E2E (Playwright)** — this is a frontend-only stack; UI interactions and DOM attribute assertions are best verified at the E2E level.

### AC-to-Scenario Mapping

| Scenario | AC | Priority | Level | Red Phase Reason |
|----------|----|----------|-------|-----------------|
| Dark mode button aria-label EN "Dark mode" | AC1 | P0 | E2E | `t.darkModeLabel` key not yet added to `LanguageContext.tsx` |
| Dark mode button aria-label PT "Modo escuro" | AC1 | P0 | E2E | Same — PT locale not yet wired |
| Dark mode toggle label switches after clicking (EN "Light mode") | AC1 | P1 | E2E | `t.lightModeLabel` key not yet added |
| Metrics div has `role="region"` | AC2 | P0 | E2E | Attribute not yet added to `EarningsDashboard.tsx` |
| Calendar popover auto-closes after both dates selected | AC3 | P1 | E2E | `setOpen(false)` not yet added to `useEffect` in `DateRangeFilter.tsx` |
| Chart view control is a button group with role="group" | AC4 | P1 | E2E | `<Select>` not yet replaced with button group |
| Active chart button has aria-pressed=true | AC4 | P1 | E2E | `aria-pressed` not yet present on buttons |
| Clicking project button switches visible chart | AC4 | P1 | E2E | Button group not yet implemented |
| sr-only ul has `aria-labelledby` but no `aria-label` | AC6 | P1 | E2E | Dead `aria-label` not yet removed from chart components |
| Negative timeSpent seed produces no negative metric value | AC9 | P0 | E2E | `Math.max(0, task.timeSpent)` guard not yet in `calculateSummaryMetrics` |

### Red Phase Confirmation

All tests target behavior that **does not yet exist in the codebase**:
- `lightModeLabel` / `darkModeLabel` translation keys are not in `LanguageContext.tsx`
- `role="region"` is not on the metrics div
- `setOpen(false)` auto-close is not in `DateRangeFilter.tsx`
- The `<Select>` chart view has not been converted to a button group
- `aria-label` dead code is still on sr-only `<ul>` elements
- `Math.max(0, task.timeSpent)` guard is not yet applied

Tests are written for **expected post-implementation behavior**. They will fail until the implementation described in the story Dev Notes is applied.

---

## Step 4: Generated Test Files

### E2E Tests

**File:** `tests/e2e/story-7-2-final-polish-deferred-work-resolution-atdd.spec.ts`

| Test | Priority | AC | Expected Failure Reason |
|------|----------|----|------------------------|
| `[P0] Dark mode toggle has locale-aware aria-label in English` | P0 | AC1 | `aria-label` attribute not yet on Header dark mode button |
| `[P0] Dark mode toggle has locale-aware aria-label in Portuguese` | P0 | AC1 | Same; PT translation key not yet added |
| `[P1] Dark mode toggle aria-label switches to "Light mode" after toggling` | P1 | AC1 | Toggle behavior + label update not yet wired |
| `[P0] Metrics section has role="region" making it a named ARIA landmark` | P0 | AC2 | `role="region"` not yet on metrics div |
| `[P1] Date picker popover closes automatically after selecting both dates` | P1 | AC3 | `setOpen(false)` not yet in DateRangeFilter useEffect |
| `[P1] Chart view control is a button group with three buttons and correct data-testids` | P1 | AC4 | `<Select>` not yet replaced; `data-testid="chart-view-selector"` doesn't exist |
| `[P1] Active chart view button has aria-pressed=true; inactive buttons have aria-pressed=false` | P1 | AC4 | Button group with `aria-pressed` not yet implemented |
| `[P1] Clicking project chart button switches the visible chart` | P1 | AC4 | Button group not yet implemented |
| `[P1] Customer chart sr-only data list has aria-labelledby but no redundant aria-label` | P1 | AC6 | `aria-label` still present on sr-only `<ul>` in CustomerRevenueChart |
| `[P0] Negative timeSpent task does not produce a negative average hourly rate in the UI` | P0 | AC9 | `Math.max(0, task.timeSpent)` guard not yet applied |

**Total scenarios:** 10

### ACs Outside This Spec

| AC | Disposition |
|----|-------------|
| AC5 (useMemo) | No observable DOM signal; verified by code review / unit test |
| AC7 (timer position fix) | Fix to existing E2E test infrastructure; no new test needed |
| AC8 (zombie test rewrite) | Changes in `tests/e2e/story-7-1-…-atdd.spec.ts` per Dev Notes |

---

## Step 5: Validation

### Prerequisites Checklist

- [x] Story 7.2 approved with clear acceptance criteria
- [x] `playwright.config.ts` present — framework configured
- [x] `tests/support/fixtures/index.ts` — fixture base available
- [x] `tests/support/helpers/network.ts` — `blockKnownThirdPartyHosts` available

### Test File Validation

- [x] File created: `tests/e2e/story-7-2-final-polish-deferred-work-resolution-atdd.spec.ts`
- [x] Import from `../support/fixtures` (not `@playwright/test`)
- [x] `blockKnownThirdPartyHosts` awaited before every `page.goto()`
- [x] All seeds use `addInitScript` (never `page.evaluate()`)
- [x] No `test.skip()` used (D1 retro project-wide convention)
- [x] Priority tags `[P0]`, `[P1]` present in every test name
- [x] AC reference tags present in every test name
- [x] Resilient selectors: `getByRole`, `getByTestId`, `locator` (no CSS class fragility)
- [x] Deterministic waits (`expect(...).toBeVisible()`) — no hard sleeps
- [x] All 10 tests will fail before implementation (RED phase confirmed)
- [x] No temp artifacts in random locations

### Assumptions & Risks

| Risk | Mitigation |
|------|-----------|
| Calendar day button selector `button[name]` may vary by Radix Calendar version | If selector breaks, switch to `page.locator('[data-day]')` or `role="gridcell"` pattern |
| `[data-radix-popper-content-wrapper]` popover locator is Radix-specific | Stable across Radix versions; used in existing story specs |
| `metric-*` data-testid pattern assumed for AC9 metric value check | If no `metric-*` testids exist, AC9 test falls back to absence of `earnings-calculation-error` |
| sr-only ul `aria-label` removal (AC6) only tests CustomerRevenueChart | ProjectRevenueChart and TagRevenueChart tested transitively via chart switching |

### Next Recommended Workflow

1. **Implementation:** Run `bmad-dev-story` pointing to `_bmad-output/implementation-artifacts/7-2-final-polish-deferred-work-resolution.md`
2. **Green Phase Verification:** After implementation, run `npx playwright test story-7-2 --workers=1`
3. **Full Suite:** Run `npx playwright test --workers=1` to confirm no regressions
4. **Code Review:** Run `bmad-code-review` skill on the implementation changes

---

## Summary

| Item | Value |
|------|-------|
| ATDD Checklist | `_bmad-output/test-artifacts/atdd-checklist-7-2.md` |
| E2E Test File | `tests/e2e/story-7-2-final-polish-deferred-work-resolution-atdd.spec.ts` |
| Total Scenarios | 10 |
| P0 Tests | 4 |
| P1 Tests | 6 |
| TDD Phase | RED (all tests fail until implementation) |
| `test.skip()` Used | No (project-wide D1 retro convention) |
| Stack | frontend (Playwright E2E) |
| Generation Mode | AI |
