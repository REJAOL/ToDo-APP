// src/router/index.js — ফুল কোড
import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from '../firebase'

const auth = getAuth(app)

const routes = [
  { 
    path: '/',
    name: 'AllUsers',
    component: () => import('../views/AllUsersView.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/login', 
    name: 'Login',
    component: () => import('../views/Login.vue') 
  },
  { 
    path: '/home', 
    name: 'Home', 
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true } 
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth Guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  onAuthStateChanged(auth, (user) => {
    if (requiresAuth && !user) {
      next('/login')
    } else if (to.path === '/login' && user) {
      next('/')
    } else {
      next()
    }
  })
})

export default router 