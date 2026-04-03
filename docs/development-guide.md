# Development Guide

**Project:** FreelanceFlow (freelancer-tracking-demo-application)  
**Generated:** 2026-04-03

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 22 (see `.nvmrc`) | Use `nvm use` to activate |
| npm | Bundled with Node | Lock file is `package-lock.json` |
| Git | Any recent | Standard git workflow |

> **Optional:** `bun` lock files are present (`bun.lock`, `bun.lockb`) but the project scripts use `npm`. Stick to `npm` to match the lock file.

---

## Initial Setup

```bash
# 1. Clone repository
git clone <YOUR_GIT_URL>
cd freelancer-tracking-demo-application

# 2. Activate correct Node version (requires nvm)
nvm use

# 3. Install dependencies
npm install

# 4. (Optional) Install Playwright browsers for e2e tests
npx playwright install chromium
```

---

## Environment Variables

No `.env` file is required for the development server — the app is a client-side SPA with no external API calls.

For e2e tests, copy the example file:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `BASE_URL` | `http://localhost:8080` | Playwright target URL |
| `TEST_ENV` | `local` | Test environment label |
| `API_URL` | (empty) | External API base URL (unused currently) |

---

## Development Server

```bash
npm run dev
```

- Starts Vite on **port 8080** (`host: "::"` — binds to all interfaces)
- HMR overlay is **disabled** (`hmr.overlay: false`)
- `lovable-tagger` component tagging is active in development mode only
- Open: `http://localhost:8080`

---

## Build

```bash
# Production build
npm run build

# Development build (unminified, sourcemaps)
npm run build:dev

# Preview production build locally
npm run preview
```

Output goes to `dist/` (standard Vite default).

---

## Linting

```bash
npm run lint
```

Uses ESLint 9 flat config (`eslint.config.js`):
- `typescript-eslint` — TypeScript rules
- `eslint-plugin-react-hooks` — hooks exhaustive-deps
- `eslint-plugin-react-refresh` — HMR export rules
- `@typescript-eslint/no-unused-vars` is **off** — unused vars are not reported

---

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch
```

- Runner: **Vitest** with **jsdom** environment
- Test files: `src/**/*.{test,spec}.{ts,tsx}`
- Global setup: `src/test/setup.ts` (jest-dom matchers + `window.matchMedia` mock)
- Global test globals (`describe`, `it`, `expect`) need no import

### End-to-End Tests (Playwright)

```bash
# Run e2e tests (starts dev server automatically)
npm run test:e2e

# Playwright interactive UI mode
npm run test:e2e:ui

# Headed browser (visible window)
npm run test:e2e:headed
```

- Browser: **Chromium only** (see `playwright.config.ts`)
- Test dir: `tests/e2e/` — spec files named `*.spec.ts`
- Dev server auto-starts via `webServer` config if not already running
- Artifacts on failure: traces, screenshots, videos in `test-results/`
- Reports: HTML (`playwright-report/`) + JUnit (`test-results/junit.xml`)

**Test support structure:**
```
tests/support/
├── fixtures/          # Playwright fixture composition (mergeTests pattern)
│   └── factories/     # Faker-based builders (e.g. TaskFactory)
├── helpers/           # Utility functions (e.g. blockKnownThirdPartyHosts)
└── page-objects/      # Page Object Model modules
```

---

## Key Development Patterns

### Path Aliases

All app imports use `@/` → `src/`:
```ts
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
```

### Styling

Use the `cn()` utility for conditional Tailwind classes:
```ts
import { cn } from '@/lib/utils';

className={cn('base-class', isActive && 'active-class', variant === 'ghost' && 'ghost-class')}
```

### Adding New Domain State

When adding fields to global state, update **all four** of these in order:
1. `src/types/index.ts` — add the field to the interface
2. `src/context/AppContext.tsx` — add reducer action(s)
3. `src/lib/storage.ts` — update `getDefaultState()` with default value
4. Validate that `loadState()` handles missing fields from old saved data gracefully

### Adding New Routes

Add routes **above** the catch-all `*` route in `src/App.tsx`:
```tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/new-page" element={<NewPage />} />  {/* Add here */}
  <Route path="*" element={<NotFound />} />           {/* Keep last */}
</Routes>
```

### Using Existing UI Components

Primitive components are in `src/components/ui/` — use them directly:
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
```

---

## Common Tasks

| Task | Command / Approach |
|------|--------------------|
| Start dev server | `npm run dev` |
| Run unit tests | `npm test` |
| Run e2e tests | `npm run test:e2e` |
| Lint code | `npm run lint` |
| Build for production | `npm run build` |
| Add a shadcn component | `npx shadcn@latest add <component>` (uses `components.json`) |
| Clear persisted app data | Call `clearState()` from `src/lib/storage.ts` or clear localStorage key `freelancer-kanban-data` in browser DevTools |
| Check active timer state | `AppState.activeTimer` in AppContext (taskId + startTime) |

---

## CI Configuration

The project does not yet have a CI pipeline file (`.github/workflows/`, etc.). When adding CI:

- Use `CI=1` env var — Playwright config responds with 2 workers and 2 retries
- Run `npm test` for unit tests
- Run `npm run test:e2e` for e2e (ensure Playwright browsers are installed: `npx playwright install chromium`)
- Publish `test-results/junit.xml` for JUnit-compatible reporters
- `npm run lint` for linting gate
