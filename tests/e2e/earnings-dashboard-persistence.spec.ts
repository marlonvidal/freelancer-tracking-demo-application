import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 1.3 — Earnings dashboard state persistence (ATDD / acceptance).
 * See `_bmad-output/implementation-artifacts/1-3-implement-earnings-dashboard-state-persistence.md`.
 */

const EARNINGS_STATE_KEY = "earnings-dashboard-state";

async function readEarningsDashboardState(page: import("@playwright/test").Page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, EARNINGS_STATE_KEY);
}

test.describe("Story 1.3 — Earnings dashboard persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("app-language", "en");
    });
  });

  test("[P0] saving date range and billable filter writes earnings-dashboard-state (AC1)", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto("/earnings");
    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

    // Date range now uses preset buttons via DateRangeFilter (Story 4.1)
    await page.getByTestId("preset-last30").click();

    const billableControl = page.getByRole("combobox", { name: /billable/i });
    await billableControl.click();
    await page.getByRole("option", { name: /^billable$/i }).click();

    const stored = await readEarningsDashboardState(page);
    expect(stored).not.toBeNull();
    expect(stored).toMatchObject({
      billableFilter: "billable",
    });
    const preset = stored?.dateRangePreset as string | undefined;
    const range = stored?.dateRange as { startMs?: number; endMs?: number } | undefined;
    const hasExplicitRange =
      typeof range?.startMs === "number" && typeof range?.endMs === "number";
    expect(preset === "last30" || hasExplicitRange).toBe(true);
  });

  test("[P0] navigating away and back restores date range and billable filter (AC2)", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto("/earnings");
    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

    // Date range now uses preset buttons via DateRangeFilter (Story 4.1)
    await page.getByTestId("preset-last30").click();

    const billableControl = page.getByRole("combobox", { name: /billable/i });
    await billableControl.click();
    await page.getByRole("option", { name: /non[- ]?billable/i }).click();

    await page.getByRole("link", { name: /board/i }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/earnings");
    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

    // Verify date range preset restored — preset-last30 button visible means DateRangeFilter loaded
    await expect(page.getByTestId("preset-last30")).toBeVisible();
    // Verify state persisted in localStorage
    const stored = await readEarningsDashboardState(page);
    expect(stored?.dateRangePreset).toBe("last30");
    await expect(
      page.getByRole("combobox", { name: /billable/i }),
    ).toContainText(/non[- ]?billable/i);
  });

  test("[P1] reload on /earnings restores persisted filter state (AC3)", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto("/earnings");
    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

    // Date range now uses preset buttons via DateRangeFilter (Story 4.1)
    await page.getByTestId("preset-last30").click();

    const billableControl = page.getByRole("combobox", { name: /billable/i });
    await billableControl.click();
    await page.getByRole("option", { name: /^all$/i }).click();

    await page.reload();

    // Verify date range preset restored after reload
    await expect(page.getByTestId("preset-last30")).toBeVisible();
    const stored = await readEarningsDashboardState(page);
    expect(stored?.dateRangePreset).toBe("last30");
    await expect(
      page.getByRole("combobox", { name: /billable/i }),
    ).toContainText(/^all$/i);
  });

  test("[P1] persisted document includes activeChart in earnings-dashboard-state (AC5)", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto("/earnings");
    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

    const chartControl = page.getByRole("combobox", { name: /chart/i });
    await chartControl.click();
    await page.getByRole("option", { name: /^project$/i }).click();

    const stored = await readEarningsDashboardState(page);
    expect(stored).toMatchObject({ activeChart: "project" });
  });

  test("[P0] after app data clear, dashboard shows default filters — localStorage key removed (AC4 E2E)", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto("/earnings");
    await page.evaluate((key) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          billableFilter: "billable",
          dateRangePreset: "year",
          activeChart: "tag",
        }),
      );
    }, EARNINGS_STATE_KEY);
    await page.reload();
    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

    const clearTrigger = page.getByRole("button", { name: /clear.*data|reset.*data/i });
    await clearTrigger.click();

    await page.reload();
    const raw = await page.evaluate((key) => localStorage.getItem(key), EARNINGS_STATE_KEY);
    expect(raw).toBeNull();

    // Date range uses preset buttons via DateRangeFilter (Story 4.1) — default is last30
    await expect(page.getByTestId("preset-last30")).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: /billable/i }),
    ).toContainText(/^all$/i);
    await expect(page.getByRole("combobox", { name: /chart/i })).toContainText(/^customer$/i);
  });
});
