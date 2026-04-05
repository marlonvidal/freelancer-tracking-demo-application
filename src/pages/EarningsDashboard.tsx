import React, { useEffect, useMemo, useRef } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  EarningsDashboardStateProvider,
  useEarningsDashboardState,
} from '@/context/EarningsDashboardStateContext';
import type { ActiveChartView, BillableFilter, DateRangePreset } from '@/lib/earnings-dashboard-storage';
import { calculateSummaryMetrics, resolveDateRangeMs } from '@/lib/earnings-calculations';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

/**
 * Interim filter controls (Story 1.3): Epics 3–4 will replace the date/billable/chart UI.
 * Persistence in `earnings-dashboard-state` must remain when that swap happens.
 */
const EarningsDashboardContent: React.FC = () => {
  const { t } = useLanguage();
  const { state: appState } = useApp();
  const {
    state,
    setDateRangePreset,
    setBillableFilter,
    setActiveChartView,
    clearAppData,
  } = useEarningsDashboardState();
  const titleBeforeRouteRef = useRef<string | null>(null);

  const metrics = useMemo(
    () =>
      calculateSummaryMetrics(
        appState.tasks,
        appState.clients,
        resolveDateRangeMs(state, Date.now()),
        state.billableFilter,
      ),
    [appState.tasks, appState.clients, state],
  );

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

        <div
          data-testid="earnings-metrics"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.earningsTotalRevenue}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCurrency(metrics.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.earningsBillableRevenue}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCurrency(metrics.billableRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.earningsNonBillableRevenue}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCurrency(metrics.nonBillableRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.earningsAvgHourlyRate}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCurrency(metrics.averageHourlyRate)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.earningsTaskCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {metrics.totalTaskCount} {t.earningsTaskCountTotal} / {metrics.billableTaskCount} {t.earningsTaskCountBillable}
              </p>
            </CardContent>
          </Card>
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
