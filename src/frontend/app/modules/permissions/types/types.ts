import type { RoleItem } from '~/modules/roles/types/role.types'

export interface PermissionItem {
  id: string
  code: string
  name: string
  description: string
}

// Respon dari GET /api/v1/roles/{role_id}
export interface RoleDetailResponse extends RoleItem {
  permissions: PermissionItem[]
}

// Body untuk PATCH /api/v1/roles/{role_id} (API No. 3)
export interface UpdateRolePayload {
  name?: string
  description?: string
  is_active?: boolean
}

// Body untuk PATCH /api/v1/permissions/{permission_id} (API No. 6)
export interface UpdatePermissionPayload {
  name?: string
  description?: string
}

// Body untuk PUT /api/v1/roles/{role_id}/permissions (API No. 5)
export interface SetRolePermissionsPayload {
  permission_ids: string[]
}

export interface CreateRolePayload {
  name: string
  code: string
  description?: string
}
