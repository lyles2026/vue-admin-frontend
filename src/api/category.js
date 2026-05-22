import request from '@/api/request.js'

export const getCategory = () => {
    return request.get('/category')
}

export const addCategory = (data) => {
    return request.post('/category', data)
}

export const updateCategory = (id, data) => {
    return request.put(`/category/${id}`, data)
}

export const deleteCategory = (id) => {
    return request.delete(`/category/${id}`)
}

export const swapCategorySort = (id1, id2) => {
    return request.put('/category/swap-sort', { id1, id2 })
}

export const reindexSort = () => {
    return request.put('/category/reindex-sort')
}