import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { productApi } from '../api/product.api'
import type {
  ProductFilters,
  ProductFormValues,
  ProductItem,
  ProductStatus,
  ProductStatusRef
} from '../types/product.types'

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim() !== '') return message
  }

  return fallback
}

export const useProductStore = defineStore('product', () => {
  const items = ref<ProductItem[]>([])
  const allItems = ref<ProductItem[]>([])
  const statuses = ref<ProductStatusRef[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref<string | null>(null)

  const filters = ref<ProductFilters>({ productStatusId: '' })
  const currentPage = ref(1)
  const pageSize = ref(5)

  const isFilterDirty = computed(() => filters.value.productStatusId !== '')
  const totalCount = computed(() => allItems.value.length)
  const totalResults = computed(() => items.value.length)
  const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value) || 1)

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return items.value.slice(start, start + pageSize.value)
  })

  const statusCount = (status: ProductStatus) =>
    allItems.value.filter(item => item.productStatus === status).length

  const fetchProducts = async () => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const allProducts = await productApi.list()
      allItems.value = allProducts
      items.value = filters.value.productStatusId
        ? await productApi.list({ product_status_id: filters.value.productStatusId })
        : allProducts
      if (currentPage.value > totalPages.value) {
        currentPage.value = Math.max(1, totalPages.value)
      }
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'Gagal memuat data product.')
    } finally {
      isLoading.value = false
    }
  }

  const fetchStatuses = async () => {
    isLoading.value = true
    errorMessage.value = null
    try {
      statuses.value = await productApi.listStatuses()
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'Gagal memuat status product.')
    } finally {
      isLoading.value = false
    }
  }

  const setFilters = async (newFilters: ProductFilters) => {
    filters.value = { ...newFilters }
    currentPage.value = 1
    await fetchProducts()
  }

  const resetFilters = async () => {
    filters.value = { productStatusId: '' }
    currentPage.value = 1
    await fetchProducts()
  }

  const setPage = (page: number) => {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }

  const createProduct = async (values: ProductFormValues): Promise<ProductItem> => {
    isSubmitting.value = true
    errorMessage.value = null
    try {
      const created = await productApi.create({
        product_name: values.productName.trim(),
        product_description: values.productDescription.trim(),
        product_status_id: values.productStatusId
      })
      await fetchProducts()
      return created
    } catch (error) {
      const message = getErrorMessage(error, 'Gagal menambahkan product.')
      errorMessage.value = message
      throw new Error(message, { cause: error })
    } finally {
      isSubmitting.value = false
    }
  }

  const updateProduct = async (
    target: ProductItem,
    values: ProductFormValues
  ): Promise<ProductItem> => {
    isSubmitting.value = true
    errorMessage.value = null
    try {
      const updated = await productApi.update(target.id, {
        product_name: values.productName.trim(),
        product_description: values.productDescription.trim(),
        product_status_id: values.productStatusId
      })
      await fetchProducts()
      return updated
    } catch (error) {
      const message = getErrorMessage(error, 'Gagal memperbarui product.')
      errorMessage.value = message
      throw new Error(message, { cause: error })
    } finally {
      isSubmitting.value = false
    }
  }

  const deleteProduct = async (target: ProductItem): Promise<void> => {
    isSubmitting.value = true
    errorMessage.value = null
    try {
      await productApi.delete(target.id)
      await fetchProducts()
    } catch (error) {
      const message = getErrorMessage(error, 'Gagal menghapus product.')
      errorMessage.value = message
      throw new Error(message, { cause: error })
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    items,
    statuses,
    isLoading,
    isSubmitting,
    errorMessage,
    filters,
    currentPage,
    pageSize,
    isFilterDirty,
    totalCount,
    totalResults,
    totalPages,
    paginatedItems,
    statusCount,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    fetchProducts,
    fetchStatuses,
    createProduct,
    updateProduct,
    deleteProduct
  }
})
