<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { loadState, saveState, syncTimer, updateTask } from './utils/storage'

const state = reactive(loadState())
const newTask = ref('')
const newNote = ref('')
const filter = ref('all')
const notice = ref('')
const editingTaskId = ref(null)
const editTitle = ref('')
const editNote = ref('')
let ticker

const completed = computed(() => state.tasks.filter(t => t.done).length)
const visibleTasks = computed(() => state.tasks.filter(t => filter.value === 'all' || (filter.value === 'active' ? !t.done : t.done)))
const progress = computed(() => state.tasks.length ? Math.round(completed.value / state.tasks.length * 100) : 0)
const timerMinutes = computed(() => String(Math.floor(state.timer.remaining / 60)).padStart(2, '0'))
const timerSeconds = computed(() => String(state.timer.remaining % 60).padStart(2, '0'))
const timerLabel = computed(() => state.timer.running ? 'Focus in progress' : state.timer.remaining < state.timer.duration ? 'Paused for a breath' : 'Ready when you are')

function persist() { saveState(state) }
function addTask() {
  const title = newTask.value.trim(); if (!title) { notice.value = 'Give your task a name first.'; return }
  state.tasks.unshift({ id: crypto.randomUUID?.() || String(Date.now()), title, note: newNote.value.trim(), done: false }); newTask.value = ''; newNote.value = ''; notice.value = 'Task added to the lantern.'; persist()
}
function toggleTask(task) { task.done = !task.done; persist() }
function removeTask(task) { state.tasks = state.tasks.filter(item => item.id !== task.id); persist() }
function startEdit(task) { editingTaskId.value = task.id; editTitle.value = task.title; editNote.value = task.note }
function saveEdit() {
  const title = editTitle.value.trim()
  if (!title) { notice.value = 'Task name cannot be empty.'; return }
  if (updateTask(state, editingTaskId.value, { title, note: editNote.value })) {
    notice.value = 'Task updated.'
    persist()
  }
  cancelEdit()
}
function cancelEdit() { editingTaskId.value = null; editTitle.value = ''; editNote.value = '' }
function handleEditKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); saveEdit() }
  else if (event.key === 'Escape') { event.preventDefault(); cancelEdit() }
}
function setDuration(minutes) { state.timer.duration = minutes * 60; state.timer.remaining = minutes * 60; state.timer.running = false; state.timer.updatedAt = null; persist() }
function startTimer() { if (state.timer.remaining === 0) state.timer.remaining = state.timer.duration; state.timer.running = true; state.timer.updatedAt = Date.now(); persist(); runTicker() }
function pauseTimer() { syncTimer(state.timer); state.timer.running = false; state.timer.updatedAt = null; persist(); clearInterval(ticker) }
function resetTimer() { state.timer.running = false; state.timer.remaining = state.timer.duration; state.timer.updatedAt = null; persist(); clearInterval(ticker) }
function runTicker() { clearInterval(ticker); ticker = setInterval(() => { if (!state.timer.running) return; if (syncTimer(state.timer)) { clearInterval(ticker); notice.value = 'Focus complete. Nice work, night owl.' } persist() }, 1000) }
function recoverTimer() { if (state.timer.running && state.timer.updatedAt != null) { if (syncTimer(state.timer)) notice.value = 'Focus complete. Nice work, night owl.'; else runTicker(); persist() } }
watch(() => state.tasks, persist, { deep: true }); onMounted(() => recoverTimer()); onBeforeUnmount(() => clearInterval(ticker))
</script>
<template>
  <main class="shell">
    <header class="topbar"><a class="brand" href="#" aria-label="Ghostlight home"><span class="brand-mark">✦</span><span>ghostlight</span></a><span class="contest-pill"><span class="dot"></span> Kiroween · solo entry</span></header>
    <section class="hero"><div><p class="eyebrow">THE COSTUME CONTEST COMMAND CENTER</p><h1>Make something<br><em>worth haunting.</em></h1><p class="lede">A tiny, focused room for the work behind the costume. Keep the next step visible. Let the rest stay in the shadows.</p></div><div class="moon" aria-hidden="true"><span>✦</span></div></section>
    <section class="dashboard-grid">
      <section class="card tasks-card" aria-labelledby="tasks-title"><div class="card-head"><div><p class="kicker">01 / THE LIST</p><h2 id="tasks-title">Tonight's rituals</h2></div><span class="count">{{ completed }}/{{ state.tasks.length }} complete</span></div><div class="progress-track" aria-label="Task progress"><span :style="{ width: progress + '%' }"></span></div><form class="add-form" @submit.prevent="addTask"><label class="sr-only" for="task-title">Task name</label><input id="task-title" v-model="newTask" placeholder="Add a new ritual..." maxlength="100" /><button class="add-btn" type="submit" aria-label="Add task">+</button><label class="sr-only" for="task-note">Task note</label><input id="task-note" class="note-input" v-model="newNote" placeholder="Optional note" maxlength="160" /></form><p v-if="notice" class="notice" role="status">{{ notice }}</p><div class="filters" role="tablist" aria-label="Filter tasks"><button v-for="item in [{key:'all',label:'All'},{key:'active',label:'Open'},{key:'done',label:'Done'}]" :key="item.key" :class="{selected: filter === item.key}" @click="filter = item.key" role="tab" :aria-selected="filter === item.key">{{ item.label }}</button></div><div v-if="visibleTasks.length" class="task-list"><article v-for="task in visibleTasks" :key="task.id" class="task-row" :class="{done: task.done, editing: editingTaskId === task.id}"><template v-if="editingTaskId === task.id"><form class="edit-form" @submit.prevent="saveEdit" aria-label="Edit task"><label class="sr-only" :for="'edit-title-' + task.id">Task name</label><input :id="'edit-title-' + task.id" class="edit-title-input" v-model="editTitle" maxlength="100" required autofocus @keydown="handleEditKeydown" /><label class="sr-only" :for="'edit-note-' + task.id">Task note</label><input :id="'edit-note-' + task.id" class="edit-note-input" v-model="editNote" placeholder="Optional note" maxlength="160" @keydown="handleEditKeydown" /><div class="edit-actions"><button type="submit" class="edit-save" aria-label="Save changes">Save</button><button type="button" class="edit-cancel" @click="cancelEdit" aria-label="Cancel editing">Cancel</button></div></form></template><template v-else><button class="check" @click="toggleTask(task)" :aria-label="task.done ? 'Mark incomplete' : 'Mark complete'" :aria-pressed="task.done">{{ task.done ? '✓' : '' }}</button><div class="task-copy"><h3>{{ task.title }}</h3><p v-if="task.note">{{ task.note }}</p></div><button class="edit-btn" @click="startEdit(task)" aria-label="Edit task">✎</button><button class="delete" @click="removeTask(task)" aria-label="Delete task">×</button></template></article></div><div v-else class="empty"><span>☾</span><strong>{{ filter === 'done' ? 'No completed rituals yet.' : 'The room is quiet.' }}</strong><p>{{ filter === 'done' ? 'Complete a task and it will glow here.' : 'Add your first task above to begin.' }}</p></div></section>
      <aside class="card timer-card" aria-labelledby="timer-title"><div class="card-head"><div><p class="kicker">02 / THE LANTERN</p><h2 id="timer-title">Focus light</h2></div><span class="live-dot" :class="{on: state.timer.running}"></span></div><div class="timer-face"><div class="orb"></div><div class="timer-value" aria-live="polite">{{ timerMinutes }}<span>:</span>{{ timerSeconds }}</div><p>{{ timerLabel }}</p></div><div class="duration-row"><span>Duration</span><div class="duration-buttons"><button v-for="minutes in [15,25,45]" :key="minutes" :class="{active: state.timer.duration === minutes*60}" @click="setDuration(minutes)">{{ minutes }}m</button></div></div><div class="timer-actions"><button v-if="!state.timer.running" class="primary" @click="startTimer">{{ state.timer.remaining < state.timer.duration ? 'Resume focus' : 'Start focus' }} <span>→</span></button><button v-else class="primary" @click="pauseTimer">Pause focus <span>Ⅱ</span></button><button class="secondary" @click="resetTimer">Reset</button></div><p class="timer-hint">Your focus persists if you refresh. No account, no noise.</p></aside>
    </section>
    <footer><span>Made for the in-between hours.</span><span>Local draft · your data stays in this browser</span></footer>
  </main>
</template>
