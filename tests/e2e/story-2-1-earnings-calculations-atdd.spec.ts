import { test, expect } from "@playwright/test";

import type { Client, Column, Task } from "../../src/types";

/**
 * Story 2.1 — Aggregation acceptance (ATDD) for earnings utilities.
 * Exercises calculateRevenueByCustomer / Project / Tag and edge cases from AC1–AC9.
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

test.describe("Story 2.1 ATDD — earnings aggregations", () => {
  test("[P0] calculateRevenueByCustomer buckets null clientId as Unassigned", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const clients: Client[] = [
      { id: "c1", name: "Alpha", hourlyRate: 100, color: "#111" },
    ];
    const range = { startMs: 0, endMs: 9_999_999_999_999 };
    const tasks: Task[] = [
      task({
        id: "a",
        clientId: null,
        columnId: "col-1",
        isBillable: true,
        timeSpent: 3600,
        hourlyRate: 75,
        createdAt: 1,
      }),
    ];
    const rows = ec.calculateRevenueByCustomer(tasks, clients, range, "all");
    const unassigned = rows.find((r) => r.customerId === null);
    expect(unassigned?.customerName).toBe("Unassigned");
    expect(unassigned?.taskCount).toBe(1);
    expect(unassigned?.totalRevenue).toBeCloseTo(75, 5);
  });

  test("[P0] calculateRevenueByCustomer sums revenue and taskCount per client", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const clients: Client[] = [
      { id: "c1", name: "Alpha", hourlyRate: 50, color: "#111" },
    ];
    const range = { startMs: 0, endMs: 9_999_999_999_999 };
    const tasks: Task[] = [
      task({
        id: "t1",
        clientId: "c1",
        isBillable: true,
        timeSpent: 3600,
        createdAt: 1,
      }),
      task({
        id: "t2",
        clientId: "c1",
        isBillable: true,
        timeSpent: 3600,
        createdAt: 2,
      }),
    ];
    const rows = ec.calculateRevenueByCustomer(tasks, clients, range, "all");
    const alpha = rows.find((r) => r.customerId === "c1");
    expect(alpha?.taskCount).toBe(2);
    expect(alpha?.totalRevenue).toBeCloseTo(100, 5);
  });

  test("[P0] calculateRevenueByProject aligns rows to Column.title", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const columns: Column[] = [
      { id: "col-a", title: "Backlog", order: 0 },
      { id: "col-b", title: "Done", order: 1 },
    ];
    const range = { startMs: 0, endMs: 9_999_999_999_999 };
    const tasks: Task[] = [
      task({
        id: "t1",
        columnId: "col-a",
        clientId: null,
        hourlyRate: 40,
        isBillable: true,
        timeSpent: 3600,
        createdAt: 1,
      }),
    ];
    const rows = ec.calculateRevenueByProject(tasks, columns, range, "all");
    const row = rows.find((r) => r.columnId === "col-a");
    expect(row?.columnTitle).toBe("Backlog");
    expect(row?.taskCount).toBe(1);
    expect(row?.totalRevenue).toBeCloseTo(40, 5);
  });

  test("[P0] calculateRevenueByTag splits revenue evenly and trims tag keys", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const range = { startMs: 0, endMs: 9_999_999_999_999 };
    const tasks: Task[] = [
      task({
        id: "t1",
        tags: ["  alpha ", "beta"],
        hourlyRate: 60,
        isBillable: true,
        timeSpent: 3600,
        clientId: null,
        createdAt: 1,
      }),
    ];
    const rows = ec.calculateRevenueByTag(tasks, range, "all");
    const alpha = rows.find((r) => r.tag === "alpha");
    const beta = rows.find((r) => r.tag === "beta");
    expect(alpha?.totalRevenue).toBeCloseTo(30, 5);
    expect(beta?.totalRevenue).toBeCloseTo(30, 5);
  });

  test("[P0] calculateRevenueByTag counts each tagged bucket per task (multi-tag)", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const range = { startMs: 0, endMs: 9_999_999_999_999 };
    const tasks: Task[] = [
      task({
        id: "t1",
        tags: ["a", "b"],
        hourlyRate: 100,
        isBillable: true,
        timeSpent: 3600,
        clientId: null,
        createdAt: 1,
      }),
    ];
    const rows = ec.calculateRevenueByTag(tasks, range, "all");
    expect(rows.find((r) => r.tag === "a")?.taskCount).toBe(1);
    expect(rows.find((r) => r.tag === "b")?.taskCount).toBe(1);
  });

  test("[P0] calculateRevenueByTag uses Untagged for empty tags with taskCount 1", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const range = { startMs: 0, endMs: 9_999_999_999_999 };
    const tasks: Task[] = [
      task({
        id: "t1",
        tags: [],
        hourlyRate: 90,
        isBillable: true,
        timeSpent: 3600,
        clientId: null,
        createdAt: 1,
      }),
    ];
    const rows = ec.calculateRevenueByTag(tasks, range, "all");
    const untagged = rows.find((r) => r.tag === "Untagged");
    expect(untagged?.taskCount).toBe(1);
    expect(untagged?.totalRevenue).toBeCloseTo(90, 5);
  });

  test("[P1] nonBillable filter: aggregators include task with revenue 0 but taskCount", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const clients: Client[] = [
      { id: "c1", name: "Alpha", hourlyRate: 200, color: "#111" },
    ];
    const columns: Column[] = [{ id: "col-1", title: "Todo", order: 0 }];
    const range = { startMs: 0, endMs: 9_999_999_999_999 };
    const tasks: Task[] = [
      task({
        id: "nb",
        clientId: "c1",
        columnId: "col-1",
        isBillable: false,
        timeSpent: 3600,
        createdAt: 1,
      }),
    ];
    const byCustomer = ec.calculateRevenueByCustomer(
      tasks,
      clients,
      range,
      "nonBillable",
    );
    const row = byCustomer.find((r) => r.customerId === "c1");
    expect(row?.totalRevenue).toBe(0);
    expect(row?.taskCount).toBe(1);
  });

  test("[P0] aggregators exclude tasks outside createdAt date window", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const clients: Client[] = [
      { id: "c1", name: "Alpha", hourlyRate: 100, color: "#111" },
    ];
    const columns: Column[] = [{ id: "col-1", title: "Todo", order: 0 }];
    const range = { startMs: 1000, endMs: 2000 };
    const tasks: Task[] = [
      task({
        id: "in",
        clientId: "c1",
        columnId: "col-1",
        createdAt: 1500,
        isBillable: true,
        timeSpent: 3600,
      }),
      task({
        id: "out",
        clientId: "c1",
        columnId: "col-1",
        createdAt: 500,
        isBillable: true,
        timeSpent: 3600,
      }),
    ];
    const rows = ec.calculateRevenueByCustomer(tasks, clients, range, "all");
    expect(rows.find((r) => r.customerId === "c1")?.taskCount).toBe(1);
  });

  test("[P1] empty task list returns empty arrays without throwing", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const clients: Client[] = [];
    const columns: Column[] = [];
    const range = { startMs: 0, endMs: 1 };
    expect(ec.calculateRevenueByCustomer([], clients, range, "all")).toEqual([]);
    expect(ec.calculateRevenueByProject([], columns, range, "all")).toEqual([]);
    expect(ec.calculateRevenueByTag([], range, "all")).toEqual([]);
  });
});
