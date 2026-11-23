import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  ProductCreatePayload,
  ProductItem,
  ProductListQuery,
  ProductRawItem,
  ProductStatus,
  ProductStatusRawItem,
  ProductStatusRef,
  ProductUpdatePayload
} from '../types/product.types'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const toProductStatus = (value: string): ProductStatus => {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_')

  if (/inactive|deprecated|archived|retired|disabled|on_hold|nonaktif/.test(normalized)) {
    return 'inactive'
  }
  if (/draft|development|pending|review/.test(normalized)) return 'draft'
  if (/active|ready|live|published|aktif/.test(normalized)) return 'active'

  return 'draft'
}

const normalizeStatus = (raw?: ProductStatusRawItem): ProductStatusRef => {
  const code = String(raw?.product_status_code || '')
  const name = String(raw?.product_status_name || code)

  return {
    id: String(raw?.id || ''),
    code,
    name
  }
}

const normalizeProduct = (raw: ProductRawItem): ProductItem => {
  const status = normalizeStatus(raw.product_status)

  return {
    id: String(raw.id || ''),
    productName: String(raw.product_name || ''),
    productDescription: String(raw.product_description || ''),
    productStatus: toProductStatus(status.code || status.name),
    productStatusId: status.id,
    productStatusName: status.name
  }
}

export const productApi = {
  async list(query: ProductListQuery = {}): Promise<ProductItem[]> {
    const params: ProductListQuery = {}
    if (query.product_status_id) {
      params.product_status_id = query.product_status_id
    }

    const response = await apiClient.get<ApiResponse<ProductRawItem[]>>(
      ENDPOINTS.PRODUCTS.BASE,
      { params }
    )
    const list = Array.isArray(response.data?.data) ? response.data.data : []
    return list.map(normalizeProduct)
  },

  async listStatuses(): Promise<ProductStatusRef[]> {
    const response = await apiClient.get<ApiResponse<ProductStatusRawItem[]>>(
      `${ENDPOINTS.MASTER_DATA.BASE}/product-statuses`,
      { params: { include_inactive: true } }
    )
    const list = Array.isArray(response.data?.data) ? response.data.data : []

    return list
      .map(normalizeStatus)
      .filter(status => status.id !== '')
  },

  async create(payload: ProductCreatePayload): Promise<ProductItem> {
    const response = await apiClient.post<ApiResponse<ProductRawItem>>(
      ENDPOINTS.PRODUCTS.BASE,
      payload
    )
    return normalizeProduct(response.data?.data ?? {})
  },

  async update(productId: string, payload: ProductUpdatePayload): Promise<ProductItem> {
    const response = await apiClient.patch<ApiResponse<ProductRawItem>>(
      `${ENDPOINTS.PRODUCTS.BASE}/${productId}`,
      payload
    )
    return normalizeProduct(response.data?.data ?? {})
  },

  async delete(productId: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.PRODUCTS.BASE}/${productId}`)
  }
}
