import React, { useEffect, useMemo, useRef } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  EarningsDashboardStateProvider,
  useEarningsDashboardState,
} from '@/context/EarningsDashboardStateContext';
import { calculateRevenueByCustomer, calculateRevenueByProject, calculateRevenueByTag, calculateSummaryMetrics, resolveDateRangeMs } from '@/lib/earnings-calculations';
import CustomerRevenueChart from '@/components/CustomerRevenueChart';
import ProjectRevenueChart from '@/components/ProjectRevenueChart';
import TagRevenueChart from '@/components/TagRevenueChart';
import BillableToggle from '@/components/BillableToggle';
import DateRangeFilter from '@/components/DateRangeFilter';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';

const EarningsDashboardContent: React.FC = () => {
  const { t, language } = useLanguage();
  const { state: appState } = useApp();
  const {
    state,
    setActiveChartView,
    clearAppData,
  } = useEarningsDashboardState();
  const titleBeforeRouteRef = useRef<string | null>(null);

  const { metrics, metricsError } = useMemo(() => {
    try {
      return {
        metrics: calculateSummaryMetrics(
          appState.tasks,
          appState.clients,
          resolveDateRangeMs(state, Date.now()),
          state.billableFilter,
        ),
        metricsError: null,
      };
    } catch (err) {
      return { metrics: null, metricsError: err as Error };
    }
  }, [appState.tasks, appState.clients, state]);

  const customerData = useMemo(
    () =>
      calculateRevenueByCustomer(
        appState.tasks,
        appState.clients,
        resolveDateRangeMs(state, Date.now()),
        state.billableFilter,
      ),
    [appState.tasks, appState.clients, state],
  );

  const projectData = useMemo(
    () =>
      calculateRevenueByProject(
        appState.tasks,
        appState.columns,
        resolveDateRangeMs(state, Date.now()),
        state.billableFilter,
        appState.clients,
      ),
    [appState.tasks, appState.columns, appState.clients, state],
  );

  const tagData = useMemo(
    () =>
      calculateRevenueByTag(
        appState.tasks,
        resolveDateRangeMs(state, Date.now()),
        state.billableFilter,
        appState.clients,
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
        </div>

        {metricsError ? (
          <div
            data-testid="earnings-calculation-error"
            role="alert"
            className="flex items-center justify-center rounded-lg border border-dashed p-8"
          >
            <p className="text-muted-foreground text-sm text-center">
              {t.earningsCalculationError}
            </p>
          </div>
        ) : appState.tasks.length === 0 ? (
          <div
            data-testid="earnings-empty-no-tasks"
            role="status"
            className="flex items-center justify-center rounded-lg border border-dashed p-8"
          >
            <p className="text-muted-foreground text-sm text-center">
              {t.earningsEmptyNoTasks}
            </p>
          </div>
        ) : metrics && metrics.totalTaskCount === 0 && state.billableFilter === 'billable' ? (
          <div
            data-testid="earnings-empty-no-billable-work"
            role="status"
            className="flex items-center justify-center rounded-lg border border-dashed p-8"
          >
            <p className="text-muted-foreground text-sm text-center">
              {t.earningsNoBillableWork}
            </p>
          </div>
        ) : metrics && metrics.totalTaskCount === 0 ? (
          <div
            data-testid="earnings-empty-no-period-data"
            role="status"
            className="flex items-center justify-center rounded-lg border border-dashed p-8"
          >
            <p className="text-muted-foreground text-sm text-center">
              {t.earningsEmptyNoPeriodData}
            </p>
          </div>
        ) : metrics ? (
          <div
            data-testid="earnings-metrics"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
            role="region"
            aria-live="polite"
            aria-label={t.earningsDashboardHeading}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.earningsTotalRevenue}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatCurrency(metrics.totalRevenue, language)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.earningsBillableRevenue}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatCurrency(metrics.billableRevenue, language)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.earningsNonBillableRevenue}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatCurrency(metrics.nonBillableRevenue, language)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.earningsAvgHourlyRate}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatCurrency(metrics.averageHourlyRate, language)}</p>
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
        ) : null}

        {state.activeChart === 'customer' && (
          <CustomerRevenueChart data={customerData} />
        )}
        {state.activeChart === 'project' && (
          <ProjectRevenueChart data={projectData} />
        )}
        {state.activeChart === 'tag' && (
          <TagRevenueChart data={tagData} />
        )}

        <div className="flex flex-col gap-6 max-w-xl">
          <DateRangeFilter />

          <BillableToggle />

          <div className="space-y-2">
            <Label>{t.earningsChartViewLabel}</Label>
            <div
              className="flex flex-wrap gap-2"
              data-testid="chart-view-selector"
              role="group"
              aria-label={t.earningsChartViewLabel}
            >
              {(['customer', 'project', 'tag'] as const).map((chart) => (
                <Button
                  key={chart}
                  type="button"
                  variant={state.activeChart === chart ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveChartView(chart)}
                  data-testid={`chart-view-${chart}`}
                  aria-pressed={state.activeChart === chart}
                >
                  {chart === 'customer'
                    ? t.earningsChartCustomer
                    : chart === 'project'
                    ? t.earningsChartProject
                    : t.earningsChartTag}
                </Button>
              ))}
            </div>
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
