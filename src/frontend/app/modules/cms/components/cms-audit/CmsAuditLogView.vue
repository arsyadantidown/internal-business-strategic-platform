<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  CmsActivityKind,
  CmsActivityType
} from '../../types/cms.types'
import { useCmsAuditTrail } from '../../composables/useCmsAuditTrail'
import { downloadCmsCsv } from '../../utils/cmsExport'
import { formatCmsDateTime } from '../../utils/cmsFormat'

type AuditTypeStyle = {
  label: string
  icon: string
  className: string
}

type AuditKindStyle = {
  label: string
  className: string
}

const toast = useToast()
const { activities, addActivity } = useCmsAuditTrail()

const search = ref('')
const kindFilter = ref<'all' | CmsActivityKind>('all')
const typeFilter = ref<'all' | CmsActivityType>('all')
const currentPage = ref(1)
const pageSize = 10

const activityTypeOptions: { label: string, value: CmsActivityType }[] = [
  { label: 'Created', value: 'created' },
  { label: 'Updated', value: 'updated' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
  { label: 'Deleted', value: 'deleted' },
  { label: 'Stage Changed', value: 'stage-changed' },
  { label: 'Exported', value: 'exported' }
]

const activityTypeStyles: Record<CmsActivityType, AuditTypeStyle> = {
  'created': {
    label: 'Created',
    icon: 'i-lucide-plus',
    className: 'border-blue-200 bg-blue-50 text-blue-700'
  },
  'updated': {
    label: 'Updated',
    icon: 'i-lucide-pencil',
    className: 'border-amber-200 bg-amber-50 text-amber-700'
  },
  'scheduled': {
    label: 'Scheduled',
    icon: 'i-lucide-calendar-clock',
    className: 'border-sky-200 bg-sky-50 text-sky-700'
  },
  'published': {
    label: 'Published',
    icon: 'i-lucide-send',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  'archived': {
    label: 'Archived',
    icon: 'i-lucide-archive',
    className: 'border-slate-200 bg-slate-100 text-slate-600'
  },
  'deleted': {
    label: 'Deleted',
    icon: 'i-lucide-trash-2',
    className: 'border-rose-200 bg-rose-50 text-rose-700'
  },
  'stage-changed': {
    label: 'Stage Changed',
    icon: 'i-lucide-columns-3',
    className: 'border-violet-200 bg-violet-50 text-violet-700'
  },
  'exported': {
    label: 'Exported',
    icon: 'i-lucide-download',
    className: 'border-teal-200 bg-teal-50 text-teal-700'
  }
}

const activityKindStyles: Record<CmsActivityKind, AuditKindStyle> = {
  portfolio: {
    label: 'Portfolio',
    className: 'border-blue-200 bg-blue-50 text-blue-600'
  },
  partnership: {
    label: 'Partnership',
    className: 'border-violet-200 bg-violet-50 text-violet-600'
  },
  workflow: {
    label: 'Workflow',
    className: 'border-indigo-200 bg-indigo-50 text-indigo-600'
  }
}

const filteredActivities = computed(() => {
  const query = search.value.trim().toLowerCase()

  return activities.value.filter((activity) => {
    if (kindFilter.value !== 'all' && activity.kind !== kindFilter.value) return false
    if (typeFilter.value !== 'all' && activity.type !== typeFilter.value) return false
    if (!query) return true

    return [
      activity.id,
      activity.contentTitle,
      activity.detail ?? '',
      activity.actor,
      activity.type,
      activity.kind
    ].some(value => value.toLowerCase().includes(query))
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredActivities.value.length / pageSize))
)

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredActivities.value.slice(start, start + pageSize)
})

const startItem = computed(() =>
  filteredActivities.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize + 1
)

const endItem = computed(() =>
  Math.min(currentPage.value * pageSize, filteredActivities.value.length)
)

const contentCount = computed(() =>
  activities.value.filter(activity => activity.kind !== 'workflow').length
)

const workflowCount = computed(() =>
  activities.value.filter(activity => activity.kind === 'workflow').length
)

const exportCount = computed(() =>
  activities.value.filter(activity => activity.type === 'exported').length
)

const hasFilters = computed(() =>
  Boolean(search.value.trim()) || kindFilter.value !== 'all' || typeFilter.value !== 'all'
)

const resetFilters = () => {
  search.value = ''
  kindFilter.value = 'all'
  typeFilter.value = 'all'
}

const handleKindFilter = (event: Event) => {
  kindFilter.value = (event.target as HTMLSelectElement).value as 'all' | CmsActivityKind
}

const handleTypeFilter = (event: Event) => {
  typeFilter.value = (event.target as HTMLSelectElement).value as 'all' | CmsActivityType
}

const setPage = (page: number) => {
  currentPage.value = Math.min(Math.max(1, page), totalPages.value)
}

const exportAuditLog = () => {
  const rows = filteredActivities.value.map(activity => [
    activity.id,
    formatCmsDateTime(activity.timestamp),
    activity.actor,
    activityKindStyles[activity.kind].label,
    activityTypeStyles[activity.type].label,
    activity.contentTitle,
    activity.detail ?? ''
  ])

  downloadCmsCsv(
    `audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
    ['Entry ID', 'Timestamp', 'Actor', 'Module', 'Action', 'Subject', 'Detail'],
    rows
  )

  addActivity({
    kind: 'workflow',
    type: 'exported',
    contentTitle: 'Audit trail CSV',
    detail: `${rows.length} audit entries exported`
  })

  toast.add({
    title: 'Audit log exported',
    description: `${rows.length} entries were written to CSV.`,
    color: 'success'
  })
}

watch([search, kindFilter, typeFilter], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="space-y-4 pb-8">
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UIcon
              name="i-lucide-history"
              class="h-5 w-5"
            />
          </div>
          <div>
            <h1 class="text-base font-bold tracking-tight text-slate-900">
              Audit Log
            </h1>
            <p class="mt-0.5 max-w-2xl text-[11px] leading-5 text-slate-500">
              Review content publishing, workflow stage changes, and export activity across the
              CMS module.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[10px] font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
          @click="exportAuditLog"
        >
          <UIcon
            name="i-lucide-download"
            class="h-3.5 w-3.5"
          />
          Export Log
        </button>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-2 lg:grid-cols-4">
      <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
          Total Entries
        </p>
        <p class="mt-1 text-xl font-bold tabular-nums text-slate-900">
          {{ activities.length }}
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
          Content Activity
        </p>
        <p class="mt-1 text-xl font-bold tabular-nums text-blue-600">
          {{ contentCount }}
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
          Workflow Activity
        </p>
        <p class="mt-1 text-xl font-bold tabular-nums text-violet-600">
          {{ workflowCount }}
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
          Exports
        </p>
        <p class="mt-1 text-xl font-bold tabular-nums text-teal-600">
          {{ exportCount }}
        </p>
      </div>
    </section>

    <section class="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
      <div class="relative min-w-56 flex-1">
        <UIcon
          name="i-lucide-search"
          class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search subject, detail, actor, or entry ID..."
          class="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-8 pr-3 text-[11px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
        >
      </div>

      <select
        :value="kindFilter"
        class="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 outline-none transition-colors focus:border-blue-300"
        aria-label="Filter by module"
        @change="handleKindFilter"
      >
        <option value="all">
          All modules
        </option>
        <option value="portfolio">
          Portfolio
        </option>
        <option value="partnership">
          Partnership
        </option>
        <option value="workflow">
          Workflow
        </option>
      </select>

      <select
        :value="typeFilter"
        class="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 outline-none transition-colors focus:border-blue-300"
        aria-label="Filter by action"
        @change="handleTypeFilter"
      >
        <option value="all">
          All actions
        </option>
        <option
          v-for="option in activityTypeOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <button
        v-if="hasFilters"
        type="button"
        class="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-500 transition-colors hover:bg-slate-50"
        @click="resetFilters"
      >
        <UIcon
          name="i-lucide-x"
          class="h-3 w-3"
        />
        Clear
      </button>

      <span class="ml-auto text-[10px] font-medium text-slate-400">
        {{ filteredActivities.length }} matching entries
      </span>
    </section>

    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/80">
              <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Timestamp
              </th>
              <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Actor
              </th>
              <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Module
              </th>
              <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Action
              </th>
              <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Subject
              </th>
              <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Detail
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="activity in paginatedActivities"
              :key="activity.id"
              class="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
            >
              <td class="whitespace-nowrap px-4 py-3">
                <p class="text-[10px] font-semibold text-slate-700">
                  {{ formatCmsDateTime(activity.timestamp) }}
                </p>
                <p class="text-[9px] text-slate-400">
                  {{ activity.id }}
                </p>
              </td>
              <td class="whitespace-nowrap px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[8px] font-bold text-slate-600">
                    {{ activity.actor.split(' ').map(part => part[0]).slice(0, 2).join('') }}
                  </span>
                  <span class="text-[10px] font-medium text-slate-600">
                    {{ activity.actor }}
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold"
                  :class="activityKindStyles[activity.kind].className"
                >
                  {{ activityKindStyles[activity.kind].label }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold"
                  :class="activityTypeStyles[activity.type].className"
                >
                  <UIcon
                    :name="activityTypeStyles[activity.type].icon"
                    class="h-2.5 w-2.5"
                  />
                  {{ activityTypeStyles[activity.type].label }}
                </span>
              </td>
              <td class="px-4 py-3">
                <p
                  class="max-w-52 truncate text-[10px] font-semibold text-slate-700"
                  :title="activity.contentTitle"
                >
                  {{ activity.contentTitle }}
                </p>
              </td>
              <td class="px-4 py-3">
                <p
                  class="max-w-80 truncate text-[10px] text-slate-500"
                  :title="activity.detail"
                >
                  {{ activity.detail || '—' }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="paginatedActivities.length === 0"
        class="flex flex-col items-center justify-center px-6 py-14 text-center"
      >
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          <UIcon
            name="i-lucide-file-search"
            class="h-5 w-5"
          />
        </div>
        <p class="mt-3 text-xs font-bold text-slate-700">
          No audit entries match the filters
        </p>
        <p class="mt-1 text-[11px] text-slate-400">
          Clear the search or select another module or action.
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
        <p class="text-[10px] text-slate-400">
          Showing {{ startItem }}-{{ endItem }} of {{ filteredActivities.length }} entries
        </p>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage <= 1"
            @click="setPage(currentPage - 1)"
          >
            Previous
          </button>
          <span class="px-1 text-[10px] font-semibold text-slate-500">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            type="button"
            class="inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage >= totalPages"
            @click="setPage(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </section>

    <p class="flex items-start gap-1.5 px-1 text-[9px] leading-4 text-slate-400">
      <UIcon
        name="i-lucide-info"
        class="mt-0.5 h-3 w-3 shrink-0"
      />
      Audit entries are persisted in this browser for the current prototype. Production audit logging
      requires backend storage with immutable retention.
    </p>
  </div>
</template>
