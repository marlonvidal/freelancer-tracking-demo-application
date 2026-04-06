import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 7.2 — Final Polish & Deferred Work Resolution (ATDD).
 * E2E acceptance tests verifying all deferred items are resolved before MVP release.
 *
 * ACs covered:
 *   AC1 — Dark mode button has locale-aware aria-label (EN: "Dark mode", PT: "Modo escuro")
 *   AC2 — Metrics section is a named `region` landmark (role="region")
 *   AC3 — Calendar popover closes automatically after full date range selection (D4)
 *   AC4 — Chart view control is a button group (not a <Select> combobox) (D5)
 *   AC6 — sr-only <ul> in chart components has no redundant aria-label (only aria-labelledby)
 *   AC9 — Negative timeSpent values are clamped to 0 in calculateSummaryMetrics
 *
 * ACs NOT covered by automated E2E tests:
 *   AC5 — useMemo for visibleData (internal implementation detail; no observable DOM signal)
 *   AC7 — E2E performance timer position (fix to existing test infrastructure, not a feature)
 *   AC8 — Zombie test rewrite (changes to story-7-1 spec, not this spec)
 *
 * Conventions (from project-context.md and story Dev Notes):
 *   - Always import from '../support/fixtures' (not '@playwright/test')
 *   - Always await blockKnownThirdPartyHosts(page) before page.goto()
 *   - Seed via addInitScript — never rely on app defaults
 *   - Use data-testid selectors for bilingual element targeting
 *   - Use { exact: true } with getByText() to avoid substring false matches
 *   - Do NOT use test.skip() (D1 retro action — project-wide convention)
 *   - blockKnownThirdPartyHosts(page) is async — must be awaited
 *
 * RED PHASE: All tests will fail until implementation is complete.
 */

// ── Seed factories ─────────────────────────────────────────────────────────────

/**
 * Normal seed: two billable tasks within last30 range.
 * Renders metrics + charts — required for AC2/AC6 tests.
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
 * Corrupt-timeSpent seed: one task with negative timeSpent.
 * Used to verify AC9: clamping prevents negative averageHourlyRate in the UI.
 */
const buildNegativeTimeSpentSeed = () => ({
  tasks: [
    {
      id: "t1",
      title: "Corrupt Task",
      columnId: "col-1",
      clientId: "c1",
      isBillable: true,
      hourlyRate: 100,
      timeSpent: -3600, // corrupt negative value
      createdAt: Date.now() - 5 * 86400000,
      priority: "medium",
      description: "",
      timeEstimate: null,
      dueDate: null,
      tags: [],
      order: 0,
    },
  ],
  columns: [{ id: "col-1", title: "In Progress", order: 0 }],
  clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
  version: 1,
});

// ── Test suite ─────────────────────────────────────────────────────────────────

test.describe("Story 7.2 — Final Polish & Deferred Work Resolution", () => {
  // ── AC1: Dark mode button locale-aware aria-label ──────────────────────────

  test(
    '[P0] Dark mode toggle has locale-aware aria-label in English — "Dark mode" (AC1/WCAG-4.1.2)',
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "en");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // In light mode (default), the button announces what action it enables: "Dark mode"
      // aria-label must be set to t.darkModeLabel = 'Dark mode' (not hardcoded)
      const darkModeBtn = page.getByRole("button", { name: "Dark mode" });
      await expect(darkModeBtn).toBeVisible();
    },
  );

  test(
    '[P0] Dark mode toggle has locale-aware aria-label in Portuguese — "Modo escuro" (AC1/WCAG-4.1.2)',
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "pt");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // PT locale: t.darkModeLabel = 'Modo escuro'
      const darkModeBtn = page.getByRole("button", { name: "Modo escuro" });
      await expect(darkModeBtn).toBeVisible();
    },
  );

  test(
    '[P1] Dark mode toggle aria-label switches to "Light mode" after toggling to dark (AC1/WCAG-4.1.2)',
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "en");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Click to enter dark mode — label should change to "Light mode" (t.lightModeLabel)
      await page.getByRole("button", { name: "Dark mode" }).click();
      const lightModeBtn = page.getByRole("button", { name: "Light mode" });
      await expect(lightModeBtn).toBeVisible();
    },
  );

  // ── AC2: Metrics section is a named ARIA region landmark ──────────────────

  test(
    '[P0] Metrics section has role="region" making it a named ARIA landmark (AC2/WCAG-1.3.6)',
    async ({ page }) => {
      await page.addInitScript((data) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
      }, buildNormalSeed());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      const metricsDiv = page.getByTestId("earnings-metrics");
      await expect(metricsDiv).toBeVisible();
      // Must be a named region landmark for screen reader landmark navigation
      await expect(metricsDiv).toHaveAttribute("role", "region");
    },
  );

  // ── AC3: Calendar popover auto-closes after full date range (D4) ───────────

  test(
    "[P1] Date picker popover closes automatically after selecting both start and end dates (AC3/D4)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "en");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Open the calendar popover via its trigger
      const trigger = page.getByTestId("date-range-picker-trigger");
      await expect(trigger).toBeVisible();
      await trigger.click();

      // Popover content must appear
      const calendar = page.locator("[data-radix-popper-content-wrapper]");
      await expect(calendar).toBeVisible();

      // Select start date: first available calendar day button
      const dayButtons = page.locator("button[name]").filter({ hasText: /^\d+$/ });
      await dayButtons.first().click();
      // Select end date: a later day
      await dayButtons.nth(5).click();

      // After both dates are selected, popover must auto-close (D4 fix: setOpen(false))
      await expect(calendar).not.toBeVisible();
    },
  );

  // ── AC4: Chart view is a button group (not a <Select> combobox) (D5) ───────

  test(
    "[P1] Chart view control is a button group with three buttons and correct data-testids (AC4/D5)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "en");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Wrapper group must exist
      const selector = page.getByTestId("chart-view-selector");
      await expect(selector).toBeVisible();
      await expect(selector).toHaveAttribute("role", "group");

      // All three chart buttons must be present
      await expect(page.getByTestId("chart-view-customer")).toBeVisible();
      await expect(page.getByTestId("chart-view-project")).toBeVisible();
      await expect(page.getByTestId("chart-view-tag")).toBeVisible();

      // The old <Select> combobox must no longer exist
      await expect(page.getByRole("combobox")).not.toBeVisible();
    },
  );

  test(
    "[P1] Active chart view button has aria-pressed=true; inactive buttons have aria-pressed=false (AC4/D5)",
    async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("app-language", "en");
      });
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Default active chart is 'customer' — its button must be pressed
      const customerBtn = page.getByTestId("chart-view-customer");
      await expect(customerBtn).toHaveAttribute("aria-pressed", "true");

      // Other buttons must not be pressed
      const projectBtn = page.getByTestId("chart-view-project");
      const tagBtn = page.getByTestId("chart-view-tag");
      await expect(projectBtn).toHaveAttribute("aria-pressed", "false");
      await expect(tagBtn).toHaveAttribute("aria-pressed", "false");
    },
  );

  test(
    "[P1] Clicking project chart button switches the visible chart (AC4/D5)",
    async ({ page }) => {
      await page.addInitScript((data) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
      }, buildNormalSeed());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Customer chart is visible by default
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      // Switch to project chart via button (not combobox)
      await page.getByTestId("chart-view-project").click();

      // Project chart must appear; customer chart must hide
      await expect(page.getByTestId("project-revenue-chart")).toBeVisible();
      await expect(page.getByTestId("customer-revenue-chart")).not.toBeVisible();

      // Project button is now pressed; customer is not
      await expect(page.getByTestId("chart-view-project")).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByTestId("chart-view-customer")).toHaveAttribute("aria-pressed", "false");
    },
  );

  // ── AC6: sr-only <ul> has no redundant aria-label ─────────────────────────

  test(
    "[P1] Customer chart sr-only data list has aria-labelledby but no redundant aria-label (AC6/WCAG-ARIA)",
    async ({ page }) => {
      await page.addInitScript((data) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
      }, buildNormalSeed());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();
      await expect(page.getByTestId("customer-revenue-chart")).toBeVisible();

      const srList = page
        .getByTestId("customer-revenue-chart")
        .locator("ul.sr-only");
      await expect(srList).toBeAttached();

      // Must have aria-labelledby (retained)
      const labelledBy = await srList.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      expect(labelledBy).toContain("customer-chart-heading");

      // Must NOT have aria-label (dead code removed — aria-labelledby takes precedence)
      const ariaLabel = await srList.getAttribute("aria-label");
      expect(ariaLabel).toBeNull();
    },
  );

  // ── AC9: Negative timeSpent clamped to 0 in calculateSummaryMetrics ────────

  test(
    "[P0] Negative timeSpent task does not produce a negative average hourly rate in the UI (AC9)",
    async ({ page }) => {
      await page.addInitScript((data) => {
        localStorage.setItem("app-language", "en");
        localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
      }, buildNegativeTimeSpentSeed());
      await blockKnownThirdPartyHosts(page);
      await page.goto("/earnings");
      await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

      // Dashboard must render without crash
      const metricsDiv = page.getByTestId("earnings-metrics");
      await expect(metricsDiv).toBeVisible();

      // No metric card must display a negative monetary value (e.g. "-$") or negative rate
      // The calculation error state must also not appear (no uncaught exception)
      const errorState = page.getByTestId("earnings-calculation-error");
      await expect(errorState).not.toBeVisible();

      // All visible metric values must not start with a minus sign
      const metricValues = page.locator("[data-testid^='metric-']");
      const count = await metricValues.count();
      for (let i = 0; i < count; i++) {
        const text = await metricValues.nth(i).textContent();
        if (text) {
          expect(text).not.toMatch(/^-\$|avg.*-|rate.*-/i);
        }
      }
    },
  );
});
