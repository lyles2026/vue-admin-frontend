<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { Expand, Fold, ArrowDown, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
    isCollapse: Boolean,
    menuList: Array
})

defineEmits(['toggle-collapse', 'logout'])

const route = useRoute()

const breadcrumbList = computed(() => {
    const currentPath = route.path
    const currentRoute = route
    const breadcrumbs = []

    // 首页/后台面板c
    if (currentPath === '/' || currentPath === '') {
        breadcrumbs.push({
            name: '后台面板',
            path: '/'
        })
        return breadcrumbs
    }

    // 非首页：后台面板 > 当前页面
    breadcrumbs.push({
        name: '后台面板',
        path: '/'
    })

    // 查找当前路径对应的父级菜单
    const findParentMenu = (menuList, targetPath) => {
        for (const menu of menuList) {
            if (menu.children) {
                const child = menu.children.find(c => c.path === targetPath)
                if (child) {
                    return menu
                }
            }
        }
        return null
    }

    const parentMenu = findParentMenu(props.menuList, currentPath)

    // 如果有父级菜单，添加父级
    if (parentMenu) {
        breadcrumbs.push({
            name: parentMenu.title,
            path: ''  // 父级菜单不跳转
        })
    }

    // 添加当前页面
    if (currentRoute.meta && currentRoute.meta.title) {
        breadcrumbs.push({
            name: currentRoute.meta.title,
            path: currentPath
        })
    }

    return breadcrumbs
})
</script>

<template>
    <el-row class="header-row">
        <el-col :span="12">
            <div class="left">
                <span class="logo-text">后台管理系统</span>
                <el-icon @click="$emit('toggle-collapse')">
                    <Expand v-if="!isCollapse" />
                    <Fold v-else />
                </el-icon>
                <el-breadcrumb :separator-icon="ArrowRight" separator="/" class="breadcrumb">
                    <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index"
                        :to="index !== breadcrumbList.length - 1 ? { path: item.path } : undefined">{{ item.name
                        }}</el-breadcrumb-item>
                </el-breadcrumb>
            </div>
        </el-col>
        <el-col :span="12">
            <div class="right">
                <el-dropdown trigger="click">
                    <span class="avatar-wrapper">
                        <el-avatar :size="40" src="/src/assets/logo.jpeg" />
                        <el-icon>
                            <ArrowDown />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>个人中心</el-dropdown-item>
                            <el-dropdown-item divided @click="$emit('logout')">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </el-col>
    </el-row>
</template>

<style scoped>
.header-row {
    display: flex;
    align-items: center;
    height: 100%;
    font-size: 24px;
}

.logo-text {
    margin: 0;
    margin-right: 12px;
}

.right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
}

.avatar-wrapper {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #fff;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

.avatar-wrapper .el-icon {
    margin-left: 8px;
}

.breadcrumb {
    display: inline-flex;
    align-items: center;
    margin-left: 20px;
    font-size: 14px;
}

.breadcrumb :deep(.el-breadcrumb__inner) {
    color: rgba(255, 255, 255, 0.8);
    transition: color 0.3s;
}

.breadcrumb :deep(.el-breadcrumb__item:not(:last-child) .el-breadcrumb__inner:hover) {
    color: #409EFF;
}

.breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
    color: #999 !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
}
</style>