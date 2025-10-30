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
    // 1. ইউজার তৈরি করো
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    // 2. Firestore-এ সেভ করো
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email
    })

    console.log('✅ User saved:', user.email)
    router.push('/')
  } catch (err) {
    console.error('❌ Error:', err.code, err.message)
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