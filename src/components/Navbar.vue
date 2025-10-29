<script setup>
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()
const isDark = ref(localStorage.getItem('theme') === 'dark')
const userEmail = ref('')

onMounted(() => {
  if (auth.currentUser) userEmail.value = auth.currentUser.email
  applyTheme()
})

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  applyTheme()
}

function applyTheme() {
  const html = document.documentElement
  const body = document.body

  if (isDark.value) {
    html.classList.add('dark')
    body.style.background = '#121212'
    html.style.background = '#121212'
  } else {
    html.classList.remove('dark')
    body.style.background = 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
    html.style.background = 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
  }
}

async function logout() {
  await signOut(auth)
  router.push('/login')
}
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top shadow-sm" :class="isDark ? 'bg-dark navbar-dark' : 'bg-white navbar-light'">
    <div class="container">
      <a class="navbar-brand fw-bold fs-4" href="#">
        <span class="text-primary">My</span><span class="text-success">Todo</span>
      </a>

      <div class="d-flex align-items-center gap-3">
        <span class="text-muted small d-none d-md-block">{{ userEmail }}</span>

        <!-- Dark Mode Toggle -->
        <button @click="toggleTheme" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
          <i :class="isDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill'"></i>
          <span class="d-none d-sm-inline">{{ isDark ? 'Light' : 'Dark' }}</span>
        </button>

        <!-- Logout -->
        <button @click="logout" class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
          <i class="bi bi-box-arrow-right"></i>
          <span class="d-none d-sm-inline">Logout</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.dark .navbar { border-bottom: 1px solid #333; }
</style>