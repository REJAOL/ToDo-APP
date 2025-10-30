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
import { collectionGroup, query, collection, getDocs } from 'firebase/firestore'
import { useCollection } from 'vuefire'
import { db, auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import UserCard from '../components/UserCard.vue'
import Navbar from '../components/Navbar.vue'

const currentUserEmail = ref('')
const registeredEmails = ref([])

// সব টাস্ক (collectionGroup)
const tasksQuery = query(collectionGroup(db, 'tasks'))
const tasksData = useCollection(tasksQuery)

onMounted(async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserEmail.value = user.email

      // Firestore থেকে সব ইউজারের email নিয়ে আসো
      try {
        const usersSnap = await getDocs(collection(db, 'users'))
        registeredEmails.value = usersSnap.docs
          .map(doc => doc.data().email)
          .filter(email => email) // null বাদ
      } catch (error) {
        console.error("Failed to load users:", error)
      }
    }
  })
})

// গ্রুপিং + সব রেজিস্টার্ড ইউজার
const userTaskGroups = computed(() => {
  const groups = {}

  // টাস্ক থেকে গ্রুপ
  tasksData.value.forEach(task => {
    const email = task.createdBy || 'Unknown'
    if (!groups[email]) groups[email] = { email, tasks: [] }
    groups[email].tasks.push(task)
  })

  // সব রেজিস্টার্ড ইউজার যোগ করো
  registeredEmails.value.forEach(email => {
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