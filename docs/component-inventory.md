# Component Inventory

**Project:** FreelanceFlow  
**Generated:** 2026-04-03  
**Total components:** 56 (7 feature + 49 shadcn/ui primitives)

---

## Feature Components (`src/components/`)

These components implement FreelanceFlow-specific behavior. They consume shadcn/ui primitives and application context.

### `Header.tsx`
**Category:** Layout / Navigation  
**Description:** Top navigation bar fixed at the top of the viewport.

**What it renders:**
- Brand logo + "FreelanceFlow" name (hidden on mobile)
- Active timer indicator: pulsing dot + task name + live elapsed time (visible on md+)
- Total revenue stat (`$XXX.XX`) with DollarSign icon
- Billable hours stat (`X.Xh`) with TrendingUp icon
- "Add Task" primary button → triggers `onAddTask` callback
- Language switcher dropdown (English 🇺🇸 / Portuguese 🇧🇷)
- Dark/light mode toggle

**Props:** `{ onAddTask: () => void }`  
**Hooks used:** `useApp`, `useTimer`, `useLanguage`

---

### `KanbanBoard.tsx`
**Category:** Feature / Drag-and-Drop  
**Description:** Root of the Kanban board; wraps all columns in a `DndContext` and owns all drag event logic.

**What it renders:**
- Horizontal scrollable flex container of `KanbanColumn` components (sorted by `column.order`)
- Inline "Add Column" form (Input + Button, toggled by state)
- `DragOverlay` with a rotated ghost `TaskCard` during active drag

**DnD behavior:**
- `onDragStart` → tracks which task is being dragged
- `onDragOver` → fires `MOVE_TASK` (cross-column) or `REORDER_TASKS` (same-column) in real time
- `onDragEnd` → clears active task

**Props:** `{ onAddTask: (columnId: string) => void; onTaskClick: (task: Task) => void }`  
**Hooks used:** `useApp`, `useLanguage`

---

### `KanbanColumn.tsx`
**Category:** Feature / Kanban  
**Description:** A single Kanban column — droppable, contains a sortable list of task cards.

**What it renders:**
- Column header: title + task count badge
- Rename inline editor (Input + confirm/cancel buttons), toggled via DropdownMenu
- Delete column option (only shown when >1 column exists)
- "Add Task" icon button in header
- Scrollable list of `TaskCard` components wrapped in `SortableContext`
- Empty state with "No tasks yet" + Add Task button

**Visual state:** Highlights with `ring-2 ring-primary/50` when a card is dragged over it.

**Props:** `{ column: Column; tasks: Task[]; onAddTask: () => void; onTaskClick: (task: Task) => void }`  
**Hooks used:** `useApp`, `useLanguage`

---

### `TaskCard.tsx`
**Category:** Feature / Task  
**Description:** A single draggable task card. The primary task interaction surface on the board.

**What it renders:**
- Task title (2-line clamp)
- Context menu (MoreHorizontal) → Delete option
- Client color badge (styled with client's color)
- Priority badge (high/medium/low with color variants)
- Timer button: Play/Stop toggle; shows formatted elapsed time when running; shows "Start" when idle
- Time estimate chip (Clock icon + formatted time)
- Billable badge with live revenue (`$XX`) OR "Non-billable" label
- Due date indicator: Today / Tomorrow / Date / "Overdue" (colored by urgency)

**Visual states:**
- Active drag: `opacity-50 shadow-xl rotate-2 scale-105`
- Timer running: `ring-2 ring-timer shadow-timer-active` + pulsing dot in top-right corner

**Props:** `{ task: Task; onClick: () => void }`  
**Hooks used:** `useApp`, `useTimer`, `useLanguage`

---

### `TaskDetailPanel.tsx`
**Category:** Feature / Task  
**Description:** Slide-in side panel for viewing and editing all task fields. Animated with Framer Motion.

**Animation:** Slides in from the right (`x: '100%' → 0`) with spring physics. Backdrop blur overlay behind panel.

**Editable fields:**
- Title (Input)
- Description (Textarea)
- Client (Select dropdown)
- Priority (Select: high/medium/low)
- Due date (date input)
- Billable toggle (Switch)
- Hourly rate override (number Input, shows client rate as placeholder)
- Time estimate in hours (number Input)

**Read-only displays:**
- Effective hourly rate
- Calculated revenue
- Total time spent (formatted)
- Time progress bar (timeSpent vs timeEstimate; turns red when over-budget)

**Actions:** Delete task button (destructive, calls `DELETE_TASK` + closes panel)

**Props:** `{ task: Task | null; onClose: () => void }`  
**Hooks used:** `useApp`, `useLanguage`

---

### `AddTaskDialog.tsx`
**Category:** Feature / Task  
**Description:** Modal dialog for creating a new task. Built on Radix `Dialog`.

**Form fields:**
- Title (required, Input)
- Description (optional, Textarea)
- Column selector (Select — lists current columns)
- Client selector (Select — lists current clients or "No client")
- Priority (Select: high/medium/low, defaults to medium)
- Billable toggle (Switch, defaults to true)
- Hourly rate override (conditional on billable, shows client rate hint)
- Time estimate in hours (Input)

**Behavior:** Resets all fields on submit or close. `defaultColumnId` prop pre-selects a column.

**Props:** `{ open: boolean; onOpenChange: (open: boolean) => void; defaultColumnId: string | null }`  
**Hooks used:** `useApp`, `useLanguage`

---

### `NavLink.tsx`
**Category:** Navigation Utility  
**Description:** Thin wrapper for router-aware navigation links. Minimal utility component.

---

## shadcn/ui Primitives (`src/components/ui/`)

49 accessible, unstyled-then-Tailwind-styled components built on Radix UI. All follow shadcn conventions with CVA (class-variance-authority) for variant handling.

### Actively Used by Feature Components

| Component | File | Used In |
|-----------|------|---------|
| `Button` | `button.tsx` | All feature components |
| `Input` | `input.tsx` | TaskDetailPanel, AddTaskDialog, KanbanBoard, KanbanColumn |
| `Textarea` | `textarea.tsx` | TaskDetailPanel, AddTaskDialog |
| `Label` | `label.tsx` | TaskDetailPanel, AddTaskDialog |
| `Switch` | `switch.tsx` | TaskDetailPanel, AddTaskDialog |
| `Select` + sub-components | `select.tsx` | TaskDetailPanel, AddTaskDialog |
| `Dialog` + sub-components | `dialog.tsx` | AddTaskDialog |
| `Badge` | `badge.tsx` | TaskCard |
| `DropdownMenu` + sub-components | `dropdown-menu.tsx` | Header, TaskCard, KanbanColumn |
| `Toaster` | `toaster.tsx` | App.tsx |
| `Sonner` | `sonner.tsx` | App.tsx |
| `Tooltip` / `TooltipProvider` | `tooltip.tsx` | App.tsx (provider only) |

### Available — Not Yet Used in Features

These are installed and available for future feature development:

| Component | File | Typical Use |
|-----------|------|-------------|
| `Accordion` | `accordion.tsx` | Collapsible sections |
| `Alert` / `AlertDialog` | `alert.tsx`, `alert-dialog.tsx` | Alerts, confirmations |
| `AspectRatio` | `aspect-ratio.tsx` | Media containers |
| `Avatar` | `avatar.tsx` | User avatars |
| `Breadcrumb` | `breadcrumb.tsx` | Navigation breadcrumbs |
| `Calendar` | `calendar.tsx` | Date picker calendar |
| `Card` | `card.tsx` | Content cards |
| `Carousel` | `carousel.tsx` | Image/content carousels |
| `Chart` | `chart.tsx` | Recharts wrapper |
| `Checkbox` | `checkbox.tsx` | Multi-select checkboxes |
| `Collapsible` | `collapsible.tsx` | Show/hide sections |
| `Command` | `command.tsx` | Command palette / combobox |
| `ContextMenu` | `context-menu.tsx` | Right-click menus |
| `Drawer` | `drawer.tsx` | Bottom/side drawer (Vaul) |
| `Form` | `form.tsx` | react-hook-form integration |
| `HoverCard` | `hover-card.tsx` | Hover popover |
| `InputOtp` | `input-otp.tsx` | OTP input field |
| `Menubar` | `menubar.tsx` | Application menu bar |
| `NavigationMenu` | `navigation-menu.tsx` | Complex nav menus |
| `Pagination` | `pagination.tsx` | Page controls |
| `Popover` | `popover.tsx` | Floating content |
| `Progress` | `progress.tsx` | Progress bar |
| `RadioGroup` | `radio-group.tsx` | Radio buttons |
| `ResizablePanels` | `resizable.tsx` | Split-pane layouts |
| `ScrollArea` | `scroll-area.tsx` | Custom scrollbars |
| `Separator` | `separator.tsx` | Visual dividers |
| `Sheet` | `sheet.tsx` | Off-canvas panel |
| `Sidebar` | `sidebar.tsx` | App sidebar layout |
| `Skeleton` | `skeleton.tsx` | Loading placeholders |
| `Slider` | `slider.tsx` | Range input |
| `Table` | `table.tsx` | Data tables |
| `Tabs` | `tabs.tsx` | Tab navigation |
| `Toggle` / `ToggleGroup` | `toggle.tsx`, `toggle-group.tsx` | Toggle buttons |

---

## Custom Hooks (`src/hooks/`)

| Hook | File | Description |
|------|------|-------------|
| `useTimer` | `useTimer.ts` | Active timer management: start/stop/toggle, 1-second elapsed counter, task-scoped elapsed getter. Also exports `formatTime()` and `formatTimeCompact()`. |
| `useMobile` | `use-mobile.tsx` | Returns `true` when viewport < 768px (uses `window.matchMedia`). |
| `useToast` | `use-toast.ts` | shadcn toast trigger hook (wraps Radix toast state). |

---

## Design Patterns

### Consistent Patterns Across Feature Components
- All feature components consume `useApp()` for state/dispatch
- All use `useLanguage()` for translated strings via `t.<key>`
- Conditional Tailwind via `cn()` from `@/lib/utils`
- Radix primitives from `@/components/ui/*` (never re-implemented)
- IDs generated with `uuid` v4 (`uuidv4()`)
- Timestamps stored as Unix milliseconds (`Date.now()`)
