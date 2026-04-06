import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useEarningsDashboardState } from '@/context/EarningsDashboardStateContext';
import { useLanguage } from '@/context/LanguageContext';
import type { BillableFilter } from '@/lib/earnings-dashboard-storage';
import type { Translations } from '@/context/LanguageContext';

const FILTER_OPTIONS: BillableFilter[] = ['all', 'billable', 'nonBillable'];

function filterLabel(filter: BillableFilter, t: Translations): string {
  switch (filter) {
    case 'all': return t.earningsFilterAll;
    case 'billable': return t.billable;
    case 'nonBillable': return t.nonBillable;
  }
}

const BillableToggle: React.FC = () => {
  const { t } = useLanguage();
  const { state, setBillableFilter } = useEarningsDashboardState();

  return (
    <div className="space-y-2">
      <Label>{t.earningsBillableFilterLabel}</Label>
      <div className="flex flex-wrap gap-2" data-testid="billable-toggle">
        {FILTER_OPTIONS.map((filter) => (
          <Button
            key={filter}
            variant={state.billableFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBillableFilter(filter)}
            data-testid={`billable-toggle-${filter}`}
          >
            {filterLabel(filter, t)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BillableToggle;
