import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import EarningsDashboard from "./EarningsDashboard";

function renderEarningsRoute() {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={["/earnings"]}>
        <Routes>
          <Route path="/earnings" element={<EarningsDashboard />} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

describe("EarningsDashboard", () => {
  beforeEach(() => {
    localStorage.removeItem("app-language");
    localStorage.removeItem("earnings-dashboard-state");
    document.title = "";
  });

  it("renders without throwing", () => {
    renderEarningsRoute();
    expect(screen.getByTestId("earnings-dashboard")).toBeInTheDocument();
  });

  it("[P1] shows English heading from i18n", () => {
    renderEarningsRoute();
    expect(
      screen.getByRole("heading", { level: 1, name: "Earnings dashboard" }),
    ).toBeInTheDocument();
  });

  it("[P1] shows Portuguese copy when app-language is pt", () => {
    localStorage.setItem("app-language", "pt");
    renderEarningsRoute();
    expect(
      screen.getByRole("heading", { level: 1, name: "Painel de ganhos" }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Ganhos — FreelanceFlow");
  });

  it("[P0] sets document title from translations and restores previous title on unmount", () => {
    document.title = "Prior Page Title";
    const view = renderEarningsRoute();
    expect(document.title).toBe("Earnings — FreelanceFlow");
    view.unmount();
    expect(document.title).toBe("Prior Page Title");
  });

  it("[P1] renders Header with navigation links (Story 1.2)", () => {
    renderEarningsRoute();
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /earnings/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /board/i }),
    ).toBeInTheDocument();
  });

  it("[P1] shows persisted dashboard filters from localStorage (Story 1.3)", () => {
    localStorage.setItem(
      "earnings-dashboard-state",
      JSON.stringify({
        version: 1,
        dateRangePreset: "year",
        billableFilter: "billable",
        activeChart: "project",
      }),
    );
    renderEarningsRoute();
    // Date range now uses preset buttons via DateRangeFilter (Story 4.1)
    expect(screen.getByTestId("preset-year")).toBeInTheDocument();
    // Billable filter now uses BillableToggle buttons (Story 4.2)
    expect(screen.getByTestId("billable-toggle-billable")).toBeInTheDocument();
    expect(screen.getByTestId("billable-toggle-all")).toBeInTheDocument();
    expect(screen.getByTestId("billable-toggle-nonBillable")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /chart/i })).toHaveTextContent(
      /^project$/i,
    );
  });

  // ── Story 2.2: Summary Metrics Cards ────────────────────────────────────────

  it("[P0] renders the earnings-metrics grid container (Story 2.2)", () => {
    renderEarningsRoute();
    expect(screen.getByTestId("earnings-metrics")).toBeInTheDocument();
  });

  it("[P0] all five metric card labels are visible in English (Story 2.2, AC1)", () => {
    renderEarningsRoute();
    expect(screen.getByText("Total Revenue", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("Billable Revenue", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("Non-Billable Revenue", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("Average Hourly Rate", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("Task Count", { exact: true })).toBeInTheDocument();
  });

  it("[P1] all five metric card labels render in Portuguese when app-language is pt (Story 2.2, AC1 + i18n)", () => {
    localStorage.setItem("app-language", "pt");
    renderEarningsRoute();
    expect(screen.getByText("Receita Total")).toBeInTheDocument();
    expect(screen.getByText("Receita Faturável")).toBeInTheDocument();
    expect(screen.getByText("Receita Não Faturável")).toBeInTheDocument();
    expect(screen.getByText("Taxa Horária Média")).toBeInTheDocument();
    expect(screen.getByText("Total de Tarefas")).toBeInTheDocument();
  });

  it("[P0] zero-state: empty task list renders all revenue cards as $0.00 (Story 2.2, AC4)", () => {
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({ tasks: [], columns: [], clients: [], version: 1 }),
    );
    renderEarningsRoute();
    const zeroValues = screen.getAllByText("$0.00");
    // Total Revenue, Billable Revenue, Non-Billable Revenue, Average Hourly Rate
    expect(zeroValues.length).toBeGreaterThanOrEqual(4);
  });

  it("[P1] zero-state: task count card shows '0 total / 0 billable' (Story 2.2, AC4)", () => {
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({ tasks: [], columns: [], clients: [], version: 1 }),
    );
    renderEarningsRoute();
    expect(screen.getByText(/0 total \/ 0 billable/)).toBeInTheDocument();
  });

  it("[P1] task count card reflects seeded task data (Story 2.2, AC1, FR25)", () => {
    const now = Date.now();
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({
        tasks: [
          {
            id: "t1", title: "Billable Task", columnId: "col-1", clientId: null,
            isBillable: true, hourlyRate: 100, timeSpent: 3600, createdAt: now,
            priority: "medium", description: "", timeEstimate: null,
            dueDate: null, tags: [], order: 0,
          },
          {
            id: "t2", title: "Non-Billable Task", columnId: "col-1", clientId: null,
            isBillable: false, hourlyRate: null, timeSpent: 1800, createdAt: now,
            priority: "low", description: "", timeEstimate: null,
            dueDate: null, tags: [], order: 1,
          },
        ],
        columns: [{ id: "col-1", title: "Todo", order: 0 }],
        clients: [],
        version: 1,
      }),
    );
    renderEarningsRoute();
    // 2 total, 1 billable
    expect(screen.getByText(/2 total \/ 1 billable/)).toBeInTheDocument();
  });

  it("[P1] billable revenue card shows correct value for seeded billable task (Story 2.2, AC1, FR22)", () => {
    const now = Date.now();
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({
        tasks: [
          {
            id: "t1", title: "Dev Work", columnId: "col-1", clientId: null,
            isBillable: true, hourlyRate: 80, timeSpent: 3600, createdAt: now,
            priority: "high", description: "", timeEstimate: null,
            dueDate: null, tags: [], order: 0,
          },
        ],
        columns: [{ id: "col-1", title: "Todo", order: 0 }],
        clients: [],
        version: 1,
      }),
    );
    renderEarningsRoute();
    // 1 billable task: 1h × $80/hr = $80.00
    expect(screen.getAllByText("$80.00").length).toBeGreaterThanOrEqual(1);
  });

  // ── Story 3.1: Customer Revenue Chart ────────────────────────────────────────

  it("[P0] renders customer-revenue-chart container in default activeChart=customer state (Story 3.1, AC1)", () => {
    renderEarningsRoute();
    expect(screen.getByTestId("customer-revenue-chart")).toBeInTheDocument();
  });

  it("[P1] does not render customer-revenue-chart when activeChart is 'project' (Story 3.1, AC7)", () => {
    localStorage.setItem(
      "earnings-dashboard-state",
      JSON.stringify({
        version: 1,
        dateRangePreset: "all",
        billableFilter: "all",
        activeChart: "project",
      }),
    );
    renderEarningsRoute();
    expect(screen.queryByTestId("customer-revenue-chart")).not.toBeInTheDocument();
  });

  it("[P1] does not render customer-revenue-chart when activeChart is 'tag' (Story 3.1, AC7)", () => {
    localStorage.setItem(
      "earnings-dashboard-state",
      JSON.stringify({
        version: 1,
        dateRangePreset: "all",
        billableFilter: "all",
        activeChart: "tag",
      }),
    );
    renderEarningsRoute();
    expect(screen.queryByTestId("customer-revenue-chart")).not.toBeInTheDocument();
  });

  it("[P1] customer chart shows no-data message when tasks are empty (Story 3.1, AC6)", () => {
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({ tasks: [], columns: [], clients: [], version: 1 }),
    );
    renderEarningsRoute();
    expect(
      screen.getByText("No data for this period", { exact: true }),
    ).toBeInTheDocument();
  });

  it("[P1] renders chart section heading with seeded billable task (Story 3.1, AC1)", () => {
    const now = Date.now();
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({
        tasks: [
          {
            id: "t1", title: "Dev Task", columnId: "col-1", clientId: "c1",
            isBillable: true, hourlyRate: 100, timeSpent: 3600, createdAt: now,
            priority: "medium", description: "", timeEstimate: null,
            dueDate: null, tags: [], order: 0,
          },
        ],
        columns: [{ id: "col-1", title: "Todo", order: 0 }],
        clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
        version: 1,
      }),
    );
    renderEarningsRoute();
    expect(
      screen.getByRole("heading", { level: 2, name: "Revenue by Customer" }),
    ).toBeInTheDocument();
  });

  // ── Story 3.2: Project Revenue Chart ─────────────────────────────────────────

  it("[P0] renders project-revenue-chart container when activeChart is 'project' (Story 3.2, AC1)", () => {
    localStorage.setItem(
      "earnings-dashboard-state",
      JSON.stringify({
        version: 1,
        dateRangePreset: "all",
        billableFilter: "all",
        activeChart: "project",
      }),
    );
    renderEarningsRoute();
    expect(screen.getByTestId("project-revenue-chart")).toBeInTheDocument();
  });

  it("[P1] does not render project-revenue-chart when activeChart is 'customer' (default) (Story 3.2, AC2)", () => {
    renderEarningsRoute();
    expect(screen.queryByTestId("project-revenue-chart")).not.toBeInTheDocument();
  });

  it("[P1] does not render project-revenue-chart when activeChart is 'tag' (Story 3.2, AC2)", () => {
    localStorage.setItem(
      "earnings-dashboard-state",
      JSON.stringify({
        version: 1,
        dateRangePreset: "all",
        billableFilter: "all",
        activeChart: "tag",
      }),
    );
    renderEarningsRoute();
    expect(screen.queryByTestId("project-revenue-chart")).not.toBeInTheDocument();
  });

  it("[P1] project chart shows no-data message when tasks are empty and activeChart is 'project' (Story 3.2, AC6)", () => {
    localStorage.setItem(
      "earnings-dashboard-state",
      JSON.stringify({
        version: 1,
        dateRangePreset: "all",
        billableFilter: "all",
        activeChart: "project",
      }),
    );
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({ tasks: [], columns: [], clients: [], version: 1 }),
    );
    renderEarningsRoute();
    expect(
      screen.getByText("No data for this period", { exact: true }),
    ).toBeInTheDocument();
  });

  it("[P1] renders project chart heading 'Revenue by Project' with seeded task and activeChart is 'project' (Story 3.2, AC1)", () => {
    const now = Date.now();
    localStorage.setItem(
      "earnings-dashboard-state",
      JSON.stringify({
        version: 1,
        dateRangePreset: "all",
        billableFilter: "all",
        activeChart: "project",
      }),
    );
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({
        tasks: [
          {
            id: "t1", title: "Dev Task", columnId: "col-1", clientId: "c1",
            isBillable: true, hourlyRate: 100, timeSpent: 3600, createdAt: now,
            priority: "medium", description: "", timeEstimate: null,
            dueDate: null, tags: [], order: 0,
          },
        ],
        columns: [{ id: "col-1", title: "Discovery", order: 0 }],
        clients: [{ id: "c1", name: "Acme Corp", hourlyRate: 100, color: "#6366f1" }],
        version: 1,
      }),
    );
    renderEarningsRoute();
    expect(
      screen.getByRole("heading", { level: 2, name: "Revenue by Project" }),
    ).toBeInTheDocument();
  });
});
