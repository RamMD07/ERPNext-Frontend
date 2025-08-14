<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ doctype }} List
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Manage your {{ doctype.toLowerCase() }} records
        </p>
      </div>
      <Button variant="solid" @click="handleCreate">
        <PlusIcon class="h-4 w-4 mr-1" />
        New {{ doctype }}
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search records..."
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
          <Button variant="outline" @click="loadData">
            <RefreshCwIcon class="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-flex items-center space-x-2">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span class="text-gray-600 dark:text-gray-400">Loading {{ doctype }} records...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-8 text-center">
        <div class="text-red-600 dark:text-red-400">
          <AlertTriangleIcon class="h-8 w-8 mx-auto mb-2" />
          <p class="font-medium">Failed to load records</p>
          <p class="text-sm mt-1">{{ error }}</p>
          <Button variant="outline" @click="loadData" class="mt-4">
            Try Again
          </Button>
        </div>
      </div>

      <!-- Data Table -->
      <div v-else-if="documents.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                v-for="field in displayFields"
                :key="field.fieldname"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {{ field.label }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="doc in filteredDocuments"
              :key="doc.name"
              class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              @click="handleRowClick(doc)"
            >
              <td
                v-for="field in displayFields"
                :key="field.fieldname"
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
              >
                <div v-if="field.fieldtype === 'Check'">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="doc[field.fieldname] ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'"
                  >
                    {{ doc[field.fieldname] ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div v-else-if="field.fieldtype === 'Currency'">
                  {{ formatCurrency(doc[field.fieldname]) }}
                </div>
                <div v-else-if="field.fieldtype === 'Date'">
                  {{ formatDate(doc[field.fieldname]) }}
                </div>
                <div v-else-if="field.fieldtype === 'Link'">
                  <span class="text-blue-600 dark:text-blue-400 hover:underline">
                    {{ doc[field.fieldname] || '-' }}
                  </span>
                </div>
                <div v-else>
                  {{ doc[field.fieldname] || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click.stop="handleEdit(doc)"
                  >
                    <EditIcon class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click.stop="handleView(doc)"
                  >
                    <EyeIcon class="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="p-8 text-center">
        <FileTextIcon class="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No {{ doctype }} records found
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Get started by creating your first {{ doctype.toLowerCase() }} record.
        </p>
        <Button variant="solid" @click="handleCreate">
          <PlusIcon class="h-4 w-4 mr-1" />
          Create {{ doctype }}
        </Button>
      </div>
    </Card>

    <!-- Pagination -->
    <div v-if="documents.length > 0" class="flex items-center justify-between">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalRecords) }} of {{ totalRecords }} results
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="previousPage"
        >
          Previous
        </Button>
        <span class="text-sm text-gray-700 dark:text-gray-300">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  PlusIcon, 
  RefreshCwIcon, 
  AlertTriangleIcon, 
  FileTextIcon,
  EditIcon,
  EyeIcon
} from 'lucide-vue-next'
import { Button, Card } from 'frappe-ui'
import { useApi } from '@/composables/useApi'
import type { Document, DocField } from '@/types/frappe'

interface Props {
  module: string
  doctype: string
}

const props = defineProps<Props>()
const router = useRouter()
const { api, loading, error, execute } = useApi()

const documents = ref<Document[]>([])
const docTypeFields = ref<DocField[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalRecords = ref(0)

const displayFields = computed(() => {
  return docTypeFields.value.filter(field => 
    field.in_list_view && 
    !['Section Break', 'Column Break', 'Tab Break', 'HTML'].includes(field.fieldtype)
  ).slice(0, 6) // Limit to 6 columns for better display
})

const filteredDocuments = computed(() => {
  if (!searchQuery.value) return documents.value
  
  const query = searchQuery.value.toLowerCase()
  return documents.value.filter(doc => 
    Object.values(doc).some(value => 
      String(value).toLowerCase().includes(query)
    )
  )
})

const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))

const loadDocType = async () => {
  const docTypeData = await execute(() => api.getDocType(props.doctype))
  if (docTypeData) {
    docTypeFields.value = docTypeData.fields
  }
}

const loadData = async () => {
  const fields = displayFields.value.length > 0 
    ? displayFields.value.map(f => f.fieldname)
    : ['name', 'creation', 'modified']

  const data = await execute(() => api.getList(props.doctype, {
    fields: ['name', ...fields],
    limit_start: (currentPage.value - 1) * pageSize.value,
    limit_page_length: pageSize.value,
    order_by: 'creation desc'
  }))

  if (data) {
    documents.value = data
    // Note: Frappe doesn't return total count in list API
    // You might need to make a separate count query
    totalRecords.value = data.length
  }
}

const handleCreate = () => {
  router.push(`/${props.module}/${props.doctype}/new`)
}

const handleEdit = (doc: Document) => {
  router.push(`/${props.module}/${props.doctype}/${doc.name}`)
}

const handleView = (doc: Document) => {
  router.push(`/${props.module}/${props.doctype}/${doc.name}/view`)
}

const handleRowClick = (doc: Document) => {
  handleView(doc)
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const formatCurrency = (value: any) => {
  if (!value) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const formatDate = (value: any) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString()
}

// Watch for page changes
watch(currentPage, () => {
  loadData()
})

onMounted(async () => {
  await loadDocType()
  await loadData()
})
</script>