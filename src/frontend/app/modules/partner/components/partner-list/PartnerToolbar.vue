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

const setIncludeInactive = (val: boolean) => {
  emit('update', {
    ...props.filters,
    includeInactive: val
  })
}

const handleReset = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  searchInput.value = ''
  emit('reset')
}
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
    <!-- Search Input -->
    <div class="relative w-full sm:w-80">
      <UIcon
        name="i-lucide-search"
        class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
      <input
        v-model="searchInput"
        type="text"
        maxlength="200"
        placeholder="Search partner name..."
        class="h-9 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-xs text-slate-700 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none"
      />
    </div>

    <!-- Segmented Toggle Include Inactive (No / Yes) -->
    <div
      class="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1 shadow-2xs"
    >
      <span class="text-xs font-medium text-slate-600 select-none">Include Inactive</span>
      <div class="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
        <button
          type="button"
          class="rounded-md px-2.5 py-0.5 transition-all cursor-pointer select-none"
          :class="
            !filters.includeInactive
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          "
          @click="setIncludeInactive(false)"
        >
          No
        </button>
        <button
          type="button"
          class="rounded-md px-2.5 py-0.5 transition-all cursor-pointer select-none"
          :class="
            filters.includeInactive
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          "
          @click="setIncludeInactive(true)"
        >
          Yes
        </button>
      </div>
    </div>

    <!-- Reset Button (jika search terisi) -->
    <button
      v-if="isFilterDirty"
      type="button"
      class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
      @click="handleReset"
    >
      <UIcon name="i-lucide-rotate-ccw" class="h-3.5 w-3.5" />
      <span>Reset</span>
    </button>
  </div>
</template>
