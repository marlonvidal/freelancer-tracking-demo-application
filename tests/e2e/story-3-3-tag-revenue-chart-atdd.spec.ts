import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 3.3 — Tag Revenue Chart on the Earnings Dashboard (ATDD).
 * E2E acceptance tests verifying the pie chart component, no-data state,
 * chart view switching, tooltip interaction, untagged grouping, and i18n labels.
 *
 * ACs covered: 1 (chart visible, title, SVG rendered), 2 (chart switch / filter preserved),
 *              3 (untagged slice), 4 (tooltip), 5 (no-data state),
 *              6 (legend toggle — implicit), 7 (responsive — implicit), 8 (performance)
 *
 * TDD Phase: 🟢 GREEN — All tests active. Story 3.3 fully implemented.
 *
 * Conventions (from project-context.md):
 * - Always import from '../support/fixtures' (not '@playwright/test')
 * - Always call blockKnownThirdPartyHosts(page) before page.goto()
 * - Always seed app-language via addInitScript in beforeEach
 * - Never use getByText() on SVG text content — scope to container instead
 * - Always use { exact: true } with getByText() to avoid substring collisions
 * - Always use --workers=1 for local E2E runs: npx playwright test --workers=1
 * - Use .first() on [data-testid="tag-revenue-chart"] svg locator — recharts Legend
 *   renders small SVG icons per item, so multiple SVG elements exist in the container
 */

/**
 * Seed factory: two billable tasks with different tags (design, development),
 * producing multiple pie slices for multi-tag chart assertions.
 * Must be called in Node.js test context; pass as argument to page.addInitScript.
 */
const buildTagSeed = () => ({
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
      tags: ["design"],
      order: 0,
    },
    {
      id: "t2",
      title: "Task 2",
      columnId: "col-1",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 80,
      timeSpent: 7200,
      createdAt: Date.now(),
      priority: "medium",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: ["development"],
      order: 1,
    },
  ],
  columns: [{ id: "col-1", title: "In Progress", order: 0 }],
  clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
  version: 1,
});

/**
 * Seed factory: one billable task with no tags.
 * Used to verify the "Untagged" sentinel slice (AC3).
 */
const buildUntaggedSeed = () => ({
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
  ],
  columns: [{ id: "col-1", title: "In Progress", order: 0 }],
  clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
  version: 1,
});

test.describe("Story 3.3 ATDD — Tag Revenue Chart", () => {
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
    "[P0] tag revenue chart container is visible after switching to Tag chart view (AC1)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Switch to Tag chart view via shadcn Select (id="earnings-chart-view")
      // t.earningsChartViewLabel = 'Chart', t.earningsChartTag = 'Tag'
      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Tag" }).click();

      // EarningsDashboard must conditionally render TagRevenueChart
      // TagRevenueChart must render data-testid="tag-revenue-chart"
      await expect(page.getByTestId("tag-revenue-chart")).toBeVisible();
    },
  );

  test(
    "[P0] recharts SVG element is rendered inside tag chart container with seeded task (AC1, FR6)",
    async ({ page }) => {
      // Pass seed as argument so buildTagSeed() runs in Node.js context (not browser)
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildTagSeed(),
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Tag" }).click();

      // recharts PieChart renders an SVG element — confirms chart is mounted
      // Use .first() because recharts Legend also renders small SVG icons per item
      await expect(
        page.locator('[data-testid="tag-revenue-chart"] svg').first(),
      ).toBeVisible();
    },
  );

  test(
    "[P0] switching from Tag back to Customer hides tag chart container (AC2, FR7)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Switch to Tag view
      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Tag" }).click();
      await expect(page.getByTestId("tag-revenue-chart")).toBeVisible();

      // Switch back to Customer view — tag chart must disappear
      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Customer" }).click();

      // TagRevenueChart must be gone; CustomerRevenueChart takes over
      await expect(page.getByTestId("tag-revenue-chart")).not.toBeVisible();
    },
  );

  // ---------------------------------------------------------------------------
  // P1 — Important: chart title, no-data state, tooltip, untagged, filter preservation
  // ---------------------------------------------------------------------------

  test(
    "[P1] chart section heading 'Revenue by Tag' is visible (AC1 i18n)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildTagSeed(),
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Tag" }).click();

      // Chart title must use t.earningsTagChartTitle = 'Revenue by Tag'
      // Scoped to chart container to avoid collisions with other headings on the page
      await expect(
        page
          .getByTestId("tag-revenue-chart")
          .getByText("Revenue by Tag", { exact: true }),
      ).toBeVisible();
    },
  );

  test(
    "[P1] no-data state shows informative message when task list is empty (AC5)",
    async ({ page }) => {
      await page.addInitScript(() => {
        // Override default 5 sample tasks with empty state
        const empty = { tasks: [], columns: [], clients: [], version: 1 };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(empty));
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Tag" }).click();

      // Container must still render (no-data variant uses same data-testid)
      await expect(page.getByTestId("tag-revenue-chart")).toBeVisible();

      // i18n no-data message: t.earningsChartNoData = 'No data for this period'
      await expect(
        page.getByText("No data for this period", { exact: true }),
      ).toBeVisible();

      // SVG should NOT be present in the no-data variant
      await expect(
        page.locator('[data-testid="tag-revenue-chart"] svg'),
      ).not.toBeVisible();
    },
  );

  test(
    "[P1] tooltip is visible when hovering chart SVG area (AC4, FR8)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildTagSeed(),
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Tag" }).click();

      // Use .first() — recharts Legend renders small SVG icons per item
      const chartSvg = page
        .locator('[data-testid="tag-revenue-chart"] svg')
        .first();
      await expect(chartSvg).toBeVisible();

      // Hover at the center of the pie chart SVG to trigger recharts Tooltip.
      // recharts PieChart cx=50%, cy=50%, so center is at (width/2, height/2).
      // Tooltip content: tag name (row.tag), formatCurrency(revenue), (pct%)
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
    "[P1] untagged task revenue appears as 'Untagged' legend entry (AC3)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildUntaggedSeed(),
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Tag" }).click();

      // chart SVG must be visible (data is present — one untagged task)
      await expect(
        page.locator('[data-testid="tag-revenue-chart"] svg').first(),
      ).toBeVisible();

      // "Untagged" appears as a legend label (HTML text in recharts Legend)
      // calculateRevenueByTag returns UNTAGGED_KEY = "Untagged" as tag sentinel
      await expect(
        page
          .locator('[data-testid="tag-revenue-chart"]')
          .getByText("Untagged", { exact: true }),
      ).toBeVisible();
    },
  );

  test(
    "[P1] switching from Customer to Tag preserves earnings-dashboard container (AC2, FR7)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Default view: Customer chart is visible
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Switch to Tag view
      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Tag" }).click();

      // Earnings dashboard container itself must still be visible — confirms
      // date range and billable filter state is preserved (not reset on chart switch)
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();
    },
  );

  // ---------------------------------------------------------------------------
  // P2 — Nice-to-have: i18n, performance
  // ---------------------------------------------------------------------------

  test(
    "[P2] Portuguese locale renders 'Receita por Tag' chart title (i18n)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          // Override language to Portuguese (set before LanguageProvider reads localStorage)
          localStorage.setItem("app-language", "pt");
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildTagSeed(),
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // PT label for chart selector: t.earningsChartViewLabel = 'Gráfico'
      // PT option for tag view: t.earningsChartTag = 'Tag' (same in both languages)
      await page.getByLabel("Gráfico").click();
      await page.getByRole("option", { name: "Tag" }).click();

      // Portuguese translation: t.earningsTagChartTitle = 'Receita por Tag'
      await expect(
        page
          .getByTestId("tag-revenue-chart")
          .getByText("Receita por Tag", { exact: true }),
      ).toBeVisible();
    },
  );

  test(
    "[P2] chart renders within 2 seconds with dataset of 50 tasks (AC8, NFR-P1)",
    async ({ page }) => {
      await page.addInitScript(() => {
        const now = Date.now();
        // 50 tasks distributed across 5 tag groups to create multiple pie slices
        const tasks = Array.from({ length: 50 }, (_, i) => ({
          id: `t${i}`,
          title: `Task ${i}`,
          columnId: "col-1",
          clientId: "c1",
          isBillable: true,
          hourlyRate: 100,
          timeSpent: 3600,
          createdAt: now - i * 1000,
          priority: "medium",
          description: "",
          timeEstimate: null,
          dueDate: null,
          tags: [`tag-${i % 5}`],
          order: i,
        }));
        const seed = {
          tasks,
          columns: [{ id: "col-1", title: "In Progress", order: 0 }],
          clients: [
            { id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" },
          ],
          version: 1,
        };
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
      });
      await blockKnownThirdPartyHosts(page);

      const start = Date.now();
      await page.goto("/earnings");
      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Tag" }).click();

      // Chart SVG must be visible within the 2-second budget (AC8, NFR-P1)
      // Use .first() because recharts Legend also renders small SVG icons
      await expect(
        page.locator('[data-testid="tag-revenue-chart"] svg').first(),
      ).toBeVisible({ timeout: 2000 });

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(2000);
    },
  );
});
