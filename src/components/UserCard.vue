<template>
  <div 
    class="card h-100 shadow-sm border-0 rounded-4 user-card"
    :class="{ 'clickable': isCurrentUser }"
    @click="goToHome"
  >
    <div class="card-header bg-primary text-white py-2 px-3 rounded-top-4">
      <h6 class="mb-0 d-flex align-items-center gap-2">
        <i class="bi bi-person-circle"></i>
        {{ userEmail }}
      </h6>
    </div>
    <div class="card-body p-3">
      <div v-if="userTasks.length === 0" class="text-muted small text-center py-3">
        No tasks yet
      </div>
      <ul v-else class="list-unstyled mb-0">
        <li 
          v-for="task in userTasks" 
          :key="task.id"
          class="mb-2 small"
          :class="{ 'text-decoration-line-through text-muted': task.completed }"
        >
          <i :class="task.completed ? 'bi bi-check-circle-fill text-success' : 'bi bi-circle'"></i>
          {{ task.text }}
          <span v-if="task.dueDate" class="text-danger ms-1">
            ({{ formatDate(task.dueDate) }})
          </span>
        </li>
      </ul>
    </div>
    <div class="card-footer text-center py-2" v-if="isCurrentUser">
      <small class="text-primary fw-bold">
        <i class="bi bi-box-arrow-in-right"></i> Click to Edit
      </small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  userEmail: String,
  tasks: Array,
  currentUserEmail: String
})

const router = useRouter()
const isCurrentUser = computed(() => props.userEmail === props.currentUserEmail)

const userTasks = computed(() => 
  props.tasks
    .filter(t => t.createdBy === props.userEmail)
    .slice(0, 5)
)

function goToHome() {
  if (isCurrentUser.value) {
    router.push('/home')
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}
</script>

<style scoped>
.user-card { transition: all 0.3s ease; }
.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
}
.clickable { cursor: pointer; }
</style>