import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue')
      },
      {
        path: 'desk',
        name: 'Desk',
        component: () => import('@/pages/Dashboard.vue')
      },
      {
        path: ':module/:doctype',
        name: 'ListView',
        component: () => import('@/pages/ListView.vue'),
        props: true
      },
      {
        path: ':module/:doctype/new',
        name: 'FormCreate',
        component: () => import('@/pages/FormView.vue'),
        props: route => ({ ...route.params, mode: 'create' })
      },
      {
        path: ':module/:doctype/:docname',
        name: 'FormEdit',
        component: () => import('@/pages/FormView.vue'),
        props: route => ({ ...route.params, mode: 'edit' })
      },
      {
        path: ':module/:doctype/:docname/view',
        name: 'FormView',
        component: () => import('@/pages/FormView.vue'),
        props: route => ({ ...route.params, mode: 'view' })
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

export default routes