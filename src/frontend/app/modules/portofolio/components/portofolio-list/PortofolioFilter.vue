<script setup lang="ts">
import { ref } from 'vue'
import type { PortfolioFilterState, PortfolioOption } from '../../types/types'
import {
  createPortfolioFilterState,
  portfolioBackendStackOptions,
  portfolioBusinessUnitOptions,
  portfolioCompanySizeOptions,
  portfolioCustomerTypeOptions,
  portfolioDatabaseOptions,
  portfolioFrontendStackOptions,
  portfolioIndustryOptions,
  portfolioLegalStructureOptions,
  portfolioProductOptions,
  portfolioProductStatusOptions,
  portfolioProjectStatusOptions
} from '../../data/portfolioOptions'

const filters = ref<PortfolioFilterState>(createPortfolioFilterState())

const emit = defineEmits<{
  (e: 'filter-change', filters: PortfolioFilterState): void
  (e: 'reset'): void
}>()

const withAll = (label: string, options: PortfolioOption[]): PortfolioOption[] => [
  { label, value: '' },
  ...options
]

const industryOptions = withAll('All Industries', portfolioIndustryOptions)
const companySizeOptions = withAll('All Company Sizes', portfolioCompanySizeOptions)
const legalStructureOptions = withAll('All Legal Structures', portfolioLegalStructureOptions)
const businessUnitOptions = withAll('All Business Units', portfolioBusinessUnitOptions)
const productOptions = withAll('All Products', portfolioProductOptions)
const customerTypeOptions = withAll('All Customer Types', portfolioCustomerTypeOptions)
const productStatusOptions = withAll('All Product Statuses', portfolioProductStatusOptions)
const projectStatusOptions = withAll('All Project Statuses', portfolioProjectStatusOptions)
const frontendStackOptions = withAll('All Frontend Stacks', portfolioFrontendStackOptions)
const backendStackOptions = withAll('All Backend Stacks', portfolioBackendStackOptions)
const databaseOptions = withAll('All Databases', portfolioDatabaseOptions)

const yearOptions = [
  { label: 'All Years', value: '' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' }
]

const selectClass = 'h-9.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors focus:border-blue-500 focus:outline-none cursor-pointer'

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
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-[260px] flex-1">
        <div
          class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
        >
          <UIcon
            name="i-lucide-search"
            class="h-4 w-4"
          />
        </div>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search project name, client, or keyword..."
          class="w-full rounded-lg border border-slate-200 bg-white py-2 pr-4 pl-9 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="handleSearch"
        >
      </div>

      <button
        type="button"
        class="inline-flex h-9.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 cursor-pointer"
        @click="handleReset"
      >
        <UIcon
          name="i-lucide-rotate-ccw"
          class="h-3.5 w-3.5 text-slate-500"
        />
        <span>Reset</span>
      </button>
    </div>

    <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <select
        v-model="filters.industry"
        :class="selectClass"
        aria-label="Filter by industry"
        @change="handleSearch"
      >
        <option
          v-for="opt in industryOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.companySize"
        :class="selectClass"
        aria-label="Filter by company size"
        @change="handleSearch"
      >
        <option
          v-for="opt in companySizeOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.product"
        :class="selectClass"
        aria-label="Filter by product"
        @change="handleSearch"
      >
        <option
          v-for="opt in productOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.status"
        :class="selectClass"
        aria-label="Filter by project status"
        @change="handleSearch"
      >
        <option
          v-for="opt in projectStatusOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.legalStructure"
        :class="selectClass"
        aria-label="Filter by legal structure"
        @change="handleSearch"
      >
        <option
          v-for="opt in legalStructureOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.businessUnit"
        :class="selectClass"
        aria-label="Filter by business unit"
        @change="handleSearch"
      >
        <option
          v-for="opt in businessUnitOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.customerType"
        :class="selectClass"
        aria-label="Filter by customer type"
        @change="handleSearch"
      >
        <option
          v-for="opt in customerTypeOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.productStatus"
        :class="selectClass"
        aria-label="Filter by product status"
        @change="handleSearch"
      >
        <option
          v-for="opt in productStatusOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.frontendStack"
        :class="selectClass"
        aria-label="Filter by frontend stack"
        @change="handleSearch"
      >
        <option
          v-for="opt in frontendStackOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.backendStack"
        :class="selectClass"
        aria-label="Filter by backend stack"
        @change="handleSearch"
      >
        <option
          v-for="opt in backendStackOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.database"
        :class="selectClass"
        aria-label="Filter by database"
        @change="handleSearch"
      >
        <option
          v-for="opt in databaseOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <select
        v-model="filters.year"
        :class="selectClass"
        aria-label="Filter by year"
        @change="handleSearch"
      >
        <option
          v-for="opt in yearOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>
  </div>
</template>
