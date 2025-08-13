import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State
  const theme = ref<'light' | 'dark'>('light')
  const sidebarCollapsed = ref(false)
  const currentModule = ref('Setup')
  const loading = ref(false)

  // Getters
  const isDark = computed(() => theme.value === 'dark')
  const isLoading = computed(() => loading.value)

  // Actions
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    updateTheme()
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    updateTheme()
  }

  const updateTheme = () => {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme.value)
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebarCollapsed', String(collapsed))
  }

  const setCurrentModule = (module: string) => {
    currentModule.value = module
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  // Initialize from localStorage
  const initUI = () => {
    // Initialize theme
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (storedTheme) {
      theme.value = storedTheme
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    updateTheme()

    // Initialize sidebar state
    const storedSidebar = localStorage.getItem('sidebarCollapsed')
    if (storedSidebar) {
      sidebarCollapsed.value = storedSidebar === 'true'
    }
  }

  return {
    // State
    theme,
    sidebarCollapsed,
    currentModule,
    loading,
    
    // Getters
    isDark,
    isLoading,
    
    // Actions
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebarCollapsed,
    setCurrentModule,
    setLoading,
    initUI
  }
}, {
  persist: {
    key: 'ui-store',
    storage: localStorage,
    paths: ['theme', 'sidebarCollapsed', 'currentModule']
  }
})