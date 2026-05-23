import request from '@/api/request.js'

export const getOrderList = () => request.get('/order')
export const addOrder = (data) => request.post('/order', data)
export const updateOrder = (id, data) => request.put(`/order/${id}`, data)
export const deleteOrder = (id) => request.delete(`/order/${id}`)
export const getOrderStats = () => request.get('/order-stats')