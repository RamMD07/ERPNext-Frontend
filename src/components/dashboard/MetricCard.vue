<template>
  <Transition name="metric-card" appear :style="{ transitionDelay: `${delay}ms` }">
    <Card class="hover:shadow-lg transition-shadow duration-200 cursor-pointer" @click="$emit('click')">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ metric.title }}
          </p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ metric.value }}
          </p>
          <p :class="[
            'text-sm',
            metric.trend === 'up' ? 'text-green-600' : 
            metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
          ]">
            {{ metric.change }} from last month
          </p>
        </div>
        <div :class="[
          'p-3 rounded-full',
          metric.color.replace('text-', 'bg-').replace('-600', '-100'),
          'dark:' + metric.color.replace('text-', 'bg-').replace('-600', '-900')
        ]">
          <component :is="metric.icon" :class="['h-6 w-6', metric.color]" />
        </div>
      </div>
    </Card>
  </Transition>
</template>

<script setup lang="ts">
import { Card } from 'frappe-ui'

interface Metric {
  title: string
  value: string | number
  change: string
  icon: any
  color: string
  trend: 'up' | 'down' | 'neutral'
}

interface Props {
  metric: Metric
  delay?: number
}

defineProps<Props>()
defineEmits<{
  click: []
}>()
</script>

<style scoped>
.metric-card-enter-active {
  transition: all 0.5s ease-out;
}
.metric-card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>