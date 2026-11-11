import { ENDPOINTS } from '~/api/endpoints'
import { apiClient } from '~/api/client'
import { masterDataApi } from '~/modules/master-data/api/master-data.api'
import { getMasterDataCategory } from '~/modules/master-data/data/master-data.categories'
import type {
  MasterDataOption,
  TechStackOption,
  TechStackRef,
  TechTaskDetail,
  TechTaskFilters,
  TechTaskFormValues,
  TechTaskListItem,
  TechTaskListResult,
  TechTaskMasterDataRef,
  TechTaskTechStackGroups
} from '../types/tech-task.types'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export const getTechTaskErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    const message = response?.data?.message
    if (message) return message
  }

  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}

const readText = (value: unknown): string =>
  typeof value === 'string' ? value : ''

const readNullableText = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

const readMoneyText = (value: unknown): string | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'string' && value !== '') return value
  return null
}

const readNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return null
}

const readBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value
  return null
}

const readRef = (value: unknown): TechTaskMasterDataRef | null => {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Record<string, unknown>
  const id = typeof record.id === 'string' ? record.id : null
  const code = typeof record.code === 'string' ? record.code : ''
  const name = typeof record.name === 'string' ? record.name : ''

  if (!id) return null
  return { id, code, name }
}

const readStackGroup = (value: unknown): TechStackRef[] => {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(item => ({
      id: typeof item.id === 'string' ? item.id : '',
      name: typeof item.name === 'string' ? item.name : ''
    }))
    .filter(item => item.id !== '')
}

const readTechStackGroups = (value: unknown): TechTaskTechStackGroups => {
  const record = typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : {}

  return {
    frontend: readStackGroup(record.frontend),
    backend: readStackGroup(record.backend),
    dataStorage: readStackGroup(record.data_storage)
  }
}

const normalizeListItem = (raw: Record<string, unknown>): TechTaskListItem => ({
  id: typeof raw.id === 'string' ? raw.id : '',
  projectCode: readText(raw.project_code),
  projectName: readText(raw.project_name),
  year: readNumber(raw.year) ?? 0,
  projectObjective: readNullableText(raw.project_objective),
  customerName: readNullableText(raw.customer_name),
  techStacks: readTechStackGroups(raw.tech_stacks),
  projectStatus: readRef(raw.project_status),
  contractName: readNullableText(raw.contract_name),
  contractNumber: readNullableText(raw.contract_number),
  startDate: readText(raw.start_date).slice(0, 10),
  endDate: readText(raw.end_date).slice(0, 10),
  progressPercent: readNumber(raw.progress_percent),
  remainingDays: readNumber(raw.remaining_days),
  isFeatured: readBoolean(raw.is_featured) ?? false,
  updatedAt: readText(raw.updated_at),
  valueBeforeTax: readMoneyText(raw.value_before_tax)
})

const normalizeDetail = (raw: Record<string, unknown>): TechTaskDetail => {
  const customer = typeof raw.customer === 'object' && raw.customer !== null
    ? raw.customer as Record<string, unknown>
    : null

  const partners = Array.isArray(raw.partners)
    ? raw.partners
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map(item => ({
          partnerId: readText(item.partner_id),
          partnerName: readText(item.partner_name),
          partnerRole: readText(item.partner_role),
          partnerContribution: readNullableText(item.partner_contribution)
        }))
        .filter(item => item.partnerId !== '')
    : []

  const products = Array.isArray(raw.products)
    ? raw.products
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map(item => ({
          id: readText(item.id),
          name: readText(item.name)
        }))
        .filter(item => item.id !== '')
    : []

  const files = Array.isArray(raw.files)
    ? raw.files
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map(item => ({
          id: readText(item.id),
          projectId: readText(item.project_id),
          fileCategory: readText(item.file_category),
          fileName: readText(item.file_name),
          fileTitle: readText(item.file_title),
          fileDescription: readNullableText(item.file_description),
          mimeType: readText(item.mime_type),
          fileSizeBytes: readNumber(item.file_size_bytes) ?? 0,
          sortOrder: readNumber(item.sort_order) ?? 0,
          createdAt: readText(item.created_at)
        }))
        .filter(item => item.id !== '')
    : []

  return {
    id: readText(raw.id),
    projectCode: readText(raw.project_code),
    projectName: readText(raw.project_name),
    year: readNumber(raw.year) ?? 0,
    opportunity: readNullableText(raw.opportunity),
    contractName: readNullableText(raw.contract_name),
    contractNumber: readNullableText(raw.contract_number),
    businessUnit: readRef(raw.business_unit),
    projectStatus: readRef(raw.project_status),
    projectManager: readNullableText(raw.project_manager),
    accountManager: readNullableText(raw.account_manager),
    startDate: readText(raw.start_date).slice(0, 10),
    endDate: readText(raw.end_date).slice(0, 10),
    totalDays: readNumber(raw.total_days),
    elapsedDays: readNumber(raw.elapsed_days),
    remainingDays: readNumber(raw.remaining_days),
    progressPercent: readNumber(raw.progress_percent),
    isOverdue: readBoolean(raw.is_overdue),
    projectObjective: readNullableText(raw.project_objective),
    projectDescription: readNullableText(raw.project_description),
    projectBackground: readNullableText(raw.project_background),
    projectChallenges: readNullableText(raw.project_challenges),
    projectSolution: readNullableText(raw.project_solution),
    customerName: readNullableText(raw.customer_name),
    industry: readRef(raw.industry),
    customer: customer
      ? {
          id: readText(customer.id),
          customerName: readText(customer.customer_name),
          customerLocation: readNullableText(customer.customer_location),
          annualRevenue: readNullableText(customer.annual_revenue),
          companySize: readRef(customer.company_size),
          customerType: readRef(customer.customer_type),
          industry: readRef(customer.industry),
          legalStructure: readRef(customer.legal_structure)
        }
      : null,
    products,
    techStacks: readTechStackGroups(raw.tech_stacks),
    coverImageUrl: readNullableText(raw.cover_image_url),
    partners,
    files,
    isFeatured: readBoolean(raw.is_featured) ?? false,
    createdAt: readText(raw.created_at),
    updatedAt: readText(raw.updated_at),
    valueBeforeTax: readMoneyText(raw.value_before_tax),
    carryOverValue: readMoneyText(raw.carry_over_value)
  }
}

const toNumberOrNull = (value: string): number | null => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

const buildCreatePayload = (values: TechTaskFormValues) => ({
  project_code: values.projectCode.trim(),
  project_name: values.projectName.trim(),
  year: Number(values.year),
  business_unit_id: values.businessUnitId,
  project_status_id: values.projectStatusId,
  value_before_tax: toNumberOrNull(values.valueBeforeTax) ?? 0,
  carry_over_value: toNumberOrNull(values.carryOverValue),
  start_date: values.startDate,
  end_date: values.endDate,
  opportunity: values.opportunity.trim() || null,
  contract_name: values.contractName.trim() || null,
  contract_number: values.contractNumber.trim() || null,
  project_manager: values.projectManager.trim() || null,
  account_manager: values.accountManager.trim() || null,
  project_objective: values.projectObjective.trim() || null,
  project_description: values.projectDescription.trim() || null,
  project_background: values.projectBackground.trim() || null,
  project_challenges: values.projectChallenges.trim() || null,
  project_solution: values.projectSolution.trim() || null,
  is_featured: values.isFeatured,
  customer: {
    customer_name: values.customerName.trim()
  },
  tech_stack_ids: values.techStackIds
})

const buildUpdateChanges = (
  detail: TechTaskDetail,
  values: TechTaskFormValues
): Record<string, unknown> => {
  const changes: Record<string, unknown> = {}
  const sameText = (form: string, current: string | null) =>
    form.trim() === (current ?? '')
  const sameMoney = (form: string, current: string | null) => {
    const formNumber = toNumberOrNull(form)
    const currentNumber = current === null ? null : Number(current)
    const sameNull = formNumber === null && currentNumber === null
    const sameValue = formNumber !== null && currentNumber !== null && formNumber === currentNumber
    return sameNull || sameValue
  }

  if (values.projectCode.trim() !== detail.projectCode) {
    changes.project_code = values.projectCode.trim()
  }
  if (values.projectName.trim() !== detail.projectName) {
    changes.project_name = values.projectName.trim()
  }
  if (Number(values.year) !== detail.year) {
    changes.year = Number(values.year)
  }
  if (values.businessUnitId !== (detail.businessUnit?.id ?? '')) {
    changes.business_unit_id = values.businessUnitId
  }
  if (values.projectStatusId !== (detail.projectStatus?.id ?? '')) {
    changes.project_status_id = values.projectStatusId
  }
  if (!sameMoney(values.valueBeforeTax, detail.valueBeforeTax)) {
    changes.value_before_tax = toNumberOrNull(values.valueBeforeTax) ?? 0
  }
  if (!sameMoney(values.carryOverValue, detail.carryOverValue)) {
    changes.carry_over_value = toNumberOrNull(values.carryOverValue)
  }
  if (values.startDate !== detail.startDate) {
    changes.start_date = values.startDate
  }
  if (values.endDate !== detail.endDate) {
    changes.end_date = values.endDate
  }
  if (!sameText(values.opportunity, detail.opportunity)) {
    changes.opportunity = values.opportunity.trim() || null
  }
  if (!sameText(values.contractName, detail.contractName)) {
    changes.contract_name = values.contractName.trim() || null
  }
  if (!sameText(values.contractNumber, detail.contractNumber)) {
    changes.contract_number = values.contractNumber.trim() || null
  }
  if (!sameText(values.projectManager, detail.projectManager)) {
    changes.project_manager = values.projectManager.trim() || null
  }
  if (!sameText(values.accountManager, detail.accountManager)) {
    changes.account_manager = values.accountManager.trim() || null
  }
  if (!sameText(values.projectObjective, detail.projectObjective)) {
    changes.project_objective = values.projectObjective.trim() || null
  }
  if (!sameText(values.projectDescription, detail.projectDescription)) {
    changes.project_description = values.projectDescription.trim() || null
  }
  if (!sameText(values.projectBackground, detail.projectBackground)) {
    changes.project_background = values.projectBackground.trim() || null
  }
  if (!sameText(values.projectChallenges, detail.projectChallenges)) {
    changes.project_challenges = values.projectChallenges.trim() || null
  }
  if (!sameText(values.projectSolution, detail.projectSolution)) {
    changes.project_solution = values.projectSolution.trim() || null
  }
  if (values.isFeatured !== detail.isFeatured) {
    changes.is_featured = values.isFeatured
  }

  return changes
}

export const techTaskApi = {
  async list(filters: TechTaskFilters, page: number, pageSize: number): Promise<TechTaskListResult> {
    const params: Record<string, string | number> = {
      page,
      page_size: pageSize
    }

    const search = filters.search.trim()
    if (search) params.search = search
    if (filters.techStackId) params.tech_stack_id = filters.techStackId
    if (filters.projectStatusId) params.project_status_id = filters.projectStatusId
    if (filters.year.trim()) params.year = Number(filters.year.trim())

    const response = await apiClient.get<ApiEnvelope<{
      items?: unknown
      page?: unknown
      page_size?: unknown
      total?: unknown
      total_pages?: unknown
    }>>(ENDPOINTS.PROJECTS.BASE, { params })

    const payload = typeof response.data?.data === 'object' && response.data.data !== null
      ? response.data.data as Record<string, unknown>
      : {}

    const items = Array.isArray(payload.items)
      ? payload.items
          .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
          .map(normalizeListItem)
      : []

    return {
      items,
      page: readNumber(payload.page) ?? page,
      pageSize: readNumber(payload.page_size) ?? pageSize,
      total: readNumber(payload.total) ?? 0,
      totalPages: Math.max(readNumber(payload.total_pages) ?? 0, 0)
    }
  },

  async getDetail(techTaskId: string): Promise<TechTaskDetail> {
    const response = await apiClient.get<ApiEnvelope<Record<string, unknown>>>(
      `${ENDPOINTS.PROJECTS.BASE}/${techTaskId}`
    )

    const raw = typeof response.data?.data === 'object' && response.data.data !== null
      ? response.data.data as Record<string, unknown>
      : {}

    return normalizeDetail(raw)
  },

  async create(values: TechTaskFormValues): Promise<{ message: string }> {
    const response = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
      ENDPOINTS.PROJECTS.BASE,
      buildCreatePayload(values)
    )

    return { message: readText(response.data?.message) }
  },

  async update(
    techTaskId: string,
    detail: TechTaskDetail,
    values: TechTaskFormValues
  ): Promise<{ message: string }> {
    const response = await apiClient.patch<ApiEnvelope<Record<string, unknown>>>(
      `${ENDPOINTS.PROJECTS.BASE}/${techTaskId}`,
      buildUpdateChanges(detail, values)
    )

    return { message: readText(response.data?.message) }
  },

  getUpdateChanges: buildUpdateChanges,

  async updateTechStacks(techTaskId: string, techStackIds: string[]): Promise<{ message: string }> {
    const response = await apiClient.put<ApiEnvelope<Record<string, unknown>>>(
      `${ENDPOINTS.PROJECTS.BASE}/${techTaskId}/tech-stacks`,
      { tech_stack_ids: techStackIds }
    )

    return { message: readText(response.data?.message) }
  },

  async listTechStackOptions(): Promise<TechStackOption[]> {
    const response = await apiClient.get<ApiEnvelope<unknown>>(
      ENDPOINTS.TECH_STACKS.BASE,
      { params: { include_inactive: false } }
    )

    const rows = Array.isArray(response.data?.data)
      ? response.data.data
          .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      : []

    return rows
      .map(row => ({
        id: readText(row.id),
        category: readText(row.tech_stack_category),
        name: readText(row.tech_stack_name)
      }))
      .filter(row => row.id !== '')
      .sort((first, second) => first.name.localeCompare(second.name))
  },

  async listBusinessUnitOptions(): Promise<MasterDataOption[]> {
    const category = getMasterDataCategory('business-units')
    const items = await masterDataApi.list(category, false)

    return items.map(item => ({ id: item.id, code: item.code, name: item.name }))
  },

  async listProjectStatusOptions(): Promise<MasterDataOption[]> {
    const category = getMasterDataCategory('project-statuses')
    const items = await masterDataApi.list(category, false)

    return items.map(item => ({ id: item.id, code: item.code, name: item.name }))
  }
}
