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
});
