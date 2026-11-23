<script setup lang="ts">
import { computed } from 'vue'
import { PARTNER_CATEGORIES } from '../../types/partner.types'
import type { PartnerCategoryValue } from '../../types/partner.types'

interface Props {
  category: PartnerCategoryValue | null
  withLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  withLabel: true
})

const meta = computed(() =>
  PARTNER_CATEGORIES.find(category => category.value === props.category) ?? null
)
</script>

<template>
  <span
    v-if="meta"
    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
    :class="meta.chipClass"
  >
    <UIcon
      :name="meta.icon"
      class="h-3 w-3"
    />
    <span v-if="withLabel">{{ meta.label }}</span>
  </span>
  <span
    v-else
    class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-400"
  >
    {{ withLabel ? 'Uncategorized' : '—' }}
  </span>
</template>
