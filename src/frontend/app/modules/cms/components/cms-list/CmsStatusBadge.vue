<script setup lang="ts">
import { computed } from 'vue'
import type { CmsContentStatus } from '../../types/cms.types'

interface Props {
  status: CmsContentStatus
}

const props = defineProps<Props>()

const statusClasses = computed(() => {
  if (props.status === 'Published') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (props.status === 'Scheduled') return 'border-sky-200 bg-sky-50 text-sky-700'
  if (props.status === 'Draft') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-slate-200 bg-slate-100 text-slate-600'
})

const dotClasses = computed(() => {
  if (props.status === 'Published') return 'bg-emerald-500'
  if (props.status === 'Scheduled') return 'bg-sky-500'
  if (props.status === 'Draft') return 'bg-amber-500'
  return 'bg-slate-400'
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
    :class="statusClasses"
  >
    <span
      class="h-1.5 w-1.5 rounded-full"
      :class="dotClasses"
    />
    {{ status }}
  </span>
</template>
