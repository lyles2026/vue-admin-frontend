import request from '@/api/request.js'

export const getCommissionList = () => request.get('/commission')
export const updateCommission = (id, data) => request.put(`/commission/${id}`, data)