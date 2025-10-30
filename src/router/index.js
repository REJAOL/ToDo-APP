// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { getAuth } from 'firebase/auth'
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

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)
  
  const unsubscribe = auth.onAuthStateChanged(user => {
    unsubscribe()
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