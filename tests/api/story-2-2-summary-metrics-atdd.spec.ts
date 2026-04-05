import { test, expect } from "@playwright/test";

import type { Client, Task } from "../../src/types";

/**
 * Story 2.2 — Summary metrics calculations (ATDD).
 * No HTTP surface; programmatic acceptance tests for `calculateSummaryMetrics`
 * in `src/lib/earnings-calculations.ts`.
 *
 * TDD RED PHASE: All tests are skipped until `calculateSummaryMetrics` is implemented.
 * Remove `test.skip()` from each test after implementation to enter green phase.
 *
 * ACs covered: 1–9 (FR21–FR27, FR50)
 */

function task(overrides: Partial<Task> & Pick<Task, "id">): Task {
  return {
    title: "ATDD task",
    description: "",
    columnId: "col-1",
    clientId: "client-1",
    priority: "medium",
    isBillable: true,
    hourlyRate: null,
    timeEstimate: null,
    timeSpent: 3600,
    createdAt: 1_700_000_000_000,
    dueDate: null,
    tags: [],
    order: 0,
    ...overrides,
  };
}

const OPEN_RANGE = { startMs: 0, endMs: 9_999_999_999_999 };

test.describe("Story 2.2 ATDD — calculateSummaryMetrics", () => {
  test(
    "[P0] basic billable task produces correct totalRevenue, billableRevenue, averageHourlyRate, taskCounts (AC1)",
    async () => {
      const ec = await import("../../src/lib/earnings-calculations");
      const clients: Client[] = [
        { id: "client-1", name: "Acme", hourlyRate: 100, color: "#000" },
      ];
      // 1 billable task, 1 hour at $100/hr → revenue=$100, avg=$100
      const tasks = [
        task({
          id: "t1",
          isBillable: true,
          timeSpent: 3600,
          hourlyRate: null,
          createdAt: 1,
        }),
      ];
      const metrics = ec.calculateSummaryMetrics(
        tasks,
        clients,
        OPEN_RANGE,
        "all",
      );
      expect(metrics.totalRevenue).toBeCloseTo(100, 5);
      expect(metrics.billableRevenue).toBeCloseTo(100, 5);
      expect(metrics.nonBillableRevenue).toBe(0);
      expect(metrics.averageHourlyRate).toBeCloseTo(100, 5);
      expect(metrics.totalTaskCount).toBe(1);
      expect(metrics.billableTaskCount).toBe(1);
    },
  );

  test(
    "[P0] non-billable task produces totalRevenue=0 and billableTaskCount=0 (AC6)",
    async () => {
      const ec = await import("../../src/lib/earnings-calculations");
      const clients: Client[] = [
        { id: "client-1", name: "Acme", hourlyRate: 200, color: "#000" },
      ];
      const tasks = [
        task({ id: "t1", isBillable: false, timeSpent: 3600, createdAt: 1 }),
      ];
      const metrics = ec.calculateSummaryMetrics(
        tasks,
        clients,
        OPEN_RANGE,
        "all",
      );
      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.billableRevenue).toBe(0);
      expect(metrics.nonBillableRevenue).toBe(0);
      expect(metrics.totalTaskCount).toBe(1);
      expect(metrics.billableTaskCount).toBe(0);
    },
  );

  test(
    "[P0] mixed billable/non-billable tasks with billableFilter='all' counts both (AC1, AC5)",
    async () => {
      const ec = await import("../../src/lib/earnings-calculations");
      const clients: Client[] = [
        { id: "client-1", name: "Acme", hourlyRate: 50, color: "#000" },
      ];
      const tasks = [
        task({ id: "b1", isBillable: true, timeSpent: 3600, createdAt: 1 }),
        task({ id: "nb1", isBillable: false, timeSpent: 3600, createdAt: 2 }),
      ];
      const metrics = ec.calculateSummaryMetrics(
        tasks,
        clients,
        OPEN_RANGE,
        "all",
      );
      expect(metrics.totalTaskCount).toBe(2);
      expect(metrics.billableTaskCount).toBe(1);
      expect(metrics.billableRevenue).toBeCloseTo(50, 5);
      expect(metrics.totalRevenue).toBeCloseTo(50, 5);
    },
  );

  test(
    "[P0] billableFilter='billable' excludes non-billable tasks from all metrics (AC5, FR15, FR18)",
    async () => {
      const ec = await import("../../src/lib/earnings-calculations");
      const clients: Client[] = [
        { id: "client-1", name: "Acme", hourlyRate: 80, color: "#000" },
      ];
      const tasks = [
        task({ id: "b1", isBillable: true, timeSpent: 3600, createdAt: 1 }),
        task({ id: "nb1", isBillable: false, timeSpent: 3600, createdAt: 2 }),
      ];
      const metrics = ec.calculateSummaryMetrics(
        tasks,
        clients,
        OPEN_RANGE,
        "billable",
      );
      expect(metrics.totalTaskCount).toBe(1);
      expect(metrics.billableTaskCount).toBe(1);
      expect(metrics.billableRevenue).toBeCloseTo(80, 5);
      expect(metrics.totalRevenue).toBeCloseTo(80, 5);
    },
  );

  test(
    "[P1] billableFilter='nonBillable' returns all-zero revenue but correct totalTaskCount (AC6, FR16)",
    async () => {
      const ec = await import("../../src/lib/earnings-calculations");
      const clients: Client[] = [
        { id: "client-1", name: "Acme", hourlyRate: 80, color: "#000" },
      ];
      const tasks = [
        task({ id: "b1", isBillable: true, timeSpent: 3600, createdAt: 1 }),
        task({ id: "nb1", isBillable: false, timeSpent: 3600, createdAt: 2 }),
        task({ id: "nb2", isBillable: false, timeSpent: 1800, createdAt: 3 }),
      ];
      const metrics = ec.calculateSummaryMetrics(
        tasks,
        clients,
        OPEN_RANGE,
        "nonBillable",
      );
      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.billableRevenue).toBe(0);
      expect(metrics.nonBillableRevenue).toBe(0);
      expect(metrics.totalTaskCount).toBe(2);
      expect(metrics.billableTaskCount).toBe(0);
    },
  );

  test(
    "[P0] empty task list returns all-zero SummaryMetrics without throwing (AC4)",
    async () => {
      const ec = await import("../../src/lib/earnings-calculations");
      const metrics = ec.calculateSummaryMetrics([], [], OPEN_RANGE, "all");
      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.billableRevenue).toBe(0);
      expect(metrics.nonBillableRevenue).toBe(0);
      expect(metrics.averageHourlyRate).toBe(0);
      expect(metrics.totalTaskCount).toBe(0);
      expect(metrics.billableTaskCount).toBe(0);
    },
  );

  test(
    "[P1] date range filter excludes tasks outside the window (AC2, FR13)",
    async () => {
      const ec = await import("../../src/lib/earnings-calculations");
      const clients: Client[] = [
        { id: "client-1", name: "Acme", hourlyRate: 100, color: "#000" },
      ];
      const range = { startMs: 1000, endMs: 2000 };
      const tasks = [
        task({
          id: "in",
          isBillable: true,
          timeSpent: 3600,
          createdAt: 1500,
        }),
        task({
          id: "before",
          isBillable: true,
          timeSpent: 3600,
          createdAt: 500,
        }),
        task({
          id: "after",
          isBillable: true,
          timeSpent: 3600,
          createdAt: 3000,
        }),
      ];
      const metrics = ec.calculateSummaryMetrics(tasks, clients, range, "all");
      expect(metrics.totalTaskCount).toBe(1);
      expect(metrics.billableTaskCount).toBe(1);
      expect(metrics.totalRevenue).toBeCloseTo(100, 5);
    },
  );

  test(
    "[P0] timeSpent=0 on all billable tasks → averageHourlyRate=0, never Infinity or NaN (AC9)",
    async () => {
      const ec = await import("../../src/lib/earnings-calculations");
      const clients: Client[] = [
        { id: "client-1", name: "Acme", hourlyRate: 100, color: "#000" },
      ];
      const tasks = [
        task({ id: "t1", isBillable: true, timeSpent: 0, createdAt: 1 }),
      ];
      const metrics = ec.calculateSummaryMetrics(
        tasks,
        clients,
        OPEN_RANGE,
        "all",
      );
      expect(metrics.averageHourlyRate).toBe(0);
      expect(Number.isFinite(metrics.averageHourlyRate)).toBe(true);
      expect(Number.isNaN(metrics.averageHourlyRate)).toBe(false);
    },
  );

  test(
    "[P1] clientId=null task with no task-level hourlyRate produces 0 revenue safely (AC8, FR50)",
    async () => {
      const ec = await import("../../src/lib/earnings-calculations");
      const tasks = [
        task({
          id: "t1",
          isBillable: true,
          clientId: null,
          hourlyRate: null,
          timeSpent: 3600,
          createdAt: 1,
        }),
      ];
      let threw = false;
      let metrics: ReturnType<typeof ec.calculateSummaryMetrics> | null = null;
      try {
        metrics = ec.calculateSummaryMetrics(tasks, [], OPEN_RANGE, "all");
      } catch {
        threw = true;
      }
      expect(threw).toBe(false);
      expect(metrics?.totalRevenue).toBe(0);
      expect(metrics?.averageHourlyRate).toBe(0);
    },
  );

  test(
    "[P1] task-level hourlyRate override wins over client hourlyRate (AC7, FR26 nullish precedence)",
    async () => {
      const ec = await import("../../src/lib/earnings-calculations");
      const clients: Client[] = [
        { id: "client-1", name: "Acme", hourlyRate: 50, color: "#000" },
      ];
      // Task hourlyRate=200 must win over client hourlyRate=50
      const tasks = [
        task({
          id: "t1",
          isBillable: true,
          timeSpent: 3600,
          hourlyRate: 200,
          createdAt: 1,
        }),
      ];
      const metrics = ec.calculateSummaryMetrics(
        tasks,
        clients,
        OPEN_RANGE,
        "all",
      );
      expect(metrics.totalRevenue).toBeCloseTo(200, 5);
      expect(metrics.averageHourlyRate).toBeCloseTo(200, 5);
    },
  );

  test(
    "[P0] totalRevenue always equals billableRevenue; nonBillableRevenue is always 0 (AC7, FR26)",
    async () => {
      const ec = await import("../../src/lib/earnings-calculations");
      const clients: Client[] = [
        { id: "client-1", name: "Acme", hourlyRate: 75, color: "#000" },
      ];
      const tasks = [
        task({ id: "b", isBillable: true, timeSpent: 3600, createdAt: 1 }),
        task({ id: "nb", isBillable: false, timeSpent: 3600, createdAt: 2 }),
      ];
      const metrics = ec.calculateSummaryMetrics(
        tasks,
        clients,
        OPEN_RANGE,
        "all",
      );
      expect(metrics.totalRevenue).toBe(metrics.billableRevenue);
      expect(metrics.nonBillableRevenue).toBe(0);
    },
  );
});
