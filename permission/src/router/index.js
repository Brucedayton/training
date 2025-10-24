import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/Home.vue')
      },
      {
        path: 'apply',
        name: 'Apply',
        component: () => import('../views/Apply.vue')
      },
      {
        path: 'approve',
        name: 'Approve',
        component: () => import('../views/Approve.vue')
      },
      {
        path: 'authorize',
        name: 'Authorize',
        component: () => import('../views/Authorize.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
