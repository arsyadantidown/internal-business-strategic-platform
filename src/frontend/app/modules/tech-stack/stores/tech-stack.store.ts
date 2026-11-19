import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { techStackApi } from '../api/tech-stack.api'
import type {
  TechStackFilterParams,
  TechStackFormValues,
  TechStackItem
} from '../types/tech-stack.types'

export const useTechStackStore = defineStore('tech-stack', () => {
  // State
  const items = ref<TechStackItem[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref<string | null>(null)

  // Filters
  const filters = ref<TechStackFilterParams>({
    search: '',
    category: '',
    status: ''
  })

  // Pagination
  const currentPage = ref(1)
  const pageSize = ref(10)

  // Computed: Cek apakah filter sedang aktif
  const isFilterDirty = computed(() => {
    return Boolean(
      (filters.value.search && filters.value.search.trim() !== '') ||
      (filters.value.category && filters.value.category !== '') ||
      (filters.value.status && filters.value.status !== '')
    )
  })

  // Computed: Data terfilter berdasarkan search, category, dan status
  const filteredItems = computed(() => {
    let result = [...items.value]

    // 1. Filter Search (by name)
    const s = filters.value.search?.trim().toLowerCase()
    if (s) {
      result = result.filter(item => item.name.toLowerCase().includes(s))
    }

    // 2. Filter Category (frontend, backend, data_storage)
    if (filters.value.category) {
      result = result.filter(item => item.category === filters.value.category)
    }

    // 3. Filter Status (active, inactive)
    if (filters.value.status === 'active') {
      result = result.filter(item => item.isActive)
    } else if (filters.value.status === 'inactive') {
      result = result.filter(item => !item.isActive)
    }

    // Urutkan alfabetis berdasarkan nama
    return result.sort((a, b) => a.name.localeCompare(b.name))
  })

  // Computed: Pagination
  const totalResults = computed(() => filteredItems.value.length)
  const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value) || 1)

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  // Actions: Filter & Pagination Handlers
  const setFilters = (newFilters: TechStackFilterParams) => {
    filters.value = { ...newFilters }
    currentPage.value = 1
  }

  const resetFilters = () => {
    filters.value = {
      search: '',
      category: '',
      status: ''
    }
    currentPage.value = 1
  }

  const setPage = (page: number) => {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }

  // Actions: Fetch Data
  const fetchTechStacks = async () => {
    isLoading.value = true
    errorMessage.value = null
    try {
      items.value = await techStackApi.list()
    } catch (err: any) {
      errorMessage.value =
        err?.response?.data?.message || err?.message || 'Gagal memuat data tech stack.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  // Actions: Create
  const createTechStack = async (values: TechStackFormValues): Promise<TechStackItem> => {
    isSubmitting.value = true
    errorMessage.value = null
    try {
      const created = await techStackApi.create({
        tech_stack_name: values.name,
        tech_stack_category: values.category
      })
      items.value.unshift(created)
      return created
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal menambahkan tech stack.'
      errorMessage.value = msg
      throw new Error(msg)
    } finally {
      isSubmitting.value = false
    }
  }

  // Actions: Update
  const updateTechStack = async (
    target: TechStackItem,
    values: TechStackFormValues
  ): Promise<TechStackItem> => {
    isSubmitting.value = true
    errorMessage.value = null
    try {
      const updated = await techStackApi.update(target.id, {
        tech_stack_name: values.name,
        tech_stack_category: values.category,
        is_active: values.isActive
      })
      const idx = items.value.findIndex(item => item.id === target.id)
      if (idx !== -1) {
        items.value[idx] = updated
      }
      return updated
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal memperbarui tech stack.'
      errorMessage.value = msg
      throw new Error(msg)
    } finally {
      isSubmitting.value = false
    }
  }

  // Actions: Delete
  const deleteTechStack = async (target: TechStackItem): Promise<void> => {
    isSubmitting.value = true
    errorMessage.value = null
    try {
      await techStackApi.delete(target.id)
      items.value = items.value.filter(item => item.id !== target.id)
      // Jika halaman saat ini melebihi total pages baru setelah item terhapus
      if (currentPage.value > totalPages.value) {
        currentPage.value = Math.max(1, totalPages.value)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal menghapus tech stack.'
      errorMessage.value = msg
      throw new Error(msg)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    items,
    isLoading,
    isSubmitting,
    errorMessage,
    filters,
    currentPage,
    pageSize,
    isFilterDirty,
    filteredItems,
    paginatedItems,
    totalResults,
    totalPages,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    fetchTechStacks,
    createTechStack,
    updateTechStack,
    deleteTechStack
  }
})
