<template>
  <div class="space-y-8">
    <!-- Welcome Header -->
    <Transition name="slide-in" appear>
      <Card>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {{ authStore.userName?.split(' ')[0] || 'User' }}! 👋
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your business today.
            </p>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ currentDate }}
            </div>
          </div>
        </div>
      </Card>
    </Transition>

    <!-- Metrics Grid -->
    <Transition name="slide-in" appear>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          v-for="(metric, index) in metrics"
          :key="metric.title"
          :metric="metric"
          :delay="index * 100"
        />
      </div>
    </Transition>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Quick Create -->
      <Transition name="slide-in" appear>
        <Card class="lg:col-span-1">
          <template #header>
            <div class="flex items-center">
              <PlusIcon class="h-5 w-5 mr-2" />
              Quick Create
            </div>
          </template>
          
          <div class="space-y-3">
            <Button
              v-for="item in quickCreateItems"
              :key="item.doctype"
              variant="outline"
              class="w-full justify-start"
              @click="handleQuickCreate(item)"
            >
              <div :class="`p-1 rounded ${item.color} text-white mr-3`">
                <component :is="item.icon" class="h-4 w-4" />
              </div>
              {{ item.label }}
            </Button>
          </div>
        </Card>
      </Transition>

      <!-- Recent Activity -->
      <Transition name="slide-in" appear>
        <Card class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center">
                <ActivityIcon class="h-5 w-5 mr-2" />
                Recent Activity
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </template>
          
          <div v-if="recentDocs.length > 0" class="space-y-4">
            <div
              v-for="(doc, index) in recentDocs"
              :key="doc.name"
              class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <div class="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ doc.description || doc.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(doc.creation) }}
                </p>
              </div>
              <Badge :variant="getStatusVariant(doc.status)">
                {{ doc.status }}
              </Badge>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            <ActivityIcon class="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        </Card>
      </Transition>
    </div>

    <!-- Charts Section -->
    <Transition name="slide-in" appear>
      <Card>
        <template #header>
          <div class="flex items-center">
            <BarChart3Icon class="h-5 w-5 mr-2" />
            Sales Overview
          </div>
        </template>
        
        <div class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div class="text-center">
            <BarChart3Icon class="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Charts will be implemented with a charting library</p>
            <p class="text-sm mt-2">Consider using Chart.js, D3.js, or ApexCharts</p>
          </div>
        </div>
      </Card>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  PlusIcon, 
  ActivityIcon, 
  BarChart3Icon,
  UsersIcon,
  FileTextIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  TrendingUpIcon
} from 'lucide-vue-next'
import { Button, Card, Badge } from 'frappe-ui'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'
import MetricCard from '@/components/dashboard/MetricCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const { api } = useApi()

const recentDocs = ref<any[]>([])
const loading = ref(true)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

const metrics = ref([
  {
    title: 'Total Sales',
    value: '$45,231',
    change: '+12.5%',
    icon: DollarSignIcon,
    color: 'text-green-600',
    trend: 'up' as const
  },
  {
    title: 'New Customers',
    value: 156,
    change: '+8.2%',
    icon: UsersIcon,
    color: 'text-blue-600',
    trend: 'up' as const
  },
  {
    title: 'Pending Orders',
    value: 23,
    change: '-4.1%',
    icon: ShoppingCartIcon,
    color: 'text-orange-600',
    trend: 'down' as const
  },
  {
    title: 'Total Revenue',
    value: '$125,847',
    change: '+15.3%',
    icon: TrendingUpIcon,
    color: 'text-purple-600',
    trend: 'up' as const
  },
])

const quickCreateItems = ref([
  {
    label: 'Customer',
    doctype: 'Customer',
    module: 'selling',
    icon: UsersIcon,
    color: 'bg-blue-500'
  },
  {
    label: 'Sales Invoice',
    doctype: 'Sales Invoice',
    module: 'accounts',
    icon: FileTextIcon,
    color: 'bg-green-500'
  },
  {
    label: 'Sales Order',
    doctype: 'Sales Order',
    module: 'selling',
    icon: ShoppingCartIcon,
    color: 'bg-purple-500'
  },
  {
    label: 'Item',
    doctype: 'Item',
    module: 'stock',
    icon: ActivityIcon,
    color: 'bg-orange-500'
  },
])

const loadDashboardData = async () => {
  try {
    loading.value = true
    
    // Load recent documents
    try {
      const recent = await api.getList('ToDo', {
        fields: ['name', 'description', 'status', 'creation'],
        limit_page_length: 5,
        order_by: 'creation desc'
      })
      recentDocs.value = recent
    } catch (error) {
      console.error('Failed to load recent documents:', error)
    }

  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const handleQuickCreate = (item: any) => {
  router.push(`/${item.module}/${item.doctype}/new`)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'Pending':
      return 'yellow'
    default:
      return 'gray'
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.slide-in-enter-active {
  transition: all 0.5s ease-out;
}
.slide-in-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>