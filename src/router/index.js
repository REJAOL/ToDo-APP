// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import { getAuth } from 'firebase/auth'  // <-- এটা
import { app } from '../firebase'       // <-- app import

const auth = getAuth(app)  // <-- নতুন করে তৈরি করো

const routes = [
  { path: '/',
    name:'AllUsers',
    component : ()=> import('../views/AllUsersView.vue')
   },
  { path: '/login', component: Login },
  { path: '/home', 
    name: Home, 
    component:()=>import('../views/Home.vue'),
    meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)
  
  const unsubscribe = auth.onAuthStateChanged(user => {
    unsubscribe()
    if (requiresAuth && !user) {
      next('/login')
    } else if (to.path === '/login' && user) {
      next('/home')
    } else {
      next()
    }
  })
})

export default router