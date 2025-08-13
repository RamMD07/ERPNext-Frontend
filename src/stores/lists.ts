import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document } from '@/types/frappe'
import { frappeAPI } from '@/composables/useApi'

export const useListStore = defineStore('lists', () => {
  // State
  const lists = ref(new Map<string, Document[]>())
  const filters = ref(new Map<string, Record<string, any>>())
  const pagination = ref(new Map<string, { page: number; totalPages: number; pageSize: number }>())
  const loading = ref(false)

  // Getters
  const isLoading = computed(() => loading.value)
  
  const getList = computed(() => (doctype: string) => {
    return lists.value.get(doctype) || []
  })

  const getFilters = computed(() => (doctype: string) => {
    return filters.value.get(doctype) || {}
  })

  const getPagination = computed(() => (doctype: string) => {
    return pagination.value.get(doctype) || { page: 1, totalPages: 1, pageSize: 20 }
  })

  // Actions
  const loadList = async (
    doctype: string, 
    options: {
      fields?: string[]
      filters?: Record<string, any>
      order_by?: string
      limit_start?: number
      limit_page_length?: number
      group_by?: string
      as_dict?: boolean
    } = {}
  ): Promise<Document[]> => {
    loading.value = true
    try {
      const documents = await frappeAPI.getList(doctype, options)
      lists.value.set(doctype, documents)
      
      // Update pagination info
      const currentPagination = pagination.value.get(doctype) || { page: 1, totalPages: 1, pageSize: 20 }
      const page = Math.floor((options.limit_start || 0) / (options.limit_page_length || 20)) + 1
      pagination.value.set(doctype, {
        ...currentPagination,
        page,
        pageSize: options.limit_page_length || 20
      })
      
      return documents
    } catch (error) {
      console.error(`Failed to load list for ${doctype}:`, error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const setFilters = (doctype: string, newFilters: Record<string, any>) => {
    filters.value.set(doctype, newFilters)
  }

  const clearFilters = (doctype: string) => {
    filters.value.delete(doctype)
  }

  const clearList = (doctype: string) => {
    lists.value.delete(doctype)
    filters.value.delete(doctype)
    pagination.value.delete(doctype)
  }

  const clearAllLists = () => {
    lists.value.clear()
    filters.value.clear()
    pagination.value.clear()
  }

  const refreshList = async (doctype: string) => {
    const currentFilters = getFilters.value(doctype)
    const currentPagination = getPagination.value(doctype)
    
    await loadList(doctype, {
      filters: currentFilters,
      limit_start: (currentPagination.page - 1) * currentPagination.pageSize,
      limit_page_length: currentPagination.pageSize
    })
  }

  return {
    // State
    lists,
    filters,
    pagination,
    loading,
    
    // Getters
    isLoading,
    getList,
    getFilters,
    getPagination,
    
    // Actions
    loadList,
    setFilters,
    clearFilters,
    clearList,
    clearAllLists,
    refreshList
  }
})