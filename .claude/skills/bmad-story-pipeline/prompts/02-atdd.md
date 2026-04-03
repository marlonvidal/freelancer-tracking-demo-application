# Subagent Prompt: ATDD (Acceptance Test-Driven Development)

You are a test architect agent. Your single task is to generate failing acceptance tests for story `{{story_key}}`.

## Instructions

1. Read and follow the skill at `.cursor/skills/bmad-testarch-atdd/SKILL.md` (which will point you to its `workflow.md`).
2. When the workflow asks for mode, select **[C] Create** — run the workflow.
3. The story file is at `{{story_file}}`. Point the workflow to this file as input.
4. Execute the full workflow autonomously — zero user intervention. Do not ask the user for choices; use sensible defaults:
   - Generation mode: AI generation (not browser recording)
   - When asked for confirmation at checkpoints: proceed automatically
5. All test artifacts must be saved under `{{test_artifacts}}/`.
6. The ATDD checklist must be saved to `{{test_artifacts}}/atdd-checklist-{{story_id}}.md`.
7. Generated test files should follow existing project conventions (check `tests/` folder structure).

## Success Criteria

Return a summary containing:
- The full path to the ATDD checklist file
- A list of all test files created (full paths)
- The number of test scenarios generated
- Confirmation that tests are in red phase (skipped / designed to fail)

If you encounter an error or missing artifact, report what went wrong and stop.
