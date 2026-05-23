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
        {
          path: '/Users/user',
          name: 'users-user',
          component: () => import('@/views/User/UserView.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: '/Users/vip',
          name: 'users-vip',
          component: () => import('@/views/User/VipView.vue'),
          meta: { title: '会员等级' }
        },
        {
          path: '/Order/permissions',
          name: 'order-permissions',
          component: () => import('@/views/Order/OrderListView.vue'),
          meta: { title: '订单列表' }
        },
        {
          path: '/Order/sale',
          name: 'order-sale',
          component: () => import('@/views/Order/AfterSaleView.vue'),
          meta: { title: '售后管理' }
        },
        {
          path: '/Order/count',
          name: 'order-count',
          component: () => import('@/views/Order/OrderCountView.vue'),
          meta: { title: '订单统计' }
        },
        {
          path: '/Admin/admin',
          name: 'admin-admin',
          component: () => import('@/views/Admin/AdminView.vue'),
          meta: { title: '管理员管理' }
        },
        {
          path: '/Admin/permission',
          name: 'admin-permission',
          component: () => import('@/views/Admin/PermissionView.vue'),
          meta: { title: '权限管理' }
        },
        {
          path: '/Admin/role',
          name: 'admin-role',
          component: () => import('@/views/Admin/RoleView.vue'),
          meta: { title: '角色管理' }
        },
        {
          path: '/Distribution/permissions',
          name: 'distribution-permissions',
          component: () => import('@/views/Distribution/DistributorView.vue'),
          meta: { title: '分销员管理' }
        },
        {
          path: '/Distribution/list',
          name: 'distribution-list',
          component: () => import('@/views/Distribution/DistributionOrderView.vue'),
          meta: { title: '分销订单' }
        },
        {
          path: '/Distribution/commission',
          name: 'distribution-commission',
          component: () => import('@/views/Distribution/CommissionView.vue'),
          meta: { title: '佣金管理' }
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
