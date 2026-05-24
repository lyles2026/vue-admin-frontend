<script setup>
import { ref, onMounted, computed } from 'vue'
import { getCommissionList, updateCommission } from '@/api/commission'
import { ElMessage } from 'element-plus'
import DialogBox from '@/components/Common/DialogBox.vue'

const commissionList = ref([])
const loading = ref(false)

const fetchList = async () => {
    loading.value = true
    try {
        const res = await getCommissionList()
        commissionList.value = res.data.data.map((item, index) => ({
            ...item,
            id: index + 1
        }))
    } finally {
        loading.value = false
    }
}
onMounted(() => fetchList())

const today = new Date()
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const stats = computed(() => ({
    totalCommission: commissionList.value.reduce((s, i) => s + (i.commission || 0), 0),
    settledCommission: commissionList.value.filter(i => i.status === '已结算').reduce((s, i) => s + (i.commission || 0), 0),
    pendingCommission: commissionList.value.filter(i => i.status === '待结算').reduce((s, i) => s + (i.commission || 0), 0),
    todayCommission: commissionList.value.filter(i => i.settleTime?.startsWith(todayStr)).reduce((s, i) => s + (i.commission || 0), 0),
}))

const searchForm = ref({
    distributor: '',
    status: '',
    dateRange: []
})

const handleSearch = () => {
    const distributor = searchForm.value.distributor.trim()
    const status = searchForm.value.status
    fetchList().then(() => {
        if (distributor || status) {
            commissionList.value = commissionList.value.filter(item => {
                const matchDist = !distributor || item.distributor?.includes(distributor)
                const matchStatus = !status || item.status === status
                return matchDist && matchStatus
            })
        }
    })
}

const handleReset = () => {
    searchForm.value = { distributor: '', status: '', dateRange: [] }
    fetchList()
}

const handleSettle = async (row) => {
    const now = new Date()
    const settleTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    await updateCommission(row._id, { status: '已结算', settleTime })
    ElMessage({ message: '结算成功', type: 'success', center: true })
    fetchList()
}

// 编辑佣金
const editVisible = ref(false)
const editRow = ref({})

const handleEdit = (row) => {
    editRow.value = { ...row }
    editVisible.value = true
}

const handleEditSubmit = async (form) => {
    const formData = { ...form }
    formData.commission = Number(formData.commission)
    formData.amount = Number(formData.amount)
    await updateCommission(editRow.value._id, formData)
    editVisible.value = false
    ElMessage({ message: '修改成功', type: 'success', center: true })
    fetchList()
}

const editFormList = [
    { name: 'amount', label: '订单金额' },
    { name: 'commission', label: '佣金' },
    { name: 'rate', label: '佣金比例' },
]

const editRules = {
    amount: [{ required: true, message: '请输入订单金额', trigger: 'blur' }],
    commission: [{ required: true, message: '请输入佣金', trigger: 'blur' }],
}
</script>


<template>
    <div class="page-container">
        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-row">
            <el-col :span="6">
                <el-card shadow="hover">
                    <div class="stat-title">累计佣金</div>
                    <div class="stat-value" style="color: #409EFF;">¥{{ stats.totalCommission }}</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover">
                    <div class="stat-title">已结算</div>
                    <div class="stat-value" style="color: #67c23a;">¥{{ stats.settledCommission }}</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover">
                    <div class="stat-title">待结算</div>
                    <div class="stat-value" style="color: #e6a23c;">¥{{ stats.pendingCommission }}</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover">
                    <div class="stat-title">今日佣金</div>
                    <div class="stat-value" style="color: #f56c6c;">¥{{ stats.todayCommission }}</div>
                </el-card>
            </el-col>
        </el-row>

        <el-card class="search-card" shadow="never">
            <el-form :model="searchForm" inline>
                <el-form-item label="分销员">
                    <el-input v-model="searchForm.distributor" placeholder="请输入分销员姓名" clearable />
                </el-form-item>
                <el-form-item label="结算状态">
                    <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                        <el-option label="待结算" value="待结算" />
                        <el-option label="已结算" value="已结算" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card shadow="never">
            <el-table :data="commissionList" stripe v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="distributor" label="分销员" />
                <el-table-column prop="orderNo" label="订单号" />
                <el-table-column prop="amount" label="订单金额">
                    <template #default="{ row }"><span>¥{{ row.amount }}</span></template>
                </el-table-column>
                <el-table-column prop="commission" label="佣金">
                    <template #default="{ row }">
                        <span style="color: #f56c6c;">¥{{ row.commission }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="rate" label="佣金比例" width="100" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '已结算' ? 'success' : 'warning'">{{ row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="settleTime" label="结算时间" />
                <el-table-column label="操作" width="160">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                        <el-button v-if="row.status === '待结算'" link type="success"
                            @click="handleSettle(row)">结算</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <DialogBox :visible="editVisible" :List="editFormList" :rules="editRules" :formData="editRow" title="编辑佣金"
            @confirm="handleEditSubmit" @update:visible="editVisible = $event" />
    </div>
</template>

<style scoped>
.page-container {
    padding: 20px;
}

.stats-row {
    margin-bottom: 20px;
}

.stat-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 10px;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
}

.search-card {
    margin-bottom: 20px;
}
</style>