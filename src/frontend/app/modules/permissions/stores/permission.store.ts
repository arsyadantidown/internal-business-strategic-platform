import { defineStore } from 'pinia'
import { ref } from 'vue'
import { permissionApi } from '../api/permission.api'
import type { PermissionItem } from '../types/types'
import type { RoleItem } from '~/modules/roles/types/role.types'

export const usePermissionStore = defineStore('permission', () => {
  // State Roles (termasuk inactive)
  const roles = ref<RoleItem[]>([])
  const isLoadingRoles = ref(false)

  // State Permissions
  const permissions = ref<PermissionItem[]>([])
  const isLoadingPermissions = ref(false)

  // 1. Fetch all roles
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

  // 4. Fetch all permissions
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
    fetchPermissions
  }
})
