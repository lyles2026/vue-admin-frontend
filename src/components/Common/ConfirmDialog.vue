<script setup>
import { WarningFilled } from '@element-plus/icons-vue'

defineProps({
    visible: Boolean,
    title: String,
    message: String,
    cancelText: String,
    confirmText: String,
    type: String
})

defineEmits(['update:visible', 'confirm', 'cancel'])
</script>

<template>
    <el-dialog :model-value="visible" @update:model-value="$emit('update:visible', $event)" :title="title" width="400">
        <div class="dialog-content">
            <div class="dialog-content">
                <el-icon :size="48">
                    <WarningFilled />
                </el-icon>
            </div>
            <p>{{ message }}</p>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="$emit('cancel')">{{ cancelText }}</el-button>
                <el-button type="danger" @click="$emit('confirm')">{{ confirmText }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>
.dialog-content {
    text-align: center;
    padding: 20px 0;
}

.dialog-content .el-icon {
    color: #e6a23c;
    margin-bottom: 16px;
}

.dialog-content p {
    font-size: 16px;
    color: #606266;
    margin: 0;
}

.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
}
</style>
