---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests', 'step-03c-aggregate', 'step-04-validate-and-summarize']
lastStep: 'step-04-validate-and-summarize'
lastSaved: '2026-04-06'
story: '6-1-implement-i18n-translations-for-dashboard'
inputDocuments:
  - _bmad-output/implementation-artifacts/6-1-implement-i18n-translations-for-dashboard.md
  - src/lib/utils.ts
  - src/lib/utils.test.ts
  - src/components/DateRangeFilter.tsx
  - src/components/DateRangeFilter.test.tsx
  - src/pages/EarningsDashboard.tsx
  - src/pages/EarningsDashboard.test.tsx
  - tests/e2e/story-6-1-implement-i18n-translations-for-dashboard-atdd.spec.ts
---

# Test Automation Expansion — Story 6.1: i18n Translations for Dashboard

**Generated:** 2026-04-06  
**Story:** `6-1-implement-i18n-translations-for-dashboard`  
**Mode:** BMad-Integrated · Sequential  
**Stack:** frontend (Vitest + Playwright)

---

## Step 1: Preflight & Context

### Framework Verification

| Tool | Config | Status |
|------|--------|--------|
| Vitest (unit) | `vite.config.ts` | ✅ Operational |
| Playwright (E2E) | `playwright.config.ts` | ✅ Operational |
| @testing-library/react | `package.json` | ✅ Operational |

**Detected stack:** `frontend`  
**Execution mode:** `sequential`

### Baseline (pre-automation)

| Suite | Count | Status |
|-------|-------|--------|
| Vitest unit tests | 254 | All passing |
| Playwright E2E tests | 147 | All passing |

---

## Step 2: Identify Automation Targets

### Story 6.1 — Implementation Scope

Files modified by the story:
- `src/lib/utils.ts` — `formatCurrency(value, language?)` optional locale param
- `src/components/DateRangeFilter.tsx` — `formatDisplayRange` locale-aware date format
- `src/components/CustomerRevenueChart.tsx` — passes `language` to `formatCurrency` in tooltip
- `src/components/ProjectRevenueChart.tsx` — same pattern
- `src/components/TagRevenueChart.tsx` — same pattern
- `src/pages/EarningsDashboard.tsx` — metric cards pass `language` to `formatCurrency`
- `src/components/Header.tsx` — `aria-label="Globe"` added to language toggle button
- `tests/e2e/story-6-1-...-atdd.spec.ts` — ATDD acceptance spec (6 tests)

### Coverage Gap Analysis

| Feature | AC | Gap | Priority |
|---|---|---|---|
| `formatCurrency(v, 'pt')` → pt-BR format | AC4/FR31 | Not unit-tested | P0 |
| `formatCurrency(v, 'en')` explicit | AC4/FR31 | Not unit-tested | P1 |
| `formatCurrency(v)` backward compat guarantee | AC4/FR31 | Only implicitly tested | P2 |
| `DateRangeFilter` EN date format "MMM d, yyyy" (precise) | AC3/FR30 | Only year checked | P1 |
| `DateRangeFilter` PT date format "DD/MM/YYYY" | AC3/FR30 | Only E2E; no component test | P1 |
| EarningsDashboard metric cards pt-BR currency value | AC4/FR31 | Labels tested, values not | P1 |
| Chart tooltip currency format (via component render) | AC4/FR31 | E2E + chart library complexity | Deferred to E2E |

### Test Levels Selected

| Level | Rationale |
|-------|-----------|
| **Unit** | `formatCurrency` is pure — ideal for unit tests covering EN/PT locale output, edge cases, backward compat |
| **Component** | `DateRangeFilter` already has a component test file; date format logic (FR30) is best tested at component level |
| **Integration** | `EarningsDashboard` test exercises full locale path including `useLanguage()` context and metric cards |
| **E2E (existing)** | ATDD spec already covers all 6 ACs; chart tooltip currency testing is best left to E2E |

---

## Step 3: Test Generation

### Execution Mode

```
⚙️ Execution Mode Resolution:
- Requested: sequential
- Probe Enabled: false
- Resolved: sequential
```

### Tests Generated

#### `src/lib/utils.test.ts` — New describe block added

**`Story 6.1 — formatCurrency locale-aware (AC4/FR31)`** — 7 new unit tests:

| Test | Priority | AC |
|------|----------|----|
| `formatCurrency('pt')` produces pt-BR format (1.234,56 pattern) | P0 | FR31 |
| `formatCurrency('pt')` uses USD currency marker (US$) | P0 | FR31 |
| `formatCurrency('en')` produces same output as en-US default | P1 | FR31 |
| `formatCurrency('pt')` formats zero with comma decimal | P1 | FR31 |
| `formatCurrency('pt')` formats negative amounts | P1 | FR31 |
| `formatCurrency()` no-param still defaults to en-US (backward compat) | P2 | FR31 |
| `formatCurrency('pt')` large amounts use period as thousands separator | P2 | FR31 |

#### `src/components/DateRangeFilter.test.tsx` — 2 new tests added

| Test | Section | Priority | AC |
|------|---------|----------|----|
| Trigger shows "MMM d, yyyy" format in English with custom dateRange | popover trigger display text | P1 | FR30 |
| Trigger shows "DD/MM/YYYY" format when language=pt and custom dateRange | Portuguese i18n | P1 | FR30 |

#### `src/pages/EarningsDashboard.test.tsx` — 1 new integration test added

| Test | Priority | AC |
|------|----------|----|
| Metric cards display pt-BR currency format when language=pt | P1 | FR31 |

---

## Step 4: Validation

### Checklist

- [x] Framework readiness verified (Vitest + Playwright operational)
- [x] Coverage mapped to story ACs (AC3/FR30, AC4/FR31)
- [x] Test quality: pure logic assertions, no flaky selectors
- [x] Fixtures: reuse existing `seedState()` and `localStorage.setItem()` patterns
- [x] No existing tests broken
- [x] No tests added for code outside story scope
- [x] `DateRangeFilter.test.tsx` PT date format test uses `localStorage.setItem('app-language', 'pt')` in `beforeEach` (existing pattern in the file)
- [x] `utils.test.ts` uses dynamic import pattern (matches existing test style in that file)
- [x] Temp artifacts not created (sequential mode, no subagent temp files)
- [x] All 264 unit tests passing
- [x] All 147 E2E tests passing (including all 6 Story 6.1 ATDD)

---

## Summary

### Test Files Created or Modified

| File | Action | Tests Added |
|------|--------|-------------|
| `src/lib/utils.test.ts` | Modified | +7 unit tests (Story 6.1 `formatCurrency` locale-aware) |
| `src/components/DateRangeFilter.test.tsx` | Modified | +2 component tests (FR30 date format in EN + PT) |
| `src/pages/EarningsDashboard.test.tsx` | Modified | +1 integration test (FR31 pt-BR currency in metric cards) |

**Total new tests: 10**

### Coverage Improvements

| Area | Before | After |
|------|--------|-------|
| `formatCurrency` with `language='pt'` (pt-BR Intl output) | Not covered | ✅ Covered (P0 unit tests) |
| `formatCurrency` with `language='en'` (explicit EN param) | Not covered | ✅ Covered (P1 unit test) |
| `formatCurrency` backward compat guarantee (no-param → en-US) | Implicit | ✅ Explicit regression guard |
| `DateRangeFilter` trigger — EN date format "MMM d, yyyy" (precise) | Year-only check | ✅ Full format assertion |
| `DateRangeFilter` trigger — PT date format "DD/MM/YYYY" | E2E only | ✅ Component-level coverage added |
| `EarningsDashboard` metric cards — pt-BR currency value | Labels only | ✅ Currency format value asserted |

### Final Test Suite Results

| Suite | Before | After | Delta | Status |
|-------|--------|-------|-------|--------|
| Vitest unit tests | 254 passed | **264 passed** | +10 | ✅ All pass |
| Playwright E2E tests | 147 passed | **147 passed** | 0 | ✅ All pass |
| **Total** | **401** | **411** | **+10** | ✅ |

### Priority Coverage (new tests)

| Priority | Count |
|----------|-------|
| P0 (Critical) | 2 |
| P1 (High) | 6 |
| P2 (Medium) | 2 |
| **Total** | **10** |

### Assumptions & Notes

- Chart tooltip currency format (CustomerRevenueChart, ProjectRevenueChart, TagRevenueChart) is covered by the existing Story 6.1 E2E ATDD tests. Component-level isolation of tooltip rendering requires complex Recharts mock setup and adds marginal value given E2E coverage — deferred per story scope constraint.
- `DateRangeFilter.test.tsx` PT date format test inherits `localStorage.setItem('app-language', 'pt')` from the `beforeEach` in the Portuguese i18n describe block — no additional setup required.
- pt-BR currency assertions use `toContain` and `toMatch(/US\$|USD/)` rather than exact equality to accommodate minor ICU data differences across Node.js versions.

### Next Recommended Workflow

- `bmad-testarch-test-review` — Review the new test quality against best-practice checklist
- `bmad-testarch-trace` — Generate traceability matrix mapping ACs to test IDs
