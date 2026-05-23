<script setup>
import { ref, onMounted } from 'vue'
import { getPermissionList, addPermission, updatePermission, deletePermission } from '@/api/permission'
import { ElMessage } from 'element-plus'

const permissionList = ref([])
const loading = ref(false)

const fetchList = async () => {
    loading.value = true
    try {
        const res = await getPermissionList()
        permissionList.value = res.data.data.map((item, index) => ({
            ...item,
            id: index + 1
        }))
    } finally {
        loading.value = false
    }
}
onMounted(() => fetchList())

const dialogVisible = ref(false)
const dialogType = ref('add')
const currentRow = ref({})

const handleAdd = () => {
    dialogType.value = 'add'
    currentRow.value = { roles: ['admin'] }
    dialogVisible.value = true
}

const handleEdit = (row) => {
    dialogType.value = 'edit'
    currentRow.value = { ...row, roles: row.roles || ['admin'] }
    dialogVisible.value = true
}

const handleDelete = async (row) => {
    await deletePermission(row._id)
    ElMessage({ message: '删除成功', type: 'success', center: true })
    fetchList()
}

const handleSubmit = async () => {
    const formData = { ...currentRow.value }
    // 普通用户有的权限，管理员自动继承
    if (formData.roles?.includes('user') && !formData.roles.includes('admin')) {
        formData.roles.push('admin')
    }
    if (dialogType.value === 'add') {
        await addPermission(formData)
    } else {
        await updatePermission(currentRow.value._id, formData)
    }
    dialogVisible.value = false
    ElMessage({ message: '保存成功', type: 'success', center: true })
    fetchList()
}
</script>


<template>
    <div class="page-container">
        <el-card shadow="never">
            <template #header>
                <div class="card-header">
                    <span>权限管理</span>
                    <el-button type="primary" @click="handleAdd">新增权限</el-button>
                </div>
            </template>

            <el-table :data="permissionList" stripe v-loading="loading">
                <el-table-column prop="name" label="权限名称" />
                <el-table-column prop="code" label="权限标识" />
                <el-table-column prop="type" label="类型" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.type === '菜单' ? 'primary' : 'info'">{{ row.type }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="path" label="路径" />
                <el-table-column prop="parent" label="父级" />
                <el-table-column label="授权角色" width="180">
                    <template #default="{ row }">
                        <el-tag v-for="r in (row.roles || ['admin'])" :key="r" :type="r === 'admin' ? 'danger' : 'info'"
                            size="small" style="margin-right:4px">{{ r === 'admin' ? '管理员' : '普通用户' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增权限' : '编辑权限'" width="500px">
            <el-form :model="currentRow" label-width="80px">
                <el-form-item label="权限名称">
                    <el-input v-model="currentRow.name" />
                </el-form-item>
                <el-form-item label="权限标识">
                    <el-input v-model="currentRow.code" />
                </el-form-item>
                <el-form-item label="类型">
                    <el-radio-group v-model="currentRow.type">
                        <el-radio label="菜单">菜单</el-radio>
                        <el-radio label="按钮">按钮</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="路径" v-if="currentRow.type === '菜单'">
                    <el-input v-model="currentRow.path" />
                </el-form-item>
                <el-form-item label="父级">
                    <el-input v-model="currentRow.parent" placeholder="顶级菜单留空" />
                </el-form-item>
                <el-form-item label="授权角色">
                    <el-checkbox-group v-model="currentRow.roles">
                        <el-checkbox label="admin">管理员</el-checkbox>
                        <el-checkbox label="user">普通用户</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style scoped>
.page-container {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>