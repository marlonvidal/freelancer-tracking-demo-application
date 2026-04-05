import { describe, expect, it } from "vitest";

import type { Client, Column, Task } from "@/types";

import {
  calculateRevenueByCustomer,
  calculateRevenueByProject,
  calculateRevenueByTag,
  calculateSummaryMetrics,
  filterTasksForEarnings,
  getEffectiveHourlyRate,
  getTaskBillableRevenue,
  resolveDateRangeFromPreset,
  resolveDateRangeMs,
} from "./earnings-calculations";

function task(overrides: Partial<Task> & Pick<Task, "id">): Task {
  return {
    title: "unit",
    description: "",
    columnId: "col-1",
    clientId: "c1",
    priority: "medium",
    isBillable: true,
    hourlyRate: null,
    timeEstimate: null,
    timeSpent: 3600,
    createdAt: 1,
    dueDate: null,
    tags: [],
    order: 0,
    ...overrides,
  };
}

const clients: Client[] = [
  { id: "c1", name: "Acme", hourlyRate: 100, color: "#000" },
];

describe("filterTasksForEarnings", () => {
  const wide = { startMs: 0, endMs: 9_999_999_999_999 };

  it("filters by inclusive createdAt (start and end boundaries)", () => {
    const tasks = [
      task({ id: "atStart", createdAt: 100 }),
      task({ id: "atEnd", createdAt: 200 }),
      task({ id: "lo", createdAt: 99 }),
      task({ id: "hi", createdAt: 201 }),
    ];
    const out = filterTasksForEarnings(
      tasks,
      { startMs: 100, endMs: 200 },
      "all",
    );
    expect(out.map((t) => t.id).sort()).toEqual(["atEnd", "atStart"]);
  });

  it("applies billable filters", () => {
    const tasks = [
      task({ id: "b", isBillable: true }),
      task({ id: "n", isBillable: false }),
    ];
    expect(filterTasksForEarnings(tasks, wide, "billable").map((t) => t.id)).toEqual(
      ["b"],
    );
    expect(
      filterTasksForEarnings(tasks, wide, "nonBillable").map((t) => t.id),
    ).toEqual(["n"]);
    expect(filterTasksForEarnings(tasks, wide, "all")).toHaveLength(2);
  });
});

describe("getEffectiveHourlyRate / getTaskBillableRevenue (FR26 parity)", () => {
  it("returns 0 when clientId is set but client is not in the list", () => {
    const t = task({ id: "orphan", clientId: "missing", hourlyRate: null });
    expect(getEffectiveHourlyRate(t, clients)).toBe(0);
    expect(getTaskBillableRevenue(t, clients)).toBe(0);
  });

  it("uses nullish rate precedence (0 on task does not fall through to client)", () => {
    const t = task({ id: "t", hourlyRate: 0, clientId: "c1" });
    expect(getEffectiveHourlyRate(t, clients)).toBe(0);
  });

  it("computes billable revenue from timeSpent only", () => {
    const t = task({
      id: "t",
      isBillable: true,
      hourlyRate: null,
      clientId: "c1",
      timeSpent: 1800,
    });
    expect(getTaskBillableRevenue(t, clients)).toBeCloseTo(50, 5);
    expect(getTaskBillableRevenue({ ...t, isBillable: false }, clients)).toBe(0);
  });

  it("matches aggregation primitive for a known task", () => {
    const t = task({
      id: "t",
      isBillable: true,
      hourlyRate: 60,
      clientId: null,
      timeSpent: 3600,
    });
    const direct = getTaskBillableRevenue(t, []);
    const rows = calculateRevenueByCustomer([t], [], { startMs: 0, endMs: 10 }, "all");
    const u = rows.find((r) => r.customerId === null);
    expect(u?.totalRevenue).toBeCloseTo(direct, 8);
  });
});

describe("resolveDateRangeFromPreset / resolveDateRangeMs", () => {
  it("last30 yields ordered finite window", () => {
    const nowMs = new Date("2026-04-05T15:30:00.000Z").getTime();
    const r = resolveDateRangeFromPreset("last30", nowMs);
    expect(r.startMs).toBeLessThanOrEqual(r.endMs);
    expect(Number.isFinite(r.startMs)).toBe(true);
  });

  it("'all' preset uses safe integer sentinels for unbounded filtering", () => {
    const r = resolveDateRangeFromPreset("all", Date.now());
    expect(r).toEqual({
      startMs: Number.MIN_SAFE_INTEGER,
      endMs: Number.MAX_SAFE_INTEGER,
    });
  });

  it("uses custom range when valid", () => {
    const r = resolveDateRangeMs(
      {
        dateRangePreset: "year",
        dateRange: { startMs: 10, endMs: 20 },
      },
      Date.now(),
    );
    expect(r).toEqual({ startMs: 10, endMs: 20 });
  });

  it("ignores invalid custom range", () => {
    const nowMs = new Date("2026-01-01T00:00:00.000Z").getTime();
    const r = resolveDateRangeMs(
      {
        dateRangePreset: "last30",
        dateRange: { startMs: 200, endMs: 100 },
      },
      nowMs,
    );
    expect(r.startMs).toBeLessThanOrEqual(r.endMs);
  });

  it("ignores custom range with non-finite timestamps", () => {
    const nowMs = new Date("2026-06-01T12:00:00.000Z").getTime();
    const r = resolveDateRangeMs(
      {
        dateRangePreset: "last30",
        dateRange: { startMs: Number.NaN, endMs: 100 },
      },
      nowMs,
    );
    expect(Number.isFinite(r.startMs)).toBe(true);
    expect(Number.isFinite(r.endMs)).toBe(true);
  });
});

describe("aggregations", () => {
  const range = { startMs: 0, endMs: 9_999_999_999_999 };

  it("returns empty arrays for empty task lists", () => {
    expect(calculateRevenueByCustomer([], clients, range, "all")).toEqual([]);
    expect(calculateRevenueByProject([], [], range, "all")).toEqual([]);
    expect(calculateRevenueByTag([], range, "all")).toEqual([]);
  });

  it("uses Unknown customer name when clientId references missing client", () => {
    const tasks = [
      task({
        id: "x",
        clientId: "ghost",
        hourlyRate: null,
        isBillable: true,
        timeSpent: 3600,
      }),
    ];
    const rows = calculateRevenueByCustomer(tasks, [], range, "all");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.customerName).toBe("Unknown");
    expect(rows[0]?.totalRevenue).toBe(0);
    expect(rows[0]?.taskCount).toBe(1);
  });

  it("nonBillable filter still counts tasks with zero revenue (AC5)", () => {
    const tasks = [
      task({
        id: "nb",
        isBillable: false,
        clientId: "c1",
        hourlyRate: null,
        timeSpent: 3600,
      }),
    ];
    const rows = calculateRevenueByCustomer(tasks, clients, range, "nonBillable");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.totalRevenue).toBe(0);
    expect(rows[0]?.taskCount).toBe(1);
  });

  it("calculateRevenueByProject uses optional clients for rate", () => {
    const columns: Column[] = [{ id: "col-x", title: "X", order: 0 }];
    const tasks = [
      task({
        id: "t1",
        columnId: "col-x",
        clientId: "c1",
        hourlyRate: null,
        isBillable: true,
        timeSpent: 3600,
      }),
    ];
    const rows = calculateRevenueByProject(tasks, columns, range, "all", clients);
    expect(rows[0]?.totalRevenue).toBeCloseTo(100, 5);
  });

  it("calculateRevenueByProject uses empty column title when column is unknown", () => {
    const tasks = [
      task({
        id: "orphan-col",
        columnId: "no-such-column",
        hourlyRate: 40,
        isBillable: true,
        timeSpent: 3600,
        clientId: null,
      }),
    ];
    const rows = calculateRevenueByProject(tasks, [], range, "all");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.columnTitle).toBe("");
    expect(rows[0]?.totalRevenue).toBeCloseTo(40, 5);
  });

  it("calculateRevenueByTag uses optional clients for rate", () => {
    const tasks = [
      task({
        id: "t1",
        tags: ["x"],
        clientId: "c1",
        hourlyRate: null,
        isBillable: true,
        timeSpent: 3600,
      }),
    ];
    const rows = calculateRevenueByTag(tasks, range, "all", clients);
    expect(rows.find((r) => r.tag === "x")?.totalRevenue).toBeCloseTo(100, 5);
  });

  it("trims tag strings for stable keys", () => {
    const tasks = [
      task({
        id: "t1",
        tags: ["  alpha  ", "beta"],
        hourlyRate: 100,
        isBillable: true,
        timeSpent: 3600,
        clientId: null,
      }),
    ];
    const rows = calculateRevenueByTag(tasks, range, "all");
    const alpha = rows.find((r) => r.tag === "alpha");
    const beta = rows.find((r) => r.tag === "beta");
    expect(alpha?.totalRevenue).toBeCloseTo(50, 5);
    expect(beta?.totalRevenue).toBeCloseTo(50, 5);
    expect(alpha?.taskCount).toBe(1);
    expect(beta?.taskCount).toBe(1);
  });

  it("treats whitespace-only tags as Untagged", () => {
    const tasks = [
      task({
        id: "t1",
        tags: ["  ", "\t"],
        hourlyRate: 30,
        isBillable: true,
        timeSpent: 3600,
        clientId: null,
      }),
    ];
    const rows = calculateRevenueByTag(tasks, range, "all");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.tag).toBe("Untagged");
    expect(rows[0]?.totalRevenue).toBeCloseTo(30, 5);
    expect(rows[0]?.taskCount).toBe(1);
  });

  it("calculateRevenueByTag dedupes duplicate tag strings (single bucket, full revenue)", () => {
    const tasks = [
      task({
        id: "t1",
        tags: ["dup", "dup"],
        hourlyRate: 80,
        isBillable: true,
        timeSpent: 3600,
        clientId: null,
      }),
    ];
    const rows = calculateRevenueByTag(tasks, range, "all");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.tag).toBe("dup");
    expect(rows[0]?.totalRevenue).toBeCloseTo(80, 5);
    expect(rows[0]?.taskCount).toBe(1);
  });

  it("billable-only excludes non-billable from customer aggregation", () => {
    const tasks = [
      task({ id: "nb", isBillable: false, clientId: "c1", timeSpent: 3600 }),
    ];
    expect(calculateRevenueByCustomer(tasks, clients, range, "billable")).toEqual(
      [],
    );
  });
});

const OPEN_RANGE = { startMs: 0, endMs: 9_999_999_999_999 };

describe("calculateSummaryMetrics", () => {
  it("basic billable task produces correct totalRevenue, billableRevenue, averageHourlyRate, taskCounts", () => {
    const tasks = [
      task({ id: "t1", isBillable: true, timeSpent: 3600, hourlyRate: null, createdAt: 1 }),
    ];
    const metrics = calculateSummaryMetrics(tasks, clients, OPEN_RANGE, "all");
    expect(metrics.totalRevenue).toBeCloseTo(100, 5);
    expect(metrics.billableRevenue).toBeCloseTo(100, 5);
    expect(metrics.nonBillableRevenue).toBe(0);
    expect(metrics.averageHourlyRate).toBeCloseTo(100, 5);
    expect(metrics.totalTaskCount).toBe(1);
    expect(metrics.billableTaskCount).toBe(1);
  });

  it("non-billable task produces totalRevenue=0 and billableTaskCount=0", () => {
    const tasks = [
      task({ id: "t1", isBillable: false, timeSpent: 3600, createdAt: 1 }),
    ];
    const metrics = calculateSummaryMetrics(tasks, clients, OPEN_RANGE, "all");
    expect(metrics.totalRevenue).toBe(0);
    expect(metrics.billableRevenue).toBe(0);
    expect(metrics.nonBillableRevenue).toBe(0);
    expect(metrics.totalTaskCount).toBe(1);
    expect(metrics.billableTaskCount).toBe(0);
  });

  it("mixed billable/non-billable tasks with billableFilter='all' counts both", () => {
    const tasks = [
      task({ id: "b1", isBillable: true, timeSpent: 3600, createdAt: 1 }),
      task({ id: "nb1", isBillable: false, timeSpent: 3600, createdAt: 2 }),
    ];
    const metrics = calculateSummaryMetrics(tasks, clients, OPEN_RANGE, "all");
    expect(metrics.totalTaskCount).toBe(2);
    expect(metrics.billableTaskCount).toBe(1);
    expect(metrics.billableRevenue).toBeCloseTo(100, 5);
    expect(metrics.totalRevenue).toBeCloseTo(100, 5);
  });

  it("billableFilter='billable' excludes non-billable tasks from all metrics", () => {
    const tasks = [
      task({ id: "b1", isBillable: true, timeSpent: 3600, createdAt: 1 }),
      task({ id: "nb1", isBillable: false, timeSpent: 3600, createdAt: 2 }),
    ];
    const metrics = calculateSummaryMetrics(tasks, clients, OPEN_RANGE, "billable");
    expect(metrics.totalTaskCount).toBe(1);
    expect(metrics.billableTaskCount).toBe(1);
    expect(metrics.billableRevenue).toBeCloseTo(100, 5);
    expect(metrics.totalRevenue).toBeCloseTo(100, 5);
  });

  it("billableFilter='nonBillable' returns all-zero revenue but correct totalTaskCount", () => {
    const tasks = [
      task({ id: "b1", isBillable: true, timeSpent: 3600, createdAt: 1 }),
      task({ id: "nb1", isBillable: false, timeSpent: 3600, createdAt: 2 }),
      task({ id: "nb2", isBillable: false, timeSpent: 1800, createdAt: 3 }),
    ];
    const metrics = calculateSummaryMetrics(tasks, clients, OPEN_RANGE, "nonBillable");
    expect(metrics.totalRevenue).toBe(0);
    expect(metrics.billableRevenue).toBe(0);
    expect(metrics.nonBillableRevenue).toBe(0);
    expect(metrics.totalTaskCount).toBe(2);
    expect(metrics.billableTaskCount).toBe(0);
  });

  it("empty task list returns all-zero SummaryMetrics without throwing", () => {
    const metrics = calculateSummaryMetrics([], [], OPEN_RANGE, "all");
    expect(metrics.totalRevenue).toBe(0);
    expect(metrics.billableRevenue).toBe(0);
    expect(metrics.nonBillableRevenue).toBe(0);
    expect(metrics.averageHourlyRate).toBe(0);
    expect(metrics.totalTaskCount).toBe(0);
    expect(metrics.billableTaskCount).toBe(0);
  });

  it("date range filter excludes tasks outside the window", () => {
    const range = { startMs: 1000, endMs: 2000 };
    const tasks = [
      task({ id: "in", isBillable: true, timeSpent: 3600, createdAt: 1500 }),
      task({ id: "before", isBillable: true, timeSpent: 3600, createdAt: 500 }),
      task({ id: "after", isBillable: true, timeSpent: 3600, createdAt: 3000 }),
    ];
    const metrics = calculateSummaryMetrics(tasks, clients, range, "all");
    expect(metrics.totalTaskCount).toBe(1);
    expect(metrics.billableTaskCount).toBe(1);
    expect(metrics.totalRevenue).toBeCloseTo(100, 5);
  });

  it("timeSpent=0 on all billable tasks → averageHourlyRate=0, never Infinity or NaN", () => {
    const tasks = [
      task({ id: "t1", isBillable: true, timeSpent: 0, createdAt: 1 }),
    ];
    const metrics = calculateSummaryMetrics(tasks, clients, OPEN_RANGE, "all");
    expect(metrics.averageHourlyRate).toBe(0);
    expect(Number.isFinite(metrics.averageHourlyRate)).toBe(true);
    expect(Number.isNaN(metrics.averageHourlyRate)).toBe(false);
  });

  it("clientId=null task with no task-level hourlyRate produces 0 revenue safely", () => {
    const tasks = [
      task({ id: "t1", isBillable: true, clientId: null, hourlyRate: null, timeSpent: 3600, createdAt: 1 }),
    ];
    let threw = false;
    let metrics: ReturnType<typeof calculateSummaryMetrics> | null = null;
    try {
      metrics = calculateSummaryMetrics(tasks, [], OPEN_RANGE, "all");
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
    expect(metrics?.totalRevenue).toBe(0);
    expect(metrics?.averageHourlyRate).toBe(0);
  });

  it("task-level hourlyRate override wins over client hourlyRate", () => {
    const tasks = [
      task({ id: "t1", isBillable: true, timeSpent: 3600, hourlyRate: 200, createdAt: 1 }),
    ];
    const metrics = calculateSummaryMetrics(tasks, clients, OPEN_RANGE, "all");
    expect(metrics.totalRevenue).toBeCloseTo(200, 5);
    expect(metrics.averageHourlyRate).toBeCloseTo(200, 5);
  });

  it("totalRevenue always equals billableRevenue; nonBillableRevenue is always 0", () => {
    const tasks = [
      task({ id: "b", isBillable: true, timeSpent: 3600, createdAt: 1 }),
      task({ id: "nb", isBillable: false, timeSpent: 3600, createdAt: 2 }),
    ];
    const metrics = calculateSummaryMetrics(tasks, clients, OPEN_RANGE, "all");
    expect(metrics.totalRevenue).toBe(metrics.billableRevenue);
    expect(metrics.nonBillableRevenue).toBe(0);
  });

  it("[P1] weighted average hourly rate across multiple billable tasks with different rates", () => {
    // task1: 2h at $100/hr → revenue = $200
    // task2: 1h at $60/hr  → revenue = $60
    // weighted avg = $260 / 3h ≈ $86.67
    const twoClients: Client[] = [
      { id: "c1", name: "Acme", hourlyRate: 100, color: "#000" },
    ];
    const tasks = [
      task({ id: "t1", isBillable: true, timeSpent: 7200, hourlyRate: null, clientId: "c1", createdAt: 1 }),
      task({ id: "t2", isBillable: true, timeSpent: 3600, hourlyRate: 60, clientId: null, createdAt: 2 }),
    ];
    const metrics = calculateSummaryMetrics(tasks, twoClients, OPEN_RANGE, "all");
    expect(metrics.billableRevenue).toBeCloseTo(260, 5);
    expect(metrics.totalRevenue).toBeCloseTo(260, 5);
    expect(metrics.billableTaskCount).toBe(2);
    expect(metrics.totalTaskCount).toBe(2);
    // Weighted avg = 260 / (10800/3600) = 260 / 3 ≈ 86.667
    expect(metrics.averageHourlyRate).toBeCloseTo(260 / 3, 4);
  });
});
