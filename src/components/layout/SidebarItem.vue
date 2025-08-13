<template>
  <div>
    <router-link
      :to="module.path"
      @click="handleClick"
      :class="[
        'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
        {
          'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300': isActive || isNavActive,
          'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white': !isActive && !isNavActive,
        }
      ]"
    >
      <component :is="module.icon" class="h-5 w-5 flex-shrink-0" />
      <Transition name="slide">
        <span v-if="!collapsed" class="ml-3 truncate">
          {{ module.name }}
        </span>
      </Transition>
      <Transition name="rotate">
        <ChevronRightIcon 
          v-if="!collapsed && module.children" 
          :class="[
            'ml-auto h-4 w-4 transition-transform duration-200',
            { 'rotate-90': isExpanded }
          ]"
        />
      </Transition>
    </router-link>

    <!-- Submenu -->
    <Transition name="expand">
      <div v-if="!collapsed && module.children && isExpanded" class="ml-8 mt-1 space-y-1">
        <router-link
          v-for="child in module.children"
          :key="child.path"
          :to="child.path"
          :class="[
            'flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200',
            $route.path === child.path
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
          ]"
        >
          <span class="truncate">{{ child.name }}</span>
        </router-link>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronRightIcon } from 'lucide-vue-next'

interface Props {
  module: {
    name: string
    icon: any
    path: string
    children?: {
      name: string
      path: string
      icon?: any
    }[]
  }
  collapsed: boolean
  isActive: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const route = useRoute()
const isExpanded = ref(props.isActive)

const isNavActive = computed(() => {
  return route.path === props.module.path || 
         (props.module.children && props.module.children.some(child => route.path === child.path))
})

const handleClick = () => {
  emit('click')
  if (props.module.children) {
    isExpanded.value = !isExpanded.value
  }
}

watch(() => props.isActive, (newValue) => {
  if (newValue) {
    isExpanded.value = true
  }
})
</script>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.rotate-enter-active, .rotate-leave-active {
  transition: transform 0.2s ease;
}

.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>