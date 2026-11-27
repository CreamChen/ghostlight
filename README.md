# Ghostlight

A spooky-but-usable costume contest task list and focus timer. Ghostlight is a Vue 3 + Vite single-page app. It is intentionally account-free: tasks and timer state are stored in the browser's `localStorage` and are not sent to an application server.

**Try the app:** https://creamchen.github.io/ghostlight/  
**Demo video:** https://youtu.be/ai8YMm9aqaE

## Run locally

Requirements: Node.js 22.22.2+, 24.15+, or 26+ (matching the locked dependencies) and npm.

```bash
npm ci
npm run dev
```

Open the local URL Vite prints. For a production build, run `npm run build` and optionally `npm run preview`. Tests run with `npm test`.

## Features

- Add a task with an optional note; complete, filter, and delete tasks.
- **Edit an existing task's title and note inline** — click the pencil button on any task, make changes, and save with the button or Enter; cancel with the Cancel button or Escape.
- Focus timer with 15, 25, and 45 minute presets; start, pause, resume, and reset.
- Persists tasks, selected timer duration, remaining time, and running state in local storage.
- Accounts for elapsed wall-clock time if the page is refreshed while the timer is running.
- Responsive layout, keyboard-friendly controls, visible focus states, live timer announcements, and empty/error-safe storage handling.

## Honest limitations

Data is limited to the current browser profile; clearing site data removes it. There is no cross-device sync, notification sound, authentication, backend, or offline service worker. The Google Fonts import is a convenience for the visual design; if unavailable, the app falls back to system fonts.

## Authorship note

The base app — task add/complete/delete, focus timer, local storage persistence, layout, and styling — was written before this Kiro CLI session. The inline task editing feature (edit button, inline form, keyboard support, validation, `updateTask` in storage), its tests, and the specification documents in `.kiro/specs/task-editing/` were implemented by Kiro CLI during a single session in November 2026. Afterward, the timer's elapsed-time recovery was corrected and covered by separate regression tests.
