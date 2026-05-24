<script setup>
import { ref, onMounted } from 'vue'
import { useList } from '@/composables/useList'
import { getCoupon, addCoupon, updateCoupon, deleteCoupon } from '@/api/coupon'
import { getPageConfig } from '@/api/pageConfig'
import DialogBox from '@/components/Common/DialogBox.vue'
import LayoutBox from '@/components/Common/LayoutBox.vue'

// 优惠券列表
const { list: couponList, loading, fetchList: fetchCoupons } = useList(getCoupon)
const CouponColumns = ref([])
const List = ref([])

onMounted(async () => {
    fetchCoupons()
    const res = await getPageConfig('coupon')
    CouponColumns.value = res.data.data.columns
    List.value = res.data.data.formFields
})

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
