<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const email = ref('')
const password = ref('')
const error = ref('')
const isLogin = ref(true)
const router = useRouter()

async function handleAuth() {
  error.value = ''
  try {
    let user

    if (isLogin.value) {
      // লগইন
      const cred = await signInWithEmailAndPassword(auth, email.value, password.value)
      user = cred.user
    } else {
      // রেজিস্টার
      const cred = await createUserWithEmailAndPassword(auth, email.value, password.value)
      user = cred.user
    }

    // এই লাইনটা চলতেই হবে
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email
    }, { merge: true })

    console.log('Saved to Firestore:', user.email, user.uid) // ডিবাগ

    router.push('/')
  } catch (err) {
    error.value = err.message
    console.error('Auth error:', err)
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="card mx-auto" style="max-width: 400px;">
      <div class="card-body">
        <h3 class="text-center">{{ isLogin ? 'Login' : 'Register' }}</h3>
        <input v-model="email" placeholder="Email" class="form-control mb-2" />
        <input v-model="password" type="password" placeholder="Password" class="form-control mb-2" />
        <button @click="handleAuth" class="btn btn-primary w-100">
          {{ isLogin ? 'Login' : 'Register' }}
        </button>
        <p class="text-center mt-3">
          <a href="#" @click.prevent="isLogin = !isLogin">
            {{ isLogin ? 'Need account? Register' : 'Have account? Login' }}
          </a>
        </p>
        <p v-if="error" class="text-danger text-center">{{ error }}</p>
      </div>
    </div>
  </div>
</template>