<script setup>

defineProps({
    searchForm: Object,
})

const emit = defineEmits(['search', 'reset'])

</script>

<template>
    <el-card class="search-card" shadow="never">
        <el-form :model="searchForm" inline>
            <slot :searchForm="searchForm" />
            <el-form-item>
                <el-button type="primary" @click="emit('search')">搜索</el-button>
                <el-button @click="emit('reset')">重置</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<style scoped>
.search-card {
    margin-bottom: 20px;
}

</style>