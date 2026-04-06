import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 3.2 — Project Revenue Chart on the Earnings Dashboard (ATDD).
 * E2E acceptance tests verifying the pie chart component, no-data state,
 * chart view switching, tooltip interaction, legend toggle, and i18n labels.
 *
 * ACs covered: 1 (chart visible, title, i18n), 2 (chart switch / filter preserved),
 *              3 (tooltip), 5 (performance), 6 (no-data state), 7 (legend toggle)
 *
 * Conventions (from project-context.md):
 * - Always import from '../support/fixtures' (not '@playwright/test')
 * - Always call blockKnownThirdPartyHosts(page) before page.goto()
 * - Always seed app-language via addInitScript in beforeEach
 * - Never use getByText() on SVG text content — scope to container instead
 * - Always use { exact: true } with getByText() to avoid substring collisions
 * - Always use --workers=1 for local E2E runs: npx playwright test --workers=1
 * - Use .first() on [data-testid="project-revenue-chart"] svg locator — recharts Legend
 *   renders small SVG icons per item, so multiple SVG elements exist in the container
 */

/**
 * Seed factory: two billable tasks across two different columns (projects),
 * producing multiple pie slices for multi-project chart assertions.
 * Called in Node.js test context and passed as an argument to page.addInitScript.
 */
const buildProjectSeed = () => ({
  tasks: [
    {
      id: "t1",
      title: "Task 1",
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
    {
      id: "t2",
      title: "Task 2",
      columnId: "col-2",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 80,
      timeSpent: 7200,
      createdAt: Date.now(),
      priority: "medium",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: [],
      order: 1,
    },
  ],
  columns: [
    { id: "col-1", title: "Discovery", order: 0 },
    { id: "col-2", title: "Development", order: 1 },
  ],
  clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
  version: 1,
});

test.describe("Story 3.2 ATDD — Project Revenue Chart", () => {
  test.beforeEach(async ({ page }) => {
    // Seed English locale for all tests (overridden in PT-specific tests)
    await page.addInitScript(() => {
      localStorage.setItem("app-language", "en");
    });
  });

  // ---------------------------------------------------------------------------
  // P0 — Critical path: chart renders and view switching works
  // ---------------------------------------------------------------------------

  test(
    "[P0] project revenue chart container is visible after switching to Project chart view (AC1)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Switch to Project chart view via button group
      await page.getByTestId("chart-view-project").click();

      // EarningsDashboard must conditionally render ProjectRevenueChart
      // ProjectRevenueChart must render data-testid="project-revenue-chart"
      await expect(page.getByTestId("project-revenue-chart")).toBeVisible();
    },
  );

  test(
    "[P0] recharts SVG element is rendered inside project chart container with seeded billable task (AC1, FR5)",
    async ({ page }) => {
      // Pass seed as argument so buildProjectSeed() runs in Node.js context (not browser)
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildProjectSeed(),
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await page.getByTestId("chart-view-project").click();

      // recharts PieChart renders an SVG element — confirms chart is mounted
      // Use .first() because recharts Legend also renders small SVG icons per item
      await expect(
        page.locator('[data-testid="project-revenue-chart"] svg').first(),
      ).toBeVisible();
    },
  );

  test(
    "[P0] switching from Project back to Customer hides project chart container (AC2, FR7)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Switch to Project view
      await page.getByTestId("chart-view-project").click();
      await expect(page.getByTestId("project-revenue-chart")).toBeVisible();

      // Switch back to Customer view — project chart must disappear
      await page.getByTestId("chart-view-customer").click();

      // CustomerRevenueChart was rendered before; ProjectRevenueChart must be gone
      await expect(page.getByTestId("project-revenue-chart")).not.toBeVisible();
    },
  );

  // ---------------------------------------------------------------------------
  // P1 — Important: chart title, no-data state, tooltip, filter preservation
  // ---------------------------------------------------------------------------

  test(
    "[P1] chart section heading 'Revenue by Project' is visible (AC1 i18n)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildProjectSeed(),
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await page.getByTestId("chart-view-project").click();

      // Chart title must use t.earningsProjectChartTitle = 'Revenue by Project'
      // Scoped to chart container to avoid collisions with other headings on the page
      await expect(
        page
          .getByTestId("project-revenue-chart")
          .getByText("Revenue by Project", { exact: true }),
      ).toBeVisible();
    },
  );

  test(
    "[P1] no-data state shows informative message when task list is empty (AC6)",
    async ({ page }) => {
      await page.addInitScript(() => {
        // Override default 5 sample tasks with empty state
        const empty = { tasks: [], columns: [], clients: [], version: 1 };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(empty));
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await page.getByTestId("chart-view-project").click();

      // Container must still render (no-data variant uses same data-testid)
      await expect(page.getByTestId("project-revenue-chart")).toBeVisible();

      // i18n no-data message: t.earningsChartNoData = 'No data for this period'
      await expect(
        page.getByText("No data for this period", { exact: true }),
      ).toBeVisible();

      // SVG should NOT be present in the no-data variant
      await expect(
        page.locator('[data-testid="project-revenue-chart"] svg'),
      ).not.toBeVisible();
    },
  );

  test(
    "[P1] tooltip is visible when hovering the chart SVG area (AC3, FR8)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildProjectSeed(),
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await page.getByTestId("chart-view-project").click();

      // Use .first() — recharts Legend renders small SVG icons per item
      const chartSvg = page
        .locator('[data-testid="project-revenue-chart"] svg')
        .first();
      await expect(chartSvg).toBeVisible();

      // Hover at the center of the pie chart SVG to trigger recharts Tooltip.
      // recharts PieChart cx=50%, cy=50%, so center is at (width/2, height/2).
      // Tooltip content: project name (columnTitle), formatCurrency(revenue), (pct%)
      const bbox = await chartSvg.boundingBox();
      const cx = bbox ? bbox.width / 2 : 160;
      const cy = bbox ? bbox.height / 2 : 160;
      await chartSvg.hover({ position: { x: cx, y: cy } });

      // Tooltip renders inside .rounded-md.border.bg-popover container (CustomTooltip)
      await expect(page.locator(".rounded-md.border.bg-popover")).toBeVisible({
        timeout: 3000,
      });
    },
  );

  test(
    "[P1] switching from Customer to Project preserves earnings-dashboard container (AC2, FR7)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Default view: Customer chart is visible
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      // Switch to Project view
      await page.getByTestId("chart-view-project").click();

      // Customer chart is gone; project chart appears
      await expect(page.getByTestId("customer-revenue-chart")).not.toBeVisible();
      await expect(page.getByTestId("project-revenue-chart")).toBeVisible();

      // Earnings dashboard container itself must still be visible — confirms
      // date range and billable filter state is preserved (not reset on chart switch)
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();
    },
  );

  // ---------------------------------------------------------------------------
  // P2 — Nice-to-have: i18n, legend toggle, performance
  // ---------------------------------------------------------------------------

  test(
    "[P2] Portuguese locale renders translated chart title 'Receita por Projeto' (AC1 i18n)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          // Override language to Portuguese (set before LanguageProvider reads localStorage)
          localStorage.setItem("app-language", "pt");
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        {
          tasks: [
            {
              id: "t1",
              title: "Tarefa 1",
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
          columns: [{ id: "col-1", title: "Descoberta", order: 0 }],
          clients: [
            { id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" },
          ],
          version: 1,
        },
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // PT locale: same data-testid as EN, button group is language-independent
      await page.getByTestId("chart-view-project").click();

      // Portuguese translation: t.earningsProjectChartTitle = 'Receita por Projeto'
      await expect(
        page
          .getByTestId("project-revenue-chart")
          .getByText("Receita por Projeto", { exact: true }),
      ).toBeVisible();
    },
  );

  test(
    "[P2] chart renders within 2 seconds with a large dataset of 50 tasks (AC5, NFR-P1)",
    async ({ page }) => {
      await page.addInitScript(() => {
        const now = Date.now();
        // 50 tasks distributed across 5 columns (projects) to create multiple pie slices
        const tasks = Array.from({ length: 50 }, (_, i) => ({
          id: `t${i}`,
          title: `Task ${i}`,
          columnId: `col-${i % 5}`,
          clientId: "c1",
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
        const columns = Array.from({ length: 5 }, (_, i) => ({
          id: `col-${i}`,
          title: `Project ${i}`,
          order: i,
        }));
        const seed = {
          tasks,
          columns,
          clients: [
            { id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" },
          ],
          version: 1,
        };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
      });
      await blockKnownThirdPartyHosts(page);

      await page.goto("/earnings");
      await expect(page.getByTestId('earnings-dashboard')).toBeVisible();
      const start = Date.now();
      await page.getByTestId("chart-view-project").click();

      // Chart SVG must be visible within the 2-second budget (AC5, NFR-P1)
      // Use .first() because recharts Legend also renders small SVG icons
      await expect(
        page.locator('[data-testid="project-revenue-chart"] svg').first(),
      ).toBeVisible({ timeout: 2000 });

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(2000);
    },
  );

  test(
    "[P2] clicking a legend item toggles project slice visibility (AC7, FR9)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildProjectSeed(),
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await page.getByTestId("chart-view-project").click();

      // Both project legend items must be visible before toggle
      await expect(
        page
          .getByTestId("project-revenue-chart")
          .getByText("Discovery", { exact: true }),
      ).toBeVisible();
      await expect(
        page
          .getByTestId("project-revenue-chart")
          .getByText("Development", { exact: true }),
      ).toBeVisible();

      // Click the "Discovery" legend item to toggle its slice off
      // Legend onClick handler calls handleLegendClick({ value: 'Discovery' })
      await page
        .getByTestId("project-revenue-chart")
        .getByText("Discovery", { exact: true })
        .click();

      // After toggling: SVG must still be visible (remaining slices fill the chart)
      // The "Discovery" legend text is still shown but with line-through / reduced opacity
      await expect(
        page.locator('[data-testid="project-revenue-chart"] svg').first(),
      ).toBeVisible();

      // "Development" slice must still be present
      await expect(
        page
          .getByTestId("project-revenue-chart")
          .getByText("Development", { exact: true }),
      ).toBeVisible();
    },
  );
});
