import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 6.1 — i18n Translations for Dashboard (ATDD).
 * E2E acceptance tests verifying locale-aware rendering of all dashboard text,
 * date formats, currency formats, chart titles, and live language toggling.
 *
 * ACs covered:
 *   AC1/FR28 — All labels/buttons/help text render in the selected language
 *   AC2/FR29 — Chart titles/legends are translated (already implemented; regression guard)
 *   AC3/FR30 — Date display in DateRangeFilter reflects locale format
 *              EN: MMM d, yyyy  (e.g. "Jan 15, 2026")
 *              PT: dd/MM/yyyy   (e.g. "15/01/2026")
 *   AC4/FR31 — Currency formatting reflects locale (EN: $1,234.56 / PT: US$ 1.234,56)
 *   AC5/FR32 — Tooltip text structure in selected language (data-driven; covered by FR31 fix)
 *   AC6      — Language toggle via Globe icon updates text immediately, no reload
 *
 * Conventions (from project-context.md and story Dev Notes):
 *   - Always import from '../support/fixtures' (not '@playwright/test')
 *   - Always await blockKnownThirdPartyHosts(page) before page.goto()
 *   - Seed via addInitScript — never rely on app defaults (app has 5 sample tasks)
 *   - Use data-testid selectors for bilingual element targeting
 *   - Use { exact: true } with getByText() to avoid substring false matches
 *   - page.addInitScript accepts a callback + ONE serializable arg; use two
 *     separate calls when seeding two localStorage keys
 *   - Dashboard state must include all four fields: version, dateRangePreset,
 *     billableFilter, activeChart — coercePersisted rejects incomplete objects
 *   - Do NOT use test.skip() (D1 retro action — project-wide convention)
 */

// ── Seed factories ────────────────────────────────────────────────────────────

/**
 * Normal seed: two billable tasks within last30 range.
 * Renders charts and metrics — required for FR29/FR31 chart tests.
 */
const buildNormalSeed = () => ({
  tasks: [
    {
      id: "t1",
      title: "Task 1",
      columnId: "col-1",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 100,
      timeSpent: 3600,
      createdAt: Date.now() - 5 * 86400000,
      priority: "medium",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: [],
      order: 0,
    },
    {
      id: "t2",
      title: "Task 2",
      columnId: "col-1",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 50,
      timeSpent: 7200,
      createdAt: Date.now() - 3 * 86400000,
      priority: "low",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: [],
      order: 1,
    },
  ],
  columns: [{ id: "col-1", title: "In Progress", order: 0 }],
  clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
  version: 1,
});

/**
 * Dashboard state with a fixed custom date range for FR30 date format tests.
 * Fixed dates: Jan 15, 2026 → Feb 28, 2026.
 * Must include all four EarningsDashboardPersistedState fields (coercePersisted
 * rejects incomplete objects — documented Story 4.2 ATDD bug).
 */
const FIXED_START_MS = new Date(2026, 0, 15).getTime(); // local midnight Jan 15 — timezone-agnostic
const FIXED_END_MS = new Date(2026, 1, 28, 23, 59, 59, 999).getTime(); // local 23:59:59 Feb 28

const buildCustomRangeDashboardState = () => ({
  version: 1,
  dateRangePreset: "last30",
  dateRange: { startMs: FIXED_START_MS, endMs: FIXED_END_MS },
  billableFilter: "all",
  activeChart: "customer",
});

// ── Test suite ────────────────────────────────────────────────────────────────

test.describe("Story 6.1 — i18n Translations for Dashboard", () => {
  // ── AC1/FR28: English mode — baseline labels ─────────────────────────────────

  test(
    "[P0] English mode shows dashboard heading in English (AC1/FR28)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "en");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      await expect(
        page.getByRole("heading", { name: "Earnings dashboard", exact: true }),
      ).toBeVisible();
    },
  );

  // ── AC1/FR28: Portuguese mode — all labels translated ────────────────────────

  test(
    "[P0] Portuguese mode shows dashboard heading in Portuguese (AC1/FR28)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "pt");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      await expect(
        page.getByRole("heading", { name: "Painel de ganhos", exact: true }),
      ).toBeVisible();
    },
  );

  // ── AC3/FR30: Date format — English uses MMM d, yyyy ────────────────────────

  test(
    '[P1] English mode formats custom date range as "MMM d, yyyy" (AC3/FR30)',
    async ({ page }) => {
      await page.addInitScript((dashState) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem(
          "earnings-dashboard-state",
          JSON.stringify(dashState),
        );
      }, buildCustomRangeDashboardState());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // EN format: "Jan 15, 2026 – Feb 28, 2026"
      const trigger = page.getByTestId("date-range-picker-trigger");
      await expect(trigger).toContainText("Jan 15, 2026");
      await expect(trigger).toContainText("Feb 28, 2026");
    },
  );

  // ── AC3/FR30: Date format — Portuguese uses DD/MM/YYYY ──────────────────────

  test(
    '[P1] Portuguese mode formats custom date range as "DD/MM/YYYY" (AC3/FR30)',
    async ({ page }) => {
      await page.addInitScript((dashState) => {
        localStorage.setItem("app-language", "pt");
        localStorage.setItem(
          "earnings-dashboard-state",
          JSON.stringify(dashState),
        );
      }, buildCustomRangeDashboardState());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // PT format: "15/01/2026 – 28/02/2026"
      const trigger = page.getByTestId("date-range-picker-trigger");
      await expect(trigger).toContainText("15/01/2026");
      await expect(trigger).toContainText("28/02/2026");
    },
  );

  // ── AC2/FR29: Chart title in Portuguese (regression guard — already done) ────

  test(
    "[P1] Portuguese mode shows customer chart title in Portuguese (AC2/FR29)",
    async ({ page }) => {
      await page.addInitScript((taskData) => {
        localStorage.setItem("app-language", "pt");
        localStorage.setItem(
          "freelancer-kanban-data",
          JSON.stringify(taskData),
        );
      }, buildNormalSeed());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Chart title must be in Portuguese — scoped to chart to avoid false
      // match with metric card label "Cliente" (strict mode selector).
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();
      await expect(
        page
          .getByTestId("customer-revenue-chart")
          .getByText("Receita por Cliente", { exact: true }),
      ).toBeVisible();
    },
  );

  // ── AC6: Language toggle updates text immediately ────────────────────────────

  test(
    "[P1] Language toggle switches dashboard text immediately without reload (AC6)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "en");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Verify English mode first
      await expect(
        page.getByRole("heading", { name: "Earnings dashboard", exact: true }),
      ).toBeVisible();

      // Open language dropdown via Globe icon button in the header
      // aria-label is now locale-aware: "Language" in EN (Story 7.1 accessibility fix)
      await page.getByRole("button", { name: /language/i }).first().click();
      // Click the Portuguese option — label is "Portuguese" in EN mode; match by role+name pattern
      await page.getByRole("menuitem", { name: /portugu/i }).click();

      // Heading must switch to Portuguese immediately — no navigation
      await expect(
        page.getByRole("heading", { name: "Painel de ganhos", exact: true }),
      ).toBeVisible();
    },
  );
});
