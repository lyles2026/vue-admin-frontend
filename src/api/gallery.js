import request from '@/api/request.js'

export const getGalleryList = () => request.get('/gallery')
export const addGallery = (data) => request.post('/gallery', data)
export const deleteGallery = (id) => request.delete(`/gallery/${id}`)
export const batchDeleteGallery = (ids) => request.delete('/gallery/batch', { data: { ids } })

// 上传文件
export const uploadFile = (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return request.post('/upload', fd)
}