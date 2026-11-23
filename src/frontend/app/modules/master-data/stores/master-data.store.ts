import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { masterDataApi } from '../api/master-data.api'
import {
  DEFAULT_MASTER_DATA_TYPE,
  getMasterDataCategory,
  masterDataCategories,
  resolveMasterDataType
} from '../data/master-data.categories'
import type {
  MasterDataDeleteResult,
  MasterDataFilters,
  MasterDataFormValues,
  MasterDataItem,
  MasterDataMutationResult,
  MasterDataStat,
  MasterDataType
} from '../types/master-data.types'

export const getMasterDataErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.'

export const useMasterDataStore = defineStore('master-data', () => {
  const route = useRoute()
  const router = useRouter()

  // State
  const activeCategoryType = ref<MasterDataType>(
    resolveMasterDataType(route.query.category) ?? DEFAULT_MASTER_DATA_TYPE
  )
  const items = ref<MasterDataItem[]>([])
  const isLoading = ref(true)
  const loadError = ref('')
  const canViewInactive = ref(true)

  const isSaving = ref(false)
  const isDeleting = ref(false)
  const togglingId = ref('')

  // Filters & Pagination
  const filters = ref<MasterDataFilters>({ search: '', status: '' })
  const currentPage = ref(1)
  const pageSize = ref(10)

  // Computed Category
  const activeCategory = computed(() => getMasterDataCategory(activeCategoryType.value))

  const hasActiveFilters = computed(() =>
    filters.value.search.trim() !== '' || filters.value.status !== ''
  )

  // Filtered Items
  const filteredItems = computed(() => {
    const query = filters.value.search.trim().toLowerCase()
    const status = filters.value.status

    return items.value.filter((item) => {
      const matchesSearch =
        query === '' ||
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        (item.description ?? '').toLowerCase().includes(query)

      const matchesStatus =
        status === '' ||
        (status === 'active' && item.isActive) ||
        (status === 'inactive' && !item.isActive)

      return matchesSearch && matchesStatus
    })
  })

  // Pagination Computations
  const totalResults = computed(() => filteredItems.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalResults.value / pageSize.value)))

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  // Master Data Stats
  const stats = computed<MasterDataStat[]>(() => {
    const total = items.value.length
    const active = items.value.filter(item => item.isActive).length
    const inactive = total - active

    return [
      {
        key: 'total',
        label: `Total ${activeCategory.value.label}`,
        value: total,
        icon: activeCategory.value.icon,
        tone: 'blue',
        hint: `Registered in ${activeCategory.value.label.toLowerCase()}`
      },
      {
        key: 'active',
        label: 'Active Entries',
        value: active,
        icon: 'i-lucide-badge-check',
        tone: 'emerald',
        hint: 'Available on all platform dropdowns'
      },
      {
        key: 'inactive',
        label: 'Inactive Entries',
        value: inactive,
        icon: 'i-lucide-archive',
        tone: 'slate',
        hint: 'Hidden from new record creation'
      }
    ]
  })

  let fetchToken = 0

  // Actions
  const fetchItems = async (options: { silent?: boolean } = {}) => {
    const token = ++fetchToken
    if (!options.silent) isLoading.value = true
    loadError.value = ''

    try {
      let rows: MasterDataItem[] = []

      try {
        rows = await masterDataApi.list(activeCategory.value, canViewInactive.value)
      } catch (error) {
        if (!canViewInactive.value || token !== fetchToken) throw error
        canViewInactive.value = false
        if (filters.value.status === 'inactive') filters.value.status = ''
        rows = await masterDataApi.list(activeCategory.value, false)
      }

      if (token === fetchToken) items.value = rows
    } catch (error) {
      if (token === fetchToken) {
        loadError.value = getMasterDataErrorMessage(error)
        items.value = []
      }
    } finally {
      if (token === fetchToken) isLoading.value = false
    }
  }

  const retryLoad = () => {
    canViewInactive.value = true
    fetchItems()
  }

  const selectCategory = (type: MasterDataType) => {
    if (activeCategoryType.value === type) return
    activeCategoryType.value = type
    currentPage.value = 1
    filters.value = { search: '', status: '' }
    router.replace({ query: { ...route.query, category: type } })
    fetchItems()
  }

  const setFilters = (next: MasterDataFilters) => {
    filters.value = { ...next }
    currentPage.value = 1
  }

  const resetFilters = () => {
    filters.value = { search: '', status: '' }
    currentPage.value = 1
  }

  const setPage = (page: number) => {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }

  const createItem = async (
    values: MasterDataFormValues
  ): Promise<MasterDataMutationResult> => {
    isSaving.value = true
    try {
      const result = await masterDataApi.create(activeCategory.value, values)
      await fetchItems({ silent: true })
      return result
    } finally {
      isSaving.value = false
    }
  }

  const updateItem = async (
    item: MasterDataItem,
    values: MasterDataFormValues
  ): Promise<MasterDataMutationResult> => {
    isSaving.value = true
    try {
      const result = await masterDataApi.update(activeCategory.value, item.id, values)
      await fetchItems({ silent: true })
      return result
    } finally {
      isSaving.value = false
    }
  }

  const toggleActive = async (item: MasterDataItem): Promise<MasterDataMutationResult> => {
    togglingId.value = item.id
    try {
      const result = await masterDataApi.toggleActive(activeCategory.value, item)
      await fetchItems({ silent: true })
      return result
    } finally {
      togglingId.value = ''
    }
  }

  const deleteItem = async (item: MasterDataItem): Promise<MasterDataDeleteResult> => {
    isDeleting.value = true
    try {
      const result = await masterDataApi.delete(activeCategory.value, item.id)
      await fetchItems({ silent: true })
      return result
    } finally {
      isDeleting.value = false
    }
  }

  // Watch URL query parameter change (e.g. browser back/forward)
  watch(
    () => route.query.category,
    (value) => {
      const resolved = resolveMasterDataType(value)
      if (resolved && resolved !== activeCategoryType.value) {
        activeCategoryType.value = resolved
        currentPage.value = 1
        filters.value = { search: '', status: '' }
        fetchItems()
      }
    }
  )

  return {
    masterDataCategories,
    activeCategoryType,
    activeCategory,
    items,
    isLoading,
    loadError,
    canViewInactive,
    isSaving,
    isDeleting,
    togglingId,
    filters,
    currentPage,
    pageSize,
    hasActiveFilters,
    filteredItems,
    paginatedItems,
    totalResults,
    totalPages,
    stats,
    fetchItems,
    retryLoad,
    selectCategory,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    createItem,
    updateItem,
    toggleActive,
    deleteItem
  }
})
