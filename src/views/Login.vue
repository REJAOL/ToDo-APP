<script setup>
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase';

const router = useRouter()
const email = ref('')
const password = ref('')
const isLogin =ref(true)
const error =ref('')

async function handleAuth(){
    try {
        if(isLogin.value){
            await signInWithEmailAndPassword(auth,email.value,password.value)

        }else{
            await createUserWithEmailAndPassword(auth, email.value, password.value)
        }
        router.push('/')
    } catch (err) {
        error.value = err.message
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