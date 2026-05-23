<script setup>
import { ref, onMounted } from 'vue'
import { getRoleList, addRole, updateRole, deleteRole } from '@/api/role'
import { getPermissionList } from '@/api/permission'
import { ElMessage } from 'element-plus'
import DialogBox from '@/components/Common/DialogBox.vue'

const roleList = ref([])
const loading = ref(false)

const fetchRoles = async () => {
    loading.value = true
    try {
        const res = await getRoleList()
        roleList.value = res.data.data.map((item, index) => ({
            ...item,
            id: index + 1
        }))
    } finally {
        loading.value = false
    }
}
onMounted(() => fetchRoles())

// 角色编辑对话框
const open = ref(false)
const dialogType = ref('add')
const currentRow = ref({})

const handleAdd = () => {
    dialogType.value = 'add'
    currentRow.value = {}
    open.value = true
}

const handleEdit = (row) => {
    dialogType.value = 'edit'
    currentRow.value = { ...row }
    open.value = true
}

const handleDelete = async (row) => {
    await deleteRole(row._id)
    ElMessage({ message: '删除成功', type: 'success', center: true })
    fetchRoles()
}

const handleSubmit = async (form) => {
    const formData = { ...form }
    if (dialogType.value === 'add') {
        await addRole(formData)
    } else {
        await updateRole(currentRow.value._id, formData)
    }
    open.value = false
    ElMessage({ message: '保存成功', type: 'success', center: true })
    fetchRoles()
}

const roleFormList = [
    { name: 'name', label: '角色名称' },
    { name: 'code', label: '角色标识' },
    { name: 'description', label: '描述' },
]

const roleRules = {
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入角色标识', trigger: 'blur' }],
}

// 权限分配对话框
const permDialogVisible = ref(false)
const permRole = ref({})
const permissionTree = ref([])
const treeRef = ref(null)
const checkedKeys = ref([])

const handlePermission = async (row) => {
    permRole.value = row
    checkedKeys.value = row.permissions || []
    // 获取所有权限，构建树
    try {
        const res = await getPermissionList()
        const perms = res.data.data || []
        const tree = buildTree(perms)
        permissionTree.value = tree
    } catch {
        permissionTree.value = []
    }
    permDialogVisible.value = true
}

const buildTree = (perms) => {
    const menus = perms.filter(p => p.type === '菜单')
    const buttons = perms.filter(p => p.type === '按钮')
    return menus.map(menu => ({
        id: menu.code,
        label: menu.name,
        children: buttons
            .filter(b => b.parent === menu.name)
            .map(b => ({ id: b.code, label: b.name }))
    }))
}

const savePermissions = async () => {
    const keys = treeRef.value?.getCheckedKeys() || []
    await updateRole(permRole.value._id, { permissions: keys })
    permDialogVisible.value = false
    ElMessage({ message: '权限分配成功', type: 'success', center: true })
    fetchRoles()
}
</script>


<template>
    <div class="page-container">
        <el-card shadow="never">
            <template #header>
                <div class="card-header">
                    <span>角色管理</span>
                    <el-button type="primary" @click="handleAdd">新增角色</el-button>
                </div>
            </template>

            <el-table :data="roleList" stripe v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="角色名称" />
                <el-table-column prop="code" label="角色标识" />
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="permissions" label="权限数" width="100">
                    <template #default="{ row }">
                        {{ (row.permissions || []).length }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="handlePermission(row)">权限</el-button>
                        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 角色编辑 -->
        <DialogBox :visible="open" :List="roleFormList" :rules="roleRules" :formData="currentRow" :type="dialogType"
            :title="dialogType === 'add' ? '新增角色' : '编辑角色'" @confirm="handleSubmit" @update:visible="open = $event" />

        <!-- 权限分配 -->
        <el-dialog v-model="permDialogVisible" title="分配权限" width="400px">
            <el-tree ref="treeRef" :data="permissionTree" show-checkbox node-key="id" default-expand-all
                :default-checked-keys="checkedKeys"
                @check-change="() => { checkedKeys.value = treeRef?.value?.getCheckedKeys() || [] }" />
            <template #footer>
                <el-button @click="permDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="savePermissions">确定</el-button>
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