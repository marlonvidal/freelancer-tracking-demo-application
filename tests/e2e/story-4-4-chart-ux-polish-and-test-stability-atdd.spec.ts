import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 4.4 — Chart UX Polish and Test Stability (ATDD).
 * E2E acceptance tests verifying legend state reset on filter changes,
 * all-hidden empty state message, and combined AC1+AC3 interactions.
 *
 * ACs covered:
 *   AC1 — hiddenKeys resets when data prop changes (filter or date change)
 *   AC3 — All legend items hidden → informative message shown instead of blank chart
 *
 * ACs NOT covered by this file (handled elsewhere):
 *   AC2 — formatCurrency extracted to src/lib/utils.ts (unit test in src/lib/utils.test.ts)
 *   AC4 — Date.now() moved after page.goto() (modifications to existing E2E files)
 *   AC5 — App.tsx import consistency (code-only, no dedicated test needed)
 *
 * Conventions (from project-context.md):
 * - Always import from '../support/fixtures' (not '@playwright/test')
 * - Always call blockKnownThirdPartyHosts(page) before page.goto()
 * - Always seed app-language via addInitScript in beforeEach
 * - Seed explicit freelancer-kanban-data — never rely on app defaults
 * - Use data-testid selectors for bilingual element targeting
 * - Capture Date.now() AFTER page.goto() in timing tests (E2E timing rule)
 * - recharts legend items: SVG <text> elements inside chart's SVG
 *   → page.locator('[data-testid="...chart..."] svg text').filter({ hasText: '...' }).click()
 * - data-testid="chart-all-hidden-message" — shared across all three charts
 *
 * TDD Phase: RED — All tests skipped (failing before implementation).
 * Remove test.skip() after implementing Story 4.4 to verify green phase.
 */

/**
 * Standard seed factory for Story 4.4 tests.
 * Two clients with one billable task each — both within last30 so the default
 * date filter includes both, and the customer chart shows two legend items.
 */
const buildTwoClientSeed = () => ({
  tasks: [
    {
      id: "t1",
      title: "Task for Acme",
      columnId: "col-1",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 100,
      timeSpent: 3600,
      createdAt: Date.now() - 5 * 86400000, // 5 days ago — inside last30
      priority: "medium",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: [],
      order: 0,
    },
    {
      id: "t2",
      title: "Task for TechStart",
      columnId: "col-1",
      clientId: "c2",
      isBillable: true,
      hourlyRate: 80,
      timeSpent: 7200,
      createdAt: Date.now() - 3 * 86400000, // 3 days ago — inside last30
      priority: "low",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: [],
      order: 1,
    },
  ],
  columns: [{ id: "col-1", title: "In Progress", order: 0 }],
  clients: [
    { id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" },
    { id: "c2", name: "TechStart", hourlyRate: 80, color: "#8b5cf6" },
  ],
  version: 1,
});

test.describe("Story 4.4 — Chart UX Polish and Test Stability", () => {
  test.beforeEach(async ({ page }) => {
    const seed = buildTwoClientSeed();
    await page.addInitScript((data) => {
      localStorage.setItem("app-language", "en");
      localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
    }, seed);
    await blockKnownThirdPartyHosts(page);
  });

  // ── AC3: All legend items hidden → shows informative message ────────────────

  test(
    "[P0] hiding all legend items shows all-hidden message (AC3)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      const chartContainer = page.getByTestId("customer-revenue-chart");
      await expect(chartContainer).toBeVisible();

      // Click both legend items to hide all data series.
      await page
        .getByTestId("customer-revenue-chart")
        .getByText("Acme Corp", { exact: true })
        .click();
      await page
        .getByTestId("customer-revenue-chart")
        .getByText("TechStart", { exact: true })
        .click();

      // All-hidden message must appear (data-testid="chart-all-hidden-message")
      await expect(page.getByTestId("chart-all-hidden-message")).toBeVisible();
    },
  );

  // ── AC1: Legend resets when billable filter changes ─────────────────────────

  test(
    "[P0] changing billable filter resets hidden legend items (AC1)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Hide all legend items to produce all-hidden state
      await page
        .getByTestId("customer-revenue-chart")
        .getByText("Acme Corp", { exact: true })
        .click();
      await page
        .getByTestId("customer-revenue-chart")
        .getByText("TechStart", { exact: true })
        .click();
      await expect(page.getByTestId("chart-all-hidden-message")).toBeVisible();

      // Switch billable filter to 'billable' — this changes the data prop
      // which should trigger the useEffect and reset hiddenKeys to new Set()
      await page.getByTestId("billable-toggle-billable").click();

      // All-hidden message must disappear — hiddenKeys reset, chart renders again
      await expect(
        page.getByTestId("chart-all-hidden-message"),
      ).not.toBeVisible();
      await expect(
        page.locator('[data-testid="customer-revenue-chart"] svg').first(),
      ).toBeVisible();
    },
  );

  // ── AC1: Legend resets when date preset changes ─────────────────────────────

  test(
    "[P0] changing date preset resets hidden legend items (AC1)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Hide all legend items
      await page
        .getByTestId("customer-revenue-chart")
        .getByText("Acme Corp", { exact: true })
        .click();
      await page
        .getByTestId("customer-revenue-chart")
        .getByText("TechStart", { exact: true })
        .click();
      await expect(page.getByTestId("chart-all-hidden-message")).toBeVisible();

      // Change date preset — data prop reference changes → hiddenKeys resets
      await page.getByTestId("preset-year").click();

      // All-hidden message must disappear — chart renders with legend fully visible
      await expect(
        page.getByTestId("chart-all-hidden-message"),
      ).not.toBeVisible();
      await expect(
        page.locator('[data-testid="customer-revenue-chart"] svg').first(),
      ).toBeVisible();
    },
  );

  // ── AC1 + AC3: Same behavior on Project chart ────────────────────────────────

  test(
    "[P1] hiddenKeys reset and all-hidden message work for project chart (AC1, AC3)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Switch to project chart view
      const chartSelect = page.getByLabel("Chart");
      await chartSelect.click();
      await page.getByRole("option", { name: "Project" }).click();

      await expect(page.getByTestId("project-revenue-chart")).toBeVisible();

      // Seed has one column "In Progress" — clicking it hides the single series
      await page
        .getByTestId("project-revenue-chart")
        .getByText("In Progress", { exact: true })
        .click();

      // All-hidden message must appear on the project chart
      await expect(page.getByTestId("chart-all-hidden-message")).toBeVisible();

      // Change date preset → hiddenKeys resets → message disappears
      await page.getByTestId("preset-year").click();
      await expect(
        page.getByTestId("chart-all-hidden-message"),
      ).not.toBeVisible();
    },
  );
});
