import request from '@/api/request.js'

export const getNoticeList = () => request.get('/notice')
export const addNotice = (data) => request.post('/notice', data)
export const updateNotice = (id, data) => request.put(`/notice/${id}`, data)
export const deleteNotice = (id) => request.delete(`/notice/${id}`)