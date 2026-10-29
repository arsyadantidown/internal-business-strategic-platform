// Shared Meta Pagination untuk User API
export interface UserPaginationMeta {
  page: number
  page_size: number
  total: number
  total_pages: number
}

// User item dari GET /api/v1/users (Active Users Table)
export interface UserItem {
  id: string
  email: string
  full_name: string
  role_id: string | null
  role_name: string | null
  is_active: boolean
  email_verified_at: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

// Query parameters untuk GET /api/v1/users
export interface UserQueryParams {
  page?: number
  pageSize?: number
  search?: string
  roleId?: string
  isActive?: boolean
}

// Top KPI Cards (CamelCase untuk Frontend)
export interface UserStats {
  pendingRequests: number
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
}

// Response dari GET /api/v1/users/management-stats (SnakeCase dari Backend)
export interface UserManagementStatsResponse {
  pending_requests: number
  total_users: number
  active_users: number
  inactive_users: number
}
