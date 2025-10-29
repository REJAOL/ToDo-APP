<script setup>
import { ref, computed, onMounted, watchEffect, watch } from 'vue'
import { useCollection } from 'vuefire'
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import Navbar from '../components/Navbar.vue'

const router = useRouter()

// === 1. Reactive States ===
const newTaskText = ref('')
const newDueDate = ref('')
const newRemind = ref(false)
const search = ref('')
const filter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 5

// === 2. Tasks (User-based) ===
const tasksCollection = computed(() => {
  if (!auth.currentUser) return null
  return collection(db, 'users', auth.currentUser.uid, 'tasks')
})

const tasksData = useCollection(tasksCollection)
const tasks = computed(() => tasksData.value || [])

// === 3. Computed ===
const filteredTasks = computed(() => {
  let list = tasks.value
  if (search.value) {
    list = list.filter(t => t.text?.toLowerCase().includes(search.value.toLowerCase()))
  }
  if (filter.value === 'active') list = list.filter(t => !t.completed)
  if (filter.value === 'completed') list = list.filter(t => t.completed)
  return list
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTasks.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredTasks.value.length / itemsPerPage) || 1)
const completedCount = computed(() => tasks.value.filter(t => t.completed).length)

// === 4. Functions ===

async function addTask() {
  const text = newTaskText.value.trim()
  if (text && auth.currentUser) {
    await addDoc(collection(db, 'users', auth.currentUser.uid, 'tasks'), {
      text,
      completed: false,
      isEditing: false,
      dueDate: newDueDate.value,
      remind: newRemind.value,
      createdBy: auth.currentUser.email
    })
    newTaskText.value = ''
    newDueDate.value = ''
    newRemind.value = false
    currentPage.value = 1
  }
}

function deleteTask(i) {
  const idx = i + (currentPage.value - 1) * itemsPerPage
  const task = tasks.value[idx]
  if (task && task.id && auth.currentUser) {
    deleteDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', task.id))
  }
}

function startEdit(i) {
  const idx = i + (currentPage.value - 1) * itemsPerPage
  const task = tasks.value[idx]
  if (task) task.isEditing = true
}

function saveEdit(i) {
  const idx = i + (currentPage.value - 1) * itemsPerPage
  const task = tasks.value[idx]
  if (task && task.id && auth.currentUser) {
    updateDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', task.id), {
      text: task.text.trim(),
      isEditing: false,
      dueDate: task.dueDate,
      remind: task.remind
    })
  }
}

function cancelEdit(i) {
  const idx = i + (currentPage.value - 1) * itemsPerPage
  const task = tasks.value[idx]
  if (task) task.isEditing = false
}

function updateTaskStatus(i) {
  const idx = i + (currentPage.value - 1) * itemsPerPage
  const task = tasks.value[idx]
  if (task && task.id && auth.currentUser) {
    updateDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', task.id), {
      completed: task.completed
    })
  }
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function checkReminders() {
  if (!auth.currentUser || !('Notification' in window) || Notification.permission !== 'granted') return
  const now = Date.now()
  tasks.value.forEach(t => {
    if (t.remind && t.dueDate && !t.completed && t.id) {
      const due = new Date(t.dueDate).getTime()
      if (due > now && due - now < 60000) {
        new Notification('Task Due!', { body: t.text })
        updateDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', t.id), { remind: false })
      }
    }
  })
}

// Pagination Reset
watchEffect(() => {
  if (filteredTasks.value.length === 0 && currentPage.value > 1) currentPage.value = 1
})

watch(tasks, () => {
  const max = Math.ceil(tasks.value.length / itemsPerPage) || 1
  if (currentPage.value > max) currentPage.value = max
})

// === 5. Auth Check ===
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (!user) router.push('/login')
  })

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
  setInterval(checkReminders, 60000)
  checkReminders()
})
</script>

<template>
  <Navbar />

  <div class="container mt-4 pb-5">
    <h1 class="text-center mb-4 fw-bold">My Todo List</h1>

    <!-- Add Task Form -->
    <div class="card mb-4 shadow-sm border-0 rounded-4">
      <div class="card-body">
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <input v-model="newTaskText" placeholder="Task name" class="form-control" @keyup.enter="addTask" />
          </div>
          <div class="col-md-3">
            <input v-model="newDueDate" type="date" class="form-control" />
          </div>
          <div class="col-md-2">
            <div class="form-check">
              <input v-model="newRemind" type="checkbox" class="form-check-input" id="remind" />
              <label class="form-check-label small" for="remind">Remind</label>
            </div>
          </div>
          <div class="col-md-3">
            <button @click="addTask" class="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2">
              <i class="bi bi-plus-circle-fill"></i> Add Task
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Search + Filter -->
    <div class="row mb-3 g-2">
      <div class="col-md-6">
        <input v-model="search" placeholder="Search..." class="form-control" />
      </div>
      <div class="col-md-6">
        <select v-model="filter" class="form-select">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>

    <!-- Task List -->
    <div v-for="(task, i) in paginatedTasks" :key="task.id" class="card mb-3 shadow-sm border-0 rounded-4">
      <div class="card-body p-4 d-flex align-items-center gap-3">
        <input type="checkbox" v-model="task.completed" class="form-check-input" @change="updateTaskStatus(i)" />

        <div class="flex-grow-1" v-if="!task.isEditing">
          <div :class="{ 'text-decoration-line-through text-muted': task.completed }" class="task-text">
            {{ task.text }}
          </div>
          <small v-if="task.dueDate" class="text-danger">Due: {{ formatDate(task.dueDate) }}</small>
        </div>

        <div v-else class="d-flex gap-2 align-items-center flex-grow-1 flex-wrap">
          <input v-model="task.text" class="form-control form-control-sm flex-grow-1" @keyup.enter="saveEdit(i)" />
          <input v-model="task.dueDate" type="date" class="form-control form-control-sm" style="width: 140px;" />
          <div class="form-check">
            <input v-model="task.remind" type="checkbox" class="form-check-input" />
            <label class="form-check-label small">Remind</label>
          </div>
          <button @click="saveEdit(i)" class="btn btn-success btn-sm">Save</button>
          <button @click="cancelEdit(i)" class="btn btn-secondary btn-sm">Cancel</button>
        </div>

        <div class="d-flex gap-1">
          <button v-if="!task.isEditing" @click="startEdit(i)" class="btn btn-warning btn-sm d-flex align-items-center gap-1">
            <i class="bi bi-pencil-square"></i> Edit
          </button>
          <button v-if="!task.isEditing && task.completed" @click="deleteTask(i)" class="btn btn-danger btn-sm d-flex align-items-center gap-1">
            <i class="bi bi-trash-fill"></i> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="text-center my-4">
      <p class="fs-5 fw-bold text-primary">
        Total: {{ tasks.length }} | Completed: {{ completedCount }}
      </p>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-center gap-3 my-4">
      <button class="btn btn-outline-secondary" :disabled="currentPage === 1" @click="currentPage--">Prev</button>
      <span class="fw-bold align-self-center">Page {{ currentPage }} of {{ totalPages }}</span>
      <button class="btn btn-outline-secondary" :disabled="currentPage === totalPages" @click="currentPage++">Next</button>
    </div>
  </div>
</template>


<style scoped>
/* === LIGHT MODE (Soft Lavender Gradient) === */
html:not(.dark),
html:not(.dark) body {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
  color: #0d47a1 !important;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

/* === DARK MODE (কালো) === */
html.dark,
html.dark body {
  background: #121212 !important;
  color: #ffffff !important;
}

/* Cards */
.card {
  border-radius: 18px !important;
  transition: all 0.3s ease;
  box-shadow: 0 6px 16px rgba(124, 77, 255, 0.12);
  border: none !important;
}

html:not(.dark) .card {
  background: #ffffff !important;
  border: 1px solid #e0d4ff !important;
}

html.dark .card {
  background: #1e1e1e !important;
  border: 1px solid #333 !important;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 28px rgba(124, 77, 255, 0.2) !important;
}

/* Task Text */
.task-text {
  color: inherit !important;
  font-weight: 500;
  font-size: 1.05rem;
}

html.dark .task-text {
  color: #ffffff !important;
}

html.dark .text-muted {
  color: #bbbbbb !important;
}

/* Inputs */
.form-control, .form-select {
  border-radius: 14px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  border: 1px solid #d1c4e9;
}

html:not(.dark) .form-control,
html:not(.dark) .form-select {
  background: #ffffff;
  border: 1px solid #d1c4e9;
  color: #2d1b69;
}

html.dark .form-control,
html.dark .form-select {
  background: #2d2d2d !important;
  border: 1px solid #444 !important;
  color: #ffffff !important;
}

html.dark .form-control:focus,
html.dark .form-select:focus {
  background: #3a3a3a !important;
  border-color: #7c4dff !important;
  box-shadow: 0 0 0 0.2rem rgba(124, 77, 255, 0.3) !important;
}

/* Buttons */
.btn {
  border-radius: 14px;
  font-weight: 600;
  padding: 0.65rem 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.btn-success {
  background: #6c5ce7 !important;
  border: none;
}

.btn-warning {
  background: #fd79a8 !important;
  color: white !important;
  border: none;
}

.btn-danger {
  background: #e84393 !important;
  border: none;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 14px rgba(124, 77, 255, 0.25);
}

/* Accent */
.text-primary { color: #7c4dff !important; }
.text-danger { color: #e84393 !important; }
.text-success { color: #6c5ce7 !important; }

/* Checkbox */
.form-check-input {
  width: 1.5em;
  height: 1.5em;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #b794f4;
}

html.dark .form-check-input {
  background-color: #2d2d2d;
  border-color: #444;
}

html.dark .form-check-input:checked {
  background-color: #7c4dff;
  border-color: #7c4dff;
}

/* Navbar */
.navbar {
  border-bottom: 1px solid #e0d4ff;
}

html.dark .navbar {
  border-bottom: 1px solid #333;
}

/* Responsive */
@media (max-width: 768px) {
  .row > div { margin-bottom: 0.6rem; }
  .btn { width: 100%; justify-content: center; }
  .card-body { padding: 1rem; }
}
</style>