<script setup lang="ts">
import { ref, onMounted } from 'vue'
import RoleManagementTable from './RoleManagementTable.vue'
import PermissionListTable from './PermissionListTable.vue'
import type { RoleItem } from '~/modules/roles/types/role.types'
import type {
  PermissionItem,
  UpdateRolePayload,
  UpdatePermissionPayload,
  CreateRolePayload
} from '../types/types'
import EditPermissionModal from './EditPermissionModal.vue'
import EditRoleModal from './EditRoleModal.vue'
import AddRoleModal from './AddRoleModal.vue'

import { usePermissionStore } from '../stores/permission.store'

const toast = useToast()
const permissionStore = usePermissionStore()
onMounted(async () => {
  // Panggil kedua API saat halaman pertama kali dimuat
  await Promise.all([permissionStore.fetchRoles(true), permissionStore.fetchPermissions()])
})
// State Tab Aktif ('roles' atau 'permissions')
const activeTab = ref<'roles' | 'permissions'>('roles')
const isAddRoleModalOpen = ref(false)
const isEditRoleModalOpen = ref(false)
const selectedRoleForEdit = ref<RoleItem | null>(null)

// State Modal Edit Permission
const isEditPermissionModalOpen = ref(false)
const selectedPermissionForEdit = ref<PermissionItem | null>(null)
// Saat ikon pensil di tabel permission diklik
const handleEditPermission = (permission: PermissionItem) => {
  selectedPermissionForEdit.value = permission
  isEditPermissionModalOpen.value = true
}
// Saat tombol Save Changes di modal diklik (sementara alert dulu)
const handleSaveEditPermission = async (payload: {
  permissionId: string
  data: UpdatePermissionPayload
}) => {
  try {
    const res = await permissionStore.updatePermission(payload.permissionId, payload.data)
    toast.add({
      title: 'Permission Updated',
      description: res.message || 'Permission has been successfully updated.',
      color: 'success'
    })
    isEditPermissionModalOpen.value = false
    // Refresh daftar permission dari server untuk sinkronisasi penuh
    await permissionStore.fetchPermissions()
  } catch (err: any) {
    toast.add({
      title: 'Update Failed',
      description: err?.response?.data?.message || err?.message || 'Failed to update permission.',
      color: 'error'
    })
  }
}
// 1. Saat tombol pensil diklik -> panggil API Detail Role (No. 2)
const handleEditRole = async (role: RoleItem) => {
  try {
    const detail = await permissionStore.fetchRoleDetail(role.id)
    selectedRoleForEdit.value = detail || role
    isEditRoleModalOpen.value = true
  } catch (err: any) {
    toast.add({
      title: 'Failed to Fetch Role',
      description: err?.response?.data?.message || err?.message || 'Could not load role details.',
      color: 'error'
    })
  }
}
// 2. Saat klik Save Changes di modal -> panggil API Patch Role (No. 3)
const handleSaveEditRole = async (payload: { roleId: string; data: UpdateRolePayload }) => {
  try {
    const res = await permissionStore.updateRole(payload.roleId, payload.data)
    toast.add({
      title: 'Role Updated',
      description: res.message || 'Role has been successfully updated.',
      color: 'success'
    })
    isEditRoleModalOpen.value = false
    // Refresh daftar roles
    await permissionStore.fetchRoles(true)
  } catch (err: any) {
    toast.add({
      title: 'Update Failed',
      description: err?.response?.data?.message || err?.message || 'Failed to update role.',
      color: 'error'
    })
  }
}

// Handler Actions
const handleAddRole = () => {
  isAddRoleModalOpen.value = true
}
const handleSaveAddRole = async (payload: CreateRolePayload) => {
  try {
    const res = await permissionStore.createRole(payload)
    toast.add({
      title: 'Role Created',
      description: res.message || 'Role has been successfully created.',
      color: 'success'
    })
    isAddRoleModalOpen.value = false
    // Refresh list role dari server
    await permissionStore.fetchRoles(true)
  } catch (err: any) {
    toast.add({
      title: 'Creation Failed',
      description: err?.response?.data?.message || err?.message || 'Failed to create role.',
      color: 'error'
    })
  }
}

const handleViewRole = (role: RoleItem) => {
  navigateTo(`/admin/permission/roles/${role.id}`)
}

const handleAddPermission = () => {
  alert('Modal Add Permission will be opened')
}
</script>

<template>
  <div class="space-y-4 pb-10 font-sans">
    <!-- Breadcrumb & Header Title -->
    <div class="space-y-1">
      <nav class="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span>Administration</span>
        <UIcon name="i-lucide-chevron-right" class="h-3 w-3 text-slate-400" />
        <span class="font-semibold text-slate-800">Permission</span>
      </nav>

      <div class="pt-1">
        <h1 class="text-xl font-bold tracking-tight text-slate-900 leading-tight">Permission</h1>
        <p class="text-xs text-slate-500">
          Manage roles and permissions to control access across the platform.
        </p>
      </div>
    </div>

    <!-- Tab Switcher (Roles & Permissions) -->
    <div class="flex items-center gap-2 border-b border-slate-200">
      <!-- Tab 1: Roles -->
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer"
        :class="[
          activeTab === 'roles'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
        ]"
        @click="activeTab = 'roles'"
      >
        <UIcon name="i-lucide-users" class="h-4 w-4" />
        <span>Roles</span>
      </button>

      <!-- Tab 2: Permissions -->
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer"
        :class="[
          activeTab === 'permissions'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
        ]"
        @click="activeTab = 'permissions'"
      >
        <UIcon name="i-lucide-layers" class="h-4 w-4" />
        <span>Permissions</span>
      </button>
    </div>

    <!-- Content Sesuai Tab Aktif -->
    <div class="pt-1">
      <!-- TAB 1: ROLES TABLE -->
      <RoleManagementTable
        v-if="activeTab === 'roles'"
        :roles="permissionStore.roles"
        :is-loading="permissionStore.isLoadingRoles"
        @add-role="handleAddRole"
        @view-role="handleViewRole"
        @edit-role="handleEditRole"
      />

      <!-- TAB 2: PERMISSIONS TABLE -->
      <PermissionListTable
        v-else-if="activeTab === 'permissions'"
        :permissions="permissionStore.permissions"
        :is-loading="permissionStore.isLoadingPermissions"
        @add-permission="handleAddPermission"
        @edit-permission="handleEditPermission"
      />

      <EditRoleModal
        :is-open="isEditRoleModalOpen"
        :role="selectedRoleForEdit"
        :is-submitting="permissionStore.isUpdatingRole"
        @close="isEditRoleModalOpen = false"
        @submit="handleSaveEditRole"
      />

      <!-- Modal Edit Permission -->
      <EditPermissionModal
        :is-open="isEditPermissionModalOpen"
        :permission="selectedPermissionForEdit"
        :is-submitting="permissionStore.isUpdatingPermission"
        @close="isEditPermissionModalOpen = false"
        @submit="handleSaveEditPermission"
      />
      <!-- Modal Add Role -->
      <AddRoleModal
        :is-open="isAddRoleModalOpen"
        :is-submitting="permissionStore.isCreatingRole"
        @close="isAddRoleModalOpen = false"
        @submit="handleSaveAddRole"
      />
    </div>
  </div>
</template>
