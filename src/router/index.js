import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Common/RegisterView.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/Common/NotFoundView.vue'),
      meta: { title: '404' }
    }
  ],
})


router.beforeEach((to) => {
  const authStore = useAuthStore()
  const publicPaths = ['/login', '/register']

  if (!authStore.isLogin && !publicPaths.includes(to.path)) {
    return '/login'
  }

  if (authStore.isLogin && (to.path === '/login' || to.path === '/register')) {
    return '/'
  }
})

export default router
