<script setup>
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { markRaw } from 'vue';

defineProps({
    menuList: Array,
    isCollapse: Boolean
})

const iconMap = {}
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    iconMap[key] = markRaw(component)
}

</script>

<template>
    <el-menu class="el-menu-vertical-demo" :collapse="isCollapse" :collapse-transition="false" :router="true"
        :default-active="$route.path">
        <template v-for="item in menuList" :key="item.path">
            <el-sub-menu v-if="item.children" :index="item.path || item.index">
                <template #title>
                    <el-icon>
                        <component :is="iconMap[item.icon]" />
                    </el-icon>
                    <span>{{ item.title }}</span>
                </template>
                <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
                    <el-icon>
                        <component :is="iconMap[child.icon]" />
                    </el-icon>
                    <span>{{ child.title }}</span>
                </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="item.path">
                <el-icon>
                    <component :is="iconMap[item.icon]" />
                </el-icon>
                <template #title>{{ item.title }}</template>
            </el-menu-item>
        </template>
    </el-menu>
</template>