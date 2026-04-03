/**
 * Earnings dashboard preferences — separate localStorage document from Kanban `AppState`.
 *
 * Date range: persisted primarily as `dateRangePreset`. Optional `dateRange` with
 * `{ startMs, endMs }` (epoch milliseconds) is reserved for Epic 4 custom ranges so
 * serialization can evolve without breaking readers that only understand presets.
 */

export const EARNINGS_DASHBOARD_STORAGE_KEY = 'earnings-dashboard-state';

export type DateRangePreset = 'last30' | 'quarter' | 'year' | 'all';

export type BillableFilter = 'all' | 'billable' | 'nonBillable';

export type ActiveChartView = 'customer' | 'project' | 'tag';

export type EarningsDashboardPersistedState = {
  version: number;
  dateRangePreset: DateRangePreset;
  dateRange?: { startMs: number; endMs: number };
  billableFilter: BillableFilter;
  activeChart: ActiveChartView;
};

export const DEFAULT_EARNINGS_DASHBOARD_STATE: EarningsDashboardPersistedState = {
  version: 1,
  dateRangePreset: 'last30',
  billableFilter: 'all',
  activeChart: 'customer',
};

const PRESETS: ReadonlySet<string> = new Set(['last30', 'quarter', 'year', 'all']);
const BILLABLE: ReadonlySet<string> = new Set(['all', 'billable', 'nonBillable']);
const CHARTS: ReadonlySet<string> = new Set(['customer', 'project', 'tag']);

function coercePersisted(raw: unknown): EarningsDashboardPersistedState | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;

  const version = typeof o.version === 'number' && o.version >= 1 ? o.version : 1;

  const presetRaw = o.dateRangePreset;
  const dateRangePreset =
    typeof presetRaw === 'string' && PRESETS.has(presetRaw)
      ? (presetRaw as DateRangePreset)
      : null;

  let dateRange: { startMs: number; endMs: number } | undefined;
  const dr = o.dateRange;
  if (dr !== null && typeof dr === 'object' && !Array.isArray(dr)) {
    const d = dr as Record<string, unknown>;
    if (
      typeof d.startMs === 'number' &&
      typeof d.endMs === 'number' &&
      Number.isFinite(d.startMs) &&
      Number.isFinite(d.endMs)
    ) {
      dateRange = { startMs: d.startMs, endMs: d.endMs };
    }
  }

  const billRaw = o.billableFilter;
  const billableFilter =
    typeof billRaw === 'string' && BILLABLE.has(billRaw)
      ? (billRaw as BillableFilter)
      : null;

  const chartRaw = o.activeChart;
  const activeChart =
    typeof chartRaw === 'string' && CHARTS.has(chartRaw)
      ? (chartRaw as ActiveChartView)
      : null;

  if (!dateRangePreset || !billableFilter || !activeChart) return null;

  const next: EarningsDashboardPersistedState = {
    version,
    dateRangePreset,
    billableFilter,
    activeChart,
  };
  if (dateRange) next.dateRange = dateRange;
  return next;
}

export function loadEarningsDashboardState(): EarningsDashboardPersistedState {
  try {
    const raw = localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_EARNINGS_DASHBOARD_STATE };
    }
    const parsed = JSON.parse(raw) as unknown;
    const coerced = coercePersisted(parsed);
    return coerced ? { ...coerced } : { ...DEFAULT_EARNINGS_DASHBOARD_STATE };
  } catch (error) {
    console.error('Failed to load earnings dashboard state:', error);
    return { ...DEFAULT_EARNINGS_DASHBOARD_STATE };
  }
}

export function saveEarningsDashboardState(state: EarningsDashboardPersistedState): void {
  try {
    localStorage.setItem(EARNINGS_DASHBOARD_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save earnings dashboard state:', error);
  }
}
