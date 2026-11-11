import { computed, onMounted, ref, watch } from 'vue'
import { masterDataApi } from '../../api/master-data.api'
import {
  DEFAULT_MASTER_DATA_TYPE,
  masterDataCategories,
  getMasterDataCategory,
  resolveMasterDataType
} from '../../data/master-data.categories'
import type {
  MasterDataDeleteResult,
  MasterDataFilters,
  MasterDataFormValues,
  MasterDataItem,
  MasterDataMutationResult,
  MasterDataStat,
  MasterDataType
} from '../../types/master-data.types'

export const getMasterDataErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.'

export function useMasterData() {
  const route = useRoute()
  const router = useRouter()

  const activeCategoryType = ref<MasterDataType>(
    resolveMasterDataType(route.query.category) ?? DEFAULT_MASTER_DATA_TYPE
  )
  const activeCategory = computed(() => getMasterDataCategory(activeCategoryType.value))

  const items = ref<MasterDataItem[]>([])
  const isLoading = ref(true)
  const loadError = ref('')
  const canViewInactive = ref(true)

  const isSaving = ref(false)
  const isDeleting = ref(false)
  const togglingId = ref('')

  const filters = ref<MasterDataFilters>({ search: '', status: '' })
  const currentPage = ref(1)
  const pageSize = ref(10)

  let fetchToken = 0

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

  const toggleActive = async (
    item: MasterDataItem
  ): Promise<MasterDataMutationResult> => {
    togglingId.value = item.id
    try {
      const result = await masterDataApi.toggleActive(
        activeCategory.value,
        item.id,
        !item.isActive
      )
      await fetchItems({ silent: true })
      return result
    } finally {
      togglingId.value = ''
    }
  }

  const deleteItem = async (
    item: MasterDataItem
  ): Promise<MasterDataDeleteResult> => {
    isDeleting.value = true
    try {
      const result = await masterDataApi.remove(activeCategory.value, item.id)
      await fetchItems({ silent: true })
      return result
    } finally {
      isDeleting.value = false
    }
  }

  const filteredItems = computed(() => {
    const keyword = filters.value.search.trim().toLowerCase()

    return items.value.filter((item) => {
      const searchable = [item.code, item.name, item.description ?? '']
      const matchesSearch = !keyword
        || searchable.some(value => value.toLowerCase().includes(keyword))

      const matchesStatus = !filters.value.status
        || (filters.value.status === 'active' ? item.isActive : !item.isActive)

      return matchesSearch && matchesStatus
    })
  })

  const totalItems = computed(() => items.value.length)
  const totalResults = computed(() => filteredItems.value.length)
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalResults.value / pageSize.value))
  )

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  const stats = computed<MasterDataStat[]>(() => {
    const activeCount = items.value.filter(item => item.isActive).length
    const base: MasterDataStat[] = [
      {
        key: 'total',
        label: 'Total',
        value: items.value.length,
        icon: 'i-lucide-database',
        tone: 'blue',
        hint: `All ${activeCategory.value.label.toLowerCase()}`
      },
      {
        key: 'active',
        label: 'Active',
        value: activeCount,
        icon: 'i-lucide-circle-check-big',
        tone: 'emerald',
        hint: 'Selectable in forms'
      }
    ]

    if (canViewInactive.value) {
      base.push({
        key: 'inactive',
        label: 'Inactive',
        value: items.value.length - activeCount,
        icon: 'i-lucide-circle-x',
        tone: 'slate',
        hint: 'Hidden from forms'
      })
    }

    return base
  })

  const setFilters = (value: MasterDataFilters) => {
    filters.value = { ...value }
  }

  const resetFilters = () => {
    filters.value = { search: '', status: '' }
  }

  const setPage = (page: number) => {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }

  const selectCategory = (type: MasterDataType) => {
    if (type === activeCategoryType.value) return
    router.replace({ query: { ...route.query, category: type } })
  }

  watch(filters, () => {
    currentPage.value = 1
  }, { deep: true })

  watch([totalPages, pageSize], () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
    if (currentPage.value < 1) currentPage.value = 1
  })

  watch(activeCategoryType, () => {
    filters.value = { search: '', status: '' }
    currentPage.value = 1
    fetchItems()
  })

  watch(() => route.query.category, (value) => {
    const type = resolveMasterDataType(value)
    if (type && type !== activeCategoryType.value) {
      activeCategoryType.value = type
    }
  })

  onMounted(() => {
    fetchItems()
  })

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
    stats,
    paginatedItems,
    totalItems,
    totalResults,
    fetchItems,
    retryLoad,
    createItem,
    updateItem,
    toggleActive,
    deleteItem,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    selectCategory
  }
}
