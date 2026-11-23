import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  PartnerCreatePayload,
  PartnerDeleteResult,
  PartnerDetail,
  PartnerFilters,
  PartnerLegalDocument,
  PartnerListItem,
  PartnerUpdatePayload
} from '../types/partner.types'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

interface PartnerErrorShape {
  data?: unknown
  response?: { data?: unknown }
}

const readText = (value: unknown): string =>
  typeof value === 'string' ? value : ''

const readNullableText = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

const readNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const readStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    : []

const readLegalDocuments = (value: unknown): PartnerLegalDocument[] => {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(item => ({
      id: readText(item.id),
      documentName: readText(item.document_name),
      documentType: readText(item.document_type),
      documentNumber: readNullableText(item.document_number),
      issuedAt: readNullableText(item.issued_at),
      expiresAt: readNullableText(item.expires_at),
      fileUrl: readNullableText(item.file_url)
    }))
    .filter(item => item.id !== '' || item.documentName !== '')
}

const readProjectStatusName = (value: unknown): string | null => {
  if (typeof value !== 'object' || value === null) return null
  return readNullableText((value as Record<string, unknown>).name)
}

const normalizeListItem = (raw: Record<string, unknown>): PartnerListItem => ({
  id: readText(raw.id),
  partnerName: readText(raw.partner_name),
  category: null,
  isActive: raw.is_active === true,
  lifecycleStatus: null
})

const normalizeCooperationProject = (raw: Record<string, unknown>) => ({
  id: readText(raw.id),
  projectCode: readText(raw.project_code),
  projectName: readText(raw.project_name),
  year: readNumber(raw.year) ?? 0,
  customerName: readNullableText(raw.customer_name),
  partnerRole: readText(raw.partner_role),
  partnerContribution: readNullableText(raw.partner_contribution),
  projectStatusName: readProjectStatusName(raw.project_status),
  startDate: readText(raw.start_date).slice(0, 10),
  endDate: readText(raw.end_date).slice(0, 10),
  progressPercent: readNumber(raw.progress_percent)
})

const normalizeDetail = (raw: Record<string, unknown>): PartnerDetail => ({
  id: readText(raw.id),
  partnerName: readText(raw.partner_name),
  category: null,
  isActive: raw.is_active === true,
  lifecycleStatus: null,
  profile: {
    website: null,
    headquarters: null,
    industry: null,
    businessFocus: null,
    description: null
  },
  expertiseAreas: readStringList(raw.expertise_areas),
  capabilities: readStringList(raw.capabilities),
  legalDocuments: readLegalDocuments(raw.legal_documents),
  cooperationProjects: Array.isArray(raw.projects)
    ? raw.projects
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map(normalizeCooperationProject)
        .filter(item => item.id !== '')
    : []
})

const readRows = (data: unknown): Record<string, unknown>[] =>
  Array.isArray(data)
    ? data.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    : []

const readObject = (data: unknown): Record<string, unknown> =>
  typeof data === 'object' && data !== null ? data as Record<string, unknown> : {}

const readMessageList = (value: unknown): string[] => {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(item => readMessageList(item))
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([field, item]) =>
      readMessageList(item).map(message => `${field}: ${message}`)
    )
  }
  return []
}

const readErrorData = (error: unknown): Record<string, unknown> | null => {
  if (typeof error !== 'object' || error === null) return null
  const source = error as PartnerErrorShape
  const data = source.response?.data ?? source.data
  return typeof data === 'object' && data !== null ? data as Record<string, unknown> : null
}

export const getPartnerErrorMessage = (error: unknown): string => {
  const data = readErrorData(error)

  if (data) {
    const message = data.message ?? data.detail
    if (typeof message === 'string' && message) return message

    const fieldMessages = readMessageList(data.errors)
    if (fieldMessages.length) return fieldMessages.join(' ')
  }

  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}

export const partnerApi = {
  async list(filters: PartnerFilters): Promise<PartnerListItem[]> {
    const params: Record<string, string | boolean> = {}
    const search = filters.search.trim().slice(0, 200)
    if (search) params.search = search
    params.include_inactive = filters.includeInactive

    const response = await apiClient.get<ApiEnvelope<unknown>>(ENDPOINTS.PARTNERS.BASE, { params })

    return readRows(response.data?.data)
      .map(normalizeListItem)
      .filter(item => item.id !== '')
  },

  async getDetail(partnerId: string): Promise<PartnerDetail> {
    const response = await apiClient.get<ApiEnvelope<Record<string, unknown>>>(
      `${ENDPOINTS.PARTNERS.BASE}/${partnerId}`
    )

    return normalizeDetail(readObject(response.data?.data))
  },

  async create(payload: PartnerCreatePayload): Promise<PartnerListItem> {
    const response = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
      ENDPOINTS.PARTNERS.BASE,
      payload
    )

    return normalizeListItem(readObject(response.data?.data))
  },

  async update(partnerId: string, payload: PartnerUpdatePayload): Promise<PartnerListItem> {
    const response = await apiClient.patch<ApiEnvelope<Record<string, unknown>>>(
      `${ENDPOINTS.PARTNERS.BASE}/${partnerId}`,
      payload
    )

    return normalizeListItem(readObject(response.data?.data))
  },

  async setActive(partnerId: string, isActive: boolean): Promise<PartnerListItem> {
    return partnerApi.update(partnerId, { is_active: isActive })
  },

  async delete(partnerId: string): Promise<PartnerDeleteResult> {
    const response = await apiClient.delete<ApiEnvelope<Record<string, unknown>>>(
      `${ENDPOINTS.PARTNERS.BASE}/${partnerId}`
    )
    const raw = readObject(response.data?.data)

    return {
      id: readText(raw.id) || partnerId,
      deleted: raw.deleted === true,
      is_active: typeof raw.is_active === 'boolean' ? raw.is_active : undefined
    }
  }
}
