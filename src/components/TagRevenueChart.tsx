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
import type { RevenueByTagRow } from '@/lib/earnings-calculations';

interface TagRevenueChartProps {
  data: RevenueByTagRow[];
}

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#06b6d4',
];

const TagRevenueChart: React.FC<TagRevenueChartProps> = ({ data }) => {
  const { t, language } = useLanguage();
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHiddenKeys(new Set());
  }, [data]);

  const colorMap = useMemo(
    () => new Map(data.map((row, i) => [row.tag, CHART_COLORS[i % CHART_COLORS.length]])),
    [data],
  );

  const total = useMemo(
    () => data.reduce((sum, row) => sum + row.totalRevenue, 0),
    [data],
  );

  const visibleData = useMemo(
    () => data.filter((row) => !hiddenKeys.has(row.tag)),
    [data, hiddenKeys],
  );

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
      <div data-testid="tag-revenue-chart" className="flex items-center justify-center h-48 rounded-lg border border-dashed">
        <p className="text-muted-foreground text-sm">{t.earningsChartNoData}</p>
      </div>
    );
  }

  return (
    <div data-testid="tag-revenue-chart" className="space-y-2">
      <h2 className="text-lg font-semibold" id="tag-chart-heading">
        {t.earningsTagChartTitle}
      </h2>
      <ul
        className="sr-only"
        aria-labelledby="tag-chart-heading"
      >
        {data.map((row) => {
          const pct = total > 0 ? ((row.totalRevenue / total) * 100).toFixed(1) : '0.0';
          return (
            <li key={row.tag}>
              {row.tag}: {formatCurrency(row.totalRevenue, language)} ({pct}%)
            </li>
          );
        })}
      </ul>
      {visibleData.length === 0 ? (
        <div
          data-testid="chart-all-hidden-message"
          className="flex items-center justify-center h-48 rounded-lg border border-dashed"
        >
          <p className="text-muted-foreground text-sm">{t.earningsChartAllHidden}</p>
        </div>
      ) : (
        <div aria-hidden="true">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={visibleData}
                dataKey="totalRevenue"
                nameKey="tag"
                cx="50%"
                cy="50%"
                outerRadius="70%"
                isAnimationActive={false}
              >
                {visibleData.map((entry) => (
                  <Cell
                    key={`cell-${entry.tag}`}
                    fill={colorMap.get(entry.tag) ?? '#6366f1'}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as RevenueByTagRow;
                  const pct = total > 0 ? ((row.totalRevenue / total) * 100).toFixed(1) : '0.0';
                  return (
                    <div className="rounded-md border bg-popover p-2 text-sm shadow-md">
                      <p className="font-medium">{row.tag}</p>
                      <p className="text-muted-foreground">
                        {formatCurrency(row.totalRevenue, language)} ({pct}%)
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
        </div>
      )}
    </div>
  );
};

export default TagRevenueChart;
