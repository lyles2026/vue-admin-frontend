import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 10000
})

export const loginApi = (data) => {
    return api.post('/login', data)
}

export const registerApi = (data) => {
    return api.post('/register', data)
}