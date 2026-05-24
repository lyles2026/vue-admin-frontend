<script setup>
import { ref, onMounted } from 'vue'
import { useList } from '@/composables/useList'
import { getOrderList, addOrder, updateOrder, deleteOrder } from '@/api/order'
import { ElMessage } from 'element-plus'
import DialogBox from '@/components/Common/DialogBox.vue'

const { list: orderList, loading, fetchList: fetchOrders } = useList(getOrderList)
onMounted(() => fetchOrders())

const searchForm = ref({
    orderNo: '',
    status: '',
    dateRange: []
})

const handleSearch = () => {
    fetchOrders().then(() => applyFilter())
}

const applyFilter = () => {
    const orderNo = searchForm.value.orderNo.trim().toLowerCase()
    const statusKey = searchForm.value.status
    const range = searchForm.value.dateRange
    if (orderNo || statusKey || range.length) {
        orderList.value = orderList.value.filter(item => {
            const matchNo = !orderNo || item.orderNo?.toLowerCase().includes(orderNo)
            const matchStatus = !statusKey || item.status === statusKey
            const matchDate = !range.length || (
                item.createTime >= range[0] && item.createTime <= range[1]
            )
            return matchNo && matchStatus && matchDate
        })
    }
}

const handleReset = () => {
    searchForm.value = { orderNo: '', status: '', dateRange: [] }
    fetchOrders()
}

const statusMap = {
    '待付款': 'warning',
    '待发货': 'primary',
    '已发货': 'success',
    '已完成': 'info'
}

const getStatusType = (status) => statusMap[status] || ''

// 详情弹框
const detailVisible = ref(false)
const detailData = ref({})

const handleDetail = (row) => {
    detailData.value = row
    detailVisible.value = true
}

const handleShip = async (row) => {
    try {
        await updateOrder(row._id, { status: '已发货' })
        ElMessage({ message: '发货成功', type: 'success', center: true })
        fetchOrders()
    } catch {
        ElMessage({ message: '发货失败', type: 'error', center: true })
    }
}

const handleDeleteOrder = async (row) => {
    try {
        await deleteOrder(row._id)
        ElMessage({ message: '删除成功', type: 'success', center: true })
        fetchOrders()
    } catch {
        ElMessage({ message: '删除失败', type: 'error', center: true })
    }
}

// 新增订单
const addVisible = ref(false)
const currentRow = ref({})

const handleAddOrder = () => {
    currentRow.value = {}
    addVisible.value = true
}

const handleAddSubmit = async (form) => {
    const formData = { ...form }
    formData.status = '待付款'
    await addOrder(formData)
    addVisible.value = false
    ElMessage({ message: '订单创建成功', type: 'success', center: true })
    fetchOrders()
}

const orderFormList = [
    { name: 'user', label: '买家' },
    { name: 'phone', label: '手机号' },
    { name: 'amount', label: '订单金额' },
    { name: 'address', label: '收货地址' },
]

const orderRules = {
    user: [{ required: true, message: '请输入买家', trigger: 'blur' }],
    phone: [{ pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }],
    amount: [{ required: true, message: '请输入订单金额', trigger: 'blur' }],
}
</script>


<template>
    <div class="page-container">
        <el-card class="search-card" shadow="never">
            <el-form :model="searchForm" inline>
                <el-form-item label="订单号">
                    <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
                </el-form-item>
                <el-form-item label="订单状态">
                    <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                        <el-option label="待付款" value="待付款" />
                        <el-option label="待发货" value="待发货" />
                        <el-option label="已发货" value="已发货" />
                        <el-option label="已完成" value="已完成" />
                    </el-select>
                </el-form-item>
                <el-form-item label="下单时间">
                    <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
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
                    <span>订单列表</span>
                    <el-button type="primary" @click="handleAddOrder">新增订单</el-button>
                </div>
            </template>
            <el-table :data="orderList" stripe v-loading="loading">
                <el-table-column prop="orderNo" label="订单号" width="180" />
                <el-table-column prop="user" label="买家" />
                <el-table-column prop="phone" label="手机号" />
                <el-table-column prop="amount" label="订单金额">
                    <template #default="{ row }">
                        <span style="color: #f56c6c;">¥{{ row.amount }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="payTime" label="支付时间" />
                <el-table-column label="操作" width="220">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
                        <el-button v-if="row.status === '待发货'" link type="success"
                            @click="handleShip(row)">发货</el-button>
                        <el-button link type="danger" @click="handleDeleteOrder(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 订单详情弹框 -->
        <el-dialog v-model="detailVisible" title="订单详情" width="600px">
            <el-descriptions :column="2" border v-if="detailData._id">
                <el-descriptions-item label="订单号">{{ detailData.orderNo }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag :type="getStatusType(detailData.status)">{{ detailData.status }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="买家">{{ detailData.user }}</el-descriptions-item>
                <el-descriptions-item label="手机号">{{ detailData.phone }}</el-descriptions-item>
                <el-descriptions-item label="订单金额">¥{{ detailData.amount }}</el-descriptions-item>
                <el-descriptions-item label="支付时间">{{ detailData.payTime || '未支付' }}</el-descriptions-item>
                <el-descriptions-item label="收货地址" :span="2">{{ detailData.address || '暂无' }}</el-descriptions-item>
                <el-descriptions-item label="下单时间" :span="2">{{ detailData.createTime }}</el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <el-button @click="detailVisible = false">关闭</el-button>
            </template>
        </el-dialog>

        <!-- 新增订单 -->
        <DialogBox :visible="addVisible" :List="orderFormList" :rules="orderRules" title="新增订单"
            @confirm="handleAddSubmit" @update:visible="addVisible = $event" />
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