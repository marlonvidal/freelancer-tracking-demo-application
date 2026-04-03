import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  EarningsDashboardStateProvider,
  useEarningsDashboardState,
} from './EarningsDashboardStateContext';
import { EARNINGS_DASHBOARD_STORAGE_KEY } from '@/lib/earnings-dashboard-storage';

function wrapper({ children }: { children: ReactNode }) {
  return <EarningsDashboardStateProvider>{children}</EarningsDashboardStateProvider>;
}

describe('EarningsDashboardStateProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem(
      EARNINGS_DASHBOARD_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        dateRangePreset: 'year',
        billableFilter: 'nonBillable',
        activeChart: 'tag',
      }),
    );

    const { result } = renderHook(() => useEarningsDashboardState(), { wrapper });

    expect(result.current.state.dateRangePreset).toBe('year');
    expect(result.current.state.billableFilter).toBe('nonBillable');
    expect(result.current.state.activeChart).toBe('tag');
  });

  it('persists billable filter when setter runs', () => {
    const { result } = renderHook(() => useEarningsDashboardState(), { wrapper });

    act(() => {
      result.current.setBillableFilter('billable');
    });

    const raw = localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.billableFilter).toBe('billable');
  });

  it('persists date range preset and clears stored custom dateRange', () => {
    localStorage.setItem(
      EARNINGS_DASHBOARD_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        dateRangePreset: 'last30',
        dateRange: { startMs: 1, endMs: 2 },
        billableFilter: 'all',
        activeChart: 'customer',
      }),
    );

    const { result } = renderHook(() => useEarningsDashboardState(), { wrapper });

    act(() => {
      result.current.setDateRangePreset('quarter');
    });

    const parsed = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
    expect(parsed.dateRangePreset).toBe('quarter');
    expect(parsed.dateRange).toBeUndefined();
    expect(result.current.state.dateRange).toBeUndefined();
  });

  it('persists active chart view when setter runs', () => {
    const { result } = renderHook(() => useEarningsDashboardState(), { wrapper });

    act(() => {
      result.current.setActiveChartView('project');
    });

    const parsed = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
    expect(parsed.activeChart).toBe('project');
  });

  it('clearAppData clears storage keys and resets in-memory state to defaults', () => {
    localStorage.setItem('freelancer-kanban-data', '{"tasks":[]}');
    localStorage.setItem(
      EARNINGS_DASHBOARD_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        dateRangePreset: 'year',
        billableFilter: 'billable',
        activeChart: 'project',
      }),
    );

    const { result } = renderHook(() => useEarningsDashboardState(), { wrapper });

    act(() => {
      result.current.clearAppData();
    });

    expect(localStorage.getItem('freelancer-kanban-data')).toBeNull();
    expect(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)).toBeNull();

    expect(result.current.state.dateRangePreset).toBe('last30');
    expect(result.current.state.billableFilter).toBe('all');
    expect(result.current.state.activeChart).toBe('customer');
  });
});
