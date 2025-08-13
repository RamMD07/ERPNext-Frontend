import { ref, computed } from 'vue'
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { FrappeResponse, DocType, Document, User, ListViewSettings } from '@/types/frappe'

class FrappeAPI {
  private client: AxiosInstance
  private baseURL: string
  private csrf_token = ref<string>()

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor for CSRF token
    this.client.interceptors.request.use((config) => {
      if (this.csrf_token.value) {
        config.headers['X-Frappe-CSRF-Token'] = this.csrf_token.value
      }
      return config
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleAuthError()
        }
        return Promise.reject(error)
      }
    )
  }

  private handleAuthError() {
    localStorage.removeItem('frappe_session')
    window.location.href = '/login'
  }

  async login(username: string, password: string): Promise<User> {
    const response = await this.client.post('/api/method/login', {
      usr: username,
      pwd: password,
    })

    if (response.data.message) {
      this.csrf_token.value = response.headers['x-frappe-csrf-token']
      return response.data.message
    }
    
    throw new Error('Login failed')
  }

  async logout(): Promise<void> {
    await this.client.post('/api/method/logout')
    this.csrf_token.value = undefined
    localStorage.removeItem('frappe_session')
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.call<User>('frappe.auth.get_logged_user')
    return response
  }

  // Generic method caller
  async call<T = any>(
    method: string, 
    args: Record<string, any> = {},
    httpMethod: 'GET' | 'POST' = 'POST'
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      url: '/api/method/' + method,
      method: httpMethod,
    }

    if (httpMethod === 'GET') {
      config.params = args
    } else {
      config.data = args
    }

    const response: AxiosResponse<FrappeResponse<T>> = await this.client(config)
    
    if (response.data.exc) {
      throw new Error(response.data.exc)
    }

    return response.data.message
  }

  // DocType operations
  async getDocType(doctype: string): Promise<DocType> {
    return this.call<DocType>('frappe.desk.form.meta.get_meta', { doctype })
  }

  async getDoc(doctype: string, name: string): Promise<Document> {
    return this.call<Document>('frappe.desk.form.load.getdoc', { 
      doctype, 
      name,
      check_links: 1 
    })
  }

  async saveDoc(doc: Partial<Document>): Promise<Document> {
    return this.call<Document>('frappe.desk.form.save.savedocs', {
      action: doc.name ? 'Update' : 'Save',
      doc: JSON.stringify(doc),
    })
  }

  async deleteDoc(doctype: string, name: string): Promise<void> {
    await this.call('frappe.model.delete_doc', { doctype, name })
  }

  async submitDoc(doctype: string, name: string): Promise<Document> {
    return this.call<Document>('frappe.model.workflow.bulk_workflow_approval', {
      doctype,
      docnames: [name],
      action: 'Submit'
    })
  }

  async cancelDoc(doctype: string, name: string): Promise<Document> {
    return this.call<Document>('frappe.model.workflow.bulk_workflow_approval', {
      doctype,
      docnames: [name], 
      action: 'Cancel'
    })
  }

  // List operations
  async getList(
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
  ): Promise<Document[]> {
    return this.call<Document[]>('frappe.desk.reportview.get', {
      doctype,
      fields: JSON.stringify(options.fields || ['name']),
      filters: JSON.stringify(options.filters || {}),
      order_by: options.order_by || 'creation desc',
      start: options.limit_start || 0,
      page_length: options.limit_page_length || 20,
      group_by: options.group_by,
      as_dict: options.as_dict !== false,
    })
  }

  async getListViewSettings(doctype: string): Promise<ListViewSettings> {
    return this.call<ListViewSettings>('frappe.desk.listview.get_list_settings', { 
      doctype 
    })
  }

  // Search operations
  async search(
    doctype: string, 
    query: string, 
    filters: Record<string, any> = {}
  ): Promise<any[]> {
    return this.call('frappe.desk.search.search_link', {
      doctype,
      txt: query,
      filters: JSON.stringify(filters),
    })
  }

  // File operations
  async uploadFile(file: File, doctype?: string, docname?: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    if (doctype) formData.append('doctype', doctype)
    if (docname) formData.append('docname', docname)

    const response = await this.client.post('/api/method/upload_file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.message
  }

  // Validation
  async validateDoc(doc: Partial<Document>): Promise<any> {
    return this.call('frappe.desk.form.utils.validate_doc', {
      doc: JSON.stringify(doc)
    })
  }

  // Client scripts
  async getClientScript(doctype: string, view: string = 'Form'): Promise<string> {
    const scripts = await this.call<any[]>('frappe.desk.form.utils.get_client_scripts', {
      doctype,
      view
    })
    
    return scripts.map(script => script.script).join('\n')
  }

  // Real-time updates
  setupWebSocket(): WebSocket | null {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleRealtimeUpdate(data)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }
      
      return ws
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      return null
    }
  }

  private handleRealtimeUpdate(data: any) {
    // Emit custom events for real-time updates
    window.dispatchEvent(new CustomEvent('frappe:doc_update', { 
      detail: data 
    }))
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