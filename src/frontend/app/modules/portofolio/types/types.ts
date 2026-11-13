export type ProjectStatus = 'On Going' | 'On Proposal' | 'Closed' | 'Canceled'

export type PortfolioOption = {
  label: string
  value: string
}

export interface ProjectItem {
  id: string
  title: string
  client: string
  description: string
  industry: string
  companySize?: string
  legalStructure?: string
  businessUnit?: string
  product?: string
  customerType?: string
  productStatus?: string
  frontendStack?: string
  backendStack?: string
  database?: string
  technologies: string[]
  status: ProjectStatus
  year?: string
  image: string
  updatedAt: string
}

export type ViewMode = 'grid' | 'table'

export interface PortfolioFilterState {
  search: string
  industry: string
  companySize: string
  legalStructure: string
  businessUnit: string
  product: string
  customerType: string
  productStatus: string
  status: string
  frontendStack: string
  backendStack: string
  database: string
  year: string
}

// --- Tambahan Khusus untuk Halaman Detail ---

export interface ProjectDocument {
  name: string
  size: string
  date: string
}

export interface RelatedPartner {
  name: string
  role: string
  tag: string
  icon?: string
}

export interface ProjectDetailItem extends ProjectItem {
  period: string
  projectValue: string
  location: string
  teamSize: string
  serviceType: string
  projectType: string
  heroImages: string[]
  overview: string
  background: string
  challenges: string[]
  solutions: string[]
  metrics: {
    label: string
    value: string
    sublabel: string
  }[]
  mediaGallery: {
    type: 'image' | 'video'
    url: string
    title: string
  }[]
  documents: ProjectDocument[]
  partners: RelatedPartner[]
  lastUpdated?: string
}

export type MasterDataType =
  | 'company-sizes'
  | 'customer-types'
  | 'industries'
  | 'legal-structures'
  | 'business-units'
  | 'project-statuses'
  | 'product-statuses'
export interface MasterDataItem {
  id: string
  code?: string
  name?: string
  description?: string | null
  sort_order?: number
  is_active?: boolean
  // Fleksibel menangani prefix backend (contoh: industry_name, company_size_name, dsb)
  [key: string]: any
}

// ==========================================
// --- API Types for GET /api/v1/projects ---
// ==========================================

export interface ProjectQueryParams {
  search?: string
  customer_name?: string
  customer_location?: string
  company_size_id?: string
  customer_type_id?: string
  industry_id?: string
  legal_structure_id?: string
  tech_stack_id?: string
  project_status_id?: string
  business_unit_id?: string
  year?: number | string
  is_featured?: boolean
  page?: number
  page_size?: number
  sort?: string
}

export interface BackendProjectItem {
  id: string
  project_code: string
  project_name: string
  year: number
  project_objective: string
  customer_name: string
  industry?: {
    id: string
    code: string
    name: string
  }
  tech_stacks?: {
    frontend?: Array<{ id: string; name: string }>
    backend?: Array<{ id: string; name: string }>
    data_storage?: Array<{ id: string; name: string }>
  }
  project_status?: {
    id: string
    code: string
    name: string
  }
  contract_name?: string
  contract_number?: string
  start_date?: string
  end_date?: string
  progress_percent?: number
  remaining_days?: number
  is_featured?: boolean
  cover_image_url?: string | null
  updated_at: string
  value_before_tax?: number
}

export interface ProjectsListResponse {
  success: boolean
  message: string
  data: {
    items: BackendProjectItem[]
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}
