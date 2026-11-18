import { computed, onMounted, ref, watch } from 'vue'
import { useProductStore } from '../stores/product.store'
import type {
  ProductFilters,
  ProductFormValues,
  ProductRecord,
  ProductStatus
} from '../types/product.types'

export function useProducts() {
  const store = useProductStore()

  const items = computed(() => store.products)
  const filters = ref<ProductFilters>({ search: '', status: '' })
  const currentPage = ref(1)
  const pageSize = ref(5)

  const isLoading = computed(() => store.isLoading)
  const isSubmitting = computed(() => store.isSubmitting)
  const loadError = computed(() => store.error)

  const filteredItems = computed(() => {
    const keyword = filters.value.search.trim().toLowerCase()

    return items.value
      .filter((item) => {
        const matchesKeyword
          = !keyword
            || item.productName.toLowerCase().includes(keyword)
            || item.productDescription.toLowerCase().includes(keyword)

        const matchesStatus = !filters.value.status || item.productStatus === filters.value.status

        return matchesKeyword && matchesStatus
      })
      .sort((first, second) => first.productName.localeCompare(second.productName))
  })

  const totalResults = computed(() => filteredItems.value.length)

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  const setFilters = (value: ProductFilters) => {
    filters.value = value
  }

  const resetFilters = () => {
    filters.value = { search: '', status: '' }
  }

  const setPage = (page: number) => {
    currentPage.value = page
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }

  const createItem = async (values: ProductFormValues) => store.createProduct(values)

  const updateItem = async (target: ProductRecord, values: ProductFormValues) => {
    const current = items.value.find(item => item.id === target.id)
    return store.updateProduct(target.id, values, current)
  }

  const deleteItem = async (target: ProductRecord) => store.deleteProduct(target.id)

  const retryLoad = () => store.fetchProducts()

  onMounted(async () => {
    await store.fetchStatuses().catch(() => undefined)
    await store.fetchProducts().catch(() => undefined)
  })

  const statusCount = (status: ProductStatus) =>
    items.value.filter(item => item.productStatus === status).length

  watch(
    () => [filters.value.search, filters.value.status],
    () => {
      currentPage.value = 1
    }
  )

  watch(totalResults, (total) => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize.value))
    if (currentPage.value > maxPage) currentPage.value = maxPage
  })

  return {
    items,
    filters,
    currentPage,
    pageSize,
    filteredItems,
    paginatedItems,
    totalResults,
    statusCount,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    createItem,
    updateItem,
    deleteItem,
    isLoading,
    isSubmitting,
    loadError,
    retryLoad
  }
}
