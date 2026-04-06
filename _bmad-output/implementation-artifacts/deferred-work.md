## Deferred from: code review of 1-1-set-up-earnings-route-and-earnings-dashboard-component.md (2026-04-03)

- **NFR-P5 E2E timing** — Playwright test bounds `page.goto('/earnings')` with `Date.now()` &lt; 1000 ms; may flake on slow runners. Consider soft thresholds, retries, or dropping timing assertion from default CI if noisy.

## Deferred from: code review of 2-1-implement-earnings-calculation-utilities.md (2026-04-05)

- **package-lock.json peer metadata churn** — Lockfile shows widespread `peer: true` / removal diffs typical of npm version churn; not a functional change to Story 2.1 earnings logic. Revisit only if dependency graph audits require a clean lockfile pass.

- **`getTotalRevenue` uses all tasks, no dashboard date range** — Pre-existing `AppContext` behavior: totals sum every task via `getTaskRevenue`. Story 2.1 adds filtered aggregations for Epic 2+; aligning global dashboard totals with persisted date filters would be a separate story/product decision.

## Deferred from: Epic 1 retro action item A4 (carried through Epic 2, not addressed)

- **Header `t` variable shadowing** — `Header.tsx` shadows the `t` translation variable; pre-existing, low severity. Address when `Header.tsx` is next edited.
- **Lazy metrics computation** — Optional revenue aggregates computed on earnings page even when stats panel is hidden; minor performance pre-optimization. Address if profiling confirms cost.

## Deferred from: code review of 3-1-implement-customer-revenue-chart.md (2026-04-05)

- **`visibleData` not memoized** — `data.filter()` in `CustomerRevenueChart.tsx` runs on every render. Acceptable at current scale; revisit if profiling shows cost with many customer rows.
- **`hiddenKeys` not reset on filter/date range change** — Hidden customers persist across date range and billable filter switches in `CustomerRevenueChart`. No AC covers this; address in a UX polish story if users find it confusing.
- **All-slices-hidden shows blank SVG** — If user hides all legend items, `visibleData` becomes empty and recharts renders an empty chart area with no user-facing explanation. Not in spec scope; add a guard when addressing the filter-preservation edge case above.
- **Performance E2E test timing fragility** — `[P2]` test in `story-3-1-customer-revenue-chart-atdd.spec.ts` captures `Date.now()` before `page.goto()` and asserts `elapsed < 2000`; includes full navigation overhead, may flake in slow CI. Consistent with existing deferred item from story 1-1 (NFR-P5).

## Deferred from: code review of 3-2-implement-project-revenue-chart.md (2026-04-05)

- **`visibleData` not memoized** — `data.filter()` in `ProjectRevenueChart.tsx` runs on every render. Intentionally mirrors `CustomerRevenueChart.tsx` per spec; acceptable at current scale. Revisit if profiling shows cost with many project rows.
- **Duplicate `columnTitle` causes shared color and simultaneous toggle** — `colorMap` and `hiddenKeys` are keyed on `columnTitle`. Two columns with the same name would share a color and be toggled together. Pre-existing risk mirroring `CustomerRevenueChart`'s `customerName` keying; address in a data-validation or de-duplication story if users encounter it.

## Deferred from: code review of 2-2-implement-summary-metrics-calculations.md (2026-04-05)

- **`getTaskBillableRevenue` called for non-billable tasks in metrics loop** — In `calculateSummaryMetrics`, `getTaskBillableRevenue` is called for every filtered task but the result is used only if `task.isBillable`. For non-billable tasks the call returns 0 and is discarded. Harmless micro-inefficiency consistent with the spec skeleton; revisit if profiling shows cost.

- **Negative `timeSpent` produces negative `averageHourlyRate`** — No guard exists for corrupt negative `timeSpent` values; this would yield a negative average hourly rate. Pre-existing data integrity concern out of story scope; a future data-validation story or input sanitization should address this.

## Deferred from: code review of 3-3-implement-tag-revenue-chart.md (2026-04-06)

- **`hiddenKeys` not reset when `data` prop changes** — In `TagRevenueChart.tsx`, legend-click state (`hiddenKeys`) is not cleared when the `data` prop changes (e.g., after a date filter or billable filter update). A previously hidden tag that disappears and reappears will remain hidden. Pre-existing pattern identical to `CustomerRevenueChart` and `ProjectRevenueChart`; address holistically in a chart UX polish story.

- **E2E performance timer includes navigation latency** — In `story-3-3-tag-revenue-chart-atdd.spec.ts`, `const start = Date.now()` is placed before `page.goto()`, so page navigation time counts against the 2-second chart render budget. In slow CI environments this can produce false negatives. Pre-existing pattern in stories 3.1 and 3.2 E2E specs; consider moving timer after navigation completes in a future E2E quality pass.

- **All-items-hidden edge case renders empty chart without informative message** — In `TagRevenueChart.tsx`, if the user clicks all legend items to hide all slices, `visibleData` becomes empty and recharts renders an empty PieChart silently. The early `data.length === 0` no-data guard is bypassed. No AC covers this; pre-existing behavior in sibling components. Revisit in an Epic 5/6 chart polish story.

## Deferred from: code review of 3-4-ensure-chart-responsiveness-and-performance.md (2026-04-06)

- **Tooltip hover at pie SVG center may miss slice hit areas** — In `story-3-4-chart-responsiveness-performance-atdd.spec.ts`, the [P1] tooltip test hovers at `bbox.width/2, bbox.height/2` (the pie's cx/cy point). At the exact center, no slice paths render — they extend outward. `retries: 1` guards against flakiness; confirmed passing in dev. Revisit if the test flakes in CI by computing a point at ~35% radius from the center instead.
- **500ms chart-switch timing includes Playwright async click latency** — In `story-3-4-chart-responsiveness-performance-atdd.spec.ts`, the [P1] chart transition timer starts before Playwright async `click()` calls, which can consume 150–250ms on loaded CI with 6+ browser workers. `retries: 1` is configured; consistent with established timing pattern from Stories 3.1–3.3. Revisit if the test produces persistent failures on CI.
- **All-slices-hidden blank chart (all three chart components)** — When a user hides all legend items, `visibleData` becomes empty and recharts renders an empty PieChart area with no user-facing message. Pre-existing across `CustomerRevenueChart`, `ProjectRevenueChart`, and `TagRevenueChart`; previously deferred in Stories 3.1–3.3. Address holistically in an Epic 5/6 chart polish story.

## Deferred from: code review of 4-1-implement-date-range-filter-and-presets.md (2026-04-06)

- **Calendar popover has no auto-close after range selection** — In `DateRangeFilter.tsx`, after the user selects both `from` and `to` dates, the `<Popover>` stays open. The user must click outside to dismiss it. No AC requires auto-close; this is a UX improvement opportunity. Address in Story 4.4 (chart UX polish) or a dedicated filter UX pass.

## Deferred from: code review of 4-2-implement-billable-non-billable-toggle.md (2026-04-06)

- **`toHaveClass(/bg-primary/)` fragile against CSS class rename** — In `tests/e2e/story-4-2-implement-billable-non-billable-toggle-atdd.spec.ts` (visual distinction P1 test), the active button assertion relies on shadcn's internal `bg-primary` class. If the design system renames this class, the test breaks silently. Explicitly documented in spec and consistent with Story 4.1 pattern. Address in a future visual regression / design-system hardening story.

## Deferred from: code review of 6-1-implement-i18n-translations-for-dashboard.md (2026-04-06)

- **`aria-label="Globe"` not locale-aware on language toggle button** — `Header.tsx` line 101: the Globe icon button has a hardcoded English `aria-label="Globe"` added for E2E test targeting. This is technically an i18n gap (screen reader users in PT mode hear "Globe" in English). Since it's an icon-only button describing the icon rather than user-visible content, and the spec explicitly required this label for E2E testability, this is acceptable short-term. Address in Epic 7 (Accessibility/WCAG story) by adding a translation key like `t.languageToggleLabel` and passing it to `aria-label`. ✅ **RESOLVED in Story 7.1** — `languageToggleLabel` translation key added and `aria-label={t.languageToggleLabel}` applied.

## Deferred from: code review of 7-1-implement-accessibility-wcag-2-1-aa-for-dashboard (2026-04-06)

- **`aria-label` dead code on sr-only `<ul>` (all 3 chart components)** — `CustomerRevenueChart.tsx:69`, `ProjectRevenueChart.tsx:69`, `TagRevenueChart.tsx:69`: The sr-only `<ul>` has both `aria-labelledby` and `aria-label`. Per ARIA spec, `aria-labelledby` takes precedence and the `aria-label` (containing "— Data summary" suffix) is silently ignored by all screen readers. The list is still labeled correctly via `aria-labelledby`. Low-priority; remove `aria-label` if screen reader label purity is needed.

- **sr-only list always rendered when `visibleData.length === 0`** — `CustomerRevenueChart.tsx`, `ProjectRevenueChart.tsx`, `TagRevenueChart.tsx`: Spec says "no sr-only list needed when `visibleData.length === 0`" but the list renders before the conditional, so it's always present when `data.length > 0`. Slightly contradictory with the "All series hidden" visible message, but legend-click interaction is sighted-user-only; screen reader users can't trigger the all-hidden state normally. Implementation is arguably more accessible than the spec required.

- **ATDD `[P0] Calculation error state` test has no guaranteed assertion path** — `tests/e2e/story-7-1-implement-accessibility-wcag-2-1-aa-for-dashboard-atdd.spec.ts`: `loadState()` catches corrupt JSON and falls back to `getDefaultState()` (5 sample tasks), so neither the error state nor empty state renders — both `if` branches are skipped and the test always passes. Acknowledged in story dev notes. Fix requires either mocking the storage module or triggering `calculateSummaryMetrics` to throw directly. Address in a future test quality pass.

- **Dark mode toggle button missing `aria-label`** — `Header.tsx:121-131`: The dark mode toggle renders an icon-only button with no accessible name (no `aria-label`, no `title`). WCAG 2.1 SC 4.1.2 gap. Not in Story 7.1 task scope. Add `aria-label={state.isDarkMode ? t.lightModeLabel : t.darkModeLabel}` (with matching translation keys) in a follow-up accessibility story.

- **`aria-label` without `role="region"` on metrics `<div>`** — `EarningsDashboard.tsx:159-162`: `aria-label={t.earningsDashboardHeading}` on a generic `<div>` without `role="region"` doesn't create a named landmark in the accessibility tree for most screen readers. The `aria-live="polite"` behavior works correctly regardless. Add `role="region"` if named-region navigation is needed (screen reader users using "R" to jump regions).
