export interface DashboardStatusCountItem {
  id?: string
  code: string
  name: string
  count: number
}

export interface DashboardSummaryData {
  total_projects: number
  active_projects: number
  total_value_before_tax: number
  total_revenue: number
  total_net_profit: number
  status_counts: DashboardStatusCountItem[]
}

export interface DashboardSummaryResponse {
  success: boolean
  message: string
  data: DashboardSummaryData
  meta?: any
}

export interface DashboardFilterParams {
  search?: string
  is_featured?: boolean
  industry_id?: string
  project_status_id?: string
  year?: number | string
  company_size_id?: string
  product_id?: string
  legal_structure_id?: string
  business_unit_id?: string
  customer_type_id?: string
  frontend_tech_stack_id?: string
  backend_tech_stack_id?: string
  database_tech_stack_id?: string
}

export interface DashboardBusinessUnitItem {
  id?: string
  code: string
  name: string
  project_count: number
  total_value_before_tax: number
}

export interface DashboardBusinessUnitResponse {
  success: boolean
  message: string
  data: DashboardBusinessUnitItem[]
  meta?: any
}
export interface DashboardIndustryItem {
  id?: string
  code: string
  name: string
  project_count: number
  total_value_before_tax: number
}

export interface DashboardIndustryResponse {
  success: boolean
  message: string
  data: DashboardIndustryItem[]
  meta?: any
}
