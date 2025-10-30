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
      <p>No users found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { collectionGroup, query } from 'firebase/firestore'
import { useCollection } from 'vuefire'
import { db, auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import UserCard from '../components/UserCard.vue'
import Navbar from '../components/Navbar.vue'

const currentUserEmail = ref('')

// রিয়েল-টাইমে tasks
const tasksQuery = query(collectionGroup(db, 'tasks'))
const tasksData = useCollection(tasksQuery)

// রিয়েল-টাইমে users
const usersData = useCollection(collection(db, 'users'))
const registeredEmails = computed(() => usersData.value.map(u => u.email).filter(Boolean))

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserEmail.value = user.email
      console.log('Logged in as:', user.email)
      console.log('Users loaded:', registeredEmails.value)
      console.log('Tasks loaded:', tasksData.value?.length || 0)
    }
  })
})

// গ্রুপিং
const userTaskGroups = computed(() => {
  const groups = {}

  // টাস্ক থেকে
  tasksData.value.forEach(task => {
    const email = task.createdBy || 'Unknown'
    if (!groups[email]) groups[email] = { email, tasks: [] }
    groups[email].tasks.push(task)
  })

  // রেজিস্টার্ড ইউজার
  registeredEmails.value.forEach(email => {
    if (!groups[email]) groups[email] = { email, tasks: [] }
  })

  const result = Object.values(groups).sort((a, b) => a.email.localeCompare(b.email))
  console.log('Final groups:', result)
  return result
})
</script>

<style scoped>
.text-muted { opacity: 0.7; }
</style>