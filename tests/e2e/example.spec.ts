import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

test.describe("FreelanceFlow smoke", () => {
  test("loads main shell with document title", async ({ page, taskFactory }) => {
    const sample = taskFactory.build();

    await blockKnownThirdPartyHosts(page);

    await page.goto("/");

    await expect(page.getByRole("main")).toBeVisible();
    await expect(page).toHaveTitle(/FreelanceFlow/i);
    expect(sample.title.length).toBeGreaterThan(0);
  });
});
