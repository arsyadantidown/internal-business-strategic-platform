<script setup lang="ts">
import { computed } from 'vue'
import type {
  Notification,
  NotificationFilterTab,
  NotificationTypeFilter
} from '../types/notification.types'
import { useNotifications } from '../composables/useNotifications'
import NotificationsPageHeader from './NotificationsPageHeader.vue'
import NotificationItem from './NotificationItem.vue'
import NotificationsEmptyState from './NotificationsEmptyState.vue'
import NotificationsPagination from './NotificationsPagination.vue'

const {
  filters,
  currentPage,
  pageSize,
  totalCount,
  unreadCount,
  readCount,
  filteredNotifications,
  paginatedNotifications,
  setPage,
  setPageSize,
  resetFilters,
  markAsRead,
  markAllAsRead,
  formatRelativeTime,
  formatFullDateTime,
  formatFullDate
} = useNotifications()

const tabs = computed<{ key: NotificationFilterTab, label: string, count: number }[]>(() => [
  { key: 'all', label: 'All', count: totalCount.value },
  { key: 'unread', label: 'Unread', count: unreadCount.value },
  { key: 'read', label: 'Read', count: readCount.value }
])

const typeOptions: { label: string, value: NotificationTypeFilter }[] = [
  { label: 'All types', value: 'all' },
  { label: 'Partner verification', value: 'partner-verification' },
  { label: 'Status update', value: 'status-update' },
  { label: 'Contract expiry', value: 'contract-expiry' }
]

const isFilterActive = computed(() => filters.value.tab !== 'all' || filters.value.type !== 'all')

const handleTabChange = (tab: NotificationFilterTab) => {
  filters.value = { ...filters.value, tab }
}

const handleTypeChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as NotificationTypeFilter
  filters.value = { ...filters.value, type: value }
}

const handleOpen = (notification: Notification) => {
  markAsRead(notification.id)
  navigateTo(`/partnership/${notification.partnerId}`)
}
</script>

<template>
  <div class="space-y-1 lg:-mx-6 lg:-my-6 lg:px-3">
    <NotificationsPageHeader
      :unread-count="unreadCount"
      @mark-all-read="markAllAsRead"
    />

    <section class="rounded-lg border border-slate-200/80 bg-white p-1.5 shadow-xs">
      <div class="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="inline-flex h-7.5 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition-colors cursor-pointer"
            :class="
              filters.tab === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            "
            @click="handleTabChange(tab.key)"
          >
            <span>{{ tab.label }}</span>
            <span
              class="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
              :class="filters.tab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <div class="relative">
            <UIcon
              name="i-lucide-filter"
              class="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
            <select
              :value="filters.type"
              class="h-7.5 rounded-lg border border-slate-200 bg-white pr-2.5 pl-7.5 text-[11px] font-semibold text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
              @change="handleTypeChange"
            >
              <option
                v-for="option in typeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <button
            type="button"
            class="inline-flex h-7.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            :disabled="!isFilterActive"
            @click="resetFilters"
          >
            <UIcon
              name="i-lucide-rotate-ccw"
              class="h-3.5 w-3.5 text-slate-500"
            />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </section>

    <div
      v-if="paginatedNotifications.length > 0"
      class="space-y-1.5"
    >
      <NotificationItem
        v-for="notification in paginatedNotifications"
        :key="notification.id"
        :notification="notification"
        :relative-time="formatRelativeTime(notification.createdAt)"
        :full-date="formatFullDateTime(notification.createdAt)"
        :contract-date="notification.contractExpiry ? formatFullDate(notification.contractExpiry.contractEndDate) : ''"
        @open="handleOpen"
      />
    </div>

    <NotificationsEmptyState
      v-else
      @reset="resetFilters"
    />

    <NotificationsPagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total-items="filteredNotifications.length"
      @update:current-page="setPage"
      @update:page-size="setPageSize"
    />
  </div>
</template>
