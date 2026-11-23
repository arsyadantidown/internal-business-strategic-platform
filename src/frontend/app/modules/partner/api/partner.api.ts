import { ENDPOINTS } from '~/api/endpoints'
import { apiClient } from '~/api/client'
import type {
  PartnerDetail,
  PartnerFilters,
  PartnerFormValues,
  PartnerLegalDocument,
  PartnerListItem,
  PartnerStatusFilterValue
} from '../types/partner.types'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

const PARTNER_EXTENDED_FIELDS_SUPPORTED = false

export const getPartnerErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    const message = response?.data?.message
    if (message) return message
  }

  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}

const isForbiddenError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response
    return response?.status === 403
  }
  return false
}

const readText = (value: unknown): string =>
  typeof value === 'string' ? value : ''

const readNullableText = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

const readNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return null
}

const readBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value
  return null
}

const readCategory = (value: unknown): PartnerListItem['category'] => {
  if (value === 'technology' || value === 'channel' || value === 'service' || value === 'marketing') {
    return value
  }
  return null
}

const readLifecycleStatus = (value: unknown): PartnerListItem['lifecycleStatus'] => {
  if (value === 'draft' || value === 'active' || value === 'under_review' || value === 'expired' || value === 'terminated') {
    return value
  }
  return null
}

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
  const record = value as Record<string, unknown>
  return readNullableText(record.name)
}

const normalizeListItem = (raw: Record<string, unknown>): PartnerListItem => ({
  id: readText(raw.id),
  partnerName: readText(raw.partner_name),
  category: readCategory(raw.category),
  isActive: readBoolean(raw.is_active) ?? true,
  lifecycleStatus: readLifecycleStatus(raw.status)
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
  category: readCategory(raw.category),
  isActive: readBoolean(raw.is_active) ?? true,
  lifecycleStatus: readLifecycleStatus(raw.status),
  profile: {
    website: readNullableText(raw.website),
    headquarters: readNullableText(raw.headquarters),
    industry: readNullableText(raw.industry),
    businessFocus: readNullableText(raw.business_focus),
    description: readNullableText(raw.description)
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

const buildCreatePayload = (values: PartnerFormValues): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    partner_name: values.partnerName.trim()
  }

  if (PARTNER_EXTENDED_FIELDS_SUPPORTED) {
    payload.category = values.category || null
    payload.status = values.status
    payload.website = values.website.trim() || null
    payload.headquarters = values.headquarters.trim() || null
    payload.industry = values.industry.trim() || null
    payload.business_focus = values.businessFocus.trim() || null
    payload.description = values.description.trim() || null
    payload.expertise_areas = values.expertiseAreas
    payload.capabilities = values.capabilities
    payload.legal_documents = values.legalDocuments
      .filter(document => document.documentName.trim() !== '')
      .map(document => ({
        document_name: document.documentName.trim(),
        document_type: document.documentType,
        document_number: document.documentNumber.trim() || null,
        issued_at: document.issuedAt || null,
        expires_at: document.expiresAt || null
      }))
  }

  return payload
}

const buildUpdateChanges = (
  detail: PartnerDetail,
  values: PartnerFormValues
): Record<string, unknown> => {
  const changes: Record<string, unknown> = {}

  if (values.partnerName.trim() !== detail.partnerName) {
    changes.partner_name = values.partnerName.trim()
  }

  if (PARTNER_EXTENDED_FIELDS_SUPPORTED) {
    if ((values.category || null) !== detail.category) {
      changes.category = values.category || null
    }
    if (values.status !== (detail.lifecycleStatus ?? 'draft')) {
      changes.status = values.status
    }
    if ((values.website.trim() || null) !== detail.profile.website) {
      changes.website = values.website.trim() || null
    }
    if ((values.headquarters.trim() || null) !== detail.profile.headquarters) {
      changes.headquarters = values.headquarters.trim() || null
    }
    if ((values.industry.trim() || null) !== detail.profile.industry) {
      changes.industry = values.industry.trim() || null
    }
    if ((values.businessFocus.trim() || null) !== detail.profile.businessFocus) {
      changes.business_focus = values.businessFocus.trim() || null
    }
    if ((values.description.trim() || null) !== detail.profile.description) {
      changes.description = values.description.trim() || null
    }
    changes.expertise_areas = values.expertiseAreas
    changes.capabilities = values.capabilities
    changes.legal_documents = values.legalDocuments
      .filter(document => document.documentName.trim() !== '')
      .map(document => ({
        document_name: document.documentName.trim(),
        document_type: document.documentType,
        document_number: document.documentNumber.trim() || null,
        issued_at: document.issuedAt || null,
        expires_at: document.expiresAt || null
      }))
  } else {
    const nextActive = values.status === 'active'
    if (nextActive !== detail.isActive) {
      changes.is_active = nextActive
    }
  }

  return changes
}

export const partnerApi = {
  async list(filters: PartnerFilters): Promise<PartnerListItem[]> {
    const params: Record<string, string | boolean> = {}
    const search = filters.search.trim()
    if (search) params.search = search

    let response

    try {
      response = await apiClient.get<ApiEnvelope<unknown>>(ENDPOINTS.PARTNERS.BASE, {
        params: { ...params, include_inactive: true }
      })
    } catch (error) {
      if (isForbiddenError(error)) {
        response = await apiClient.get<ApiEnvelope<unknown>>(ENDPOINTS.PARTNERS.BASE, { params })
      } else {
        throw error
      }
    }

    return readRows(response.data?.data)
      .map(normalizeListItem)
      .filter(item => item.id !== '')
  },

  async getDetail(partnerId: string): Promise<PartnerDetail> {
    const response = await apiClient.get<ApiEnvelope<Record<string, unknown>>>(
      `${ENDPOINTS.PARTNERS.BASE}/${partnerId}`
    )

    const raw = typeof response.data?.data === 'object' && response.data.data !== null
      ? response.data.data as Record<string, unknown>
      : {}

    return normalizeDetail(raw)
  },

  async create(values: PartnerFormValues): Promise<{ message: string, id: string }> {
    const response = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
      ENDPOINTS.PARTNERS.BASE,
      buildCreatePayload(values)
    )

    const raw = typeof response.data?.data === 'object' && response.data.data !== null
      ? response.data.data as Record<string, unknown>
      : {}

    const id = readText(raw.id)

    if (id !== '' && !PARTNER_EXTENDED_FIELDS_SUPPORTED && values.status !== 'active') {
      await apiClient.patch<ApiEnvelope<Record<string, unknown>>>(
        `${ENDPOINTS.PARTNERS.BASE}/${id}`,
        { is_active: false }
      )
    }

    return { message: readText(response.data?.message), id }
  },

  async update(
    partnerId: string,
    detail: PartnerDetail,
    values: PartnerFormValues
  ): Promise<{ message: string }> {
    const response = await apiClient.patch<ApiEnvelope<Record<string, unknown>>>(
      `${ENDPOINTS.PARTNERS.BASE}/${partnerId}`,
      buildUpdateChanges(detail, values)
    )

    return { message: readText(response.data?.message) }
  },

  async setActive(partnerId: string, isActive: boolean): Promise<{ message: string }> {
    const response = await apiClient.patch<ApiEnvelope<Record<string, unknown>>>(
      `${ENDPOINTS.PARTNERS.BASE}/${partnerId}`,
      { is_active: isActive }
    )

    return { message: readText(response.data?.message) }
  },

  getUpdateChanges: buildUpdateChanges,

  applyStatusFilter(
    items: PartnerListItem[],
    status: PartnerStatusFilterValue
  ): PartnerListItem[] {
    if (status === '') return items
    return items.filter(item => (status === 'active') === item.isActive)
  }
}
