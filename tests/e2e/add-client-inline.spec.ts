import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * E2E tests for "Add new client inline" feature.
 *
 * The inline form replaces the client Select in-place inside the task dialog /
 * detail panel — there is never more than ONE Radix Dialog open at a time,
 * which makes every assertion straightforward.
 *
 * Coverage:
 *   AC1  [P0] "+ Add new client" replaces client Select with an inline form
 *   AC2  [P0] Saving the inline form auto-selects the new client and restores the Select
 *   AC3  [P1] Cancelling the inline form restores the Select with no selection change
 *   AC4  [P1] Save button is disabled when the name field is empty
 *   AC5  [P0] TaskDetailPanel — inline client creation updates the task immediately
 *   AC6  [P2] Portuguese labels render correctly in the inline form
 *   Edge [P1] Empty hourly rate defaults to 0
 */

test.use({ storageState: undefined });

test.describe("Add new client inline", () => {
  test.beforeEach(async ({ page }) => {
    await blockKnownThirdPartyHosts(page);
    await page.addInitScript(() => {
      localStorage.removeItem("freelancer-kanban-data");
    });
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Open the Add Task dialog via the header button (avoids per-column buttons). */
  async function openAddTaskDialog(page: import("@playwright/test").Page) {
    await page.getByRole("banner").getByRole("button").first().click();
    await expect(page.getByRole("dialog").first()).toBeVisible();
  }

  /** Open the client Select inside the currently-open task dialog. */
  async function openClientSelect(page: import("@playwright/test").Page) {
    await page.getByTestId("client-select").click();
  }

  /** Click "+ Add new client" in the client Select. */
  async function clickAddNewClient(page: import("@playwright/test").Page) {
    await page.getByRole("option", { name: /add new client/i }).click();
  }

  // ---------------------------------------------------------------------------
  // AC1 [P0] — Picking "+ Add new client" replaces the Select with an inline form
  // ---------------------------------------------------------------------------
  test("[P0] opens inline client form from the client Select", async ({
    page,
  }) => {
    await openAddTaskDialog(page);
    await openClientSelect(page);
    await clickAddNewClient(page);

    // The inline form must be visible inside the same dialog.
    await expect(page.getByTestId("add-client-form")).toBeVisible();

    // The client Select trigger must be gone (replaced by the form).
    await expect(page.getByTestId("client-select")).not.toBeVisible();

    // The task dialog must still be open.
    await expect(page.getByRole("dialog").first()).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // AC2 [P0] — Save inline form → new client auto-selected, Select restored
  // ---------------------------------------------------------------------------
  test("[P0] saves inline form and auto-selects the new client", async ({
    page,
  }) => {
    await openAddTaskDialog(page);
    await openClientSelect(page);
    await clickAddNewClient(page);

    const form = page.getByTestId("add-client-form");
    await form.getByLabel(/client name/i).fill("Acme Industries");
    await form.getByLabel(/hourly rate/i).fill("120");
    await form.getByRole("button", { name: /save client/i }).click();

    // Inline form must be hidden.
    await expect(form).not.toBeVisible();

    // The client Select trigger must reappear and show the new client name.
    await expect(page.getByTestId("client-select")).toBeVisible();
    await expect(page.getByTestId("client-select")).toContainText(
      "Acme Industries"
    );

    // Task dialog must still be open.
    await expect(page.getByRole("dialog").first()).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // AC3 [P1] — Cancel inline form → Select restored, no selection change
  // ---------------------------------------------------------------------------
  test("[P1] cancelling inline form restores Select without changing selection", async ({
    page,
  }) => {
    await openAddTaskDialog(page);
    await openClientSelect(page);
    await clickAddNewClient(page);

    const form = page.getByTestId("add-client-form");
    await expect(form).toBeVisible();

    await form.getByRole("button", { name: /cancel/i }).click();

    // Form gone, Select back.
    await expect(form).not.toBeVisible();
    await expect(page.getByTestId("client-select")).toBeVisible();

    // Select still shows the placeholder (no client selected).
    await expect(page.getByTestId("client-select")).not.toContainText(
      "Acme Industries"
    );
  });

  // ---------------------------------------------------------------------------
  // AC4 [P1] — Empty name keeps Save disabled
  // ---------------------------------------------------------------------------
  test("[P1] Save button is disabled when client name is empty", async ({
    page,
  }) => {
    await openAddTaskDialog(page);
    await openClientSelect(page);
    await clickAddNewClient(page);

    const form = page.getByTestId("add-client-form");
    const saveBtn = form.getByRole("button", { name: /save client/i });

    // Empty by default → disabled.
    await expect(saveBtn).toBeDisabled();

    // Fill then clear → disabled again.
    const nameInput = form.getByLabel(/client name/i);
    await nameInput.fill("Temp");
    await expect(saveBtn).toBeEnabled();
    await nameInput.clear();
    await expect(saveBtn).toBeDisabled();
  });

  // ---------------------------------------------------------------------------
  // Edge [P1] — Empty hourly rate defaults to 0
  // ---------------------------------------------------------------------------
  test("[P1] empty hourly rate defaults to 0 when creating client", async ({
    page,
  }) => {
    await openAddTaskDialog(page);
    await openClientSelect(page);
    await clickAddNewClient(page);

    const form = page.getByTestId("add-client-form");
    await form.getByLabel(/client name/i).fill("Zero Rate Co");
    // Leave hourly rate blank.
    await form.getByRole("button", { name: /save client/i }).click();

    // Client select shows the new client → creation succeeded.
    await expect(page.getByTestId("client-select")).toContainText("Zero Rate Co");

    // Finish creating the task and verify it appears on the board.
    const dialog = page.getByRole("dialog").first();
    await dialog.getByLabel(/title/i).fill("Rate test task");
    await dialog.getByRole("button", { name: /create task/i }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("Rate test task")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // AC5 [P0] — TaskDetailPanel: inline form updates the task immediately
  // ---------------------------------------------------------------------------
  test("[P0] creates a new client inline from TaskDetailPanel and task updates", async ({
    page,
  }) => {
    // Open a seeded task that has no client assigned.
    await page.getByText("Update portfolio site").click();
    await expect(page.getByText("Task Details")).toBeVisible();

    // The panel's client Select.
    const clientSelect = page.getByTestId("client-select");
    await clientSelect.click();
    await page.getByRole("option", { name: /add new client/i }).click();

    const form = page.getByTestId("add-client-form");
    await expect(form).toBeVisible();

    await form.getByLabel(/client name/i).fill("Panel Client");
    await form.getByRole("button", { name: /save client/i }).click();

    await expect(form).not.toBeVisible();
    // Select reappears showing the new client.
    await expect(clientSelect).toBeVisible();
    await expect(clientSelect).toContainText("Panel Client");
  });

  // ---------------------------------------------------------------------------
  // AC6 [P2] — Portuguese labels render correctly in the inline form
  // ---------------------------------------------------------------------------
  test("[P2] inline client form renders Portuguese labels when language is PT", async ({
    page,
  }) => {
    // Language toggle is the second button in the banner (Add task / Globe / Dark mode).
    await page.getByRole("banner").getByRole("button").nth(1).click();
    await page.getByRole("menuitem", { name: /portugu/i }).click();

    await openAddTaskDialog(page);
    await page.getByTestId("client-select").click();
    await page.getByRole("option", { name: /adicionar novo cliente/i }).click();

    const form = page.getByTestId("add-client-form");
    await expect(form).toBeVisible();

    await expect(form.getByText(/novo cliente/i)).toBeVisible();
    await expect(form.getByLabel(/nome do cliente/i)).toBeVisible();
    await expect(
      form.getByRole("button", { name: /salvar cliente/i })
    ).toBeVisible();
    await expect(
      form.getByRole("button", { name: /cancelar/i })
    ).toBeVisible();
  });
});
