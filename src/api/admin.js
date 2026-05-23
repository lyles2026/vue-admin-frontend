import request from '@/api/request.js'

export const getAdminList = () => request.get('/admin/admins')
export const addAdmin = (data) => request.post('/admin/users', data)
export const updateAdmin = (id, data) => request.put(`/admin/users/${id}`, data)
export const deleteAdmin = (id) => request.delete(`/admin/users/${id}`)