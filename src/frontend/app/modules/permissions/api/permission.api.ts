import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type { PermissionItem, RoleDetailResponse, UpdateRolePayload } from '../types/types'
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

  // 2. GET /api/v1/roles/{role_id}
  async getRoleDetail(roleId: string): Promise<{
    success: boolean
    message: string
    data: RoleDetailResponse
  }> {
    const response = await apiClient.get(`${ENDPOINTS.ROLES.BASE}/${roleId}`)
    return response.data
  },

  // 3. PATCH /api/v1/roles/{role_id}
  async updateRole(
    roleId: string,
    payload: UpdateRolePayload
  ): Promise<{
    success: boolean
    message: string
    data: RoleItem
  }> {
    const response = await apiClient.patch(`${ENDPOINTS.ROLES.BASE}/${roleId}`, payload)
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
