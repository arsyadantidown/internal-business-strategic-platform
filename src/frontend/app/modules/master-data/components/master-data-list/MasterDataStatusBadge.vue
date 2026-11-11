<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isActive: boolean
}

const props = defineProps<Props>()

const statusClasses = computed(() =>
  props.isActive
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-slate-200 bg-slate-100 text-slate-600'
)

const dotClasses = computed(() =>
  props.isActive ? 'bg-emerald-500' : 'bg-slate-400'
)
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
    {{ isActive ? 'Active' : 'Inactive' }}
  </span>
</template>
