<script setup lang="ts">
import { computed } from 'vue'
import { PARTNER_CATEGORIES } from '../../types/partner.types'
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

const search = computed({
  get: () => props.filters.search,
  set: value => emit('update', { ...props.filters, search: value })
})

const category = computed({
  get: () => props.filters.category,
  set: value => emit('update', { ...props.filters, category: value })
})

const status = computed({
  get: () => props.filters.status,
  set: value => emit('update', { ...props.filters, status: value })
})
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
          v-model="search"
          type="text"
          placeholder="Search partner name..."
          class="h-8.5 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-xs text-slate-700 shadow-xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none"
        >
      </div>

      <div class="relative">
        <select
          v-model="category"
          class="h-8.5 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-0 pr-8 pl-3 text-xs font-medium text-slate-700 shadow-xs transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none md:w-48"
        >
          <option value="">
            All categories
          </option>
          <option
            v-for="option in PARTNER_CATEGORIES"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <UIcon
          name="i-lucide-chevron-right"
          class="pointer-events-none absolute top-1/2 right-2.5 h-3 w-3 -translate-y-1/2 rotate-90 text-slate-400"
        />
      </div>

      <div class="relative">
        <select
          v-model="status"
          class="h-8.5 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-0 pr-8 pl-3 text-xs font-medium text-slate-700 shadow-xs transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none md:w-40"
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

    <button
      v-if="isFilterDirty"
      type="button"
      class="inline-flex h-8.5 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer md:self-auto"
      @click="emit('reset')"
    >
      <UIcon
        name="i-lucide-rotate-ccw"
        class="h-3.5 w-3.5"
      />
      <span>Reset</span>
    </button>
  </div>
</template>
