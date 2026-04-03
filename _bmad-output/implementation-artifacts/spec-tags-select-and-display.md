---
title: 'Tags — Select and Display on Task Cards'
type: 'feature'
created: '2026-04-03'
status: 'done'
baseline_commit: '6f9e09a73f34fe32173abc1506b0fe2b4cf12061'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Tasks already carry a `tags: string[]` field with sample data, but there is no UI to add, remove, or view tags — making the field invisible and useless for job organization.

**Approach:** Add a tag chip-input to `AddTaskDialog` and `TaskDetailPanel` (comma-separated free-text entry that converts to chips), and render the task's tags as colored chips on `TaskCard` so they are visible at a glance on the board.

## Boundaries & Constraints

**Always:**
- Tags are free-text strings (no global tag registry); stored directly in `Task.tags: string[]`.
- Use `UPDATE_TASK` (`Partial<Task>`) to persist tag changes from `TaskDetailPanel`; pass `tags` in the `ADD_TASK` payload from `AddTaskDialog`.
- Use existing shadcn `Badge` component from `src/components/ui/badge` for chip rendering.
- All UI strings must use `t.<key>` — add `tags`, `addTag`, and `pressEnterToAddTag` keys to **both** `en` and `pt` translations in `LanguageContext.tsx`.
- Follow existing `cn()` + Tailwind patterns; no new UI libraries.

**Ask First:**
- If a global tag registry (shared tags across tasks) is requested during implementation — that is out of scope; halt and ask.

**Never:**
- Do not add a global `availableTags` list to `AppState` — tags are per-task free text only.
- Do not add a dedicated tag management page or route.
- Do not change `Task` type or storage schema — `tags: string[]` is already correct.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Add tags at task creation | User types `design, ui` in tag input of `AddTaskDialog` and submits | Task created with `tags: ['design', 'ui']`; chips shown on card | Trim whitespace; skip empty strings |
| Add tag in detail panel | User types a tag name and presses Enter or comma | Chip appended to list; `UPDATE_TASK` dispatched immediately | Ignore duplicate tags; trim whitespace |
| Remove tag in detail panel | User clicks ✕ on a tag chip | Tag removed from list; `UPDATE_TASK` dispatched | N/A |
| Task has no tags | `task.tags` is `[]` | No chip row rendered on `TaskCard` (no empty space) | N/A |
| Long tag name | Tag string > 20 chars | Chip truncates with ellipsis (`max-w-[120px] truncate`) | N/A |

</frozen-after-approval>

## Code Map

- `src/context/LanguageContext.tsx` — add `tags`, `addTag`, `pressEnterToAddTag` keys (en + pt)
- `src/components/TaskCard.tsx` — render `task.tags` as `Badge` chips below due-date row
- `src/components/AddTaskDialog.tsx` — add tag chip-input field; include tags in `ADD_TASK` payload
- `src/components/TaskDetailPanel.tsx` — add tag chip-input field; dispatch `UPDATE_TASK` on change

## Tasks & Acceptance

**Execution:**
- [x] `src/context/LanguageContext.tsx` -- add `tags: 'Tags'`, `addTag: 'Add tag'`, `pressEnterToAddTag: 'Press Enter or comma to add'` to `en` and equivalent PT translations to `pt`
- [x] `src/components/TaskCard.tsx` -- render `task.tags` as a row of `Badge` chips (variant `secondary`, `text-xs`) between the time/revenue row and the due-date row; hide row entirely when `tags` is empty
- [x] `src/components/AddTaskDialog.tsx` -- add a `tags` state (`string[]`), a text input that adds a tag on Enter/comma keypress and trims+deduplicates, renders existing tags as removable chips, and passes `tags` in the `ADD_TASK` dispatch; reset `tags` on form reset
- [x] `src/components/TaskDetailPanel.tsx` -- add the same tag chip-input UI; dispatch `UPDATE_TASK` with updated `tags` array on every add/remove

**Acceptance Criteria:**
- Given an open `AddTaskDialog`, when the user types `design` and presses Enter, then a chip `design` appears in the input area
- Given a chip in `AddTaskDialog`, when the user clicks ✕ on it, then the chip is removed
- Given a task created with tags `['design', 'ui']`, when the Kanban board renders, then both chips are visible on the task card
- Given a task with no tags, when the card renders, then no empty tag row or extra whitespace appears
- Given `TaskDetailPanel` open for a task, when the user adds or removes a tag, then `UPDATE_TASK` is dispatched and the card reflects the change after closing

## Design Notes

Tag chip-input pattern (shared across both dialogs):
```
[design ✕] [ui ✕]  [ type and press Enter... ]
```
- Input sits inline after the last chip in a `flex flex-wrap gap-1` container
- On Enter or comma keypress: trim value, skip empty/duplicate, append to array, clear input
- Each chip: `<Badge variant="secondary" className="flex items-center gap-1 text-xs">tag <X className="h-3 w-3 cursor-pointer" /></Badge>`

## Suggested Review Order

**Entry point — tag input logic**

- Submit flushes pending `tagInput`; deduplication + trim-comma regex governs all tag adds
  [`AddTaskDialog.tsx:57`](../../src/components/AddTaskDialog.tsx#L57)

- `onMouseDown` prevents blur before remove fires; keeps chip remove from adding phantom tag
  [`AddTaskDialog.tsx:111`](../../src/components/AddTaskDialog.tsx#L111)

**Chip-input UI pattern (AddTaskDialog)**

- Flex-wrap chip container with inline input; placeholder adapts to empty/non-empty state
  [`AddTaskDialog.tsx:298`](../../src/components/AddTaskDialog.tsx#L298)

**Tag mutations in TaskDetailPanel**

- `localTask.tags ?? []` guard protects against legacy storage entries without tags field
  [`TaskDetailPanel.tsx:54`](../../src/components/TaskDetailPanel.tsx#L54)

- `onMouseDown` + `UPDATE_TASK` dispatch on every add/remove (immediate persistence)
  [`TaskDetailPanel.tsx:244`](../../src/components/TaskDetailPanel.tsx#L244)

**Card display**

- Conditional row — hidden when `tags` is empty, prevents phantom spacing on tagless cards
  [`TaskCard.tsx:192`](../../src/components/TaskCard.tsx#L192)

**i18n**

- Three keys added to both `en` and `pt` translation objects
  [`LanguageContext.tsx:68`](../../src/context/LanguageContext.tsx#L68)

## Verification

**Commands:**
- `npm run lint` -- expected: no errors
- `npm run build` -- expected: exits 0, no TS errors

**Manual checks (if no CLI):**
- Open board → create a task → type tags → verify chips appear on the card
- Open task detail → add/remove tags → close → verify card updates
