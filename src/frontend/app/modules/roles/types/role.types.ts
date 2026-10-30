export interface RoleItem {
  id: string
  name: string
  code: string
  description: string
  is_active: boolean
}

export interface CreateRoleRequestPayload {
  division_id: string
  requested_role_id: string
  reason: string
}
export interface RoleRequestItem {
  id: string
  user_id: string
  requester_name: string
  requester_email: string
  requested_role_id: string
  division_id: string
  role_name: string
  division_name: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewer_name: string | null
  reviewer_email: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
}
export interface ApiPagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface RoleRequestQueryParams {
  status?: 'pending' | 'approved' | 'rejected'
  page?: number
  pageSize?: number // di frontend kita pakai camelCase
}

export interface ReviewRoleRequestPayload {
  status: 'approved' | 'rejected'
  review_notes?: string
}
