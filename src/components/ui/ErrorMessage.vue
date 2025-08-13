<template>
  <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
    <AlertTriangleIcon class="h-4 w-4 text-red-500 flex-shrink-0" />
    <span class="text-sm text-red-700 dark:text-red-400">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangleIcon } from 'lucide-vue-next'

interface Props {
  message: string
}

defineProps<Props>()
</script>