<script setup lang="ts">
import { computed } from 'vue'
import { productStatusLabel } from '../../data/product.data'
import type { ProductStatus } from '../../types/product.types'

interface Props {
  status: ProductStatus
}

const props = defineProps<Props>()

const statusClasses = computed(() => {
  if (props.status === 'active') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (props.status === 'draft') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-slate-200 bg-slate-100 text-slate-600'
})

const dotClasses = computed(() => {
  if (props.status === 'active') return 'bg-emerald-500'
  if (props.status === 'draft') return 'bg-amber-500'
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
    {{ productStatusLabel(status) }}
  </span>
</template>
