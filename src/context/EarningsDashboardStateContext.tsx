import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_EARNINGS_DASHBOARD_STATE,
  type ActiveChartView,
  type BillableFilter,
  type DateRangePreset,
  type EarningsDashboardPersistedState,
  loadEarningsDashboardState,
  saveEarningsDashboardState,
} from '@/lib/earnings-dashboard-storage';
import { clearState } from '@/lib/storage';

export type EarningsDashboardStateContextValue = {
  state: EarningsDashboardPersistedState;
  setDateRangePreset: (preset: DateRangePreset) => void;
  setBillableFilter: (filter: BillableFilter) => void;
  setActiveChartView: (chart: ActiveChartView) => void;
  /** Clears Kanban + earnings storage and resets in-memory filters to defaults without writing earnings key. */
  clearAppData: () => void;
};

const EarningsDashboardStateContext = createContext<EarningsDashboardStateContextValue | undefined>(
  undefined,
);

export const EarningsDashboardStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<EarningsDashboardPersistedState>(() => loadEarningsDashboardState());

  const setDateRangePreset = useCallback((dateRangePreset: DateRangePreset) => {
    setState((prev) => {
      const next: EarningsDashboardPersistedState = { ...prev, dateRangePreset, dateRange: undefined };
      saveEarningsDashboardState(next);
      return next;
    });
  }, []);

  const setBillableFilter = useCallback((billableFilter: BillableFilter) => {
    setState((prev) => {
      const next = { ...prev, billableFilter };
      saveEarningsDashboardState(next);
      return next;
    });
  }, []);

  const setActiveChartView = useCallback((activeChart: ActiveChartView) => {
    setState((prev) => {
      const next = { ...prev, activeChart };
      saveEarningsDashboardState(next);
      return next;
    });
  }, []);

  const clearAppData = useCallback(() => {
    clearState();
    setState({ ...DEFAULT_EARNINGS_DASHBOARD_STATE });
  }, []);

  const value = useMemo(
    () => ({
      state,
      setDateRangePreset,
      setBillableFilter,
      setActiveChartView,
      clearAppData,
    }),
    [state, setDateRangePreset, setBillableFilter, setActiveChartView, clearAppData],
  );

  return (
    <EarningsDashboardStateContext.Provider value={value}>{children}</EarningsDashboardStateContext.Provider>
  );
};

export function useEarningsDashboardState(): EarningsDashboardStateContextValue {
  const ctx = useContext(EarningsDashboardStateContext);
  if (!ctx) {
    throw new Error('useEarningsDashboardState must be used within EarningsDashboardStateProvider');
  }
  return ctx;
}
