import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 4.3 — Ensure Filter Responsiveness and Keyboard Accessibility (ATDD).
 * E2E acceptance tests verifying keyboard navigation, ARIA attributes (aria-pressed,
 * role="group", aria-label), and 500ms filter response performance.
 *
 * ACs covered:
 *   AC1 — Filter change applies within 500ms (NFR-P2)
 *   AC2 — Tab to a filter control → receives focus with visible indicator (FR35)
 *   AC3 — Focus on date preset button → Enter/Space selects preset and applies filter (FR33)
 *   AC4 — Focus on toggle button → Enter/Space selects option (FR33)
 *   AC5 — Keyboard-only can complete all filtering tasks (NFR-A7)
 *
 * Conventions (from project-context.md):
 * - Always import from '../support/fixtures' (not '@playwright/test')
 * - Always call blockKnownThirdPartyHosts(page) before page.goto()
 * - Always seed app-language via addInitScript in beforeEach
 * - Seed explicit freelancer-kanban-data — never rely on app defaults
 * - Use data-testid selectors for bilingual element targeting
 * - Capture Date.now() AFTER page.goto() in timing tests (E2E timing rule)
 * - Prefer .focus() over Tab-counting for test stability (C3 spike resolution)
 * - Use toBeFocused() to assert focus — not CSS class inspection
 * - test.describe.configure({ retries: 1 }) for timing-sensitive tests
 * - aria-pressed must be a string "true"/"false" (HTML attribute form)
 *
 * TDD Phase: GREEN — All tests active after BillableToggle.tsx and DateRangeFilter.tsx ARIA changes applied.
 */

/**
 * Standard seed factory for Story 4.3 tests.
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

test.describe("Story 4.3 — Filter Responsiveness and Keyboard Accessibility", () => {
  // Retry once for timing-sensitive NFR-P2 tests — CPU contention under parallel
  // execution can cause transient false failures (established pattern from Stories 3.4, 4.1, 4.2).
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    // Seed English locale and standard task data for all tests.
    // blockKnownThirdPartyHosts must be registered before page.goto() — done here
    // so every test is covered without repetition.
    await page.addInitScript(
      (seed) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(seed));
      },
      buildStandardSeed(),
    );
    blockKnownThirdPartyHosts(page);
  });

  // ---------------------------------------------------------------------------
  // P0 — AC2 + AC3: Date preset buttons — keyboard focus and activation
  // ---------------------------------------------------------------------------

  test(
    "[P0] date preset buttons: .focus() focuses element, Tab moves to sibling, Enter activates preset (AC2, AC3, FR33, FR35)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Focus first preset — use .focus() not Tab-counting (C3 spike resolved pattern)
      await page.getByTestId("preset-last30").focus();
      await expect(page.getByTestId("preset-last30")).toBeFocused();

      // Tab through preset siblings
      await page.keyboard.press("Tab");
      await expect(page.getByTestId("preset-quarter")).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.getByTestId("preset-year")).toBeFocused();

      // Activate with Enter — native <button> responds natively
      await page.keyboard.press("Enter");

      const state = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(state.dateRangePreset).toBe("year");
    },
  );

  test(
    "[P0] date preset buttons: Space activates preset (AC3, FR33)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      await page.getByTestId("preset-quarter").focus();
      await expect(page.getByTestId("preset-quarter")).toBeFocused();

      await page.keyboard.press(" "); // Space key

      const state = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(state.dateRangePreset).toBe("quarter");
    },
  );

  // ---------------------------------------------------------------------------
  // P0 — AC2 + AC4: Billable toggle buttons — keyboard focus and activation
  // ---------------------------------------------------------------------------

  test(
    "[P0] billable toggle buttons: .focus() focuses element, Tab moves to sibling, Enter activates toggle (AC2, AC4, FR33, FR35)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Focus the first toggle button
      await page.getByTestId("billable-toggle-all").focus();
      await expect(page.getByTestId("billable-toggle-all")).toBeFocused();

      // Tab to the next sibling button
      await page.keyboard.press("Tab");
      await expect(page.getByTestId("billable-toggle-billable")).toBeFocused();

      // Activate with Enter
      await page.keyboard.press("Enter");

      const state = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(state.billableFilter).toBe("billable");
    },
  );

  test(
    "[P0] billable toggle buttons: Space activates toggle option (AC4, FR33)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      await page.getByTestId("billable-toggle-nonBillable").focus();
      await page.keyboard.press(" "); // Space key

      const state = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(state.billableFilter).toBe("nonBillable");
    },
  );

  // ---------------------------------------------------------------------------
  // P0 — AC2: Calendar trigger — keyboard focus, Enter opens, Escape closes
  // ---------------------------------------------------------------------------

  test(
    "[P0] calendar trigger: .focus() focuses trigger, Enter opens popover, Escape closes (AC2, FR33)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      await page.getByTestId("date-range-picker-trigger").focus();
      await expect(page.getByTestId("date-range-picker-trigger")).toBeFocused();

      // Enter opens the calendar popover (Radix PopoverTrigger handles this natively)
      await page.keyboard.press("Enter");
      await expect(page.getByRole("grid")).toBeVisible(); // react-day-picker renders as role="grid"

      // Escape closes the popover
      await page.keyboard.press("Escape");
      await expect(page.getByRole("grid")).not.toBeVisible();
    },
  );

  // ---------------------------------------------------------------------------
  // P0 — aria-pressed: Active state communicated to screen readers
  // ---------------------------------------------------------------------------

  test(
    "[P0] aria-pressed reflects active billable filter state (AC4, FR33, NFR-A2)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Default state: "all" is active → aria-pressed="true"; others → aria-pressed="false"
      await expect(page.getByTestId("billable-toggle-all")).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByTestId("billable-toggle-billable")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      await expect(page.getByTestId("billable-toggle-nonBillable")).toHaveAttribute(
        "aria-pressed",
        "false",
      );

      // Activate "billable" via click
      await page.getByTestId("billable-toggle-billable").click();

      // aria-pressed must update reactively
      await expect(page.getByTestId("billable-toggle-all")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      await expect(page.getByTestId("billable-toggle-billable")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(page.getByTestId("billable-toggle-nonBillable")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    },
  );

  test(
    "[P0] aria-pressed reflects active date preset state (AC3, FR33, NFR-A2)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Default state: "last30" is active
      await expect(page.getByTestId("preset-last30")).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByTestId("preset-year")).toHaveAttribute("aria-pressed", "false");

      // Activate "year" via click
      await page.getByTestId("preset-year").click();

      // aria-pressed must update reactively
      await expect(page.getByTestId("preset-last30")).toHaveAttribute("aria-pressed", "false");
      await expect(page.getByTestId("preset-year")).toHaveAttribute("aria-pressed", "true");
    },
  );

  // ---------------------------------------------------------------------------
  // P0 — AC5: Keyboard-only can complete all filtering tasks (NFR-A7)
  // ---------------------------------------------------------------------------

  test(
    "[P0] keyboard-only: can set date preset and billable filter without mouse (AC5, NFR-A7)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Set date preset via keyboard — no mouse
      await page.getByTestId("preset-year").focus();
      await page.keyboard.press("Enter");

      // Set billable filter via keyboard — no mouse
      await page.getByTestId("billable-toggle-billable").focus();
      await page.keyboard.press("Enter");

      const state = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("earnings-dashboard-state") || "{}"),
      );
      expect(state.dateRangePreset).toBe("year");
      expect(state.billableFilter).toBe("billable");
    },
  );

  // ---------------------------------------------------------------------------
  // P1 — AC1: 500ms filter responsiveness (NFR-P2)
  // ---------------------------------------------------------------------------

  test(
    "[P1] keyboard filter change — date preset Enter — responds within 500ms (AC1, NFR-P2)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Capture start AFTER page.goto() — mandatory E2E timing rule (project-context.md)
      const start = Date.now();
      await page.getByTestId("preset-year").focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();
      expect(Date.now() - start).toBeLessThan(500);
    },
  );

  test(
    "[P1] keyboard filter change — billable toggle Enter — responds within 500ms (AC1, NFR-P2)",
    async ({ page }) => {
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Capture start AFTER page.goto() — mandatory E2E timing rule (project-context.md)
      const start = Date.now();
      await page.getByTestId("billable-toggle-billable").focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();
      expect(Date.now() - start).toBeLessThan(500);
    },
  );
});
