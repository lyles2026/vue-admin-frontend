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
        {
          path: '/',
          name: 'dashboard',
          component: () => import('@/views/Home/HomeView.vue'),
          meta: { title: '后台面板' }
        },
        // 商品管理
        {
          path: '/Goods/shop',
          name: 'goods-shop',
          component: () => import('@/views/Shop/ShopView.vue'),
          meta: { title: '商品管理' }
        },
        {
          path: '/Goods/category',
          name: 'goods-category',
          component: () => import('@/views/Shop/CategoryView.vue'),
          meta: { title: '分类管理' }
        },
        {
          path: '/Goods/size',
          name: 'goods-size',
          component: () => import('@/views/Shop/SizeView.vue'),
          meta: { title: '规格管理' }
        },
        {
          path: '/Goods/coupon',
          name: 'goods-coupon',
          component: () => import('@/views/Shop/CouponView.vue'),
          meta: { title: '优惠卷管理' }
        },
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
