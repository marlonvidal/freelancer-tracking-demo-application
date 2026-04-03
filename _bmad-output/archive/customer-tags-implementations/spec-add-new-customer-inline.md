---
title: 'Add New Customer Inline from Task Forms'
type: 'feature'
created: '2026-04-03'
status: 'done'
baseline_commit: '7adc56393d167923e2dbe1cf0cc5233abde83071'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** When creating or editing a task, the client dropdown only shows existing clients — there is no way to add a new customer without leaving the task flow, making it impossible to assign a task to a brand-new client in one step.

**Approach:** Add an "Add new client" option at the bottom of the client `Select` in both `AddTaskDialog` and `TaskDetailPanel`. Selecting it opens a small inline dialog (name, hourly rate, color picker) that dispatches `ADD_CLIENT` and auto-selects the new client upon save.

## Boundaries & Constraints

**Always:**
- Use the existing `ADD_CLIENT` reducer action — no new state or storage changes required.
- Generate client IDs with `uuidv4()` (already imported in AppContext; pass `Omit<Client, 'id'>` to the action).
- All UI strings must be added to both `en` and `pt` objects in `LanguageContext.tsx`.
- Use existing shadcn primitives from `src/components/ui/` only (Dialog, Input, Label, Button already used nearby).
- Color value stored as a hex string matching the `Client.color` field type.
- New component file exports a single default component (react-refresh rule).

**Ask First:**
- If a meaningful preset color palette (beyond a simple set of ~8 swatches) is needed.

**Never:**
- Do not add a full client management CRUD page — this is inline creation only.
- Do not add edit or delete client from these dialogs.
- Do not introduce new npm packages.
- Do not touch `AppState` shape, `loadState`, or `saveState`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path — AddTaskDialog | User opens client select → clicks "Add new client" → enters name + rate → saves | New client appears selected in the dropdown; task is created with that clientId | — |
| Happy path — TaskDetailPanel | Same flow from task edit panel | New client immediately selected; task updated via UPDATE_TASK | — |
| Empty name | User submits with blank name | Save button disabled; no dispatch | Disable submit when name is empty |
| Empty hourly rate | User submits with blank rate | Default to 0 (treat as 0/hr) | — |
| Cancel | User opens add-client dialog then cancels | Dialog closes, client select reverts to previous value | — |

</frozen-after-approval>

## Code Map

- `src/components/AddClientDialog.tsx` -- NEW: reusable dialog component; accepts `open`, `onOpenChange`, `onClientCreated(clientId)` props
- `src/components/AddTaskDialog.tsx` -- add "Add new client" SelectItem + wire AddClientDialog; auto-select new client id
- `src/components/TaskDetailPanel.tsx` -- same wiring as AddTaskDialog for the client Select section
- `src/context/LanguageContext.tsx` -- add `addNewClient`, `clientName`, `newClient`, `saveClient` keys to both `en` and `pt`
- `src/types/index.ts` -- read-only: confirm `Client` shape; no changes expected

## Tasks & Acceptance

**Execution:**
- [x] `src/context/LanguageContext.tsx` -- add translation keys `addNewClient`, `clientName`, `newClient`, `saveClient` to both `en` and `pt` objects and the `Translations` interface
- [x] `src/components/AddClientDialog.tsx` -- create component: Dialog with name Input, hourly rate Input (number, defaults to 0), color swatch picker (6–8 preset hex colors), save/cancel Buttons; on save dispatches `ADD_CLIENT` then calls `onClientCreated(newId)` 
- [x] `src/components/AddTaskDialog.tsx` -- import and render `AddClientDialog`; add a disabled-style "＋ Add new client" SelectItem at the bottom of the client SelectContent; intercept its selection to open AddClientDialog instead; on `onClientCreated` set `clientId` to the new id
- [x] `src/components/TaskDetailPanel.tsx` -- same wiring as AddTaskDialog: import AddClientDialog, add the "+ Add new client" item, handle open/close, on `onClientCreated` call `handleUpdate({ clientId: newId })`

**Acceptance Criteria:**
- Given the Add Task dialog is open and the client select is clicked, when the user picks "+ Add new client", then the AddClientDialog opens without closing the task dialog.
- Given the AddClientDialog is open, when the user enters a name and clicks Save, then the new client appears selected in the client dropdown and the task dialog remains open.
- Given the AddClientDialog is open, when the user clicks Cancel, then the dialog closes and the client select reverts to its previous value.
- Given the AddClientDialog is open with an empty name field, when Save is clicked, then nothing is dispatched and the button is disabled.
- Given a task detail panel is open, when the user picks "+ Add new client" and saves, then the task is immediately updated with the new clientId.
- Given any language is active (en or pt), then all new strings render in the correct language.

## Verification

**Commands:**
- `npm run lint` -- expected: 0 errors
- `npm run build` -- expected: build succeeds with no TypeScript errors

**Manual checks:**
- Open Add Task dialog → client select → confirm "+ Add new client" option is present and opens the creation dialog.
- Create a new client, confirm it auto-selects and the task can be saved with it.
- Repeat from Task Detail Panel on an existing task.
- Switch language to Portuguese and confirm new labels appear in PT.

## Suggested Review Order

**New component — the core feature**

- Single-responsibility dialog: name, rate, color swatch; pre-generates UUID for reliable auto-select.
  [`AddClientDialog.tsx:1`](../../src/components/AddClientDialog.tsx#L1)

- Rate sanitization: `Number.isFinite` + `Math.max(0, ...)` prevents NaN/negative in state.
  [`AddClientDialog.tsx:49`](../../src/components/AddClientDialog.tsx#L49)

- Duplicate-save guard: `saving` flag disables button and blocks double-dispatch.
  [`AddClientDialog.tsx:44`](../../src/components/AddClientDialog.tsx#L44)

**Reducer extension — pre-generated ID threading**

- Optional `id` field on `ADD_CLIENT` payload; nullish coalescing preserves existing callers.
  [`AppContext.tsx:17`](../../src/context/AppContext.tsx#L17)

- Reducer uses caller-supplied id when present; falls back to `uuidv4()`.
  [`AppContext.tsx:124`](../../src/context/AppContext.tsx#L124)

**Wiring — AddTaskDialog**

- Fragment wraps AddClientDialog outside the main Dialog so both can be open simultaneously.
  [`AddTaskDialog.tsx:87`](../../src/components/AddTaskDialog.tsx#L87)

- Sentinel `__add_new__` intercept: opens AddClientDialog without changing clientId state.
  [`AddTaskDialog.tsx:153`](../../src/components/AddTaskDialog.tsx#L153)

- Effect closes child dialog when parent task dialog closes (prevents orphaned open state).
  [`AddTaskDialog.tsx:55`](../../src/components/AddTaskDialog.tsx#L55)

**Wiring — TaskDetailPanel**

- Same sentinel pattern; `handleClientCreated` calls `handleUpdate` to immediately persist new clientId.
  [`TaskDetailPanel.tsx:48`](../../src/components/TaskDetailPanel.tsx#L48)

**Peripherals — i18n**

- Five new keys added to Translations interface and both `en` and `pt` objects.
  [`LanguageContext.tsx:61`](../../src/context/LanguageContext.tsx#L61)
