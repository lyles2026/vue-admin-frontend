import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
    const searchForm = ref({
    name: '',
    category: '',
    status: ''
})

return {
    searchForm
}
})