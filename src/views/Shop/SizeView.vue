<script setup>
import { ref, onMounted } from 'vue'
import { useList } from '@/composables/useList'
import { addSize, deleteSize, getSize, updateSize } from '@/api/size.js'
import { getShop } from '@/api/shop'
import { getPageConfig } from '@/api/pageConfig'
import DialogBox from '@/components/Common/DialogBox.vue'
import LayoutBox from '@/components/Common/LayoutBox.vue'


// 规格列表
const { list: sizeList, loading } = useList(getSize)

const SizeColumns = ref([])
const List = ref([])

const open = ref(false)

const fetchSize = async () => {
    loading.value = true
    try {
        const [sizeRes, shopRes] = await Promise.all([getSize(), getShop()])
        const goodsList = shopRes.data.data || []
        sizeList.value = sizeRes.data.data.map((item, index) => {
            const usedCount = goodsList.filter(good => {
                const values = good.valueList || []
                return item.values?.some(v => values.includes(v))
            }).length
            return { ...item, id: index + 1, goodsCount: usedCount }
        })
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    fetchSize()
    const res = await getPageConfig('size')
    SizeColumns.value = res.data.data.columns
    List.value = res.data.data.formFields
})

// 对话框
const dialogTitle = ref('新增规格')



const dialogType = ref('add')
const currentRow = ref({})

const handleAdd = () => {
    dialogType.value = 'add'
    currentRow.value = {}
    open.value = true

}

const handleEdit = (row) => {
    dialogType.value = 'edit'
    dialogTitle.value = '编辑规格'
    currentRow.value = { ...row }
    open.value = true
}

const handleDelete = async (row) => {
    await deleteSize(row._id)
    fetchSize()
}

const handleSubmit = async (form) => {
    const formData = { ...form }
    if (typeof formData.values === 'string') {
        formData.values = formData.values.split(',').map(v => v.trim())
    }
    if (dialogType.value === 'add') {
        await addSize(formData)
    } else {
        await updateSize(currentRow.value._id, formData)
    }
    open.value = false
    fetchSize()
}

</script>


<template>
    <div class="page-container">

        <LayoutBox :DataList="sizeList" :tableColumn="SizeColumns" title="规格管理" add="新增规格" :loading="loading"
            @add="handleAdd" @edit="handleEdit" @delete="handleDelete">

            <template #values="{ row }">
                <el-tag v-for="val in row.values" :key="val" style="margin-right: 5px;">
                    {{ val }}
                </el-tag>
            </template>

            <template #actions="{ row }">
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
        </LayoutBox>

        <dialog-box :visible="open" :List="List" @confirm="handleSubmit" :type="dialogType" :formData="currentRow"
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
