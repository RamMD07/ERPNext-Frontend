import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createRouter, createWebHistory } from 'vue-router'
import { FrappeUI } from 'frappe-ui'
import App from './App.vue'
import routes from './router'
import './style.css'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Create pinia store
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Create app
const app = createApp(App)

// Use plugins
app.use(pinia)
app.use(router)
app.use(FrappeUI)

// Mount app
app.mount('#root')