import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  buildProductCreatePayload,
  buildProductUpdatePayload,
  getProductErrorMessage,
  productApi,
  toProductStatus
} from '../api/product.api'
import type {
  ProductFormValues,
  ProductRecord,
  ProductStatus,
  ProductStatusRef
} from '../types/product.types'

export const useProductStore = defineStore('product', () => {
  const products = ref<ProductRecord[]>([])
  const statuses = ref<ProductStatusRef[]>([])
  const isLoading = ref<boolean>(false)
  const isSubmitting = ref<boolean>(false)
  const error = ref<string>('')

  const fetchStatuses = async () => {
    isLoading.value = true
    error.value = ''
    try {
      statuses.value = await productApi.listStatuses()
      return statuses.value
    } catch (err) {
      const message = getProductErrorMessage(err)
      error.value = message
      throw new Error(message, { cause: err })
    } finally {
      isLoading.value = false
    }
  }

  const resolveStatusId = async (
    status: ProductStatus,
    fallback = ''
  ): Promise<string> => {
    if (statuses.value.length === 0) await fetchStatuses()

    const match = statuses.value.find(item =>
      toProductStatus(item.code) === status || toProductStatus(item.name) === status)

    return match?.id ?? fallback
  }

  const fetchProducts = async (productStatusId?: string) => {
    isLoading.value = true
    error.value = ''
    try {
      products.value = await productApi.list(
        productStatusId ? { product_status_id: productStatusId } : {}
      )
      return products.value
    } catch (err) {
      const message = getProductErrorMessage(err)
      error.value = message
      throw new Error(message, { cause: err })
    } finally {
      isLoading.value = false
    }
  }

  const createProduct = async (values: ProductFormValues) => {
    const statusId = await resolveStatusId(values.productStatus)
    if (!statusId) {
      const message = 'Product status tidak ditemukan.'
      error.value = message
      throw new Error(message)
    }

    isSubmitting.value = true
    error.value = ''
    try {
      const result = await productApi.create(buildProductCreatePayload(values, statusId))
      products.value = [result.item, ...products.value]
      return result
    } catch (err) {
      const message = getProductErrorMessage(err)
      error.value = message
      throw new Error(message, { cause: err })
    } finally {
      isSubmitting.value = false
    }
  }

  const updateProduct = async (
    productId: string,
    values: ProductFormValues,
    current?: ProductRecord
  ) => {
    const target = current ?? products.value.find(item => item.id === productId)
    if (!target) {
      const message = 'Product tidak ditemukan.'
      error.value = message
      throw new Error(message)
    }

    const statusId = await resolveStatusId(values.productStatus, target.productStatusId)
    const payload = buildProductUpdatePayload(target, values, statusId)
    if (Object.keys(payload).length === 0) return { item: target, message: '' }

    isSubmitting.value = true
    error.value = ''
    try {
      const result = await productApi.update(productId, payload)
      products.value = products.value.map(item => item.id === productId ? result.item : item)
      return result
    } catch (err) {
      const message = getProductErrorMessage(err)
      error.value = message
      throw new Error(message, { cause: err })
    } finally {
      isSubmitting.value = false
    }
  }

  const deleteProduct = async (productId: string) => {
    isSubmitting.value = true
    error.value = ''
    try {
      const result = await productApi.remove(productId)
      if (result.deleted) {
        products.value = products.value.filter(item => item.id !== productId)
      }
      return result
    } catch (err) {
      const message = getProductErrorMessage(err)
      error.value = message
      throw new Error(message, { cause: err })
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    products,
    statuses,
    isLoading,
    isSubmitting,
    error,
    fetchStatuses,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
})
