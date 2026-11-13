export type PartnerRole = 'principal' | 'vendor'
export type FileCategory = 'image' | 'video' | 'document' | 'case_study'

// 1. Nested Customer Input
export interface CustomerInput {
  customer_name: string
  customer_location?: string | null
  annual_revenue?: string | null
  company_size_id?: string | null
  customer_type_id?: string | null
  industry_id?: string | null
  legal_structure_id?: string | null
}

// 2. Nested Financial Input
export interface FinancialInput {
  cogs: number
  operational_cost: number
}

// 3. Nested Success Metric Input
export interface SuccessMetricInput {
  success_metric_value: string
  success_metric_label: string
  sort_order: number
}

// 4. Nested Partner Input
export interface ProjectPartnerInput {
  partner_id: string
  partner_role: PartnerRole
  partner_contribution?: string | null
}

// 5. Payload Utama POST /api/v1/projects
export interface ProjectCreatePayload {
  project_code: string
  opportunity?: string | null
  project_name: string
  year: number
  contract_name?: string | null
  contract_number?: string | null
  business_unit_id: string
  project_status_id: string
  value_before_tax: number
  carry_over_value?: number | null
  project_manager?: string | null
  account_manager?: string | null
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  project_objective?: string | null
  project_description?: string | null
  project_background?: string | null
  project_challenges?: string | null
  project_solution?: string | null
  is_featured: boolean
  customer: CustomerInput
  financial: FinancialInput
  product_ids: string[]
  tech_stack_ids: string[]
  partners: ProjectPartnerInput[]
  success_metrics: SuccessMetricInput[]
}

// 6. Respon dari Create Project
export interface ProjectCreatedResponse {
  id: string
  project_code: string
  project_name: string
  [key: string]: any
}

// 7. State File Lokal Sebelum Diupload
export interface LocalProjectFile {
  file: File
  category: FileCategory
  title?: string
  description?: string
  sort_order?: number
  previewUrl?: string
}
