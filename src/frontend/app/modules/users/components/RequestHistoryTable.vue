<script setup lang="ts">
import { ref } from 'vue'
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
  (e: 'filter-change', payload: { status?: 'approved' | 'rejected'; page: number }): void
  (e: 'view-detail', item: RoleRequestItem): void
}>()

const { formatDateTime } = useAppDate()

const selectedStatus = ref<'' | 'approved' | 'rejected'>('')

const handleStatusChange = () => {
  emit('filter-change', {
    status: selectedStatus.value || undefined,
    page: 1
  })
}

const changePage = (page: number) => {
  if (page >= 1 && page <= props.pagination.total_pages && page !== props.pagination.page) {
    emit('filter-change', {
      status: selectedStatus.value || undefined,
      page
    })
  }
}
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3.5 font-sans">
    <!-- Header & Filter -->
    <div
      class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-3"
    >
      <div>
        <h2 class="text-[15px] font-bold text-slate-900 tracking-tight">Role Request History</h2>
        <p class="text-[11px] text-slate-400">
          Past role application decisions (approved & rejected).
        </p>
      </div>

      <!-- Filter Status Dropdown -->
      <div class="flex items-center gap-2">
        <select
          v-model="selectedStatus"
          class="h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
          @change="handleStatusChange"
        >
          <option value="">All Decisions</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="border-b border-slate-100 text-[11px] font-bold text-slate-400">
          <tr>
            <th class="py-2.5 pr-4">Applicant</th>
            <th class="px-4 py-2.5">Email</th>
            <th class="px-4 py-2.5">Division</th>
            <th class="px-4 py-2.5">Target Role</th>
            <th class="px-4 py-2.5">Status</th>
            <th class="px-4 py-2.5">Reviewed By</th>
            <th class="px-4 py-2.5">Reviewed Date</th>
            <th class="py-2.5 pl-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          <!-- Loading -->
          <tr v-if="isLoading">
            <td colspan="8" class="py-10 text-center text-xs text-slate-400">
              <UIcon
                name="i-lucide-loader-2"
                class="mx-auto h-5 w-5 animate-spin text-blue-500 mb-2"
              />
              Loading history...
            </td>
          </tr>

          <!-- Data -->
          <template v-else-if="requests.length > 0">
            <tr
              v-for="item in requests"
              :key="item.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="py-2.5 pr-4 whitespace-nowrap font-bold text-slate-900">
                {{ item.requester_name }}
              </td>
              <td class="px-4 py-2.5 whitespace-nowrap text-slate-500">
                {{ item.requester_email }}
              </td>
              <td class="px-4 py-2.5 whitespace-nowrap text-slate-600">
                {{ item.division_name }}
              </td>
              <td class="px-4 py-2.5 whitespace-nowrap font-semibold text-slate-800">
                {{ item.role_name }}
              </td>
              <td class="px-4 py-2.5 whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize"
                  :class="
                    item.status === 'approved'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  "
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="px-4 py-2.5 whitespace-nowrap text-slate-600">
                {{ item.reviewer_name || 'Super Admin' }}
              </td>
              <td class="px-4 py-2.5 whitespace-nowrap text-slate-400 text-[11px]">
                {{ formatDateTime(item.reviewed_at || item.updated_at) }}
              </td>
              <td class="py-2.5 pl-4 text-right whitespace-nowrap">
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                  @click="emit('view-detail', item)"
                >
                  Details
                </button>
              </td>
            </tr>
          </template>

          <tr v-else>
            <td colspan="8" class="py-8 text-center text-xs text-slate-400">
              No review history records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
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
