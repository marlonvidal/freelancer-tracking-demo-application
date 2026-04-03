---
name: bmad-story-pipeline
description: >-
  Orchestrates the full BMAD+TEA story implementation pipeline
  (create-story, ATDD, dev-story, code-review, automate) in a single
  command using subagents per step. Use when the user says "run story
  pipeline", "implement next story", or "bmad-story-pipeline".
---

# BMAD Story Pipeline Orchestrator

Run the complete story lifecycle — from backlog to done — in one command by dispatching a fresh subagent for each stage.

## Pipeline Stages

| # | Stage | Skill invoked | Produces | Status transition |
|---|-------|---------------|----------|-------------------|
| 1 | Create Story | `bmad-create-story` | `{impl}/{{story_key}}.md` | backlog -> ready-for-dev |
| 2 | ATDD | `bmad-testarch-atdd` | `{test}/atdd-checklist-{{story_id}}.md` + test files | — |
| 3 | Dev Story | `bmad-dev-story` | implemented code, tests green | ready-for-dev -> review |
| 4 | Code Review | `bmad-code-review` | review findings, auto-fix | review -> done (or in-progress) |
| 5 | Automate | `bmad-testarch-automate` | expanded test coverage | — |

## Initialization

### 1. Load configuration

Read `{project-root}/_bmad/bmm/config.yaml` and resolve:
- `project_name`, `user_name`
- `communication_language`, `document_output_language`
- `implementation_artifacts` (abbrev `{impl}`)
- `output_folder`
- `test_artifacts` = `{output_folder}/test-artifacts` (abbrev `{test}`)
- `planning_artifacts`

### 2. Discover next story

Read the FULL `{impl}/sprint-status.yaml`.

Find the FIRST entry in `development_status` (top-to-bottom order) where:
- key matches pattern `N-N-slug` (not `epic-N` or `*-retrospective`)
- status equals `backlog`

Extract:
- `story_key` — the full key (e.g. `1-2-integrate-earnings-dashboard`)
- `story_id` — `{epic_num}-{story_num}` (e.g. `1-2`)
- `epic_key` — `epic-{epic_num}`

If no backlog story found, report to the user and HALT.

### 3. Verify epic status

If `epic_key` status is `backlog`, note it will be transitioned to `in-progress` by the create-story subagent. If `done`, HALT with error.

## Pipeline Execution

Execute stages 1-5 sequentially. Between each stage the orchestrator verifies the expected artifact exists before dispatching the next subagent.

**Critical rules:**
- Dispatch each stage as a `Task` subagent (`subagent_type: "generalPurpose"`)
- Read the prompt template from `./prompts/0N-*.md`
- Replace all `{{placeholders}}` with resolved values before dispatching
- After each subagent returns, verify the gate condition
- If a gate fails, report the failure stage and HALT — do not proceed

### Stage 1 — Create Story

1. Read `./prompts/01-create-story.md`
2. Replace `{{story_key}}`, `{{story_id}}`, `{{epic_num}}`, `{{story_num}}`
3. Dispatch subagent
4. **Gate:** glob for `{impl}/{{story_key}}.md` — file must exist and contain `Status: ready-for-dev`
5. Store the full path as `{{story_file}}`

### Stage 2 — ATDD

1. Read `./prompts/02-atdd.md`
2. Replace `{{story_file}}`, `{{story_id}}`, `{{story_key}}`
3. Dispatch subagent
4. **Gate:** glob for `{test}/atdd-checklist-{{story_id}}.md` — file must exist
5. Store the full path as `{{atdd_checklist}}`
6. Also search for test files referenced inside the checklist (grep for file paths under `tests/`)

### Stage 3 — Dev Story

1. Read `./prompts/03-dev-story.md`
2. Replace `{{story_file}}`, `{{story_key}}`, `{{atdd_checklist}}`, and any test file paths discovered in stage 2
3. Dispatch subagent
4. **Gate:** read `{{story_file}}` — Status must be `review`
5. Read `{impl}/sprint-status.yaml` — `{{story_key}}` must be `review`

### Stage 4 — Code Review

1. Read `./prompts/04-code-review.md`
2. Replace `{{story_file}}`, `{{story_key}}`
3. Dispatch subagent
4. **Gate:** read `{{story_file}}` — Status must be `done` or `in-progress`
5. If `in-progress` (review left action items): report findings to user and HALT
6. If `done`: proceed

### Stage 5 — Automate

1. Read `./prompts/05-automate.md`
2. Replace `{{story_file}}`, `{{story_key}}`, `{{story_id}}`
3. Dispatch subagent
4. **Gate:** subagent completes without error

## Finalization

1. Read `{impl}/sprint-status.yaml` (full file)
2. Verify `{{story_key}}` status is `done`
3. If not already `done`, update it to `done` and set `last_updated`
4. Save the file preserving all comments and structure

Report to user:

> **Story Pipeline Complete**
>
> **Story:** {{story_key}}
> **Status:** done
> **Artifacts created:**
> - Story file: {{story_file}}
> - ATDD checklist: {{atdd_checklist}}
> - Test files: (list from stage 2/5)
>
> **Next:** Run `bmad-story-pipeline` again to process the next backlog story, or check sprint status.

## Error Handling

If any stage fails:
1. Report which stage failed and why
2. Report what artifacts were successfully created so far
3. Suggest how to resume (e.g., manually fix and re-run a specific skill)
4. Do NOT attempt to continue past a failed gate
