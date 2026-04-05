# Story 2.1: Implement earnings calculation utilities

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **developer**,
I want **pure utility functions to calculate earnings by customer, project, and tag** (with date range and billable filtering),
so that **Epic 3 charts and Epic 2.2 summary metrics have accurate, testable revenue data** (FR13, FR15–FR18, FR21–FR26, FR50).

## Acceptance Criteria

1. **Given** a list of `Task` records, `Client[]`, `Column[]`, and a resolved **date range** `{ startMs, endMs }`  
   **When** I call **`calculateRevenueByCustomer(tasks, clients, dateRangeMs, billableFilter)`** (exact name flexible if documented, but responsibilities must match)  
   **Then** I receive an array of rows: `{ customerId: string | null, customerName: string, totalRevenue: number, taskCount: number }`  
   **And** `customerId === null` rows use a stable display name **`Unassigned`** (English literal in the util layer is fine; Epic 6 may translate at the UI boundary)  
   **And** `totalRevenue` is the **sum of per-task revenue** for tasks bucketed to that customer (see Dev Notes for revenue + date rules).

2. **Given** the same inputs  
   **When** I call **`calculateRevenueByProject(tasks, columns, dateRangeMs, billableFilter)`**  
   **Then** I receive `{ columnId, columnTitle, totalRevenue, taskCount }[]` aligned to Kanban **columns** as “projects” (this matches the domain: `Task.columnId` → `Column.title`).

3. **Given** the same inputs  
   **When** I call **`calculateRevenueByTag(tasks, dateRangeMs, billableFilter)`**  
   **Then** I receive `{ tag: string, totalRevenue: number, taskCount: number }[]`  
   **And** tasks with **no tags** roll into a bucket with tag key **`Untagged`** (stable sentinel; UI copy may later use i18n).  
   **And** **revenue split:** for `tags.length > 0`, each tag receives **`taskRevenue / tags.length`** (trim/normalize tag strings for stable keys; document trimming rules in code).  
   **And** **taskCount:** for each tag bucket, count is the number of **tasks assigned to that tag** after the same filtering — a task with two tags increments **both** tag rows by **1** (even if per-tag revenue share is fractional). A task with **no** tags increments **`Untagged`** by **1**.

4. **Given** `billableFilter === 'billable'`  
   **When** any calculation function runs  
   **Then** **only** tasks with `task.isBillable === true` participate (FR15, FR18).

5. **Given** `billableFilter === 'nonBillable'`  
   **When** any calculation function runs  
   **Then** **only** tasks with `task.isBillable === false` participate (FR16).  
   **Note:** Per the existing revenue formula, their **revenue contribution is 0**, but they still appear in **taskCount** and downstream empty-state logic (Epic 5).

6. **Given** `billableFilter === 'all'`  
   **When** any calculation function runs  
   **Then** both billable and non-billable tasks may participate; revenue remains **0** for non-billable tasks (FR17).

7. **Given** a date range filter  
   **When** any calculation function runs  
   **Then** only tasks whose **`Task.createdAt`** satisfies `startMs <= createdAt <= endMs` (inclusive) are included (FR13).  
   **Rationale:** `AppState.timeEntries` is **not** populated by the reducer today; there is no per-day time attribution. Using `createdAt` is the consistent MVP axis until time-entry-based allocation is specified.

8. **Given** edge cases (no tasks, all non-billable, single client, zero rates, null `clientId`)  
   **When** calculation functions run  
   **Then** they return **safe outputs** (empty arrays or zeroed totals, no throws) and remain usable by later UI (FR50).

9. **Given** the existing app revenue helpers  
   **When** comparing dashboard math to Kanban totals  
   **Then** per-task revenue matches **`getTaskRevenue` semantics** exactly (FR26):  
   `effectiveRate = task.hourlyRate ?? client.hourlyRate ?? 0` (use **nullish** `??`, not `||`, to match `AppContext`);  
   `revenue = task.isBillable ? effectiveRate * (task.timeSpent / 3600) : 0`.  
   **Important:** Use **`timeSpent` only** (not live timer elapsed) so totals align with `getTaskRevenue` / `getTotalRevenue` today — `TaskCard` shows a higher “current” revenue when a timer runs; the dashboard engine should **not** silently diverge unless a future story explicitly changes that contract.

10. **Out of scope for this story:** Wiring visible **summary metric cards** (Story **2.2** / Epic 5); **recharts** UI (Epic 3); changing **`earnings-dashboard-state`** shape; new **localStorage** keys.

## Tasks / Subtasks

- [x] **Create pure calculation module** (AC: 1–9)
  - [x] Add `src/lib/earnings-calculations.ts` (name matches PRD technical assumptions). [Source: `_bmad-output/planning-artifacts/prd.md` — Utilities path]
  - [x] Export **types** for inputs/outputs (e.g. `EarningsDateRangeMs`, row interfaces). Reuse `BillableFilter` from `src/lib/earnings-dashboard-storage.ts` **or** define a compatible type / import it to avoid drift with persisted dashboard state (`'all' | 'billable' | 'nonBillable'`).
  - [x] Export **`resolveDateRangeFromPreset(preset, nowMs)`** and/or **`resolveDateRangeMs(persistedSlice, nowMs)`** that understands:
    - Presets: `'last30' | 'quarter' | 'year' | 'all'` (must match `DateRangePreset` in `earnings-dashboard-storage.ts`).
    - Optional `dateRange?: { startMs, endMs }` override when present and valid (Epic 4 custom range).
    - **Window rules:** align with epic copy: **last 30 calendar days**, **quarter = 90 days**, **year = 365 days**, **all** = unbounded (use min/max sentinels or explicit branch that skips date filter). Use **`date-fns`** already in the project for day arithmetic; document timezone choice (**local** vs UTC) in a short file-level comment — prefer **local** for freelancer-facing presets.
  - [x] Export **`filterTasksForEarnings(tasks, range, billableFilter)`** (internal or public) applying date + billable rules before aggregation.
  - [x] Export **`getEffectiveHourlyRate(task, clientsById | clients[])`** and **`getTaskBillableRevenue(task, clients[])`** as the **single source of truth** for FR26 math.

- [x] **Refactor existing app helpers to prevent drift** (AC: 9)
  - [x] Update `src/context/AppContext.tsx` so `getTaskRate`, `getTaskRevenue`, and `getTotalRevenue` delegate to the shared pure functions from `earnings-calculations.ts` (same formulas, no behavior change). This is strongly recommended — not optional if code review targets FR26.

- [x] **Unit tests** (AC: 1–9)
  - [x] Add `src/lib/earnings-calculations.test.ts` with Vitest.
  - [x] Cover: billable / non-billable / all filters; empty task list; `clientId: null` → Unassigned; multi-tag split; preset range boundaries; parity tests that **import the same pure revenue function** used by aggregations and assert known numeric outcomes.
  - [x] Cover **rate precedence:** task hourly override vs client rate vs zero.

- [x] **Integration surface (optional, small)**  
  - [x] No requirement to render charts or metrics on `EarningsDashboard` yet; if you export a tiny **debug-only** hook or comment showing example usage, keep it out of production UI.

## Dev Notes

### Epic context (Epic 2: Earnings Calculations Engine)

- **Epic goal:** Core revenue logic for metrics and charts; **100% formula parity** and fast pure computation (NFR-P4).
- **This story (2.1):** Aggregation utilities by **customer / project (column) / tag** + date + billable filtering.
- **Next story (2.2):** Summary metrics (totals, averages, task counts) will **compose** these primitives — avoid duplicating filter/revenue logic there.

### Technical requirements / guardrails

- **FR26 / formula parity:** Must match `AppContext` today and `TaskDetailPanel` (`revenue = isBillable ? rate * timeSpent/3600 : 0`). [Source: `_bmad-output/project-context.md` — Revenue formula]
- **Timestamps:** Range inputs and `Task.createdAt` are **Unix ms** per project rules.
- **No new persistence** for this story; read presets/types from `earnings-dashboard-storage` only if importing types — do not write to `localStorage` here.
- **Path alias:** `@/` for imports.
- **TypeScript:** `strict` is off; still type **public** API of the new module clearly.

### Architecture compliance

- Client-only SPA; all data from `AppState` passed in as arguments (functions stay **pure** aside from optional `nowMs` injection for testability). [Source: `docs/architecture.md`]
- **`Column` as project:** The epics treat “Project” as Kanban column; use `columnId` + `Column.title` for labels. [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.2 wording]

### Library / framework

- **date-fns** `^3.6.0` for preset boundary math — no new date library.
- No **recharts** in this story.

### File structure

| Action | Path | Notes |
|--------|------|------|
| Add | `src/lib/earnings-calculations.ts` | Pure functions + types |
| Add | `src/lib/earnings-calculations.test.ts` | Vitest |
| Edit | `src/context/AppContext.tsx` | Delegate to shared revenue helpers for FR26 single source of truth |

### Testing

- **Vitest** + Testing Library not required for pure functions beyond `earnings-calculations.test.ts`.
- Follow `src/test/setup.ts` globals. [Source: `_bmad-output/project-context.md`]

### Previous story intelligence (Epic 1 / Story 1.3)

- Dashboard persistence lives in **`earnings-dashboard-state`**; presets and `BillableFilter` already exist — **reuse** those enums/types for function parameters where practical. [Source: `_bmad-output/implementation-artifacts/1-3-implement-earnings-dashboard-state-persistence.md`]
- `EarningsDashboard` currently exposes interim `Select` controls wired to `EarningsDashboardStateContext` — Story 2.2+ may call calculators with `state.dateRangePreset`, optional `state.dateRange`, and `state.billableFilter`.

### Git intelligence

- Recent pattern: epic/story delivery commits bundle lib + tests + small integration (`74d0e39` Story 1.3, `f741fb3` Story 1.2). Prefer **focused** `earnings-calculations` + **minimal** `AppContext` edit.

### Latest technical specifics

- **date-fns v3** — use documented imports (`subDays`, `startOfDay`, etc.) consistent with ESM tree-shaking in Vite 5.
- **Vitest 3** — `describe` / `it` globals available via project config.

### References

- [Story 2.1 acceptance criteria — `_bmad-output/planning-artifacts/epics.md` — Epic 2, Story 2.1]
- [FR13, FR15–FR18, FR21–FR27, FR50 — `_bmad-output/planning-artifacts/epics.md` — Requirements Inventory]
- [Utilities path — `_bmad-output/planning-artifacts/prd.md` — Technical Architecture]
- [Revenue formula + earnings notes — `_bmad-output/project-context.md`]
- [Domain types — `src/types/index.ts`]
- [Architecture state + helpers — `docs/architecture.md` — State Management / getTaskRevenue]
- [Persisted dashboard filters — `src/lib/earnings-dashboard-storage.ts`]
- [Previous epic — `_bmad-output/implementation-artifacts/1-3-implement-earnings-dashboard-state-persistence.md`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

### Completion Notes List

- Implemented `src/lib/earnings-calculations.ts`: date presets (local timezone via date-fns), `resolveDateRangeMs`, `filterTasksForEarnings`, FR26 helpers, `calculateRevenueByCustomer` / `ByProject` / `ByTag` (tag trim, dedupe, Untagged, revenue split).
- `AppContext` `getTaskRate` / `getTaskRevenue` delegate to shared helpers; corrects prior `hourlyRate` truthiness bug so `0` honors FR26 nullish semantics.
- Vitest coverage in `earnings-calculations.test.ts`; ATDD skips removed — 19 Playwright scenarios green (`atdd-api` + `chromium` for 2-1).
- Full Playwright suite: **53 passed** with `--workers=1` (default parallel run showed timeouts/NFR flake under load — environment/contention).

### File List

- `src/lib/earnings-calculations.ts` (new)
- `src/lib/earnings-calculations.test.ts` (new)
- `src/context/AppContext.tsx` (modified)
- `tests/api/story-2-1-earnings-calculations-atdd.spec.ts` (unskipped)
- `tests/e2e/story-2-1-earnings-calculations-atdd.spec.ts` (unskipped)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (status)
- `_bmad-output/implementation-artifacts/2-1-implement-earnings-calculation-utilities.md` (tasks, status, dev record)

## Story completion status

**Status:** done

Ultimate context engine analysis completed — comprehensive developer guide created.

### Review Findings

_Code review (2026-04-05). Review layers: adversarial, edge-case, and acceptance checks executed inline against uncommitted changes + spec; no subagent dispatch._

- [x] [Review][Patch] Stale ATDD headers described RED/skipped tests though implementations exist — updated `tests/api/story-2-1-earnings-calculations-atdd.spec.ts` and `tests/e2e/story-2-1-earnings-calculations-atdd.spec.ts` comments and describe titles.

- [x] [Review][Patch] Vitest did not assert inclusive `endMs` for `filterTasksForEarnings` (AC7) — extended `src/lib/earnings-calculations.test.ts` boundary case to include `createdAt === endMs`.

- [x] [Review][Patch] Vitest lacked explicit duplicate-tag dedupe coverage (AC3) — added `calculateRevenueByTag` case for repeated tag strings.

- [x] [Review][Defer] `package-lock.json` peer-field churn — deferred, pre-existing npm lockfile noise unrelated to earnings utilities.

- [x] [Review][Defer] `getTotalRevenue` still sums all tasks without earnings dashboard date filter — deferred, pre-existing `AppContext` scope outside Story 2.1.
