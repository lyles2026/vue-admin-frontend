<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ref } from 'vue'

defineProps({
    form: Object,
    rules: Object,
    showConfirmPassword: Boolean
})

const emit = defineEmits(['update:username', 'update:password', 'update:confirmpassword', 'submit'])


const formRef = ref(null)

const handleSubmit = async () => {
    if (!formRef.value) {
        emit('submit', false)
        return
    }
    const valid = await formRef.value.validate().catch(() => false)
    emit('submit', valid)
}


defineExpose({ validate: handleSubmit })
</script>

<template>
    <el-form style="width:400px; min-width: 400px;" :rules="rules"  :model="form">
        <el-form-item prop="username">
            <el-input :prefix-icon="User" :model-value="form.username"
                @update:model-value="$emit('update:username', $event)" placeholder="请输入用户名" size="large" />
        </el-form-item>

        <el-form-item prop="password">
            <el-input :prefix-icon="Lock" :model-value="form.password"
                @update:model-value="$emit('update:password', $event)" placeholder="请输入密码" size="large" />
        </el-form-item>

        <el-form-item prop="confirmpassword" v-if="showConfirmPassword">
            <el-input :prefix-icon="Lock" :model-value="form.confirmpassword"
                @update:model-value="$emit('update:confirmpassword', $event)" placeholder="请确认密码" size="large" />
        </el-form-item>

        <el-form-item>
            <slot name="LoginButton" />
        </el-form-item>

        <el-form-item>
            <slot name="registerButton" />
        </el-form-item>
    </el-form>
</template>

<style>
.login-form-wrapper .el-form {
    width: 400px;
}

.login-form-wrapper .el-input,
.login-form-wrapper .el-button {
    width: 400px;
    border-radius: 20px;
}
</style>