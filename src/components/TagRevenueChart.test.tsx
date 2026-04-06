import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/context/LanguageContext";
import TagRevenueChart from "./TagRevenueChart";
import type { RevenueByTagRow } from "@/lib/earnings-calculations";

function renderChart(data: RevenueByTagRow[]) {
  return render(
    <LanguageProvider>
      <TagRevenueChart data={data} />
    </LanguageProvider>,
  );
}

const singleRow: RevenueByTagRow = {
  tag: "design",
  totalRevenue: 100,
  taskCount: 1,
};

const multipleRows: RevenueByTagRow[] = [
  { tag: "design", totalRevenue: 200, taskCount: 2 },
  { tag: "development", totalRevenue: 160, taskCount: 2 },
  { tag: "consulting", totalRevenue: 50, taskCount: 1 },
];

const untaggedRow: RevenueByTagRow = {
  tag: "Untagged",
  totalRevenue: 75,
  taskCount: 1,
};

describe("TagRevenueChart", () => {
  beforeEach(() => {
    localStorage.removeItem("app-language");
  });

  // ── No-data state (data.length === 0) ─────────────────────────────────────────

  describe("no-data state", () => {
    it("[P0] renders the chart container with data-testid when data is empty", () => {
      renderChart([]);
      expect(screen.getByTestId("tag-revenue-chart")).toBeInTheDocument();
    });

    it("[P0] renders the no-data message in English when data is empty", () => {
      renderChart([]);
      expect(
        screen.getByText("No data for this period", { exact: true }),
      ).toBeInTheDocument();
    });

    it("[P0] does not render the chart heading in no-data state", () => {
      renderChart([]);
      expect(
        screen.queryByRole("heading", { name: "Revenue by Tag" }),
      ).not.toBeInTheDocument();
    });

    it("[P2] renders translated no-data message in Portuguese", () => {
      localStorage.setItem("app-language", "pt");
      renderChart([]);
      expect(
        screen.getByText("Sem dados para este período", { exact: true }),
      ).toBeInTheDocument();
    });
  });

  // ── With-data state (data.length > 0) ────────────────────────────────────────

  describe("with-data state", () => {
    it("[P0] renders the chart container with data-testid when data is provided", () => {
      renderChart([singleRow]);
      expect(screen.getByTestId("tag-revenue-chart")).toBeInTheDocument();
    });

    it("[P1] renders the chart section heading in English when data is provided", () => {
      renderChart([singleRow]);
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Tag" }),
      ).toBeInTheDocument();
    });

    it("[P1] does not render the no-data message when data is provided", () => {
      renderChart([singleRow]);
      expect(
        screen.queryByText("No data for this period"),
      ).not.toBeInTheDocument();
    });

    it("[P1] handles multiple tags without crashing", () => {
      renderChart(multipleRows);
      expect(screen.getByTestId("tag-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Tag" }),
      ).toBeInTheDocument();
    });

    it('[P1] renders "Untagged" sentinel as a valid tag entry (AC3 — tasks with no tags)', () => {
      renderChart([untaggedRow]);
      expect(screen.getByTestId("tag-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Tag" }),
      ).toBeInTheDocument();
    });

    it('[P1] renders "Untagged" alongside named tags without crashing', () => {
      renderChart([...multipleRows, untaggedRow]);
      expect(screen.getByTestId("tag-revenue-chart")).toBeInTheDocument();
    });

    it("[P2] renders translated chart title in Portuguese when data is provided", () => {
      localStorage.setItem("app-language", "pt");
      renderChart([singleRow]);
      expect(
        screen.getByRole("heading", { level: 2, name: "Receita por Tag" }),
      ).toBeInTheDocument();
    });

    it("[P2] renders chart container for a single-tag data set", () => {
      renderChart([{ tag: "consulting", totalRevenue: 0, taskCount: 1 }]);
      expect(screen.getByTestId("tag-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Tag" }),
      ).toBeInTheDocument();
    });

    it("[P2] handles more than 10 tags (color palette cycles without crashing)", () => {
      const rows: RevenueByTagRow[] = Array.from({ length: 12 }, (_, i) => ({
        tag: `tag-${i}`,
        totalRevenue: (i + 1) * 50,
        taskCount: 1,
      }));
      renderChart(rows);
      expect(screen.getByTestId("tag-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Tag" }),
      ).toBeInTheDocument();
    });

    it("[P2] renders chart container when all tags have zero revenue (total=0 branch)", () => {
      const rows: RevenueByTagRow[] = [
        { tag: "design", totalRevenue: 0, taskCount: 0 },
        { tag: "development", totalRevenue: 0, taskCount: 0 },
      ];
      renderChart(rows);
      expect(screen.getByTestId("tag-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Tag" }),
      ).toBeInTheDocument();
    });

    it("[P2] renders large dataset (100 tags) without crashing", () => {
      const rows: RevenueByTagRow[] = Array.from({ length: 100 }, (_, i) => ({
        tag: `tag-${i}`,
        totalRevenue: (i + 1) * 10,
        taskCount: i + 1,
      }));
      renderChart(rows);
      expect(screen.getByTestId("tag-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Tag" }),
      ).toBeInTheDocument();
    });
  });

  // ── Story 7.1 — Accessibility (WCAG 2.1 AA) ──────────────────────────────────

  describe("Story 7.1 — sr-only data summary (AC1/AC4/FR34/NFR-A1/NFR-A5)", () => {
    it("[P0] h2 heading has id='tag-chart-heading' for aria-labelledby", () => {
      renderChart([singleRow]);
      const heading = screen.getByRole("heading", { level: 2, name: "Revenue by Tag" });
      expect(heading).toHaveAttribute("id", "tag-chart-heading");
    });

    it("[P0] sr-only list is attached to the DOM when data is provided", () => {
      const { container } = renderChart([singleRow]);
      const srList = container.querySelector("ul.sr-only");
      expect(srList).toBeInTheDocument();
    });

    it("[P0] sr-only list has aria-labelledby pointing to chart heading (AC1/FR34)", () => {
      const { container } = renderChart([singleRow]);
      const srList = container.querySelector("ul.sr-only");
      expect(srList).toHaveAttribute("aria-labelledby", "tag-chart-heading");
    });

    it("[P0] sr-only list renders one item per data row (AC1/AC4/NFR-A5)", () => {
      const { container } = renderChart(multipleRows);
      const items = container.querySelectorAll("ul.sr-only li");
      expect(items).toHaveLength(3);
    });

    it("[P1] sr-only list item contains tag name, currency value, and percentage (AC1/AC4)", () => {
      const { container } = renderChart([singleRow]);
      const items = container.querySelectorAll("ul.sr-only li");
      expect(items[0].textContent).toContain("design");
      expect(items[0].textContent).toContain("$100.00");
      expect(items[0].textContent).toContain("100.0%");
    });

    it("[P1] all tags appear in sr-only list for multi-row data (AC4/NFR-A5)", () => {
      const { container } = renderChart(multipleRows);
      const listText = container.querySelector("ul.sr-only")?.textContent ?? "";
      expect(listText).toContain("design");
      expect(listText).toContain("development");
      expect(listText).toContain("consulting");
    });

    it("[P1] sr-only list percentages are correct for multi-row data (total=410)", () => {
      const { container } = renderChart(multipleRows);
      const items = container.querySelectorAll("ul.sr-only li");
      // design: 200/410 = 48.8%, development: 160/410 = 39.0%, consulting: 50/410 = 12.2%
      expect(items[0].textContent).toContain("48.8%");
      expect(items[1].textContent).toContain("39.0%");
      expect(items[2].textContent).toContain("12.2%");
    });

    it('[P1] "Untagged" sentinel appears in sr-only list (AC4 — tasks with no tags)', () => {
      const { container } = renderChart([untaggedRow]);
      const listText = container.querySelector("ul.sr-only")?.textContent ?? "";
      expect(listText).toContain("Untagged");
    });

    it("[P2] sr-only list percentage shows '0.0%' when total revenue is 0 (edge case)", () => {
      const { container } = renderChart([
        { tag: "design", totalRevenue: 0, taskCount: 0 },
      ]);
      const items = container.querySelectorAll("ul.sr-only li");
      expect(items[0].textContent).toContain("0.0%");
    });

    it("[P0] sr-only list is NOT present in the no-data empty state (data.length === 0)", () => {
      const { container } = renderChart([]);
      const srList = container.querySelector("ul.sr-only");
      expect(srList).not.toBeInTheDocument();
    });

    it("[P1] visual chart wrapper has aria-hidden='true' (AC4/NFR-A5 — redundant for screen readers)", () => {
      const { container } = renderChart([singleRow]);
      const ariaHiddenDiv = container.querySelector("[aria-hidden='true']");
      expect(ariaHiddenDiv).toBeInTheDocument();
    });

    it("[P2] sr-only list items use pt-BR currency format when language=pt (AC1/i18n)", () => {
      localStorage.setItem("app-language", "pt");
      const { container } = renderChart([singleRow]);
      const items = container.querySelectorAll("ul.sr-only li");
      expect(items[0].textContent).toMatch(/,\d{2}/);
    });
  });

  // ── Story 4.4 — all-hidden guard (AC3) ───────────────────────────────────────
  // Verifies the new visibleData.length === 0 guard does not falsely trigger.
  // The interaction that produces the hidden state (clicking legend items) is
  // covered at E2E level by story-4-4-...-atdd.spec.ts (requires real browser
  // for recharts SVG legend clicks). These unit tests guard the boundary condition.

  describe("Story 4.4 — all-hidden guard (AC3)", () => {
    it("[P1] does not render chart-all-hidden-message when data items are all visible", () => {
      renderChart([singleRow]);
      expect(
        screen.queryByTestId("chart-all-hidden-message"),
      ).not.toBeInTheDocument();
    });

    it("[P1] does not render chart-all-hidden-message in the no-data empty state", () => {
      // data.length === 0 triggers the 'earningsChartNoData' empty state, NOT the
      // all-hidden message. The two empty states must remain distinct (AC3 dev notes).
      renderChart([]);
      expect(
        screen.queryByTestId("chart-all-hidden-message"),
      ).not.toBeInTheDocument();
    });

    it("[P1] does not render chart-all-hidden-message for multiple visible tags", () => {
      renderChart(multipleRows);
      expect(
        screen.queryByTestId("chart-all-hidden-message"),
      ).not.toBeInTheDocument();
    });

    it('[P1] does not render chart-all-hidden-message for "Untagged" sentinel entry', () => {
      renderChart([untaggedRow]);
      expect(
        screen.queryByTestId("chart-all-hidden-message"),
      ).not.toBeInTheDocument();
    });

    it("[P2] does not render chart-all-hidden-message in Portuguese locale with data", () => {
      localStorage.setItem("app-language", "pt");
      renderChart([singleRow]);
      expect(
        screen.queryByTestId("chart-all-hidden-message"),
      ).not.toBeInTheDocument();
    });
  });
});
