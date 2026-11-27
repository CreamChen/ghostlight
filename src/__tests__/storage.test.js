import { describe, expect, it, beforeEach } from 'vitest'
import { defaultState, loadState, saveState, syncTimer, updateTask, STORAGE_KEY } from '../utils/storage'
describe('Ghostlight persistence', () => { beforeEach(() => localStorage.clear())
  it('starts with an intentional set of rituals and a 25 minute timer', () => { const state = defaultState(); expect(state.tasks).toHaveLength(4); expect(state.timer.duration).toBe(1500) })
  it('round trips tasks and timer state through local storage', () => { const state = defaultState(); state.tasks[1].done = true; state.timer.remaining = 812; saveState(state); const loaded = loadState(); expect(loaded.tasks[1].done).toBe(true); expect(loaded.timer.remaining).toBe(812) })
  it('recovers safely from malformed storage', () => { localStorage.setItem(STORAGE_KEY, '{oops'); expect(loadState().tasks).toHaveLength(4) })
  it('updates task title and note by id', () => {
    const state = defaultState()
    const taskId = state.tasks[0].id
    const result = updateTask(state, taskId, { title: 'Updated Title', note: 'New note here' })
    expect(result).toBe(true)
    expect(state.tasks[0].title).toBe('Updated Title')
    expect(state.tasks[0].note).toBe('New note here')
  })
  it('trims whitespace when updating task', () => {
    const state = defaultState()
    const taskId = state.tasks[0].id
    updateTask(state, taskId, { title: '  Trimmed  ', note: '  Also trimmed  ' })
    expect(state.tasks[0].title).toBe('Trimmed')
    expect(state.tasks[0].note).toBe('Also trimmed')
  })
  it('returns false when updating nonexistent task', () => {
    const state = defaultState()
    const result = updateTask(state, 'nonexistent-id', { title: 'No task', note: '' })
    expect(result).toBe(false)
  })
  it('does not double-count elapsed time after a saved timer resumes', () => {
    const state = defaultState()
    Object.assign(state.timer, { running: true, remaining: 1500, updatedAt: 10000 })
    syncTimer(state.timer, 15000)
    saveState(state)
    const restored = loadState()
    syncTimer(restored.timer, 18000)
    expect(restored.timer.remaining).toBe(1492)
    expect(restored.timer.updatedAt).toBe(18000)
  })
  it('stops at zero when elapsed time exceeds the remaining duration', () => {
    const timer = { running: true, remaining: 3, updatedAt: 10000 }
    expect(syncTimer(timer, 15000)).toBe(true)
    expect(timer).toEqual({ running: false, remaining: 0, updatedAt: null })
  })
})
