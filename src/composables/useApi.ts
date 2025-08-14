import { ref, computed } from 'vue'
import type { FrappeResponse, DocType, Document, User } from '@/types/frappe'

class FrappeAPI {
  private baseURL: string
  private sessionId: string | null = null

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    // Add session cookie if available
    if (this.sessionId) {
      defaultHeaders['Cookie'] = `sid=${this.sessionId}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Important for session cookies
    }

    try {
      const response = await fetch(url, config)
      
      // Handle authentication errors
      if (response.status === 401) {
        this.sessionId = null
        localStorage.removeItem('frappe_session')
        throw new Error('Authentication required')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: FrappeResponse<T> = await response.json()
      
      if (data.exc) {
        throw new Error(data.exc)
      }

      return data.message
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  async login(username: string, password: string): Promise<User> {
    try {
      const response = await this.makeRequest<any>('/api/method/login', {
        method: 'POST',
        body: JSON.stringify({
          usr: username,
          pwd: password,
        }),
      })

      // Store session info
      this.sessionId = response.sid || 'logged_in'
      localStorage.setItem('frappe_session', this.sessionId)
      
      // Get user info after login
      const userInfo = await this.getCurrentUser()
      return userInfo
    } catch (error) {
      throw new Error('Invalid username or password')
    }
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/api/method/logout', {
        method: 'POST',
      })
    } finally {
      this.sessionId = null
      localStorage.removeItem('frappe_session')
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.makeRequest<User>('/api/method/frappe.auth.get_logged_user')
  }

  async getDocType(doctype: string): Promise<DocType> {
    return this.makeRequest<DocType>(`/api/method/frappe.desk.form.meta.get_meta?doctype=${encodeURIComponent(doctype)}`)
  }

  async getList(
    doctype: string,
    options: {
      fields?: string[]
      filters?: Record<string, any>
      order_by?: string
      limit_start?: number
      limit_page_length?: number
    } = {}
  ): Promise<Document[]> {
    const params = new URLSearchParams({
      doctype,
      fields: JSON.stringify(options.fields || ['name']),
      filters: JSON.stringify(options.filters || {}),
      order_by: options.order_by || 'creation desc',
      start: String(options.limit_start || 0),
      page_length: String(options.limit_page_length || 20),
    })

    return this.makeRequest<Document[]>(`/api/method/frappe.desk.reportview.get?${params}`)
  }

  async getDoc(doctype: string, name: string): Promise<Document> {
    return this.makeRequest<Document>(`/api/method/frappe.desk.form.load.getdoc?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(name)}`)
  }

  async saveDoc(doc: Partial<Document>): Promise<Document> {
    return this.makeRequest<Document>('/api/method/frappe.desk.form.save.savedocs', {
      method: 'POST',
      body: JSON.stringify({
        action: doc.name ? 'Update' : 'Save',
        doc: JSON.stringify(doc),
      }),
    })
  }

  // Initialize session from localStorage
  initSession() {
    const stored = localStorage.getItem('frappe_session')
    if (stored) {
      this.sessionId = stored
    }
  }
}

// Create singleton instance
export const frappeAPI = new FrappeAPI()

// Composable for using the API
export function useApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await apiCall()
      return result
    } catch (err: any) {
      error.value = err.message || 'An error occurred'
      console.error('API Error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    execute,
    api: frappeAPI
  }
}

export default frappeAPI