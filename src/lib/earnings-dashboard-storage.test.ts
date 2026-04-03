import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_EARNINGS_DASHBOARD_STATE,
  EARNINGS_DASHBOARD_STORAGE_KEY,
  loadEarningsDashboardState,
  saveEarningsDashboardState,
} from './earnings-dashboard-storage';

describe('earnings-dashboard-storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('load returns defaults when key is missing', () => {
    const s = loadEarningsDashboardState();
    expect(s).toEqual(DEFAULT_EARNINGS_DASHBOARD_STATE);
    expect(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)).toBeNull();
  });

  it('load returns defaults on corrupt JSON', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem(EARNINGS_DASHBOARD_STORAGE_KEY, 'not-json');
    const s = loadEarningsDashboardState();
    expect(s.billableFilter).toBe('all');
    expect(s.dateRangePreset).toBe('last30');
    err.mockRestore();
  });

  it('load returns defaults on invalid shape', () => {
    localStorage.setItem(EARNINGS_DASHBOARD_STORAGE_KEY, JSON.stringify({ foo: 1 }));
    const s = loadEarningsDashboardState();
    expect(s).toEqual(DEFAULT_EARNINGS_DASHBOARD_STATE);
  });

  it('round-trips valid state', () => {
    const saved = {
      version: 1,
      dateRangePreset: 'year' as const,
      billableFilter: 'nonBillable' as const,
      activeChart: 'tag' as const,
    };
    saveEarningsDashboardState(saved);
    expect(loadEarningsDashboardState()).toEqual(saved);
  });

  it('preserves optional dateRange when valid', () => {
    const saved = {
      version: 1,
      dateRangePreset: 'last30' as const,
      dateRange: { startMs: 100, endMs: 200 },
      billableFilter: 'all' as const,
      activeChart: 'customer' as const,
    };
    saveEarningsDashboardState(saved);
    expect(loadEarningsDashboardState()).toEqual(saved);
  });

  it('drops dateRange when start/end are non-finite', () => {
    localStorage.setItem(
      EARNINGS_DASHBOARD_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        dateRangePreset: 'last30',
        dateRange: { startMs: NaN, endMs: 1 },
        billableFilter: 'all',
        activeChart: 'customer',
      }),
    );
    const s = loadEarningsDashboardState();
    expect(s.dateRange).toBeUndefined();
    expect(s.dateRangePreset).toBe('last30');
  });

  it('returns defaults when a required enum is invalid (partial corruption)', () => {
    localStorage.setItem(
      EARNINGS_DASHBOARD_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        dateRangePreset: 'invalidPreset',
        billableFilter: 'all',
        activeChart: 'customer',
      }),
    );
    expect(loadEarningsDashboardState()).toEqual(DEFAULT_EARNINGS_DASHBOARD_STATE);
  });

  it('normalizes version below 1 to 1 when other fields are valid', () => {
    localStorage.setItem(
      EARNINGS_DASHBOARD_STORAGE_KEY,
      JSON.stringify({
        version: 0,
        dateRangePreset: 'quarter',
        billableFilter: 'billable',
        activeChart: 'project',
      }),
    );
    const s = loadEarningsDashboardState();
    expect(s.version).toBe(1);
    expect(s.dateRangePreset).toBe('quarter');
    expect(s.billableFilter).toBe('billable');
    expect(s.activeChart).toBe('project');
  });

  it('save does not throw when localStorage.setItem fails', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() =>
      saveEarningsDashboardState({
        version: 1,
        dateRangePreset: 'last30',
        billableFilter: 'all',
        activeChart: 'customer',
      }),
    ).not.toThrow();
    setItem.mockRestore();
    err.mockRestore();
  });
});
