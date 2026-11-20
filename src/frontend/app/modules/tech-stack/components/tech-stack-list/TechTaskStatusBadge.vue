<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isActive: boolean
}

const props = defineProps<Props>()

const badgeTone = computed(() => {
  return props.isActive
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-slate-200 bg-slate-50 text-slate-500'
})

const dotTone = computed(() => {
  return props.isActive ? 'bg-emerald-500' : 'bg-slate-400'
})

const label = computed(() => (props.isActive ? 'Active' : 'Inactive'))
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
    :class="badgeTone"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="dotTone" />
    {{ label }}
  </span>
</template>
