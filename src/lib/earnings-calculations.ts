/**
 * Pure earnings / revenue calculations for dashboard aggregations (Epic 2+).
 *
 * Date preset windows use the **local** timezone (via `Date` + date-fns `startOfDay` / `endOfDay`)
 * so freelancer-facing ranges match the calendar they see on their machine.
 */

import { endOfDay, startOfDay, subDays } from "date-fns";

import type {
  BillableFilter,
  DateRangePreset,
  EarningsDashboardPersistedState,
} from "@/lib/earnings-dashboard-storage";
import type { Client, Column, Task } from "@/types";

export type { BillableFilter };

export type EarningsDateRangeMs = {
  startMs: number;
  endMs: number;
};

export type RevenueByCustomerRow = {
  customerId: string | null;
  customerName: string;
  totalRevenue: number;
  taskCount: number;
};

export type RevenueByProjectRow = {
  columnId: string;
  columnTitle: string;
  totalRevenue: number;
  taskCount: number;
};

export type RevenueByTagRow = {
  tag: string;
  totalRevenue: number;
  taskCount: number;
};

export type SummaryMetrics = {
  totalRevenue: number;
  billableRevenue: number;
  nonBillableRevenue: number;
  averageHourlyRate: number;
  totalTaskCount: number;
  billableTaskCount: number;
};

const UNASSIGNED_NAME = "Unassigned";
const UNTAGGED_KEY = "Untagged";

function presetInclusiveDayCount(preset: DateRangePreset): number | null {
  switch (preset) {
    case "last30":
      return 30;
    case "quarter":
      return 90;
    case "year":
      return 365;
    case "all":
      return null;
    default:
      return 30;
  }
}

function isValidPersistedCustomRange(dr: {
  startMs: number;
  endMs: number;
}): boolean {
  return (
    Number.isFinite(dr.startMs) &&
    Number.isFinite(dr.endMs) &&
    dr.startMs <= dr.endMs
  );
}

/**
 * Resolve a dashboard date range from a preset and "now" (injectable for tests).
 * `all` uses numeric sentinels so {@link filterTasksForEarnings} can stay a single inclusive range check.
 */
export function resolveDateRangeFromPreset(
  preset: DateRangePreset,
  nowMs: number,
): EarningsDateRangeMs {
  if (preset === "all") {
    return {
      startMs: Number.MIN_SAFE_INTEGER,
      endMs: Number.MAX_SAFE_INTEGER,
    };
  }

  const days = presetInclusiveDayCount(preset);
  if (days === null) {
    return {
      startMs: Number.MIN_SAFE_INTEGER,
      endMs: Number.MAX_SAFE_INTEGER,
    };
  }

  const now = new Date(nowMs);
  const end = endOfDay(now);
  const start = startOfDay(subDays(now, days - 1));
  return { startMs: start.getTime(), endMs: end.getTime() };
}

/**
 * Resolve the active `{ startMs, endMs }` from persisted dashboard state.
 * A valid optional `dateRange` override wins over `dateRangePreset`.
 */
export function resolveDateRangeMs(
  persisted: Pick<
    EarningsDashboardPersistedState,
    "dateRangePreset" | "dateRange"
  >,
  nowMs: number,
): EarningsDateRangeMs {
  if (
    persisted.dateRange &&
    isValidPersistedCustomRange(persisted.dateRange)
  ) {
    return {
      startMs: persisted.dateRange.startMs,
      endMs: persisted.dateRange.endMs,
    };
  }
  return resolveDateRangeFromPreset(persisted.dateRangePreset, nowMs);
}

export function filterTasksForEarnings(
  tasks: Task[],
  range: EarningsDateRangeMs,
  billableFilter: BillableFilter,
): Task[] {
  return tasks.filter((task) => {
    if (task.createdAt < range.startMs || task.createdAt > range.endMs) {
      return false;
    }
    if (billableFilter === "billable") return task.isBillable === true;
    if (billableFilter === "nonBillable") return task.isBillable === false;
    return true;
  });
}

function clientsById(clients: Client[]): Map<string, Client> {
  return new Map(clients.map((c) => [c.id, c]));
}

/** FR26: `task.hourlyRate ?? client.hourlyRate ?? 0` (nullish, not `||`). */
export function getEffectiveHourlyRate(task: Task, clients: Client[]): number {
  if (task.hourlyRate != null) return task.hourlyRate;
  if (task.clientId == null) return 0;
  const client = clientsById(clients).get(task.clientId);
  return client?.hourlyRate ?? 0;
}

/** FR26: billable revenue from `timeSpent` only (seconds → hours). */
export function getTaskBillableRevenue(task: Task, clients: Client[]): number {
  if (!task.isBillable) return 0;
  const rate = getEffectiveHourlyRate(task, clients);
  return rate * (task.timeSpent / 3600);
}

function customerDisplayName(task: Task, clients: Client[]): string {
  if (task.clientId == null) return UNASSIGNED_NAME;
  const client = clientsById(clients).get(task.clientId);
  return client?.name ?? "Unknown";
}

export function calculateRevenueByCustomer(
  tasks: Task[],
  clients: Client[],
  dateRangeMs: EarningsDateRangeMs,
  billableFilter: BillableFilter,
): RevenueByCustomerRow[] {
  const filtered = filterTasksForEarnings(tasks, dateRangeMs, billableFilter);
  const buckets = new Map<
    string | null,
    { customerName: string; totalRevenue: number; taskCount: number }
  >();

  for (const task of filtered) {
    const key = task.clientId;
    const name = customerDisplayName(task, clients);
    const revenue = getTaskBillableRevenue(task, clients);
    const prev = buckets.get(key);
    if (prev) {
      prev.totalRevenue += revenue;
      prev.taskCount += 1;
    } else {
      buckets.set(key, {
        customerName: name,
        totalRevenue: revenue,
        taskCount: 1,
      });
    }
  }

  return Array.from(buckets.entries()).map(([customerId, row]) => ({
    customerId,
    customerName: row.customerName,
    totalRevenue: row.totalRevenue,
    taskCount: row.taskCount,
  }));
}

/** Optional `clients` (default `[]`) supplies client hourly rates when `task.hourlyRate` is null. */
export function calculateRevenueByProject(
  tasks: Task[],
  columns: Column[],
  dateRangeMs: EarningsDateRangeMs,
  billableFilter: BillableFilter,
  clients: Client[] = [],
): RevenueByProjectRow[] {
  const filtered = filterTasksForEarnings(tasks, dateRangeMs, billableFilter);
  const titleById = new Map(columns.map((c) => [c.id, c.title]));
  const buckets = new Map<
    string,
    { columnTitle: string; totalRevenue: number; taskCount: number }
  >();

  for (const task of filtered) {
    const title = titleById.get(task.columnId) ?? "";
    const revenue = getTaskBillableRevenue(task, clients);
    const prev = buckets.get(task.columnId);
    if (prev) {
      prev.totalRevenue += revenue;
      prev.taskCount += 1;
    } else {
      buckets.set(task.columnId, {
        columnTitle: title,
        totalRevenue: revenue,
        taskCount: 1,
      });
    }
  }

  return Array.from(buckets.entries()).map(([columnId, row]) => ({
    columnId,
    columnTitle: row.columnTitle,
    totalRevenue: row.totalRevenue,
    taskCount: row.taskCount,
  }));
}

/** Trimmed, de-duplicated tag keys per task (order preserved). */
function normalizedUniqueTags(task: Task): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of task.tags ?? []) {
    const key = raw.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

/** Optional `clients` (default `[]`) supplies client hourly rates when `task.hourlyRate` is null. */
export function calculateRevenueByTag(
  tasks: Task[],
  dateRangeMs: EarningsDateRangeMs,
  billableFilter: BillableFilter,
  clients: Client[] = [],
): RevenueByTagRow[] {
  const filtered = filterTasksForEarnings(tasks, dateRangeMs, billableFilter);
  const buckets = new Map<string, { totalRevenue: number; taskCount: number }>();

  for (const task of filtered) {
    const keys = normalizedUniqueTags(task);
    const fullRevenue = getTaskBillableRevenue(task, clients);

    if (keys.length === 0) {
      const prev = buckets.get(UNTAGGED_KEY);
      if (prev) {
        prev.totalRevenue += fullRevenue;
        prev.taskCount += 1;
      } else {
        buckets.set(UNTAGGED_KEY, {
          totalRevenue: fullRevenue,
          taskCount: 1,
        });
      }
      continue;
    }

    const share = fullRevenue / keys.length;
    for (const tag of keys) {
      const prev = buckets.get(tag);
      if (prev) {
        prev.totalRevenue += share;
        prev.taskCount += 1;
      } else {
        buckets.set(tag, { totalRevenue: share, taskCount: 1 });
      }
    }
  }

  return Array.from(buckets.entries()).map(([tag, row]) => ({
    tag,
    totalRevenue: row.totalRevenue,
    taskCount: row.taskCount,
  }));
}

export function calculateSummaryMetrics(
  tasks: Task[],
  clients: Client[],
  dateRangeMs: EarningsDateRangeMs,
  billableFilter: BillableFilter,
): SummaryMetrics {
  const filtered = filterTasksForEarnings(tasks, dateRangeMs, billableFilter);
  let billableRevenue = 0;
  let billableTaskCount = 0;
  let billableTimeSpentSec = 0;

  for (const task of filtered) {
    const revenue = getTaskBillableRevenue(task, clients);
    if (task.isBillable) {
      billableRevenue += revenue;
      billableTaskCount += 1;
      billableTimeSpentSec += task.timeSpent;
    }
  }

  const billableHours = billableTimeSpentSec / 3600;
  const averageHourlyRate = billableHours > 0 ? billableRevenue / billableHours : 0;

  return {
    totalRevenue: billableRevenue,
    billableRevenue,
    nonBillableRevenue: 0,
    averageHourlyRate,
    totalTaskCount: filtered.length,
    billableTaskCount,
  };
}
