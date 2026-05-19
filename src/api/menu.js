import request from '@/api/request.js'

export const getMenuList = () => request.get('/menu')