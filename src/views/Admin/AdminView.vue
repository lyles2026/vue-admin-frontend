<script setup>
import { ref, onMounted } from 'vue'
import { getAdminList, addAdmin, updateAdmin, deleteAdmin } from '@/api/admin'
import { getPageConfig } from '@/api/pageConfig'
import DialogBox from '@/components/Common/DialogBox.vue'
import { ElMessage } from 'element-plus'
import LayoutBox from '@/components/Common/LayoutBox.vue'
import SearchCard from '@/components/Common/SearchCard.vue'
import { useList } from '@/composables/useList'

const { list: adminList, loading, fetchList: fetchAdmins } = useList(getAdminList)
const AdminColumns = ref([])
const List = ref([])

onMounted(async () => {
    fetchAdmins()
    const res = await getPageConfig('admin')
    AdminColumns.value = res.data.data.columns
    List.value = res.data.data.formFields
})

const searchForm = ref({
    keyword: '',
    role: '',
    status: ''
})

const handleSearch = () => {
    const keyword = searchForm.value.keyword.trim().toLowerCase()
    const status = searchForm.value.status
    fetchAdmins().then(() => {
        if (keyword || status) {
            adminList.value = adminList.value.filter(item => {
                const matchKeyword = !keyword ||
                    item.username?.toLowerCase().includes(keyword) ||
                    item.nickname?.toLowerCase().includes(keyword)
                const matchStatus = !status || item.status === status
                return matchKeyword && matchStatus
            })
        }
    })
}

const handleReset = () => {
    searchForm.value = { keyword: '', role: '', status: '' }
    fetchAdmins()
}

// 编辑对话框
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
    await deleteAdmin(row._id)
    ElMessage({ message: '删除成功', type: 'success', center: true })
    fetchAdmins()
}

const handleSubmit = async (form) => {
    const formData = { ...form }
    formData.role = 'admin'
    if (dialogType.value === 'add') {
        await addAdmin(formData)
    } else {
        await updateAdmin(currentRow.value._id, formData)
    }
    open.value = false
    ElMessage({ message: dialogType.value === 'add' ? '新增成功' : '修改成功', type: 'success', center: true })
    fetchAdmins()
}

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '至少6位', trigger: 'blur' }],
    nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
}
</script>


<template>
    <div class="page-container">

        <SearchCard :searchForm="searchForm" @search="handleSearch" @reset="handleReset">
            <el-form-item label="关键词">
                <el-input v-model="searchForm.keyword" placeholder="用户名/昵称" clearable />
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                    <el-option label="正常" value="正常" />
                    <el-option label="禁用" value="禁用" />
                </el-select>
            </el-form-item>
        </SearchCard>

        <LayoutBox :DataList="adminList" :tableColumn="AdminColumns" title="管理员列表" add="新增管理员" :loading="loading"
            @add="handleAdd" @edit="handleEdit" @delete="handleDelete">

            <template #status="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : 'danger'">{{ row.status }}</el-tag>
            </template>

            <template #actions="{ row }">
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
        </LayoutBox>

        <DialogBox :visible="open" :List="List" :type="dialogType" :formData="currentRow" :rules="rules"
            :shopStatus="[{ name: '正常', value: '正常' }, { name: '禁用', value: '禁用' }]"
            :title="dialogType === 'add' ? '新增管理员' : '编辑管理员'" @confirm="handleSubmit" @update:visible="open = $event" />
    </div>
</template>

<style scoped>
.page-container {
    padding: 20px;
}
</style>