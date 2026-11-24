export type PartnerCategoryValue = 'technology' | 'channel' | 'service' | 'marketing'

export interface PartnerCategoryMeta {
  value: PartnerCategoryValue
  label: string
  icon: string
  chipClass: string
}

export const PARTNER_CATEGORIES: readonly PartnerCategoryMeta[] = [
  {
    value: 'technology',
    label: 'Technology Partner',
    icon: 'i-lucide-cpu',
    chipClass: 'border-sky-200 bg-sky-50 text-sky-700'
  },
  {
    value: 'channel',
    label: 'Channel Partner',
    icon: 'i-lucide-network',
    chipClass: 'border-violet-200 bg-violet-50 text-violet-700'
  },
  {
    value: 'service',
    label: 'Service Partner',
    icon: 'i-lucide-handshake',
    chipClass: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  {
    value: 'marketing',
    label: 'Marketing Partner',
    icon: 'i-lucide-megaphone',
    chipClass: 'border-amber-200 bg-amber-50 text-amber-700'
  }
]

export type PartnerLifecycleStatusValue =
  | 'draft'
  | 'active'
  | 'under_review'
  | 'expired'
  | 'terminated'

export interface PartnerLifecycleStatusMeta {
  value: PartnerLifecycleStatusValue
  label: string
  chipClass: string
}

export const PARTNER_LIFECYCLE_STATUSES: readonly PartnerLifecycleStatusMeta[] = [
  {
    value: 'draft',
    label: 'Draft',
    chipClass: 'border-slate-200 bg-slate-100 text-slate-600'
  },
  {
    value: 'active',
    label: 'Active',
    chipClass: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  {
    value: 'under_review',
    label: 'Under Review',
    chipClass: 'border-amber-200 bg-amber-50 text-amber-700'
  },
  {
    value: 'expired',
    label: 'Expired',
    chipClass: 'border-orange-200 bg-orange-50 text-orange-700'
  },
  {
    value: 'terminated',
    label: 'Terminated',
    chipClass: 'border-rose-200 bg-rose-50 text-rose-700'
  }
]

export const PARTNER_LEGAL_DOCUMENT_TYPES = [
  'MoU',
  'MoA',
  'Partnership Agreement',
  'Contract',
  'NDA',
  'Certificate',
  'License',
  'Other'
] as const

export interface PartnerApiItem {
  id: string
  partner_name: string
  is_active: boolean
}

export interface PartnerApiDetail extends PartnerApiItem {
  projects?: Record<string, unknown>[]
}

export interface PartnerListQuery {
  search?: string
  include_inactive?: boolean
}

export interface PartnerCreatePayload {
  partner_name: string
}

export interface PartnerUpdatePayload {
  partner_name?: string
  is_active?: boolean
}

export interface PartnerDeleteResult {
  id: string
  deleted: boolean
  is_active?: boolean
}

export interface PartnerListItem {
  id: string
  partnerName: string
  category: PartnerCategoryValue | null
  isActive: boolean
  lifecycleStatus: PartnerLifecycleStatusValue | null
}

export interface PartnerProjectTechStack {
  frontend?: string[]
  backend?: string[]
  data_storage?: string[]
}
export interface PartnerCooperationProject {
  id: string
  projectCode: string
  projectName: string
  year: number
  projectObjective: string | null
  customerName: string | null
  industry: string | null
  partnerRole: string
  partnerContribution: string | null
  projectStatusName: string | null
  projectStatusCode: string | null
  contractName: string | null
  contractNumber: string | null
  startDate: string
  endDate: string
  progressPercent: number | null
  remainingDays: number | null
  isFeatured: boolean
  coverImageUrl: string | null
  valueBeforeTax: number | null
  techStacks: PartnerProjectTechStack
}

export interface PartnerLegalDocument {
  id: string
  documentName: string
  documentType: string
  documentNumber: string | null
  issuedAt: string | null
  expiresAt: string | null
  fileUrl: string | null
}

export interface PartnerCompanyProfile {
  website: string | null
  headquarters: string | null
  industry: string | null
  businessFocus: string | null
  description: string | null
}

export interface PartnerDetail {
  id: string
  partnerName: string
  category: PartnerCategoryValue | null
  isActive: boolean
  lifecycleStatus: PartnerLifecycleStatusValue | null
  profile: PartnerCompanyProfile
  expertiseAreas: string[]
  capabilities: string[]
  legalDocuments: PartnerLegalDocument[]
  cooperationProjects: PartnerCooperationProject[]
}

export interface PartnerFilters {
  search: string
  includeInactive: boolean
}

export interface PartnerFormValues {
  partnerName: string
}
