import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DocType } from '@/types/frappe'
import { frappeAPI } from '@/composables/useApi'

export const useMetadataStore = defineStore('metadata', () => {
  // State
  const doctypes = ref(new Map<string, DocType>())
  const loading = ref(false)

  // Getters
  const getDocType = computed(() => (doctype: string) => {
    return doctypes.value.get(doctype)
  })

  const isLoading = computed(() => loading.value)

  // Actions
  const loadDocType = async (doctype: string): Promise<DocType> => {
    const existing = doctypes.value.get(doctype)
    if (existing) return existing

    loading.value = true
    try {
      const doctypeData = await frappeAPI.getDocType(doctype)
      doctypes.value.set(doctype, doctypeData)
      return doctypeData
    } catch (error) {
      console.error(`Failed to load DocType ${doctype}:`, error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const clearCache = () => {
    doctypes.value.clear()
  }

  const preloadDocTypes = async (doctypeList: string[]) => {
    const promises = doctypeList.map(doctype => loadDocType(doctype))
    await Promise.allSettled(promises)
  }

  return {
    // State
    doctypes,
    loading,
    
    // Getters
    getDocType,
    isLoading,
    
    // Actions
    loadDocType,
    clearCache,
    preloadDocTypes
  }
})