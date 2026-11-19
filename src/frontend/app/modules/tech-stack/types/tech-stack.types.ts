export type TechStackCategory = 'frontend' | 'backend' | 'data_storage'

export interface TechStackItem {
  id: string
  name: string
  category: TechStackCategory
  isActive: boolean
}

export interface TechStackRawItem {
  id: string
  tech_stack_category: TechStackCategory
  tech_stack_name: string
  is_active: boolean
}

export interface TechStackCreatePayload {
  tech_stack_category: TechStackCategory
  tech_stack_name: string
}

export interface TechStackUpdatePayload {
  tech_stack_category?: TechStackCategory
  tech_stack_name?: string
  is_active?: boolean
}

export interface TechStackFormValues {
  name: string
  category: TechStackCategory
  isActive: boolean
}

export interface TechStackFormErrors {
  name?: string
  category?: string
}

export interface TechStackFilterParams {
  search?: string
  category?: TechStackCategory | ''
  status?: 'active' | 'inactive' | ''
}
