import { computed, ref, watch } from 'vue'
import { dummyProducts } from '../data/product.data'
import type {
  ProductFilters,
  ProductFormValues,
  ProductItem,
  ProductStatus
} from '../types/product.types'

export function useProducts() {
  const items = ref<ProductItem[]>(dummyProducts.map(item => ({ ...item })))
  const filters = ref<ProductFilters>({ search: '', status: '' })
  const currentPage = ref(1)
  const pageSize = ref(5)

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

  const createItem = (values: ProductFormValues) => {
    items.value = [
      {
        id: `prd-${Date.now()}`,
        productName: values.productName,
        productDescription: values.productDescription,
        productStatus: values.productStatus
      },
      ...items.value
    ]
  }

  const updateItem = (target: ProductItem, values: ProductFormValues) => {
    items.value = items.value.map(item =>
      item.id === target.id
        ? {
            ...item,
            productName: values.productName,
            productDescription: values.productDescription,
            productStatus: values.productStatus
          }
        : item
    )
  }

  const deleteItem = (target: ProductItem) => {
    items.value = items.value.filter(item => item.id !== target.id)
  }

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
    deleteItem
  }
}
