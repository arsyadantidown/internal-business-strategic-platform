<script setup lang="ts">
import { computed } from 'vue'
import { formatCmsDate } from '~/modules/cms/utils/cmsFormat'
import type { TechTaskDetail } from '../../types/tech-task.types'

const props = defineProps<{
  detail: TechTaskDetail
}>()

const progress = computed(() => props.detail.progressPercent ?? 0)

const timelineLabel = computed(() =>
  `${formatCmsDate(props.detail.startDate)} - ${formatCmsDate(props.detail.endDate)}`
)

const statusRows = computed(() => {
  const rows: Array<{ label: string, value: string }> = [
    { label: 'Total duration', value: formatDays(props.detail.totalDays) },
    { label: 'Elapsed', value: formatDays(props.detail.elapsedDays) },
    { label: 'Remaining', value: formatDays(props.detail.remainingDays) }
  ]

  if (props.detail.projectManager) {
    rows.push({ label: 'Project manager', value: props.detail.projectManager })
  }
  if (props.detail.accountManager) {
    rows.push({ label: 'Account manager', value: props.detail.accountManager })
  }
  if (props.detail.contractName || props.detail.contractNumber) {
    rows.push({
      label: 'Contract',
      value: [props.detail.contractName, props.detail.contractNumber]
        .filter(Boolean)
        .join(' - ')
    })
  }

  return rows
})

function formatDays(value: number | null): string {
  if (value === null) return '—'
  return `${value} days`
}
</script>

<template>
  <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
    <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon
          name="i-lucide-clock"
          class="h-3.5 w-3.5"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-bold tracking-tight text-slate-900">
          Work Status
        </h3>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Delivery progress and timeline of this technical work
        </p>
      </div>
      <span
        v-if="detail.isOverdue"
        class="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600"
      >
        <UIcon
          name="i-lucide-triangle-alert"
          class="h-3 w-3"
        />
        Overdue
      </span>
    </div>

    <div class="mt-3 space-y-4">
      <div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-semibold text-slate-600">
            {{ detail.projectStatus?.name ?? 'Unknown status' }}
          </span>
          <span class="text-xs font-bold text-slate-900">
            {{ progress }}%
          </span>
        </div>
        <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full bg-blue-500 transition-all"
            :class="progress >= 100 && !detail.isOverdue ? 'bg-emerald-500' : 'bg-blue-500'"
            :style="{ width: `${Math.min(Math.max(progress, 0), 100)}%` }"
          />
        </div>
        <p class="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-400">
          <UIcon
            name="i-lucide-calendar"
            class="h-3 w-3"
          />
          {{ timelineLabel }}
        </p>
      </div>

      <dl class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="row in statusRows"
          :key="row.label"
          class="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2"
        >
          <dt class="text-[10px] font-semibold text-slate-400 uppercase">
            {{ row.label }}
          </dt>
          <dd class="mt-0.5 text-xs font-semibold text-slate-700">
            {{ row.value }}
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>
