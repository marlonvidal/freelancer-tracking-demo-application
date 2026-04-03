# End-to-end tests (Playwright)

This project uses **Playwright** for browser automation. Unit tests remain on **Vitest** (`npm test`).

## Prerequisites

- Node.js **22** (see repo `.nvmrc`)
- Dependencies: `npm install`
- Browsers (first time): `npx playwright install chromium`

## Configuration

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Timeouts, `baseURL`, reporters, `webServer` (starts `npm run dev`) |
| `.env.example` | `BASE_URL`, `TEST_ENV`, `API_URL` placeholders |

Default `BASE_URL` is `http://localhost:8080` (matches Vite in this repo).

## Running tests

```bash
npm run test:e2e
```

Other scripts:

- `npm run test:e2e:ui` — Playwright UI mode
- `npm run test:e2e:headed` — headed browser

`playwright.config.ts` starts the dev server automatically unless one is already running (`reuseExistingServer` locally).

## Layout

```
tests/
├── e2e/                 # Spec files (*.spec.ts)
└── support/
    ├── fixtures/        # mergeTests composition; `index.ts` is the import surface
    │   └── factories/   # Faker-based builders (e.g. TaskFactory)
    ├── helpers/         # e.g. network routing before navigation
    └── page-objects/    # Optional Screenplay / POM modules
```

## Practices

1. **Selectors:** Prefer accessible roles (`getByRole`) and stable `data-testid` where you add hooks in the app.
2. **Given / When / Then:** Keep steps readable in specs; put reusable setup in fixtures or helpers.
3. **Network:** Register `page.route` **before** `page.goto` when stubbing APIs.
4. **Artifacts:** Traces, screenshots, and videos are retained on failure (see config).

## Optional: `@seontechnologies/playwright-utils`

TEA config has `tea_use_playwright_utils: true`. You may add that package later and merge its fixtures into `tests/support/fixtures/index.ts` (see BMAD knowledge `fixtures-composition.md`).

## CI

Point CI at `npm run test:e2e` with `CI=1` (retries and workers follow `playwright.config.ts`). Publish `test-results/junit.xml` if your pipeline consumes JUnit.

## References

- [Playwright docs](https://playwright.dev/docs/intro)
- BMAD skill: `bmad-testarch-framework` (workflow + `resources/knowledge/`)
