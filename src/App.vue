<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

onMounted(async () => {
  // Initialize UI settings
  uiStore.initUI()
  
  // Initialize auth
  authStore.initAuth()
  
  // Check authentication status
  if (authStore.isAuthenticated) {
    try {
      await authStore.checkAuth()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }
  
  // Set up router guards
  router.beforeEach((to, from, next) => {
    const requiresAuth = to.meta.requiresAuth !== false
    
    if (requiresAuth && !authStore.isAuthenticated) {
      next('/login')
    } else if (to.path === '/login' && authStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
  })
})
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>