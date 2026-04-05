## Deferred from: code review of 1-1-set-up-earnings-route-and-earnings-dashboard-component.md (2026-04-03)

- **NFR-P5 E2E timing** — Playwright test bounds `page.goto('/earnings')` with `Date.now()` &lt; 1000 ms; may flake on slow runners. Consider soft thresholds, retries, or dropping timing assertion from default CI if noisy.

## Deferred from: code review of 2-1-implement-earnings-calculation-utilities.md (2026-04-05)

- **package-lock.json peer metadata churn** — Lockfile shows widespread `peer: true` / removal diffs typical of npm version churn; not a functional change to Story 2.1 earnings logic. Revisit only if dependency graph audits require a clean lockfile pass.

- **`getTotalRevenue` uses all tasks, no dashboard date range** — Pre-existing `AppContext` behavior: totals sum every task via `getTaskRevenue`. Story 2.1 adds filtered aggregations for Epic 2+; aligning global dashboard totals with persisted date filters would be a separate story/product decision.

## Deferred from: Epic 1 retro action item A4 (carried through Epic 2, not addressed)

- **Header `t` variable shadowing** — `Header.tsx` shadows the `t` translation variable; pre-existing, low severity. Address when `Header.tsx` is next edited.
- **Lazy metrics computation** — Optional revenue aggregates computed on earnings page even when stats panel is hidden; minor performance pre-optimization. Address if profiling confirms cost.

## Deferred from: code review of 2-2-implement-summary-metrics-calculations.md (2026-04-05)

- **`getTaskBillableRevenue` called for non-billable tasks in metrics loop** — In `calculateSummaryMetrics`, `getTaskBillableRevenue` is called for every filtered task but the result is used only if `task.isBillable`. For non-billable tasks the call returns 0 and is discarded. Harmless micro-inefficiency consistent with the spec skeleton; revisit if profiling shows cost.

- **Negative `timeSpent` produces negative `averageHourlyRate`** — No guard exists for corrupt negative `timeSpent` values; this would yield a negative average hourly rate. Pre-existing data integrity concern out of story scope; a future data-validation story or input sanitization should address this.
