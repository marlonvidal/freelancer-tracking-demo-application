import React, { useEffect, useRef } from 'react';
import { AppProvider } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  EarningsDashboardStateProvider,
  useEarningsDashboardState,
} from '@/context/EarningsDashboardStateContext';
import type { ActiveChartView, BillableFilter, DateRangePreset } from '@/lib/earnings-dashboard-storage';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Interim filter controls (Story 1.3): Epics 3–4 will replace the date/billable/chart UI.
 * Persistence in `earnings-dashboard-state` must remain when that swap happens.
 */
const EarningsDashboardContent: React.FC = () => {
  const { t } = useLanguage();
  const {
    state,
    setDateRangePreset,
    setBillableFilter,
    setActiveChartView,
    clearAppData,
  } = useEarningsDashboardState();
  const titleBeforeRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (titleBeforeRouteRef.current === null) {
      titleBeforeRouteRef.current = document.title;
    }
    return () => {
      if (titleBeforeRouteRef.current !== null) {
        document.title = titleBeforeRouteRef.current;
      }
    };
  }, []);

  useEffect(() => {
    document.title = t.earningsDashboardDocumentTitle;
  }, [t.earningsDashboardDocumentTitle]);

  return (
    <div
      data-testid="earnings-dashboard"
      className="min-h-screen flex flex-col bg-background"
    >
      <Header />
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t.earningsDashboardHeading}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            {t.earningsDashboardPlaceholder}
          </p>
        </div>

        <div className="flex flex-col gap-6 max-w-xl">
          <div className="space-y-2">
            <Label htmlFor="earnings-date-range">{t.earningsDateRangeLabel}</Label>
            <Select
              value={state.dateRangePreset}
              onValueChange={(v) => setDateRangePreset(v as DateRangePreset)}
            >
              <SelectTrigger id="earnings-date-range" className="max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last30">{t.earningsDateRangeLast30Days}</SelectItem>
                <SelectItem value="quarter">{t.earningsDateRangeQuarter}</SelectItem>
                <SelectItem value="year">{t.earningsDateRangeYear}</SelectItem>
                <SelectItem value="all">{t.earningsDateRangeAll}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="earnings-billable-filter">{t.earningsBillableFilterLabel}</Label>
            <Select
              value={state.billableFilter}
              onValueChange={(v) => setBillableFilter(v as BillableFilter)}
            >
              <SelectTrigger id="earnings-billable-filter" className="max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.earningsFilterAll}</SelectItem>
                <SelectItem value="billable">{t.billable}</SelectItem>
                <SelectItem value="nonBillable">{t.nonBillable}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="earnings-chart-view">{t.earningsChartViewLabel}</Label>
            <Select
              value={state.activeChart}
              onValueChange={(v) => setActiveChartView(v as ActiveChartView)}
            >
              <SelectTrigger id="earnings-chart-view" className="max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">{t.earningsChartCustomer}</SelectItem>
                <SelectItem value="project">{t.earningsChartProject}</SelectItem>
                <SelectItem value="tag">{t.earningsChartTag}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="button" variant="outline" className="w-fit" onClick={clearAppData}>
            {t.earningsClearAppData}
          </Button>
        </div>
      </main>
    </div>
  );
};

const EarningsDashboardInner: React.FC = () => {
  return (
    <EarningsDashboardStateProvider>
      <EarningsDashboardContent />
    </EarningsDashboardStateProvider>
  );
};

const EarningsDashboard: React.FC = () => {
  return (
    <AppProvider>
      <EarningsDashboardInner />
    </AppProvider>
  );
};

export default EarningsDashboard;
