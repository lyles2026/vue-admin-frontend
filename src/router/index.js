import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home/DashboardView.vue'),
      meta: { title: '后台面板' },
      children: [

      ]
    },
     {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Common/LoginView.vue'),
      meta: { title: '登录' }
    },
  ],
})

export default router
