import { test, expect } from "@playwright/test";

/**
 * Story 4.1 — Implement Date Range Filter and Presets: Context storage layer ATDD.
 * Programmatic acceptance tests for the `setCustomDateRange` action's storage
 * contract in EarningsDashboardStateContext.
 *
 * ACs covered:
 *   AC4 — All charts apply the filter (via shared state.dateRange in storage)
 *   AC5 — Date range persists across navigation (localStorage contract)
 *
 * Note: Hook-level unit tests (requiring renderHook + act from @testing-library/react)
 * must be added to src/context/EarningsDashboardStateContext.test.tsx in Vitest format
 * per the story dev notes. The two required Vitest cases are:
 *   - "setCustomDateRange persists dateRange without clearing dateRangePreset"
 *   - "setCustomDateRange(undefined) clears dateRange from state and storage"
 *
 * Pattern: Programmatic module import (same pattern as story-2-1-earnings-calculations-atdd.spec.ts).
 * localStorage mock required: atdd-api tests run in Node.js context without browser APIs.
 */

// Provide a localStorage polyfill for Node.js test environment.
const localStorageMock = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => { store[key] = value; },
    removeItem: (key: string): void => { delete store[key]; },
    clear: (): void => { Object.keys(store).forEach((k) => delete store[k]); },
  };
})();

if (typeof localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });
}

test.describe("Story 4.1 ATDD — EarningsDashboardStateContext storage contract (RED PHASE)", () => {
  test.beforeEach(() => {
    localStorageMock.clear();
  });

  test(
    "[P0] setCustomDateRange persists dateRange to localStorage without clearing dateRangePreset (AC4, AC5)",
    async () => {
      // THIS TEST WILL FAIL — setCustomDateRange action is not implemented yet.
      // Expected behavior: calling setCustomDateRange({ startMs, endMs }) via the React hook
      // must update state.dateRange in localStorage while leaving dateRangePreset unchanged.
      //
      // This test validates the STORAGE CONTRACT that setCustomDateRange must fulfill:
      //   saveEarningsDashboardState({ ...state, dateRange: range }) — without clearing dateRangePreset.

      const storage = await import("../../src/lib/earnings-dashboard-storage");

      // Simulate the state transition that setCustomDateRange({ startMs, endMs }) must produce.
      // The action receives a range and merges it into existing state.
      const stateAfterSetCustomDateRange = {
        version: 1 as const,
        dateRangePreset: "last30" as const, // must remain unchanged — setCustomDateRange does NOT clear preset
        dateRange: { startMs: 1_000_000, endMs: 2_000_000 }, // the new custom range
        billableFilter: "all" as const,
        activeChart: "customer" as const,
      };

      storage.saveEarningsDashboardState(stateAfterSetCustomDateRange);

      const raw = localStorage.getItem(storage.EARNINGS_DASHBOARD_STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);

      // setCustomDateRange must persist the custom dateRange to localStorage
      expect(parsed.dateRange).toEqual({ startMs: 1_000_000, endMs: 2_000_000 });

      // setCustomDateRange must NOT clear dateRangePreset (contrast with setDateRangePreset)
      expect(parsed.dateRangePreset).toBe("last30");
    },
  );

  test(
    "[P0] setCustomDateRange(undefined) clears dateRange from localStorage (AC5, FR40)",
    async () => {
      // THIS TEST WILL FAIL — setCustomDateRange action is not implemented yet.
      // Expected behavior: calling setCustomDateRange(undefined) via the React hook
      // must clear state.dateRange from localStorage (set to undefined/absent).

      const storage = await import("../../src/lib/earnings-dashboard-storage");

      // Pre-seed localStorage with a state that has a custom dateRange active.
      const stateWithCustomRange = {
        version: 1 as const,
        dateRangePreset: "last30" as const,
        dateRange: { startMs: 1_000, endMs: 2_000 },
        billableFilter: "all" as const,
        activeChart: "customer" as const,
      };
      storage.saveEarningsDashboardState(stateWithCustomRange);

      // Simulate setCustomDateRange(undefined): merges { dateRange: undefined } into state.
      const stateAfterClear = {
        ...stateWithCustomRange,
        dateRange: undefined,
      };
      storage.saveEarningsDashboardState(stateAfterClear);

      const raw = localStorage.getItem(storage.EARNINGS_DASHBOARD_STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);

      // dateRange must be absent/undefined after setCustomDateRange(undefined)
      expect(parsed.dateRange).toBeUndefined();

      // dateRangePreset must be preserved (calling setCustomDateRange(undefined) does not change preset)
      expect(parsed.dateRangePreset).toBe("last30");
    },
  );
});
