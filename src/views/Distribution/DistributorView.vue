<script setup>
import { ref, onMounted } from 'vue'
import { useList } from '@/composables/useList'
import { getDistributorList, updateDistributor } from '@/api/distributor'
import { getPageConfig } from '@/api/pageConfig'
import { ElMessage } from 'element-plus'
import LayoutBox from '@/components/Common/LayoutBox.vue'
import SearchCard from '@/components/Common/SearchCard.vue'

const { list: distributorList, loading, fetchList } = useList(getDistributorList)
const DistributorColumns = ref([])

onMounted(async () => {
    fetchList()
    const res = await getPageConfig('distributor')
    DistributorColumns.value = res.data.data.columns
})

const searchForm = ref({
    keyword: '',
    level: '',
    status: ''
})

const handleSearch = () => {
    const keyword = searchForm.value.keyword.trim().toLowerCase()
    const level = searchForm.value.level
    const status = searchForm.value.status
    fetchList().then(() => {
        if (keyword || level || status) {
            distributorList.value = distributorList.value.filter(item => {
                const matchKeyword = !keyword || item.name?.includes(keyword) || item.phone?.includes(keyword)
                const matchLevel = !level || item.level === level
                const matchStatus = !status || item.status === status
                return matchKeyword && matchLevel && matchStatus
            })
        }
    })
}

const handleReset = () => {
    searchForm.value = { keyword: '', level: '', status: '' }
    fetchList()
}

const detailVisible = ref(false)
const detailData = ref({})

const handleDetail = (row) => {
    detailData.value = row
    detailVisible.value = true
}

const handleDisable = async (row) => {
    const newStatus = row.status === '正常' ? '禁用' : '正常'
    await updateDistributor(row._id, { status: newStatus })
    ElMessage({ message: newStatus === '正常' ? '已启用' : '已禁用', type: 'success', center: true })
    fetchList()
}</script>


<template>
    <div class="page-container">

        <SearchCard :searchForm="searchForm" @search="handleSearch" @reset="handleReset">
            <el-form-item label="关键词">
                <el-input v-model="searchForm.keyword" placeholder="姓名/手机号" clearable />
            </el-form-item>
            <el-form-item label="分销等级">
                <el-select v-model="searchForm.level" placeholder="请选择" clearable>
                    <el-option label="一级分销" value="一级分销" />
                    <el-option label="二级分销" value="二级分销" />
                </el-select>
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                    <el-option label="正常" value="正常" />
                    <el-option label="禁用" value="禁用" />
                </el-select>
            </el-form-item>
        </SearchCard>

        <LayoutBox :DataList="distributorList" :tableColumn="DistributorColumns" title="分销员管理" :loading="loading">

            <template #totalCommission="{ row }">
                <span style="color: #f56c6c;">¥{{ row.totalCommission }}</span>
            </template>

            <template #settledCommission="{ row }">
                <span style="color: #67c23a;">¥{{ row.settledCommission }}</span>
            </template>

            <template #pendingCommission="{ row }">
                <span style="color: #e6a23c;">¥{{ row.pendingCommission }}</span>
            </template>

            <template #status="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : 'danger'">{{ row.status }}</el-tag>
            </template>

            <template #actions="{ row }">
                <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
                <el-button link type="danger" @click="handleDisable(row)">{{ row.status === '正常' ? '禁用' : '启用'
                    }}</el-button>
            </template>
        </LayoutBox>

        <el-dialog v-model="detailVisible" title="分销员详情" width="600px">
            <el-descriptions :column="2" border v-if="detailData._id">
                <el-descriptions-item label="姓名">{{ detailData.name }}</el-descriptions-item>
                <el-descriptions-item label="手机号">{{ detailData.phone }}</el-descriptions-item>
                <el-descriptions-item label="分销等级">{{ detailData.level }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag :type="detailData.status === '正常' ? 'success' : 'danger'">{{ detailData.status }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="累计佣金">¥{{ detailData.totalCommission }}</el-descriptions-item>
                <el-descriptions-item label="已结算">¥{{ detailData.settledCommission }}</el-descriptions-item>
                <el-descriptions-item label="待结算">¥{{ detailData.pendingCommission }}</el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <el-button @click="detailVisible = false">关闭</el-button>
            </template>
        </el-dialog>
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