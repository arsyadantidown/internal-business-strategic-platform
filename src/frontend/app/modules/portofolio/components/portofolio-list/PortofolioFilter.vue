<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { PortfolioFilterState, PortfolioOption } from '../../types/types'
import AppYearPicker from '~/components/common/AppYearPicker.vue'
import { useCustomerStore } from '~/modules/customer/stores/customer.store'
import { useMasterDataStore } from '../../stores/master-data.store'
import { createPortfolioFilterState } from '../../data/portfolioOptions'

const filters = ref<PortfolioFilterState>(createPortfolioFilterState())
const masterDataStore = useMasterDataStore()
const customerStore = useCustomerStore()
const isMoreFiltersOpen = ref(false)

onMounted(() => {
  masterDataStore.fetchAllMasterData()
  customerStore.fetchCustomerNames()
  customerStore.fetchCustomerLocations()
})

const emit = defineEmits<{
  (e: 'filter-change', filters: PortfolioFilterState): void
  (e: 'reset'): void
}>()

const withAll = (label: string, options: PortfolioOption[]): PortfolioOption[] => [
  { label, value: '' },
  ...options
]

const industryOptions = computed(() => withAll('All Industries', masterDataStore.industryOptions))
const companySizeOptions = computed(() =>
  withAll('All Company Sizes', masterDataStore.companySizeOptions)
)
const legalStructureOptions = computed(() =>
  withAll('All Legal Structures', masterDataStore.legalStructureOptions)
)
const businessUnitOptions = computed(() =>
  withAll('All Business Units', masterDataStore.businessUnitOptions)
)
const customerTypeOptions = computed(() =>
  withAll('All Customer Types', masterDataStore.customerTypeOptions)
)
const productStatusOptions = computed(() =>
  withAll('All Product Statuses', masterDataStore.productStatusOptions)
)
const projectStatusOptions = computed(() =>
  withAll('All Project Statuses', masterDataStore.projectStatusOptions)
)
const productOptions = computed(() => withAll('All Products', masterDataStore.productOptions))
const frontendStackOptions = computed(() =>
  withAll('All Frontend Stacks', masterDataStore.frontendStackOptions)
)
const backendStackOptions = computed(() =>
  withAll('All Backend Stacks', masterDataStore.backendStackOptions)
)
const databaseOptions = computed(() => withAll('All Databases', masterDataStore.databaseOptions))

const customerNameOptions = computed(() =>
  withAll(
    'All Customers',
    customerStore.customerNames.map((name) => ({ label: name, value: name }))
  )
)

const customerLocationOptions = computed(() =>
  withAll(
    'All Locations',
    customerStore.customerLocations.map((loc) => ({ label: loc, value: loc }))
  )
)

const selectClass =
  'h-9 w-full rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer'

const handleSearch = () => {
  emit('filter-change', { ...filters.value })
}

const handleReset = () => {
  filters.value = createPortfolioFilterState()
  emit('reset')
}
</script>

<template>
  <div class="space-y-3">
    <!-- Baris 1: Search & Reset -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-[260px] flex-1">
        <div
          class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
        >
          <UIcon name="i-lucide-search" class="h-4 w-4" />
        </div>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search project name, client, or keyword..."
          class="h-10 w-full rounded-lg border border-slate-200/90 bg-white py-2 pr-4 pl-9 text-xs text-slate-800 placeholder-slate-400 shadow-2xs transition-colors hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="handleSearch"
        />
      </div>

      <button
        type="button"
        class="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 active:bg-slate-100 cursor-pointer"
        @click="handleReset"
      >
        <UIcon name="i-lucide-rotate-ccw" class="h-3.5 w-3.5 text-slate-400" />
        <span>Reset</span>
      </button>
    </div>

    <!-- Baris 2: 3 Filter Utama + Tombol More Filters -->
    <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      <select
        v-model="filters.industry"
        :class="selectClass"
        aria-label="Filter by industry"
        @change="handleSearch"
      >
        <option v-for="opt in industryOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.status"
        :class="selectClass"
        aria-label="Filter by project status"
        @change="handleSearch"
      >
        <option v-for="opt in projectStatusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <AppYearPicker
        v-model="filters.year"
        @change="handleSearch"
      />

      <button
        type="button"
        class="inline-flex h-9 w-full items-center justify-between rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 cursor-pointer"
        @click="isMoreFiltersOpen = !isMoreFiltersOpen"
      >
        <span>More Filters</span>
        <UIcon
          :name="isMoreFiltersOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="h-4 w-4 text-slate-400"
        />
      </button>
    </div>

    <!-- Baris 3: Panel More Filters (11 Filter) -->
    <div
      v-if="isMoreFiltersOpen"
      class="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5"
    >
      <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <select
          v-model="filters.customerName"
          :class="selectClass"
          aria-label="Filter by customer"
          @change="handleSearch"
        >
          <option v-for="opt in customerNameOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="filters.customerLocation"
          :class="selectClass"
          aria-label="Filter by location"
          @change="handleSearch"
        >
          <option v-for="opt in customerLocationOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="filters.companySize"
          :class="selectClass"
          aria-label="Filter by company size"
          @change="handleSearch"
        >
          <option v-for="opt in companySizeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="filters.product"
          :class="selectClass"
          aria-label="Filter by product"
          @change="handleSearch"
        >
          <option v-for="opt in productOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="filters.legalStructure"
          :class="selectClass"
          aria-label="Filter by legal structure"
          @change="handleSearch"
        >
          <option v-for="opt in legalStructureOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="filters.businessUnit"
          :class="selectClass"
          aria-label="Filter by business unit"
          @change="handleSearch"
        >
          <option v-for="opt in businessUnitOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="filters.customerType"
          :class="selectClass"
          aria-label="Filter by customer type"
          @change="handleSearch"
        >
          <option v-for="opt in customerTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="filters.productStatus"
          :class="selectClass"
          aria-label="Filter by product status"
          @change="handleSearch"
        >
          <option v-for="opt in productStatusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="filters.frontendStack"
          :class="selectClass"
          aria-label="Filter by frontend stack"
          @change="handleSearch"
        >
          <option v-for="opt in frontendStackOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="filters.backendStack"
          :class="selectClass"
          aria-label="Filter by backend stack"
          @change="handleSearch"
        >
          <option v-for="opt in backendStackOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="filters.database"
          :class="selectClass"
          aria-label="Filter by database"
          @change="handleSearch"
        >
          <option v-for="opt in databaseOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
