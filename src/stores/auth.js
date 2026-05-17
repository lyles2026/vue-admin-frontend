import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginApi } from '@/api/auth.js'

export const useAuthStore = defineStore('auth', () => {

  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

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

  return {
    login,
    logout,
    token,
    userInfo,
    isLogin,
  }
})
