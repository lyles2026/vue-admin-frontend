<script setup>
import { ref, onMounted } from 'vue'
import { useList } from '@/composables/useList'
import { getCoupon, addCoupon, updateCoupon, deleteCoupon } from '@/api/coupon'
import DialogBox from '@/components/Common/DialogBox.vue'
import LayoutBox from '@/components/Common/LayoutBox.vue'

// 优惠券列表
const calculateStatus = (startTime, endTime) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)
    if (now < start) return '未开始'
    if (now > end) return '已结束'
    return '进行中'
}

const { list: couponList, loading, fetchList: fetchCoupons } = useList(getCoupon)
onMounted(() => fetchCoupons())

const open = ref(false)
const dialogTitle = ref('新增优惠券')

const dialogType = ref('add')
const currentRow = ref({})

const handleAdd = () => {
    dialogTitle.value = '新增优惠券'
    dialogType.value = 'add'
    currentRow.value = {}
    open.value = true
}

const handleEdit = (row) => {
    dialogTitle.value = '编辑优惠券'
    currentRow.value = { ...row }
    dialogType.value = 'edit'
    open.value = true
}

const handleDelete = async (row) => {
    await deleteCoupon(row._id)
    fetchCoupons()
}

const handleSubmit = async (form) => {
    const formData = { ...form }
    // 根据日期自动计算状态
    const now = new Date()
    const start = new Date(formData.startTime)
    const end = new Date(formData.endTime)
    if (now < start) formData.status = '未开始'
    else if (now > end) formData.status = '已结束'
    else formData.status = '进行中'

    if (dialogType.value === 'add') {
        formData.receiveCount = 0
        await addCoupon(formData)
    } else {
        await updateCoupon(currentRow.value._id, formData)
    }
    open.value = false
    fetchCoupons()
}

const List = [
    { name: 'name', label: '优惠券名称' },
    { name: 'type', label: '类型' },
    { name: 'value', label: '优惠内容' },
    { id: 4, name: 'validity', label: '有效期' },
]

const CouponColumns = [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: '优惠券名称' },
    { prop: 'type', label: '类型', width: 100 },
    { prop: 'value', label: '优惠内容', width: 120 },
    { prop: 'startTime', label: '开始时间', width: 120 },
    { prop: 'endTime', label: '结束时间', width: 120 },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'receiveCount', label: '领取人数', width: 100 },
    { type: 'actions', label: '操作', width: 150 }
]
</script>


<template>
    <div class="page-container">

        <LayoutBox :DataList="couponList" :tableColumn="CouponColumns" title="优惠券管理" add="新增优惠券" :loading="loading"
            @add="handleAdd" @edit="handleEdit" @delete="handleDelete">

            <template #status="{ row }">
                <el-tag :type="row.status === '进行中' ? 'success' : row.status === '未开始' ? 'warning' : 'info'">
                    {{ row.status }}
                </el-tag>
            </template>

            <template #actions="{ row }">
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
        </LayoutBox>

        <DialogBox :visible="open" :List="List" :type="dialogType" :formData="currentRow" @confirm="handleSubmit"
            @update:visible="open = $event" />
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
