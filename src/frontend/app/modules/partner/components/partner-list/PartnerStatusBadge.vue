<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isActive: boolean
}

const props = defineProps<Props>()

const badgeConfig = computed(() => {
  return props.isActive
    ? {
        label: 'Active',
        badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        dotClass: 'bg-emerald-500'
      }
    : {
        label: 'Inactive',
        badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
        dotClass: 'bg-slate-400'
      }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
    :class="badgeConfig.badgeClass"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="badgeConfig.dotClass" />
    <span>{{ badgeConfig.label }}</span>
  </span>
</template>
