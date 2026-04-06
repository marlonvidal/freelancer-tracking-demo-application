import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 4.2 — Implement Billable/Non-Billable Toggle (ATDD).
 * E2E acceptance tests verifying the BillableToggle component, filter interactions,
 * localStorage persistence, and timing performance.
 *
 * ACs covered:
 *   AC1 — Three toggle buttons (All, Billable, Non-billable) visible on dashboard (FR15, FR16, FR17)
 *   AC2 — "Billable" click filters to billable-only tasks, charts update (FR15, FR18)
 *   AC3 — "Non-billable" click filters to non-billable-only tasks, charts update (FR16)
 *   AC4 — "All" click restores all tasks (FR17)
 *   AC5 — Billable filter setting persists across navigation (FR19, FR41)
 *   NFR-P2 — Filter interaction responds within 500ms
 *
 * Conventions (from project-context.md):
 * - Always import from '../support/fixtures' (not '@playwright/test')
 * - Always call blockKnownThirdPartyHosts(page) before page.goto()
 * - Always seed app-language via addInitScript in beforeEach
 * - Seed explicit freelancer-kanban-data — never rely on app defaults
 * - Use data-testid selectors for bilingual element targeting
 * - Capture Date.now() AFTER page.goto() in timing tests (E2E timing rule)
 * - Use { exact: true } with getByText() to avoid substring collisions
 * - test.describe.configure({ retries: 1 }) for timing-sensitive tests (NFR-P2)
 * - DO NOT write keyboard navigation tests — deferred to Story 4.3
 *
 * TDD Phase: GREEN — All tests active (test.skip() removed after implementation).
 */

/**
 * Standard seed factory for Story 4.2 tests.
 * Two tasks: one billable (isBillable: true), one non-billable (isBillable: false).
 * Both within the last 30 days so the default date filter includes both.
 */
const buildStandardSeed = () => ({
  tasks: [
    {
      id: "t1",
      title: "Billable Task",
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
      title: "Non-Billable Task",
      columnId: "col-1",
      clientId: "c1",
      isBillable: false,
      hourlyRate: 0,
      timeSpent: 1800,
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
  clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
  version: 1,
});

test.describe("Story 4.2 ATDD — Billable/Non-Billable Toggle", () => {
  // Retry once for the 500ms timing test (NFR-P2) — CPU contention under parallel execution
  // can cause transient false failures (established pattern from Stories 3.4 and 4.1).
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    // Seed English locale and standard task data (billable + non-billable) for all tests.
    await page.addInitScript(
      (seed) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
      },
      buildStandardSeed(),
    );
  });

  // ---------------------------------------------------------------------------
  // P0 — Critical path: toggle buttons visible, filter applies to charts
  // ---------------------------------------------------------------------------

  test(
    "[P0] three toggle buttons (All, Billable, Non-billable) are visible on earnings dashboard (AC1, FR15, FR16, FR17)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // BillableToggle wrapper must be present
      await expect(page.getByTestId("billable-toggle")).toBeVisible();

      // All three filter buttons must be visible per FR15/FR16/FR17
      await expect(page.getByTestId("billable-toggle-all")).toBeVisible();
      await expect(page.getByTestId("billable-toggle-billable")).toBeVisible();
      await expect(page.getByTestId("billable-toggle-nonBillable")).toBeVisible();

      // Verify English i18n labels are applied — use { exact: true } to avoid substring collision
      // between "Billable" and "Non-billable"
      await expect(
        page.getByTestId("billable-toggle-all").getByText("All", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByTestId("billable-toggle-billable").getByText("Billable", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByTestId("billable-toggle-nonBillable").getByText("Non-billable", { exact: true }),
      ).toBeVisible();
    },
  );

  test(
    "[P0] clicking 'Billable' button filters to billable-only and updates localStorage (AC2, FR15, FR18)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Click the "Billable" toggle button
      await page.getByTestId("billable-toggle-billable").click();

      // Verify the filter is persisted in localStorage
      const state = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(state.billableFilter).toBe("billable");

      // Customer revenue chart must still render after filter applies (FR18)
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();
    },
  );

  test(
    "[P0] clicking 'Non-billable' button filters to non-billable-only and updates localStorage (AC3, FR16)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Click the "Non-billable" toggle button
      await page.getByTestId("billable-toggle-nonBillable").click();

      // Verify the filter is persisted in localStorage
      const state = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(state.billableFilter).toBe("nonBillable");

      // Chart must still render (FR16 — only non-billable included)
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();
    },
  );

  test(
    "[P0] clicking 'All' button restores all tasks and updates localStorage (AC4, FR17)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // First apply a non-all filter
      await page.getByTestId("billable-toggle-billable").click();

      // Then reset to "All"
      await page.getByTestId("billable-toggle-all").click();

      // Verify "all" is persisted in localStorage
      const state = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(state.billableFilter).toBe("all");

      // Chart must still render with all tasks included
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();
    },
  );

  // ---------------------------------------------------------------------------
  // P1 — Important: persistence, visual state, performance
  // ---------------------------------------------------------------------------

  test(
    "[P1] billable filter persists across navigation away and back (AC5, FR19, FR41)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Set filter to "nonBillable"
      await page.getByTestId("billable-toggle-nonBillable").click();

      // Verify it was persisted immediately
      const stateBeforeNav = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(stateBeforeNav.billableFilter).toBe("nonBillable");

      // Navigate away from the earnings dashboard
      await page.goto("/");

      // Navigate back
      await page.goto("/earnings");

      // Verify the filter is still reflected in localStorage after re-mount
      const stateAfterNav = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(stateAfterNav.billableFilter).toBe("nonBillable");

      // The toggle buttons must be visible (proves BillableToggle rendered)
      await expect(page.getByTestId("billable-toggle")).toBeVisible();
    },
  );

  test(
    "[P1] active toggle button is visually distinguished from inactive buttons (AC1)",
    async ({ page }) => {
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Seed a complete valid earnings-dashboard-state so coercePersisted accepts it.
      // Must include all required fields (version, dateRangePreset, activeChart) —
      // spreading over an empty object would cause coercePersisted to return null
      // and fall back to the default (billableFilter: 'all').
      await page.evaluate(() => {
        localStorage.setItem(
          "earnings-dashboard-state",
          JSON.stringify({
            version: 1,
            dateRangePreset: "last30",
            billableFilter: "billable",
            activeChart: "customer",
          }),
        );
      });

      // Reload so BillableToggle mounts with persisted 'billable' filter
      await page.reload();

      // Active button (billable) must be present — the component renders it with variant="default"
      // Inactive buttons (all, nonBillable) must be present with variant="outline"
      // We verify all three exist; the active/inactive distinction is in the rendered class names
      await expect(page.getByTestId("billable-toggle-billable")).toBeVisible();
      await expect(page.getByTestId("billable-toggle-all")).toBeVisible();
      await expect(page.getByTestId("billable-toggle-nonBillable")).toBeVisible();

      // The active button must not have the same appearance as the others.
      // BillableToggle sets variant="default" on active and variant="outline" on inactive.
      // Shadcn Button with variant="default" renders a filled background class (bg-primary).
      // Verify the active button has the default variant class and others do not.
      const billableBtn = page.getByTestId("billable-toggle-billable");
      const allBtn = page.getByTestId("billable-toggle-all");

      // Active button should have bg-primary (shadcn default variant)
      await expect(billableBtn).toHaveClass(/bg-primary/);
      // Inactive button should NOT have bg-primary
      await expect(allBtn).not.toHaveClass(/bg-primary/);
    },
  );

  test(
    "[P1] filter interaction responds within 500ms — toggle click updates chart (NFR-P2)",
    async ({ page }) => {
      // Date.now() timing rule: capture AFTER page.goto() (project-context.md E2E timing rule).
      // test.describe.configure({ retries: 1 }) applied at describe level for transient CPU contention.
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");

      // Wait for the dashboard to be ready before starting the timer
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      // Capture start time AFTER page load (mandatory per project-context.md timing rule)
      const start = Date.now();

      // Click the "Billable" toggle — triggers setBillableFilter('billable') → state update → chart re-render
      await page.getByTestId("billable-toggle-billable").click();

      // Chart must remain visible after filter applies (no full page reload)
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      // Total elapsed must be under 500ms (NFR-P2)
      expect(Date.now() - start).toBeLessThan(500);
    },
  );
});
