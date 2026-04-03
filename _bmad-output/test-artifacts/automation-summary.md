---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-identify-targets
  - step-03b-subagent-e2e
  - step-03c-aggregate
  - step-04-validate-and-summarize
lastStep: step-04-validate-and-summarize
lastSaved: '2026-04-03'
inputDocuments:
  - _bmad-output/implementation-artifacts/spec-add-new-customer-inline.md
  - _bmad/tea/config.yaml
  - playwright.config.ts
  - tests/support/fixtures/index.ts
  - tests/support/helpers/network.ts
---

# Test Automation Summary — Add New Client Inline

**Feature spec:** `_bmad-output/implementation-artifacts/spec-add-new-customer-inline.md`  
**Generated:** 2026-04-03  
**Stack:** frontend (React SPA, Playwright E2E)  
**Execution mode:** sequential

---

## Coverage Plan

| Scenario | AC | Priority | Test Level |
|---|---|---|---|
| "+ Add new client" opens AddClientDialog without closing task dialog | AC1 | P0 | E2E |
| Save new client → auto-selected, task dialog remains open | AC2 | P0 | E2E |
| Create client from TaskDetailPanel → task updated immediately | AC5 | P0 | E2E |
| Empty name disables Save button | AC4 | P1 | E2E |
| Cancel reverts client selection | AC3 | P1 | E2E |
| Empty hourly rate defaults to $0/hr | Edge | P1 | E2E |
| Closing AddTaskDialog also closes AddClientDialog | Edge | P2 | E2E |
| Portuguese labels render correctly | AC6 | P2 | E2E |

**API tests:** N/A — pure client-side SPA with localStorage; no network API to contract-test.

---

## Generated Files

| File | Tests | Priority Coverage |
|---|---|---|
| `tests/e2e/add-client-inline.spec.ts` | 8 | P0: 3, P1: 3, P2: 2 |

**Total:** 8 E2E tests across 1 file.

---

## Key Assumptions & Design Decisions

1. **Selector strategy for client combobox:** Radix `SelectTrigger` renders as `role="combobox"`. The AddTask dialog has three comboboxes (Column, Client, Priority) in that order — client is accessed by `.nth(1)`. This is fragile if the dialog layout changes; adding a `data-testid="client-select"` to the SelectTrigger in `AddTaskDialog.tsx` would make the selector resilient long-term.

2. **localStorage reset:** Tests call `page.addInitScript(() => localStorage.removeItem('freelancer-kanban-data'))` to start from the default seeded state (2 clients, 5 tasks). This avoids ordering dependencies between tests.

3. **TaskDetailPanel selector:** The panel is located via `.locator(".fixed.right-0")`. Adding a `data-testid="task-detail-panel"` to the panel's root `motion.div` would improve resilience.

4. **No API subagent:** The app has no backend. The `ADD_CLIENT` reducer action is exercised through E2E flow; pure reducer unit tests could be added separately if reducer coverage becomes a concern.

5. **Language test:** The PT test navigates the language menu by clicking the Globe button. If the Globe button gains an accessible name in the future, the `name: /globe|language/i` selector will adapt.

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `nth(1)` combobox index breaks if dialog field order changes | Medium | Add `data-testid="client-select"` to the SelectTrigger |
| `.fixed.right-0` panel selector breaks if layout changes | Low | Add `data-testid="task-detail-panel"` |
| Radix portal-rendered options may render outside dialog scope | Low | Options queried from `page` not dialog scope (correct Playwright pattern) |

---

## Recommended Next Steps

- **Add `data-testid` attributes** to `AddTaskDialog`'s client SelectTrigger and `TaskDetailPanel`'s root element for selector resilience.
- Run `npm run test:e2e` to execute tests against the dev server.
- Consider running `bmad-testarch-test-review` to validate test quality.
- Consider `bmad-testarch-trace` to generate a traceability matrix linking these tests to the spec's acceptance criteria.
