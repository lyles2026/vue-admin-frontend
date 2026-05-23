<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import RegisterPage from '@/components/Common/registerPage.vue'


const authStore = useAuthStore()
const router = useRouter()
const { form } = authStore

const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
    ],
    confirmpassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== form.password) {
                    callback(new Error('两次密码不一致'))
                } else {
                    callback()
                }
            }, trigger: 'blur'
        }
    ],
    phone: [
        { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    email: [
        { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
    ]
}


const handleRegister = async (valid) => {

    if (!valid) return

    try {
        await authStore.register(form)
        ElMessage({
            message: '注册成功',
            type: 'success',
            center: true,
            duration: 1500
        })
        setTimeout(() => {
            router.push('/login')
        }, 500)
    } catch (error) {
        ElMessage({
            message: error.message || '注册失败',
            type: 'error',
            center: true,
            duration: 2000
        })
    }
}

</script>

<template>
    <div class="register-container">
        <div class="register-form">
            <h1 class="register-title">注册账号</h1>
            <div class="login-form-wrapper">
                <RegisterPage @submit="handleRegister" :form="form" :rules="rules"
                    @update:username="form.username = $event" @update:password="form.password = $event"
                    @update:confirmpassword="form.confirmpassword = $event" @update:phone="form.phone = $event"
                    @update:email="form.email = $event" @update:role="form.role = $event" :showConfirmPassword="true">
                    <template #registerButton>
                        <el-button type="info" size="large" @click="handleRegister">注册</el-button>
                    </template>
                    <template #LoginButton>
                        <el-button size="large" @click="router.push('/login')">返回登录</el-button>
                    </template>
                </RegisterPage>
            </div>
        </div>
    </div>
</template>

<style scoped>
.register-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding-top: 80px;
    background: #f5f5f5;
}

.register-form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.register-title {
    margin-bottom: 30px;
    font-size: 28px;
    color: #333;
}

.login-form-wrapper {
    width: 400px;
    min-width: 400px;
}

.el-button {
    width: 400px;
    border-radius: 20px;
}
</style>