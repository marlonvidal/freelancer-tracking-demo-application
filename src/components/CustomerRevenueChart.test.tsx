import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/context/LanguageContext";
import CustomerRevenueChart from "./CustomerRevenueChart";
import type { RevenueByCustomerRow } from "@/lib/earnings-calculations";

function renderChart(data: RevenueByCustomerRow[]) {
  return render(
    <LanguageProvider>
      <CustomerRevenueChart data={data} />
    </LanguageProvider>,
  );
}

const singleRow: RevenueByCustomerRow = {
  customerId: "c1",
  customerName: "Acme Corp",
  totalRevenue: 100,
  taskCount: 1,
};

const multipleRows: RevenueByCustomerRow[] = [
  { customerId: "c1", customerName: "Acme Corp", totalRevenue: 200, taskCount: 2 },
  { customerId: "c2", customerName: "Beta Inc", totalRevenue: 100, taskCount: 1 },
  { customerId: null, customerName: "Unassigned", totalRevenue: 50, taskCount: 1 },
];

describe("CustomerRevenueChart", () => {
  beforeEach(() => {
    localStorage.removeItem("app-language");
  });

  // ── No-data state (data.length === 0) ────────────────────────────────────────

  describe("no-data state", () => {
    it("[P0] renders the chart container with data-testid when data is empty", () => {
      renderChart([]);
      expect(screen.getByTestId("customer-revenue-chart")).toBeInTheDocument();
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
        screen.queryByRole("heading", { name: "Revenue by Customer" }),
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
      expect(screen.getByTestId("customer-revenue-chart")).toBeInTheDocument();
    });

    it("[P1] renders the chart section heading in English when data is provided", () => {
      renderChart([singleRow]);
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Customer" }),
      ).toBeInTheDocument();
    });

    it("[P1] does not render the no-data message when data is provided", () => {
      renderChart([singleRow]);
      expect(
        screen.queryByText("No data for this period"),
      ).not.toBeInTheDocument();
    });

    it("[P1] handles multiple customers including unassigned (null customerId)", () => {
      renderChart(multipleRows);
      expect(screen.getByTestId("customer-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Customer" }),
      ).toBeInTheDocument();
    });

    it("[P2] renders translated chart title in Portuguese when data is provided", () => {
      localStorage.setItem("app-language", "pt");
      renderChart([singleRow]);
      expect(
        screen.getByRole("heading", { level: 2, name: "Receita por Cliente" }),
      ).toBeInTheDocument();
    });

    it("[P2] renders chart container for a single-customer data set", () => {
      renderChart([{ customerId: null, customerName: "Unassigned", totalRevenue: 75, taskCount: 1 }]);
      expect(screen.getByTestId("customer-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Customer" }),
      ).toBeInTheDocument();
    });

    it("[P2] handles more than 10 customers (color palette cycles without crashing)", () => {
      const rows: RevenueByCustomerRow[] = Array.from({ length: 12 }, (_, i) => ({
        customerId: `c${i}`,
        customerName: `Client ${i}`,
        totalRevenue: (i + 1) * 50,
        taskCount: 1,
      }));
      renderChart(rows);
      expect(screen.getByTestId("customer-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Customer" }),
      ).toBeInTheDocument();
    });

    it("[P2] renders chart container when all customers have zero revenue (total=0 branch)", () => {
      const rows: RevenueByCustomerRow[] = [
        { customerId: "c1", customerName: "Acme Corp", totalRevenue: 0, taskCount: 0 },
        { customerId: "c2", customerName: "Beta Inc", totalRevenue: 0, taskCount: 0 },
      ];
      renderChart(rows);
      expect(screen.getByTestId("customer-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Customer" }),
      ).toBeInTheDocument();
    });

    it("[P2] renders large dataset (100 customers) without crashing", () => {
      const rows: RevenueByCustomerRow[] = Array.from({ length: 100 }, (_, i) => ({
        customerId: `c${i}`,
        customerName: `Client ${i}`,
        totalRevenue: (i + 1) * 10,
        taskCount: i + 1,
      }));
      renderChart(rows);
      expect(screen.getByTestId("customer-revenue-chart")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Revenue by Customer" }),
      ).toBeInTheDocument();
    });
  });

  // ── Story 7.1 — Accessibility (WCAG 2.1 AA) ──────────────────────────────────

  describe("Story 7.1 — sr-only data summary (AC1/AC4/FR34/NFR-A1/NFR-A5)", () => {
    it("[P0] h2 heading has id='customer-chart-heading' for aria-labelledby", () => {
      renderChart([singleRow]);
      const heading = screen.getByRole("heading", { level: 2, name: "Revenue by Customer" });
      expect(heading).toHaveAttribute("id", "customer-chart-heading");
    });

    it("[P0] sr-only list is attached to the DOM when data is provided", () => {
      const { container } = renderChart([singleRow]);
      const srList = container.querySelector("ul.sr-only");
      expect(srList).toBeInTheDocument();
    });

    it("[P0] sr-only list has aria-labelledby pointing to chart heading (AC1/FR34)", () => {
      const { container } = renderChart([singleRow]);
      const srList = container.querySelector("ul.sr-only");
      expect(srList).toHaveAttribute("aria-labelledby", "customer-chart-heading");
    });

    it("[P0] sr-only list renders one item per data row (AC1/AC4/NFR-A5)", () => {
      const { container } = renderChart(multipleRows);
      const items = container.querySelectorAll("ul.sr-only li");
      expect(items).toHaveLength(3);
    });

    it("[P1] sr-only list item contains customer name, currency value, and percentage (AC1/AC4)", () => {
      const { container } = renderChart([singleRow]);
      const items = container.querySelectorAll("ul.sr-only li");
      expect(items[0].textContent).toContain("Acme Corp");
      expect(items[0].textContent).toContain("$100.00");
      expect(items[0].textContent).toContain("100.0%");
    });

    it("[P1] all customers appear in sr-only list for multi-row data (AC4/NFR-A5)", () => {
      const { container } = renderChart(multipleRows);
      const listText = container.querySelector("ul.sr-only")?.textContent ?? "";
      expect(listText).toContain("Acme Corp");
      expect(listText).toContain("Beta Inc");
      expect(listText).toContain("Unassigned");
    });

    it("[P1] sr-only list percentages are correct for multi-row data (total=350)", () => {
      const { container } = renderChart(multipleRows);
      const items = container.querySelectorAll("ul.sr-only li");
      // Acme: 200/350 = 57.1%, Beta: 100/350 = 28.6%, Unassigned: 50/350 = 14.3%
      expect(items[0].textContent).toContain("57.1%");
      expect(items[1].textContent).toContain("28.6%");
      expect(items[2].textContent).toContain("14.3%");
    });

    it("[P2] sr-only list percentage shows '0.0%' when total revenue is 0 (edge case)", () => {
      const { container } = renderChart([
        { customerId: "c1", customerName: "Acme Corp", totalRevenue: 0, taskCount: 0 },
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
      // pt-BR: "US$ 100,00" or "R$ 100,00" — contains comma decimal
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

    it("[P1] does not render chart-all-hidden-message for multiple visible customers", () => {
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
