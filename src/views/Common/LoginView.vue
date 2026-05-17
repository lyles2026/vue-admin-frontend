<script setup>
import RegisterPage from '@/components/Common/registerPage.vue';
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const router = useRouter()

const form = reactive({
    username: '',
    password: ''
})



const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
    ]
}

const handleLogin = async () => {
    loading.value = true

    try {
        await authStore.login(form)
        ElMessage({
            message: '登录成功',
            type: 'success',
            center: true,
            duration: 1500
        })
        setTimeout(() => {
            router.push('/')
        }, 500)
    } catch (error) {
        ElMessage({
            message: error.message || '登录失败',
            type: 'error',
            center: true,
            duration: 2000
        })
    } finally {
        loading.value = false
    }
}

const handleValid = async (valid) => {
    if (!valid) return
    await handleLogin()
}
</script>

<template>
    <div class="login-container">
        <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="10" :lg="14" class="login-left">
                <div class="login-box">
                    <h1>后台管理系统</h1>
                </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="14" :lg="10" class="login-right">
                <div class="login-header">
                    <h1>欢迎回来</h1>
                    <p>请输入您的账号和密码</p>
                </div>
                <div class="login-form-wrapper">
                    <register-page :rules="rules" :form="form" @update:username="form.username = $event"
                        @update:password="form.password = $event" @submit="handleValid">
                        <template #LoginButton>
                            <el-button type="primary" size="large" @click="handleLogin">登录</el-button>
                        </template>
                        <template #registerButton>
                            <el-button type="info" size="large" @click="router.push('/register')">注册</el-button>
                        </template>
                    </register-page>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<style scoped>
.login-container {
    height: 100vh;
}

.login-left {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}

.login-right {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
}

.login-box {
    padding-bottom: 250px;
    letter-spacing: 8px;
}

h1 {
    font-size: 42px;
}

.login-form-wrapper {
    width: 400px;
    min-width: 400px;
}

.el-input {
    width: 400px;
}

.el-button {
    width: 400px;
    border-radius: 20px;
}
</style>
