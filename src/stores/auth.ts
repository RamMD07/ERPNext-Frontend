import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/frappe'
import { frappeAPI } from '@/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userRoles = computed(() => user.value?.roles || [])
  const userName = computed(() => user.value?.full_name || user.value?.name || '')

  // Actions
  const login = async (username: string, password: string) => {
    isLoading.value = true
    try {
      const userData = await frappeAPI.login(username, password)
      user.value = userData
      return userData
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await frappeAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
    }
  }

  const checkAuth = async () => {
    try {
      const userData = await frappeAPI.getCurrentUser()
      user.value = userData
      return userData
    } catch (error) {
      console.error('Auth check failed:', error)
      user.value = null
      throw error
    }
  }

  const initAuth = () => {
    frappeAPI.initSession()
  }

  return {
    // State
    user,
    isLoading,
    
    // Getters
    isAuthenticated,
    userRoles,
    userName,
    
    // Actions
    login,
    logout,
    checkAuth,
    initAuth
  }
}, {
  persist: {
    key: 'auth-store',
    storage: localStorage,
    paths: ['user']
  }
})