<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import ConfirmDialog from '@/components/Common/ConfirmDialog.vue';
import HeaderMenu from '@/components/Home/HeaderMenu.vue'
import SidebarMenu from '@/components/Home/SidebarMenu.vue'
import { getMenuList } from '@/api/menu.js'


const menuList = ref([])
const router = useRouter()
const authStore = useAuthStore()
const dialogVisible = ref(false)

onMounted(async () => {
    try {
        const res = await getMenuList()
        menuList.value = res.data.data
    } catch (error) {
        if (error.response?.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            authStore.logout()
            router.push('/login')
        } else {
            ElMessage.error('获取菜单失败')
        }
    }
})


const handleLogout = () => {
    authStore.logout()
    dialogVisible.value = false

    ElMessage.success('已退出登录')
    router.push('/login')
}

const showLogoutConfirm = () => {
    dialogVisible.value = true
}

const isCollapse = ref(false)
</script>

<template>
    <div class="layout-container">
        <!-- 顶部Header -->
        <el-header class="header">
            <HeaderMenu @logout="showLogoutConfirm" :is-collapse="isCollapse"
                @toggle-collapse="isCollapse = !isCollapse" :menu-list="menuList" />
        </el-header>

        <el-container class="main-container">
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <SidebarMenu :menu-list="menuList" :is-collapse="isCollapse" />
            </el-aside>

            <!-- 主内容区 -->
            <el-container>
                <el-main>
                    <router-view />
                </el-main>
                <el-footer class="footer">
                    <div class="tech-stack">
                        <el-tag size="small" effect="plain">Vue 3</el-tag>
                        <el-tag size="small" effect="plain" type="success">Vite</el-tag>
                        <el-tag size="small" effect="plain" type="warning">Element Plus</el-tag>
                        <el-tag size="small" effect="plain" type="danger">Pinia</el-tag>
                        <el-tag size="small" effect="plain" type="info">Vue Router</el-tag>
                    </div>
                    <div class="copyright">© 2026 后台管理系统</div>
                </el-footer>
            </el-container>
        </el-container>
    </div>
    <ConfirmDialog v-model:visible="dialogVisible" title="退出登录" message="确定要退出登录吗？" cancel-text="取消" confirm-text="确定"
        @confirm="handleLogout" @cancel="dialogVisible = false" />
</template>

<style scoped>
.layout-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    white-space: nowrap;
    width: 100%;
    flex-shrink: 0;
}

.main-container {
    flex: 1;
    overflow: hidden;
}

.el-aside {
    overflow: hidden;
    transition: width 0.3s ease;
    background-color: #304156;
}

.el-menu {
    border-right: none;
    height: 100%;
    overflow-y: auto;
    background-color: #304156;
}

/* 菜单文字颜色 */
.el-menu :deep(.el-menu-item),
.el-menu :deep(.el-sub-menu__title) {
    color: #bfcbd9;
}

/* 鼠标悬停颜色 */
.el-menu :deep(.el-menu-item:hover),
.el-menu :deep(.el-sub-menu__title:hover) {
    background-color: #263445 !important;
    color: #409EFF;
}

/* 激活状态颜色 */
.el-menu :deep(.el-menu-item.is-active) {
    color: #409EFF;
    background-color: #263445 !important;
}

/* 子菜单背景色 */
.el-menu :deep(.el-sub-menu .el-menu) {
    background-color: #1f2d3d !important;
}

/* 主内容区边距 */
.el-main {
    padding: 8px;
}

/* Footer 样式 */
.footer {
    text-align: center;
    padding: 10px 0;
    background-color: #f5f5f5;
    border-top: 1px solid #e4e7ed;
}

.tech-stack {
    margin-bottom: 5px;
}

.tech-stack .el-tag {
    margin: 0 5px;
}

.copyright {
    font-size: 12px;
    color: #909399;
}

.el-main {
    padding: 20px;
    background-color: #f0f2f5;
    overflow-y: auto;
    /* 内容超出时滚动 */
}
</style>
