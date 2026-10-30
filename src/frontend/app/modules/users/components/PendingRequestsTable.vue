<script setup lang="ts">
import type { RoleRequestItem, ApiPagination } from '~/modules/roles/types/role.types'

interface Props {
  requests: RoleRequestItem[]
  pagination: ApiPagination
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  requests: () => [],
  isLoading: false
})

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'review', item: RoleRequestItem): void
}>()

const { formatDateTime } = useAppDate()

const changePage = (page: number) => {
  if (page >= 1 && page <= props.pagination.total_pages && page !== props.pagination.page) {
    emit('page-change', page)
  }
}

const getRoleBadgeClass = (role?: string) => {
  const r = String(role || '').toLowerCase()
  if (r.includes('engineer')) return 'bg-[#e8f2fe] text-[#2563eb]'
  if (r.includes('commercial')) return 'bg-[#f3e8ff] text-[#9333ea]'
  return 'bg-[#fef3c7] text-[#b45309]'
}
</script>

<template>
  <div class="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 font-sans">
    <!-- 1. Header Card & Controls -->
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 class="text-[15px] font-bold text-slate-900 tracking-tight">Pending Access Requests</h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Users who have requested access to the platform and waiting for approval.
        </p>
      </div>

      <!-- Controls: Search & Date Filter persis gambar -->
      <!-- <div class="flex items-center gap-2.5">
        <div class="relative w-64 sm:w-72">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
          >
            <UIcon name="i-lucide-search" class="h-4 w-4" />
          </div>
          <input
            v-model="search"
            type="text"
            placeholder="Search name, email, or division..."
            class="h-9 w-full rounded-lg border border-slate-200 bg-white py-1 pr-3 pl-9 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
        >
          <UIcon name="i-lucide-calendar" class="h-4 w-4 text-slate-500" />
          <span>Filter by Date</span>
          <UIcon name="i-lucide-chevron-down" class="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div> -->
    </div>

    <!-- 2. Table Data (6 Kolom: Name, Email, Division, Requested Role, Request Date, Status, Actions) -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="border-b border-slate-100 text-xs font-semibold text-slate-900">
          <tr>
            <th class="py-3 pr-4 font-semibold">Name</th>
            <th class="px-4 py-3 font-semibold">Email</th>
            <th class="px-4 py-3 font-semibold">Division</th>
            <th class="px-4 py-3 font-semibold">Requested Role</th>
            <th class="px-4 py-3 font-semibold">
              <div class="inline-flex items-center gap-1.5 cursor-pointer">
                <span>Request Date</span>
                <UIcon name="i-lucide-chevrons-up-down" class="h-3.5 w-3.5 text-blue-600" />
              </div>
            </th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="py-3 pl-4 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-xs">
          <!-- Loading State Sederhana -->
          <tr v-if="isLoading">
            <td colspan="7" class="py-10 text-center text-xs text-slate-400">
              <UIcon
                name="i-lucide-loader-2"
                class="mx-auto h-5 w-5 animate-spin text-blue-500 mb-2"
              />
              Loading requests...
            </td>
          </tr>

          <!-- Data Baris -->
          <template v-else-if="requests.length > 0">
            <tr
              v-for="item in requests"
              :key="item.id"
              class="hover:bg-slate-50/50 transition-colors"
            >
              <td class="py-3.5 pr-4 whitespace-nowrap font-semibold text-slate-900">
                {{ item.requester_name }}
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-[#4b6b94]">
                {{ item.requester_email }}
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-slate-600">
                {{ item.division_name }}
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium"
                  :class="getRoleBadgeClass(item.role_name)"
                >
                  {{ item.role_name }}
                </span>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-slate-600">
                {{ formatDateTime(item.created_at) }}
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-md bg-[#fef3c7] px-2.5 py-1 text-[11px] font-medium text-[#b45309] capitalize"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="py-3.5 pl-4 text-center whitespace-nowrap">
                <button
                  type="button"
                  class="inline-flex h-8 items-center justify-center rounded-lg border border-blue-400 bg-white px-5 text-xs font-medium text-blue-600 shadow-2xs transition-all hover:bg-blue-50 cursor-pointer"
                  @click="emit('review', item)"
                >
                  Review
                </button>
              </td>
            </tr>
          </template>

          <tr v-else>
            <td colspan="7" class="py-8 text-center text-xs text-slate-400">
              No pending access requests found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 3. Bottom Pagination -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
      <p class="text-xs text-slate-500">
        Showing
        <span class="font-medium">
          {{ pagination.total ? (pagination.page - 1) * pagination.page_size + 1 : 0 }}
        </span>
        to
        <span class="font-medium">
          {{ Math.min(pagination.page * pagination.page_size, pagination.total) }}
        </span>
        of
        <span class="font-medium">{{ pagination.total }}</span>
        results
      </p>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          :disabled="pagination.page <= 1"
          @click="changePage(pagination.page - 1)"
        >
          <UIcon name="i-lucide-chevron-left" class="h-3.5 w-3.5" />
        </button>

        <button
          v-for="p in pagination.total_pages"
          :key="p"
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium cursor-pointer"
          :class="[
            pagination.page === p
              ? 'border border-blue-400 bg-[#e8f2fe] text-[#2563eb]'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          ]"
          @click="changePage(p)"
        >
          {{ p }}
        </button>

        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          :disabled="pagination.page >= pagination.total_pages"
          @click="changePage(pagination.page + 1)"
        >
          <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
