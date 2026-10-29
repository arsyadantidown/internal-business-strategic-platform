import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  UserManagementStatsResponse,
  UserItem,
  UserPaginationMeta,
  UserQueryParams
} from '../types/types'

export const userApi = {
  async getManagementStats(): Promise<{
    success: boolean
    message: string
    data: UserManagementStatsResponse
  }> {
    const response = await apiClient.get(ENDPOINTS.USERS.MANAGEMENT_STATS)
    return response.data
  },
  async getUsers(params?: UserQueryParams): Promise<{
    success: boolean
    message: string
    data: UserItem[]
    meta: UserPaginationMeta
  }> {
    const queryParams: Record<string, any> = {}
    if (params?.page) queryParams.page = params.page
    if (params?.pageSize) queryParams.page_size = params.pageSize
    if (params?.search) queryParams.search = params.search
    if (params?.roleId) queryParams.role_id = params.roleId
    if (typeof params?.isActive === 'boolean') queryParams.is_active = params.isActive
    const response = await apiClient.get(ENDPOINTS.USERS.BASE, {
      params: queryParams
    })
    return response.data
  }
}
