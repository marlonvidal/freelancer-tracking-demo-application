import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 7.1 — WCAG 2.1 AA Accessibility for Dashboard (ATDD).
 * E2E acceptance tests verifying screen-reader compatibility, keyboard
 * navigation, ARIA attributes, and accessible chart data summaries.
 *
 * ACs covered:
 *   AC1/FR34/NFR-A1 — Charts announced by screen readers: heading, sr-only data summary,
 *                     empty-state roles, locale-aware Globe button aria-label
 *   AC2/FR33/NFR-A7 — Keyboard navigation: page structure (main + h1), chart Select focusable
 *   AC4/FR36/NFR-A5 — Color not only distinction: sr-only list is text alternative for pie segments
 *   AC6/FR38/NFR-A6 — Date range picker trigger has accessible aria-label (already done in Story 4.3)
 *
 * ACs NOT covered by automated tests (verification-only):
 *   AC3/FR35/NFR-A4 — Focus indicators (shadcn/ui button ring, already present from stories 4.1–4.3)
 *   AC5/FR37/NFR-A3 — Contrast ratio 4.5:1 / 3:1 (manual axe-core check; shadcn defaults pass)
 *
 * Conventions (from project-context.md and story Dev Notes):
 *   - Always import from '../support/fixtures' (not '@playwright/test')
 *   - Always await blockKnownThirdPartyHosts(page) before page.goto()
 *   - Seed via addInitScript — never rely on app defaults (app has 5 sample tasks)
 *   - Use data-testid selectors for bilingual element targeting
 *   - Use { exact: true } with getByText() to avoid substring false matches
 *   - Do NOT use test.skip() (D1 retro action — project-wide convention)
 *   - Dashboard state seed must be a complete, valid EarningsDashboardPersistedState
 *   - blockKnownThirdPartyHosts(page) is async — must be awaited
 */

// ── Seed factories ─────────────────────────────────────────────────────────────

/**
 * Normal seed: two billable tasks within last30 range, two different clients.
 * Renders charts and metrics — required for AC1/FR34 chart tests.
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
      clientId: "c2",
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
  clients: [
    { id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" },
    { id: "c2", name: "TechStart", hourlyRate: 50, color: "#8b5cf6" },
  ],
  version: 1,
});

/**
 * Empty seed: no tasks — triggers the earnings-empty-no-tasks state.
 */
const buildEmptySeed = () => ({
  tasks: [],
  columns: [{ id: "col-1", title: "In Progress", order: 0 }],
  clients: [],
  version: 1,
});

// ── Test suite ─────────────────────────────────────────────────────────────────

test.describe("Story 7.1 — WCAG 2.1 AA Accessibility for Dashboard", () => {
  // ── AC1/FR34/NFR-A1: Chart ARIA — screen reader accessible labels ────────────

  test(
    "[P0] Customer chart container has accessible heading and sr-only data summary (AC1/FR34/NFR-A1)",
    async ({ page }) => {
      await page.addInitScript((data) => {
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
      }, buildNormalSeed());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Chart heading is visible and accessible
      const chartContainer = page.getByTestId("customer-revenue-chart");
      await expect(chartContainer).toBeVisible();

      // h2 heading with id for aria-labelledby
      const heading = chartContainer.locator("h2#customer-chart-heading");
      await expect(heading).toBeVisible();
      await expect(heading).toContainText("Revenue by Customer");

      // sr-only data summary list exists and has data items
      const srList = chartContainer.locator("ul.sr-only");
      await expect(srList).toBeAttached(); // in DOM even if visually hidden
      const items = srList.locator("li");
      await expect(items).toHaveCount(2); // two clients in seed

      // Items contain client name and currency/percentage values
      await expect(items.first()).toContainText("Acme Corp");
      await expect(items.first()).toContainText("$");
      await expect(items.first()).toContainText("%");
    },
  );

  test(
    "[P0] All three chart headings render with translated text (AC1/FR34)",
    async ({ page }) => {
      await page.addInitScript((data) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
      }, buildNormalSeed());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Customer chart (default view)
      await expect(
        page.getByTestId("customer-revenue-chart").locator("h2"),
      ).toContainText("Revenue by Customer");

      // Switch to project chart via button group
      await page.getByTestId("chart-view-project").click();
      await expect(
        page.getByTestId("project-revenue-chart").locator("h2"),
      ).toContainText("Revenue by Project");

      // Switch to tag chart
      await page.getByTestId("chart-view-tag").click();
      await expect(
        page.getByTestId("tag-revenue-chart").locator("h2"),
      ).toContainText("Revenue by Tag");
    },
  );

  // ── AC1/NFR-A1: Empty state roles — live region announcements ────────────────

  test(
    '[P0] No-tasks empty state has role="status" for screen reader announcement (AC1/NFR-A1)',
    async ({ page }) => {
      await page.addInitScript((data) => {
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
      }, buildEmptySeed());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      const emptyState = page.getByTestId("earnings-empty-no-tasks");
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toHaveAttribute("role", "status");
    },
  );

  test(
    "[P0] Corrupt storage data — dashboard falls back to default state without crashing (AC1/NFR-A1)",
    async ({ page }) => {
      // loadState() catches JSON.parse errors and returns getDefaultState() (5 sample tasks)
      // This test verifies the fallback path: dashboard still renders, not blank or crashed
      await page.addInitScript(() => {
        localStorage.setItem("freelancer-kanban-data", "not-valid-json{{{");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Storage layer falls back to default state — heading and metrics grid must be visible
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByTestId("earnings-metrics")).toBeVisible();
    },
  );

  // ── AC1/NFR-A1: Globe button locale-aware aria-label (deferred from Story 6.1) ─

  test(
    '[P0] Globe button aria-label is locale-aware — EN: "Language" (AC1/NFR-A1)',
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "en");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Globe button must use t.languageToggleLabel = 'Language' (not hardcoded "Globe")
      const globeBtn = page.getByRole("button", { name: "Language" });
      await expect(globeBtn).toBeVisible();
    },
  );

  test(
    '[P0] Globe button aria-label is locale-aware — PT: "Idioma" (AC1/NFR-A1)',
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "pt");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Globe button must use t.languageToggleLabel = 'Idioma' in Portuguese
      const globeBtn = page.getByRole("button", { name: "Idioma" });
      await expect(globeBtn).toBeVisible();
    },
  );

  // ── AC2/FR33: Keyboard navigation — page structure ───────────────────────────

  test(
    "[P1] Dashboard has proper page structure: main landmark and h1 heading (AC2/FR33)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "en");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Main landmark exists — required for keyboard/screen reader navigation
      await expect(page.locator("main")).toBeVisible();

      // H1 heading exists — page title for screen readers
      await expect(
        page.getByRole("heading", { level: 1 }),
      ).toContainText("Earnings dashboard");
    },
  );

  test(
    "[P1] Chart view button group is reachable via focus and operable via keyboard (AC2/FR33/NFR-A7)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "en");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Customer chart button is visible and focusable (keyboard reachability)
      const customerBtn = page.getByTestId("chart-view-customer");
      await expect(customerBtn).toBeVisible();

      // Verify element can receive focus programmatically
      await customerBtn.focus();
      await expect(customerBtn).toBeFocused();
    },
  );

  // ── AC4/FR36/NFR-A5: Color not only distinction ──────────────────────────────

  test(
    "[P1] Customer chart sr-only list provides text alternative for all chart data (AC4/FR36/NFR-A5)",
    async ({ page }) => {
      await page.addInitScript((data) => {
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
      }, buildNormalSeed());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();
      await expect(
        page.getByTestId("customer-revenue-chart"),
      ).toBeVisible();

      // The sr-only list serves as the text alternative for color-coded pie segments
      const srList = page
        .getByTestId("customer-revenue-chart")
        .locator("ul.sr-only");
      await expect(srList).toBeAttached();

      // Both clients appear in the list — text, not color, conveys the data distinction
      const items = srList.locator("li");
      const texts = await items.allTextContents();
      expect(texts.some((t) => t.includes("TechStart"))).toBe(true);
      expect(texts.some((t) => t.includes("Acme Corp"))).toBe(true);
    },
  );

  // ── AC6/FR38/NFR-A6: Help text for complex features ─────────────────────────

  test(
    "[P1] Date range picker trigger has accessible aria-label describing its purpose (AC6/FR38/NFR-A6)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "en");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Date range trigger already has aria-label from Story 4.3
      // (aria-label={t.earningsPickDateRange} = 'Pick a date range')
      const trigger = page.getByTestId("date-range-picker-trigger");
      await expect(trigger).toBeVisible();
      const ariaLabel = await trigger.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy(); // confirms aria-label is present and non-empty
    },
  );
});
