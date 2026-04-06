import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '@/context/LanguageContext';
import { EarningsDashboardStateProvider } from '@/context/EarningsDashboardStateContext';
import { EARNINGS_DASHBOARD_STORAGE_KEY } from '@/lib/earnings-dashboard-storage';
import DateRangeFilter from './DateRangeFilter';

/**
 * Component-level tests for DateRangeFilter (Story 4.1).
 *
 * Coverage targets not addressed by existing ATDD or context unit tests:
 *   - Rendering: all four preset buttons, presets container, popover trigger
 *   - Active preset variant: CSS class inspection (bg-primary vs border-input)
 *   - formatDisplayRange() logic: preset fallback paths + custom date display
 *   - Preset button interactions: localStorage updates after click
 *   - Custom range cleared on preset click
 *   - Portuguese i18n rendering
 *   - Edge cases: single-day range, calendarRange initialised from stored dateRange
 */

function renderDateRangeFilter() {
  return render(
    <LanguageProvider>
      <EarningsDashboardStateProvider>
        <DateRangeFilter />
      </EarningsDashboardStateProvider>
    </LanguageProvider>,
  );
}

/** Seed earnings dashboard state into localStorage before component mount. */
function seedState(partial: Record<string, unknown>) {
  localStorage.setItem(
    EARNINGS_DASHBOARD_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      billableFilter: 'all',
      activeChart: 'customer',
      ...partial,
    }),
  );
}

describe('DateRangeFilter', () => {
  beforeEach(() => {
    localStorage.removeItem(EARNINGS_DASHBOARD_STORAGE_KEY);
    localStorage.removeItem('app-language');
  });

  // ── Rendering ───────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('[P0] renders the date-range-presets container', () => {
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-presets')).toBeInTheDocument();
    });

    it('[P0] renders all four preset buttons with English labels', () => {
      renderDateRangeFilter();
      // Use toHaveTextContent via testId — the active preset label also appears in the
      // trigger button (formatDisplayRange falls back to preset label), so getByText
      // would find multiple elements. Scoping by testId avoids the ambiguity.
      expect(screen.getByTestId('preset-last30')).toHaveTextContent('Last 30 days');
      expect(screen.getByTestId('preset-quarter')).toHaveTextContent('Quarter');
      expect(screen.getByTestId('preset-year')).toHaveTextContent('Year');
      expect(screen.getByTestId('preset-all')).toHaveTextContent('All time');
    });

    it('[P0] renders the popover trigger button with data-testid', () => {
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-picker-trigger')).toBeInTheDocument();
    });

    it('[P1] renders the "Date range" label', () => {
      renderDateRangeFilter();
      expect(screen.getByText('Date range', { exact: true })).toBeInTheDocument();
    });
  });

  // ── Active preset highlighting (variant class inspection) ───────────────────

  describe('active preset highlighting', () => {
    it('[P1] preset-last30 has default variant (bg-primary) when dateRangePreset=last30 and no custom range', () => {
      renderDateRangeFilter();
      const btn = screen.getByTestId('preset-last30');
      // CVA "default" variant renders bg-primary; "outline" variant does not.
      expect(btn.className).toContain('bg-primary');
    });

    it('[P1] preset-quarter has default variant when dateRangePreset=quarter and no custom range', () => {
      seedState({ dateRangePreset: 'quarter' });
      renderDateRangeFilter();
      expect(screen.getByTestId('preset-quarter').className).toContain('bg-primary');
      // last30 should be outline (has border-input, not bg-primary as active marker)
      expect(screen.getByTestId('preset-last30').className).not.toContain('bg-primary');
    });

    it('[P2] preset-year has default variant when dateRangePreset=year and no custom range', () => {
      seedState({ dateRangePreset: 'year' });
      renderDateRangeFilter();
      expect(screen.getByTestId('preset-year').className).toContain('bg-primary');
    });

    it('[P2] preset-all has default variant when dateRangePreset=all and no custom range', () => {
      seedState({ dateRangePreset: 'all' });
      renderDateRangeFilter();
      expect(screen.getByTestId('preset-all').className).toContain('bg-primary');
    });

    it('[P1] no preset has default variant when a custom dateRange is set (isPresetActive returns false for all)', () => {
      seedState({
        dateRangePreset: 'last30',
        dateRange: { startMs: 1_000_000, endMs: 2_000_000 },
      });
      renderDateRangeFilter();
      // All preset buttons must use outline variant — none should have bg-primary
      for (const testId of ['preset-last30', 'preset-quarter', 'preset-year', 'preset-all']) {
        expect(screen.getByTestId(testId).className).not.toContain('bg-primary');
      }
    });
  });

  // ── Popover trigger display text (formatDisplayRange) ──────────────────────

  describe('popover trigger display text', () => {
    it('[P1] trigger shows "Last 30 days" when no custom range and dateRangePreset=last30', () => {
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-picker-trigger')).toHaveTextContent('Last 30 days');
    });

    it('[P1] trigger shows "Quarter" when dateRangePreset=quarter and no custom range', () => {
      seedState({ dateRangePreset: 'quarter' });
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-picker-trigger')).toHaveTextContent('Quarter');
    });

    it('[P1] trigger shows "Year" when dateRangePreset=year and no custom range', () => {
      seedState({ dateRangePreset: 'year' });
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-picker-trigger')).toHaveTextContent('Year');
    });

    it('[P1] trigger shows "All time" when dateRangePreset=all and no custom range', () => {
      seedState({ dateRangePreset: 'all' });
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-picker-trigger')).toHaveTextContent('All time');
    });

    it('[P1] trigger shows formatted custom range text (not a preset label) when dateRange is set', () => {
      // Fixed epoch milliseconds to avoid timezone sensitivity — check year/presence only.
      const startMs = Date.UTC(2025, 0, 15); // Jan 15 2025 UTC
      const endMs = Date.UTC(2025, 1, 15);   // Feb 15 2025 UTC
      seedState({ dateRangePreset: 'last30', dateRange: { startMs, endMs } });
      renderDateRangeFilter();
      const text = screen.getByTestId('date-range-picker-trigger').textContent ?? '';
      // formatDisplayRange uses date-fns format 'MMM d, yyyy – MMM d, yyyy'
      expect(text).toContain('2025');
      expect(text).not.toBe('Last 30 days');
      expect(text).not.toBe('Quarter');
      expect(text).not.toBe('Year');
      expect(text).not.toBe('All time');
    });

    // Story 6.1 — FR30: locale-aware date format in trigger
    it('[P1] trigger shows "MMM d, yyyy" format in English with custom dateRange (AC3/FR30)', () => {
      // Use local midnight dates — matches ATDD spec pattern to avoid timezone drift
      const startMs = new Date(2026, 0, 15).getTime(); // Jan 15 2026 local midnight
      const endMs = new Date(2026, 1, 28, 23, 59, 59, 999).getTime(); // Feb 28 2026 23:59:59
      seedState({ dateRangePreset: 'last30', dateRange: { startMs, endMs } });
      renderDateRangeFilter();
      const text = screen.getByTestId('date-range-picker-trigger').textContent ?? '';
      // EN: "Jan 15, 2026 – Feb 28, 2026"
      expect(text).toContain('Jan 15, 2026');
      expect(text).toContain('Feb 28, 2026');
    });
  });

  // ── Preset button interactions ──────────────────────────────────────────────

  describe('preset button interactions', () => {
    it('[P1] clicking preset-quarter persists dateRangePreset="quarter" to localStorage', () => {
      renderDateRangeFilter();
      fireEvent.click(screen.getByTestId('preset-quarter'));
      const stored = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
      expect(stored.dateRangePreset).toBe('quarter');
    });

    it('[P1] clicking preset-year persists dateRangePreset="year" to localStorage', () => {
      renderDateRangeFilter();
      fireEvent.click(screen.getByTestId('preset-year'));
      const stored = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
      expect(stored.dateRangePreset).toBe('year');
    });

    it('[P1] clicking preset-all persists dateRangePreset="all" to localStorage', () => {
      renderDateRangeFilter();
      fireEvent.click(screen.getByTestId('preset-all'));
      const stored = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
      expect(stored.dateRangePreset).toBe('all');
    });

    it('[P1] clicking a preset clears any existing custom dateRange from localStorage', () => {
      seedState({
        dateRangePreset: 'last30',
        dateRange: { startMs: 1_000_000, endMs: 2_000_000 },
      });
      renderDateRangeFilter();
      fireEvent.click(screen.getByTestId('preset-quarter'));
      const stored = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
      expect(stored.dateRange).toBeUndefined();
      expect(stored.dateRangePreset).toBe('quarter');
    });

    it('[P2] clicking preset-last30 when already active re-applies last30 (idempotent)', () => {
      renderDateRangeFilter();
      fireEvent.click(screen.getByTestId('preset-last30'));
      const stored = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
      expect(stored.dateRangePreset).toBe('last30');
      expect(stored.dateRange).toBeUndefined();
    });
  });

  // ── Portuguese i18n ─────────────────────────────────────────────────────────

  describe('Portuguese i18n', () => {
    beforeEach(() => {
      localStorage.setItem('app-language', 'pt');
    });

    it('[P2] renders Portuguese date range label', () => {
      renderDateRangeFilter();
      expect(screen.getByText('Intervalo de datas', { exact: true })).toBeInTheDocument();
    });

    it('[P2] renders all four preset buttons with Portuguese labels', () => {
      renderDateRangeFilter();
      // Scope by testId to avoid multiple-element errors when the trigger also shows
      // the active preset label (default: last30 → "Últimos 30 dias" appears twice).
      expect(screen.getByTestId('preset-last30')).toHaveTextContent('Últimos 30 dias');
      expect(screen.getByTestId('preset-quarter')).toHaveTextContent('Trimestre');
      expect(screen.getByTestId('preset-year')).toHaveTextContent('Ano');
      expect(screen.getByTestId('preset-all')).toHaveTextContent('Todo o período');
    });

    it('[P2] trigger shows Portuguese preset label when dateRangePreset=quarter and language=pt', () => {
      seedState({ dateRangePreset: 'quarter' });
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-picker-trigger')).toHaveTextContent('Trimestre');
    });

    it('[P2] trigger shows Portuguese "All time" label when dateRangePreset=all and language=pt', () => {
      seedState({ dateRangePreset: 'all' });
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-picker-trigger')).toHaveTextContent('Todo o período');
    });

    // Story 6.1 — FR30: PT date format in trigger
    it('[P1] trigger shows "DD/MM/YYYY" format when language=pt and custom dateRange is set (AC3/FR30)', () => {
      // Use local midnight dates — matches ATDD spec pattern to avoid timezone drift
      const startMs = new Date(2026, 0, 15).getTime(); // Jan 15 2026 local midnight
      const endMs = new Date(2026, 1, 28, 23, 59, 59, 999).getTime(); // Feb 28 2026 23:59:59
      seedState({ dateRangePreset: 'last30', dateRange: { startMs, endMs } });
      renderDateRangeFilter();
      const text = screen.getByTestId('date-range-picker-trigger').textContent ?? '';
      // PT: "15/01/2026 – 28/02/2026"
      expect(text).toContain('15/01/2026');
      expect(text).toContain('28/02/2026');
    });
  });

  // ── Story 4.3: ARIA accessibility attributes ─────────────────────────────────

  describe('ARIA accessibility attributes (Story 4.3)', () => {
    // ── Preset group wrapper ────────────────────────────────────────────────

    it('[P0] date-range-presets wrapper has role="group"', () => {
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-presets')).toHaveAttribute('role', 'group');
    });

    it('[P0] date-range-presets wrapper has aria-label="Date range" in English', () => {
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-presets')).toHaveAttribute('aria-label', 'Date range');
    });

    it('[P1] date-range-presets wrapper has Portuguese aria-label when language=pt', () => {
      localStorage.setItem('app-language', 'pt');
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-presets')).toHaveAttribute('aria-label', 'Intervalo de datas');
    });

    // ── type="button" ───────────────────────────────────────────────────────

    it('[P0] all preset buttons have type="button"', () => {
      renderDateRangeFilter();
      expect(screen.getByTestId('preset-last30')).toHaveAttribute('type', 'button');
      expect(screen.getByTestId('preset-quarter')).toHaveAttribute('type', 'button');
      expect(screen.getByTestId('preset-year')).toHaveAttribute('type', 'button');
      expect(screen.getByTestId('preset-all')).toHaveAttribute('type', 'button');
    });

    it('[P0] popover trigger button has type="button"', () => {
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-picker-trigger')).toHaveAttribute('type', 'button');
    });

    // ── Popover trigger aria-label ──────────────────────────────────────────

    it('[P0] popover trigger has aria-label="Pick a date range" in English', () => {
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-picker-trigger')).toHaveAttribute(
        'aria-label',
        'Pick a date range',
      );
    });

    it('[P1] popover trigger has Portuguese aria-label when language=pt', () => {
      localStorage.setItem('app-language', 'pt');
      renderDateRangeFilter();
      expect(screen.getByTestId('date-range-picker-trigger')).toHaveAttribute(
        'aria-label',
        'Escolha um intervalo de datas',
      );
    });

    // ── aria-pressed on preset buttons ──────────────────────────────────────

    it('[P0] preset-last30 has aria-pressed="true" when active (default state)', () => {
      renderDateRangeFilter();
      expect(screen.getByTestId('preset-last30')).toHaveAttribute('aria-pressed', 'true');
    });

    it('[P0] inactive presets have aria-pressed="false" when preset-last30 is active (default)', () => {
      renderDateRangeFilter();
      expect(screen.getByTestId('preset-quarter')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('preset-year')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('preset-all')).toHaveAttribute('aria-pressed', 'false');
    });

    it('[P1] preset-quarter has aria-pressed="true" when dateRangePreset=quarter and no custom range', () => {
      seedState({ dateRangePreset: 'quarter' });
      renderDateRangeFilter();
      expect(screen.getByTestId('preset-quarter')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('preset-last30')).toHaveAttribute('aria-pressed', 'false');
    });

    it('[P1] aria-pressed updates reactively after clicking a different preset', () => {
      renderDateRangeFilter();
      // Initially last30 is active
      expect(screen.getByTestId('preset-last30')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('preset-year')).toHaveAttribute('aria-pressed', 'false');

      // Click "year"
      fireEvent.click(screen.getByTestId('preset-year'));

      // "year" is now active; "last30" is inactive
      expect(screen.getByTestId('preset-year')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('preset-last30')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('preset-quarter')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('preset-all')).toHaveAttribute('aria-pressed', 'false');
    });

    it('[P1] all preset buttons have aria-pressed="false" when a custom dateRange is set (isPresetActive returns false)', () => {
      seedState({
        dateRangePreset: 'last30',
        dateRange: { startMs: 1_000_000, endMs: 2_000_000 },
      });
      renderDateRangeFilter();
      expect(screen.getByTestId('preset-last30')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('preset-quarter')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('preset-year')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('preset-all')).toHaveAttribute('aria-pressed', 'false');
    });
  });

  // ── Edge cases ──────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('[P2] single-day custom range (startMs === endMs) does not crash and shows year in trigger', () => {
      const dayMs = Date.UTC(2025, 5, 15); // Jun 15 2025 UTC
      seedState({ dateRangePreset: 'last30', dateRange: { startMs: dayMs, endMs: dayMs } });
      renderDateRangeFilter();
      const text = screen.getByTestId('date-range-picker-trigger').textContent ?? '';
      // Should render without crashing and not show a preset label
      expect(text).toContain('2025');
      expect(text).not.toBe('Last 30 days');
    });

    it('[P2] calendarRange is initialised from persisted dateRange on mount (trigger shows custom range)', () => {
      const startMs = Date.UTC(2024, 2, 1);  // Mar 1 2024 UTC
      const endMs = Date.UTC(2024, 2, 31);   // Mar 31 2024 UTC
      seedState({ dateRangePreset: 'last30', dateRange: { startMs, endMs } });
      renderDateRangeFilter();
      const text = screen.getByTestId('date-range-picker-trigger').textContent ?? '';
      expect(text).toContain('2024');
      expect(text).not.toBe('Last 30 days');
    });

    it('[P2] very large timestamps do not crash the component', () => {
      // Test with year ~2100 timestamps
      const startMs = Date.UTC(2100, 0, 1);
      const endMs = Date.UTC(2100, 11, 31);
      seedState({ dateRangePreset: 'year', dateRange: { startMs, endMs } });
      renderDateRangeFilter();
      const text = screen.getByTestId('date-range-picker-trigger').textContent ?? '';
      expect(text).toContain('2100');
    });
  });
});
