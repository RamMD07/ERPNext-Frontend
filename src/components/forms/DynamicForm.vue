<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <Card class="animate-pulse">
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    </div>

    <!-- Error State -->
    <ErrorMessage v-else-if="!doctypeData" message="Failed to load form metadata" />

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Form Header -->
      <Card>
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div>
              <h2 class="text-lg font-semibold">
                {{ mode === 'create' ? `New ${doctypeData.label}` : currentDoc?.name || doctypeData.label }}
              </h2>
              <div v-if="currentDoc" class="flex items-center space-x-2 mt-1">
                <Badge :variant="getStatusVariant(currentDoc.docstatus)">
                  {{ getStatusLabel(currentDoc.docstatus) }}
                </Badge>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <Button v-if="onCancel" type="button" variant="outline" @click="onCancel" size="sm">
                <XIcon class="h-4 w-4 mr-1" />
                Cancel
              </Button>
              
              <Button
                v-if="!isReadOnly"
                type="submit"
                variant="solid"
                :loading="submitting"
                :disabled="!isDirty && mode === 'edit'"
                size="sm"
              >
                <SaveIcon class="h-4 w-4 mr-1" />
                {{ mode === 'create' ? 'Create' : 'Update' }}
              </Button>
              
              <Button
                v-if="canSubmit"
                type="button"
                variant="solid"
                size="sm"
                @click="handleSubmitDoc"
              >
                <SendIcon class="h-4 w-4 mr-1" />
                Submit
              </Button>
            </div>
          </div>
        </template>
      </Card>

      <!-- Form Sections -->
      <div class="space-y-6">
        <Transition
          v-for="(group, groupIndex) in fieldGroups"
          :key="group.section"
          name="section"
          appear
          :style="{ transitionDelay: `${groupIndex * 100}ms` }"
        >
          <Card>
            <template #header>
              <h3 class="text-base font-medium">{{ group.section }}</h3>
            </template>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="field in group.fields"
                :key="field.fieldname"
                :class="[
                  field.fieldtype === 'Long Text' || field.fieldtype === 'Text Editor' || field.fieldtype === 'HTML Editor' 
                    ? 'md:col-span-2 lg:col-span-3' 
                    : 'col-span-1'
                ]"
              >
                <FieldRenderer
                  :field="field"
                  :value="formData[field.fieldname]"
                  @update:value="formData[field.fieldname] = $event"
                  :error="errors[field.fieldname]"
                  :disabled="isReadOnly || field.read_only"
                  :doctype="doctype"
                  :all-values="formData"
                />
              </div>
            </div>
          </Card>
        </Transition>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { SaveIcon, SendIcon, XIcon } from 'lucide-vue-next'
import { Button, Card, Badge } from 'frappe-ui'
import { useMetadataStore } from '@/stores/metadata'
import { useDocumentStore } from '@/stores/documents'
import type { DocType, DocField, Document } from '@/types/frappe'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import FieldRenderer from './FieldRenderer.vue'

interface Props {
  doctype: string
  docname?: string
  mode?: 'create' | 'edit' | 'view'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [doc: Document]
  cancel: []
}>()

const metadataStore = useMetadataStore()
const documentStore = useDocumentStore()

const loading = ref(false)
const submitting = ref(false)
const doctypeData = ref<DocType | null>(null)
const formData = ref<Record<string, any>>({})
const errors = ref<Record<string, string>>({})
const isDirty = ref(false)

const currentDoc = computed(() => documentStore.currentDoc)
const isReadOnly = computed(() => props.mode === 'view')
const canSubmit = computed(() => 
  doctypeData.value?.is_submittable && currentDoc.value?.docstatus === 0
)

// Group fields by sections
const fieldGroups = computed(() => {
  if (!doctypeData.value) return []

  const groups: { section: string; fields: DocField[] }[] = []
  let currentSection = 'Main'
  let currentFields: DocField[] = []

  doctypeData.value.fields.forEach((field: DocField) => {
    if (field.fieldtype === 'Section Break') {
      if (currentFields.length > 0) {
        groups.push({ section: currentSection, fields: currentFields })
      }
      currentSection = field.label || 'Section'
      currentFields = []
    } else if (field.fieldtype !== 'Column Break' && field.fieldtype !== 'Tab Break') {
      currentFields.push(field)
    }
  })

  if (currentFields.length > 0) {
    groups.push({ section: currentSection, fields: currentFields })
  }

  return groups
})

const loadData = async () => {
  loading.value = true
  try {
    const doctype_data = await metadataStore.loadDocType(props.doctype)
    doctypeData.value = doctype_data
    
    if (props.docname && props.mode !== 'create') {
      await documentStore.loadDocument(props.doctype, props.docname)
    }
    
    initializeFormData()
  } catch (error) {
    console.error('Failed to load form data:', error)
  } finally {
    loading.value = false
  }
}

const initializeFormData = () => {
  const data: Record<string, any> = {}
  
  if (doctypeData.value) {
    doctypeData.value.fields.forEach((field: DocField) => {
      if (field.fieldtype === 'Section Break' || field.fieldtype === 'Column Break' || field.fieldtype === 'Tab Break') {
        return
      }

      if (currentDoc.value && props.mode !== 'create') {
        data[field.fieldname] = currentDoc.value[field.fieldname]
      } else if (field.default !== undefined) {
        data[field.fieldname] = field.default
      } else {
        switch (field.fieldtype) {
          case 'Check':
            data[field.fieldname] = false
            break
          case 'Int':
          case 'Float':
          case 'Currency':
          case 'Percent':
            data[field.fieldname] = 0
            break
          default:
            data[field.fieldname] = ''
        }
      }
    })
  }

  formData.value = data
}

const handleSubmit = async () => {
  if (!doctypeData.value) return

  submitting.value = true
  try {
    const docData: Partial<Document> = {
      doctype: props.doctype,
      ...formData.value,
    }

    if (props.mode !== 'create' && currentDoc.value) {
      docData.name = currentDoc.value.name
    }

    const savedDoc = await documentStore.saveDocument(docData)
    emit('save', savedDoc)
  } catch (error) {
    console.error('Failed to save document:', error)
  } finally {
    submitting.value = false
  }
}

const handleSubmitDoc = async () => {
  if (!currentDoc.value) return
  
  try {
    await documentStore.submitDocument(props.doctype, currentDoc.value.name)
  } catch (error) {
    console.error('Failed to submit document:', error)
  }
}

const getStatusVariant = (docstatus: number) => {
  switch (docstatus) {
    case 0: return 'yellow'
    case 1: return 'green'
    case 2: return 'red'
    default: return 'gray'
  }
}

const getStatusLabel = (docstatus: number) => {
  switch (docstatus) {
    case 0: return 'Draft'
    case 1: return 'Submitted'
    case 2: return 'Cancelled'
    default: return 'Unknown'
  }
}

// Watch for changes to mark form as dirty
watch(formData, () => {
  isDirty.value = true
}, { deep: true })

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.section-enter-active {
  transition: all 0.5s ease-out;
}
.section-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>