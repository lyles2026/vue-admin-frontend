<script setup>
import { ref, onMounted } from 'vue'
import { useList } from '@/composables/useList'
import { getAfterSaleList, updateAfterSale, deleteAfterSale } from '@/api/afterSale'
import { getPageConfig } from '@/api/pageConfig'
import { ElMessage } from 'element-plus'
import DialogBox from '@/components/Common/DialogBox.vue'
import LayoutBox from '@/components/Common/LayoutBox.vue'
import SearchCard from '@/components/Common/SearchCard.vue'

const { list: afterSaleList, loading, fetchList } = useList(getAfterSaleList)
const AfterSaleColumns = ref([])

onMounted(async () => {
    fetchList()
    const res = await getPageConfig('afterSale')
    AfterSaleColumns.value = res.data.data.columns
})

const searchForm = ref({
    orderNo: '',
    type: '',
    status: ''
})

const statusTypeMap = {
    '待处理': 'danger',
    '处理中': 'warning',
    '已完成': 'success'
}

const getStatusType = (status) => statusTypeMap[status] || ''

const handleSearch = () => {
    const orderNo = searchForm.value.orderNo.trim().toLowerCase()
    const type = searchForm.value.type
    const status = searchForm.value.status
    fetchList().then(() => {
        if (orderNo || type || status) {
            afterSaleList.value = afterSaleList.value.filter(item => {
                const matchNo = !orderNo || item.orderNo?.toLowerCase().includes(orderNo)
                const matchType = !type || item.type === type
                const matchStatus = !status || item.status === status
                return matchNo && matchType && matchStatus
            })
        }
    })
}

const handleReset = () => {
    searchForm.value = { orderNo: '', type: '', status: '' }
    fetchList()
}

// 处理售后弹框
const open = ref(false)
const currentRow = ref({})

const handleProcess = (row) => {
    currentRow.value = { ...row }
    open.value = true
}

const handleSubmit = async (form) => {
    const formData = { ...form }
    const now = new Date()
    const handleTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    await updateAfterSale(currentRow.value._id, {
        status: formData.status,
        handleTime,
        handleNote: formData.note || ''
    })
    open.value = false
    ElMessage({ message: '处理完成', type: 'success', center: true })
    fetchList()
}

const processList = [
    { id: 3, name: 'status', label: '处理结果' },
    { name: 'note', label: '备注' },
]

const processRules = {
    status: [{ required: true, message: '请选择处理结果', trigger: 'change' }]
}

const handleDelete = async (row) => {
    await deleteAfterSale(row._id)
    ElMessage({ message: '删除成功', type: 'success', center: true })
    fetchList()
}

</script>


<template>
    <div class="page-container">

        <SearchCard :searchForm="searchForm" @search="handleSearch" @reset="handleReset">
            <el-form-item label="订单号">
                <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
            </el-form-item>
            <el-form-item label="售后类型">
                <el-select v-model="searchForm.type" placeholder="请选择" clearable>
                    <el-option label="退款" value="退款" />
                    <el-option label="退货退款" value="退货退款" />
                    <el-option label="换货" value="换货" />
                </el-select>
            </el-form-item>
            <el-form-item label="处理状态">
                <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                    <el-option label="待处理" value="待处理" />
                    <el-option label="处理中" value="处理中" />
                    <el-option label="已完成" value="已完成" />
                </el-select>
            </el-form-item>
        </SearchCard>

        <LayoutBox :DataList="afterSaleList" :tableColumn="AfterSaleColumns" title="售后管理" :loading="loading">

            <template #amount="{ row }">
                <span style="color: #f56c6c;">¥{{ row.amount }}</span>
            </template>

            <template #status="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
            </template>

            <template #actions="{ row }">
                <el-button v-if="row.status !== '已完成'" link type="primary" @click="handleProcess(row)">处理</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
        </LayoutBox>

        <!-- 处理售后弹框 -->
        <DialogBox :visible="open" :List="processList" :rules="processRules" :formData="currentRow"
            :shopStatus="[{ name: '待处理', value: '待处理' }, { name: '处理中', value: '处理中' }, { name: '已完成', value: '已完成' }]"
            title="处理售后" @confirm="handleSubmit" @update:visible="open = $event" />
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