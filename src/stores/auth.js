import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, registerApi } from '@/api/auth.js'

export const useAuthStore = defineStore('auth', () => {

  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  const form = reactive({
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    role: '普通用户'
  })



  const isLogin = computed(() => !!token.value)

  const login = async (data) => {
    const result = await loginApi(data)

    token.value = result.data.data.token
    userInfo.value = result.data.data
    localStorage.setItem('token', result.data.data.token)
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    form.username = ''
    form.password = ''
    form.confirmPassword = ''
    form.phone = ''
    form.email = ''
    form.role = '普通用户'
    localStorage.removeItem('token')
  }

  const register = async (data) => {
    await registerApi(data)
  }

  return {
    login,
    logout,
    register,
    token,
    userInfo,
    isLogin,
    form
  }
})
