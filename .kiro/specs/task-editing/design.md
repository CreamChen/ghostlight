# Task Editing — Design

## Approach

The feature is implemented entirely within the existing `App.vue` single-file component and `src/utils/storage.js`. No new files, components, or dependencies are introduced.

## Storage layer

**File:** `src/utils/storage.js`

Added `updateTask(state, id, { title, note })`:
- Locates the task by id in `state.tasks`.
- Returns `false` if no matching task is found (safe no-op).
- Mutates `task.title` and `task.note` in place after trimming whitespace.
- Returns `true` on success.
- The caller is responsible for calling `saveState` afterward; `updateTask` is a pure mutation helper with no side effects.

## Component state

**File:** `src/App.vue`

Three new `ref`s added to `<script setup>`:

| Ref | Type | Purpose |
|-----|------|---------|
| `editingTaskId` | `string \| null` | id of the task currently being edited, or null |
| `editTitle` | `string` | current value of the title input |
| `editNote` | `string` | current value of the note input |

## Functions

### `startEdit(task)`
Sets `editingTaskId` to `task.id` and copies the task's current `title` and `note` into the edit refs. Triggers the inline form to render.

### `saveEdit()`
1. Trims `editTitle`. If empty, writes "Task name cannot be empty." to `notice` and returns without closing the form.
2. Calls `updateTask(state, editingTaskId, { title, note: editNote })`.
3. On success, writes "Task updated." to `notice` and calls `persist()`.
4. Calls `cancelEdit()` to clear edit state.

### `cancelEdit()`
Resets `editingTaskId`, `editTitle`, and `editNote` to their null/empty defaults. No state mutation occurs.

### `handleEditKeydown(event)`
Attached to both inputs. Routes Enter (without Shift) to `saveEdit()` and Escape to `cancelEdit()`, preventing default browser behavior in both cases.

## Template structure

Inside the task list `v-for`, each `<article>` gains:
- CSS class binding `editing: editingTaskId === task.id` for layout adjustments.
- A `<template v-if="editingTaskId === task.id">` branch rendering the edit form.
- A `<template v-else>` branch rendering the original view (check, title/note, edit button, delete button).

The edit button (✎) sits between the task copy and the delete button, maintaining visual left-to-right action grouping.

**Edit form markup (abbreviated):**
```html
<form class="edit-form" @submit.prevent="saveEdit" aria-label="Edit task">
  <label class="sr-only" :for="'edit-title-' + task.id">Task name</label>
  <input :id="'edit-title-' + task.id" class="edit-title-input"
         v-model="editTitle" maxlength="100" required autofocus
         @keydown="handleEditKeydown" />
  <label class="sr-only" :for="'edit-note-' + task.id">Task note</label>
  <input :id="'edit-note-' + task.id" class="edit-note-input"
         v-model="editNote" placeholder="Optional note" maxlength="160"
         @keydown="handleEditKeydown" />
  <div class="edit-actions">
    <button type="submit" class="edit-save" aria-label="Save changes">Save</button>
    <button type="button" class="edit-cancel" @click="cancelEdit" aria-label="Cancel editing">Cancel</button>
  </div>
</form>
```

## Styles

**File:** `src/styles.css`

New classes added, all using existing CSS custom properties:

| Class | Purpose |
|-------|---------|
| `.edit-btn` | Pencil icon button; muted by default, `--accent` on hover |
| `.task-row.editing` | Switches flex alignment to `stretch` for form layout |
| `.edit-form` | Column flex container with 7px gap |
| `.edit-title-input` | Full-width input, accent border, matches add-form input style |
| `.edit-note-input` | Full-width input, muted color, matches note-input style |
| `.edit-actions` | Row flex container for Save/Cancel |
| `.edit-save` | Accent background, dark text — mirrors `.add-btn` intent |
| `.edit-cancel` | Transparent background, muted border — mirrors `.secondary` button |

All interactive elements expose `focus-visible` outlines.

## Tests

**File:** `src/__tests__/storage.test.js`

Three tests added to the existing `describe` block:

1. **Updates task title and note by id** — verifies `updateTask` returns `true` and mutates the correct task.
2. **Trims whitespace when updating task** — verifies leading/trailing whitespace is stripped from both fields.
3. **Returns false when updating nonexistent task** — verifies safe no-op when id is not found.

UI behavior (edit form open/close, keyboard routing, validation notice) is tested implicitly through the storage contract and manual verification. Vue component unit tests were not added because the project has no component testing infrastructure; adding one test would require wiring `@vue/test-utils`, which is out of scope.

## Decisions

**Inline vs. modal:** Inline replacement avoids focus-trap complexity and keeps the interaction spatially connected to the task being edited, matching the app's compact, card-based layout.

**Single edit at a time:** Opening edit on a second task would silently discard unsaved changes on the first. The current design simply replaces `editingTaskId`, meaning clicking Edit on another task while one is open will close the previous form without saving. This is acceptable for a single-user local draft.

**`updateTask` as a pure helper:** Keeping storage concerns (the mutation) separate from persistence (the `saveState` call) makes the function easier to test without mocking `localStorage`.
