import request from '@/api/request.js'

export const getRoleList = () => request.get('/role')
export const addRole = (data) => request.post('/role', data)
export const updateRole = (id, data) => request.put(`/role/${id}`, data)
export const deleteRole = (id) => request.delete(`/role/${id}`)