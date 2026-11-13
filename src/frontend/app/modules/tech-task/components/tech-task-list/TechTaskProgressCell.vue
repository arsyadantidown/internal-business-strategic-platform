<script setup lang="ts">
import { computed } from 'vue'
import type { TechTaskListItem } from '../../types/tech-task.types'

interface Props {
  item: TechTaskListItem
}

const props = defineProps<Props>()

const progress = computed(() => props.item.progressPercent ?? 0)

const progressTone = computed(() => {
  const remaining = props.item.remainingDays
  if (progress.value >= 100) return 'bg-emerald-500'
  if (remaining !== null && remaining < 0) return 'bg-rose-500'
  return 'bg-blue-500'
})

const remainingLabel = computed(() => {
  const remaining = props.item.remainingDays

  if (remaining === null) return ''
  if (remaining < 0) return `${Math.abs(remaining)} days overdue`
  if (remaining === 0) return 'Due today'
  return `${remaining} days left`
})
</script>

<template>
  <div class="flex min-w-32 flex-col gap-1">
    <div class="flex items-center justify-between gap-2">
      <span class="text-[11px] font-semibold text-slate-700">
        {{ progress }}%
      </span>
      <span
        v-if="remainingLabel"
        class="text-[10px] font-medium whitespace-nowrap"
        :class="item.remainingDays !== null && item.remainingDays < 0 ? 'text-rose-500' : 'text-slate-400'"
      >
        {{ remainingLabel }}
      </span>
    </div>

    <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        class="h-full rounded-full transition-all"
        :class="progressTone"
        :style="{ width: `${Math.min(Math.max(progress, 0), 100)}%` }"
      />
    </div>
  </div>
</template>
