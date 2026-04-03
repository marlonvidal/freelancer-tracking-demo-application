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
story_id: "1-2"
inputDocuments:
  - _bmad-output/implementation-artifacts/1-2-integrate-earnings-dashboard-into-main-navigation.md
  - _bmad/tea/config.yaml
  - playwright.config.ts
  - tests/support/fixtures/index.ts
  - tests/e2e/earnings-dashboard-route.spec.ts
  - src/components/NavLink.tsx
  - src/components/Header.tsx
---

# ATDD Checklist: Story 1.2 — Integrate Earnings Dashboard into Main Navigation

## Step 1 — Preflight and context

| Item | Result |
|------|--------|
| Stack | `frontend` (Vite + React; `playwright.config.ts` + Vitest in `package.json`) |
| Story | `_bmad-output/implementation-artifacts/1-2-integrate-earnings-dashboard-into-main-navigation.md` |
| Acceptance criteria | Loaded: AC1–AC5 + out-of-scope notes |
| TEA config | `tea_use_playwright_utils: true`, `tea_browser_automation: auto`, `test_stack_type: auto` |
| Prerequisites | Story has clear ACs; Playwright configured; dev server via `npm run dev` |

**Knowledge fragments (conceptually applied):** data-factories, component-tdd, test-quality, test-healing-patterns, selector-resilience, timing-debugging.

## Step 2 — Generation mode

- **Chosen:** AI generation (clear ACs, standard navigation; no complex UI recording required).
- **Recording:** Not used (`tea_browser_automation: auto`; selectors follow existing E2E patterns: `getByRole`, `blockKnownThirdPartyHosts`).

## Step 3 — Test strategy

| AC | Scenario | Level | Priority |
|----|-----------|--------|----------|
| AC1 | Header nav shows "Earnings" + "Board" links with i18n text (EN) | E2E | P0 |
| AC1 | Header nav shows translated links in Portuguese ("Ganhos", "Quadro") | E2E | P0 |
| AC2 | Clicking "Earnings" navigates to `/earnings` and renders EarningsDashboard | E2E | P0 |
| AC3 | Active "Earnings" link highlighted on `/earnings` | E2E | P1 |
| AC3 | Active "Board" link highlighted on `/` | E2E | P1 |
| AC4 | Clicking "Board" from `/earnings` returns to `/` without data loss | E2E | P0 |
| AC1+AC4 | Nav links present in header on `/earnings` page | E2E | P0 |
| AC5 | Nav links accessible at 320px viewport | E2E | P1 |
| — | API / contract | N/A | — (SPA-only story) |

**Red phase:** All automated scenarios are written with `test.skip()` until implementation exists.

## Step 4 — Generated artifacts (TDD red)

### API / contract tests

- **None.** Story 1.2 introduces no HTTP API or contract surface. SPA-only client navigation.

### E2E tests

- **File:** `tests/e2e/earnings-nav-integration.spec.ts`
- **Count:** 8 scenarios, all `test.skip()`:
  - `[P0]` header shows Earnings and Board navigation links (EN)
  - `[P0]` navigation links use translated text in Portuguese
  - `[P0]` clicking Earnings link navigates to /earnings and shows dashboard
  - `[P1]` active Earnings link is highlighted when on /earnings
  - `[P1]` active Board link is highlighted when on /
  - `[P0]` clicking Board link from /earnings returns to / without data loss
  - `[P0]` Earnings nav link is present on /earnings page header
  - `[P1]` navigation links are accessible at 320px viewport width

### Fixtures

- **None added.** Reuses `tests/support/fixtures` and `blockKnownThirdPartyHosts`.

### Machine-readable summary

- `_bmad-output/test-artifacts/atdd-summary-1-2.json`

## Step 4C — Aggregation notes

- Execution mode: **sequential** (single agent; no parallel subagents — SPA-only story with no API scope).
- TDD compliance: every E2E test body is wrapped in `test.skip(` … `)`.
- No placeholder assertions (`expect(true).toBe(true)`) found.

## Step 5 — Validation

- [x] Prerequisites satisfied (story + Playwright)
- [x] E2E file created at `tests/e2e/earnings-nav-integration.spec.ts`
- [x] Checklist maps to AC1–AC5
- [x] Tests are red-phase (skipped), not passing implementation checks
- [x] No orphaned Playwright CLI sessions
- [x] Artifacts under `_bmad-output/test-artifacts/`, not `/tmp`
- [x] Resilient selectors used (`getByRole`, `getByTestId`) — no CSS selectors or XPath
- [x] Follows existing project conventions (imports from `../support/fixtures`, uses `blockKnownThirdPartyHosts`)

## TDD green phase — next steps for implementers

1. Implement Story 1.2:
   - Add `earningsNavLink` and `boardNavLink` i18n keys to `LanguageContext.tsx`
   - Add navigation links to `Header.tsx` using `NavLink` component
   - Make `onAddTask` optional; conditionally render Kanban-specific controls
   - Add `Header` to `EarningsDashboard.tsx`
   - Add active link styling (underline, bold, or accent border)
   - Ensure responsive layout at 320px
2. Remove `test.skip(` … `)` from `earnings-nav-integration.spec.ts` one test at a time (or all at once after manual smoke).
3. Run `npx playwright test tests/e2e/earnings-nav-integration.spec.ts` and fix implementation or tests until green.
4. Active-state class assertion (`/active|font-bold|border-b|underline/`) may need adjustment to match the actual CSS class used in implementation.

## Completion summary

- **Tests added:** `tests/e2e/earnings-nav-integration.spec.ts` (8 skipped E2E tests).
- **Checklist:** this file (`_bmad-output/test-artifacts/atdd-checklist-1-2.md`).
- **Summary:** `_bmad-output/test-artifacts/atdd-summary-1-2.json`.
- **Risks / assumptions:** Active-link class regex (`/active|font-bold|border-b|underline/`) is broad — adjust after implementation finalizes the styling approach. Portuguese translations assume `earningsNavLink: "Ganhos"` and `boardNavLink: "Quadro"` as specified in the story. Viewport test at 320px assumes links remain visible (not hidden in a hamburger menu); if collapsed, the test may need to open the menu first.
- **Suggested next workflow:** implement Story 1.2 (`bmad-dev-story`), then unskip and run `bmad-testarch-automate` or expand coverage as needed.
