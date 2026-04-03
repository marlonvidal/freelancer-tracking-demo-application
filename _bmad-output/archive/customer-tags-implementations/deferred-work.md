
## Deferred from: spec-tags-select-and-display (2026-04-03)

- **a11y: tag remove button** — The ✕ icon on tag chips in AddTaskDialog and TaskDetailPanel has no `role="button"`, `tabIndex`, or `aria-label`. Keyboard and assistive-tech users cannot remove tags. Fix: wrap in `<button aria-label="Remove tag {tag}">`.
- **tag logic extraction** — `addTag` / `handleTagKeyDown` / `removeTag` / trim regex are copy-pasted across AddTaskDialog and TaskDetailPanel. Extract to a shared `useTagInput` hook to prevent drift.
- **IME composition guard** — `handleTagKeyDown` does not check `e.nativeEvent.isComposing`; Enter during CJK composition can prematurely commit an incomplete tag. Fix: add `if (e.nativeEvent.isComposing) return;` guard.
