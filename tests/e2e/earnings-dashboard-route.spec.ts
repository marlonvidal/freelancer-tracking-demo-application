import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 1.1 — Set up /earnings route and EarningsDashboard.
 *
 * Coverage:
 *   AC1 [P0] /earnings renders dashboard shell; heading + document title reflect earnings (i18n)
 *   AC2 [P0] Back from /earnings preserves freelancer-kanban-data in localStorage
 *   AC3 [P1] Navigation to /earnings meets NFR-P5 (< 1s) on dev build
 */

test.describe("Story 1.1 — /earnings route", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("app-language", "en");
    });
  });

  test("[P0] renders earnings dashboard heading and tab title", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto("/earnings");

    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /earnings/i }),
    ).toBeVisible();
    await expect(page).toHaveTitle(/earnings/i);
  });

  test("[P0] renders earnings dashboard with Portuguese copy when locale is pt", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("app-language", "pt");
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto("/earnings");

    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /ganhos/i }),
    ).toBeVisible();
    await expect(page).toHaveTitle(/ganhos/i);
  });

  test("[P0] back navigation from /earnings preserves kanban localStorage", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);

    const seed = {
      tasks: [{ id: "t1", title: "Seed", columnId: "col1" }],
      columns: [{ id: "col1", title: "Todo" }],
      meta: { atdd: true },
    };

    await page.addInitScript((data) => {
      localStorage.setItem("freelancer-kanban-data", JSON.stringify(data));
    }, seed);

    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();

    await page.goto("/earnings");
    await page.goBack();

    expect(new URL(page.url()).pathname).toBe("/");

    const stored = await page.evaluate(() =>
      localStorage.getItem("freelancer-kanban-data"),
    );
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored as string) as {
      tasks: Array<{ id: string; title: string; columnId: string }>;
      columns: Array<{ id: string; title: string }>;
      meta?: { atdd?: boolean };
    };
    // Index normalizes seeded state on load (adds clients, defaults, etc.); AC2 is
    // that a trip through /earnings does not clear or drop seeded domain rows.
    expect(parsed.tasks.some((t) => t.id === "t1" && t.title === "Seed")).toBe(
      true,
    );
    expect(
      parsed.columns.some((c) => c.id === "col1" && c.title === "Todo"),
    ).toBe(true);
    expect(parsed.meta?.atdd).toBe(true);
  });

  test("[P1] loads /earnings within 1 second (NFR-P5)", async ({ page }) => {
    await blockKnownThirdPartyHosts(page);

    const start = Date.now();
    await page.goto("/earnings");
    const elapsedMs = Date.now() - start;

    expect(elapsedMs).toBeLessThan(1000);
  });
});
