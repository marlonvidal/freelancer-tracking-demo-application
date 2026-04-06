import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 5.1 — Summary Metrics Cards and Edge Case Handling (ATDD).
 * E2E acceptance tests verifying conditional rendering of metric cards and
 * empty state messages for FR46–FR50.
 *
 * ACs covered:
 *   AC1 — Normal data → all 5 metric cards visible (FR21–FR25)
 *   AC2 — No tasks globally → FR46 empty-no-tasks message; metrics grid absent
 *   AC3 — Tasks outside date range → FR47 no-period-data message; metrics grid absent
 *   AC4 — Billable filter + no billable tasks → FR48 no-billable-work message; metrics grid absent
 *   AC6 — Zero-revenue edge case → metric cards render with $0.00 (FR50)
 *
 * AC5 (FR49 error state) is exercised implicitly through the conditional render
 * block; no dedicated E2E test is required (unit-level coverage suffices).
 *
 * Conventions (from project-context.md):
 * - Always import from '../support/fixtures' (not '@playwright/test')
 * - Always await blockKnownThirdPartyHosts(page) before page.goto()
 * - Seed via addInitScript — never rely on app defaults (app has 5 sample tasks)
 * - Use data-testid selectors for bilingual element targeting
 * - Use { exact: true } with getByText() — "Billable Revenue" is a substring
 *   of "Non-Billable Revenue" (E2E strict-mode failure documented in Story 2.2)
 * - page.addInitScript accepts a callback + ONE serializable arg; use two
 *   separate calls when seeding two localStorage keys (FR48 correction)
 */

// ── Seed factories ────────────────────────────────────────────────────────────

/** Two billable tasks within last30 window — normal happy path. */
const buildNormalSeed = () => ({
  tasks: [
    {
      id: "t1",
      title: "Task 1",
      columnId: "col-1",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 100,
      timeSpent: 3600,
      createdAt: Date.now() - 5 * 86400000,
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
      columnId: "col-1",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 50,
      timeSpent: 7200,
      createdAt: Date.now() - 3 * 86400000,
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

/** No tasks at all — required for FR46 (app default has 5 sample tasks). */
const buildEmptySeed = () => ({
  tasks: [],
  columns: [{ id: "col-1", title: "In Progress", order: 0 }],
  clients: [],
  version: 1,
});

/** Tasks exist but ALL are 60 days old — outside last30 preset. */
const buildOutOfRangeSeed = () => ({
  tasks: [
    {
      id: "t1",
      title: "Old Task",
      columnId: "col-1",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 100,
      timeSpent: 3600,
      createdAt: Date.now() - 60 * 86400000,
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

/** Tasks exist, none are billable — for FR48 with billable filter active. */
const buildNonBillableSeed = () => ({
  tasks: [
    {
      id: "t1",
      title: "Non-billable Task",
      columnId: "col-1",
      clientId: null,
      isBillable: false,
      hourlyRate: null,
      timeSpent: 3600,
      createdAt: Date.now() - 5 * 86400000,
      priority: "medium",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: [],
      order: 0,
    },
  ],
  columns: [{ id: "col-1", title: "In Progress", order: 0 }],
  clients: [],
  version: 1,
});

/** Task with zero timeSpent and zero hourlyRate — edge case for FR50. */
const buildZeroRevenueSeed = () => ({
  tasks: [
    {
      id: "t1",
      title: "Zero Task",
      columnId: "col-1",
      clientId: null,
      isBillable: true,
      hourlyRate: 0,
      timeSpent: 0,
      createdAt: Date.now() - 5 * 86400000,
      priority: "low",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: [],
      order: 0,
    },
  ],
  columns: [{ id: "col-1", title: "In Progress", order: 0 }],
  clients: [],
  version: 1,
});

/**
 * Complete valid EarningsDashboardPersistedState with billable filter active.
 * Must include all four fields — coercePersisted rejects incomplete objects
 * (Story 4.2 ATDD bug).
 */
const buildDashboardStateBillable = () => ({
  version: 1,
  dateRangePreset: "last30",
  billableFilter: "billable",
  activeChart: "customer",
});

// ── Test suite ────────────────────────────────────────────────────────────────

test.describe("Story 5.1 — Summary Metrics Cards and Edge Case Handling", () => {
  // ── AC1: Normal data shows all 5 metric cards ───────────────────────────────

  test("[P0] normal data renders all 5 metric cards (AC1)", async ({ page }) => {
    await page.addInitScript((data) => {
      localStorage.setItem("app-language", "en");
      localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
    }, buildNormalSeed());
    await blockKnownThirdPartyHosts(page);
    await page.goto("/earnings");
    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

    const metricsGrid = page.getByTestId("earnings-metrics");
    await expect(metricsGrid).toBeVisible();

    await expect(metricsGrid.getByText("Total Revenue", { exact: true })).toBeVisible();
    await expect(metricsGrid.getByText("Billable Revenue", { exact: true })).toBeVisible();
    await expect(metricsGrid.getByText("Non-Billable Revenue", { exact: true })).toBeVisible();
    await expect(metricsGrid.getByText("Average Hourly Rate", { exact: true })).toBeVisible();
    await expect(metricsGrid.getByText("Task Count", { exact: true })).toBeVisible();
  });

  // ── AC2: No tasks globally → FR46 empty state ──────────────────────────────

  test("[P0] no tasks shows empty-no-tasks message (AC2 / FR46)", async ({ page }) => {
    await page.addInitScript((data) => {
      localStorage.setItem("app-language", "en");
      localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
    }, buildEmptySeed());
    await blockKnownThirdPartyHosts(page);
    await page.goto("/earnings");
    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

    await expect(page.getByTestId("earnings-empty-no-tasks")).toBeVisible();
    await expect(page.getByTestId("earnings-metrics")).not.toBeVisible();
  });

  // ── AC3: Tasks exist but none in date range → FR47 ─────────────────────────

  test(
    "[P0] tasks outside date range shows no-period-data message (AC3 / FR47)",
    async ({ page }) => {
      await page.addInitScript((data) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
      }, buildOutOfRangeSeed());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Default preset is last30 — the task is 60 days old, outside the range
      await expect(page.getByTestId("earnings-empty-no-period-data")).toBeVisible();
      await expect(page.getByTestId("earnings-metrics")).not.toBeVisible();
    },
  );

  // ── AC4: Billable filter active + no billable tasks → FR48 ─────────────────

  test(
    "[P0] billable filter with no billable tasks shows no-billable-work message (AC4 / FR48)",
    async ({ page }) => {
      // Two separate addInitScript calls — Playwright accepts one serializable
      // arg per call; two seeds require two calls (Dev Agent correction note).
      await page.addInitScript((taskData) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(taskData));
      }, buildNonBillableSeed());
      await page.addInitScript((dashData) => {
        localStorage.setItem("earnings-dashboard-state", JSON.stringify(dashData));
      }, buildDashboardStateBillable());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      await expect(page.getByTestId("earnings-empty-no-billable-work")).toBeVisible();
      await expect(page.getByTestId("earnings-metrics")).not.toBeVisible();
    },
  );

  // ── AC6: Edge case data (zero revenue) → cards render without error ─────────

  test(
    "[P1] zero-revenue edge case renders metric cards correctly (AC6 / FR50)",
    async ({ page }) => {
      await page.addInitScript((data) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
      }, buildZeroRevenueSeed());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Task has timeSpent=0 and hourlyRate=0 — must display $0.00, not crash
      const metricsGrid = page.getByTestId("earnings-metrics");
      await expect(metricsGrid).toBeVisible();
      await expect(metricsGrid.getByText("$0.00").first()).toBeVisible();
    },
  );
});
