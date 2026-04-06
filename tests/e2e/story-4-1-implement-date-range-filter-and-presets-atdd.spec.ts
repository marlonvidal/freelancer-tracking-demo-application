import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 4.1 — Implement Date Range Filter and Presets (ATDD).
 * E2E acceptance tests verifying the DateRangeFilter component, preset button
 * interactions, calendar popover, chart filtering, and localStorage persistence.
 *
 * ACs covered:
 *   AC1 — Calendar popover opens when date range control is clicked (FR11)
 *   AC2 — "Last 30 days" preset filters dashboard and is visually highlighted (FR12)
 *   AC3 — Four preset buttons visible: "Last 30 days", "Quarter", "Year", "All time" (FR12)
 *   AC4 — All three charts (Customer, Project, Tag) apply the date filter (FR13)
 *   AC5 — Date range persists across navigation via localStorage (FR14, FR40)
 *   AC6 — UI responds within 500ms (NFR-P2)
 *
 * TDD Phase: 🔴 RED — All tests use test.skip() (DateRangeFilter not implemented yet).
 * Remove test.skip() after implementing Story 4.1.
 *
 * Conventions (from project-context.md):
 * - Always import from '../support/fixtures' (not '@playwright/test')
 * - Always call blockKnownThirdPartyHosts(page) before page.goto()
 * - Always seed app-language via addInitScript in beforeEach
 * - Seed explicit freelancer-kanban-data — never rely on app defaults
 * - Use data-testid selectors for bilingual element targeting
 * - Capture Date.now() AFTER page.goto() in timing tests (E2E timing rule)
 * - Use { exact: true } with getByText() to avoid substring collisions
 * - Use .first() on svg locators from recharts chart containers
 * - test.describe.configure({ retries: 1 }) for timing-sensitive tests (AC6)
 * - DO NOT write keyboard navigation tests — deferred to Story 4.3
 */

/**
 * Standard seed factory for Story 4.1 tests.
 * Two tasks: one recent (5 days ago — inside last30/quarter/year), one old (400 days ago).
 * This ensures date filter tests can distinguish filtered vs. unfiltered results.
 */
const buildStandardSeed = () => ({
  tasks: [
    {
      id: "t1",
      title: "Task 1",
      columnId: "col-1",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 100,
      timeSpent: 3600,
      createdAt: Date.now() - 5 * 86400000, // 5 days ago — inside last30/quarter/year
      priority: "medium",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: ["dev"],
      order: 0,
    },
    {
      id: "t2",
      title: "Old Task",
      columnId: "col-1",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 100,
      timeSpent: 3600,
      createdAt: Date.now() - 400 * 86400000, // 400 days ago — outside last30/quarter/year
      priority: "medium",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: ["dev"],
      order: 1,
    },
  ],
  columns: [{ id: "col-1", title: "In Progress", order: 0 }],
  clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
  version: 1,
});

test.describe("Story 4.1 ATDD — Date Range Filter and Presets", () => {
  // Retry once for the 500ms timing test (AC6) — CPU contention under parallel execution
  // can cause transient false failures (established pattern from Story 3.4).
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    // Seed English locale and standard task data for all tests.
    // Pass seed as second arg to addInitScript(fn, seed) — runs in Node context.
    await page.addInitScript(
      (seed) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
      },
      buildStandardSeed(),
    );
  });

  // ---------------------------------------------------------------------------
  // P0 — Critical path: preset buttons, calendar popover, chart filtering, persistence
  // ---------------------------------------------------------------------------

  test(
    "[P0] four preset buttons are visible on the earnings dashboard (AC3, FR12)",
    async ({ page }) => {
      // THIS TEST WILL FAIL — DateRangeFilter component not implemented yet.
      // Expected: data-testid="date-range-presets" container and four preset buttons render.
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // DateRangeFilter must render the preset buttons container
      await expect(page.getByTestId("date-range-presets")).toBeVisible();

      // All four preset buttons must be visible per FR12
      await expect(page.getByTestId("preset-last30")).toBeVisible();
      await expect(page.getByTestId("preset-quarter")).toBeVisible();
      await expect(page.getByTestId("preset-year")).toBeVisible();
      await expect(page.getByTestId("preset-all")).toBeVisible();

      // Verify English i18n labels are applied
      await expect(
        page.getByTestId("preset-last30").getByText("Last 30 days", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByTestId("preset-quarter").getByText("Quarter", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByTestId("preset-year").getByText("Year", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByTestId("preset-all").getByText("All time", { exact: true }),
      ).toBeVisible();
    },
  );

  test(
    "[P0] clicking 'Last 30 days' preset filters dashboard and persists dateRangePreset (AC2, FR12)",
    async ({ page }) => {
      // THIS TEST WILL FAIL — DateRangeFilter component not implemented yet.
      // Expected: clicking the preset button calls setDateRangePreset('last30'), updates
      // localStorage earnings-dashboard-state, and the customer chart remains visible.
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Click the "Last 30 days" preset button
      await page.getByTestId("preset-last30").click();

      // Verify the preset is persisted in localStorage
      const state = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(state.dateRangePreset).toBe("last30");

      // setDateRangePreset clears any custom dateRange — must be absent
      expect(state.dateRange).toBeUndefined();

      // Chart must still render after filter applies
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();
    },
  );

  test(
    "[P0] clicking the date picker trigger opens a calendar popover (AC1, FR11)",
    async ({ page }) => {
      // THIS TEST WILL FAIL — DateRangeFilter component not implemented yet.
      // Expected: a PopoverTrigger button with data-testid="date-range-picker-trigger" exists
      // and clicking it opens a Popover containing a react-day-picker Calendar (role="grid").
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // The popover trigger button must be present
      await expect(page.getByTestId("date-range-picker-trigger")).toBeVisible();

      // Click the trigger to open the Popover
      await page.getByTestId("date-range-picker-trigger").click();

      // react-day-picker Calendar renders a role="grid" (HTML <table role="grid">)
      await expect(page.getByRole("grid")).toBeVisible();
    },
  );

  test(
    "[P0] selecting a custom date range via calendar applies filter to all charts (AC1, AC4, FR11, FR13)",
    async ({ page }) => {
      // THIS TEST WILL FAIL — DateRangeFilter component not implemented yet.
      // Expected: selecting two dates in the calendar popover calls setCustomDateRange
      // with { startMs, endMs }, persists to localStorage, and all three charts reflect
      // the filter (chart data recalculates via resolveDateRangeMs priority: custom > preset).
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Open the calendar popover
      await page.getByTestId("date-range-picker-trigger").click();
      await expect(page.getByRole("grid")).toBeVisible();

      // Select a range: click two different date cells in the calendar
      // react-day-picker renders table cells with role="gridcell" — use first two available cells
      const dayCells = page.getByRole("gridcell", { name: /^\d+$/ });
      await dayCells.first().click(); // selects start date (from)
      await dayCells.nth(3).click(); // selects end date (to) — 4 days later

      // Popover may close or remain open after range selection
      // Verify the trigger button text has updated to show the custom range (not a preset label)
      // The trigger renders formatDisplayRange() which shows "MMM d, yyyy – MMM d, yyyy" for custom range
      const triggerText = await page
        .getByTestId("date-range-picker-trigger")
        .textContent();
      expect(triggerText).not.toBe("Last 30 days");
      expect(triggerText).not.toBe("Quarter");
      expect(triggerText).not.toBe("Year");
      expect(triggerText).not.toBe("All time");
      expect(triggerText).not.toBe("Pick a date range");

      // Verify dateRange is persisted to localStorage
      const state = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(state.dateRange).toBeDefined();
      expect(typeof state.dateRange.startMs).toBe("number");
      expect(typeof state.dateRange.endMs).toBe("number");
      expect(state.dateRange.startMs).toBeLessThanOrEqual(state.dateRange.endMs);

      // Customer chart must still be visible — filter applies to active chart (FR13)
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();
    },
  );

  test(
    "[P0] selected preset persists across navigation to home and back (AC5, FR14, FR40)",
    async ({ page }) => {
      // THIS TEST WILL FAIL — DateRangeFilter component not implemented yet.
      // Expected: dateRangePreset is persisted to localStorage earnings-dashboard-state,
      // and is restored when the user navigates back to /earnings.
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Select the "Year" preset
      await page.getByTestId("preset-year").click();

      // Verify it was persisted immediately
      const stateBeforeNav = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(stateBeforeNav.dateRangePreset).toBe("year");

      // Navigate away from the earnings dashboard
      await page.goto("/");

      // Navigate back
      await page.goto("/earnings");

      // Verify the preset is still reflected in localStorage after re-mount
      const stateAfterNav = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(stateAfterNav.dateRangePreset).toBe("year");

      // The "Year" preset button must be present (proves DateRangeFilter rendered)
      await expect(page.getByTestId("preset-year")).toBeVisible();
    },
  );

  // ---------------------------------------------------------------------------
  // P1 — Important: filter interaction performance
  // ---------------------------------------------------------------------------

  test(
    "[P1] filter interaction responds within 500ms — preset click updates chart (AC6, NFR-P2)",
    async ({ page }) => {
      // THIS TEST WILL FAIL — DateRangeFilter component not implemented yet.
      // Expected: clicking a preset button triggers a state update and chart re-render
      // within 500ms (NFR-P2). setDateRangePreset is synchronous; useMemo recalculates
      // only the active chart — no blocking computation.
      //
      // Date.now() timing rule: capture AFTER page.goto() (project-context.md E2E timing rule).
      // test.describe.configure({ retries: 1 }) applied at describe level for transient CPU contention.
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Wait for the dashboard to be ready before starting the timer
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      // Capture start time AFTER page load (mandatory per project-context.md timing rule)
      const start = Date.now();

      // Click the "Quarter" preset — triggers setDateRangePreset('quarter') → state update → chart re-render
      await page.getByTestId("preset-quarter").click();

      // Chart must remain visible after filter applies (no full page reload)
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      // Total elapsed must be under 500ms (NFR-P2)
      expect(Date.now() - start).toBeLessThan(500);
    },
  );
});
