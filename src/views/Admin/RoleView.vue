<script setup>
import { ref, onMounted } from 'vue'
import { useList } from '@/composables/useList'
import { getRoleList, addRole, updateRole, deleteRole } from '@/api/role'
import { getPermissionList } from '@/api/permission'
import { getPageConfig } from '@/api/pageConfig'
import { ElMessage } from 'element-plus'
import DialogBox from '@/components/Common/DialogBox.vue'
import LayoutBox from '@/components/Common/LayoutBox.vue'

const { list: roleList, loading, fetchList: fetchRoles } = useList(getRoleList)
const RoleColumns = ref([])
const roleFormList = ref([])

onMounted(async () => {
    fetchRoles()
    const res = await getPageConfig('role')
    RoleColumns.value = res.data.data.columns
    roleFormList.value = res.data.data.formFields
})

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

        <LayoutBox :DataList="roleList" :tableColumn="RoleColumns" title="角色管理" add="新增角色" :loading="loading"
            @add="handleAdd" @edit="handleEdit" @delete="handleDelete">

            <template #permissions="{ row }">
                {{ (row.permissions || []).length }}
            </template>

            <template #actions="{ row }">
                <el-button link type="primary" @click="handlePermission(row)">权限</el-button>
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
        </LayoutBox>

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