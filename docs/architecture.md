# Architecture Document

**Project:** FreelanceFlow (freelancer-tracking-demo-application)  
**Type:** Single-Page Web Application (SPA)  
**Architecture Pattern:** Component-Based + Context/Reducer State Management  
**Generated:** 2026-04-03

---

## Executive Summary

FreelanceFlow is a client-side-only React SPA that helps freelancers track tasks, time, and revenue. The application has no backend server — all data is persisted to the browser's `localStorage`. The architecture follows a single-context reducer pattern for global domain state, with React Router for client-side routing (single live route), shadcn/ui primitives for the design system, and dnd-kit for drag-and-drop Kanban board functionality.

The app was scaffolded via Lovable (https://lovable.dev) and is live at `https://hour-zen-board.lovable.app/`.

---

## Technology Stack

| Category | Technology | Version | Role |
|----------|-----------|---------|------|
| Build tool | Vite | ^5.4.19 | Dev server, bundler |
| Framework | React | ^18.3.1 | UI rendering |
| Language | TypeScript | ^5.8.3 | Type safety (strict: false) |
| Styling | Tailwind CSS | ^3.4.17 | Utility-first CSS |
| Component library | shadcn/ui (Radix UI) | Various | Accessible UI primitives |
| Routing | react-router-dom | ^6.30.1 | Client-side routing |
| Server state | @tanstack/react-query | ^5.83.0 | Installed, not yet used for data fetching |
| Drag & drop | @dnd-kit/core + sortable | ^6.3.1 / ^10.0.0 | Kanban board DnD |
| Animation | framer-motion | ^12.28.1 | Task detail slide-in panel |
| Forms | react-hook-form + zod | ^7.61.1 / ^3.25.76 | Form validation (available, partially used) |
| i18n | Custom Context | — | English / Portuguese |
| IDs | uuid | ^13.0.0 | Entity ID generation |
| Dates | date-fns | ^3.6.0 | Date utilities |
| Charts | recharts | ^2.15.4 | Available, not yet integrated in features |
| Unit testing | Vitest + jsdom | ^3.2.4 | Component and logic tests |
| E2E testing | Playwright | ^1.59.1 | Browser automation |
| Linting | ESLint 9 (flat config) | ^9.32.0 | Code quality |

---

## Architecture Pattern

### Component Hierarchy

```
App.tsx
└── QueryClientProvider (@tanstack/react-query)
    └── LanguageProvider (i18n context)
        └── TooltipProvider (Radix tooltip)
            ├── Toaster (shadcn toast notifications)
            ├── Sonner Toaster (sonner toast)
            └── BrowserRouter
                └── Routes
                    ├── "/" → Index
                    │   └── AppProvider (domain state context)
                    │       ├── Header
                    │       ├── KanbanBoard
                    │       │   └── DndContext (dnd-kit)
                    │       │       └── KanbanColumn[] (droppable)
                    │       │           └── TaskCard[] (sortable/draggable)
                    │       ├── TaskDetailPanel (slide-in)
                    │       └── AddTaskDialog (modal)
                    └── "*" → NotFound
```

### State Management

The app uses a single **React Context + useReducer** pattern for all domain state. There is no external state library (Redux, Zustand, etc.).

**State shape (`AppState`):**
```ts
interface AppState {
  tasks: Task[];         // All tasks across all columns
  columns: Column[];     // Kanban columns (ordered)
  clients: Client[];     // Client profiles with hourly rates
  timeEntries: TimeEntry[];  // Historical time entry records (collected but not displayed)
  activeTimer: ActiveTimer | null;  // Currently running timer { taskId, startTime }
  isDarkMode: boolean;   // Dark/light mode preference
}
```

**Reducer actions (typed discriminated union):**

| Action | Purpose |
|--------|---------|
| `SET_STATE` | Replace entire state (initial load) |
| `ADD_TASK` | Create new task in a column |
| `UPDATE_TASK` | Partial update to a task |
| `DELETE_TASK` | Remove task; stop timer if active |
| `MOVE_TASK` | Move task to different column + update order |
| `REORDER_TASKS` | Reorder tasks within a column (DnD) |
| `ADD_COLUMN` | Create new Kanban column |
| `UPDATE_COLUMN` | Rename a column |
| `DELETE_COLUMN` | Remove column; migrate tasks to first column |
| `REORDER_COLUMNS` | Reorder columns (DnD, available, not fully wired) |
| `ADD_CLIENT` | Create a new client |
| `UPDATE_CLIENT` | Update client fields |
| `DELETE_CLIENT` | Remove client; nullify clientId on affected tasks |
| `START_TIMER` | Start timer for a task; persists prior timer elapsed time |
| `STOP_TIMER` | Stop active timer; accumulate elapsed to task.timeSpent |
| `UPDATE_TASK_TIME` | Manually add time to a task |
| `TOGGLE_DARK_MODE` | Flip dark mode |

**Context helper functions (memoized with useCallback):**

| Function | Description |
|----------|-------------|
| `getClient(id)` | Lookup client by ID |
| `getTaskRate(task)` | Effective hourly rate (task override or client rate) |
| `getTaskRevenue(task)` | Task revenue = rate × hours (0 for non-billable) |
| `getTotalRevenue()` | Sum of revenue across all tasks |

### Persistence Layer

All state is serialized to `localStorage` under the key `freelancer-kanban-data`.

```
localStorage
└── "freelancer-kanban-data"  →  JSON.stringify(AppState)
```

- **Load:** `loadState()` in `src/lib/storage.ts` reads and parses; falls back to `getDefaultState()` on error
- **Save:** `useEffect` in `AppProvider` saves on every state change
- **Default seed:** Two default clients (Acme Corp, TechStart) and five sample tasks pre-populate on first load
- **Schema migration:** No formal migration system — `loadState()` merges saved data over `getDefaultState()` to handle missing fields

### Drag and Drop (dnd-kit)

The Kanban board uses `@dnd-kit/core` for DnD orchestration:

- `DndContext` in `KanbanBoard` wraps all columns
- `PointerSensor` (activation distance: 8px) + `KeyboardSensor` for accessibility
- `useDroppable` on `KanbanColumn` (each column is a drop target)
- `useSortable` + `SortableContext` on `TaskCard` (tasks are sortable within and between columns)
- `DragOverlay` renders a ghost copy of the dragged card (rotated 3°, 90% opacity)
- Collision detection: `closestCorners`

**Drag logic (in `handleDragOver`):**
1. Dragging over a column → `MOVE_TASK` to that column
2. Dragging over another task in a different column → `MOVE_TASK` cross-column
3. Dragging over another task in the same column → `REORDER_TASKS` (reindex)

### Timer System

The timer is driven by `src/hooks/useTimer.ts`:
- `activeTimer: { taskId, startTime }` stored in AppState (persisted to localStorage)
- 1-second `setInterval` updates local `elapsed` state
- `START_TIMER` action accumulates any prior timer elapsed into `timeSpent` before setting new `startTime`
- `STOP_TIMER` action accumulates final elapsed into `timeSpent` and clears `activeTimer`
- Only one timer can run at a time — starting a new one stops the previous

### Internationalization (i18n)

`LanguageContext` provides translation strings for English (`en`) and Portuguese (`pt`). Language preference persists to `localStorage` under `app-language`. The `useLanguage()` hook exposes `{ language, setLanguage, t }` — all UI strings should use `t.<key>` rather than hardcoded text.

---

## Data Architecture

### Core Domain Models

**`Task`** — Central entity; links to a column, client, and time tracking
```ts
interface Task {
  id: string;            // UUID
  title: string;
  description: string;
  columnId: string;      // FK → Column.id
  clientId: string | null;  // FK → Client.id (nullable)
  priority: 'high' | 'medium' | 'low';
  isBillable: boolean;
  hourlyRate: number | null;  // Override client rate; null = inherit from client
  timeEstimate: number | null;  // seconds
  timeSpent: number;    // seconds (accumulated from timer stops)
  createdAt: number;    // Unix ms timestamp
  dueDate: number | null;  // Unix ms timestamp
  tags: string[];
  order: number;         // Sort position within column
}
```

**`Column`** — Kanban lane
```ts
interface Column {
  id: string;
  title: string;
  order: number;  // Display position
}
```

**`Client`** — Client profile with billing defaults
```ts
interface Client {
  id: string;
  name: string;
  hourlyRate: number;  // USD per hour
  color: string;       // Hex color for UI badges
}
```

**`TimeEntry`** — Granular time records (collected but not yet displayed in UI)
```ts
interface TimeEntry {
  id: string;
  taskId: string;
  startTime: number;    // Unix ms
  endTime: number | null;
  duration: number;     // seconds
}
```

**Revenue Calculation:**
```
effectiveRate = task.hourlyRate ?? client.hourlyRate ?? 0
revenue = isBillable ? (effectiveRate × task.timeSpent / 3600) : 0
```

---

## UI Component Overview

### Feature Components (`src/components/`)

| Component | Description |
|-----------|-------------|
| `Header` | Top bar with brand, live timer display, total revenue, billable hours, add task button, language switcher, dark mode toggle |
| `KanbanBoard` | DnD context wrapper; renders columns and handles all drag events; add-column inline form |
| `KanbanColumn` | Droppable column; column header with task count, rename/delete dropdown, add task button; scrollable task list |
| `TaskCard` | Draggable card; displays title, client badge, priority badge, timer button, time display, revenue badge, due date; delete via dropdown |
| `TaskDetailPanel` | Framer Motion slide-in panel from right; full task editing: title, description, client, priority, due date, billable toggle, hourly rate override, time estimate, time tracking progress bar; delete task |
| `AddTaskDialog` | Radix Dialog modal; form for creating tasks with title, description, column selector, client, priority, billable, hourly rate, time estimate |
| `NavLink` | Router-aware nav link helper |

### shadcn/ui Primitives (`src/components/ui/`) — 49 components

Key primitives actively used by feature components:

| Primitive | Used By |
|-----------|---------|
| `Button` | All feature components |
| `Input` | TaskDetailPanel, AddTaskDialog, KanbanBoard, KanbanColumn |
| `Textarea` | TaskDetailPanel, AddTaskDialog |
| `Select` + `SelectContent/Item/Trigger/Value` | TaskDetailPanel, AddTaskDialog |
| `Switch` | TaskDetailPanel, AddTaskDialog |
| `Label` | TaskDetailPanel, AddTaskDialog |
| `Dialog` + sub-components | AddTaskDialog |
| `Badge` | TaskCard |
| `DropdownMenu` + sub-components | Header, TaskCard, KanbanColumn |
| `Toaster` / `Sonner` | App.tsx global |
| `TooltipProvider` | App.tsx global |

---

## Testing Strategy

### Unit Tests (Vitest)
- Test files: `src/**/*.{test,spec}.{ts,tsx}`
- Environment: jsdom
- Current coverage: Minimal (1 placeholder test in `src/test/example.test.ts`)
- Priority areas to test: reducer logic in `AppContext`, storage helpers, `useTimer` hook, revenue calculation utilities

### End-to-End Tests (Playwright)
- Browser: Chromium
- Test dir: `tests/e2e/`
- Current coverage: 1 smoke test (page load + title check)
- Support: fixtures, factories (TaskFactory via Faker), helpers, page objects

---

## Design System

### Custom Tailwind Tokens (from `tailwind.config.ts`)

| Token | Purpose |
|-------|---------|
| `revenue` | Revenue/money amounts (green tones) |
| `timer` | Active timer indicator (amber/orange tones) |
| `timer-muted` | Timer background chip |
| `priority.high/medium/low` | Priority badge colors |
| `column.bg` / `column.header` | Kanban column background and header text |
| `task-card` / `task-card-hover` | Task card background states |
| `billable` / `non-billable` | Billing status indicators |

### Custom Animations
- `fade-in` — Element entry (translateY + opacity)
- `slide-in-right` — Right panel entry
- `pulse-gentle` — Timer dot pulse (2s loop)
- `accordion-down/up` — Radix accordion

---

## Deployment

The app is a static SPA — the `dist/` folder from `npm run build` can be served from any static host.

**Current deployment:** Lovable platform (`https://hour-zen-board.lovable.app/`)  
**Deployment method:** Push to the connected git repo; Lovable picks up changes automatically.

**Custom domain:** Can be configured via Lovable Project > Settings > Domains.

**Self-hosting:**
```bash
npm run build          # Output: dist/
# Serve dist/ with any static server (nginx, Vercel, Netlify, etc.)
```

No environment variables are required for production (all data is client-side localStorage).

---

## Key Constraints & Decisions

1. **No backend** — This is a pure client-side app. All data lives in localStorage. Suitable for single-user or demo use. Not suitable for multi-device sync without adding a backend.
2. **TypeScript strict: false** — Do not enable strict mode as a drive-by change; it requires a coordinated migration.
3. **Single timer constraint** — Only one task timer can run at a time (by design). Starting a new timer stops the current one.
4. **`TimeEntry` array is collected but not displayed** — The data model supports granular time records but the current UI only shows aggregated `timeSpent` on tasks.
5. **No server-side API** — `@tanstack/react-query` and `axios`/`fetch` patterns are not currently used for data fetching; React Query is available for future external API integration.
6. **Lovable sync** — The repo is connected to the Lovable platform. Normal git push workflow applies; Lovable auto-deploys.
