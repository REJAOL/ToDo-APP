<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

async function register() {
  try {
    // 🔹 Step 1: Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    console.log('✅ Auth user created:', user.email)

    // 🔹 Step 2: Wait for Firebase Auth to confirm the user session (token ready)
    await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          console.log('👤 Auth state confirmed:', currentUser.email)

          // 🔹 Step 3: Create user document in Firestore
          await setDoc(doc(db, 'users', currentUser.uid), {
            email: currentUser.email,
            createdAt: serverTimestamp(),
            tasks: []
          })

          console.log('✅ Firestore doc created for:', currentUser.email)

          unsubscribe() // stop listener
          resolve()
          router.push('/')
        }
      })
    })
  } catch (err) {
    console.error('❌ Firebase Error:', err)
    error.value = err.message
  }
}
</script>

<template>
  <div>
    <h2>Register</h2>
    <p v-if="error" style="color: red">{{ error }}</p>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password (6+ chars)" />
    <button @click="register">Register</button>
  </div>
</template>
