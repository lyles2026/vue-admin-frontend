<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const dialogVisible = ref(false)
const handleLogout = () => {
    authStore.logout()
    dialogVisible.value = false
 
   ElMessage.success('已退出登录')
    router.push('/login')
}
</script>

<template>
        <button @click="handleLogout">qq</button>
</template>