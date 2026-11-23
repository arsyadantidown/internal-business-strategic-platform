<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { PartnerFilters } from '../../types/partner.types'

interface Props {
  filters: PartnerFilters
  isFilterDirty: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update', value: PartnerFilters): void
  (e: 'reset'): void
}>()

const searchInput = ref(props.filters.search)
let debounceTimer: ReturnType<typeof setTimeout> | undefined

watch(searchInput, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update', { ...props.filters, search: value.slice(0, 200) })
  }, 350)
})

watch(
  () => props.filters.search,
  (value) => {
    if (value !== searchInput.value) searchInput.value = value
  }
)

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

const handleIncludeInactiveChange = (event: Event) => {
  emit('update', {
    ...props.filters,
    includeInactive: (event.target as HTMLInputElement).checked
  })
}

const handleReset = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  searchInput.value = ''
  emit('reset')
}
</script>

<template>
  <div class="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
    <div class="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center">
      <div class="relative w-full md:w-64">
        <UIcon
          name="i-lucide-search"
          class="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="searchInput"
          type="text"
          maxlength="200"
          placeholder="Search partner name..."
          class="h-8.5 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-xs text-slate-700 shadow-xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none"
        >
      </div>

      <label class="inline-flex h-8.5 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-xs transition-colors hover:bg-slate-50">
        <input
          type="checkbox"
          class="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/50"
          :checked="filters.includeInactive"
          @change="handleIncludeInactiveChange"
        >
        Include inactive
      </label>
    </div>

    <button
      v-if="isFilterDirty"
      type="button"
      class="inline-flex h-8.5 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer md:self-auto"
      @click="handleReset"
    >
      <UIcon
        name="i-lucide-rotate-ccw"
        class="h-3.5 w-3.5"
      />
      <span>Reset</span>
    </button>
  </div>
</template>
