<script setup lang="ts">
import { computed } from 'vue'
import type { CmsActivity, CmsActivityKind, CmsActivityType } from '../../types/cms.types'
import { formatCmsShortDateTime } from '../../utils/cmsFormat'

interface Props {
  activities: CmsActivity[]
}

const props = defineProps<Props>()

const activityStyles: Record<CmsActivityType, {
  label: string
  icon: string
  iconClass: string
  labelClass: string
}> = {
  'created': {
    label: 'Created',
    icon: 'i-lucide-file-plus-2',
    iconClass: 'bg-blue-50 text-blue-600',
    labelClass: 'text-blue-600'
  },
  'updated': {
    label: 'Updated',
    icon: 'i-lucide-pencil',
    iconClass: 'bg-amber-50 text-amber-600',
    labelClass: 'text-amber-600'
  },
  'scheduled': {
    label: 'Scheduled',
    icon: 'i-lucide-calendar-clock',
    iconClass: 'bg-sky-50 text-sky-600',
    labelClass: 'text-sky-600'
  },
  'published': {
    label: 'Published',
    icon: 'i-lucide-send',
    iconClass: 'bg-emerald-50 text-emerald-600',
    labelClass: 'text-emerald-600'
  },
  'archived': {
    label: 'Archived',
    icon: 'i-lucide-archive',
    iconClass: 'bg-slate-100 text-slate-600',
    labelClass: 'text-slate-600'
  },
  'deleted': {
    label: 'Deleted',
    icon: 'i-lucide-trash-2',
    iconClass: 'bg-rose-50 text-rose-600',
    labelClass: 'text-rose-600'
  },
  'stage-changed': {
    label: 'Stage Changed',
    icon: 'i-lucide-columns-3',
    iconClass: 'bg-violet-50 text-violet-600',
    labelClass: 'text-violet-600'
  },
  'exported': {
    label: 'Exported',
    icon: 'i-lucide-download',
    iconClass: 'bg-teal-50 text-teal-600',
    labelClass: 'text-teal-600'
  }
}

const kindStyles: Record<CmsActivityKind, { label: string, className: string }> = {
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

const latestActivities = computed(() =>
  [...props.activities]
    .sort((first, second) => second.timestamp.localeCompare(first.timestamp))
    .slice(0, 4)
)
</script>

<template>
  <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
    <div class="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <UIcon
            name="i-lucide-activity"
            class="h-3.5 w-3.5"
          />
        </div>
        <div>
          <h2 class="text-xs font-bold tracking-tight text-slate-900">
            Recent Activity
          </h2>
          <p class="text-[10px] text-slate-400">
            Latest portfolio and partnership content updates.
          </p>
        </div>
      </div>

      <span class="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500 sm:inline-flex">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Local workspace
      </span>
    </div>

    <div
      v-if="latestActivities.length > 0"
      class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4"
    >
      <article
        v-for="activity in latestActivities"
        :key="activity.id"
        class="flex min-w-0 items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5"
      >
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          :class="activityStyles[activity.type].iconClass"
        >
          <UIcon
            :name="activityStyles[activity.type].icon"
            class="h-3.5 w-3.5"
          />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-bold uppercase tracking-wide"
              :class="activityStyles[activity.type].labelClass"
            >
              {{ activityStyles[activity.type].label }}
            </span>
            <span
              class="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold"
              :class="kindStyles[activity.kind].className"
            >
              {{ kindStyles[activity.kind].label }}
            </span>
          </div>
          <p class="truncate text-[10px] font-medium text-slate-400">
            {{ activity.actor }}
          </p>
          <p
            class="mt-0.5 truncate text-[11px] font-semibold text-slate-700"
            :title="activity.contentTitle"
          >
            {{ activity.contentTitle }}
          </p>
          <p
            v-if="activity.detail"
            class="truncate text-[10px] text-slate-400"
            :title="activity.detail"
          >
            {{ activity.detail }}
          </p>
          <p class="text-[10px] text-slate-400">
            {{ formatCmsShortDateTime(activity.timestamp) }}
          </p>
        </div>
      </article>
    </div>

    <div
      v-else
      class="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-5 text-xs text-slate-400"
    >
      <UIcon
        name="i-lucide-activity"
        class="h-4 w-4"
      />
      <span>No content activity yet.</span>
    </div>
  </section>
</template>
