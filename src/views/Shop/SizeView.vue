<script setup>
import { ref, onMounted } from 'vue'
import { addSize, deleteSize, getSize, updateSize } from '@/api/size.js'
import { getShop } from '@/api/shop'
import DialogBox from '@/components/Common/DialogBox.vue'


// 规格列表
const sizeList = ref([])

const loading = ref(false)

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

onMounted(() => fetchSize())

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

const List = [
    { name: 'name', label: '规格名称' },
    { name: 'values', label: '规格值(用逗号分隔)' }
]
</script>


<template>
    <div class="page-container">
        <el-card shadow="never">
            <template #header>
                <div class="card-header">
                    <span>规格管理</span>
                    <el-button type="primary" @click="handleAdd">新增规格</el-button>
                </div>
            </template>

            <el-table :data="sizeList" stripe>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="规格名称" />
                <el-table-column label="规格值">
                    <template #default="{ row }">
                        <el-tag v-for="val in row.values" :key="val" style="margin-right: 5px;">
                            {{ val }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="goodsCount" label="使用商品数" width="120" />
                <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

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
