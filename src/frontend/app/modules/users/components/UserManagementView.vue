<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { UserStats, PendingUserRequest, ActiveUser, UserRole } from '../types/types'

import UsersStatsCards from './UsersStatsCards.vue'
import PendingRequestsTable from './PendingRequestsTable.vue'
import ActiveUsersTable from './ActiveUsersTable.vue'
import AssignRoleModal from './AssignRoleModal.vue'

import { useUserStore } from '../stores/user.store.ts'
import { useRoleStore } from '~/modules/roles/stores/role.store'

import type { RoleRequestItem } from '~/modules/roles/types/role.types'

const toast = useToast()
const userStore = useUserStore()
const roleStore = useRoleStore()

// State Modal Review & Assign Role
const isAssignModalOpen = ref(false)
const selectedRequestForReview = ref<RoleRequestItem | null>(null)

// 1. Saat tombol Review diklik di tabel Pending
const handleReviewRequest = (item: RoleRequestItem) => {
  selectedRequestForReview.value = item
  isAssignModalOpen.value = true
}

// 2. Saat Admin klik "Approve" pada Modal Review
const handleApproveRequest = async (payload: { requestId: string; reviewNotes: string }) => {
  try {
    const res = await roleStore.reviewRoleRequest(payload.requestId, {
      status: 'approved',
      review_notes: payload.reviewNotes || undefined
    })
    toast.add({
      title: 'Request Approved',
      description: res.message || 'Role request has been successfully approved.',
      color: 'success'
    })
    isAssignModalOpen.value = false
    // Refresh KPI Stats & Tabel Pending
    await Promise.all([
      userStore.fetchManagementStats(),
      roleStore.fetchPendingRequests(roleStore.pendingPagination.page, 10)
    ])
  } catch (err: any) {
    toast.add({
      title: 'Approval Failed',
      description: err?.response?.data?.message || err?.message || 'Failed to approve request.',
      color: 'error'
    })
  }
}

// Handler saat Admin Reject
const handleRejectRequest = async (payload: { requestId: string; reviewNotes: string }) => {
  try {
    const res = await roleStore.reviewRoleRequest(payload.requestId, {
      status: 'rejected',
      review_notes: payload.reviewNotes
    })
    toast.add({
      title: 'Request Rejected',
      description: res.message || 'Role request has been rejected.',
      color: 'success'
    })
    isAssignModalOpen.value = false
    // Refresh KPI Stats & Tabel Pending
    await Promise.all([
      userStore.fetchManagementStats(),
      roleStore.fetchPendingRequests(roleStore.pendingPagination.page, 10)
    ])
  } catch (err: any) {
    toast.add({
      title: 'Rejection Failed',
      description: err?.response?.data?.message || err?.message || 'Failed to reject request.',
      color: 'error'
    })
  }
}

// Handler saat filter/search/pagination berubah
const handleUserFilterChange = (filter: {
  search: string
  roleId: string
  isActive: string
  page: number
}) => {
  userStore.fetchUsers({
    page: filter.page,
    pageSize: 10,
    search: filter.search || undefined,
    // Jangan kirim __NO_ROLE__ ke backend karena butuh UUID
    roleId: filter.roleId && filter.roleId !== '__NO_ROLE__' ? filter.roleId : undefined,
    isActive: filter.isActive !== '' ? filter.isActive === 'true' : undefined
  })
}
const handleManageUser = (user: ActiveUser) => {
  alert(`Manage user: ${user.name} (${user.role})`)
}

const handlePageChange = (page: number) => {
  roleStore.fetchPendingRequests(page, 10)
}
onMounted(() => {
  userStore.fetchManagementStats()
  roleStore.fetchPendingRequests(1, 10)
  roleStore.fetchRoles()
  userStore.fetchUsers({ page: 1, pageSize: 10 })
})
</script>

<template>
  <div class="space-y-4 pb-10">
    <!-- Breadcrumb & Header Title -->
    <div class="space-y-1">
      <nav class="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span>Administration</span>
        <UIcon name="i-lucide-chevron-right" class="h-3 w-3 text-slate-400" />
        <span class="font-semibold text-slate-800">User Management</span>
      </nav>

      <div class="pt-1">
        <h1 class="text-xl font-bold tracking-tight text-slate-900 leading-tight">
          User Management
        </h1>
        <p class="text-xs text-slate-500">Manage internal users and their access roles.</p>
      </div>
    </div>

    <!-- 1. Top 4 KPI Cards -->
    <UsersStatsCards :stats="userStore.stats" :is-loading="userStore.isLoadingStats" />

    <!-- 2. Pending Access Requests Table -->
    <PendingRequestsTable
      :requests="roleStore.pendingRequests"
      :pagination="roleStore.pendingPagination"
      :is-loading="roleStore.isLoadingPending"
      @page-change="handlePageChange"
      @review="handleReviewRequest"
    />
    <!-- 3. Active Users Table -->
    <ActiveUsersTable
      :users="userStore.users"
      :pagination="userStore.usersPagination"
      :roles="roleStore.roles"
      :is-loading="userStore.isLoadingUsers"
      @filter-change="handleUserFilterChange"
      @manage-user="handleManageUser"
    />
    <!-- 4. Modal Popup Review Role Request (Approve & Reject) -->
    <AssignRoleModal
      :is-open="isAssignModalOpen"
      :request="selectedRequestForReview"
      :is-submitting="roleStore.isReviewing"
      @close="isAssignModalOpen = false"
      @approve="handleApproveRequest"
      @reject="handleRejectRequest"
    />
  </div>
</template>
