<script setup>

defineProps({
    title: String,
    tableColumn: Array,
    add: String,
    actionLabel: String,
    buttonLabel: String,
    loading: Boolean,
    widthAction: String,
    widthButton: String,
    DataList: Array
})

const emit = defineEmits(['add', 'edit', 'delete', 'permission'])

</script>
<template>
    <el-card shadow="never">
        <template #header>
            <div class="card-header">
                <span>{{ title }}</span>
                <el-button type="primary" @click="emit('add')">{{ add }}</el-button>
            </div>
        </template>

        <el-table :data="DataList" stripe v-loading="loading">
            <el-table-column v-for="col in tableColumn" :key="col.prop || col.type" :prop="col.prop" :label="col.label"
                :width="col.width">
                <template #default="{ row }">
                    <template v-if="col.type === 'actions'">
                        <slot name="actions" :row="row">
                            <el-button link type="primary" @click="emit('edit', row)">编辑</el-button>
                            <el-button link type="danger" @click="emit('delete', row)">删除</el-button>
                        </slot>
                    </template>
                    <template v-else>
                        <slot :name="col.prop" :row="row">
                            {{ row[col.prop] }}
                        </slot>
                    </template>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</template>

<style scoped>

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>