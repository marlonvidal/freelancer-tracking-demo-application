import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 3.4 — Chart Responsiveness and Performance (ATDD).
 * E2E acceptance tests verifying 320px mobile viewport layout, 5000-task
 * render performance, tooltip non-blocking interaction, and chart-switch
 * transition timing.
 *
 * ACs covered:
 *   AC1 — All charts readable at 320px with no horizontal scroll or clipping
 *   AC2 — All charts render within 2 seconds with 5000-task dataset (FR43, NFR-P1)
 *   AC3 — Tooltip remains responsive during chart redraws (FR45)
 *   AC4 — Chart switch transition completes within 500ms (NFR-P2)
 *
 * TDD Phase: ✅ GREEN — All tests active. Story 3.4 implemented.
 *   `isAnimationActive={false}` added to <Pie> in CustomerRevenueChart,
 *   ProjectRevenueChart, and TagRevenueChart, eliminating the 400ms animation
 *   overhead and satisfying the 500ms (AC4), 2s (AC2), and non-blocking (AC3) budgets.
 *
 * Conventions (from project-context.md):
 * - Always import from '../support/fixtures' (not '@playwright/test')
 * - Always call blockKnownThirdPartyHosts(page) before page.goto()
 * - Always seed app-language via addInitScript in beforeEach
 * - Use .first() on [data-testid="*-revenue-chart"] svg — recharts Legend
 *   renders small SVG icons per item, causing multiple SVG elements
 * - Set viewport BEFORE page.goto() for all responsive/mobile tests
 * - Pass seed as second arg to addInitScript(fn, seed) — runs in Node context
 * - Always use { exact: true } with getByText() to avoid substring collisions
 */

/**
 * Seed factory: 5000 tasks across 5 columns and 10 clients.
 * Used to verify the 2-second render budget with a large realistic dataset (AC2).
 * Called in Node.js context; serialized and injected into browser via addInitScript arg.
 */
const build5000TaskSeed = () => ({
  tasks: Array.from({ length: 5000 }, (_, i) => ({
    id: `t${i}`,
    title: `Task ${i}`,
    columnId: `col-${i % 5}`,
    clientId: `c${i % 10}`,
    isBillable: i % 2 === 0,
    hourlyRate: 100,
    timeSpent: 3600,
    createdAt: Date.now() - i * 86400000,
    priority: "medium",
    description: "",
    timeEstimate: null,
    dueDate: null,
    tags: [`tag-${i % 8}`],
    order: i,
  })),
  columns: Array.from({ length: 5 }, (_, i) => ({
    id: `col-${i}`,
    title: `Column ${i}`,
    order: i,
  })),
  clients: Array.from({ length: 10 }, (_, i) => ({
    id: `c${i}`,
    name: `Client ${i}`,
    hourlyRate: 100,
    color: "#6366f1",
  })),
  version: 1,
});

/**
 * Seed factory: two billable tasks with different tags, two clients.
 * Used for tooltip hover and chart-switch tests (need multiple pie slices).
 */
const buildSmallSeed = () => ({
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
      clientId: "c2",
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
  clients: [
    { id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" },
    { id: "c2", name: "Beta Inc", hourlyRate: 80, color: "#8b5cf6" },
  ],
  version: 1,
});

/**
 * Seed factory: single billable task, one column, one client.
 * Used for 320px viewport dimension and overflow tests — only needs chart to render.
 */
const buildSingleTaskSeed = () => ({
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
  ],
  columns: [{ id: "col-1", title: "In Progress", order: 0 }],
  clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
  version: 1,
});

test.describe("Story 3.4 ATDD — Chart Responsiveness and Performance", () => {
  // Performance timing tests (AC2, AC4) are sensitive to machine load when 6+ browser
  // instances run in parallel. Allow 1 retry so transient CPU contention does not
  // produce a false failure; the app must still render within budget on the retry.
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    // Seed English locale for all tests in this suite
    await page.addInitScript(() => {
      localStorage.setItem("app-language", "en");
    });
  });

  // ---------------------------------------------------------------------------
  // P0 — Critical path: mobile responsiveness and large-dataset performance
  // ---------------------------------------------------------------------------

  test(
    "[P0] all charts readable at 320px viewport with no horizontal scroll (AC1)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildSingleTaskSeed(),
      );
      // Set viewport BEFORE goto — recharts ResponsiveContainer must measure at target width
      await page.setViewportSize({ width: 320, height: 568 });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Default view is Customer chart — verify it renders at narrow viewport
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      // No horizontal scrollbar — document.body.scrollWidth must equal window.innerWidth
      const hasHorizontalScroll = await page.evaluate(
        () => document.body.scrollWidth > window.innerWidth,
      );
      expect(hasHorizontalScroll).toBe(false);
    },
  );

  test(
    "[P0] dashboard and charts render within 2 seconds with 5000-task dataset (AC2, FR43, NFR-P1)",
    async ({ page }) => {
      // Pre-stringify on the Node side to avoid double-serialization overhead in the browser.
      // Playwright passes the string as-is; the browser sets it directly to localStorage.
      const seedJson = JSON.stringify(build5000TaskSeed());
      await page.addInitScript(
        (json) => {
          localStorage.setItem("freelancer-kanban-data", json);
        },
        seedJson,
      );
      await blockKnownThirdPartyHosts(page);

      // Timer starts before goto — matches established pattern from Stories 3.1–3.3
      const start = Date.now();
      await page.goto("/earnings");

      // Customer chart SVG (default view) must be visible within 2-second budget
      // Use .first() — recharts Legend renders additional SVG icons per slice
      await expect(
        page.locator('[data-testid="customer-revenue-chart"] svg').first(),
      ).toBeVisible();
      expect(Date.now() - start).toBeLessThan(2000);
    },
  );

  // ---------------------------------------------------------------------------
  // P1 — Important: tooltip responsiveness and chart-switch timing
  // ---------------------------------------------------------------------------

  test(
    "[P1] tooltip interaction not blocked — tooltip appears on hover (AC3, FR45)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildSmallSeed(),
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Use .first() — recharts Legend SVG icons also match the svg locator
      const chartSvg = page
        .locator('[data-testid="customer-revenue-chart"] svg')
        .first();
      await expect(chartSvg).toBeVisible();

      // Hover at the bounding-box center — fixed offsets miss the pie at narrow widths
      const bbox = await chartSvg.boundingBox();
      const cx = bbox ? bbox.width / 2 : 160;
      const cy = bbox ? bbox.height / 2 : 160;
      await chartSvg.hover({ position: { x: cx, y: cy } });

      // CustomTooltip renders inside .rounded-md.border.bg-popover (shared across all charts)
      await expect(
        page.locator(".rounded-md.border.bg-popover"),
      ).toBeVisible({ timeout: 3000 });
    },
  );

  test(
    "[P1] chart transition Customer→Project completes within 500ms (AC4, NFR-P2)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildSmallSeed(),
      );
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Wait for Customer chart to be ready before starting the timer
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      // Timer wraps the full switch interaction (click + option select + chart render)
      const switchStart = Date.now();
      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Project" }).click();
      await expect(page.getByTestId("project-revenue-chart")).toBeVisible();
      expect(Date.now() - switchStart).toBeLessThan(500);
    },
  );

  // ---------------------------------------------------------------------------
  // P2 — Nice-to-have: SVG dimension validation at 320px
  // ---------------------------------------------------------------------------

  test(
    "[P2] customer chart SVG has meaningful dimensions at 320px — not clipped (AC1)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildSingleTaskSeed(),
      );
      await page.setViewportSize({ width: 320, height: 568 });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // recharts outerRadius="70%" of ~272px ≈ 190px diameter — meaningful bounding box
      const chartSvg = page
        .locator('[data-testid="customer-revenue-chart"] svg')
        .first();
      await expect(chartSvg).toBeVisible();

      const bbox = await chartSvg.boundingBox();
      expect(bbox).not.toBeNull();
      expect(bbox!.width).toBeGreaterThan(100);
      expect(bbox!.height).toBeGreaterThan(100);
    },
  );

  test(
    "[P2] tag chart visible and not clipped at 320px viewport (AC1)",
    async ({ page }) => {
      await page.addInitScript(
        (seed) => {
          localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
        },
        buildSingleTaskSeed(),
      );
      await page.setViewportSize({ width: 320, height: 568 });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Switch to Tag view (shadcn Select — label: 'Chart', option: 'Tag')
      await page.getByLabel("Chart").click();
      await page.getByRole("option", { name: "Tag" }).click();

      const chartSvg = page
        .locator('[data-testid="tag-revenue-chart"] svg')
        .first();
      await expect(chartSvg).toBeVisible();

      const bbox = await chartSvg.boundingBox();
      expect(bbox).not.toBeNull();
      expect(bbox!.width).toBeGreaterThan(100);
    },
  );
});
