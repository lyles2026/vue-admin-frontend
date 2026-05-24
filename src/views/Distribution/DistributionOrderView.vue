<script setup>
import { ref, onMounted } from 'vue'
import { useList } from '@/composables/useList'
import { getDistOrderList } from '@/api/distOrder'
import { getPageConfig } from '@/api/pageConfig'
import LayoutBox from '@/components/Common/LayoutBox.vue'
import SearchCard from '@/components/Common/SearchCard.vue'

const { list: orderList, loading, fetchList } = useList(getDistOrderList)
const DistOrderColumns = ref([])

onMounted(async () => {
    fetchList()
    const res = await getPageConfig('distOrder')
    DistOrderColumns.value = res.data.data.columns
})

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

        <SearchCard :searchForm="searchForm" @search="handleSearch" @reset="handleReset">
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
        </SearchCard>

        <LayoutBox :DataList="orderList" :tableColumn="DistOrderColumns" title="分销订单" :loading="loading">

            <template #commission="{ row }">
                <span style="color: #f56c6c;">¥{{ row.commission }}</span>
            </template>

            <template #status="{ row }">
                <el-tag :type="row.status === '已结算' ? 'success' : 'warning'">{{ row.status }}</el-tag>
            </template>
        </LayoutBox>
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