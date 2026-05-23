import request from '@/api/request.js'

export const getPermissionList = () => request.get('/permission')
export const addPermission = (data) => request.post('/permission', data)
export const updatePermission = (id, data) => request.put(`/permission/${id}`, data)
export const deletePermission = (id) => request.delete(`/permission/${id}`)