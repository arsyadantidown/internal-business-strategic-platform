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
const handleApproveUser = (user: RoleRequestItem) => {
  // Mapping role request ke UserRole sistem untuk tabel Active Users
  let mappedRole: UserRole = 'Engineer'
  const reqRole = String(user.requestedRole).toLowerCase()
  if (reqRole.includes('commercial')) {
    mappedRole = 'Commercial'
  } else if (reqRole.includes('executive')) {
    mappedRole = 'Executive'
  }

  // A. Hapus user dari list pending
  pendingRequests.value = pendingRequests.value.filter((u) => u.id !== user.id)

  // B. Masukkan ke list Active Users paling atas
  activeUsers.value.unshift({
    id: user.id,
    name: user.name,
    email: user.email,
    role: mappedRole,
    status: 'Active',
    assignedDate: 'Just now'
  })

  // C. Update counter angka KPI
  statsData.value.pendingRequests--
  statsData.value.activeUsers++

  toast.add({
    title: 'Request Approved',
    description: `${user.name} has been approved as ${mappedRole}.`,
    color: 'success'
  })
}

// 3. Saat Admin klik "Reject" pada Modal Review
const handleRejectUser = (user: PendingUserRequest) => {
  // Hapus dari pending requests
  pendingRequests.value = pendingRequests.value.filter((u) => u.id !== user.id)
  statsData.value.pendingRequests--

  toast.add({
    title: 'Request Rejected',
    description: `Request for ${user.name} has been rejected.`,
    color: 'error'
  })
}

// Data Statistik (4 Top KPI Cards)
const statsData = ref<UserStats>({
  pendingRequests: 8,
  totalUsers: 24,
  activeUsers: 16,
  inactiveUsers: 0
})

// Data Users Internal (16 Active Users)
const activeUsers = ref<ActiveUser[]>([
  {
    id: '1',
    name: 'Rizky Hidayat',
    email: 'rizky.hidayat@company.com',
    role: 'Commercial',
    status: 'Active',
    assignedDate: 'Jan 15, 2026'
  },
  {
    id: '2',
    name: 'Jessica Tan',
    email: 'jessica.tan@company.com',
    role: 'Engineer',
    status: 'Active',
    assignedDate: 'Jan 12, 2026'
  },
  {
    id: '3',
    name: 'Arief Nugroho',
    email: 'arief.nugroho@company.com',
    role: 'Executive',
    status: 'Active',
    assignedDate: 'Jan 10, 2026'
  },
  {
    id: '4',
    name: 'Putri Anggraini',
    email: 'putri.anggraini@company.com',
    role: 'Commercial',
    status: 'Active',
    assignedDate: 'Jan 8, 2026'
  },
  {
    id: '5',
    name: 'Dimas Setiawan',
    email: 'dimas.setiawan@company.com',
    role: 'Engineer',
    status: 'Active',
    assignedDate: 'Jan 5, 2026'
  },
  {
    id: '6',
    name: 'Bayu Pratama',
    email: 'bayu.pratama@company.com',
    role: 'Commercial',
    status: 'Active',
    assignedDate: 'Dec 28, 2025'
  },
  {
    id: '7',
    name: 'Cindy Aurelia',
    email: 'cindy.aurelia@company.com',
    role: 'Engineer',
    status: 'Active',
    assignedDate: 'Dec 20, 2025'
  },
  {
    id: '8',
    name: 'Farhan Ramadhan',
    email: 'farhan.ramadhan@company.com',
    role: 'Engineer',
    status: 'Active',
    assignedDate: 'Dec 15, 2025'
  },
  {
    id: '9',
    name: 'Gita Permata',
    email: 'gita.permata@company.com',
    role: 'Executive',
    status: 'Active',
    assignedDate: 'Dec 10, 2025'
  },
  {
    id: '10',
    name: 'Kevin Sanjaya',
    email: 'kevin.sanjaya@company.com',
    role: 'Commercial',
    status: 'Active',
    assignedDate: 'Dec 05, 2025'
  },
  {
    id: '11',
    name: 'Laila Rahmawati',
    email: 'laila.rahmawati@company.com',
    role: 'Engineer',
    status: 'Active',
    assignedDate: 'Nov 30, 2025'
  },
  {
    id: '12',
    name: 'Mega Utami',
    email: 'mega.utami@company.com',
    role: 'Commercial',
    status: 'Active',
    assignedDate: 'Nov 25, 2025'
  },
  {
    id: '13',
    name: 'Nadia Safitri',
    email: 'nadia.safitri@company.com',
    role: 'Engineer',
    status: 'Active',
    assignedDate: 'Nov 20, 2025'
  },
  {
    id: '14',
    name: 'Oki Pratama',
    email: 'oki.pratama@company.com',
    role: 'Engineer',
    status: 'Active',
    assignedDate: 'Nov 15, 2025'
  },
  {
    id: '15',
    name: 'Pandu Wicaksono',
    email: 'pandu.wicaksono@company.com',
    role: 'Commercial',
    status: 'Active',
    assignedDate: 'Nov 10, 2025'
  },
  {
    id: '16',
    name: 'Roland Brilianto',
    email: 'roland.brilianto@company.com',
    role: 'Executive',
    status: 'Active',
    assignedDate: 'Nov 01, 2025'
  }
])

const handleManageUser = (user: ActiveUser) => {
  alert(`Manage user: ${user.name} (${user.role})`)
}

const handleExport = () => {
  alert('Exporting data users to CSV / Excel...')
}
const handlePageChange = (page: number) => {
  roleStore.fetchPendingRequests(page, 10)
}
onMounted(() => {
  userStore.fetchManagementStats()
  roleStore.fetchPendingRequests(1, 10)
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
    <ActiveUsersTable :users="activeUsers" @manage-user="handleManageUser" @export="handleExport" />

    <!-- 4. Modal Popup Review Role Request (Approve & Reject) -->
    <AssignRoleModal
      :is-open="isAssignModalOpen"
      :request="selectedRequestForReview"
      @close="isAssignModalOpen = false"
      @approve="handleApproveRequest"
      @reject="handleRejectRequest"
    />
  </div>
</template>
