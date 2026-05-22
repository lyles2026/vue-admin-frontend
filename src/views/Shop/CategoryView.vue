<script setup>
import { ref, onMounted, computed } from 'vue'
import { getCategory } from '@/api/category'
import { getShop } from '@/api/shop'
import DialogBox from '@/components/Common/DialogBox.vue'
import { addCategory, updateCategory, deleteCategory, swapCategorySort, reindexSort } from '@/api/category'


const loading = ref(false)
const categoryList = ref([])
const fetchCategory = async () => {
    loading.value = true
    try {
        await reindexSort()
        const [catRes, shopRes] = await Promise.all([getCategory(), getShop()])
        const goodsList = shopRes.data.data || []
        const countMap = {}
        goodsList.forEach(item => {
            const cat = item.category
            countMap[cat] = (countMap[cat] || 0) + (item.stock || 0)
        })
        categoryList.value = catRes.data.data
            .sort((a, b) => a.sort - b.sort)
            .map((item, index) => ({
                ...item,
                id: index + 1,
                goodsCount: countMap[item.name] || 0
            }))
    } catch (err) {
        console.error('获取分类列表失败:', err)
    } finally {
        loading.value = false
    }
}
onMounted(() => fetchCategory())
// 新增/编辑对话框
const open = ref(false)
const dialogTitle = ref('新增分类')
const dialogType = ref('add')
const currentRow = ref({})
const originalSort = ref(null)


// 打开新增对话框
const handleAdd = () => {
    dialogType.value = 'add'
    dialogTitle.value = '新增分类'
    currentRow.value = {}
    open.value = true
}

// 编辑
const handleEdit = (row) => {
    dialogType.value = 'edit'
    dialogTitle.value = '编辑分类'
    originalSort.value = row.sort
    currentRow.value = { ...row }
    open.value = true
}

// 删除
const handleDelete = async (row) => {
    await deleteCategory(row._id)
    fetchCategory()
}

// 提交
const handleSubmit = async (form) => {
    const formData = { ...form }
    if (dialogType.value === 'add') {
        formData.sort = categoryList.value.length + 1
        await addCategory(formData)
    } else {
        const newSort = Number(formData.sort)
        const currentId = currentRow.value._id
        if (originalSort.value !== newSort) {
            const target = categoryList.value.find(
                item => item.sort === newSort && item._id !== currentId
            )
            if (target) {
                await swapCategorySort(currentId, target._id)
            }
        }
        await updateCategory(currentId, formData)
    }
    open.value = false
    fetchCategory()
}

const List = computed(() => {
    const items = [
        {
            name: 'name',
            label: '分类名称',
            ...(dialogType.value === 'edit' ? { id: 1 } : {})
        },
        { name: 'icon', label: '图标' },
        { id: 3, name: 'status', label: '状态' },
    ]
    if (dialogType.value === 'edit') {
        items.splice(2, 0, { name: 'sort', label: '排序' })
    }
    return items
})

const categoryStatus = [
    { name: '显示', value: '显示' },
    { name: '隐藏', value: '隐藏' }
]

const rules = {
    name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
    ],
    icon: [
        { required: true, message: '请输入图标', trigger: 'blur' },
    ],
    sort: [
        { required: true, message: '请输入排序', trigger: 'blur' },
        { pattern: /^\d+$/, message: '排序必须是整数', trigger: 'blur' }
    ],
    status: [
        { required: true, message: '请选择状态', trigger: 'change' },
    ]
}


</script>


<template>
    <div class="page-container">
        <el-card shadow="never">
            <template #header>
                <div class="card-header">
                    <span>分类管理</span>
                    <el-button type="primary" @click="handleAdd">新增分类</el-button>
                </div>
            </template>

            <el-table :data="categoryList" stripe>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="分类名称" />
                <el-table-column prop="icon" label="图标" width="100" />
                <el-table-column prop="sort" label="排序" width="100" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '显示' ? 'success' : 'info'">{{ row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="goodsCount" label="商品数量" width="100" />
                <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 新增/编辑对话框 -->
        <dialog-box :visible="open" :List="List" :type="dialogType" :formData="currentRow" :shopCategory="categoryList"
            :shopStatus="categoryStatus" @confirm="handleSubmit" @update:visible="open = $event" :rules="rules" />
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
