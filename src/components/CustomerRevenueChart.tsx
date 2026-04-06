import React, { useMemo, useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import type { RevenueByCustomerRow } from '@/lib/earnings-calculations';

interface CustomerRevenueChartProps {
  data: RevenueByCustomerRow[];
}

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#06b6d4',
];

const CustomerRevenueChart: React.FC<CustomerRevenueChartProps> = ({ data }) => {
  const { t } = useLanguage();
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHiddenKeys(new Set());
  }, [data]);

  const colorMap = useMemo(
    () => new Map(data.map((row, i) => [row.customerName, CHART_COLORS[i % CHART_COLORS.length]])),
    [data],
  );

  const total = useMemo(
    () => data.reduce((sum, row) => sum + row.totalRevenue, 0),
    [data],
  );

  const visibleData = data.filter((row) => !hiddenKeys.has(row.customerName));

  const handleLegendClick = (entry: { value: string }) => {
    const key = entry.value;
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (data.length === 0) {
    return (
      <div data-testid="customer-revenue-chart" className="flex items-center justify-center h-48 rounded-lg border border-dashed">
        <p className="text-muted-foreground text-sm">{t.earningsChartNoData}</p>
      </div>
    );
  }

  return (
    <div data-testid="customer-revenue-chart" className="space-y-2">
      <h2 className="text-lg font-semibold">{t.earningsCustomerChartTitle}</h2>
      {visibleData.length === 0 ? (
        <div
          data-testid="chart-all-hidden-message"
          className="flex items-center justify-center h-48 rounded-lg border border-dashed"
        >
          <p className="text-muted-foreground text-sm">{t.earningsChartAllHidden}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={visibleData}
              dataKey="totalRevenue"
              nameKey="customerName"
              cx="50%"
              cy="50%"
              outerRadius="70%"
              isAnimationActive={false}
            >
              {visibleData.map((entry) => (
                <Cell
                  key={`cell-${entry.customerId ?? 'unassigned'}`}
                  fill={colorMap.get(entry.customerName) ?? '#6366f1'}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as RevenueByCustomerRow;
                const pct = total > 0 ? ((row.totalRevenue / total) * 100).toFixed(1) : '0.0';
                return (
                  <div className="rounded-md border bg-popover p-2 text-sm shadow-md">
                    <p className="font-medium">{row.customerName}</p>
                    <p className="text-muted-foreground">
                      {formatCurrency(row.totalRevenue)} ({pct}%)
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              onClick={handleLegendClick}
              formatter={(value: string) => (
                <span
                  style={{
                    textDecoration: hiddenKeys.has(value) ? 'line-through' : 'none',
                    opacity: hiddenKeys.has(value) ? 0.5 : 1,
                    cursor: 'pointer',
                  }}
                >
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CustomerRevenueChart;
