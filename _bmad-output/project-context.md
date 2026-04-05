---
project_name: 'freelancer-tracking-demo-application'
user_name: 'Marlon'
date: '2026-04-03T18:00:00.000Z'
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - testing_rules
  - quality_rules
  - workflow_rules
  - anti_patterns
  - epic_1_retro_2026_04_03
  - epic_2_retro_2026_04_05
status: 'complete'
rule_count: 81
optimized_for_llm: true
existing_patterns_found: 12
last_updated: '2026-04-05'
retro_source: '_bmad-output/implementation-artifacts/epic-2-retro-2026-04-05.md'
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
- **Playwright** `^1.59.1` — `@playwright/test`; Chromium only; test dir `tests/e2e/`
- **@faker-js/faker** `^10.4.0` — used in test factories only

**Test support structure**

- `tests/support/fixtures/` — Playwright `mergeTests` fixture composition; import from here, not directly from `@playwright/test`
- `tests/support/factories/` — Faker-based data builders (e.g. `TaskFactory`)
- `tests/support/helpers/` — e.g. `blockKnownThirdPartyHosts` network helper
- `tests/support/page-objects/` — POM stubs (available, not yet populated)

**Dev-only**

- **lovable-tagger** `^1.1.13` — enabled in Vite **development** only (`vite.config.ts`); do not rely on it for production behavior.

**Version constraints**

- Prefer **caret ranges** already in `package.json` unless a security or compatibility issue requires pinning; align new deps with React 18 and Vite 5.

---

## Critical Implementation Rules

### Language-Specific Rules

- **TypeScript `strict` is off** (`tsconfig.app.json`: `"strict": false`). Do not assume strict null checks or strict mode; **`noImplicitAny` is off** — explicit typing is still encouraged for public APIs and shared types.
- **Path alias:** import app code with `@/...` → `src/...` (configured in `tsconfig` and Vite).
- **App shell imports:** In `App.tsx` (and similar entry files), **use `@/pages/...` for page imports** — do not mix `./pages/...` with `@/` without an explicit, documented exception in this file. Mixed style causes repeated review noise (Epic 1 retro).
- **Module style:** `"type": "module"` — use ESM `import`/`export`; **`jsx`: `react-jsx`** (no `React` import required for JSX).
- **Imports:** `allowImportingTsExtensions` is true — `.tsx` / `.ts` suffixes in imports are valid where the codebase already uses them (e.g. `App.tsx`).
- **Errors:** no project-wide error-boundary convention is established; for new async flows, handle errors at the call site or with React Query's error handling where applicable.
- **No `process.env` in browser code** — use `import.meta.env` (Vite pattern); `process.env` is only valid in Playwright/Node test context via `.env` file.
- **Timestamps:** store all dates/times as Unix milliseconds (`Date.now()`), not ISO strings or Date objects — matches existing `Task.createdAt`, `Task.dueDate`, `TimeEntry.startTime`.
- **IDs:** always generate entity IDs with `uuidv4()` from `uuid` — never use `Math.random()` or sequential integers.

### Framework-Specific Rules

- **Router:** `BrowserRouter` + `Routes` in `App.tsx`. **Add new routes above** the catch-all `<Route path="*" ... />` so 404s still work.
- **React Query:** a single `QueryClient` is created in `App.tsx` and wrapped in `QueryClientProvider`. New data-fetching should use this client (or add providers inside this tree if needed). **Not yet used for data fetching** (no backend) — use it when/if external API calls are added. Do not wrap individual pages in a new `QueryClientProvider`.
- **Global UI shell:** `TooltipProvider`, `Toaster` (shadcn), and Sonner `Toaster` are mounted in `App.tsx` — reuse them; don't duplicate global toasters on every page.
- **i18n / theme:** `LanguageProvider` wraps the app; all UI strings must use `t.<key>` from `useLanguage()` — never hardcode English (or any language) text in JSX. Add new keys to **both** `en` and `pt` translation objects in `LanguageContext.tsx`.
- **Feature UI:** reusable primitives live under `src/components/ui/` (shadcn-style). Feature-specific components (e.g. Kanban) sit under `src/components/` or `src/pages/` as appropriate.
- **Class names:** use `cn()` from `@/lib/utils` (`clsx` + `tailwind-merge`) for conditional Tailwind classes.
- **App state:** global domain state is a **React reducer + Context** in `src/context/AppContext.tsx` with actions typed as a discriminated union. New global state should follow this pattern unless switching to a library is an explicit product decision.
- **Domain types:** shared models live in `src/types/index.ts` — update types when adding fields; keep storage serialization in sync with `src/lib/storage.ts`.
- **Persistence:** app state is loaded/saved via `lib/storage` (localStorage). **Changing shape** of `AppState` requires careful updates to load/save and default state to avoid breaking existing users' data.
- **Earnings dashboard:** Route `/earnings` uses `EarningsDashboard` with `AppProvider`, `EarningsDashboardStateProvider`, and shared `Header` (Kanban-only props like `onAddTask` omitted on this route). Interim filter UI (Story 1.3) may be replaced in Epic 4; **keep `src/lib/earnings-dashboard-storage.ts` and `EarningsDashboardStateContext` as the persistence contract** unless an architect-approved change adds a migration — no duplicate storage keys.
- **Earnings localStorage:** Key is **`earnings-dashboard-state`** (`EARNINGS_DASHBOARD_STORAGE_KEY`). Corrupt JSON / missing keys are handled defensively in the earnings storage module; follow that pattern for any extension.
- **SPA `document.title`:** If a route sets `document.title`, restore the previous title on unmount so back navigation and other routes do not leak the wrong title (see `EarningsDashboard` pattern).
- **dnd-kit collision detection:** `closestCorners` is used in `KanbanBoard` — if adding new DnD zones, keep this consistent.
- **dnd-kit PointerSensor:** activation distance is `8px` (prevents accidental drag on click); do not lower this.
- **DragOverlay:** must wrap the dragged item's component with reduced opacity/rotation — do not remove; it's required for accessible drag feedback.
- **Single active timer invariant:** only one timer can run at a time. `START_TIMER` action automatically stops any prior timer by accumulating elapsed seconds into `timeSpent` before overwriting `activeTimer`. Never dispatch `START_TIMER` twice without `STOP_TIMER` in between from external code.
- **Revenue formula:** `effectiveRate = task.hourlyRate ?? client.hourlyRate ?? 0`; `revenue = isBillable ? (effectiveRate × timeSpent / 3600) : 0`. Keep this consistent across `AppContext`, `TaskCard`, and `TaskDetailPanel`. For **Epic 2+** calculation work, treat **FR26 (formula parity)** as a non‑negotiable gate — add regression tests before refactoring helpers.
- **Nullish coalescing for rate fields (`??` not `||`):** Rate fields that can legitimately be `0` (e.g. `task.hourlyRate`, `client.hourlyRate`) must use `??`, never `||`. Logical OR treats `0` as falsy and silently falls through to the next default, overriding a valid zero-rate task override with the client rate. This bug existed in `AppContext.getTaskRate` and was fixed in Story 2.1 — do not regress it.
- **Tag revenue split contract (Epic 3):** When distributing task revenue across tags, the formula is `taskRevenue / tags.length` per tag — a strict `1/N` split, not full revenue per tag. Tasks with no tags contribute their revenue to an `"Untagged"` sentinel bucket. Established in Story 2.1 AC3; Story 3.3 display logic must match this exactly — do not re-derive the math.
- **`getTotalRevenue` in `AppContext` is unfiltered:** The Kanban global `getTotalRevenue` does not apply date-range filters. The earnings dashboard correctly filters via `filterTasksForEarnings`. Do not unify or cross-reference these for earnings display logic until Epic 5 alignment work is explicitly planned. Tracked as medium-priority debt in `deferred-work.md`.
- **`TimeEntry` array:** collected in `AppState.timeEntries` but **not yet displayed in UI**. Do not remove it; it's a future feature. When stopping a timer, create a `TimeEntry` record if implementing that feature.

### Testing Rules

- **Runner:** Vitest with **jsdom** (`vitest.config.ts`).
- **Test files:** `src/**/*.{test,spec}.{ts,tsx}`.
- **Setup:** `src/test/setup.ts` imports `@testing-library/jest-dom` and mocks `window.matchMedia`. Add other global mocks there if multiple tests need them — not inline in individual test files.
- **Globals:** `vitest/globals` is in `tsconfig.app.json` types — `describe` / `it` / `expect` need no import if using global config (match existing tests).
- Prefer **Testing Library** queries aligned with accessibility; colocate tests near components or under a clear test naming pattern already in the repo.
- **E2E test runner:** Playwright with `CI=1` env var enables 2 workers + 2 retries; omit `CI` locally.
- **E2E base URL:** defaults to `http://localhost:8080`; override with `BASE_URL` env var. Dev server auto-starts via `webServer` config unless already running (`reuseExistingServer: true` locally).
- **Fixture pattern:** import from `tests/support/fixtures` (not directly from `@playwright/test`) to get merged fixtures including `taskFactory`.
- **Network helpers:** call `blockKnownThirdPartyHosts(page)` before `page.goto()` in specs to prevent flakiness from external requests.
- **Selectors:** prefer `getByRole` (accessible roles) and `data-testid` attributes — not CSS selectors or fragile text matching.
- **E2E + i18n:** The app reads locale from **`localStorage` key `app-language`** (`en` | `pt`). Before `page.goto`, use `addInitScript` (or equivalent) to set `app-language` to the locale your assertions expect. Prefer stable **`data-testid`** targets for bilingual surfaces so tests do not depend on a single language string.
- **E2E artifacts:** traces, screenshots, and videos retained on failure in `test-results/`; HTML report at `playwright-report/`; JUnit at `test-results/junit.xml`.

**E2E Standing Conventions (codified from Epic 2 retro — Action B1):**

- **`--workers=1` for local E2E runs:** Always run Playwright locally with `--workers=1` (e.g. `npx playwright test --workers=1`). Default parallel execution causes intermittent timeouts, especially for timing-sensitive rendering tests. CI uses `workers: 2` via the `CI` env var in `playwright.config.ts` — do not change the config file to force serial globally.
- **`{ exact: true }` for text assertions:** Always pass `{ exact: true }` to `getByText()` when the target string could appear as a substring of another visible element's text (e.g. `"Billable Revenue"` matches inside `"Non-Billable Revenue"` in strict mode). Omitting it causes Playwright strict-mode errors.
- **Explicit app-state seeding for count/empty-state tests:** The app ships with **5 sample tasks** by default (stored in `localStorage` key `"freelancer-kanban-data"`). Any E2E test asserting on task count, metric totals, or an empty state **must** seed explicit data via `page.addInitScript()` — never rely on app defaults.

**recharts / SVG Testing Patterns (Action B2 — finalize before Story 3.1):**

- **recharts SVG Playwright patterns:** SVG `<text>` elements are not reached by standard `getByText()` — use `locator('svg text').filter(...)` or scope queries to a `data-testid` chart container. Tooltip hover assertions: call `hover()` on the chart area, then await the tooltip container's visibility, not its text content directly. Legend click interactions drive recharts internal state — assert on resulting data visibility, not on the legend element itself. Document proven patterns in this section as each Epic 3 story validates them.

### Code Quality & Style Rules

- **ESLint:** flat config; **`@typescript-eslint/no-unused-vars` is off** — unused variables are not reported; still remove dead code when editing.
- **react-refresh:** `only-export-components` is **warn** with `allowConstantExport: true` — avoid exporting non-components from component files without reason.
- **Formatting:** no Prettier config was found in discovery — follow existing file style (2-space indent, semicolons as in neighboring files).
- **Naming:** React components **PascalCase**; hooks **`use*`**; keep `components/ui` names aligned with shadcn conventions.
- **Documentation:** README is Lovable-oriented; **do not** add large unsolicited markdown docs unless the user asks. Inline comments only where behavior is non-obvious.
- **Deferred cleanup (track explicitly):** Epic 1 deferred variable shadowing of `t` in `Header` and optional lazy-loading of revenue aggregates when stats are hidden — address when that file or earnings summaries are next in scope; do not ignore indefinitely.
- **shadcn/ui primitives:** 49 components exist in `src/components/ui/` — check this folder before creating any new UI primitive. Many (e.g. `Chart`, `Sidebar`, `Drawer`, `Sheet`, `Calendar`) are installed but not yet used in features; prefer them over introducing new UI libraries.
- **Component file exports:** each feature component file exports one default component; avoid mixing multiple exported components in one file (react-refresh `only-export-components` warn rule).

### Development Workflow Rules

- **Scripts:** `npm run dev` (Vite), `npm run build`, `npm run preview`, `npm run lint`, `npm test` / `npm run test:watch`, `npm run test:e2e`.
- **Dev server:** Vite `server.host` is `"::"`, **port `8080`**, HMR **overlay disabled** — expect that when documenting or debugging locally.
- **E2E environment setup:** copy `.env.example` → `.env` before running e2e tests; install Playwright browsers with `npx playwright install chromium` (first time only).
- **localStorage keys:** Kanban app state under `"freelancer-kanban-data"`; earnings dashboard filter/chart state under `"earnings-dashboard-state"`. Use **`clearState()`** from `src/lib/storage.ts` (or DevTools) to reset user-visible persisted data during development/testing — `clearState()` must clear **every** user-visible persistence key (see implementation in `storage.ts`).
- **Planning artifacts:** `_bmad-output/planning-artifacts/architecture.md` may be absent; if architecture is added later, keep **this** `project-context.md` in sync with stack and boundaries.
- **docs/ folder:** `docs/` contains AI-generated project documentation (`index.md`, `architecture.md`, etc.) — do not delete or move these; update them when significant architectural changes are made.
- **Repo origin:** project README references **Lovable** — treat remote sync as external; follow normal git practices for branches and PRs unless team rules say otherwise (no repo-specific branch convention was found in code).

### Critical Don't-Miss Rules

- **Do not** turn on TypeScript `strict` or tighten compiler options in a drive-by change — that is a repo-wide migration.
- **Do not** add routes **below** the `*` route in `App.tsx`.
- **Do not** persist new fields without updating **`AppState`**, **reducer actions**, **`loadState`/`saveState`**, and **migration/default** handling where needed.
- **Do not** introduce a new **`localStorage` key** for user-visible state without updating **`clearState()`** in `src/lib/storage.ts` so “clear app data” resets it (Epic 1.3 / FR42 pattern).
- **Do not** import server-only APIs — this is a **Vite SPA**; any "backend" is client-side or external services you explicitly add.
- **Dnd-kit:** changing column/task order semantics must stay consistent with **reducer** and **Kanban** components to avoid desynced UI and state.
- **Environment:** `import.meta.env` is the Vite pattern for env vars — not `process.env` in browser code unless wrapped by a defined convention.
- **Do not** add text to the UI without adding the corresponding key to **both** `en` and `pt` translation objects in `LanguageContext.tsx`.
- **Do not** create new UI primitives (buttons, inputs, selects, dialogs, etc.) from scratch — check `src/components/ui/` first; shadcn components for those patterns already exist.
- **Do not** add a second `QueryClientProvider` — one already exists at the root of `App.tsx`.
- **Do not** lower the dnd-kit `PointerSensor` activation distance below `8px` — this prevents task clicks from being interpreted as drags.
- **Do not** use `||` for rate fallback chains where `0` is a valid override — use `??`. `task.hourlyRate || client.hourlyRate` silently ignores a deliberately set zero task rate (Epic 2 regression risk).
- **Do not** write count-sensitive or empty-state E2E tests without seeding explicit `localStorage` app data via `addInitScript` — the app default state contains 5 sample tasks.
- **Do not** use `getByText()` without `{ exact: true }` when the target label text could be a substring of a longer label visible in the same view.

---

## Usage Guidelines

**For AI Agents**

- Read this file before implementing features or refactors in this repository.
- Prefer matching existing patterns in `App.tsx`, `AppContext`, `components/ui`, and `lib/storage` over introducing parallel conventions.
- When in doubt on typing strictness, match surrounding files and extend `src/types` explicitly for shared shapes.
- For full project context, see `docs/index.md` → links to architecture, component inventory, and development guide.

**For Humans**

- Keep this file **short and specific**; remove rules that become universal knowledge or duplicate tooling defaults.
- Update when major dependencies or state/persistence patterns change.
- Optional: link from `README.md` so contributors know the file exists.

Last Updated: 2026-04-05  
Aligned with: Epic 2 retrospective (`epic-2-retro-2026-04-05.md`) — E2E standing conventions (`--workers=1`, `{ exact: true }`, explicit state seeding), recharts/SVG Playwright patterns, `??` vs `||` for zero-rate fields, tag revenue `1/N` split contract, `getTotalRevenue` date-filter debt.  
Previously aligned with: Epic 1 retrospective (`epic-1-retro-2026-04-03.md`) — import consistency, E2E i18n seeding, `clearState` / earnings persistence contract, FR26 bar, Epic 4 UI handoff notes.
