<script setup>
import { reactive, ref, watch } from 'vue'

const formLabelWidth = '140px'

const form = reactive({})
const props = defineProps({
    visible: Boolean,
    shopCategory: Array,
    shopStatus: Array,
    roleOptions: Array,
    rules: Object,
    type: String,
    formData: Object,
    List: Array,
    title: {
        type: String,
        default: '选择商品规格'
    }
})




const emit = defineEmits(['update:visible', 'confirm'])

const resetForm = () => {
    Object.keys(form).forEach(key => delete form[key])
    formRef.value?.clearValidate()
}

const handleCancel = () => {
    resetForm()
    emit('update:visible', false)
}
const handeleConfirm = async () => {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    emit('confirm', form)
    resetForm()
    emit('update:visible', false)
}



const formRef = ref(null)


watch(() => props.formData, (val) => {
    if (val) Object.assign(form, val)
}, { immediate: true })



</script>

<template>
    <el-dialog :model-value="visible" @update:model-value="$emit('update:visible', $event)" :title="title" width="500">
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
                <el-select v-else-if="item.id === 3" v-model="form[item.name]">
                    <el-option v-for="status in shopStatus" :key="status.value" :label="status.name"
                        :value="status.name" />
                </el-select>
                <template v-else-if="item.id === 4">
                    <el-date-picker v-model="form.startTime" type="datetime" placeholder="开始时间"
                        value-format="YYYY-MM-DD HH:mm:ss" />
                    <span style="margin: 0 10px;">至</span>
                    <el-date-picker v-model="form.endTime" type="datetime" placeholder="结束时间"
                        value-format="YYYY-MM-DD HH:mm:ss" />
                </template>
                <el-select v-else-if="item.id === 5" v-model="form[item.name]">
                    <el-option v-for="role in roleOptions" :key="role.value" :label="role.name" :value="role.name" />
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