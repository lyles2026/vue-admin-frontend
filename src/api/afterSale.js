import request from '@/api/request.js'

export const getAfterSaleList = () => request.get('/after-sale')
export const updateAfterSale = (id, data) => request.put(`/after-sale/${id}`, data)
export const deleteAfterSale = (id) => request.delete(`/after-sale/${id}`)