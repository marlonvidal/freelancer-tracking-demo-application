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

  // ── Story 7.1 — Accessibility (WCAG 2.1 AA) ──────────────────────────────────

  describe("Story 7.1 — sr-only data summary (AC1/AC4/FR34/NFR-A1/NFR-A5)", () => {
    it("[P0] h2 heading has id='project-chart-heading' for aria-labelledby", () => {
      renderChart([singleRow]);
      const heading = screen.getByRole("heading", { level: 2, name: "Revenue by Project" });
      expect(heading).toHaveAttribute("id", "project-chart-heading");
    });

    it("[P0] sr-only list is attached to the DOM when data is provided", () => {
      const { container } = renderChart([singleRow]);
      const srList = container.querySelector("ul.sr-only");
      expect(srList).toBeInTheDocument();
    });

    it("[P0] sr-only list has aria-labelledby pointing to chart heading (AC1/FR34)", () => {
      const { container } = renderChart([singleRow]);
      const srList = container.querySelector("ul.sr-only");
      expect(srList).toHaveAttribute("aria-labelledby", "project-chart-heading");
    });

    it("[P0] sr-only list renders one item per data row (AC1/AC4/NFR-A5)", () => {
      const { container } = renderChart(multipleRows);
      const items = container.querySelectorAll("ul.sr-only li");
      expect(items).toHaveLength(3);
    });

    it("[P1] sr-only list item contains project name, currency value, and percentage (AC1/AC4)", () => {
      const { container } = renderChart([singleRow]);
      const items = container.querySelectorAll("ul.sr-only li");
      expect(items[0].textContent).toContain("Discovery");
      expect(items[0].textContent).toContain("$100.00");
      expect(items[0].textContent).toContain("100.0%");
    });

    it("[P1] all projects appear in sr-only list for multi-row data (AC4/NFR-A5)", () => {
      const { container } = renderChart(multipleRows);
      const listText = container.querySelector("ul.sr-only")?.textContent ?? "";
      expect(listText).toContain("Discovery");
      expect(listText).toContain("Development");
      expect(listText).toContain("Design");
    });

    it("[P1] sr-only list percentages are correct for multi-row data (total=350)", () => {
      const { container } = renderChart(multipleRows);
      const items = container.querySelectorAll("ul.sr-only li");
      // Discovery: 200/350 = 57.1%, Development: 100/350 = 28.6%, Design: 50/350 = 14.3%
      expect(items[0].textContent).toContain("57.1%");
      expect(items[1].textContent).toContain("28.6%");
      expect(items[2].textContent).toContain("14.3%");
    });

    it("[P2] sr-only list percentage shows '0.0%' when total revenue is 0 (edge case)", () => {
      const { container } = renderChart([
        { columnId: "col-1", columnTitle: "Discovery", totalRevenue: 0, taskCount: 0 },
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

    it("[P0] sr-only list does NOT have redundant aria-label attribute — aria-labelledby takes precedence (AC6/Story 7.2)", () => {
      // Story 7.2 AC6: removed the dead aria-label from sr-only <ul> (aria-labelledby takes ARIA precedence)
      const { container } = renderChart([singleRow]);
      const srList = container.querySelector("ul.sr-only");
      expect(srList).toBeInTheDocument();
      // aria-labelledby must still be present (retained from Story 7.1)
      expect(srList).toHaveAttribute("aria-labelledby", "project-chart-heading");
      // aria-label must be absent (removed as dead code in Story 7.2)
      expect(srList).not.toHaveAttribute("aria-label");
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

    it("[P1] does not render chart-all-hidden-message for multiple visible projects", () => {
      renderChart(multipleRows);
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
