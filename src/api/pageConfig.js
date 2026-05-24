import request from '@/api/request.js'

export const getPageConfig = (page) => request.get(`/page-config/${page}`)