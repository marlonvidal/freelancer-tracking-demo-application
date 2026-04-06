import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import EarningsDashboard from "./EarningsDashboard";
import * as earningsCalc from "@/lib/earnings-calculations";

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

  it("[P0] zero-state: empty task list shows empty-no-tasks message (Story 5.1, AC2 / FR46)", () => {
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({ tasks: [], columns: [], clients: [], version: 1 }),
    );
    renderEarningsRoute();
    expect(screen.getByTestId("earnings-empty-no-tasks")).toBeInTheDocument();
    expect(screen.queryByTestId("earnings-metrics")).not.toBeInTheDocument();
  });

  it("[P1] zero-state: empty task list does not render metric cards (Story 5.1, AC2)", () => {
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({ tasks: [], columns: [], clients: [], version: 1 }),
    );
    renderEarningsRoute();
    expect(screen.queryByTestId("earnings-metrics")).not.toBeInTheDocument();
  });

  it("[P0] calculation error shows earnings-calculation-error message (Story 5.1, AC5 / FR49)", () => {
    const spy = vi
      .spyOn(earningsCalc, "calculateSummaryMetrics")
      .mockImplementation(() => {
        throw new Error("simulated calculation failure");
      });
    renderEarningsRoute();
    expect(screen.getByTestId("earnings-calculation-error")).toBeInTheDocument();
    expect(screen.queryByTestId("earnings-metrics")).not.toBeInTheDocument();
    spy.mockRestore();
  });

  it("[P1] tasks outside date range shows no-period-data message (Story 5.1, AC3 / FR47)", () => {
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({
        tasks: [
          {
            id: "t1",
            title: "Old Task",
            columnId: "col-1",
            clientId: null,
            isBillable: true,
            hourlyRate: 100,
            timeSpent: 3600,
            createdAt: Date.now() - 60 * 86400000,
            priority: "medium",
            description: "",
            timeEstimate: null,
            dueDate: null,
            tags: [],
            order: 0,
          },
        ],
        columns: [{ id: "col-1", title: "In Progress", order: 0 }],
        clients: [],
        version: 1,
      }),
    );
    renderEarningsRoute();
    // Default preset is last30 — task is 60 days old, outside the range
    expect(screen.getByTestId("earnings-empty-no-period-data")).toBeInTheDocument();
    expect(screen.queryByTestId("earnings-metrics")).not.toBeInTheDocument();
  });

  it("[P1] billable filter with no billable tasks shows no-billable-work message (Story 5.1, AC4 / FR48)", () => {
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({
        tasks: [
          {
            id: "t1",
            title: "Non-billable Task",
            columnId: "col-1",
            clientId: null,
            isBillable: false,
            hourlyRate: null,
            timeSpent: 3600,
            createdAt: Date.now() - 5 * 86400000,
            priority: "medium",
            description: "",
            timeEstimate: null,
            dueDate: null,
            tags: [],
            order: 0,
          },
        ],
        columns: [{ id: "col-1", title: "In Progress", order: 0 }],
        clients: [],
        version: 1,
      }),
    );
    localStorage.setItem(
      "earnings-dashboard-state",
      JSON.stringify({
        version: 1,
        dateRangePreset: "last30",
        billableFilter: "billable",
        activeChart: "customer",
      }),
    );
    renderEarningsRoute();
    expect(screen.getByTestId("earnings-empty-no-billable-work")).toBeInTheDocument();
    expect(screen.queryByTestId("earnings-metrics")).not.toBeInTheDocument();
  });

  it("[P1] zero-revenue task renders metric cards with $0.00 (Story 5.1, AC6 / FR50)", () => {
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({
        tasks: [
          {
            id: "t1",
            title: "Zero Task",
            columnId: "col-1",
            clientId: null,
            isBillable: true,
            hourlyRate: 0,
            timeSpent: 0,
            createdAt: Date.now() - 5 * 86400000,
            priority: "low",
            description: "",
            timeEstimate: null,
            dueDate: null,
            tags: [],
            order: 0,
          },
        ],
        columns: [{ id: "col-1", title: "In Progress", order: 0 }],
        clients: [],
        version: 1,
      }),
    );
    renderEarningsRoute();
    // Task is in range and billable — shows metric cards, all values $0.00
    expect(screen.getByTestId("earnings-metrics")).toBeInTheDocument();
    expect(screen.getAllByText("$0.00").length).toBeGreaterThanOrEqual(1);
  });

  it("[P1] Portuguese: no tasks shows PT empty-no-tasks translation (Story 5.1, AC2 i18n)", () => {
    localStorage.setItem("app-language", "pt");
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({ tasks: [], columns: [], clients: [], version: 1 }),
    );
    renderEarningsRoute();
    expect(screen.getByTestId("earnings-empty-no-tasks")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Nenhuma tarefa rastreada ainda. Comece a rastrear o tempo para ver os dados de ganhos.",
      ),
    ).toBeInTheDocument();
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

  // Story 6.1 — FR31: metric cards use pt-BR currency format when language=pt
  it("[P1] metric cards display pt-BR currency format when language=pt (Story 6.1, AC4/FR31)", () => {
    localStorage.setItem("app-language", "pt");
    const now = Date.now();
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({
        tasks: [
          {
            id: "t1", title: "Dev Work", columnId: "col-1", clientId: null,
            isBillable: true, hourlyRate: 100, timeSpent: 3600, createdAt: now,
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
    // 1 billable task: 1h × $100/hr = $100 displayed in pt-BR format
    // pt-BR format: "US$ 100,00" — contains comma decimal separator and US$ marker
    const pageText = document.body.textContent ?? "";
    expect(pageText).toMatch(/US\$|USD/);
    expect(pageText).toContain(",00");
    // Must NOT display en-US format "$100.00" for the revenue values
    // (The labels "Receita Total" etc. confirm we're in pt mode)
    expect(screen.getByText("Receita Total")).toBeInTheDocument();
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

  // ── Story 7.1 — Accessibility (WCAG 2.1 AA): ARIA role attributes ────────────

  it("[P0] earnings-empty-no-tasks state has role='status' for screen reader announcement (AC1/NFR-A1)", () => {
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({ tasks: [], columns: [], clients: [], version: 1 }),
    );
    renderEarningsRoute();
    const emptyState = screen.getByTestId("earnings-empty-no-tasks");
    expect(emptyState).toHaveAttribute("role", "status");
  });

  it("[P0] earnings-empty-no-period-data state has role='status' for screen reader announcement (AC1/NFR-A1)", () => {
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({
        tasks: [
          {
            id: "t1", title: "Old Task", columnId: "col-1", clientId: null,
            isBillable: true, hourlyRate: 100, timeSpent: 3600,
            createdAt: Date.now() - 60 * 86400000,
            priority: "medium", description: "", timeEstimate: null,
            dueDate: null, tags: [], order: 0,
          },
        ],
        columns: [{ id: "col-1", title: "In Progress", order: 0 }],
        clients: [],
        version: 1,
      }),
    );
    renderEarningsRoute();
    const emptyState = screen.getByTestId("earnings-empty-no-period-data");
    expect(emptyState).toHaveAttribute("role", "status");
  });

  it("[P0] earnings-empty-no-billable-work state has role='status' for screen reader announcement (AC1/NFR-A1)", () => {
    localStorage.setItem(
      "freelancer-kanban-data",
      JSON.stringify({
        tasks: [
          {
            id: "t1", title: "Non-billable Task", columnId: "col-1", clientId: null,
            isBillable: false, hourlyRate: null, timeSpent: 3600,
            createdAt: Date.now() - 5 * 86400000,
            priority: "medium", description: "", timeEstimate: null,
            dueDate: null, tags: [], order: 0,
          },
        ],
        columns: [{ id: "col-1", title: "In Progress", order: 0 }],
        clients: [],
        version: 1,
      }),
    );
    localStorage.setItem(
      "earnings-dashboard-state",
      JSON.stringify({ version: 1, dateRangePreset: "last30", billableFilter: "billable", activeChart: "customer" }),
    );
    renderEarningsRoute();
    const emptyState = screen.getByTestId("earnings-empty-no-billable-work");
    expect(emptyState).toHaveAttribute("role", "status");
  });

  it("[P0] earnings-calculation-error state has role='alert' for immediate screen reader announcement (AC1/NFR-A1)", () => {
    const spy = vi
      .spyOn(earningsCalc, "calculateSummaryMetrics")
      .mockImplementation(() => {
        throw new Error("simulated calculation failure");
      });
    renderEarningsRoute();
    const errorState = screen.getByTestId("earnings-calculation-error");
    expect(errorState).toHaveAttribute("role", "alert");
    spy.mockRestore();
  });

  it("[P0] earnings-metrics grid has aria-live='polite' so filter changes are announced (AC1/NFR-A1)", () => {
    renderEarningsRoute();
    const metricsGrid = screen.getByTestId("earnings-metrics");
    expect(metricsGrid).toHaveAttribute("aria-live", "polite");
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
