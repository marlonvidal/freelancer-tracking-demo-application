import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/context/LanguageContext";
import ProjectRevenueChart from "./ProjectRevenueChart";
import type { RevenueByProjectRow } from "@/lib/earnings-calculations";

function renderChart(data: RevenueByProjectRow[]) {
  return render(
    <LanguageProvider>
      <ProjectRevenueChart data={data} />
    </LanguageProvider>,
  );
}

const singleRow: RevenueByProjectRow = {
  columnId: "col-1",
  columnTitle: "Discovery",
  totalRevenue: 100,
  taskCount: 1,
};

const multipleRows: RevenueByProjectRow[] = [
  { columnId: "col-1", columnTitle: "Discovery", totalRevenue: 200, taskCount: 2 },
  { columnId: "col-2", columnTitle: "Development", totalRevenue: 100, taskCount: 1 },
  { columnId: "col-3", columnTitle: "Design", totalRevenue: 50, taskCount: 1 },
];

describe("ProjectRevenueChart", () => {
  beforeEach(() => {
    localStorage.removeItem("app-language");
  });

  // ── No-data state (data.length === 0) ─────────────────────────────────────────

  describe("no-data state", () => {
    it("[P0] renders the chart container with data-testid when data is empty", () => {
      renderChart([]);
      expect(screen.getByTestId("project-revenue-chart")).toBeInTheDocument();
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
        screen.queryByRole("heading", { name: "Revenue by Project" }),
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
      expect(screen.getByTestId("project-revenue-chart")).toBeInTheDocument();
    });

    it("[P1] renders the chart section heading in English when data is provided", () => {
      renderChart([singleRow]);
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Project" }),
      ).toBeInTheDocument();
    });

    it("[P1] does not render the no-data message when data is provided", () => {
      renderChart([singleRow]);
      expect(
        screen.queryByText("No data for this period"),
      ).not.toBeInTheDocument();
    });

    it("[P1] handles multiple projects without crashing", () => {
      renderChart(multipleRows);
      expect(screen.getByTestId("project-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Project" }),
      ).toBeInTheDocument();
    });

    it("[P2] renders translated chart title in Portuguese when data is provided", () => {
      localStorage.setItem("app-language", "pt");
      renderChart([singleRow]);
      expect(
        screen.getByRole("heading", { level: 2, name: "Receita por Projeto" }),
      ).toBeInTheDocument();
    });

    it("[P2] renders chart container for a single-project data set", () => {
      renderChart([{ columnId: "col-x", columnTitle: "Consulting", totalRevenue: 0, taskCount: 1 }]);
      expect(screen.getByTestId("project-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Project" }),
      ).toBeInTheDocument();
    });

    it("[P2] handles more than 10 projects (color palette cycles without crashing)", () => {
      const rows: RevenueByProjectRow[] = Array.from({ length: 12 }, (_, i) => ({
        columnId: `col-${i}`,
        columnTitle: `Project ${i}`,
        totalRevenue: (i + 1) * 50,
        taskCount: 1,
      }));
      renderChart(rows);
      expect(screen.getByTestId("project-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Project" }),
      ).toBeInTheDocument();
    });

    it("[P2] renders chart container when all projects have zero revenue (total=0 branch)", () => {
      const rows: RevenueByProjectRow[] = [
        { columnId: "col-1", columnTitle: "Discovery", totalRevenue: 0, taskCount: 0 },
        { columnId: "col-2", columnTitle: "Development", totalRevenue: 0, taskCount: 0 },
      ];
      renderChart(rows);
      expect(screen.getByTestId("project-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Project" }),
      ).toBeInTheDocument();
    });

    it("[P2] renders large dataset (100 projects) without crashing", () => {
      const rows: RevenueByProjectRow[] = Array.from({ length: 100 }, (_, i) => ({
        columnId: `col-${i}`,
        columnTitle: `Project ${i}`,
        totalRevenue: (i + 1) * 10,
        taskCount: i + 1,
      }));
      renderChart(rows);
      expect(screen.getByTestId("project-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Project" }),
      ).toBeInTheDocument();
    });
  });
});
