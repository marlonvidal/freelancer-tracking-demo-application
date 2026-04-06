import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '@/context/LanguageContext';
import { EarningsDashboardStateProvider } from '@/context/EarningsDashboardStateContext';
import { EARNINGS_DASHBOARD_STORAGE_KEY } from '@/lib/earnings-dashboard-storage';
import BillableToggle from './BillableToggle';

/**
 * Component-level tests for BillableToggle (Story 4.2).
 *
 * Coverage targets not addressed by existing ATDD or EarningsDashboard.test.tsx:
 *   - Rendering: wrapper, all three buttons with testids, label
 *   - Button labels: English and Portuguese i18n text
 *   - Active state: CSS variant class (bg-primary) inspection per filter value
 *   - Click interactions: localStorage update after each button click
 *   - Edge cases: idempotent re-click, default state (no seed)
 *
 * Pattern mirrors DateRangeFilter.test.tsx (Story 4.1 reference implementation).
 */

function renderBillableToggle() {
  return render(
    <LanguageProvider>
      <EarningsDashboardStateProvider>
        <BillableToggle />
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
      dateRangePreset: 'last30',
      activeChart: 'customer',
      ...partial,
    }),
  );
}

describe('BillableToggle', () => {
  beforeEach(() => {
    localStorage.removeItem(EARNINGS_DASHBOARD_STORAGE_KEY);
    localStorage.removeItem('app-language');
  });

  // ── Rendering ───────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('[P0] renders the billable-toggle wrapper with data-testid', () => {
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle')).toBeInTheDocument();
    });

    it('[P0] renders all three filter buttons with correct data-testid attributes', () => {
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-all')).toBeInTheDocument();
      expect(screen.getByTestId('billable-toggle-billable')).toBeInTheDocument();
      expect(screen.getByTestId('billable-toggle-nonBillable')).toBeInTheDocument();
    });

    it('[P0] renders the "Billable filter" label in English', () => {
      renderBillableToggle();
      expect(screen.getByText('Billable filter', { exact: true })).toBeInTheDocument();
    });
  });

  // ── Button labels — English i18n ─────────────────────────────────────────────

  describe('button labels — English', () => {
    it('[P0] renders "All" label on the all button', () => {
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-all')).toHaveTextContent('All');
    });

    it('[P0] renders "Billable" label on the billable button', () => {
      renderBillableToggle();
      // { exact: true } avoids substring collision with "Non-billable"
      expect(screen.getByTestId('billable-toggle-billable')).toHaveTextContent('Billable');
    });

    it('[P0] renders "Non-billable" label on the nonBillable button', () => {
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-nonBillable')).toHaveTextContent('Non-billable');
    });
  });

  // ── Button labels — Portuguese i18n ─────────────────────────────────────────

  describe('button labels — Portuguese', () => {
    beforeEach(() => {
      localStorage.setItem('app-language', 'pt');
    });

    it('[P1] renders Portuguese label "Filtro faturável" for the billable filter label', () => {
      renderBillableToggle();
      expect(screen.getByText('Filtro faturável', { exact: true })).toBeInTheDocument();
    });

    it('[P1] renders Portuguese label "Faturável" on the billable button', () => {
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-billable')).toHaveTextContent('Faturável');
    });

    it('[P1] renders Portuguese label "Não faturável" on the nonBillable button', () => {
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-nonBillable')).toHaveTextContent('Não faturável');
    });
  });

  // ── Active state (variant class inspection) ──────────────────────────────────

  describe('active state highlighting', () => {
    it('[P1] "all" button has default variant (bg-primary) when no filter is seeded (default is all)', () => {
      renderBillableToggle();
      const allBtn = screen.getByTestId('billable-toggle-all');
      // CVA "default" variant renders bg-primary; "outline" variant does not.
      expect(allBtn.className).toContain('bg-primary');
      // Inactive buttons must NOT have bg-primary
      expect(screen.getByTestId('billable-toggle-billable').className).not.toContain('bg-primary');
      expect(screen.getByTestId('billable-toggle-nonBillable').className).not.toContain('bg-primary');
    });

    it('[P1] "billable" button has default variant (bg-primary) when billableFilter=billable', () => {
      seedState({ billableFilter: 'billable' });
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-billable').className).toContain('bg-primary');
      expect(screen.getByTestId('billable-toggle-all').className).not.toContain('bg-primary');
      expect(screen.getByTestId('billable-toggle-nonBillable').className).not.toContain('bg-primary');
    });

    it('[P1] "nonBillable" button has default variant (bg-primary) when billableFilter=nonBillable', () => {
      seedState({ billableFilter: 'nonBillable' });
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-nonBillable').className).toContain('bg-primary');
      expect(screen.getByTestId('billable-toggle-all').className).not.toContain('bg-primary');
      expect(screen.getByTestId('billable-toggle-billable').className).not.toContain('bg-primary');
    });
  });

  // ── Click interactions ───────────────────────────────────────────────────────

  describe('click interactions', () => {
    it('[P1] clicking the "Billable" button persists billableFilter="billable" to localStorage', () => {
      renderBillableToggle();
      fireEvent.click(screen.getByTestId('billable-toggle-billable'));
      const stored = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
      expect(stored.billableFilter).toBe('billable');
    });

    it('[P1] clicking the "Non-billable" button persists billableFilter="nonBillable" to localStorage', () => {
      renderBillableToggle();
      fireEvent.click(screen.getByTestId('billable-toggle-nonBillable'));
      const stored = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
      expect(stored.billableFilter).toBe('nonBillable');
    });

    it('[P1] clicking the "All" button persists billableFilter="all" to localStorage', () => {
      seedState({ billableFilter: 'billable' });
      renderBillableToggle();
      fireEvent.click(screen.getByTestId('billable-toggle-all'));
      const stored = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
      expect(stored.billableFilter).toBe('all');
    });

    it('[P1] clicking a button does not alter other persisted state fields (dateRangePreset preserved)', () => {
      seedState({ dateRangePreset: 'year', billableFilter: 'all' });
      renderBillableToggle();
      fireEvent.click(screen.getByTestId('billable-toggle-billable'));
      const stored = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
      expect(stored.billableFilter).toBe('billable');
      expect(stored.dateRangePreset).toBe('year');
    });
  });

  // ── Story 4.3: ARIA accessibility attributes ─────────────────────────────────

  describe('ARIA accessibility attributes (Story 4.3)', () => {
    it('[P0] billable-toggle wrapper has role="group"', () => {
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle')).toHaveAttribute('role', 'group');
    });

    it('[P0] billable-toggle wrapper has aria-label="Billable filter" in English', () => {
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle')).toHaveAttribute('aria-label', 'Billable filter');
    });

    it('[P1] billable-toggle wrapper has Portuguese aria-label when language=pt', () => {
      localStorage.setItem('app-language', 'pt');
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle')).toHaveAttribute('aria-label', 'Filtro faturável');
    });

    it('[P0] all filter buttons have type="button"', () => {
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-all')).toHaveAttribute('type', 'button');
      expect(screen.getByTestId('billable-toggle-billable')).toHaveAttribute('type', 'button');
      expect(screen.getByTestId('billable-toggle-nonBillable')).toHaveAttribute('type', 'button');
    });

    it('[P0] "all" button has aria-pressed="true" when billableFilter=all (default)', () => {
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-all')).toHaveAttribute('aria-pressed', 'true');
    });

    it('[P0] "billable" and "nonBillable" buttons have aria-pressed="false" when billableFilter=all (default)', () => {
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-billable')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('billable-toggle-nonBillable')).toHaveAttribute('aria-pressed', 'false');
    });

    it('[P1] "billable" button has aria-pressed="true" when billableFilter=billable', () => {
      seedState({ billableFilter: 'billable' });
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-billable')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('billable-toggle-all')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('billable-toggle-nonBillable')).toHaveAttribute('aria-pressed', 'false');
    });

    it('[P1] "nonBillable" button has aria-pressed="true" when billableFilter=nonBillable', () => {
      seedState({ billableFilter: 'nonBillable' });
      renderBillableToggle();
      expect(screen.getByTestId('billable-toggle-nonBillable')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('billable-toggle-all')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('billable-toggle-billable')).toHaveAttribute('aria-pressed', 'false');
    });

    it('[P1] aria-pressed updates reactively after clicking a different filter button', () => {
      renderBillableToggle();
      // Initially "all" is active
      expect(screen.getByTestId('billable-toggle-all')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('billable-toggle-billable')).toHaveAttribute('aria-pressed', 'false');

      // Click "billable"
      fireEvent.click(screen.getByTestId('billable-toggle-billable'));

      // "billable" is now active; "all" is inactive
      expect(screen.getByTestId('billable-toggle-billable')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('billable-toggle-all')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('billable-toggle-nonBillable')).toHaveAttribute('aria-pressed', 'false');
    });
  });

  // ── Edge cases ───────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('[P2] re-clicking the active "all" button is idempotent — billableFilter stays "all"', () => {
      renderBillableToggle();
      fireEvent.click(screen.getByTestId('billable-toggle-all'));
      const stored = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
      expect(stored.billableFilter).toBe('all');
      // Button should still have active variant
      expect(screen.getByTestId('billable-toggle-all').className).toContain('bg-primary');
    });

    it('[P2] re-clicking the active "billable" button is idempotent — billableFilter stays "billable"', () => {
      seedState({ billableFilter: 'billable' });
      renderBillableToggle();
      fireEvent.click(screen.getByTestId('billable-toggle-billable'));
      const stored = JSON.parse(localStorage.getItem(EARNINGS_DASHBOARD_STORAGE_KEY)!);
      expect(stored.billableFilter).toBe('billable');
    });

    it('[P2] all three buttons render with no localStorage seed — defaults to billableFilter=all', () => {
      renderBillableToggle();
      // All three buttons must render regardless of seed state
      expect(screen.getByTestId('billable-toggle-all')).toBeInTheDocument();
      expect(screen.getByTestId('billable-toggle-billable')).toBeInTheDocument();
      expect(screen.getByTestId('billable-toggle-nonBillable')).toBeInTheDocument();
      // Default filter is 'all'
      expect(screen.getByTestId('billable-toggle-all').className).toContain('bg-primary');
    });
  });
});
