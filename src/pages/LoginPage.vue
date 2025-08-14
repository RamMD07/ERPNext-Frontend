<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
    <Card class="w-full max-w-md shadow-2xl">
      <div class="p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Building2Icon class="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to ERPNext
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Sign in to access your workspace
          </p>
        </div>

        <!-- Connection Status -->
        <div class="mb-6 p-3 rounded-lg" :class="connectionStatusClass">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 rounded-full" :class="connectionDotClass"></div>
            <span class="text-sm font-medium">{{ connectionStatus }}</span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="flex items-center space-x-2">
            <AlertTriangleIcon class="h-4 w-4 text-red-500 flex-shrink-0" />
            <span class="text-sm text-red-700 dark:text-red-400">{{ error }}</span>
          </div>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email or Username
            </label>
            <div class="relative">
              <input
                v-model="formData.username"
                type="text"
                placeholder="Enter your email or username"
                required
                autocomplete="username"
                class="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
              <MailIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div class="relative">
              <input
                v-model="formData.password"
                type="password"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
                class="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
              <LockIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Button
            type="submit"
            variant="solid"
            size="lg"
            class="w-full"
            :loading="authStore.isLoading"
            :disabled="!formData.username || !formData.password"
          >
            Sign In
          </Button>
        </form>

        <!-- Server Configuration -->
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <details class="group">
            <summary class="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              Server Configuration
            </summary>
            <div class="mt-3 space-y-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Server URL
                </label>
                <input
                  v-model="serverUrl"
                  type="url"
                  placeholder="http://localhost:8000"
                  class="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                @click="testConnection"
                :loading="testingConnection"
                class="w-full"
              >
                Test Connection
              </Button>
            </div>
          </details>
        </div>

        <!-- Demo Credentials -->
        <div class="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
            Demo Credentials:
          </p>
          <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>Username: <code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">Administrator</code></div>
            <div>Password: <code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">admin</code></div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Building2Icon, MailIcon, LockIcon, AlertTriangleIcon } from 'lucide-vue-next'
import { Button, Card } from 'frappe-ui'
import { useAuthStore } from '@/stores/auth'
import { frappeAPI } from '@/composables/useApi'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  username: '',
  password: '',
})
const error = ref('')
const serverUrl = ref('http://localhost:8000')
const testingConnection = ref(false)
const connectionTested = ref(false)
const connectionWorking = ref(false)

const connectionStatus = computed(() => {
  if (!connectionTested.value) return 'Connection not tested'
  return connectionWorking.value ? 'Connected to ERPNext' : 'Connection failed'
})

const connectionStatusClass = computed(() => {
  if (!connectionTested.value) return 'bg-gray-100 dark:bg-gray-800'
  return connectionWorking.value ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
})

const connectionDotClass = computed(() => {
  if (!connectionTested.value) return 'bg-gray-400'
  return connectionWorking.value ? 'bg-green-500' : 'bg-red-500'
})

const testConnection = async () => {
  testingConnection.value = true
  connectionTested.value = false
  
  try {
    // Update API base URL
    frappeAPI.baseURL = serverUrl.value
    
    // Test connection by trying to get version info
    const response = await fetch(`${serverUrl.value}/api/method/version`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (response.ok) {
      connectionWorking.value = true
      connectionTested.value = true
    } else {
      throw new Error('Server responded with error')
    }
  } catch (err) {
    connectionWorking.value = false
    connectionTested.value = true
    console.error('Connection test failed:', err)
  } finally {
    testingConnection.value = false
  }
}

const handleSubmit = async () => {
  error.value = ''

  if (!connectionWorking.value) {
    error.value = 'Please test the server connection first'
    return
  }

  try {
    await authStore.login(formData.value.username, formData.value.password)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please check your credentials.'
  }
}

onMounted(() => {
  // Test connection on mount
  testConnection()
})
</script>