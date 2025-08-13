import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document } from '@/types/frappe'
import { frappeAPI } from '@/composables/useApi'

export const useDocumentStore = defineStore('documents', () => {
  // State
  const documents = ref(new Map<string, Document>())
  const currentDoc = ref<Document | null>(null)
  const loading = ref(false)

  // Getters
  const isLoading = computed(() => loading.value)
  
  const getDocument = computed(() => (doctype: string, name: string) => {
    const key = `${doctype}:${name}`
    return documents.value.get(key)
  })

  // Actions
  const loadDocument = async (doctype: string, name: string): Promise<Document> => {
    const key = `${doctype}:${name}`
    const existing = documents.value.get(key)
    if (existing) {
      currentDoc.value = existing
      return existing
    }

    loading.value = true
    try {
      const doc = await frappeAPI.getDoc(doctype, name)
      documents.value.set(key, doc)
      currentDoc.value = doc
      return doc
    } catch (error) {
      console.error(`Failed to load document ${doctype}:${name}:`, error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const saveDocument = async (doc: Partial<Document>): Promise<Document> => {
    loading.value = true
    try {
      const savedDoc = await frappeAPI.saveDoc(doc)
      const key = `${savedDoc.doctype}:${savedDoc.name}`
      documents.value.set(key, savedDoc)
      currentDoc.value = savedDoc
      return savedDoc
    } catch (error) {
      console.error('Failed to save document:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteDocument = async (doctype: string, name: string): Promise<void> => {
    loading.value = true
    try {
      await frappeAPI.deleteDoc(doctype, name)
      const key = `${doctype}:${name}`
      documents.value.delete(key)
      if (currentDoc.value?.name === name) {
        currentDoc.value = null
      }
    } catch (error) {
      console.error(`Failed to delete document ${doctype}:${name}:`, error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const submitDocument = async (doctype: string, name: string): Promise<Document> => {
    loading.value = true
    try {
      const submittedDoc = await frappeAPI.submitDoc(doctype, name)
      const key = `${doctype}:${name}`
      documents.value.set(key, submittedDoc)
      currentDoc.value = submittedDoc
      return submittedDoc
    } catch (error) {
      console.error(`Failed to submit document ${doctype}:${name}:`, error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const cancelDocument = async (doctype: string, name: string): Promise<Document> => {
    loading.value = true
    try {
      const cancelledDoc = await frappeAPI.cancelDoc(doctype, name)
      const key = `${doctype}:${name}`
      documents.value.set(key, cancelledDoc)
      currentDoc.value = cancelledDoc
      return cancelledDoc
    } catch (error) {
      console.error(`Failed to cancel document ${doctype}:${name}:`, error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const setCurrentDoc = (doc: Document | null) => {
    currentDoc.value = doc
  }

  const clearCache = () => {
    documents.value.clear()
    currentDoc.value = null
  }

  return {
    // State
    documents,
    currentDoc,
    loading,
    
    // Getters
    isLoading,
    getDocument,
    
    // Actions
    loadDocument,
    saveDocument,
    deleteDocument,
    submitDocument,
    cancelDocument,
    setCurrentDoc,
    clearCache
  }
})