import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  PermissionItem,
  RoleDetailResponse,
  UpdateRolePayload,
  UpdatePermissionPayload,
  SetRolePermissionsPayload,
  CreateRolePayload
} from '../types/types'
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
  },

  // 5. PUT /api/v1/roles/{role_id}/permissions
  async setRolePermissions(
    roleId: string,
    payload: SetRolePermissionsPayload
  ): Promise<{
    success: boolean
    message: string
    data: {
      role_id: string
      permission_ids: string[]
    }
  }> {
    const response = await apiClient.put(`${ENDPOINTS.ROLES.BASE}/${roleId}/permissions`, payload)
    return response.data
  },

  async updatePermission(
    permissionId: string,
    payload: UpdatePermissionPayload
  ): Promise<{
    success: boolean
    message: string
    data: PermissionItem
  }> {
    const response = await apiClient.patch(`${ENDPOINTS.PERMISSIONS.BASE}/${permissionId}`, payload)
    return response.data
  },

  async createRole(payload: CreateRolePayload): Promise<{
    success: boolean
    message: string
    data: RoleItem
  }> {
    const response = await apiClient.post(ENDPOINTS.ROLES.BASE, payload)
    return response.data
  }
}
