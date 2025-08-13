<template>
  <aside 
    :class="[
      'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 ease-in-out',
      uiStore.sidebarCollapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <Transition name="fade">
        <div v-if="!uiStore.sidebarCollapsed" class="flex items-center space-x-2">
          <Building2Icon class="h-8 w-8 text-primary-600" />
          <span class="text-xl font-bold text-gray-900 dark:text-white">ERPNext</span>
        </div>
      </Transition>
      
      <Button
        variant="ghost"
        size="sm"
        @click="uiStore.toggleSidebar"
        class="p-1.5"
      >
        <ChevronLeftIcon v-if="!uiStore.sidebarCollapsed" class="h-4 w-4" />
        <ChevronRightIcon v-else class="h-4 w-4" />
      </Button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      <SidebarItem
        v-for="module in modules"
        :key="module.name"
        :module="module"
        :collapsed="uiStore.sidebarCollapsed"
        :is-active="uiStore.currentModule === module.name"
        @click="uiStore.setCurrentModule(module.name)"
      />
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <Transition name="fade">
        <div v-if="!uiStore.sidebarCollapsed" class="text-xs text-gray-500 dark:text-gray-400">
          ERPNext Vue Frontend v1.0.0
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Building2Icon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  HomeIcon,
  UsersIcon,
  FileTextIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  SettingsIcon,
  PackageIcon,
  BarChart3Icon
} from 'lucide-vue-next'
import { Button } from 'frappe-ui'
import { useUIStore } from '@/stores/ui'
import SidebarItem from './SidebarItem.vue'

const uiStore = useUIStore()

interface SidebarModule {
  name: string
  icon: any
  path: string
  children?: {
    name: string
    path: string
    icon?: any
  }[]
}

const modules = ref<SidebarModule[]>([
  {
    name: 'Home',
    icon: HomeIcon,
    path: '/',
  },
  {
    name: 'Setup',
    icon: SettingsIcon,
    path: '/setup',
    children: [
      { name: 'Company', path: '/setup/company' },
      { name: 'Users', path: '/setup/users' },
      { name: 'Roles', path: '/setup/roles' },
    ]
  },
  {
    name: 'Accounts',
    icon: DollarSignIcon,
    path: '/accounts',
    children: [
      { name: 'Chart of Accounts', path: '/accounts/chart-of-accounts' },
      { name: 'Journal Entry', path: '/accounts/journal-entry' },
      { name: 'Payment Entry', path: '/accounts/payment-entry' },
      { name: 'Sales Invoice', path: '/accounts/sales-invoice' },
      { name: 'Purchase Invoice', path: '/accounts/purchase-invoice' },
    ]
  },
  {
    name: 'Selling',
    icon: ShoppingCartIcon,
    path: '/selling',
    children: [
      { name: 'Customer', path: '/selling/customer' },
      { name: 'Lead', path: '/selling/lead' },
      { name: 'Opportunity', path: '/selling/opportunity' },
      { name: 'Quotation', path: '/selling/quotation' },
      { name: 'Sales Order', path: '/selling/sales-order' },
    ]
  },
  {
    name: 'Buying',
    icon: PackageIcon,
    path: '/buying',
    children: [
      { name: 'Supplier', path: '/buying/supplier' },
      { name: 'Request for Quotation', path: '/buying/request-for-quotation' },
      { name: 'Supplier Quotation', path: '/buying/supplier-quotation' },
      { name: 'Purchase Order', path: '/buying/purchase-order' },
    ]
  },
  {
    name: 'Stock',
    icon: Building2Icon,
    path: '/stock',
    children: [
      { name: 'Item', path: '/stock/item' },
      { name: 'Warehouse', path: '/stock/warehouse' },
      { name: 'Stock Entry', path: '/stock/stock-entry' },
      { name: 'Stock Reconciliation', path: '/stock/stock-reconciliation' },
    ]
  },
  {
    name: 'HR',
    icon: UsersIcon,
    path: '/hr',
    children: [
      { name: 'Employee', path: '/hr/employee' },
      { name: 'Leave Application', path: '/hr/leave-application' },
      { name: 'Attendance', path: '/hr/attendance' },
      { name: 'Salary Structure', path: '/hr/salary-structure' },
    ]
  },
  {
    name: 'Reports',
    icon: BarChart3Icon,
    path: '/reports',
  },
])
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>