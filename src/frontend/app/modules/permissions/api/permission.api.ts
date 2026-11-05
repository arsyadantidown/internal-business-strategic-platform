import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type { PermissionItem } from '../types/types'
import type { RoleItem } from '~/modules/roles/types/role.types'

export const permissionApi = {
  // 1. GET /api/v1/roles?include_inactive=true
  async getRoles(includeInactive = true): Promise<{
    success: boolean
    message: string
    data: RoleItem[]
  }> {
    const response = await apiClient.get(ENDPOINTS.ROLES.BASE, {
      params: { include_inactive: includeInactive }
    })
    return response.data
  },

  // 4. GET /api/v1/permissions
  async getPermissions(): Promise<{
    success: boolean
    message: string
    data: PermissionItem[]
  }> {
    const response = await apiClient.get(ENDPOINTS.PERMISSIONS.BASE)
    return response.data
  }
}
