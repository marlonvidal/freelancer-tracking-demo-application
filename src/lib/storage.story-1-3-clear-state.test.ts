import { describe, it, expect, beforeEach } from "vitest";
import { EARNINGS_DASHBOARD_STORAGE_KEY } from "./earnings-dashboard-storage";
import { clearState } from "./storage";

/**
 * Story 1.3 — AC4: clearState() removes `earnings-dashboard-state` alongside Kanban data.
 */

describe("Story 1.3 — clearState clears earnings dashboard storage key", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("[P0] clearState removes freelancer-kanban-data and earnings-dashboard-state (AC4)", () => {
    localStorage.setItem("freelancer-kanban-data", '{"tasks":[]}');
    localStorage.setItem(
      EARNINGS_DASHBOARD_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        billableFilter: "billable",
        dateRangePreset: "last30",
        activeChart: "customer",
      }),
    );

    clearState();

    expect(localStorage.getItem("freelancer-kanban-data")).toBeNull();
    expect(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)).toBeNull();
  });
});
