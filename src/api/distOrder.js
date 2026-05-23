import request from '@/api/request.js'

export const getDistOrderList = () => request.get('/dist-order')