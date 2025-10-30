<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

async function login() {
  error.value = ''
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    // নতুন: users/{uid} এ email সেভ করো
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email
    }, { merge: true })

    router.push('/')
  } catch (err) {
    error.value = 'Login failed: ' + err.message
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
            {{ isLogin ? 'Need account?' : 'Have account?' }}
          </a>
        </p>
        <p v-if="error" class="text-danger text-center">{{ error }}</p>
      </div>
    </div>
  </div>
</template>