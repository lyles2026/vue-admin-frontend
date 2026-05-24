<script setup>
import { ref, onMounted, computed } from 'vue'
import { useList } from '@/composables/useList'
import { getUserList, updateUser, deleteUser } from '@/api/user'
import { getVipList } from '@/api/vip'
import DialogBox from '@/components/Common/DialogBox.vue'
import LayoutBox from '@/components/Common/LayoutBox.vue'
import SearchCard from '@/components/Common/SearchCard.vue'

// 用户列表
const { list: userList, loading } = useList(getUserList)

const fetchUsers = async () => {
    loading.value = true
    try {
        const res = await getUserList()
        userList.value = res.data.data.map((item, index) => ({
            ...item,
            id: index + 1,
            createTime: item.createdAt
        }))
    } finally {
        loading.value = false
    }
}
// 搜索
const searchForm = ref({
    keyword: '',
    level: '',
    status: ''
})

const handleSearch = () => {
    const keyword = searchForm.value.keyword.trim().toLowerCase()
    const level = searchForm.value.level
    const status = searchForm.value.status
    fetchUsers().then(() => {
        if (keyword || level || status) {
            userList.value = userList.value.filter(item => {
                const matchKeyword = !keyword ||
                    item.username?.toLowerCase().includes(keyword) ||
                    item.nickname?.toLowerCase().includes(keyword) ||
                    item.phone?.includes(keyword)
                const matchLevel = !level || item.level === level
                const matchStatus = !status || item.status === status
                return matchKeyword && matchLevel && matchStatus
            })
        }
    })
}

const handleReset = () => {
    searchForm.value = { keyword: '', level: '', status: '' }
    fetchUsers()
}

// 编辑对话框
const open = ref(false)
const currentRow = ref({})

const handleEdit = (row) => {
    currentRow.value = { ...row }
    open.value = true
}

const handleSubmit = async (form) => {
    const formData = { ...form }
    await updateUser(currentRow.value._id, formData)
    open.value = false
    fetchUsers()
}

const handleDisable = async (row) => {
    const newStatus = row.status === '正常' ? '禁用' : '正常'
    await updateUser(row._id, { status: newStatus })
    fetchUsers()
}

const handleDelete = async (row) => {
    await deleteUser(row._id)
    fetchUsers()
}

const List = computed(() => {
    const items = [
        { name: 'nickname', label: '昵称' },
        { name: 'phone', label: '手机号' },
        { name: 'email', label: '邮箱' },
        { id: 1, name: 'level', label: '会员等级' },
        { id: 2, name: 'status', label: '状态' },
    ]
    return items
})

const levelOptions = ref([])

const statusOptions = [
    { name: '正常', value: 'normal' },
    { name: '禁用', value: 'disabled' },
]

// 从会员等级页面获取等级选项
const fetchLevelOptions = async () => {
    try {
        const res = await getVipList()
        levelOptions.value = (res.data.data || []).map(item => ({
            name: item.name,
            value: item.name
        }))
    } catch (err) {
        console.error('获取会员等级失败:', err)
    }
}

onMounted(() => {
    fetchUsers()
    fetchLevelOptions()
})

const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码至少6位', trigger: 'blur' }
    ],
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
    ],
    phone: [
        { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    email: [
        { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
    ]
}

const UserColumns = [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'username', label: '用户名' },
    { prop: 'nickname', label: '昵称' },
    { prop: 'phone', label: '手机号' },
    { prop: 'email', label: '邮箱' },
    { prop: 'level', label: '会员等级' },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'createTime', label: '注册时间' },
    { type: 'actions', label: '操作', width: 220 }
]
</script>


<template>
    <div class="page-container">

        <SearchCard :searchForm="searchForm" @search="handleSearch" @reset="handleReset">
            <el-form-item label="关键词">
                <el-input v-model="searchForm.keyword" placeholder="用户名/昵称/手机号" clearable />
            </el-form-item>
            <el-form-item label="会员等级">
                <el-select v-model="searchForm.level" placeholder="请选择" clearable>
                    <el-option v-for="item in levelOptions" :key="item.value" :label="item.name" :value="item.name" />
                </el-select>
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                    <el-option label="正常" value="正常" />
                    <el-option label="禁用" value="禁用" />
                </el-select>
            </el-form-item>
        </SearchCard>

        <LayoutBox :DataList="userList" :tableColumn="UserColumns" title="用户管理" :loading="loading">

            <template #phone="{ row }">
                {{ row.phone || '暂无' }}
            </template>

            <template #email="{ row }">
                {{ row.email || '暂无' }}
            </template>

            <template #level="{ row }">
                <el-tag :type="row.level === 'SVIP会员' ? 'danger' : row.level === 'VIP会员' ? 'warning' : ''">
                    {{ row.level }}
                </el-tag>
            </template>

            <template #status="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : 'danger'">{{ row.status }}</el-tag>
            </template>

            <template #actions="{ row }">
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDisable(row)">{{ row.status === '正常' ? '禁用' : '启用'
                    }}</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
        </LayoutBox>

        <DialogBox :visible="open" :List="List" :formData="currentRow" :shopCategory="levelOptions"
            :shopStatus="statusOptions" :rules="rules" title="编辑用户" @confirm="handleSubmit"
            @update:visible="open = $event" />
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
