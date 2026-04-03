# Project Overview

**Project:** FreelanceFlow  
**Repository:** freelancer-tracking-demo-application  
**Generated:** 2026-04-03

---

## What Is This?

FreelanceFlow is a **freelancer task and time tracking tool** built as a browser-only single-page application. It gives independent developers and contractors a Kanban board to manage their work, track billable hours in real time, and calculate revenue per task and client — all without a backend or account setup.

**Live app:** https://hour-zen-board.lovable.app/  
**Scaffolded with:** [Lovable](https://lovable.dev)

---

## Core Capabilities

| Capability | Description |
|-----------|-------------|
| **Kanban board** | Drag-and-drop tasks across customizable columns (Backlog, In Progress, Review, Done + add/rename/delete columns) |
| **Task management** | Create, edit, and delete tasks with title, description, priority (high/medium/low), due date, and tags |
| **Client tracking** | Associate tasks with named clients, each with a default hourly billing rate and color |
| **Time tracking** | One-click start/stop timer per task; elapsed time accumulates in real time; manual time addition via detail panel |
| **Revenue calculation** | Per-task billable flag + hourly rate (inherits from client or overridden per task); live revenue displayed on cards and in header |
| **Dark/light mode** | System preference detected on first load; toggleable in header |
| **Bilingual UI** | Full English and Portuguese translation via language switcher |
| **Offline/persistent** | All data stored in browser `localStorage` — survives page refresh; no login required |

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript 5 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| State | React Context + useReducer |
| Persistence | Browser localStorage |
| Routing | React Router DOM v6 |
| Drag & Drop | dnd-kit |
| Animation | Framer Motion |
| Unit testing | Vitest + Testing Library |
| E2E testing | Playwright |

---

## Architecture Classification

| Attribute | Value |
|-----------|-------|
| Repository type | Monolith |
| Architecture pattern | Component-based + Context/Reducer |
| Backend | None (client-side only) |
| Database | Browser localStorage |
| API | None |
| Deployment | Static SPA (Lovable platform / any static host) |

---

## Project Structure

```
freelancer-tracking-demo-application/
├── src/                    # All application source
│   ├── components/         # Feature components (Header, KanbanBoard, etc.)
│   ├── components/ui/      # 49 shadcn/ui primitives
│   ├── context/            # Global state (AppContext, LanguageContext)
│   ├── hooks/              # useTimer, use-mobile, use-toast
│   ├── lib/                # storage.ts, utils.ts
│   ├── pages/              # Route components (Index, NotFound)
│   └── types/              # Shared TypeScript interfaces
├── tests/                  # Playwright e2e tests
├── docs/                   # AI-generated project documentation (this folder)
└── _bmad-output/           # BMAD workflow outputs
```

---

## Documentation Links

- [Architecture](./architecture.md) — Full technical deep-dive
- [Source Tree Analysis](./source-tree-analysis.md) — Annotated directory tree
- [Component Inventory](./component-inventory.md) — All UI components catalogued
- [Development Guide](./development-guide.md) — Setup, commands, patterns

---

## Existing Documentation

- [README.md](../README.md) — Lovable project info and basic setup
- [tests/README.md](../tests/README.md) — Playwright e2e testing guide
- [_bmad-output/project-context.md](../_bmad-output/project-context.md) — Critical AI coding rules

---

## Getting Started

```bash
# Install and run in 3 commands
npm install
npm run dev
# Open http://localhost:8080
```

See [Development Guide](./development-guide.md) for full setup instructions.
