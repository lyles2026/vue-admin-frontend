import request from '@/api/request.js'

export const getCoupon = () => {
    return request.get('/coupon')
}

export const addCoupon = (data) => {
    return request.post('/coupon', data)
}

export const updateCoupon = (id, data) => {
    return request.put(`/coupon/${id}`, data)
}

export const deleteCoupon = (id) => {
    return request.delete(`/coupon/${id}`)
}