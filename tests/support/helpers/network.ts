import type { Page } from "@playwright/test";

/**
 * Example: stub external analytics or optional APIs before navigation.
 * Prefer routing before `page.goto()` so the handler applies to the document request.
 */
export async function blockKnownThirdPartyHosts(page: Page): Promise<void> {
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.includes("googletagmanager.com") || url.includes("google-analytics.com")) {
      return route.abort();
    }
    return route.continue();
  });
}
