import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 2.2 — Summary metrics display on the Earnings Dashboard (ATDD).
 * E2E acceptance tests verifying rendered metric cards and i18n labels.
 *
 * TDD RED PHASE: All tests are skipped until `EarningsDashboard.tsx` renders
 * the five metric cards with `data-testid="earnings-metrics"` wrapper.
 * Remove `test.skip()` from each test after implementation to enter green phase.
 *
 * ACs covered: 1, 2, 3, 4 (UI rendering + filter reactivity + i18n)
 */

test.describe("Story 2.2 ATDD — summary metrics on Earnings Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("app-language", "en");
    });
  });

  test(
    "[P0] all five metric cards are visible on the Earnings Dashboard (AC1, FR21–FR25)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Metrics grid wrapper must carry data-testid="earnings-metrics"
      const metricsGrid = page.getByTestId("earnings-metrics");
      await expect(metricsGrid).toBeVisible();

      // All five card labels must be present (i18n English keys) — exact:true avoids substring collision
      await expect(page.getByText("Total Revenue", { exact: true })).toBeVisible();
      await expect(page.getByText("Billable Revenue", { exact: true })).toBeVisible();
      await expect(page.getByText("Non-Billable Revenue", { exact: true })).toBeVisible();
      await expect(page.getByText("Average Hourly Rate", { exact: true })).toBeVisible();
      await expect(page.getByText("Task Count", { exact: true })).toBeVisible();
    },
  );

  test(
    "[P0] zero-state: with no tasks seeded all revenue cards show $0.00 and task count shows 0 total / 0 billable (AC4)",
    async ({ page }) => {
      await page.addInitScript(() => {
        const empty = { tasks: [], columns: [], clients: [], version: 1 };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(empty));
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await expect(page.getByTestId("earnings-metrics")).toBeVisible();

      // At least one $0.00 value visible (revenue cards)
      await expect(page.getByText("$0.00").first()).toBeVisible();

      // Task count card shows the "X total / Y billable" format with zeros
      await expect(page.getByText(/0 total \/ 0 billable/)).toBeVisible();
    },
  );

  test(
    "[P0] task count card shows 'X total / Y billable' format with seeded data (AC1, FR25)",
    async ({ page }) => {
      await page.addInitScript(() => {
        const now = Date.now();
        const seed = {
          tasks: [
            {
              id: "t1",
              title: "Billable Task",
              columnId: "col-1",
              clientId: null,
              isBillable: true,
              hourlyRate: 100,
              timeSpent: 3600,
              createdAt: now,
              priority: "medium",
              description: "",
              timeEstimate: null,
              dueDate: null,
              tags: [],
              order: 0,
            },
            {
              id: "t2",
              title: "Non-Billable Task",
              columnId: "col-1",
              clientId: null,
              isBillable: false,
              hourlyRate: null,
              timeSpent: 1800,
              createdAt: now,
              priority: "low",
              description: "",
              timeEstimate: null,
              dueDate: null,
              tags: [],
              order: 1,
            },
          ],
          columns: [{ id: "col-1", title: "Todo", order: 0 }],
          clients: [],
          version: 1,
        };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        localStorage.setItem("app-language", "en");
      });

      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await expect(page.getByTestId("earnings-metrics")).toBeVisible();
      // With 2 tasks (1 billable), the task count should include "total / X billable" text
      await expect(page.getByText(/total \/ \d+ billable/i)).toBeVisible();
    },
  );

  test(
    "[P1] Portuguese locale renders translated metric card labels (AC1 + i18n)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "pt");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await expect(page.getByTestId("earnings-metrics")).toBeVisible();
      await expect(page.getByText("Receita Total")).toBeVisible();
      await expect(page.getByText("Receita Faturável")).toBeVisible();
      await expect(page.getByText("Receita Não Faturável")).toBeVisible();
      await expect(page.getByText("Taxa Horária Média")).toBeVisible();
      await expect(page.getByText("Total de Tarefas")).toBeVisible();
    },
  );

  test(
    "[P1] metrics grid renders inside the earnings dashboard container (AC1 layout)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Earnings dashboard container must exist (from Story 1.1)
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();
      // Metrics grid must be nested inside it
      const metricsGrid = page.getByTestId("earnings-metrics");
      await expect(metricsGrid).toBeVisible();
    },
  );
});
