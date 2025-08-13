<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 lg:px-6">
    <!-- Left Section - Search -->
    <div class="flex items-center flex-1 max-w-md">
      <form @submit.prevent="handleSearch" class="relative w-full">
        <div class="relative">
          <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Search documents, reports..."
            class="w-full pl-10 pr-16"
            @focus="searchOpen = true"
            @blur="() => setTimeout(() => searchOpen = false, 200)"
          />
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <kbd class="inline-flex items-center px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">
              <CommandIcon class="h-3 w-3 mr-0.5" />
              K
            </kbd>
          </div>
        </div>
        
        <!-- Search Results Dropdown -->
        <Transition name="dropdown">
          <div 
            v-if="searchOpen && searchQuery" 
            class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
          >
            <div class="p-2">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">
                Recent Searches
              </div>
              <div class="space-y-1">
                <button class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                  <div class="flex items-center">
                    <FileTextIcon class="h-4 w-4 mr-2 text-gray-400" />
                    Customer - Sample Customer
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </form>
    </div>

    <!-- Right Section -->
    <div class="flex items-center space-x-2">
      <!-- Quick Create -->
      <Button variant="solid" size="sm">
        <PlusIcon class="h-4 w-4 mr-1" />
        Create
      </Button>

      <!-- Theme Toggle -->
      <Button
        variant="ghost"
        size="sm"
        @click="uiStore.toggleTheme"
        class="p-2"
      >
        <MoonIcon v-if="!uiStore.isDark" class="h-5 w-5" />
        <SunIcon v-else class="h-5 w-5" />
      </Button>

      <!-- Notifications -->
      <Button variant="ghost" size="sm" class="relative p-2">
        <BellIcon class="h-5 w-5" />
        <span class="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
      </Button>

      <!-- User Menu -->
      <Dropdown>
        <template #default="{ open }">
          <Button
            variant="ghost"
            :class="[
              'flex items-center space-x-2 p-2',
              { 'bg-gray-100 dark:bg-gray-800': open }
            ]"
          >
            <div class="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
              <UserIcon class="h-4 w-4 text-white" />
            </div>
            <div class="hidden md:block text-left">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ authStore.userName || 'User' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ authStore.user?.email }}
              </div>
            </div>
          </Button>
        </template>
        
        <template #options>
          <div class="py-1">
            <DropdownItem>
              <UserIcon class="h-4 w-4 mr-3" />
              Profile
            </DropdownItem>
            <DropdownItem>
              <SettingsIcon class="h-4 w-4 mr-3" />
              Settings
            </DropdownItem>
            <div class="border-t border-gray-200 dark:border-gray-600 my-1" />
            <DropdownItem @click="handleLogout" class="text-red-600 dark:text-red-400">
              <LogOutIcon class="h-4 w-4 mr-3" />
              Sign out
            </DropdownItem>
          </div>
        </template>
      </Dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  SearchIcon, 
  BellIcon, 
  UserIcon, 
  MoonIcon, 
  SunIcon, 
  SettingsIcon, 
  LogOutIcon,
  PlusIcon,
  CommandIcon,
  FileTextIcon
} from 'lucide-vue-next'
import { Button, Input, Dropdown, DropdownItem } from 'frappe-ui'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const authStore = useAuthStore()
const uiStore = useUIStore()

const searchOpen = ref(false)
const searchQuery = ref('')

const handleSearch = () => {
  console.log('Search for:', searchQuery.value)
  // Implement global search functionality
}

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>