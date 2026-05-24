<script setup>
import { ref, onMounted } from 'vue'
import { getGalleryList, deleteGallery, batchDeleteGallery, uploadFile, addGallery } from '@/api/gallery'
import { ElMessage } from 'element-plus'

const imageList = ref([])
const loading = ref(false)
const selectedImages = ref([])
const uploadRef = ref(null)
const pendingFile = ref(null)
const fileName = ref('')
const renameVisible = ref(false)

const fetchList = async () => {
    loading.value = true
    try {
        const res = await getGalleryList()
        imageList.value = res.data.data.map((item, index) => ({
            ...item,
            id: index + 1
        }))
    } finally {
        loading.value = false
    }
}
onMounted(() => fetchList())

const handleUpload = async (file) => {
    pendingFile.value = file
    fileName.value = file.name.replace(/\.[^.]+$/, '')
    renameVisible.value = true
}

const confirmUpload = async () => {
    const file = pendingFile.value
    const ext = file.name.match(/\.[^.]+$/)?.[0] || ''
    const newName = fileName.value + ext
    // 用自定义文件名重新构造 File 对象
    const renamedFile = new File([file.raw], newName, { type: file.raw.type })
    try {
        const res = await uploadFile(renamedFile)
        const { url, size } = res.data.data
        await addGallery({ url, name: newName, size })
        ElMessage({ message: '上传成功', type: 'success', center: true })
        renameVisible.value = false
        fetchList()
    } catch (e) {
        console.error('上传失败:', e)
        ElMessage({ message: '上传失败: ' + (e.response?.data?.message || e.message || ''), type: 'error', center: true })
    }
}

const handleDelete = async (row) => {
    await deleteGallery(row._id)
    ElMessage({ message: '删除成功', type: 'success', center: true })
    fetchList()
}

const handleBatchDelete = async () => {
    if (!selectedImages.value.length) return
    const ids = selectedImages.value.map(item => item._id)
    await batchDeleteGallery(ids)
    selectedImages.value = []
    ElMessage({ message: '批量删除成功', type: 'success', center: true })
    fetchList()
}

const copyLink = async (url) => {
    try {
        await navigator.clipboard.writeText(url)
        ElMessage({ message: '链接已复制', type: 'success', center: true })
    } catch {
        ElMessage({ message: '复制失败', type: 'error', center: true })
    }
}

// 图片预览
const previewVisible = ref(false)
const previewUrl = ref('')


</script>


<template>
    <div class="page-container">
        <el-card shadow="never">
            <template #header>
                <div class="card-header">
                    <span>图库管理</span>
                    <div>
                        <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedImages.length"
                            style="margin-right:10px">批量删除</el-button>
                        <el-upload ref="uploadRef" :auto-upload="false" :show-file-list="false" accept="image/*"
                            :on-change="handleUpload" style="display:inline-block">
                            <el-button type="primary">上传图片</el-button>
                        </el-upload>
                    </div>
                </div>
            </template>

            <el-table :data="imageList" stripe v-loading="loading" @selection-change="selectedImages = $event"
                @row-click="(row) => { previewUrl = row.url; previewVisible = true }">
                <el-table-column type="selection" width="55" />
                <el-table-column label="预览" width="100">
                    <template #default="{ row }">
                        <el-image :src="row.url" style="width: 50px; height: 50px; cursor:pointer" fit="cover"
                            @click="previewUrl = row.url; previewVisible = true">
                            <template #error><span style="font-size:12px;color:#999">加载失败</span></template>
                        </el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="文件名" />
                <el-table-column prop="size" label="大小" width="100" />
                <el-table-column prop="uploadTime" label="上传时间" />
                <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="copyLink(row.url)">复制链接</el-button>
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog v-model="renameVisible" title="重命名文件" width="400px">
            <el-form>
                <el-form-item label="文件名">
                    <el-input v-model="fileName" placeholder="请输入文件名" />
                    <span style="color:#909399;font-size:12px;margin-left:5px">.{{ pendingFile?.name?.split('.').pop()
                    }}</span>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="renameVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmUpload">确认上传</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="previewVisible" title="图片预览" width="600px" @close="previewVisible = false">
            <div style="text-align:center">
                <img :src="previewUrl" style="max-width:100%;max-height:500px" />
            </div>
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