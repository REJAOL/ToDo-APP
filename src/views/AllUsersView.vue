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
import { onAuthStateChanged } from 'firebase/auth'
import UserCard from '../components/UserCard.vue'
import Navbar from '../components/Navbar.vue'

const currentUserEmail = ref('')

// সব ইউজারের সব টাস্ক (subcollection থেকে)
const allTasksQuery = query(collectionGroup(db, 'tasks'))
const allTasksData = useCollection(allTasksQuery)
const allTasks = computed(() => allTasksData.value || [])

// ইউজার অনুযায়ী গ্রুপ
const userTaskGroups = computed(() => {
  const groups = {}
  allTasks.value.forEach(task => {
    const email = task.createdBy || 'Unknown User'
    if (!groups[email]) {
      groups[email] = { email, tasks: [] }
    }
    groups[email].tasks.push(task)
  })
  return Object.values(groups).sort((a, b) => a.email.localeCompare(b.email))
})

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserEmail.value = user.email
    } else {
      currentUserEmail.value = ''
    }
  })
})
</script>

<style scoped>
.text-muted { opacity: 0.7; }
</style>