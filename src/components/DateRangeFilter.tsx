import React, { useEffect, useState } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useEarningsDashboardState } from '@/context/EarningsDashboardStateContext';
import { useLanguage } from '@/context/LanguageContext';
import type { DateRangePreset, EarningsDashboardPersistedState } from '@/lib/earnings-dashboard-storage';
import type { Translations } from '@/context/LanguageContext';

const PRESET_ORDER: DateRangePreset[] = ['last30', 'quarter', 'year', 'all'];

function presetLabel(preset: DateRangePreset, t: Translations): string {
  switch (preset) {
    case 'last30': return t.earningsDateRangeLast30Days;
    case 'quarter': return t.earningsDateRangeQuarter;
    case 'year': return t.earningsDateRangeYear;
    case 'all': return t.earningsDateRangeAll;
  }
}

function formatDisplayRange(
  state: EarningsDashboardPersistedState,
  t: Translations,
  language: 'en' | 'pt',
): string {
  if (state.dateRange) {
    const dateFormat = language === 'pt' ? 'dd/MM/yyyy' : 'MMM d, yyyy';
    const from = format(new Date(state.dateRange.startMs), dateFormat);
    const to = format(new Date(state.dateRange.endMs), dateFormat);
    return `${from} – ${to}`;
  }
  switch (state.dateRangePreset) {
    case 'last30': return t.earningsDateRangeLast30Days;
    case 'quarter': return t.earningsDateRangeQuarter;
    case 'year': return t.earningsDateRangeYear;
    case 'all': return t.earningsDateRangeAll;
    default: return t.earningsPickDateRange;
  }
}

const DateRangeFilter: React.FC = () => {
  const { t, language } = useLanguage();
  const { state, setDateRangePreset, setCustomDateRange } = useEarningsDashboardState();
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>(
    state.dateRange
      ? { from: new Date(state.dateRange.startMs), to: new Date(state.dateRange.endMs) }
      : undefined,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (calendarRange?.from && calendarRange?.to) {
      setCustomDateRange({
        startMs: startOfDay(calendarRange.from).getTime(),
        endMs: endOfDay(calendarRange.to).getTime(),
      });
      setOpen(false);
    }
  }, [calendarRange, setCustomDateRange]);

  const isPresetActive = (preset: DateRangePreset) =>
    !state.dateRange && state.dateRangePreset === preset;

  return (
    <div className="space-y-2">
      <Label>{t.earningsDateRangeLabel}</Label>
      <div
        className="flex flex-wrap gap-2"
        data-testid="date-range-presets"
        role="group"
        aria-label={t.earningsDateRangeLabel}
      >
        {PRESET_ORDER.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant={isPresetActive(preset) ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setDateRangePreset(preset);
              setCalendarRange(undefined);
            }}
            data-testid={`preset-${preset}`}
            aria-pressed={isPresetActive(preset)}
          >
            {presetLabel(preset, t)}
          </Button>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="max-w-md w-full justify-start text-left font-normal"
            data-testid="date-range-picker-trigger"
            aria-label={t.earningsPickDateRange}
          >
            {formatDisplayRange(state, t, language)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={calendarRange}
            onSelect={setCalendarRange}
            numberOfMonths={1}
            disabled={{ after: new Date() }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilter;
