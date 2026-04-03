import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * Story 1.2 — Integrate Earnings Dashboard into Main Navigation.
 *
 * Coverage:
 *   AC1 [P0] "Earnings" link visible in header nav; text translated via i18n (EN + PT)
 *   AC2 [P0] Clicking "Earnings" navigates to /earnings and renders EarningsDashboard
 *   AC3 [P1] Active link is visually highlighted on the current page
 *   AC4 [P0] Clicking "Board" or logo navigates back to / without data loss
 *   AC5 [P1] Navigation links remain accessible on small viewports (≥ 320px)
 *
 * TDD Phase: GREEN — Story 1.2 implemented.
 */

test.describe("Story 1.2 — Earnings nav integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("app-language", "en");
    });
  });

  test("[P0] header shows Earnings and Board navigation links", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto("/");

    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: /earnings/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /board/i })).toBeVisible();
  });

  test("[P0] navigation links use translated text in Portuguese", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("app-language", "pt");
    });
    await blockKnownThirdPartyHosts(page);
    await page.goto("/");

    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: /ganhos/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /quadro/i })).toBeVisible();
  });

  test("[P0] clicking Earnings link navigates to /earnings and shows dashboard", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto("/");

    await page.getByRole("link", { name: /earnings/i }).click();
    await expect(page).toHaveURL(/\/earnings$/);
    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();
  });

  test("[P1] active Earnings link is highlighted when on /earnings", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto("/earnings");

    const earningsLink = page.getByRole("link", { name: /earnings/i });
    await expect(earningsLink).toBeVisible();
    await expect(earningsLink).toHaveClass(/active|font-bold|border-b|underline/);
  });

  test("[P1] active Board link is highlighted when on /", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto("/");

    const boardLink = page.getByRole("link", { name: /board/i });
    await expect(boardLink).toBeVisible();
    await expect(boardLink).toHaveClass(/active|font-bold|border-b|underline/);
  });

  test("[P0] clicking Board link from /earnings returns to / without data loss", async ({
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

    await page.goto("/earnings");
    await expect(page.getByTestId("earnings-dashboard")).toBeVisible();

    await page.getByRole("link", { name: /board/i }).click();
    await expect(page).toHaveURL(/\/$/);

    const stored = await page.evaluate(() =>
      localStorage.getItem("freelancer-kanban-data"),
    );
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored as string) as {
      tasks: Array<{ id: string; title: string; columnId: string }>;
      columns: Array<{ id: string; title: string }>;
      meta?: { atdd?: boolean };
    };
    expect(parsed.tasks.some((t) => t.id === "t1" && t.title === "Seed")).toBe(
      true,
    );
    expect(
      parsed.columns.some((c) => c.id === "col1" && c.title === "Todo"),
    ).toBe(true);
    expect(parsed.meta?.atdd).toBe(true);
  });

  test("[P0] Earnings nav link is present on /earnings page header", async ({
    page,
  }) => {
    await blockKnownThirdPartyHosts(page);
    await page.goto("/earnings");

    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: /earnings/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /board/i })).toBeVisible();
  });

  test("[P1] navigation links are accessible at 320px viewport width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await blockKnownThirdPartyHosts(page);
    await page.goto("/");

    const earningsLink = page.getByRole("link", { name: /earnings/i });
    await expect(earningsLink).toBeVisible();
    await expect(earningsLink).toBeEnabled();

    await earningsLink.click();
    await expect(page).toHaveURL(/\/earnings$/);
  });
});
