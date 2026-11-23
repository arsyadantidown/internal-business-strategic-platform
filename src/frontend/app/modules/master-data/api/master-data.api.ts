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

const buildDescriptionPayload = (description?: string): string | null =>
  typeof description === 'string' && description.trim().length > 0 ? description.trim() : null

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
    const payload: Record<string, unknown> = {
      [`${category.prefix}_code`]: values.code,
      [`${category.prefix}_name`]: values.name
    }

    if (values.description !== undefined) {
      payload[`${category.prefix}_description`] = buildDescriptionPayload(values.description)
    }

    if (values.sortOrder !== undefined) {
      payload.sort_order = values.sortOrder
    }

    const response = await apiClient.post<MasterDataApiEnvelope<MasterDataRawItem>>(
      `${ENDPOINTS.MASTER_DATA.BASE}/${category.type}`,
      payload
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
    const payload: Record<string, unknown> = {
      [`${category.prefix}_name`]: values.name
    }

    if (values.description !== undefined) {
      payload[`${category.prefix}_description`] = buildDescriptionPayload(values.description)
    }

    if (values.sortOrder !== undefined) {
      payload.sort_order = values.sortOrder
    }

    if (values.isActive !== undefined) {
      payload.is_active = values.isActive
    }

    const response = await apiClient.patch<MasterDataApiEnvelope<MasterDataRawItem>>(
      `${ENDPOINTS.MASTER_DATA.BASE}/${category.type}/${itemId}`,
      payload
    )
    return {
      item: normalizeMasterDataItem(category, response.data?.data ?? {}),
      message: readText(response.data?.message)
    }
  },

  async toggleActive(
    category: MasterDataCategory,
    item: MasterDataItem
  ): Promise<MasterDataMutationResult> {
    return this.update(category, item.id, {
      code: item.code,
      name: item.name,
      isActive: !item.isActive
    })
  },

  async delete(
    category: MasterDataCategory,
    itemId: string
  ): Promise<MasterDataDeleteResult> {
    const response = await apiClient.delete<
      MasterDataApiEnvelope<{ deleted: boolean } | null>
    >(`${ENDPOINTS.MASTER_DATA.BASE}/${category.type}/${itemId}`)

    return {
      deleted: response.data?.data?.deleted !== false,
      message: readText(response.data?.message)
    }
  }
}
