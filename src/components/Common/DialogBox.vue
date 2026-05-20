<script setup>
import { reactive, ref, watch } from 'vue'

const formLabelWidth = '140px'

const form = reactive({})
const props = defineProps({
    visible: Boolean,
    shopCategory: Array,
    shopStatus: Array,
    rules: Object,
    type: String,
    formData: Object,
})




const emit = defineEmits(['update:visible', 'confirm'])

const handleCancel = () => {
    emit('update:visible', false)
}
const handeleConfirm = async () => {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    emit('confirm', form)
    emit('update:visible', false)
}

const List = [
    { name: 'name', label: '商品名称' },
    { id: 1, name: 'category', label: '分类' },
    { name: 'price', label: '价格' },
    { name: 'stock', label: '库存' },
    { id: 2, name: 'status', label: '状态' },
]

const formRef = ref(null)


watch(() => props.formData, (val) => {
    if (val) Object.assign(form, val)
}, { immediate: true })



</script>

<template>
    <el-dialog :model-value="visible" @update:model-value="$emit('update:visible', $event)" title="选择商品规格" width="500">
        <el-form :model="form" :rules="rules" ref="formRef">
            <el-form-item :label-width="formLabelWidth" v-for="item in List" :key="item.name" :label="item.label"
                :prop="item.name">
                <el-input v-if="!item.id" v-model="form[item.name]" autocomplete="off" />
                <el-select v-else-if="item.id === 1" v-model="form[item.name]">
                    <el-option v-for="category in shopCategory" :key="category.value" :label="category.name"
                        :value="category.name" />
                </el-select>
                <el-select v-else-if="item.id === 2" v-model="form[item.name]">
                    <el-option v-for="status in shopStatus" :key="status.value" :label="status.name"
                        :value="status.name" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handeleConfirm">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>