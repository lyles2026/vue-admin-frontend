import request from '@/api/request.js'

export const getDistributorList = () => request.get('/distributor/stats')
export const updateDistributor = (id, data) => request.put(`/distributor/${id}`, data)