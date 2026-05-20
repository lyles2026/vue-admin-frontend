import request from '@/api/request.js'

export const getMenuList = () => request.get('/menu')

export const getShopList = () => request.get('/shop')