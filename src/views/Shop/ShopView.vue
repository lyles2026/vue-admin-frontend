<script setup>

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
                        <el-option label="手机数码" value="phone" />
                        <el-option label="电脑办公" value="computer" />
                        <el-option label="平板电脑" value="tablet" />
                        <el-option label="智能穿戴" value="wearable" />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                        <el-option label="销售中" value="onsale" />
                        <el-option label="已下架" value="offsale" />
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

            <el-table :data="goodsList" stripe v-loading="false" @selection-change="selectedRows = $event">
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
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
                    :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>
         <DialogBox @confirm="handleConfirm" :fields="fields" :visible="open" @update:visible="open = $event" />
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
