import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  ProductApiEnvelope,
  ProductCreatePayload,
  ProductDeleteResult,
  ProductFormValues,
  ProductListQuery,
  ProductMutationResult,
  ProductRecord,
  ProductStatus,
  ProductStatusRef,
  ProductUpdatePayload
} from '../types/product.types'

const readText = (value: unknown): string =>
  typeof value === 'string' ? value : ''

const readObject = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : {}

const readRows = (data: unknown): Record<string, unknown>[] =>
  Array.isArray(data)
    ? data.filter((item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null)
    : []

const readErrorData = (error: unknown): { message?: unknown, detail?: unknown } => {
  if (typeof error !== 'object' || error === null) return {}

  const candidate = error as {
    response?: { data?: { message?: unknown, detail?: unknown } }
    data?: { message?: unknown, detail?: unknown }
  }

  return candidate.response?.data ?? candidate.data ?? error as { message?: unknown, detail?: unknown }
}

export const getProductErrorMessage = (error: unknown): string => {
  const data = readErrorData(error)
  const message = readText(data.message)
  if (message) return message

  const detail = data.detail
  if (Array.isArray(detail)) {
    const first = detail.find((item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null && typeof item.msg === 'string') ?? detail[0]
    const detailMessage = readText(readObject(first).msg)
    if (detailMessage) return detailMessage
  } else if (typeof detail === 'string' && detail.trim() !== '') {
    return detail
  }

  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}

export const toProductStatus = (value: unknown): ProductStatus => {
  if (typeof value === 'object' && value !== null) {
    const status = value as Record<string, unknown>
    return toProductStatus(
      status.product_status_code
      ?? status.product_status_name
      ?? status.status_code
      ?? status.product_status_id
      ?? status.status
      ?? status.code
      ?? status.name
    )
  }

  const raw = readText(value).trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (!raw) return 'draft'
  if (/inactive|non_active|nonactive|deprecated|archived|retired|disabled|nonaktif/.test(raw)) {
    return 'inactive'
  }
  if (/draft|pending|review/.test(raw)) return 'draft'
  if (/active|live|published|aktif/.test(raw)) return 'active'
  return 'inactive'
}

const normalizeProductStatusRef = (raw: Record<string, unknown>): ProductStatusRef => {
  const code = readText(raw.product_status_code ?? raw.status_code ?? raw.code ?? raw.status)
  const name = readText(raw.product_status_name ?? raw.status_name ?? raw.name ?? raw.label)

  return {
    id: readText(raw.id ?? raw.product_status_id),
    code: code || name,
    name: name || code
  }
}

export const normalizeProduct = (raw: Record<string, unknown>): ProductRecord => {
  const statusValue = raw.product_status ?? raw.product_status_code ?? raw.status
  const status = readObject(statusValue)
  const code = readText(status.product_status_code ?? status.status_code ?? status.code ?? status.status)
  const statusName = readText(
    status.product_status_name
    ?? status.status_name
    ?? status.name
    ?? raw.product_status_name
  ) || code

  return {
    id: readText(raw.id),
    productName: readText(raw.product_name ?? raw.name),
    productDescription: readText(raw.product_description ?? raw.description),
    productStatus: toProductStatus(statusValue),
    productStatusId: readText(status.id ?? raw.product_status_id),
    productStatusName: statusName
  }
}

export const buildProductCreatePayload = (
  values: ProductFormValues,
  productStatusId: string
): ProductCreatePayload => ({
  product_name: values.productName.trim(),
  product_description: values.productDescription.trim(),
  product_status_id: productStatusId
})

export const buildProductUpdatePayload = (
  current: ProductRecord,
  values: ProductFormValues,
  productStatusId: string
): ProductUpdatePayload => {
  const payload: ProductUpdatePayload = {}

  const name = values.productName.trim()
  if (name !== current.productName) payload.product_name = name

  const description = values.productDescription.trim()
  if (description !== current.productDescription) payload.product_description = description

  if (productStatusId !== current.productStatusId) {
    payload.product_status_id = productStatusId
  }

  return payload
}

export const productApi = {
  async list(query: ProductListQuery = {}): Promise<ProductRecord[]> {
    const params: ProductListQuery = {}
    if (query.product_status_id) params.product_status_id = query.product_status_id

    const response = await apiClient.get<ProductApiEnvelope<unknown>>(ENDPOINTS.PRODUCTS.BASE, {
      params
    })

    return readRows(response.data?.data)
      .map(normalizeProduct)
      .filter(item => item.id !== '')
  },

  async create(payload: ProductCreatePayload): Promise<ProductMutationResult> {
    const response = await apiClient.post<ProductApiEnvelope<Record<string, unknown>>>(
      ENDPOINTS.PRODUCTS.BASE,
      payload
    )

    return {
      item: normalizeProduct(readObject(response.data?.data)),
      message: readText(response.data?.message)
    }
  },

  async update(
    productId: string,
    payload: ProductUpdatePayload
  ): Promise<ProductMutationResult> {
    const response = await apiClient.patch<ProductApiEnvelope<Record<string, unknown>>>(
      `${ENDPOINTS.PRODUCTS.BASE}/${productId}`,
      payload
    )

    return {
      item: normalizeProduct(readObject(response.data?.data)),
      message: readText(response.data?.message)
    }
  },

  async remove(productId: string): Promise<ProductDeleteResult> {
    const response = await apiClient.delete<ProductApiEnvelope<Record<string, unknown>>>(
      `${ENDPOINTS.PRODUCTS.BASE}/${productId}`
    )
    const raw = readObject(response.data?.data)

    return {
      id: readText(raw.id) || productId,
      deleted: raw.deleted === true,
      message: readText(response.data?.message)
    }
  },

  async listStatuses(): Promise<ProductStatusRef[]> {
    const response = await apiClient.get<ProductApiEnvelope<unknown>>(
      `${ENDPOINTS.MASTER_DATA.BASE}/product-statuses`
    )

    return readRows(response.data?.data)
      .map(normalizeProductStatusRef)
      .filter(item => item.id !== '')
  }
}
