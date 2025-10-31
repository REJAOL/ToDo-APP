<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

async function register() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    // Ensure auth context is ready
    await new Promise(resolve => setTimeout(resolve, 500))

    // ✅ Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      createdAt: new Date().toISOString(),
      tasks: []
    })

    console.log('✅ Firestore doc created for:', user.email)
    router.push('/')
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