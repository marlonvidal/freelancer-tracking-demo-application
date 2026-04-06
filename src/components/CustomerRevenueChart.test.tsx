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
});
