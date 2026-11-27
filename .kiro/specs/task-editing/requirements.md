# Task Editing — Requirements

## Overview

Users need to correct or refine task titles and notes after creating them. The edit feature must feel native to the existing app: same visual language, no modal interruptions, no data loss.

## Functional Requirements

### REQ-1: Edit trigger
Each task row in view mode must expose an edit button (pencil icon ✎) that activates edit mode for that task. Only one task may be in edit mode at a time.

### REQ-2: Inline edit form
When a task enters edit mode, its view (title, note, check and delete buttons) is replaced in-place with an edit form containing:
- A text input pre-populated with the current task title (focused automatically).
- A text input pre-populated with the current task note (empty string if no note exists).
- A Save button.
- A Cancel button.

### REQ-3: Validation
Saving with an empty or whitespace-only title must be blocked. The notice region must display "Task name cannot be empty." and the form must remain open. Leading and trailing whitespace is trimmed from both fields before saving.

### REQ-4: Save
On Save (button click or Enter in either input), if the title is valid:
- The task's title and note are updated in the reactive state.
- Changes are persisted to localStorage immediately.
- The notice region displays "Task updated."
- Edit mode closes; the task returns to view mode showing the new values.

### REQ-5: Cancel
On Cancel (button click or Escape in either input), the form closes without modifying the task. The original title and note are preserved.

### REQ-6: Keyboard support
- **Enter** (without Shift) in either input triggers Save.
- **Escape** in either input triggers Cancel.

### REQ-7: Persistence scope
Edits update only `title` and `note`. The task `id`, `done` state, and filter view are unaffected.

### REQ-8: Filter compatibility
Editing a task does not change the active filter. If a task is visible under the current filter before editing, it remains visible after saving.

## Accessibility Requirements

### REQ-A1: Labels
Each edit input has a visually hidden `<label>` (`.sr-only`) associated via matching `for`/`id` attributes that include the task id to avoid duplicate id values across the list.

### REQ-A2: Focus management
The title input receives focus (`autofocus`) when edit mode opens so keyboard users can begin typing immediately.

### REQ-A3: Button labels
The edit trigger button has `aria-label="Edit task"`. Save has `aria-label="Save changes"`. Cancel has `aria-label="Cancel editing"`.

### REQ-A4: Status announcements
The existing `role="status"` notice region announces validation errors and save confirmations without requiring focus to move.

### REQ-A5: Focus states
All interactive elements in the edit form expose visible focus rings using the app's existing `focus-visible` conventions.

## Constraints

- No new dependencies.
- No modal or overlay — inline replacement only.
- Visual style (colors, radii, typography) must match the existing app tokens (`--accent`, `--card`, `--muted`, etc.).
- Changes must not affect timer behavior, task filtering, or task add/delete functionality.
