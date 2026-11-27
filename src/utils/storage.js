export const STORAGE_KEY = 'ghostlight-state-v1'
export const defaultState = () => ({ tasks: [
  { id: '1', title: 'Choose the silhouette', note: 'Sketch the shape before the details take over.', done: true },
  { id: '2', title: 'Source the moonlit materials', note: 'Fabric, fasteners, and one impossible detail.', done: false },
  { id: '3', title: 'Build the hero prop', note: 'Keep it light enough for a full night of haunting.', done: false },
  { id: '4', title: 'Try on + photograph', note: 'Check the fit under real-world lighting.', done: false }
], timer: { duration: 25 * 60, remaining: 25 * 60, running: false, updatedAt: null } })
export function loadState() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return defaultState(); const parsed = JSON.parse(raw); return { ...defaultState(), ...parsed, timer: { ...defaultState().timer, ...parsed.timer } } } catch { return defaultState() }
}
export function saveState(state) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* storage can be unavailable */ } }
export function syncTimer(timer, now = Date.now()) {
  if (!timer.running || timer.updatedAt == null) return false
  const elapsed = Math.max(0, Math.floor((now - timer.updatedAt) / 1000))
  if (!elapsed) return false
  timer.remaining = Math.max(0, timer.remaining - elapsed)
  timer.updatedAt += elapsed * 1000
  if (timer.remaining === 0) { timer.running = false; timer.updatedAt = null; return true }
  return false
}
export function updateTask(state, id, { title, note }) {
  const task = state.tasks.find(t => t.id === id)
  if (!task) return false
  task.title = title.trim()
  task.note = note.trim()
  return true
}
