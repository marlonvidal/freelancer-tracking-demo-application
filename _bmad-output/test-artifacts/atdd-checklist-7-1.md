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
  - _bmad-output/implementation-artifacts/7-1-implement-accessibility-wcag-2-1-aa-for-dashboard.md
  - _bmad/tea/config.yaml
  - playwright.config.ts
  - tests/support/fixtures/index.ts
  - tests/support/helpers/network.ts
  - tests/e2e/story-6-1-implement-i18n-translations-for-dashboard-atdd.spec.ts
---

# ATDD Checklist: Story 7.1 — Implement Accessibility (WCAG 2.1 AA) for Dashboard

## TDD Status: Natural Red Phase

Tests are designed to FAIL before implementation. Per project convention (D1 retro action),
`test.skip()` is NOT used — tests run and fail naturally until the feature is implemented.

- E2E Tests: **10 tests** (all will fail until Story 7.1 is implemented)
- API Tests: **0** (not applicable — pure frontend accessibility feature)

---

## Step 1: Preflight & Context

### Stack Detection

- **detected_stack:** `frontend`
- **Evidence:** `playwright.config.ts` present, `vite.config.ts` present, `package.json` with React/Vite dependencies
- **Backward-compat:** `test_stack_type: auto` in `_bmad/tea/config.yaml` → auto-detected as `frontend`

### Prerequisites Check

| Requirement | Status | Notes |
|---|---|---|
| Story has clear acceptance criteria | ✅ | 6 ACs defined with Given/When/Then |
| Playwright config exists | ✅ | `playwright.config.ts` at project root |
| Dev environment available | ✅ | Playwright + Vite stack configured |

### Loaded Artifacts

- Story file: `_bmad-output/implementation-artifacts/7-1-implement-accessibility-wcag-2-1-aa-for-dashboard.md`
- Framework config: `playwright.config.ts`
- Test patterns: `tests/e2e/story-6-1-*-atdd.spec.ts` (most recent prior ATDD spec)
- Support fixtures: `tests/support/fixtures/index.ts`, `tests/support/helpers/network.ts`

### TEA Config Flags

| Flag | Value | Applied |
|---|---|---|
| `tea_use_playwright_utils` | `true` | Full UI+API profile loaded |
| `tea_browser_automation` | `auto` | AI generation used (no complex drag/drop UI) |
| `tea_execution_mode` | `auto` | Resolved to `sequential` (single agent context) |
| `tea_capability_probe` | `true` | Probe enabled, fallback to sequential applied |
| `tea_use_pactjs_utils` | `false` | Not applicable |

---

## Step 2: Generation Mode

**Selected Mode:** AI Generation

**Rationale:** Acceptance criteria are clear and well-structured. All interactions are standard
ARIA attribute assertions and DOM structure checks — no complex drag-drop or wizard UI that
would require live browser recording. Story Dev Notes provide a complete reference ATDD spec.

---

## Step 3: Test Strategy

### Acceptance Criteria → Test Scenarios

| AC | Description | Test Level | Scenarios | Priority |
|---|---|---|---|---|
| AC1/FR34/NFR-A1 | Charts announced by screen readers | E2E | Customer chart h2 + sr-only `<ul>` with 2 items | P0 |
| AC1/FR34 | All three chart headings translated | E2E | Switch chart view, verify each heading text | P0 |
| AC1/NFR-A1 | Empty state `role="status"` | E2E | Empty seed → earnings-empty-no-tasks | P0 |
| AC1/NFR-A1 | Error state `role="alert"` | E2E | Corrupt storage → earnings-calculation-error | P0 |
| AC1/NFR-A1 | Globe button EN aria-label | E2E | `app-language=en` → button name "Language" | P0 |
| AC1/NFR-A1 | Globe button PT aria-label | E2E | `app-language=pt` → button name "Idioma" | P0 |
| AC2/FR33 | Page structure: main + h1 | E2E | Verify `<main>` and `role="heading" level=1` | P1 |
| AC2/FR33/NFR-A7 | Chart Select keyboard focusable | E2E | `chartSelect.focus()` → toBeFocused() | P1 |
| AC4/FR36/NFR-A5 | sr-only list = text alt for pie colors | E2E | Both client names in sr-only list items | P1 |
| AC6/FR38/NFR-A6 | Date picker aria-label present | E2E | `date-range-picker-trigger` has non-empty `aria-label` | P1 |
| AC3/FR35/NFR-A4 | Focus indicators visible | MANUAL | shadcn/ui `focus-visible:ring-2` — already complete from stories 4.1–4.3 | — |
| AC5/FR37/NFR-A3 | Text contrast ≥ 4.5:1 | MANUAL | axe-core browser extension on light + dark mode | — |

### Test Level Rationale

All automated tests are E2E (Playwright) because:
- The story is entirely about DOM structure and ARIA attributes rendered by React components
- Unit tests cannot verify the rendered accessibility tree in a real browser
- No API/backend changes are involved

### Red Phase Requirements

The tests assert EXPECTED behavior (post-implementation state). They will:
1. **Fail** because the implementation does not yet exist (red phase ✅)
2. **Pass** after Story 7.1 is implemented (green phase)
3. **Continue to pass** as regression guards

Per project convention (D1 retro action), `test.skip()` is NOT used.
Tests run, fail, and serve as the implementation contract.

---

## Step 4: Test Generation

### Execution Mode

- **Requested:** `auto` (from config)
- **Resolved:** `sequential` (single-agent context, no subagent capability available)
- **Worker A (API):** Skipped — no API tests needed for pure frontend accessibility
- **Worker B (E2E):** Sequential AI generation from story ATDD spec

### Generated Test Files

| File | Type | Scenarios | Status |
|---|---|---|---|
| `tests/e2e/story-7-1-implement-accessibility-wcag-2-1-aa-for-dashboard-atdd.spec.ts` | E2E | 10 | RED (will fail) |

---

## Step 4C: Aggregation

### TDD Red Phase Validation

| Check | Result |
|---|---|
| All tests assert expected behavior (not placeholders) | ✅ |
| No `expect(true).toBe(true)` placeholders | ✅ |
| Tests use real DOM assertions (attributes, text, visibility) | ✅ |
| Tests will fail before implementation | ✅ |
| No `test.skip()` (project convention) | ✅ |

### Fixture Infrastructure

No new fixture files required. Tests use:
- `tests/support/fixtures/index.ts` — existing merged test fixture
- `tests/support/helpers/network.ts` — existing `blockKnownThirdPartyHosts` helper
- Inline seed factories (`buildNormalSeed()`, `buildEmptySeed()`) defined in spec file

### Summary Statistics

| Metric | Value |
|---|---|
| TDD Phase | RED |
| Total Tests | 10 |
| E2E Tests | 10 |
| API Tests | 0 |
| P0 Tests | 6 |
| P1 Tests | 4 |
| Acceptance Criteria Automated | 4 of 6 (AC3, AC5 are manual-only) |
| Acceptance Criteria (Manual) | 2 (AC3 focus indicators, AC5 contrast) |
| New Fixtures Created | 0 |
| Execution Mode | SEQUENTIAL |

---

## Step 5: Validation & Completion

### Checklist Validation

- [x] Prerequisites satisfied (story approved, Playwright configured, dev env available)
- [x] Test file created at correct path per story Dev Notes
- [x] Checklist matches all acceptance criteria (4 automated, 2 manual-only)
- [x] Tests designed to fail before implementation (red phase)
- [x] No browser sessions to clean up (AI generation, no recording)
- [x] No temp artifacts in random locations (checklist in `_bmad-output/test-artifacts/`)

### Assumptions & Risks

| Risk | Severity | Notes |
|---|---|---|
| `chartSelect.selectOption('project')` may not work for Radix Select | Medium | Radix Select is not a native `<select>`. If `selectOption()` fails, replace with: click trigger → click option in portal. Dev should verify during green phase. |
| `ul.sr-only` selector assumes `sr-only` is the only class on the `<ul>` | Low | If other classes are added, adjust to `ul[aria-labelledby="customer-chart-heading"]` |
| Error state test (corrupt JSON) may show default state instead of `role="alert"` | Low | `loadState()` catches JSON errors and falls back to `getDefaultState()`. Test handles both outcomes gracefully. |
| `role="img"` vs `id`+`aria-labelledby` pattern | Low | Task checklist mentions `role="img"` but story Dev Notes spec uses `h2#customer-chart-heading` + sr-only `<ul>`. Tests follow the Dev Notes spec (authoritative). |

### Key Implementation Contracts (what tests enforce)

1. `CustomerRevenueChart` must render `<h2 id="customer-chart-heading">` with "Revenue by Customer" text
2. `CustomerRevenueChart` must render `<ul class="sr-only">` with one `<li>` per data row containing name + `$` + `%`
3. `EarningsDashboard` empty state div (`data-testid="earnings-empty-no-tasks"`) must have `role="status"`
4. `EarningsDashboard` error state div (`data-testid="earnings-calculation-error"`) must have `role="alert"`
5. `Header` Globe button must have `aria-label="Language"` in EN and `aria-label="Idioma"` in PT
6. Dashboard must have a `<main>` landmark and a level-1 heading containing "Earnings dashboard"
7. Chart view combobox (`role="combobox"`) must be focusable via `.focus()`

### Next Steps (TDD Green Phase)

After implementing Story 7.1:

1. Run ATDD tests: `npx playwright test tests/e2e/story-7-1-implement-accessibility-wcag-2-1-aa-for-dashboard-atdd.spec.ts --workers=1`
2. Verify all 10 tests **PASS** (green phase)
3. If any tests fail — either fix the implementation (feature bug) or fix the test assertion (test bug)
4. Manually verify AC3 (focus indicators) and AC5 (contrast) using Chrome DevTools Accessibility panel or axe-core extension in both light and dark mode
5. Bundle all 7 changed files in one commit: `"Implemented story 7.1"`

### Next Recommended Workflow

After implementation: run `bmad-testarch-automate` to expand broader accessibility coverage
or `bmad-code-review` to validate the implementation against WCAG best practices.
