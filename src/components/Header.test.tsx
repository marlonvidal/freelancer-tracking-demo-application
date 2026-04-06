import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { AppProvider } from "@/context/AppContext";
import Header from "./Header";

function renderHeader({
  onAddTask,
  route = "/",
}: {
  onAddTask?: () => void;
  route?: string;
} = {}) {
  return render(
    <LanguageProvider>
      <AppProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/" element={<Header onAddTask={onAddTask} />} />
            <Route
              path="/earnings"
              element={<Header onAddTask={onAddTask} />}
            />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    </LanguageProvider>,
  );
}

describe("Header — Story 1.2 navigation", () => {
  beforeEach(() => {
    localStorage.removeItem("app-language");
  });

  it("[P0] renders Board and Earnings nav links", () => {
    renderHeader();
    const nav = screen.getByRole("navigation");
    expect(within(nav).getByRole("link", { name: /board/i })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /earnings/i })).toBeInTheDocument();
  });

  it("[P0] nav links display English translations by default", () => {
    renderHeader();
    const nav = screen.getByRole("navigation");
    expect(within(nav).getByText("Board")).toBeInTheDocument();
    expect(within(nav).getByText("Earnings")).toBeInTheDocument();
  });

  it("[P1] nav links display Portuguese translations when language is pt", () => {
    localStorage.setItem("app-language", "pt");
    renderHeader();
    const nav = screen.getByRole("navigation");
    expect(within(nav).getByText("Quadro")).toBeInTheDocument();
    expect(within(nav).getByText("Ganhos")).toBeInTheDocument();
  });

  it("[P1] Board link has active class when on /", () => {
    renderHeader({ route: "/" });
    const boardLink = screen.getByRole("link", { name: /board/i });
    expect(boardLink.className).toMatch(/font-bold/);
    expect(boardLink.className).toMatch(/border-primary/);
  });

  it("[P1] Earnings link has active class when on /earnings", () => {
    renderHeader({ route: "/earnings" });
    const earningsLink = screen.getByRole("link", { name: /earnings/i });
    expect(earningsLink.className).toMatch(/font-bold/);
    expect(earningsLink.className).toMatch(/border-primary/);
  });

  it("[P1] Board link does NOT have active class when on /earnings", () => {
    renderHeader({ route: "/earnings" });
    const boardLink = screen.getByRole("link", { name: /board/i });
    expect(boardLink.className).not.toMatch(/font-bold/);
  });

  it("[P1] nav element has aria-label for accessibility", () => {
    renderHeader();
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Main");
  });

  it("[P0] hides Add Task button, revenue, and billable hours when onAddTask is not provided", () => {
    renderHeader();
    expect(screen.queryByRole("button", { name: /add task/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/total revenue/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/billable hours/i)).not.toBeInTheDocument();
  });

  it("[P1] shows Add Task button when onAddTask is provided", () => {
    const onAddTask = vi.fn();
    renderHeader({ onAddTask });
    expect(screen.getByRole("button", { name: /add task/i })).toBeInTheDocument();
  });

  it("[P1] shows revenue and billable hours when onAddTask is provided", () => {
    const onAddTask = vi.fn();
    renderHeader({ onAddTask });
    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Billable Hours/i)).toBeInTheDocument();
  });

  it("[P1] calls onAddTask when Add Task button is clicked", () => {
    const onAddTask = vi.fn();
    renderHeader({ onAddTask });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    expect(onAddTask).toHaveBeenCalledOnce();
  });

  // ── Story 7.1 — Accessibility (WCAG 2.1 AA) ──────────────────────────────────

  it("[P0] Globe button aria-label is locale-aware 'Language' in English (AC1/NFR-A1)", () => {
    renderHeader();
    const globeBtn = screen.getByRole("button", { name: "Language" });
    expect(globeBtn).toBeInTheDocument();
  });

  it("[P0] Globe button aria-label changes to 'Idioma' when language is Portuguese (AC1/NFR-A1)", () => {
    localStorage.setItem("app-language", "pt");
    renderHeader();
    const globeBtn = screen.getByRole("button", { name: "Idioma" });
    expect(globeBtn).toBeInTheDocument();
  });

  it("[P1] Globe button aria-label is NOT the old hardcoded 'Globe' value (Story 7.1 fix)", () => {
    renderHeader();
    expect(screen.queryByRole("button", { name: "Globe" })).not.toBeInTheDocument();
  });

  it("[P0] Board link points to /", () => {
    renderHeader();
    const boardLink = screen.getByRole("link", { name: /board/i });
    expect(boardLink).toHaveAttribute("href", "/");
  });

  it("[P0] Earnings link points to /earnings", () => {
    renderHeader();
    const earningsLink = screen.getByRole("link", { name: /earnings/i });
    expect(earningsLink).toHaveAttribute("href", "/earnings");
  });

  // ── Story 7.2 — Dark mode button locale-aware aria-label (AC1/WCAG-4.1.2) ────

  it("[P0] dark mode button has aria-label='Dark mode' in English light mode state (AC1/WCAG-4.1.2/Story 7.2)", () => {
    renderHeader();
    // Default state: isDarkMode=false → button label is the action to enter dark mode
    const darkModeBtn = screen.getByRole("button", { name: "Dark mode" });
    expect(darkModeBtn).toBeInTheDocument();
  });

  it("[P0] dark mode button has aria-label='Modo escuro' in Portuguese light mode state (AC1/WCAG-4.1.2/Story 7.2)", () => {
    localStorage.setItem("app-language", "pt");
    renderHeader();
    const darkModeBtn = screen.getByRole("button", { name: "Modo escuro" });
    expect(darkModeBtn).toBeInTheDocument();
  });

  it("[P1] dark mode button aria-label changes to 'Light mode' after toggling to dark mode (AC1/Story 7.2)", () => {
    renderHeader();
    // Initially in light mode — button announces action to switch to dark mode
    const darkModeBtn = screen.getByRole("button", { name: "Dark mode" });
    expect(darkModeBtn).toBeInTheDocument();

    // Click to toggle into dark mode
    fireEvent.click(darkModeBtn);

    // Now in dark mode — button announces action to switch back to light mode
    const lightModeBtn = screen.getByRole("button", { name: "Light mode" });
    expect(lightModeBtn).toBeInTheDocument();
  });
});
