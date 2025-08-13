<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ doctype }} List
      </h1>
      <Button variant="solid" @click="handleCreate">
        <PlusIcon class="h-4 w-4 mr-1" />
        New {{ doctype }}
      </Button>
    </div>
    
    <Card>
      <div class="p-6">
        <p class="text-gray-600 dark:text-gray-400">List view for {{ doctype }} will be implemented here.</p>
        <p class="mt-2">This will include:</p>
        <ul class="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
          <li>Dynamic table with metadata-driven columns</li>
          <li>Advanced filtering and sorting</li>
          <li>Bulk operations</li>
          <li>Export functionality</li>
          <li>Real-time updates</li>
        </ul>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PlusIcon } from 'lucide-vue-next'
import { Button, Card } from 'frappe-ui'

interface Props {
  module: string
  doctype: string
}

const props = defineProps<Props>()
const router = useRouter()

const handleCreate = () => {
  router.push(`/${props.module}/${props.doctype}/new`)
}
</script>