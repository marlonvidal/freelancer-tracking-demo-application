## Deferred from: code review of 1-1-set-up-earnings-route-and-earnings-dashboard-component.md (2026-04-03)

- **NFR-P5 E2E timing** — Playwright test bounds `page.goto('/earnings')` with `Date.now()` &lt; 1000 ms; may flake on slow runners. Consider soft thresholds, retries, or dropping timing assertion from default CI if noisy.
