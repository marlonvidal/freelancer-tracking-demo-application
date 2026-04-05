import { test, expect } from "@playwright/test";

import type { Client, Column, Task } from "../../src/types";

/**
 * Story 2.1 — Earnings calculation utilities (ATDD).
 * No HTTP surface; programmatic acceptance tests for `src/lib/earnings-calculations.ts`.
 * Dynamic imports keep the spec resilient if module paths change during refactors.
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

test.describe("Story 2.1 ATDD — earnings primitives", () => {
  test("[P0] resolveDateRangeFromPreset(last30, nowMs) returns finite startMs/endMs with start <= end", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const nowMs = new Date("2026-04-05T12:00:00.000Z").getTime();
    const range = ec.resolveDateRangeFromPreset("last30", nowMs);
    expect(typeof range.startMs).toBe("number");
    expect(typeof range.endMs).toBe("number");
    expect(range.startMs).toBeLessThanOrEqual(range.endMs);
  });

  test("[P0] resolveDateRangeFromPreset(all, nowMs) skips date filtering semantics (unbounded or documented sentinels)", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const nowMs = new Date("2026-04-05T12:00:00.000Z").getTime();
    const range = ec.resolveDateRangeFromPreset("all", nowMs);
    expect(range).toBeTruthy();
  });

  test("[P1] resolveDateRangeMs honors persisted custom dateRange when valid", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const nowMs = new Date("2026-04-05T12:00:00.000Z").getTime();
    const persisted = {
      version: 1,
      dateRangePreset: "last30" as const,
      dateRange: { startMs: 100, endMs: 200 },
      billableFilter: "all" as const,
      activeChart: "customer" as const,
    };
    const range = ec.resolveDateRangeMs(persisted, nowMs);
    expect(range.startMs).toBe(100);
    expect(range.endMs).toBe(200);
  });

  test("[P0] filterTasksForEarnings keeps tasks with createdAt inside [startMs,endMs] inclusive", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const range = { startMs: 100, endMs: 200 };
    const tasks = [
      task({ id: "in", createdAt: 150 }),
      task({ id: "before", createdAt: 50 }),
      task({ id: "after", createdAt: 250 }),
    ];
    const out = ec.filterTasksForEarnings(tasks, range, "all");
    expect(out.map((t) => t.id)).toEqual(["in"]);
  });

  test("[P0] filterTasksForEarnings(billable) excludes non-billable tasks", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const range = { startMs: 0, endMs: 9_999_999_999_999 };
    const tasks = [
      task({ id: "b", isBillable: true, createdAt: 1 }),
      task({ id: "nb", isBillable: false, createdAt: 1 }),
    ];
    const out = ec.filterTasksForEarnings(tasks, range, "billable");
    expect(out.map((t) => t.id)).toEqual(["b"]);
  });

  test("[P0] filterTasksForEarnings(nonBillable) includes only isBillable false", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const range = { startMs: 0, endMs: 9_999_999_999_999 };
    const tasks = [
      task({ id: "b", isBillable: true, createdAt: 1 }),
      task({ id: "nb", isBillable: false, createdAt: 1 }),
    ];
    const out = ec.filterTasksForEarnings(tasks, range, "nonBillable");
    expect(out.map((t) => t.id)).toEqual(["nb"]);
  });

  test("[P1] filterTasksForEarnings(all) includes both billable flags", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const range = { startMs: 0, endMs: 9_999_999_999_999 };
    const tasks = [
      task({ id: "b", isBillable: true, createdAt: 1 }),
      task({ id: "nb", isBillable: false, createdAt: 1 }),
    ];
    const out = ec.filterTasksForEarnings(tasks, range, "all");
    expect(out).toHaveLength(2);
  });

  test("[P0] getEffectiveHourlyRate uses task.hourlyRate ?? client.hourlyRate ?? 0 (nullish)", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const clients: Client[] = [
      { id: "c1", name: "Acme", hourlyRate: 80, color: "#000" },
    ];
    const t0 = task({ id: "t0", clientId: "c1", hourlyRate: null });
    expect(ec.getEffectiveHourlyRate(t0, clients)).toBe(80);
    const t1 = task({ id: "t1", clientId: "c1", hourlyRate: 120 });
    expect(ec.getEffectiveHourlyRate(t1, clients)).toBe(120);
    const t2 = task({ id: "t2", clientId: "c1", hourlyRate: 0 });
    expect(ec.getEffectiveHourlyRate(t2, clients)).toBe(0);
    const t3 = task({ id: "t3", clientId: null, hourlyRate: null });
    expect(ec.getEffectiveHourlyRate(t3, clients)).toBe(0);
  });

  test("[P0] getTaskBillableRevenue matches FR26 for billable (rate * timeSpent/3600)", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const clients: Client[] = [
      { id: "c1", name: "Acme", hourlyRate: 100, color: "#000" },
    ];
    const t = task({
      id: "t1",
      isBillable: true,
      hourlyRate: null,
      timeSpent: 1800,
      clientId: "c1",
    });
    expect(ec.getTaskBillableRevenue(t, clients)).toBeCloseTo(50, 5);
  });

  test("[P0] getTaskBillableRevenue is 0 when isBillable is false", async () => {
    const ec = await import("../../src/lib/earnings-calculations");
    const clients: Client[] = [
      { id: "c1", name: "Acme", hourlyRate: 100, color: "#000" },
    ];
    const t = task({
      id: "t1",
      isBillable: false,
      timeSpent: 3600,
      clientId: "c1",
    });
    expect(ec.getTaskBillableRevenue(t, clients)).toBe(0);
  });
});
