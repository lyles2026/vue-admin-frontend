<script setup>
import { ref, onMounted } from 'vue'
import { useList } from '@/composables/useList'
import { getVipList, addVip, updateVip, deleteVip } from '@/api/vip'
import DialogBox from '@/components/Common/DialogBox.vue'
import LayoutBox from '@/components/Common/LayoutBox.vue'

const { list: vipList, loading, fetchList: fetchVip } = useList(getVipList)
onMounted(() => fetchVip())

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
    await deleteVip(row._id)
    fetchVip()
}

const handleSubmit = async (form) => {
    const formData = { ...form }
    if (dialogType.value === 'add') {
        await addVip(formData)
    } else {
        await updateVip(currentRow.value._id, formData)
    }
    open.value = false
    fetchVip()
}

const List = [
    { name: 'name', label: '等级名称' },
    { name: 'level', label: '等级' },
    { name: 'discount', label: '折扣' },
    { name: 'minAmount', label: '最低消费' },
    { name: 'maxAmount', label: '最高消费' },
]

const rules = {
    name: [
        { required: true, message: '请输入等级名称', trigger: 'blur' },
    ],
    discount: [
        { required: true, message: '请输入折扣', trigger: 'blur' },
        { pattern: /^\d+(\.\d)?$/, message: '请输入正确的折扣', trigger: 'blur' }
    ],
    minAmount: [
        { required: true, message: '请输入最低消费', trigger: 'blur' },
        { pattern: /^\d+$/, message: '请输入整数', trigger: 'blur' }
    ],
    maxAmount: [
        { required: true, message: '请输入最高消费', trigger: 'blur' },
        { pattern: /^\d+$/, message: '请输入整数', trigger: 'blur' }
    ]
}

const VipColumns = [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: '等级名称' },
    { prop: 'level', label: '等级', width: 80 },
    { prop: 'discount', label: '折扣', width: 100 },
    { prop: 'amountRange', label: '消费金额区间' },
    { type: 'actions', label: '操作', width: 150 }
]
</script>


<template>
    <div class="page-container">

        <LayoutBox :DataList="vipList" :tableColumn="VipColumns" title="会员等级" add="新增等级" :loading="loading"
            @add="handleAdd" @edit="handleEdit" @delete="handleDelete">

            <template #discount="{ row }">
                <span style="color: #f56c6c;">{{ row.discount }}折</span>
            </template>

            <template #amountRange="{ row }">
                ¥{{ row.minAmount }} - ¥{{ row.maxAmount }}
            </template>

            <template #actions="{ row }">
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
        </LayoutBox>

        <DialogBox :visible="open" :List="List" :type="dialogType" :formData="currentRow" :rules="rules"
            :title="dialogType === 'add' ? '新增等级' : '编辑等级'" @confirm="handleSubmit" @update:visible="open = $event" />
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