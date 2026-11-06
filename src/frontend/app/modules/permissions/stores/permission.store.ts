import { defineStore } from 'pinia'
import { ref } from 'vue'
import { permissionApi } from '../api/permission.api'
import type { PermissionItem, RoleDetailResponse, UpdateRolePayload } from '../types/types'
import type { RoleItem } from '~/modules/roles/types/role.types'

export const usePermissionStore = defineStore('permission', () => {
  const roles = ref<RoleItem[]>([])
  const isLoadingRoles = ref(false)

  const permissions = ref<PermissionItem[]>([])
  const isLoadingPermissions = ref(false)

  // Loading state modal edit
  const isFetchingDetail = ref(false)
  const isUpdatingRole = ref(false)

  const fetchRoles = async (includeInactive = true) => {
    isLoadingRoles.value = true
    try {
      const res = await permissionApi.getRoles(includeInactive)
      roles.value = res.data || []
      return roles.value
    } catch (err) {
      console.error('Failed to fetch roles:', err)
      throw err
    } finally {
      isLoadingRoles.value = false
    }
  }

  // 2. Fetch Detail Role
  const fetchRoleDetail = async (roleId: string) => {
    isFetchingDetail.value = true
    try {
      const res = await permissionApi.getRoleDetail(roleId)
      return res.data
    } catch (err) {
      console.error('Failed to fetch role detail:', err)
      throw err
    } finally {
      isFetchingDetail.value = false
    }
  }

  // 3. Update Role
  const updateRole = async (roleId: string, payload: UpdateRolePayload) => {
    isUpdatingRole.value = true
    try {
      const res = await permissionApi.updateRole(roleId, payload)
      // Perbarui item di list tabel lokal jika ada
      const index = roles.value.findIndex((r) => r.id === roleId)
      if (index !== -1 && res.data) {
        roles.value[index] = { ...roles.value[index], ...res.data }
      }
      return res
    } catch (err) {
      console.error('Failed to update role:', err)
      throw err
    } finally {
      isUpdatingRole.value = false
    }
  }

  const fetchPermissions = async () => {
    isLoadingPermissions.value = true
    try {
      const res = await permissionApi.getPermissions()
      permissions.value = res.data || []
      return permissions.value
    } catch (err) {
      console.error('Failed to fetch permissions:', err)
      throw err
    } finally {
      isLoadingPermissions.value = false
    }
  }

  return {
    roles,
    isLoadingRoles,
    fetchRoles,
    permissions,
    isLoadingPermissions,
    fetchPermissions,
    isFetchingDetail,
    isUpdatingRole,
    fetchRoleDetail,
    updateRole
  }
})
