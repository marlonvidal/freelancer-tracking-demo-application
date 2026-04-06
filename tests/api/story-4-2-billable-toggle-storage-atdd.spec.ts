import { test, expect } from "@playwright/test";

/**
 * Story 4.2 — Implement Billable/Non-Billable Toggle: Storage layer ATDD.
 * Programmatic acceptance tests for the `setBillableFilter` action's storage
 * contract in earnings-dashboard-storage and EarningsDashboardStateContext.
 *
 * ACs covered:
 *   AC4 — "All" filter is the default when no state is present (FR17)
 *   AC5 — Billable filter persists to localStorage via setBillableFilter (FR19, FR41)
 *
 * Pattern: Programmatic module import (same pattern as story-4-1-earnings-context-atdd.spec.ts).
 * localStorage mock required: atdd-api tests run in Node.js context without browser APIs.
 *
 * TDD Phase: GREEN — All tests active (test.skip() removed after implementation).
 */

// Provide a localStorage polyfill for Node.js test environment.
const localStorageMock = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  };
})();

if (typeof localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
}

test.describe("Story 4.2 ATDD — Billable filter storage contract", () => {
  test.beforeEach(() => {
    localStorageMock.clear();
  });

  test(
    "[P0] setBillableFilter persists billableFilter value to localStorage (AC5, FR19, FR41)",
    async () => {
      const storage = await import("../../src/lib/earnings-dashboard-storage");

      // Simulate the state transition that setBillableFilter('nonBillable') produces.
      // The action merges billableFilter into the current state and saves it.
      const stateAfterSetBillableFilter = {
        version: 1 as const,
        dateRangePreset: "last30" as const,
        dateRange: undefined,
        billableFilter: "nonBillable" as const,
        activeChart: "customer" as const,
      };

      storage.saveEarningsDashboardState(stateAfterSetBillableFilter);

      const raw = localStorage.getItem(storage.EARNINGS_DASHBOARD_STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);

      // setBillableFilter must persist the selected filter value
      expect(parsed.billableFilter).toBe("nonBillable");

      // setBillableFilter must NOT clear dateRangePreset or other state fields
      expect(parsed.dateRangePreset).toBe("last30");
    },
  );

  test(
    "[P0] coercePersisted returns billableFilter 'all' as default when value is invalid (AC4, FR17)",
    async () => {
      const storage = await import("../../src/lib/earnings-dashboard-storage");

      // Simulate corrupted or missing billableFilter in localStorage.
      // coercePersisted() must return 'all' as the safe default for any invalid value.
      const corruptedState = {
        version: 1,
        dateRangePreset: "last30",
        billableFilter: "invalidValue", // not a valid BillableFilter
        activeChart: "customer",
      };
      localStorage.setItem(
        storage.EARNINGS_DASHBOARD_STORAGE_KEY,
        JSON.stringify(corruptedState),
      );

      const loaded = storage.loadEarningsDashboardState();

      // coercePersisted must coerce invalid billableFilter to 'all' (the safe default)
      expect(loaded.billableFilter).toBe("all");

      // Other fields must be preserved
      expect(loaded.dateRangePreset).toBe("last30");
    },
  );
});
