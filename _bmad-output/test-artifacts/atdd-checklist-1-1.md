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
story_id: "1-1"
inputDocuments:
  - _bmad-output/implementation-artifacts/1-1-set-up-earnings-route-and-earnings-dashboard-component.md
  - _bmad/tea/config.yaml
  - playwright.config.ts
  - tests/support/fixtures/index.ts
  - tests/e2e/example.spec.ts
---

# ATDD Checklist: Story 1.1 — `/earnings` route and EarningsDashboard

## Step 1 — Preflight and context

| Item | Result |
|------|--------|
| Stack | `frontend` (Vite + React; `playwright.config.ts` + Vitest in `package.json`) |
| Story | `_bmad-output/implementation-artifacts/1-1-set-up-earnings-route-and-earnings-dashboard-component.md` |
| Acceptance criteria | Loaded: AC1–AC3 + out-of-scope notes |
| TEA config | `tea_use_playwright_utils: true`, `tea_browser_automation: auto`, `test_stack_type: auto` |
| Prerequisites | Story has clear ACs; Playwright configured; dev server via `npm run dev` |

**Knowledge fragments (conceptually applied):** data-factories, component-tdd, test-quality, test-healing-patterns, selector-resilience, timing-debugging (per workflow; not pasted in full here).

## Step 2 — Generation mode

- **Chosen:** AI generation (clear ACs, standard navigation; no complex UI recording required).
- **Recording:** Not used (`tea_browser_automation: auto`; selectors follow existing E2E patterns: `getByRole`, `blockKnownThirdPartyHosts`).

## Step 3 — Test strategy

| AC | Scenario | Level | Priority |
|----|-----------|--------|----------|
| AC1 | `/earnings` shows dashboard shell; H1 + `document.title` reflect earnings | E2E | P0 |
| AC2 | From `/`, visit `/earnings`, back to `/`; `freelancer-kanban-data` unchanged | E2E | P0 |
| AC3 | First navigation to `/earnings` completes in < 1s | E2E | P1 |
| — | API / contract | N/A | — (SPA-only story) |

**Red phase:** All automated scenarios are written with `test.skip()` until implementation exists.

## Step 4 — Generated artifacts (TDD red)

### API / contract tests

- **None.** Story 1.1 introduces no HTTP API or Pact consumer surface. Subagent 4A scope is empty by design.

### E2E tests

- **File:** `tests/e2e/earnings-dashboard-route.spec.ts`
- **Count:** 3 scenarios, all `test.skip()`:
  - `[P0]` earnings heading + tab title
  - `[P0]` back navigation + `freelancer-kanban-data` preservation
  - `[P1]` NFR-P5 navigation timing

### Fixtures

- **None added.** Reuses `tests/support/fixtures` and `blockKnownThirdPartyHosts`.

### Machine-readable summary

- `_bmad-output/test-artifacts/atdd-summary-1-1.json`

## Step 4C — Aggregation notes

- Execution mode: **sequential** (single agent; no parallel subagents in this environment).
- TDD compliance: every E2E test body is wrapped in `test.skip(` … `)`.

## Step 5 — Validation

- [x] Prerequisites satisfied (story + Playwright)
- [x] E2E file created at `tests/e2e/earnings-dashboard-route.spec.ts`
- [x] Checklist maps to AC1–AC3
- [x] Tests are red-phase (skipped), not passing implementation checks
- [x] No orphaned Playwright CLI sessions
- [x] Artifacts under `_bmad-output/test-artifacts/`, not `/tmp`

## TDD green phase — next steps for implementers

1. Implement Story 1.1 (`App.tsx` route, `EarningsDashboard.tsx`, `LanguageContext` keys, `document.title` restore on unmount).
2. Remove `test.skip(` … `)` from `earnings-dashboard-route.spec.ts` one test at a time (or all at once after manual smoke).
3. Run `npm run test:e2e` (or targeted file) and fix implementation or tests until green.
4. If heading/title copy differs from `/earnings/i`, update matchers to match finalized `en` (and add a `[P2]` PT scenario if desired, using `app-language` in `localStorage`).

## Completion summary

- **Tests added:** `tests/e2e/earnings-dashboard-route.spec.ts` (3 skipped E2E tests).
- **Checklist:** this file.
- **Risks / assumptions:** English matchers assume translated heading/title contain “earnings”; adjust after i18n keys are finalized. Performance test depends on dev machine load; NFR-P5 is best-effort in CI.
- **Suggested next workflow:** implement Story 1.1 (`bmad-quick-dev` / dev agent), then unskip and run `bmad-testarch-automate` or expand coverage as needed.
