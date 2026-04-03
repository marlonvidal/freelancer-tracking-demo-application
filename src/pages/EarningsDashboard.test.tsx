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
    document.title = "";
  });

  it("renders without throwing", () => {
    renderEarningsRoute();
    expect(screen.getByTestId("earnings-dashboard")).toBeInTheDocument();
  });

  it("[P1] shows English heading and placeholder from i18n", () => {
    renderEarningsRoute();
    expect(
      screen.getByRole("heading", { level: 1, name: "Earnings dashboard" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Charts and metrics will appear here in a later release.",
      ),
    ).toBeInTheDocument();
  });

  it("[P1] shows Portuguese copy when app-language is pt", () => {
    localStorage.setItem("app-language", "pt");
    renderEarningsRoute();
    expect(
      screen.getByRole("heading", { level: 1, name: "Painel de ganhos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Gráficos e métricas aparecerão aqui em uma versão futura.",
      ),
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
});
