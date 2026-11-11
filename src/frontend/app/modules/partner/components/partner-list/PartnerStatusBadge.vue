<script setup lang="ts">
import { computed } from 'vue'
import { PARTNER_LIFECYCLE_STATUSES } from '../../types/partner.types'
import type { PartnerLifecycleStatusValue } from '../../types/partner.types'

interface Props {
  isActive: boolean
  lifecycleStatus: PartnerLifecycleStatusValue | null
}

const props = defineProps<Props>()

const meta = computed(() => {
  if (props.lifecycleStatus) {
    return PARTNER_LIFECYCLE_STATUSES.find(status => status.value === props.lifecycleStatus) ?? null
  }

  return props.isActive
    ? {
        label: 'Active',
        chipClass: 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }
    : {
        label: 'Inactive',
        chipClass: 'border-slate-200 bg-slate-100 text-slate-500'
      }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
    :class="meta?.chipClass"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    {{ meta?.label }}
  </span>
</template>
