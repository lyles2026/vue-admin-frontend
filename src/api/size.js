import request from '@/api/request.js'

export const getSize = () => {
    return request.get('/size')
}

export const addSize = (data) => {
    return request.post('/size', data)
}

export const updateSize = (id, data) => {
    return request.put(`/size/${id}`, data)
}

export const deleteSize = (id) => {
    return request.delete(`/size/${id}`)
}