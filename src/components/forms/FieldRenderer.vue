<template>
  <div v-if="!field.hidden && shouldShow" class="space-y-1">
    <!-- Data/Text Fields -->
    <FormControl
      v-if="isTextType"
      :label="field.label"
      :type="getInputType()"
      :model-value="value"
      @update:model-value="$emit('update:value', $event)"
      :placeholder="field.description"
      :disabled="disabled"
      :required="field.reqd"
      :maxlength="field.length"
    />

    <!-- Textarea -->
    <div v-else-if="isTextareaType" class="space-y-1">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500 ml-1">*</span>
      </label>
      <textarea
        :value="value || ''"
        @input="$emit('update:value', ($event.target as HTMLTextAreaElement).value)"
        :placeholder="field.description"
        :disabled="disabled"
        :rows="field.fieldtype === 'Long Text' ? 6 : 3"
        class="block w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200 focus:border-primary-500 focus:ring-primary-500 focus:ring-1 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
      />
    </div>

    <!-- Number Fields -->
    <FormControl
      v-else-if="isNumberType"
      :label="field.label"
      type="number"
      :model-value="value"
      @update:model-value="$emit('update:value', parseNumber($event))"
      :placeholder="field.description"
      :disabled="disabled"
      :required="field.reqd"
      :step="getNumberStep()"
    />

    <!-- Date/DateTime Fields -->
    <FormControl
      v-else-if="isDateType"
      :label="field.label"
      :type="getDateType()"
      :model-value="formatDateValue(value)"
      @update:model-value="$emit('update:value', parseDateValue($event))"
      :disabled="disabled"
      :required="field.reqd"
    />

    <!-- Checkbox -->
    <div v-else-if="field.fieldtype === 'Check'" class="flex items-center space-x-2">
      <input
        :id="field.fieldname"
        type="checkbox"
        :checked="value || false"
        @change="$emit('update:value', ($event.target as HTMLInputElement).checked)"
        :disabled="disabled"
        class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
      />
      <label :for="field.fieldname" class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500 ml-1">*</span>
      </label>
    </div>

    <!-- Select -->
    <div v-else-if="field.fieldtype === 'Select'" class="space-y-1">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500 ml-1">*</span>
      </label>
      <select
        :value="value || ''"
        @change="$emit('update:value', ($event.target as HTMLSelectElement).value)"
        :disabled="disabled"
        class="block w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200 focus:border-primary-500 focus:ring-primary-500 focus:ring-1 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
      >
        <option value="">Select {{ field.label }}</option>
        <option
          v-for="option in getSelectOptions()"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </div>

    <!-- Link -->
    <div v-else-if="field.fieldtype === 'Link'" class="space-y-1">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500 ml-1">*</span>
      </label>
      <div class="relative">
        <select
          :value="value || ''"
          @change="$emit('update:value', ($event.target as HTMLSelectElement).value)"
          :disabled="disabled || linkLoading"
          class="block w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200 focus:border-primary-500 focus:ring-primary-500 focus:ring-1 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        >
          <option value="">Select {{ field.options }}</option>
          <option
            v-for="option in linkOptions"
            :key="option.name"
            :value="option.name"
          >
            {{ option.title || option.full_name || option.name }}
          </option>
        </select>
        <LinkIcon class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
    </div>

    <!-- File Upload -->
    <div v-else-if="isFileType" class="space-y-1">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500 ml-1">*</span>
      </label>
      <div class="flex items-center space-x-2">
        <input
          type="file"
          :accept="field.fieldtype === 'Attach Image' ? 'image/*' : '*/*'"
          @change="handleFileUpload"
          :disabled="disabled"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        <a
          v-if="value"
          :href="value"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-600 hover:text-primary-800"
        >
          <UploadIcon class="h-4 w-4" />
        </a>
      </div>
    </div>

    <!-- Read Only -->
    <div v-else-if="field.fieldtype === 'Read Only'" class="space-y-1">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ field.label }}
      </label>
      <div class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
        {{ value || '-' }}
      </div>
    </div>

    <!-- Heading -->
    <div v-else-if="field.fieldtype === 'Heading'" class="py-2">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {{ field.label }}
      </h3>
    </div>

    <!-- Default fallback -->
    <FormControl
      v-else
      :label="field.label"
      :model-value="value"
      @update:model-value="$emit('update:value', $event)"
      :placeholder="field.description"
      :disabled="disabled"
      :required="field.reqd"
    />

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    
    <!-- Help Text -->
    <p v-else-if="field.description && !error" class="text-xs text-gray-500 dark:text-gray-400">
      {{ field.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { LinkIcon, UploadIcon } from 'lucide-vue-next'
import { FormControl } from 'frappe-ui'
import type { DocField, FieldType } from '@/types/frappe'
import { useApi } from '@/composables/useApi'

interface Props {
  field: DocField
  value: any
  error?: string
  disabled?: boolean
  doctype: string
  allValues: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:value': [value: any]
}>()

const { api } = useApi()
const linkOptions = ref<any[]>([])
const linkLoading = ref(false)

// Computed properties for field types
const isTextType = computed(() => 
  ['Data', 'Small Text'].includes(props.field.fieldtype)
)

const isTextareaType = computed(() => 
  ['Text', 'Long Text'].includes(props.field.fieldtype)
)

const isNumberType = computed(() => 
  ['Int', 'Float', 'Currency', 'Percent'].includes(props.field.fieldtype)
)

const isDateType = computed(() => 
  ['Date', 'Datetime', 'Time'].includes(props.field.fieldtype)
)

const isFileType = computed(() => 
  ['Attach', 'Attach Image'].includes(props.field.fieldtype)
)

const shouldShow = computed(() => {
  if (!props.field.depends_on) return true
  
  // Simple evaluation of depends_on conditions
  const dependsOnField = props.field.depends_on.replace(/^eval:/, '')
  return !!props.allValues[dependsOnField]
})

// Helper methods
const getInputType = () => {
  if (props.field.fieldtype === 'Password') return 'password'
  if (props.field.fieldtype === 'Email') return 'email'
  return 'text'
}

const getNumberStep = () => {
  if (props.field.fieldtype === 'Int') return '1'
  return '0.01'
}

const getDateType = () => {
  switch (props.field.fieldtype) {
    case 'Date': return 'date'
    case 'Datetime': return 'datetime-local'
    case 'Time': return 'time'
    default: return 'date'
  }
}

const parseNumber = (value: string) => {
  if (props.field.fieldtype === 'Int') {
    return parseInt(value) || 0
  }
  return parseFloat(value) || 0
}

const formatDateValue = (value: any) => {
  if (!value) return ''
  
  if (props.field.fieldtype === 'Date') {
    return value.split(' ')[0]
  }
  if (props.field.fieldtype === 'Datetime') {
    return value.replace(' ', 'T').slice(0, 16)
  }
  return value
}

const parseDateValue = (value: string) => {
  if (props.field.fieldtype === 'Datetime') {
    return value.replace('T', ' ') + ':00'
  }
  return value
}

const getSelectOptions = () => {
  return props.field.options?.split('\n').map(option => option.trim()) || []
}

const loadLinkOptions = async () => {
  if (!props.field.options) return
  
  try {
    linkLoading.value = true
    const options = await api.getList(props.field.options, {
      fields: ['name', 'title', props.field.options === 'User' ? 'full_name' : ''],
      limit_page_length: 50
    })
    linkOptions.value = options
  } catch (error) {
    console.error('Failed to load link options:', error)
  } finally {
    linkLoading.value = false
  }
}

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  try {
    const result = await api.uploadFile(file, props.doctype)
    emit('update:value', result.file_url)
  } catch (error) {
    console.error('File upload failed:', error)
  }
}

// Load link options when field type is Link
watch(() => props.field.fieldtype, (newType) => {
  if (newType === 'Link' && props.field.options) {
    loadLinkOptions()
  }
}, { immediate: true })

onMounted(() => {
  if (props.field.fieldtype === 'Link' && props.field.options) {
    loadLinkOptions()
  }
})
</script>