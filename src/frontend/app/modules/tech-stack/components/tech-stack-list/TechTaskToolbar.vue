<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import type { TechStackCategory, TechStackFilterParams } from '../../types/tech-stack.types'

interface Props {
  filters: TechStackFilterParams
  isFilterDirty: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update', value: TechStackFilterParams): void
  (e: 'reset'): void
}>()

// Local state search input agar user mengetik dengan mulus
const searchInput = ref(props.filters.search ?? '')

let debounceTimer: ReturnType<typeof setTimeout> | undefined

// Watch input dengan debounce 350ms
watch(searchInput, (newValue) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update', { ...props.filters, search: newValue })
  }, 350)
})

// Sinkronisasi jika filters.search direset dari luar (misal tombol reset)
watch(
  () => props.filters.search,
  (val) => {
    if (val !== searchInput.value) {
      searchInput.value = val ?? ''
    }
  }
)

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

const handleCategoryChange = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value as TechStackCategory | ''
  emit('update', { ...props.filters, category: val })
}

const handleStatusChange = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value as 'active' | 'inactive' | ''
  emit('update', { ...props.filters, status: val })
}

const handleReset = () => {
  searchInput.value = ''
  emit('reset')
}
</script>

<template>
  <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:flex-wrap flex-1">
      <!-- Search Input (dengan Debounce 350ms) -->
      <div class="relative w-full sm:w-64">
        <UIcon
          name="i-lucide-search"
          class="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search tech stack name..."
          class="h-8.5 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-xs text-slate-700 shadow-xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none"
        >
      </div>

      <!-- Category Filter (Instant change) -->
      <div class="relative">
        <select
          :value="filters.category ?? ''"
          class="h-8.5 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-0 pr-8 pl-3 text-xs font-medium text-slate-700 shadow-xs transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none sm:w-44"
          @change="handleCategoryChange"
        >
          <option value="">
            All categories
          </option>
          <option value="frontend">
            Frontend
          </option>
          <option value="backend">
            Backend
          </option>
          <option value="data_storage">
            Data Storage
          </option>
        </select>
        <UIcon
          name="i-lucide-chevron-right"
          class="pointer-events-none absolute top-1/2 right-2.5 h-3 w-3 -translate-y-1/2 rotate-90 text-slate-400"
        />
      </div>

      <!-- Status Filter (Instant change) -->
      <div class="relative">
        <select
          :value="filters.status ?? ''"
          class="h-8.5 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-0 pr-8 pl-3 text-xs font-medium text-slate-700 shadow-xs transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none sm:w-36"
          @change="handleStatusChange"
        >
          <option value="">
            All statuses
          </option>
          <option value="active">
            Active
          </option>
          <option value="inactive">
            Inactive
          </option>
        </select>
        <UIcon
          name="i-lucide-chevron-right"
          class="pointer-events-none absolute top-1/2 right-2.5 h-3 w-3 -translate-y-1/2 rotate-90 text-slate-400"
        />
      </div>
    </div>

    <!-- Reset Filter -->
    <button
      v-if="isFilterDirty || searchInput.trim() !== ''"
      type="button"
      class="inline-flex h-8.5 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
      @click="handleReset"
    >
      <UIcon
        name="i-lucide-x"
        class="h-3.5 w-3.5"
      />
      <span>Reset filters</span>
    </button>
  </div>
</template>
