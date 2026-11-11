export type MasterDataType
  = | 'company-sizes'
    | 'customer-types'
    | 'industries'
    | 'legal-structures'
    | 'business-units'
    | 'project-statuses'
    | 'product-statuses'

export interface MasterDataCategory {
  type: MasterDataType
  label: string
  singular: string
  prefix: string
  icon: string
  description: string
}

export interface MasterDataItem {
  id: string
  code: string
  name: string
  description: string | null
  sortOrder: number | null
  isActive: boolean
}

export interface MasterDataFormValues {
  code: string
  name: string
  description: string
  sortOrder: number | null
  isActive: boolean
}

export type MasterDataStatusFilter = '' | 'active' | 'inactive'

export interface MasterDataFilters {
  search: string
  status: MasterDataStatusFilter
}

export type MasterDataTone = 'blue' | 'emerald' | 'slate'

export interface MasterDataStat {
  key: string
  label: string
  value: number
  icon: string
  tone: MasterDataTone
  hint: string
}

export interface MasterDataMutationResult {
  item: MasterDataItem
  message: string
}

export interface MasterDataDeleteResult {
  deleted: boolean
  message: string
}

export type MasterDataFormErrors = Record<string, string | undefined>

export type MasterDataRawItem = Record<string, unknown>

export interface MasterDataApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}
