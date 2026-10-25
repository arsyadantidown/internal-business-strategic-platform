<script setup lang="ts">
import type { CmsStat, CmsTone } from '../../types/cms.types'

defineProps<{
  stats: CmsStat[]
}>()

const toneClasses: Record<CmsTone, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
  rose: 'bg-rose-50 text-rose-600'
}
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
    <article
      v-for="stat in stats"
      :key="stat.key"
      class="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs"
    >
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        :class="toneClasses[stat.tone]"
      >
        <UIcon
          :name="stat.icon"
          class="h-4.5 w-4.5"
        />
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-[11px] font-semibold text-slate-500">
          {{ stat.label }}
        </p>
        <p class="mt-0.5 text-xl font-bold leading-6 text-slate-900">
          {{ stat.value }}
        </p>
        <p class="truncate text-[10px] font-medium text-slate-400">
          {{ stat.hint }}
        </p>
      </div>
    </article>
  </div>
</template>
