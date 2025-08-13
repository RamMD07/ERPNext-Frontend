<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
    <Transition name="scale" appear>
      <Card class="w-full max-w-md shadow-2xl border-0">
        <div class="p-8">
          <!-- Header -->
          <div class="text-center mb-8">
            <Transition name="bounce" appear>
              <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
                <Building2Icon class="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
            </Transition>
            
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to ERPNext
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Sign in to access your workspace
            </p>
          </div>

          <!-- Error Message -->
          <Transition name="slide-down">
            <ErrorMessage v-if="error" :message="error" class="mb-6" />
          </Transition>

          <!-- Login Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <FormControl
              label="Email or Username"
              v-model="formData.username"
              type="text"
              placeholder="Enter your email or username"
              required
              autocomplete="username"
            >
              <template #prefix>
                <MailIcon class="h-4 w-4" />
              </template>
            </FormControl>

            <FormControl
              label="Password"
              v-model="formData.password"
              type="password"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
            >
              <template #prefix>
                <LockIcon class="h-4 w-4" />
              </template>
            </FormControl>

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

          <!-- Footer -->
          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Powered by Frappe Framework
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Transition>

    <!-- Demo Credentials -->
    <Transition name="fade" appear>
      <Card class="mt-4 p-4 bg-gray-100 dark:bg-gray-800">
        <p class="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
          Demo Credentials:
        </p>
        <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>Username: <code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">Administrator</code></div>
          <div>Password: <code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">admin</code></div>
        </div>
      </Card>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Building2Icon, MailIcon, LockIcon } from 'lucide-vue-next'
import { Button, Card, FormControl } from 'frappe-ui'
import { useAuthStore } from '@/stores/auth'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  username: '',
  password: '',
})
const error = ref('')

// Redirect if already authenticated
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    router.push('/')
  }
}, { immediate: true })

const handleSubmit = async () => {
  error.value = ''

  try {
    await authStore.login(formData.value.username, formData.value.password)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please check your credentials.'
  }
}
</script>

<style scoped>
.scale-enter-active, .scale-leave-active {
  transition: all 0.3s ease;
}
.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.bounce-enter-active {
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>