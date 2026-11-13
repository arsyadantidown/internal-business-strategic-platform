export interface TechStackRef {
  id: string
  name: string
}

export interface TechTaskMasterDataRef {
  id: string
  code: string
  name: string
}

export interface TechTaskTechStackGroups {
  frontend: TechStackRef[]
  backend: TechStackRef[]
  dataStorage: TechStackRef[]
}

export interface TechTaskListItem {
  id: string
  projectCode: string
  projectName: string
  year: number
  projectObjective: string | null
  customerName: string | null
  techStacks: TechTaskTechStackGroups
  projectStatus: TechTaskMasterDataRef | null
  contractName: string | null
  contractNumber: string | null
  startDate: string
  endDate: string
  progressPercent: number | null
  remainingDays: number | null
  isFeatured: boolean
  updatedAt: string
  valueBeforeTax: string | null
}

export interface TechTaskListResult {
  items: TechTaskListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface TechTaskCustomer {
  id: string
  customerName: string
  customerLocation: string | null
  annualRevenue: string | null
  companySize: TechTaskMasterDataRef | null
  customerType: TechTaskMasterDataRef | null
  industry: TechTaskMasterDataRef | null
  legalStructure: TechTaskMasterDataRef | null
}

export interface TechTaskPartner {
  partnerId: string
  partnerName: string
  partnerRole: string
  partnerContribution: string | null
}

export interface TechTaskFile {
  id: string
  projectId: string
  fileCategory: string
  fileName: string
  fileTitle: string
  fileDescription: string | null
  mimeType: string
  fileSizeBytes: number
  sortOrder: number
  createdAt: string
}

export interface TechTaskDetail {
  id: string
  projectCode: string
  projectName: string
  year: number
  opportunity: string | null
  contractName: string | null
  contractNumber: string | null
  businessUnit: TechTaskMasterDataRef | null
  projectStatus: TechTaskMasterDataRef | null
  projectManager: string | null
  accountManager: string | null
  startDate: string
  endDate: string
  totalDays: number | null
  elapsedDays: number | null
  remainingDays: number | null
  progressPercent: number | null
  isOverdue: boolean | null
  projectObjective: string | null
  projectDescription: string | null
  projectBackground: string | null
  projectChallenges: string | null
  projectSolution: string | null
  customerName: string | null
  industry: TechTaskMasterDataRef | null
  customer: TechTaskCustomer | null
  products: Array<{ id: string, name: string }>
  techStacks: TechTaskTechStackGroups
  coverImageUrl: string | null
  partners: TechTaskPartner[]
  files: TechTaskFile[]
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  valueBeforeTax: string | null
  carryOverValue: string | null
}

export interface TechTaskFilters {
  search: string
  techStackId: string
  projectStatusId: string
  year: string
}

export interface TechTaskFormValues {
  projectCode: string
  projectName: string
  year: string
  businessUnitId: string
  projectStatusId: string
  valueBeforeTax: string
  carryOverValue: string
  startDate: string
  endDate: string
  opportunity: string
  contractName: string
  contractNumber: string
  projectManager: string
  accountManager: string
  customerName: string
  projectObjective: string
  projectDescription: string
  projectBackground: string
  projectChallenges: string
  projectSolution: string
  isFeatured: boolean
  techStackIds: string[]
}

export type TechTaskFormErrors = Record<string, string | undefined>

export interface TechStackOption {
  id: string
  category: string
  name: string
}

export interface MasterDataOption {
  id: string
  code: string
  name: string
}
