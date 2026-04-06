import { describe, expect, it } from "vitest";

/**
 * Story 4.4 — formatCurrency utility (ATDD).
 * Unit tests for the shared `formatCurrency` function to be exported from
 * `src/lib/utils.ts`. Currently the function is duplicated across four files;
 * Story 4.4 extracts it to a single shared location (AC2).
 *
 * TDD Phase: RED — All tests skipped (failing before implementation).
 * Remove it.skip() after adding `export function formatCurrency` to src/lib/utils.ts.
 *
 * AC covered:
 *   AC2 — A single shared formatCurrency exported from src/lib/utils.ts replaces
 *          the four duplicate local definitions in chart components and EarningsDashboard.tsx
 */

describe("Story 4.4 ATDD — formatCurrency utility (AC2)", () => {
  it(
    "[P1] formatCurrency formats a dollar amount with USD currency symbol and two decimal places",
    async () => {
      const { formatCurrency } = await import("./utils");

      // Standard positive amount
      expect(formatCurrency(100)).toBe("$100.00");
    },
  );

  it(
    "[P1] formatCurrency formats amounts greater than 999 with comma thousands separator",
    async () => {
      const { formatCurrency } = await import("./utils");

      expect(formatCurrency(1500)).toBe("$1,500.00");
      expect(formatCurrency(10000)).toBe("$10,000.00");
    },
  );

  it(
    "[P1] formatCurrency formats fractional amounts with two decimal places",
    async () => {
      const { formatCurrency } = await import("./utils");

      // hourlyRate * (timeSpent / 3600) can produce fractional cents
      expect(formatCurrency(99.5)).toBe("$99.50");
      expect(formatCurrency(0.1 + 0.2)).toBe("$0.30");
    },
  );

  it("[P1] formatCurrency formats zero as $0.00", async () => {
    const { formatCurrency } = await import("./utils");

    expect(formatCurrency(0)).toBe("$0.00");
  });
});

// Story 4.4 automation — edge case coverage for formatCurrency (AC2)
describe("Story 4.4 — formatCurrency edge cases", () => {
  it("[P2] formatCurrency formats negative amounts with leading minus sign", async () => {
    const { formatCurrency } = await import("./utils");

    // Negative revenue can appear in edge scenarios (e.g. refunds or data errors)
    expect(formatCurrency(-50)).toBe("-$50.00");
    expect(formatCurrency(-1500)).toBe("-$1,500.00");
  });

  it("[P2] formatCurrency formats million-dollar amounts with correct separators", async () => {
    const { formatCurrency } = await import("./utils");

    expect(formatCurrency(1000000)).toBe("$1,000,000.00");
    expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
  });

  it("[P2] formatCurrency rounds to two decimal places (standard rounding)", async () => {
    const { formatCurrency } = await import("./utils");

    // Values that require rounding down
    expect(formatCurrency(1.234)).toBe("$1.23");
    // Values that require rounding up
    expect(formatCurrency(1.999)).toBe("$2.00");
  });

  it("[P2] formatCurrency coexists with cn() — both exports remain accessible", async () => {
    const utils = await import("./utils");

    // AC2 consolidation must not remove or break the existing cn() export
    expect(typeof utils.cn).toBe("function");
    expect(typeof utils.formatCurrency).toBe("function");
    // Smoke test: cn still produces merged class strings
    expect(utils.cn("foo", "bar")).toBe("foo bar");
  });
});
