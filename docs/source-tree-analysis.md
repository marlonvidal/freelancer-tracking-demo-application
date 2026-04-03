# Source Tree Analysis

**Project:** freelancer-tracking-demo-application  
**Type:** Monolith Web SPA (React + TypeScript + Vite)  
**Generated:** 2026-04-03

---

## Annotated Directory Tree

```
freelancer-tracking-demo-application/     # Project root
├── src/                                  # All application source code
│   ├── main.tsx                          # ★ Entry point — mounts React app to #root
│   ├── App.tsx                           # ★ Root component — global providers & router
│   ├── App.css                           # App-level CSS overrides
│   ├── index.css                         # Global Tailwind base + CSS custom properties (design tokens)
│   ├── vite-env.d.ts                     # Vite ambient types (import.meta.env)
│   │
│   ├── pages/                            # Route-level pages
│   │   ├── Index.tsx                     # ★ "/" — wraps AppProvider + main Kanban layout
│   │   └── NotFound.tsx                  # "*" — 404 catch-all page
│   │
│   ├── components/                       # Feature-specific UI components
│   │   ├── Header.tsx                    # Top bar: brand, active-timer display, revenue stats, controls
│   │   ├── KanbanBoard.tsx               # ★ DnD-kit DndContext wrapper; column + task drag logic
│   │   ├── KanbanColumn.tsx              # Individual Kanban column (droppable, sortable tasks)
│   │   ├── TaskCard.tsx                  # Draggable task card with timer button, revenue badge
│   │   ├── TaskDetailPanel.tsx           # Slide-in panel for editing a task (Framer Motion)
│   │   ├── AddTaskDialog.tsx             # Modal form for creating a new task
│   │   └── NavLink.tsx                   # Utility nav link wrapper (router-aware)
│   │
│   ├── components/ui/                    # shadcn/ui primitive library (49 components)
│   │   ├── button.tsx                    # Button primitive (CVA variants)
│   │   ├── input.tsx, textarea.tsx       # Form controls
│   │   ├── select.tsx                    # Radix Select
│   │   ├── dialog.tsx                    # Radix Dialog (modal)
│   │   ├── switch.tsx                    # Radix Switch (toggle)
│   │   ├── badge.tsx                     # Status / label chips
│   │   ├── dropdown-menu.tsx             # Radix DropdownMenu
│   │   ├── label.tsx                     # Accessible form labels
│   │   ├── chart.tsx                     # Recharts wrapper (available, not yet used in features)
│   │   ├── sidebar.tsx                   # Sidebar layout primitive (available, not yet used)
│   │   └── ... (42 more Radix/shadcn wrappers)
│   │
│   ├── context/                          # React Contexts (global state)
│   │   ├── AppContext.tsx                # ★ Primary domain state — useReducer + Context + persistence
│   │   └── LanguageContext.tsx           # i18n — English / Portuguese translations via Context
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useTimer.ts                   # ★ Active timer: start/stop/toggle, elapsed seconds, formatTime helpers
│   │   ├── use-mobile.tsx                # Breakpoint hook (window width < 768px)
│   │   └── use-toast.ts                  # shadcn toast trigger hook
│   │
│   ├── lib/                              # Shared utilities
│   │   ├── storage.ts                    # ★ localStorage load/save/clear for AppState; default seed data
│   │   └── utils.ts                      # cn() — clsx + tailwind-merge helper
│   │
│   ├── types/                            # Shared TypeScript types
│   │   └── index.ts                      # ★ All domain models: Task, Column, Client, TimeEntry, AppState
│   │
│   └── test/                             # Vitest unit test setup
│       ├── setup.ts                      # Global test setup: jest-dom, matchMedia mock
│       └── example.test.ts               # Placeholder smoke test
│
├── tests/                                # Playwright e2e tests
│   ├── e2e/
│   │   └── example.spec.ts               # Smoke spec: page loads, title matches
│   └── support/
│       ├── fixtures/                     # mergeTests composition (Playwright fixtures)
│       │   └── factories/                # Faker-based data builders (TaskFactory)
│       ├── helpers/                      # Utility helpers (e.g. blockKnownThirdPartyHosts)
│       └── page-objects/                 # Page Object Model (POM) stubs
│
├── public/                               # Static assets served as-is
│   ├── favicon.ico
│   ├── manifest.json                     # PWA web app manifest
│   ├── robots.txt
│   └── placeholder.svg
│
├── docs/                                 # ★ AI-generated project documentation (this folder)
│
├── _bmad-output/                         # BMAD workflow outputs
│   ├── project-context.md                # Critical AI coding rules for this repo
│   └── planning-artifacts/               # PRD, architecture specs (empty — to be populated)
│
├── index.html                            # Vite HTML entry point
├── vite.config.ts                        # Vite config: port 8080, @/ alias, lovable-tagger dev plugin
├── tailwind.config.ts                    # Tailwind theme: custom colors (revenue, timer, priority, column, task-card)
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json  # TypeScript configuration (strict: false)
├── playwright.config.ts                  # Playwright e2e config: Chromium only, port 8080, JUnit reporter
├── vitest.config.ts                      # Vitest unit test config: jsdom, globals
├── eslint.config.js                      # ESLint 9 flat config
├── postcss.config.js                     # PostCSS: Tailwind + autoprefixer
├── components.json                       # shadcn/ui CLI config
├── package.json                          # npm scripts and all dependencies
├── .env.example                          # E2E env vars template (BASE_URL, TEST_ENV)
├── .nvmrc                                # Node version pin
└── .gitignore
```

---

## Critical Entry Points

| File | Role |
|------|------|
| `src/main.tsx` | React DOM mount (`createRoot`) |
| `src/App.tsx` | Global providers + router tree |
| `src/pages/Index.tsx` | Only live route — Kanban app shell |
| `src/context/AppContext.tsx` | All domain state mutations |
| `src/lib/storage.ts` | Persistence + seed data |
| `src/types/index.ts` | Source of truth for all data shapes |

---

## Critical Folders Summary

| Folder | Purpose |
|--------|---------|
| `src/components/` | Feature-specific components (Kanban, Header, dialogs) |
| `src/components/ui/` | 49 shadcn/ui primitives — reuse, don't recreate |
| `src/context/` | Global state (domain + i18n) |
| `src/hooks/` | Reusable logic (timer, mobile breakpoint, toast) |
| `src/lib/` | Low-level utilities (storage, class names) |
| `src/types/` | All shared TypeScript interfaces |
| `tests/e2e/` | Playwright browser tests |
| `src/test/` | Vitest unit tests |
| `docs/` | AI project documentation |
