---
project_name: 'freelancer-tracking-demo-application'
user_name: 'Marlon'
date: '2026-04-03T12:00:00.000Z'
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - testing_rules
  - quality_rules
  - workflow_rules
  - anti_patterns
status: 'complete'
rule_count: 38
optimized_for_llm: true
existing_patterns_found: 12
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Build & runtime**

- **Vite** `^5.4.19` — `@vitejs/plugin-react-swc` `^3.11.0`
- **React** `^18.3.1` / **react-dom** `^18.3.1`
- **TypeScript** `^5.8.3`
- **Node** — use **npm** (see `package-lock.json` if present)

**Routing & data**

- **react-router-dom** `^6.30.1`
- **@tanstack/react-query** `^5.83.0`

**UI & styling**

- **Tailwind CSS** `^3.4.17`, **PostCSS** `^8.5.6`, **autoprefixer** `^10.4.21`
- **Radix UI** primitives (see `package.json` `@radix-ui/*`)
- **class-variance-authority** `^0.7.1`, **clsx** `^2.1.1`, **tailwind-merge** `^2.6.0`, **tailwindcss-animate** `^1.0.7`
- **lucide-react** `^0.462.0`

**Forms & validation**

- **react-hook-form** `^7.61.1`, **@hookform/resolvers** `^3.10.0`, **zod** `^3.25.76`

**Drag-and-drop (Kanban)**

- **@dnd-kit/core** `^6.3.1`, **@dnd-kit/sortable** `^10.0.0`, **@dnd-kit/utilities** `^3.2.2`

**Other runtime libs** (use existing patterns when touching these areas)

- **uuid** `^13.0.0`, **date-fns** `^3.6.0`, **framer-motion** `^12.28.1`, **recharts** `^2.15.4`, **sonner** `^1.7.4`, **next-themes** `^0.3.0`, **vaul** `^0.9.9`, **cmdk** `^1.1.1`, **embla-carousel-react** `^8.6.0`, **input-otp** `^1.4.2`, **react-day-picker** `^8.10.1`, **react-resizable-panels** `^2.1.9`

**Tooling**

- **ESLint** `^9.32.0` (flat config: `eslint.config.js`), **typescript-eslint** `^8.38.0`, **eslint-plugin-react-hooks** `^5.2.0`, **eslint-plugin-react-refresh** `^0.4.20`
- **Vitest** `^3.2.4`, **jsdom** `^20.0.3`, **@testing-library/react** `^16.0.0`, **@testing-library/jest-dom** `^6.6.0`

**Dev-only**

- **lovable-tagger** `^1.1.13` — enabled in Vite **development** only (`vite.config.ts`); do not rely on it for production behavior.

**Version constraints**

- Prefer **caret ranges** already in `package.json` unless a security or compatibility issue requires pinning; align new deps with React 18 and Vite 5.

---

## Critical Implementation Rules

### Language-Specific Rules

- **TypeScript `strict` is off** (`tsconfig.app.json`: `"strict": false`). Do not assume strict null checks or strict mode; **`noImplicitAny` is off** — explicit typing is still encouraged for public APIs and shared types.
- **Path alias:** import app code with `@/...` → `src/...` (configured in `tsconfig` and Vite).
- **Module style:** `"type": "module"` — use ESM `import`/`export`; **`jsx`: `react-jsx`** (no `React` import required for JSX).
- **Imports:** `allowImportingTsExtensions` is true — `.tsx` / `.ts` suffixes in imports are valid where the codebase already uses them (e.g. `App.tsx`).
- **Errors:** no project-wide error-boundary convention is established; for new async flows, handle errors at the call site or with React Query’s error handling where applicable.

### Framework-Specific Rules

- **Router:** `BrowserRouter` + `Routes` in `App.tsx`. **Add new routes above** the catch-all `<Route path="*" ... />` so 404s still work.
- **React Query:** a single `QueryClient` is created in `App.tsx` and wrapped in `QueryClientProvider`. New data-fetching should use this client (or add providers inside this tree if needed).
- **Global UI shell:** `TooltipProvider`, `Toaster` (shadcn), and Sonner `Toaster` are mounted in `App.tsx` — reuse them; don’t duplicate global toasters on every page.
- **i18n / theme:** `LanguageProvider` wraps the app; respect existing context for language. Dark mode and theming use patterns already in context/storage — extend consistently.
- **Feature UI:** reusable primitives live under `src/components/ui/` (shadcn-style). Feature-specific components (e.g. Kanban) sit under `src/components/` or `src/pages/` as appropriate.
- **Class names:** use `cn()` from `@/lib/utils` (`clsx` + `tailwind-merge`) for conditional Tailwind classes.
- **App state:** global domain state is a **React reducer + Context** in `src/context/AppContext.tsx` with actions typed as a discriminated union. New global state should follow this pattern unless switching to a library is an explicit product decision.
- **Domain types:** shared models live in `src/types/index.ts` — update types when adding fields; keep storage serialization in sync with `src/lib/storage.ts`.
- **Persistence:** app state is loaded/saved via `lib/storage` (localStorage). **Changing shape** of `AppState` requires careful updates to load/save and default state to avoid breaking existing users’ data.

### Testing Rules

- **Runner:** Vitest with **jsdom** (`vitest.config.ts`).
- **Test files:** `src/**/*.{test,spec}.{ts,tsx}`.
- **Setup:** `src/test/setup.ts` imports `@testing-library/jest-dom` and mocks `window.matchMedia`. Add other global mocks there if multiple tests need them.
- **Globals:** `vitest/globals` is in `tsconfig.app.json` types — `describe` / `it` / `expect` need no import if using global config (match existing tests).
- Prefer **Testing Library** queries aligned with accessibility; colocate tests near components or under a clear test naming pattern already in the repo.

### Code Quality & Style Rules

- **ESLint:** flat config; **`@typescript-eslint/no-unused-vars` is off** — unused variables are not reported; still remove dead code when editing.
- **react-refresh:** `only-export-components` is **warn** with `allowConstantExport: true` — avoid exporting non-components from component files without reason.
- **Formatting:** no Prettier config was found in discovery — follow existing file style (2-space indent, semicolons as in neighboring files).
- **Naming:** React components **PascalCase**; hooks **`use*`**; keep `components/ui` names aligned with shadcn conventions.
- **Documentation:** README is Lovable-oriented; **do not** add large unsolicited markdown docs unless the user asks. Inline comments only where behavior is non-obvious.

### Development Workflow Rules

- **Scripts:** `npm run dev` (Vite), `npm run build`, `npm run preview`, `npm run lint`, `npm test` / `npm run test:watch`.
- **Dev server:** Vite `server.host` is `"::"`, **port `8080`**, HMR **overlay disabled** — expect that when documenting or debugging locally.
- **Planning artifacts:** `_bmad-output/planning-artifacts/architecture.md` may be absent; if architecture is added later, keep **this** `project-context.md` in sync with stack and boundaries.
- **Repo origin:** project README references **Lovable** — treat remote sync as external; follow normal git practices for branches and PRs unless team rules say otherwise (no repo-specific branch convention was found in code).

### Critical Don't-Miss Rules

- **Do not** turn on TypeScript `strict` or tighten compiler options in a drive-by change — that is a repo-wide migration.
- **Do not** add routes **below** the `*` route in `App.tsx`.
- **Do not** persist new fields without updating **`AppState`**, **reducer actions**, **`loadState`/`saveState`**, and **migration/default** handling where needed.
- **Do not** import server-only APIs — this is a **Vite SPA**; any “backend” is client-side or external services you explicitly add.
- **Dnd-kit:** changing column/task order semantics must stay consistent with **reducer** and **Kanban** components to avoid desynced UI and state.
- **Environment:** `import.meta.env` is the Vite pattern for env vars — not `process.env` in browser code unless wrapped by a defined convention.

---

## Usage Guidelines

**For AI Agents**

- Read this file before implementing features or refactors in this repository.
- Prefer matching existing patterns in `App.tsx`, `AppContext`, `components/ui`, and `lib/storage` over introducing parallel conventions.
- When in doubt on typing strictness, match surrounding files and extend `src/types` explicitly for shared shapes.

**For Humans**

- Keep this file **short and specific**; remove rules that become universal knowledge or duplicate tooling defaults.
- Update when major dependencies or state/persistence patterns change.
- Optional: link from `README.md` so contributors know the file exists.

Last Updated: 2026-04-03
