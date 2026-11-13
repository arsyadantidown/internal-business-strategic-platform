import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  MasterDataApiEnvelope,
  MasterDataCategory,
  MasterDataDeleteResult,
  MasterDataFormValues,
  MasterDataItem,
  MasterDataMutationResult,
  MasterDataRawItem
} from '../types/master-data.types'

const readText = (value: unknown): string => (typeof value === 'string' ? value : '')

const readDescription = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value : null

const readSortOrder = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const normalizeMasterDataItem = (
  category: MasterDataCategory,
  raw: MasterDataRawItem
): MasterDataItem => ({
  id: readText(raw.id),
  code: readText(raw[`${category.prefix}_code`]),
  name: readText(raw[`${category.prefix}_name`]),
  description: readDescription(raw[`${category.prefix}_description`]),
  sortOrder: readSortOrder(raw.sort_order),
  isActive: raw.is_active === true
})

const buildDescriptionPayload = (description: string): string | null =>
  description.trim().length > 0 ? description : null

export const masterDataApi = {
  async list(
    category: MasterDataCategory,
    includeInactive: boolean
  ): Promise<MasterDataItem[]> {
    const response = await apiClient.get<MasterDataApiEnvelope<MasterDataRawItem[]>>(
      `${ENDPOINTS.MASTER_DATA.BASE}/${category.type}`,
      { params: { include_inactive: includeInactive } }
    )
    const rows = Array.isArray(response.data?.data) ? response.data.data : []
    return rows.map(row => normalizeMasterDataItem(category, row))
  },

  async create(
    category: MasterDataCategory,
    values: MasterDataFormValues
  ): Promise<MasterDataMutationResult> {
    const response = await apiClient.post<MasterDataApiEnvelope<MasterDataRawItem>>(
      `${ENDPOINTS.MASTER_DATA.BASE}/${category.type}`,
      {
        [`${category.prefix}_code`]: values.code,
        [`${category.prefix}_name`]: values.name,
        [`${category.prefix}_description`]: buildDescriptionPayload(values.description),
        sort_order: values.sortOrder
      }
    )
    return {
      item: normalizeMasterDataItem(category, response.data?.data ?? {}),
      message: readText(response.data?.message)
    }
  },

  async update(
    category: MasterDataCategory,
    itemId: string,
    values: MasterDataFormValues
  ): Promise<MasterDataMutationResult> {
    const response = await apiClient.patch<MasterDataApiEnvelope<MasterDataRawItem>>(
      `${ENDPOINTS.MASTER_DATA.BASE}/${category.type}/${itemId}`,
      {
        [`${category.prefix}_name`]: values.name,
        [`${category.prefix}_description`]: buildDescriptionPayload(values.description),
        sort_order: values.sortOrder,
        is_active: values.isActive
      }
    )
    return {
      item: normalizeMasterDataItem(category, response.data?.data ?? {}),
      message: readText(response.data?.message)
    }
  },

  async toggleActive(
    category: MasterDataCategory,
    itemId: string,
    isActive: boolean
  ): Promise<MasterDataMutationResult> {
    const response = await apiClient.patch<MasterDataApiEnvelope<MasterDataRawItem>>(
      `${ENDPOINTS.MASTER_DATA.BASE}/${category.type}/${itemId}`,
      { is_active: isActive }
    )
    return {
      item: normalizeMasterDataItem(category, response.data?.data ?? {}),
      message: readText(response.data?.message)
    }
  },

  async remove(
    category: MasterDataCategory,
    itemId: string
  ): Promise<MasterDataDeleteResult> {
    const response = await apiClient.delete<
      MasterDataApiEnvelope<{ id?: unknown, deleted?: unknown }>
    >(`${ENDPOINTS.MASTER_DATA.BASE}/${category.type}/${itemId}`)
    return {
      deleted: response.data?.data?.deleted === true,
      message: readText(response.data?.message)
    }
  }
}
