import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, registerApi } from '@/api/auth.js'

export const useAuthStore = defineStore('auth', () => {

  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  const form = reactive({
    username: '',
    password: '',
    confirmPassword: ''
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
    localStorage.removeItem('token')
  }

  const register = async (data) => {
    const result = await registerApi(data)
    token.value = result.data.data.token
    userInfo.value = result.data.data
    localStorage.setItem('token', result.data.data.token)
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
