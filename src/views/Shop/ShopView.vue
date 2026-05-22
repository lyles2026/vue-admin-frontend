<script setup>
import { getShopList } from '@/api/static.js';
import DialogBox from '@/components/Common/DialogBox.vue'
import { ref, onMounted } from 'vue';
import { getShop, addShop, deleteShop, updateShop } from '@/api/shop';
import { getCategory } from '@/api/category';
import ShopList from '@/components/Common/ShopList.vue';




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

const goodsList = ref([])
const loading = ref(false)

// 调用接口
const fetchGoods = async () => {
    loading.value = true
    try {
        const res = await getShop()
        goodsList.value = res.data.data.map((item, index) => ({
            ...item,
            id: index + 1
        }))

    } finally {
        loading.value = false
    }
}

onMounted(() => fetchGoods())


const selectedRows = ref([])

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

</script>

<template>
    <div class="page-container">
        <!-- 搜索区域 -->
        <el-card class="search-card" shadow="never">
            <el-form :model="searchForm" inline>
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
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 表格区域 -->
        <el-card class="table-card" shadow="never">
            <template #header>
                <div class="card-header">
                    <span>商品列表</span>
                    <el-button type="primary" @click="handleAdd">新增商品</el-button>
                </div>
            </template>

            <ShopList :goods-list="goodsList" @selection-change="selectedRows = $event">
                <template #columns>
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="id" label="ID" width="80" />
                    <el-table-column prop="name" label="商品名称" min-width="150" />
                    <el-table-column prop="category" label="分类" width="120" />
                    <el-table-column prop="price" label="价格" width="120">
                        <template #default="{ row }">
                            <span style="color: #f56c6c;">¥{{ row.price }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="stock" label="库存" width="100" />
                    <el-table-column prop="status" label="状态" width="100">
                        <template #default="{ row }">
                            <el-tag :type="row.status === '销售中' ? 'success' : 'info'">{{ row.status }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTime" label="创建时间" width="180" />
                    <el-table-column label="操作" width="150" fixed="right">
                        <template #default="{ row }">
                            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                        </template>
                    </el-table-column>
                </template>
            </ShopList>
        </el-card>
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
