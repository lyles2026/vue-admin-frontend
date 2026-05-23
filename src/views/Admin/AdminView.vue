<script setup>
import { ref, onMounted } from 'vue'
import { getAdminList, addAdmin, updateAdmin, deleteAdmin } from '@/api/admin'
import DialogBox from '@/components/Common/DialogBox.vue'
import { ElMessage } from 'element-plus'

const adminList = ref([])
const loading = ref(false)

const fetchAdmins = async () => {
    loading.value = true
    try {
        const res = await getAdminList()
        adminList.value = res.data.data.map((item, index) => ({
            ...item,
            id: index + 1
        }))
    } finally {
        loading.value = false
    }
}
onMounted(() => fetchAdmins())

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

const List = [
    { name: 'username', label: '用户名' },
    { name: 'password', label: '密码' },
    { name: 'nickname', label: '昵称' },
    { name: 'phone', label: '手机号' },
    { name: 'email', label: '邮箱' },
    { id: 2, name: 'status', label: '状态' },
]

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '至少6位', trigger: 'blur' }],
    nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
}
</script>


<template>
    <div class="page-container">
        <el-card class="search-card" shadow="never">
            <el-form :model="searchForm" inline>
                <el-form-item label="关键词">
                    <el-input v-model="searchForm.keyword" placeholder="用户名/昵称" clearable />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                        <el-option label="正常" value="正常" />
                        <el-option label="禁用" value="禁用" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card shadow="never">
            <template #header>
                <div class="card-header">
                    <span>管理员列表</span>
                    <el-button type="primary" @click="handleAdd">新增管理员</el-button>
                </div>
            </template>

            <el-table :data="adminList" stripe v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="nickname" label="昵称" />
                <el-table-column prop="phone" label="手机号" />
                <el-table-column prop="email" label="邮箱" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '正常' ? 'success' : 'danger'">{{ row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间" />
                <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <DialogBox :visible="open" :List="List" :type="dialogType" :formData="currentRow" :rules="rules"
            :shopStatus="[{ name: '正常', value: '正常' }, { name: '禁用', value: '禁用' }]"
            :title="dialogType === 'add' ? '新增管理员' : '编辑管理员'" @confirm="handleSubmit" @update:visible="open = $event" />
    </div>
</template>

<style scoped>
.page-container {
    padding: 20px;
}

.search-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>