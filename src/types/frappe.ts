// Core Frappe Framework Types for Vue.js
export interface FrappeResponse<T = any> {
  message: T
  exc?: string
  _server_messages?: string
}

export interface DocType {
  name: string
  module: string
  label: string
  description?: string
  fields: DocField[]
  permissions: Permission[]
  links: DocTypeLink[]
  actions: DocTypeAction[]
  client_script?: string
  is_submittable: boolean
  is_single: boolean
  is_tree: boolean
  autoname?: string
  title_field?: string
  image_field?: string
  sort_field?: string
  sort_order: 'ASC' | 'DESC'
}

export interface DocField {
  fieldname: string
  label: string
  fieldtype: FieldType
  options?: string
  reqd: boolean
  read_only: boolean
  hidden: boolean
  depends_on?: string
  mandatory_depends_on?: string
  read_only_depends_on?: string
  default?: string | number
  description?: string
  in_list_view: boolean
  in_standard_filter: boolean
  in_global_search: boolean
  precision?: number
  length?: number
  fetch_from?: string
  fetch_if_empty?: boolean
  validation?: FieldValidation
  permlevel: number
  width?: string
  columns?: number
}

export type FieldType = 
  | 'Data' | 'Text' | 'Long Text' | 'HTML Editor' 
  | 'Int' | 'Float' | 'Currency' | 'Percent'
  | 'Date' | 'Datetime' | 'Time'
  | 'Select' | 'Link' | 'Dynamic Link' | 'Table'
  | 'Check' | 'Small Text' | 'Code' | 'Text Editor'
  | 'Attach' | 'Attach Image' | 'Signature' | 'Color'
  | 'Barcode' | 'Geolocation' | 'Duration' | 'Rating'
  | 'Password' | 'Read Only' | 'Heading' | 'Section Break' | 'Column Break'
  | 'Tab Break' | 'HTML' | 'Button' | 'Table MultiSelect' | 'Autocomplete'

export interface FieldValidation {
  expression?: string
  message?: string
  min_value?: number
  max_value?: number
  min_length?: number
  max_length?: number
  pattern?: string
}

export interface Permission {
  role: string
  read: boolean
  write: boolean
  create: boolean
  delete: boolean
  submit: boolean
  cancel: boolean
  amend: boolean
  report: boolean
  export: boolean
  import: boolean
  set_user_permissions: boolean
  if_owner: boolean
  permlevel: number
  match?: string
}

export interface DocTypeLink {
  link_doctype: string
  link_fieldname: string
  group?: string
}

export interface DocTypeAction {
  label: string
  action: string
  condition?: string
}

export interface Document {
  name: string
  doctype: string
  docstatus: number
  owner: string
  creation: string
  modified: string
  modified_by: string
  [key: string]: any
}

export interface ListViewSettings {
  doctype: string
  fields: string[]
  filters: Filter[]
  order_by: string
  page_length: number
  add_fields?: string[]
}

export interface Filter {
  fieldname: string
  operator: FilterOperator
  value: any
}

export type FilterOperator = 
  | '=' | '!=' | '>' | '<' | '>=' | '<=' 
  | 'like' | 'not like' | 'in' | 'not in' 
  | 'is' | 'is not' | 'between' | 'timespan'
  | 'descendants of' | 'ancestors of' | 'not descendants of'

export interface User {
  name: string
  email: string
  full_name: string
  roles: string[]
  language: string
  time_zone: string
  desk_theme: string
}

export interface ClientScript {
  doctype: string
  view: 'Form' | 'List' | 'Report'
  script: string
  enabled: boolean
}