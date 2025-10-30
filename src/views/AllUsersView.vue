<template>
  <Navbar />
  <div class="container mt-4 pb-5">
    <h1 class="text-center mb-5 fw-bold">All Users' Todo Cards</h1>
    <div class="row g-4">
      <div v-for="user in userTaskGroups" :key="user.email" class="col-md-6 col-lg-4">
        <UserCard 
          :userEmail="user.email"
          :tasks="user.tasks"
          :currentUserEmail="currentUserEmail"
        />
      </div>
    </div>
    <div v-if="userTaskGroups.length === 0" class="text-center text-muted py-5">
      <p>No tasks from any user yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collectionGroup, query } from 'firebase/firestore'
import { useCollection } from 'vuefire'
import { db, auth } from '../firebase'
import { onAuthStateChanged, listUsers } from 'firebase/auth' // নতুন
import UserCard from '../components/UserCard.vue'
import Navbar from '../components/Navbar.vue'

const currentUserEmail = ref('')
const allTasks = ref([])
const registeredUsers = ref([]) // নতুন

// সব টাস্ক
const tasksQuery = query(collectionGroup(db, 'tasks'))
const tasksData = useCollection(tasksQuery)

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserEmail.value = user.email

      // Firebase Auth থেকে সব ইউজার নিয়ে আসো
      try {
        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${import.meta.env.VITE_FIREBASE_API_KEY}`,
          {
            method: 'POST',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' }
          }
        )
        const data = await response.json()
        registeredUsers.value = data.users?.map(u => u.email) || []
      } catch (error) {
        console.error("Failed to fetch users:", error)
      }
    }
  })
})

// গ্রুপিং + সব রেজিস্টার্ড ইউজার
const userTaskGroups = computed(() => {
  const groups = {}

  // টাস্ক থেকে
  tasksData.value.forEach(task => {
    const email = task.createdBy || 'Unknown'
    if (!groups[email]) groups[email] = { email, tasks: [] }
    groups[email].tasks.push(task)
  })

  // সব রেজিস্টার্ড ইউজার যোগ করো
  registeredUsers.value.forEach(email => {
    if (!groups[email]) {
      groups[email] = { email, tasks: [] }
    }
  })

  return Object.values(groups).sort((a, b) => a.email.localeCompare(b.email))
})
</script>

<style scoped>
.text-muted { opacity: 0.7; }
</style>