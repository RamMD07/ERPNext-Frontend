<template>
  <div class="space-y-6">
    <!-- Breadcrumb -->
    <div class="flex items-center space-x-4">
      <Button
        variant="ghost"
        size="sm"
        @click="$router.go(-1)"
      >
        <ArrowLeftIcon class="h-4 w-4 mr-1" />
        Back
      </Button>
      
      <nav class="flex items-center space-x-2 text-sm text-gray-500">
        <span>{{ module }}</span>
        <span>/</span>
        <span>{{ doctype }}</span>
        <template v-if="docname">
          <span>/</span>
          <span class="font-medium">{{ docname }}</span>
        </template>
      </nav>
    </div>

    <!-- Dynamic Form -->
    <DynamicForm
      v-if="doctype"
      :doctype="doctype"
      :docname="docname"
      :mode="mode"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from 'lucide-vue-next'
import { Button } from 'frappe-ui'
import DynamicForm from '@/components/forms/DynamicForm.vue'

interface Props {
  module: string
  doctype: string
  docname?: string
  mode: 'create' | 'edit' | 'view'
}

const props = defineProps<Props>()
const router = useRouter()

const handleSave = (doc: any) => {
  console.log('Document saved:', doc)
  router.push(`/${props.module}/${props.doctype}`)
}

const handleCancel = () => {
  router.go(-1)
}
</script>