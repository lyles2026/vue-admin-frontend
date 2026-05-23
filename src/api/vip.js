import request from '@/api/request.js'

export const getVipList = () => request.get('/vip')
export const addVip = (data) => request.post('/vip', data)
export const updateVip = (id, data) => request.put(`/vip/${id}`, data)
export const deleteVip = (id) => request.delete(`/vip/${id}`)