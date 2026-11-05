<script setup lang="ts">
import { ref, onMounted } from 'vue'
import RoleManagementTable from './RoleManagementTable.vue'
import PermissionListTable from './PermissionListTable.vue'
import type { RoleTableItem, PermissionTableItem } from '../types/types'
import EditPermissionModal from './EditPermissionModal.vue'
import EditRoleModal from './EditRoleModal.vue'

import { usePermissionStore } from '../stores/permission.store'

const permissionStore = usePermissionStore()
onMounted(async () => {
  // Panggil kedua API saat halaman pertama kali dimuat
  await Promise.all([permissionStore.fetchRoles(true), permissionStore.fetchPermissions()])
})
// State Tab Aktif ('roles' atau 'permissions')
const activeTab = ref<'roles' | 'permissions'>('roles')

const isEditRoleModalOpen = ref(false)
const selectedRoleForEdit = ref<RoleTableItem | null>(null)

// State Modal Edit Permission
const isEditPermissionModalOpen = ref(false)
const selectedPermissionForEdit = ref<PermissionTableItem | null>(null)
// Saat ikon pensil di tabel permission diklik
const handleEditPermission = (permission: PermissionTableItem) => {
  selectedPermissionForEdit.value = permission
  isEditPermissionModalOpen.value = true
}
// Saat tombol Save Changes di modal diklik (sementara alert dulu)
const handleSaveEditPermission = (payload: { permissionId: string; data: any }) => {
  console.log('Save permission payload:', payload)
  alert(`Permission "${selectedPermissionForEdit.value?.name}" saved successfully (Dummy)!`)
  isEditPermissionModalOpen.value = false
}

// Saat ikon pensil di baris tabel diklik
const handleEditRole = (role: RoleTableItem) => {
  selectedRoleForEdit.value = role
  isEditRoleModalOpen.value = true
}
// Saat tombol Save Changes di modal diklik (sementara alert dulu)
const handleSaveEditRole = (payload: { roleId: string; data: any }) => {
  console.log('Save role payload:', payload)
  alert(`Role "${selectedRoleForEdit.value?.name}" saved successfully (Dummy)!`)
  isEditRoleModalOpen.value = false
}

// Handler Dummy Actions
const handleAddRole = () => {
  alert('Modal Add Role will be opened')
}

const handleViewRole = (role: RoleTableItem) => {
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

      <!-- Modal Edit Role -->
      <EditRoleModal
        :is-open="isEditRoleModalOpen"
        :role="selectedRoleForEdit"
        @close="isEditRoleModalOpen = false"
        @submit="handleSaveEditRole"
      />

      <!-- Modal Edit Permission -->
      <EditPermissionModal
        :is-open="isEditPermissionModalOpen"
        :permission="selectedPermissionForEdit"
        @close="isEditPermissionModalOpen = false"
        @submit="handleSaveEditPermission"
      />
    </div>
  </div>
</template>
