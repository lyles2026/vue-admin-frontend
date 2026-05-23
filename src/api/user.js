import request from '@/api/request.js'

export const getUserList = () => {
    return request.get('/admin/users')
}

export const addUser = (data) => {
    return request.post('/admin/users', data)
}

export const updateUser = (id, data) => {
    return request.put(`/admin/users/${id}`, data)
}

export const deleteUser = (id) => {
    return request.delete(`/admin/users/${id}`)
}