import { test, expect } from "../support/fixtures";
import { blockKnownThirdPartyHosts } from "../support/helpers/network";

/**
 * ATDD — TDD RED PHASE
 *
 * E2E acceptance tests for "Tags — Select and Display on Task Cards".
 *
 * All tests are wrapped in test.skip() because the feature is NOT YET IMPLEMENTED.
 * Once the feature is implemented, remove test.skip() to verify the green phase.
 *
 * Coverage:
 *   AC1  [P0] Typing a tag and pressing Enter adds a chip in AddTaskDialog
 *   AC2  [P0] Clicking ✕ on a chip in AddTaskDialog removes it
 *   AC3  [P0] Task created with tags shows chips on the TaskCard
 *   AC4  [P1] Task with no tags shows no chip row on the card
 *   AC5  [P0] TaskDetailPanel — adding/removing a tag updates the card
 *   Edge1 [P1] Comma-separated entry is split into individual chips (whitespace trimmed)
 *   Edge2 [P2] Duplicate tag entry is silently ignored
 *   Edge3 [P2] Tag longer than 20 characters is truncated with ellipsis on the chip
 *   Edge4 [P3] Portuguese locale renders the translated tag input labels
 */

test.use({ storageState: undefined });

test.describe("Tags — Select and Display on Task Cards (ATDD)", () => {
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

  /** Open the Add Task dialog via the first header button. */
  async function openAddTaskDialog(page: import("@playwright/test").Page) {
    await page.getByRole("banner").getByRole("button").first().click();
    await expect(page.getByRole("dialog").first()).toBeVisible();
  }

  /** Type a value into the tag chip-input and press the given key. */
  async function typeTag(
    page: import("@playwright/test").Page,
    tag: string,
    confirm: "Enter" | "," = "Enter"
  ) {
    const input = page.getByPlaceholder(/press enter or comma to add/i);
    await input.fill(tag);
    if (confirm === ",") {
      await input.type(",");
    } else {
      await input.press("Enter");
    }
  }

  /** Return a locator for the chip with the given label inside the dialog. */
  function tagChipInDialog(
    page: import("@playwright/test").Page,
    label: string
  ) {
    return page
      .getByRole("dialog")
      .first()
      .getByText(label, { exact: true })
      .first();
  }

  /** Fill and submit a minimal valid Add Task form with optional tags already typed. */
  async function submitTaskWithTags(
    page: import("@playwright/test").Page,
    taskTitle: string,
    tags: string[]
  ) {
    await openAddTaskDialog(page);
    await page.getByLabel(/title/i).fill(taskTitle);
    for (const tag of tags) {
      await typeTag(page, tag);
    }
    await page.getByRole("button", { name: /add task|save/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }

  /** Open TaskDetailPanel for the first card whose title contains `titleFragment`. */
  async function openTaskDetailPanel(
    page: import("@playwright/test").Page,
    titleFragment: string
  ) {
    await page
      .getByRole("article")
      .filter({ hasText: titleFragment })
      .first()
      .click();
    await expect(
      page.getByRole("complementary").or(page.getByRole("dialog"))
    ).toBeVisible();
  }

  // ---------------------------------------------------------------------------
  // AC1 [P0] — Typing a tag name and pressing Enter adds a chip in AddTaskDialog
  // ---------------------------------------------------------------------------
  test.skip("[P0] adds chip on Enter in AddTaskDialog", async ({ page }) => {
    // THIS TEST WILL FAIL — tag chip-input not implemented yet
    await openAddTaskDialog(page);
    await typeTag(page, "design");

    // Chip with label "design" must appear inside the dialog
    await expect(tagChipInDialog(page, "design")).toBeVisible();

    // Input must be cleared after confirming the tag
    await expect(
      page.getByPlaceholder(/press enter or comma to add/i)
    ).toHaveValue("");
  });

  // ---------------------------------------------------------------------------
  // AC2 [P0] — Clicking ✕ on a chip in AddTaskDialog removes it
  // ---------------------------------------------------------------------------
  test.skip("[P0] removes chip on ✕ click in AddTaskDialog", async ({
    page,
  }) => {
    // THIS TEST WILL FAIL — tag chip-input not implemented yet
    await openAddTaskDialog(page);
    await typeTag(page, "ui");

    // Chip must be present first
    await expect(tagChipInDialog(page, "ui")).toBeVisible();

    // Click the remove button associated with the chip
    await page
      .getByRole("dialog")
      .first()
      .getByRole("button", { name: /remove ui|×|✕/i })
      .first()
      .click();

    // Chip must be gone
    await expect(tagChipInDialog(page, "ui")).not.toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // AC3 [P0] — Task created with tags shows colored chips on the TaskCard
  // ---------------------------------------------------------------------------
  test.skip(
    "[P0] chips for all tags are visible on the TaskCard after creation",
    async ({ page }) => {
      // THIS TEST WILL FAIL — tag rendering on TaskCard not implemented yet
      await submitTaskWithTags(page, "Tagged Task", ["design", "ui"]);

      const card = page
        .getByRole("article")
        .filter({ hasText: "Tagged Task" })
        .first();

      await expect(card.getByText("design", { exact: true })).toBeVisible();
      await expect(card.getByText("ui", { exact: true })).toBeVisible();
    }
  );

  // ---------------------------------------------------------------------------
  // AC4 [P1] — Task with no tags shows NO chip row on the card
  // ---------------------------------------------------------------------------
  test.skip(
    "[P1] no chip row appears on TaskCard when task has no tags",
    async ({ page }) => {
      // THIS TEST WILL FAIL — the empty-tag guard on TaskCard is not implemented yet
      await submitTaskWithTags(page, "Untagged Task", []);

      const card = page
        .getByRole("article")
        .filter({ hasText: "Untagged Task" })
        .first();

      // The tag-chip container must not be present (or be empty with no height)
      await expect(card.getByTestId("tag-chip-row")).not.toBeVisible();
    }
  );

  // ---------------------------------------------------------------------------
  // AC5 [P0] — TaskDetailPanel: adding/removing a tag updates the card
  // ---------------------------------------------------------------------------
  test.skip(
    "[P0] TaskDetailPanel tag add/remove updates the TaskCard",
    async ({ page }) => {
      // THIS TEST WILL FAIL — TaskDetailPanel tag input not implemented yet
      await submitTaskWithTags(page, "Detail Panel Tag Test", []);

      // Open the detail panel
      await openTaskDetailPanel(page, "Detail Panel Tag Test");

      // Add a tag via the panel chip-input
      const panelInput = page
        .getByRole("complementary")
        .or(page.getByRole("dialog"))
        .getByPlaceholder(/press enter or comma to add/i);
      await panelInput.fill("backend");
      await panelInput.press("Enter");

      // Tag chip must appear inside the panel
      const panel = page
        .getByRole("complementary")
        .or(page.getByRole("dialog"));
      await expect(panel.getByText("backend", { exact: true })).toBeVisible();

      // Close the panel (press Escape or click the close button)
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("complementary").or(page.getByRole("dialog"))
      ).not.toBeVisible();

      // Card must now show the "backend" chip
      const card = page
        .getByRole("article")
        .filter({ hasText: "Detail Panel Tag Test" })
        .first();
      await expect(card.getByText("backend", { exact: true })).toBeVisible();

      // Re-open and remove the tag
      await openTaskDetailPanel(page, "Detail Panel Tag Test");
      await page
        .getByRole("complementary")
        .or(page.getByRole("dialog"))
        .getByRole("button", { name: /remove backend|×|✕/i })
        .first()
        .click();
      await page.keyboard.press("Escape");

      // Card must no longer show "backend"
      await expect(
        card.getByText("backend", { exact: true })
      ).not.toBeVisible();
    }
  );

  // ---------------------------------------------------------------------------
  // Edge1 [P1] — Comma-separated input is split into individual chips
  // ---------------------------------------------------------------------------
  test.skip(
    "[P1] comma-separated entry creates multiple trimmed chips",
    async ({ page }) => {
      // THIS TEST WILL FAIL — tag chip-input not implemented yet
      await openAddTaskDialog(page);

      // Type two tags with a comma; trailing comma triggers second chip
      const input = page.getByPlaceholder(/press enter or comma to add/i);
      await input.fill("design");
      await input.type(",");
      // After comma, "design" should be added; now type the second tag
      await input.fill("  ui  ");
      await input.press("Enter");

      // Both chips must appear, whitespace trimmed
      await expect(tagChipInDialog(page, "design")).toBeVisible();
      await expect(tagChipInDialog(page, "ui")).toBeVisible();
    }
  );

  // ---------------------------------------------------------------------------
  // Edge2 [P2] — Duplicate tag entry is silently ignored
  // ---------------------------------------------------------------------------
  test.skip("[P2] duplicate tag entry is ignored", async ({ page }) => {
    // THIS TEST WILL FAIL — duplicate-guard not implemented yet
    await openAddTaskDialog(page);
    await typeTag(page, "design");
    await typeTag(page, "design"); // duplicate

    // Must still show exactly one "design" chip
    await expect(
      page
        .getByRole("dialog")
        .first()
        .getByText("design", { exact: true })
    ).toHaveCount(1);
  });

  // ---------------------------------------------------------------------------
  // Edge3 [P2] — Long tag is truncated with ellipsis on the chip
  // ---------------------------------------------------------------------------
  test.skip(
    "[P2] tag longer than 20 chars is truncated with ellipsis on the chip",
    async ({ page }) => {
      // THIS TEST WILL FAIL — long-tag truncation not implemented yet
      await openAddTaskDialog(page);
      const longTag = "superlongtagnameover20";
      await typeTag(page, longTag);

      // The chip element must carry the CSS truncate class (max-w-[120px] truncate)
      const chip = page
        .getByRole("dialog")
        .first()
        .locator(".truncate", { hasText: longTag.slice(0, 8) });
      await expect(chip).toBeVisible();
    }
  );

  // ---------------------------------------------------------------------------
  // Edge4 [P3] — Portuguese locale renders translated tag input labels
  // ---------------------------------------------------------------------------
  test.skip(
    "[P3] Portuguese locale renders translated tag labels",
    async ({ page }) => {
      // THIS TEST WILL FAIL — i18n keys for tags not added yet
      // Switch language to Portuguese (click the language toggle)
      await page
        .getByRole("button", { name: /language|pt|en/i })
        .first()
        .click();

      await openAddTaskDialog(page);

      // Translated label for the tag section must be visible
      await expect(page.getByText(/tags/i)).toBeVisible(); // key: tags
      await expect(
        page.getByPlaceholder(/enter ou vírgula para adicionar/i)
      ).toBeVisible(); // key: pressEnterToAddTag (PT)
    }
  );
});
