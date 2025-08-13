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
      localStorage.setItem('frappe_session', JSON.stringify(userData))
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
      localStorage.removeItem('frappe_session')
    }
  }

  const setUser = (userData: User | null) => {
    user.value = userData
    if (userData) {
      localStorage.setItem('frappe_session', JSON.stringify(userData))
    } else {
      localStorage.removeItem('frappe_session')
    }
  }

  const checkAuth = async () => {
    try {
      const userData = await frappeAPI.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    }
  }

  const hasRole = (role: string) => {
    return userRoles.value.includes(role)
  }

  const hasAnyRole = (roles: string[]) => {
    return roles.some(role => userRoles.value.includes(role))
  }

  // Initialize from localStorage
  const initAuth = () => {
    const stored = localStorage.getItem('frappe_session')
    if (stored) {
      try {
        const userData = JSON.parse(stored)
        user.value = userData
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        localStorage.removeItem('frappe_session')
      }
    }
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
    setUser,
    checkAuth,
    hasRole,
    hasAnyRole,
    initAuth
  }
})