<script setup>
import { ref, onMounted } from 'vue'
import { useList } from '@/composables/useList'
import { getDistOrderList } from '@/api/distOrder'

const { list: orderList, loading, fetchList } = useList(getDistOrderList)
onMounted(() => fetchList())

const searchForm = ref({
    orderNo: '',
    distributor: '',
    status: ''
})

const handleSearch = () => {
    const orderNo = searchForm.value.orderNo.trim().toLowerCase()
    const distributor = searchForm.value.distributor.trim()
    const status = searchForm.value.status
    fetchList().then(() => {
        if (orderNo || distributor || status) {
            orderList.value = orderList.value.filter(item => {
                const matchNo = !orderNo || item.orderNo?.toLowerCase().includes(orderNo)
                const matchDist = !distributor || item.distributor?.includes(distributor)
                const matchStatus = !status || item.status === status
                return matchNo && matchDist && matchStatus
            })
        }
    })
}

const handleReset = () => {
    searchForm.value = { orderNo: '', distributor: '', status: '' }
    fetchList()
}
</script>


<template>
    <div class="page-container">
        <el-card class="search-card" shadow="never">
            <el-form :model="searchForm" inline>
                <el-form-item label="订单号">
                    <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
                </el-form-item>
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
            <el-table :data="orderList" stripe v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="orderNo" label="订单号" />
                <el-table-column prop="buyer" label="买家" />
                <el-table-column prop="distributor" label="分销员" />
                <el-table-column prop="commission" label="佣金">
                    <template #default="{ row }">
                        <span style="color: #f56c6c;">¥{{ row.commission }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="level" label="分销层级" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '已结算' ? 'success' : 'warning'">{{ row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" />
            </el-table>
        </el-card>
    </div>
</template>

<style scoped>
.page-container {
    padding: 20px;
}

.search-card {
    margin-bottom: 20px;
}
</style>