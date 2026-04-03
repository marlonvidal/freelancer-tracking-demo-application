# Project Documentation Index

**Project:** FreelanceFlow (freelancer-tracking-demo-application)  
**Generated:** 2026-04-03  
**Scan level:** Deep  
**AI entry point:** This file — start here when working with AI on this project

---

## Project Overview

- **Type:** Monolith — Single-page web application (React SPA)
- **Primary Language:** TypeScript
- **Architecture:** Component-based + Context/Reducer + localStorage persistence
- **Live app:** https://hour-zen-board.lovable.app/

---

## Quick Reference

- **Tech Stack:** React 18, TypeScript 5, Vite 5, Tailwind CSS 3, shadcn/ui, dnd-kit, Framer Motion
- **Entry Point:** `src/main.tsx` → `src/App.tsx` → `src/pages/Index.tsx`
- **Global State:** `src/context/AppContext.tsx` (useReducer + Context)
- **Persistence:** `src/lib/storage.ts` (localStorage key: `freelancer-kanban-data`)
- **Types:** `src/types/index.ts` — all domain models
- **Dev server:** `npm run dev` → http://localhost:8080

---

## Generated Documentation

| Document | Description |
|----------|-------------|
| [Project Overview](./project-overview.md) | What this project is, capabilities, tech stack summary |
| [Architecture](./architecture.md) | Full technical deep-dive: component hierarchy, state management, data models, DnD, timer, i18n, deployment |
| [Source Tree Analysis](./source-tree-analysis.md) | Annotated directory tree with entry points and folder purposes |
| [Component Inventory](./component-inventory.md) | All 56 components catalogued: 7 feature + 49 shadcn/ui primitives + 3 hooks |
| [Development Guide](./development-guide.md) | Setup, env vars, commands, testing, common tasks, key patterns |

---

## Existing Documentation

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Lovable project info, basic setup steps, technology list |
| [tests/README.md](../tests/README.md) | Playwright e2e testing guide: config, structure, practices, CI |
| [_bmad-output/project-context.md](../_bmad-output/project-context.md) | **Critical AI coding rules** — read before implementing features |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev

# Run unit tests (Vitest)
npm test

# Run e2e tests (Playwright — needs Chromium installed)
npm run test:e2e
```

First-time Playwright setup:
```bash
npx playwright install chromium
```

---

## For AI Agents

When working on this codebase:

1. **Read first:** [`_bmad-output/project-context.md`](../_bmad-output/project-context.md) — contains critical implementation rules
2. **For new features:** Reference [`architecture.md`](./architecture.md) for state patterns, component hierarchy, and domain model
3. **For UI work:** Reference [`component-inventory.md`](./component-inventory.md) — use existing shadcn/ui primitives from `src/components/ui/`
4. **For navigation/routing:** Add routes above the `*` catch-all in `src/App.tsx`
5. **For state changes:** Update `src/types/index.ts` → `AppContext.tsx` reducer → `src/lib/storage.ts` default state — in that order
6. **Never** enable TypeScript `strict` mode as a drive-by change
7. **Never** add routes below the `*` route
8. **No backend** — this is a pure client-side SPA; no server-side code
