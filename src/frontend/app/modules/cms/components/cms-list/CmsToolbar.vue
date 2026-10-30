<script setup lang="ts">
import { computed } from 'vue'
import type { CmsContentKind, CmsFilters } from '../../types/cms.types'
import { cmsStatusOptions } from '../../data/cms.data'

interface Props {
  kind: CmsContentKind
  filters: CmsFilters
  totalResults: number
  totalContents: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:filters', value: CmsFilters): void
  (e: 'reset'): void
}>()

const hasActiveFilters = computed(() =>
  Boolean(props.filters.search || props.filters.status)
)

const sectionLabel = computed(() =>
  props.kind === 'portfolio' ? 'Portfolio Library' : 'Partnership Library'
)

const searchPlaceholder = computed(() =>
  props.kind === 'portfolio'
    ? 'Search portfolio title, client, industry...'
    : 'Search partner name, category, industry...'
)

const updateFilter = (key: keyof CmsFilters, value: string) => {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>

<template>
  <div class="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
    <div class="shrink-0">
      <h2 class="text-xs font-bold tracking-tight text-slate-900">
        {{ sectionLabel }}
      </h2>
      <p class="text-[11px] text-slate-400">
        Showing {{ totalResults }} of {{ totalContents }} {{ kind }} content items
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="relative w-full sm:w-64">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
          <UIcon
            name="i-lucide-search"
            class="h-3.5 w-3.5"
          />
        </div>
        <input
          :value="filters.search"
          type="text"
          :placeholder="searchPlaceholder"
          class="h-8.5 w-full rounded-lg border border-slate-200 bg-white py-1 pr-8 pl-8 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="updateFilter('search', ($event.target as HTMLInputElement).value)"
        >
        <button
          v-if="filters.search"
          type="button"
          class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
          aria-label="Clear search"
          @click="updateFilter('search', '')"
        >
          <UIcon
            name="i-lucide-x"
            class="h-3.5 w-3.5"
          />
        </button>
      </div>

      <select
        :value="filters.status"
        class="h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
        aria-label="Filter by status"
        @change="updateFilter('status', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">
          All statuses
        </option>
        <option
          v-for="option in cmsStatusOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <button
        v-if="hasActiveFilters"
        type="button"
        class="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
        @click="emit('reset')"
      >
        <UIcon
          name="i-lucide-rotate-ccw"
          class="h-3.5 w-3.5"
        />
        <span>Reset</span>
      </button>
    </div>
  </div>
</template>
