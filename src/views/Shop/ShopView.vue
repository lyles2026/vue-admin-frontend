<script setup>
import { getShopList } from '@/api/static.js';
import DialogBox from '@/components/Common/DialogBox.vue'
import { ref, onMounted } from 'vue';
import { useList } from '@/composables/useList'
import { getShop, addShop, deleteShop, updateShop } from '@/api/shop';
import { getCategory } from '@/api/category';
import LayoutBox from '@/components/Common/LayoutBox.vue'
import SearchCard from '@/components/Common/SearchCard.vue'




const searchForm = ref({
    name: '',
    category: '',
    status: ''
})
const handleSearch = async () => {

    try {
        const res = await getShop()

        const searchResult = res.data.data.filter(item => {
            const matchName = !searchForm.value.name || item.name.includes(searchForm.value.name)
            const matchCategory = !searchForm.value.category || item.category === searchForm.value.category
            const matchStatus = !searchForm.value.status || item.status === searchForm.value.status
            return matchName && matchCategory && matchStatus
        })
        goodsList.value = searchResult.map((item, index) => ({
            ...item,
            id: index + 1
        }))

    } catch (err) {
        console.error('搜索失败:', err)
    }

}

const handleReset = () => {
    searchForm.value.name = ''
    searchForm.value.category = ''
    searchForm.value.status = ''
    handleSearch()
}

const { list: goodsList, loading, fetchList: fetchGoods } = useList(getShop)
onMounted(() => fetchGoods())

const handleConfirm = async (form) => {
    const now = new Date()
    form.createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    if (dialogType.value === 'add') {
        await addShop(form)
    } else {
        await updateShop(currentRow.value._id, form)
    }
    fetchGoods()
}

const open = ref(false)
const handleAdd = () => {
    dialogType.value = 'add'
    currentRow.value = {}
    open.value = true
}

const shopCategory = ref([])
const shopStatus = ref([])

onMounted(async () => {
    const [staticRes, catRes] = await Promise.all([getShopList(), getCategory()])
    shopStatus.value = staticRes.data.data.shopStatus
    const categories = catRes.data.data || []
    shopCategory.value = categories.map(item => ({
        name: item.name,
        value: item._id
    }))
})

const rules = {
    name: [
        { required: true, message: '请输入商品名称', trigger: 'blur' },
        { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
    ],
    category: [
        { required: true, message: '请选择分类', trigger: 'change' },
    ],
    price: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效的价格', trigger: 'blur' }
    ],
    stock: [
        { required: true, message: '请输入库存', trigger: 'blur' },
        { pattern: /^\d+$/, message: '库存必须是整数', trigger: 'blur' }
    ],
    status: [
        { required: true, message: '请选择状态', trigger: 'change' },]
}

const handleDelete = async (row) => {

    await deleteShop(row._id)
    fetchGoods()
}

const handleEdit = (row) => {
    dialogType.value = 'edit'
    currentRow.value = { ...row }
    open.value = true
}

const dialogType = ref('add')
const currentRow = ref({})

const List = [
    { name: 'name', label: '商品名称' },
    { id: 1, name: 'category', label: '分类' },
    { name: 'price', label: '价格' },
    { name: 'stock', label: '库存' },
    { id: 2, name: 'status', label: '状态' },
]

const ShopColumns = [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: '商品名称', minWidth: 150 },
    { prop: 'category', label: '分类', width: 120 },
    { prop: 'price', label: '价格', width: 120 },
    { prop: 'stock', label: '库存', width: 100 },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'createTime', label: '创建时间', width: 180 },
    { type: 'actions', label: '操作', width: 150 }
]
</script>

<template>
    <div class="page-container">
        <!-- 搜索区域 -->
        <SearchCard :searchForm="searchForm" @search="handleSearch" @reset="handleReset">
            <el-form-item label="商品名称">
                <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
            </el-form-item>
            <el-form-item label="商品分类">
                <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
                    <el-option v-for="item in shopCategory" :key="item.value" :value="item.name" />
                </el-select>
            </el-form-item>
            <el-form-item label="状态">
                <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                    <el-option v-for="item in shopStatus" :key="item.value" :value="item.name" />
                </el-select>
            </el-form-item>
        </SearchCard>

        <!-- 表格区域 -->
        <LayoutBox :DataList="goodsList" :tableColumn="ShopColumns" title="商品列表" add="新增商品" :loading="loading"
            @add="handleAdd" @edit="handleEdit" @delete="handleDelete">

            <template #price="{ row }">
                <span style="color: #f56c6c;">¥{{ row.price }}</span>
            </template>

            <template #status="{ row }">
                <el-tag :type="row.status === '销售中' ? 'success' : 'info'">{{ row.status }}</el-tag>
            </template>

            <template #actions="{ row }">
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
        </LayoutBox>

        <DialogBox :List="List" :type="dialogType" :formData="currentRow" :rules="rules" @confirm="handleConfirm"
            :shopCategory="shopCategory" :shopStatus="shopStatus" :visible="open" @update:visible="open = $event" />
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

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>
