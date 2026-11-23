<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CmsContentKind, CmsFilters } from '../../types/cms.types'
import { cmsStatusOptions } from '../../data/cms.data'
import { useMasterDataStore } from '~/modules/portofolio/stores/master-data.store'
import AppYearPicker from '~/components/common/AppYearPicker.vue'
import type { PortfolioOption } from '~/modules/portofolio/types/types'

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

const masterDataStore = useMasterDataStore()
const isMoreFiltersOpen = ref(false)

onMounted(() => {
  if (props.kind === 'portfolio') {
    masterDataStore.fetchAllMasterData()
  }
})

const hasActiveFilters = computed(() => {
  if (props.kind !== 'portfolio') {
    return Boolean(props.filters.search || props.filters.status)
  }
  return Boolean(
    props.filters.search ||
    !props.filters.isFeatured || // featured defaults to true
    props.filters.industryId ||
    props.filters.projectStatusId ||
    props.filters.year ||
    props.filters.companySizeId ||
    props.filters.customerName ||
    props.filters.customerLocation ||
    props.filters.legalStructureId ||
    props.filters.businessUnitId ||
    props.filters.customerTypeId ||
    props.filters.frontendStackId ||
    props.filters.backendStackId ||
    props.filters.databaseId ||
    props.filters.status
  )
})

const sectionLabel = computed(() =>
  props.kind === 'portfolio' ? 'Portfolio Library' : 'Partnership Library'
)

const searchPlaceholder = computed(() =>
  props.kind === 'portfolio'
    ? 'Search project name, client, or keyword...'
    : 'Search partner name, category, industry...'
)

const updateFilter = (key: keyof CmsFilters, value: any) => {
  emit('update:filters', { ...props.filters, [key]: value })
}

// Helpers for options
const withAll = (label: string, options: PortfolioOption[]): PortfolioOption[] => [
  { label, value: '' },
  ...options
]

const industryOptions = computed(() => withAll('All Industries', masterDataStore.industryOptions))
const projectStatusOptions = computed(() => withAll('All Project Statuses', masterDataStore.projectStatusOptions))
const companySizeOptions = computed(() => withAll('All Company Sizes', masterDataStore.companySizeOptions))
const legalStructureOptions = computed(() => withAll('All Legal Structures', masterDataStore.legalStructureOptions))
const businessUnitOptions = computed(() => withAll('All Business Units', masterDataStore.businessUnitOptions))
const customerTypeOptions = computed(() => withAll('All Customer Types', masterDataStore.customerTypeOptions))
const frontendStackOptions = computed(() => withAll('All Frontend Stacks', masterDataStore.frontendStackOptions))
const backendStackOptions = computed(() => withAll('All Backend Stacks', masterDataStore.backendStackOptions))
const databaseOptions = computed(() => withAll('All Databases', masterDataStore.databaseOptions))

// Placeholder options for Customer Name and Location (UI only for now)
const customerNameOptions = [
  { label: 'All Customer Names', value: '' }
]
const customerLocationOptions = [
  { label: 'All Customer Locations', value: '' }
]

const selectClass =
  'h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors focus:border-blue-500 focus:outline-none cursor-pointer'
</script>

<template>
  <div class="border-b border-slate-100 px-4 py-3.5 space-y-3">
    <!-- Header row: Title & Count -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xs font-bold tracking-tight text-slate-900">
          {{ sectionLabel }}
        </h2>
        <p class="text-[11px] text-slate-400">
          Showing {{ totalResults }} of {{ totalContents }} {{ kind }} content items
        </p>
      </div>
    </div>

    <!-- For Partnership (Simple Filter) -->
    <template v-if="kind === 'partnership'">
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative w-full sm:w-64">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
            <UIcon name="i-lucide-search" class="h-3.5 w-3.5" />
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
            <UIcon name="i-lucide-x" class="h-3.5 w-3.5" />
          </button>
        </div>

        <select
          :value="filters.status"
          class="h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
          aria-label="Filter by status"
          @change="updateFilter('status', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">All statuses</option>
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
          <UIcon name="i-lucide-rotate-ccw" class="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </template>

    <!-- For Portfolio (Figma-styled Rich Filter) -->
    <template v-else>
      <!-- Top Row: Search Input, Reset Button, and Featured Only Toggle -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search bar -->
        <div class="relative min-w-[240px] flex-1">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <UIcon name="i-lucide-search" class="h-4 w-4" />
          </div>
          <input
            :value="filters.search"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full rounded-lg border border-slate-200 bg-white py-2 pr-4 pl-9 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            @input="updateFilter('search', ($event.target as HTMLInputElement).value)"
          >
          <button
            v-if="filters.search"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Clear search"
            @click="updateFilter('search', '')"
          >
            <UIcon name="i-lucide-x" class="h-4 w-4" />
          </button>
        </div>

        <!-- Reset Button -->
        <button
          type="button"
          class="inline-flex h-9.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 cursor-pointer shadow-2xs"
          @click="emit('reset')"
        >
          <UIcon name="i-lucide-rotate-ccw" class="h-3.5 w-3.5 text-slate-500" />
          <span>Reset</span>
        </button>

        <!-- Featured Only Toggle Pill -->
        <div class="inline-flex h-9.5 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-2xs">
          <span class="text-xs font-semibold text-slate-700 whitespace-nowrap">Featured Only</span>
          <div class="inline-flex rounded-md bg-slate-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              class="rounded px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer"
              :class="filters.isFeatured ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
              @click="updateFilter('isFeatured', true)"
            >
              Yes
            </button>
            <button
              type="button"
              class="rounded px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer"
              :class="!filters.isFeatured ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
              @click="updateFilter('isFeatured', false)"
            >
              No
            </button>
          </div>
        </div>
      </div>

      <!-- Primary Filters Row (4-columns) -->
      <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- All Industries -->
        <div>
          <select
            :value="filters.industryId"
            :class="selectClass"
            aria-label="Filter by industry"
            @change="updateFilter('industryId', ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="opt in industryOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- All Project Statuses -->
        <div>
          <select
            :value="filters.projectStatusId"
            :class="selectClass"
            aria-label="Filter by project status"
            @change="updateFilter('projectStatusId', ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="opt in projectStatusOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- All Years (AppYearPicker) -->
        <div>
          <AppYearPicker
            :model-value="filters.year"
            @update:model-value="updateFilter('year', $event)"
          />
        </div>

        <!-- More Filters Toggle Button -->
        <div>
          <button
            type="button"
            class="flex h-9.5 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 cursor-pointer shadow-2xs"
            @click="isMoreFiltersOpen = !isMoreFiltersOpen"
          >
            <span>More Filters</span>
            <UIcon
              :name="isMoreFiltersOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              class="h-4 w-4 text-slate-500 transition-transform duration-200"
            />
          </button>
        </div>
      </div>

      <!-- Expandable More Filters Container (Figma design with darker inner shadow & background) -->
      <div
        v-show="isMoreFiltersOpen"
        class="rounded-xl border border-slate-200/90 bg-slate-50/90 p-3.5 shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.04)] space-y-2.5 transition-all"
      >
        <!-- Row 1: Company Sizes, Customer Name, Customer Location, Legal Structures -->
        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <!-- All Company Sizes -->
          <div>
            <select
              :value="filters.companySizeId"
              :class="selectClass"
              aria-label="Filter by company size"
              @change="updateFilter('companySizeId', ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="opt in companySizeOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- All Customer Names (UI for now) -->
          <div>
            <select
              :value="filters.customerName"
              :class="selectClass"
              aria-label="Filter by customer name"
              @change="updateFilter('customerName', ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="opt in customerNameOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- All Customer Locations (UI for now) -->
          <div>
            <select
              :value="filters.customerLocation"
              :class="selectClass"
              aria-label="Filter by customer location"
              @change="updateFilter('customerLocation', ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="opt in customerLocationOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- All Legal Structures -->
          <div>
            <select
              :value="filters.legalStructureId"
              :class="selectClass"
              aria-label="Filter by legal structure"
              @change="updateFilter('legalStructureId', ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="opt in legalStructureOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Row 2: Business Units, Customer Types, Frontend Stacks, Backend Stacks -->
        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <!-- All Business Units -->
          <div>
            <select
              :value="filters.businessUnitId"
              :class="selectClass"
              aria-label="Filter by business unit"
              @change="updateFilter('businessUnitId', ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="opt in businessUnitOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- All Customer Types -->
          <div>
            <select
              :value="filters.customerTypeId"
              :class="selectClass"
              aria-label="Filter by customer type"
              @change="updateFilter('customerTypeId', ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="opt in customerTypeOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- All Frontend Stacks -->
          <div>
            <select
              :value="filters.frontendStackId"
              :class="selectClass"
              aria-label="Filter by frontend stack"
              @change="updateFilter('frontendStackId', ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="opt in frontendStackOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- All Backend Stacks -->
          <div>
            <select
              :value="filters.backendStackId"
              :class="selectClass"
              aria-label="Filter by backend stack"
              @change="updateFilter('backendStackId', ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="opt in backendStackOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Row 3: Databases -->
        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <!-- All Databases -->
          <div>
            <select
              :value="filters.databaseId"
              :class="selectClass"
              aria-label="Filter by database"
              @change="updateFilter('databaseId', ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="opt in databaseOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
