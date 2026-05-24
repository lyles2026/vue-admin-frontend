<script setup>
import { ref, onMounted, computed } from 'vue'
import { useList } from '@/composables/useList'
import { getNoticeList, addNotice, updateNotice, deleteNotice } from '@/api/notice'
import { ElMessage } from 'element-plus'

const { list: noticeList, loading, fetchList } = useList(getNoticeList)
onMounted(() => fetchList())

const dialogVisible = ref(false)
const dialogType = ref('add')
const currentRow = ref({})
const originalSort = ref(null)
// 新增时可选的排序上限=长度+1，编辑时=长度
const sortMax = computed(() => dialogType.value === 'add' ? noticeList.value.length + 1 : noticeList.value.length)

const handleAdd = () => {
    dialogType.value = 'add'
    currentRow.value = { type: '系统公告', status: '显示', sort: noticeList.value.length + 1 }
    dialogVisible.value = true
}

const handleEdit = (row) => {
    dialogType.value = 'edit'
    originalSort.value = row.sort
    currentRow.value = { ...row }
    dialogVisible.value = true
}

const handleDelete = async (row) => {
    await deleteNotice(row._id)
    ElMessage({ message: '删除成功', type: 'success', center: true })
    fetchList()
}

const handleSubmit = async () => {
    const formData = { ...currentRow.value }
    if (dialogType.value === 'add') {
        formData.sort = noticeList.value.length + 1
        await addNotice(formData)
    } else {
        const newSort = Number(formData.sort)
        if (originalSort.value !== newSort) {
            const target = noticeList.value.find(
                item => item.sort === newSort && item._id !== currentRow.value._id
            )
            if (target) {
                await updateNotice(target._id, { sort: originalSort.value })
            }
        }
        await updateNotice(currentRow.value._id, formData)
    }
    dialogVisible.value = false
    ElMessage({ message: '保存成功', type: 'success', center: true })
    fetchList()
}
</script>


<template>
    <div class="page-container">
        <el-card shadow="never">
            <template #header>
                <div class="card-header">
                    <span>公告管理</span>
                    <el-button type="primary" @click="handleAdd">新增公告</el-button>
                </div>
            </template>

            <el-table :data="noticeList" stripe v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="type" label="类型" width="100" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '显示' ? 'success' : 'info'">{{ row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="sort" label="排序" width="80" />
                <el-table-column prop="createTime" label="创建时间" />
                <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增公告' : '编辑公告'" width="600px">
            <el-form :model="currentRow" label-width="80px">
                <el-form-item label="标题">
                    <el-input v-model="currentRow.title" />
                </el-form-item>
                <el-form-item label="类型">
                    <el-select v-model="currentRow.type">
                        <el-option label="系统公告" value="系统公告" />
                        <el-option label="活动公告" value="活动公告" />
                    </el-select>
                </el-form-item>
                <el-form-item label="排序">
                    <el-input-number v-model="currentRow.sort" :min="1" :max="sortMax" />
                </el-form-item>
                <el-form-item label="内容">
                    <el-input v-model="currentRow.content" type="textarea" :rows="4" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="currentRow.status">
                        <el-radio label="显示">显示</el-radio>
                        <el-radio label="隐藏">隐藏</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>
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