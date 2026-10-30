<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { UserItem, UserPaginationMeta } from '../types/types'
import type { RoleItem } from '~/modules/roles/types/role.types'

interface Props {
  users: UserItem[]
  pagination: UserPaginationMeta
  roles?: RoleItem[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  users: () => [],
  roles: () => [],
  isLoading: false
})

const emit = defineEmits<{
  (
    e: 'filter-change',
    filter: { search: string; roleId: string; isActive: string; page: number }
  ): void
  (e: 'edit', user: UserItem): void
  (e: 'delete', user: UserItem): void
}>()

const getActionItems = (user: UserItem) => [
  [
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect: () => emit('edit', user)
    },
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => emit('delete', user)
    }
  ]
]

// State untuk dropdown action per baris user

const { formatDateTime } = useAppDate()

const search = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
let searchTimeout: any = null

const triggerFilterChange = (newPage = 1) => {
  emit('filter-change', {
    search: search.value.trim(),
    roleId: selectedRole.value,
    isActive: selectedStatus.value,
    page: newPage
  })
}
// Filter tampilan users
const displayedUsers = computed(() => {
  if (selectedRole.value === '__NO_ROLE__') {
    return props.users.filter((u) => !u.role_id || !u.role_name)
  }
  return props.users
})
// Debounce search 350ms agar tidak spam request saat mengetik
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    triggerFilterChange(1)
  }, 350)
})

watch([selectedRole, selectedStatus], () => {
  triggerFilterChange(1)
})

const changePage = (page: number) => {
  if (page >= 1 && page <= props.pagination.total_pages && page !== props.pagination.page) {
    triggerFilterChange(page)
  }
}

// Helper warna badge role
const getRoleBadgeClass = (roleName?: string | null) => {
  const r = String(roleName || '').toLowerCase()
  if (r.includes('commercial')) {
    return 'bg-purple-50 text-purple-700 border-purple-200'
  }
  if (r.includes('engineer')) {
    return 'bg-blue-50 text-blue-700 border-blue-200'
  }
  if (r.includes('executive') || r.includes('admin')) {
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }
  return 'bg-slate-50 text-slate-700 border-slate-200'
}
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3.5 font-sans">
    <!-- 1. Header Card & Controls -->
    <div
      class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-3"
    >
      <div>
        <h2 class="text-xs font-bold text-slate-900 tracking-tight">Users</h2>
        <p class="text-[11px] text-slate-400">List of users with assigned roles.</p>
      </div>

      <!-- Controls: Search, Role Filter, Status Filter (Export dihapus) -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Search Input -->
        <div class="relative w-52 sm:w-60">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400"
          >
            <UIcon name="i-lucide-search" class="h-3.5 w-3.5" />
          </div>
          <input
            v-model="search"
            type="text"
            placeholder="Search name or email..."
            class="h-8.5 w-full rounded-lg border border-slate-200 bg-white py-1 pr-3 pl-8 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <!-- Filter by Role -->
        <select
          v-model="selectedRole"
          class="h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
        >
          <option value="">Filter by Role</option>
          <option value="__NO_ROLE__">No Role Assigned</option>
          <option v-for="role in roles" :key="role.id" :value="role.id">
            {{ role.name }}
          </option>
        </select>

        <!-- Filter by Status -->
        <select
          v-model="selectedStatus"
          class="h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
        >
          <option value="">Filter by Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
    </div>

    <!-- 2. Table Data -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="border-b border-slate-100 text-[11px] font-bold text-slate-400">
          <tr>
            <th class="py-2.5 pr-4">Name</th>
            <th class="px-4 py-2.5">Email</th>
            <th class="px-4 py-2.5">Role</th>
            <th class="px-4 py-2.5">Status</th>
            <th class="px-4 py-2.5">Last Login</th>
            <th class="py-2.5 pl-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          <!-- Loading indicator -->
          <tr v-if="isLoading">
            <td colspan="6" class="py-10 text-center text-xs text-slate-400">
              <UIcon
                name="i-lucide-loader-2"
                class="mx-auto h-5 w-5 animate-spin text-blue-500 mb-2"
              />
              Loading users...
            </td>
          </tr>

          <!-- Data Users -->
          <template v-else-if="users.length > 0">
            <tr
              v-for="item in displayedUsers"
              :key="item.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <!-- Name -->
              <td class="py-2.5 pr-4 whitespace-nowrap font-bold text-slate-900">
                {{ item.full_name }}
              </td>

              <!-- Email -->
              <td class="px-4 py-2.5 whitespace-nowrap text-slate-500">
                {{ item.email }}
              </td>

              <!-- Role Badge -->
              <td class="px-4 py-2.5 whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-semibold"
                  :class="getRoleBadgeClass(item.role_name)"
                >
                  {{ item.role_name || 'Belum Memiliki Role' }}
                </span>
              </td>

              <!-- Status Badge -->
              <td class="px-4 py-2.5 whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-full border px-2 py-0.2 text-[10px] font-semibold"
                  :class="
                    item.is_active
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-100 text-slate-600'
                  "
                >
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Assigned Date -->
              <td class="px-4 py-2.5 whitespace-nowrap text-slate-400 text-[11px]">
                {{ formatDateTime(item.last_login_at) }}
              </td>

              <!-- Actions -->
              <td class="py-2.5 pl-4 text-right whitespace-nowrap">
                <UDropdownMenu :items="getActionItems(item)" :content="{ align: 'end' }">
                  <button
                    type="button"
                    class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    aria-label="User actions"
                  >
                    <UIcon name="i-lucide-ellipsis-vertical" class="h-4 w-4" />
                  </button>
                </UDropdownMenu>
              </td>
            </tr>
          </template>

          <tr v-else>
            <td colspan="6" class="py-8 text-center text-xs text-slate-400">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 3. Bottom Pagination -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
      <p class="text-[11px] text-slate-400">
        Showing
        <span class="font-bold text-slate-700">
          {{ pagination.total ? (pagination.page - 1) * pagination.page_size + 1 : 0 }}
        </span>
        to
        <span class="font-bold text-slate-700">
          {{ Math.min(pagination.page * pagination.page_size, pagination.total) }}
        </span>
        of
        <span class="font-bold text-slate-700">{{ pagination.total }}</span>
        results
      </p>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          :disabled="pagination.page <= 1"
          @click="changePage(pagination.page - 1)"
        >
          <UIcon name="i-lucide-chevron-left" class="h-3 w-3" />
        </button>

        <button
          v-for="p in pagination.total_pages"
          :key="p"
          type="button"
          class="flex h-6.5 w-6.5 items-center justify-center rounded-md text-[11px] font-bold cursor-pointer"
          :class="[
            pagination.page === p
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
          ]"
          @click="changePage(p)"
        >
          {{ p }}
        </button>

        <button
          type="button"
          class="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          :disabled="pagination.page >= pagination.total_pages"
          @click="changePage(pagination.page + 1)"
        >
          <UIcon name="i-lucide-chevron-right" class="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>
</template>
