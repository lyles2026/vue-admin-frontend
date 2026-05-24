import { ref } from 'vue'

export function useList(apiFn) {
    const list = ref([])
    const loading = ref(false)

    const fetchList = async () => {
        loading.value = true
        try {
            const res = await apiFn()
            list.value = (res.data.data || []).map((item, index) => ({
                ...item,
                id: index + 1
            }))
        } finally {
            loading.value = false
        }
    }

    return { list, loading, fetchList }
}

// 搜索通用函数
export function filterList(list, filters) {
    return list.filter(item => {
        for (const key in filters) {
            if (!filters[key]) continue
            const val = String(item[key] || '').toLowerCase()
            if (!val.includes(String(filters[key]).toLowerCase())) return false
        }
        return true
    })
}