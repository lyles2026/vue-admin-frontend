import request from '@/api/request.js'

export const getShop = () => {
    return request.get('/goods')
}

export const addShop = (data) => {
    return request.post('/goods', data)
}

export const updateShop = (id, data) => {
    return request.put(`/goods/${id}`, data)
}

export const deleteShop = (id) => {
    return request.delete(`/goods/${id}`)
}