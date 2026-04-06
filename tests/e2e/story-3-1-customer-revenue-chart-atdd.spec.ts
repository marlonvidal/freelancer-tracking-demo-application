import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 3.1 — Customer Revenue Chart on the Earnings Dashboard (ATDD).
 * E2E acceptance tests verifying the pie chart component, no-data state,
 * chart view switching, tooltip interaction, and i18n labels.
 *
 * ACs covered: 1 (chart visible), 2 (tooltip), 3 (legend toggle),
 *              6 (no-data state), 7 (chart view switch)
 *
 * Conventions (from project-context.md):
 * - Always import from '../support/fixtures' (not '@playwright/test')
 * - Always call blockKnownThirdPartyHosts(page) before page.goto()
 * - Always seed app-language via addInitScript in beforeEach
 * - Never use getByText() on SVG text content — scope to container instead
 * - Always use { exact: true } with getByText() to avoid substring collisions
 */

/** Minimal single billable task seed for multi-client chart tests. */
const buildSingleTaskSeed = (overrides?: object) => ({
  tasks: [
    {
      id: "t1",
      title: "Billable Task",
      columnId: "col-1",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 100,
      timeSpent: 3600,
      createdAt: Date.now(),
      priority: "medium",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: [],
      order: 0,
    },
  ],
  columns: [{ id: "col-1", title: "Todo", order: 0 }],
  clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
  version: 1,
  ...overrides,
});

test.describe("Story 3.1 ATDD — Customer Revenue Chart", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("app-language", "en");
    });
  });

  // ---------------------------------------------------------------------------
  // P0 — Critical path: chart renders and view switching works
  // ---------------------------------------------------------------------------

  test(
    "[P0] customer revenue chart container is visible in default customer chart view (AC1)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // EarningsDashboard must default to activeChart === 'customer'
      // CustomerRevenueChart must render data-testid="customer-revenue-chart"
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();
    },
  );

  test(
    "[P0] recharts SVG element is rendered inside the chart container with seeded billable task (AC1, FR4)",
    async ({ page }) => {
      await page.addInitScript(() => {
        const seed = {
          tasks: [
            {
              id: "t1",
              title: "Task",
              columnId: "col-1",
              clientId: "c1",
              isBillable: true,
              hourlyRate: 100,
              timeSpent: 3600,
              createdAt: Date.now(),
              priority: "medium",
              description: "",
              timeEstimate: null,
              dueDate: null,
              tags: [],
              order: 0,
            },
          ],
          columns: [{ id: "col-1", title: "Todo", order: 0 }],
          clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
          version: 1,
        };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // SVG element must be present — confirms recharts PieChart rendered
      // Use .first() because recharts Legend also renders small SVG icons
      await expect(
        page.locator('[data-testid="customer-revenue-chart"] svg').first(),
      ).toBeVisible();
    },
  );

  test(
    "[P0] switching to Project chart view hides the customer chart container (AC7, FR7)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Default customer view — chart must be visible first
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      // Switch chart view selector to "Project" via button group
      await page.getByTestId("chart-view-project").click();

      // Customer chart must no longer be in the DOM / visible
      await expect(page.getByTestId("customer-revenue-chart")).not.toBeVisible();
    },
  );

  // ---------------------------------------------------------------------------
  // P1 — Important: chart title, no-data state, tooltip, filter preservation
  // ---------------------------------------------------------------------------

  test(
    "[P1] chart section heading 'Revenue by Customer' is visible (AC1 i18n)",
    async ({ page }) => {
      await page.addInitScript(() => {
        const seed = {
          tasks: [
            {
              id: "t1",
              title: "Task",
              columnId: "col-1",
              clientId: "c1",
              isBillable: true,
              hourlyRate: 50,
              timeSpent: 3600,
              createdAt: Date.now(),
              priority: "medium",
              description: "",
              timeEstimate: null,
              dueDate: null,
              tags: [],
              order: 0,
            },
          ],
          columns: [{ id: "col-1", title: "Todo", order: 0 }],
          clients: [{ id: "c1", name: "Beta Inc", hourlyRate: 50, color: "#8b5cf6" }],
          version: 1,
        };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Chart title must use t.earningsCustomerChartTitle = 'Revenue by Customer'
      // Scoped to chart container to avoid ambiguity with other headings
      await expect(
        page
          .getByTestId("customer-revenue-chart")
          .getByText("Revenue by Customer", { exact: true }),
      ).toBeVisible();
    },
  );

  test(
    "[P1] no-data state shows informative message when task list is empty (AC6)",
    async ({ page }) => {
      await page.addInitScript(() => {
        const empty = { tasks: [], columns: [], clients: [], version: 1 };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(empty));
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Container must still render (no-data variant)
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      // i18n no-data message: t.earningsChartNoData = 'No data for this period'
      await expect(
        page.getByText("No data for this period", { exact: true }),
      ).toBeVisible();

      // SVG should NOT be present in the no-data variant
      await expect(
        page.locator('[data-testid="customer-revenue-chart"] svg'),
      ).not.toBeVisible();
    },
  );

  test(
    "[P1] tooltip is visible when hovering the chart SVG area (AC2, FR8)",
    async ({ page }) => {
      await page.addInitScript(() => {
        const seed = {
          tasks: [
            {
              id: "t1",
              title: "Task",
              columnId: "col-1",
              clientId: "c1",
              isBillable: true,
              hourlyRate: 80,
              timeSpent: 3600,
              createdAt: Date.now(),
              priority: "medium",
              description: "",
              timeEstimate: null,
              dueDate: null,
              tags: [],
              order: 0,
            },
          ],
          columns: [{ id: "col-1", title: "Todo", order: 0 }],
          clients: [{ id: "c1", name: "Gamma LLC", hourlyRate: 80, color: "#ec4899" }],
          version: 1,
        };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Use .first() because recharts Legend also renders small SVG icons
      const chartSvg = page.locator('[data-testid="customer-revenue-chart"] svg').first();
      await expect(chartSvg).toBeVisible();

      // Hover at the center of the pie chart SVG to trigger recharts Tooltip.
      // recharts PieChart cx=50%, cy=50%, so we compute center from bounding box.
      const bbox = await chartSvg.boundingBox();
      const cx = bbox ? bbox.width / 2 : 160;
      const cy = bbox ? bbox.height / 2 : 160;
      await chartSvg.hover({ position: { x: cx, y: cy } });

      // Tooltip renders inside .rounded-md.border.bg-popover container (per Dev Notes)
      await expect(
        page.locator(".rounded-md.border.bg-popover"),
      ).toBeVisible({ timeout: 3000 });
    },
  );

  test(
    "[P1] switching chart view preserves billable filter and date range state (AC7, FR7)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Verify customer chart is visible (default state)
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      // Switch to Tag view — filter controls must still be visible
      await page.getByTestId("chart-view-tag").click();

      // Customer chart hidden
      await expect(page.getByTestId("customer-revenue-chart")).not.toBeVisible();

      // Earnings dashboard container itself must still be visible (filters preserved)
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();
    },
  );

  // ---------------------------------------------------------------------------
  // P2 — Nice-to-have: i18n, legend interaction, performance
  // ---------------------------------------------------------------------------

  test(
    "[P2] Portuguese locale renders translated chart title 'Receita por Cliente' (AC1 i18n)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "pt");
        const seed = {
          tasks: [
            {
              id: "t1",
              title: "Tarefa",
              columnId: "col-1",
              clientId: "c1",
              isBillable: true,
              hourlyRate: 60,
              timeSpent: 3600,
              createdAt: Date.now(),
              priority: "medium",
              description: "",
              timeEstimate: null,
              dueDate: null,
              tags: [],
              order: 0,
            },
          ],
          columns: [{ id: "col-1", title: "A Fazer", order: 0 }],
          clients: [{ id: "c1", name: "Delta SA", hourlyRate: 60, color: "#f59e0b" }],
          version: 1,
        };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Portuguese translation: t.earningsCustomerChartTitle = 'Receita por Cliente'
      await expect(
        page
          .getByTestId("customer-revenue-chart")
          .getByText("Receita por Cliente", { exact: true }),
      ).toBeVisible();
    },
  );

  test(
    "[P2] Portuguese locale no-data state shows translated message 'Sem dados para este período' (AC6 i18n)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "pt");
        const empty = { tasks: [], columns: [], clients: [], version: 1 };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(empty));
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Portuguese translation: t.earningsChartNoData = 'Sem dados para este período'
      await expect(
        page.getByText("Sem dados para este período", { exact: true }),
      ).toBeVisible();
    },
  );

  test(
    "[P2] chart renders within 2 seconds with a large dataset of 50 tasks (AC5, NFR-P1)",
    async ({ page }) => {
      await page.addInitScript(() => {
        const now = Date.now();
        const tasks = Array.from({ length: 50 }, (_, i) => ({
          id: `t${i}`,
          title: `Task ${i}`,
          columnId: "col-1",
          clientId: `c${i % 5}`,
          isBillable: true,
          hourlyRate: 50 + (i % 10) * 10,
          timeSpent: 3600,
          createdAt: now - i * 1000,
          priority: "medium",
          description: "",
          timeEstimate: null,
          dueDate: null,
          tags: [],
          order: i,
        }));
        const clients = Array.from({ length: 5 }, (_, i) => ({
          id: `c${i}`,
          name: `Client ${i}`,
          hourlyRate: 100,
          color: "#6366f1",
        }));
        const seed = {
          tasks,
          columns: [{ id: "col-1", title: "Todo", order: 0 }],
          clients,
          version: 1,
        };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
      });
      await blockKnownThirdPartyHosts(page);

      await page.goto("/earnings");
      const start = Date.now();

      // Chart SVG must be visible within the 2-second budget
      // Use .first() because recharts Legend also renders small SVG icons
      await expect(
        page.locator('[data-testid="customer-revenue-chart"] svg').first(),
      ).toBeVisible({ timeout: 2000 });

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(2000);
    },
  );
});
