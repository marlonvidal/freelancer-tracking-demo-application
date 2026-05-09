# AGENTS.md

## Cursor Cloud specific instructions

### Overview

FreelanceFlow is a single-page React + TypeScript app (Vite + shadcn/ui + Tailwind CSS). It is a client-side Kanban board with time-tracking for freelancers. All data is stored in `localStorage` — there is no backend, database, or API.

### Available commands

See `package.json` scripts for the full list. Key commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server on port **8080** |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (run once) |
| `npm run test:watch` | Vitest (watch mode) |

### Caveats

- The dev server binds to `::` (all interfaces) on port **8080**. No environment variables are required.
- ESLint has 3 pre-existing errors and 9 warnings in the codebase (shadcn/ui generated files and `tailwind.config.ts`). These are not introduced by agent changes.
- Tests use `jsdom` environment with a setup file at `src/test/setup.ts`.
- Path alias `@` maps to `./src` (configured in `vite.config.ts`, `vitest.config.ts`, and `tsconfig.json`).
