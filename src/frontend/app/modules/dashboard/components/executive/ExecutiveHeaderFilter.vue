<script setup lang="ts">
import { ref, reactive } from 'vue'

// State toggle untuk membuka/menutup More Filters
const isMoreFiltersOpen = ref(true)

// State form filter
const filters = reactive({
  search: '',
  isFeatured: null as boolean | null, // null: All, true: Yes, false: No
  industry: '',
  status: '',
  year: '',
  companySize: '',
  product: '',
  legalStructure: '',
  businessUnit: '',
  customerType: '',
  frontendStack: '',
  backendStack: '',
  database: ''
})

const emit = defineEmits<{
  (e: 'update:filters', val: typeof filters): void
  (e: 'reset'): void
}>()

const handleReset = () => {
  filters.search = ''
  filters.isFeatured = null
  filters.industry = ''
  filters.status = ''
  filters.year = ''
  filters.companySize = ''
  filters.product = ''
  filters.legalStructure = ''
  filters.businessUnit = ''
  filters.customerType = ''
  filters.frontendStack = ''
  filters.backendStack = ''
  filters.database = ''
  emit('reset')
}

// Styling control input/select yang seragam
const selectClass =
  'h-9 w-full appearance-none rounded-xl border border-slate-200/90 bg-white px-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors'
</script>

<template>
  <div class="space-y-3 font-sans">
    <!-- Header Title -->
    <div>
      <h1 class="text-xl font-bold tracking-tight text-slate-900">Executive Dashboard</h1>
      <p class="text-xs text-slate-500">
        Portfolio performance, revenue metrics, and industry distribution
      </p>
    </div>

    <!-- Filter Baris 1: Search + Reset + Featured Only -->
    <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <!-- Search Input -->
      <div class="relative flex-1">
        <UIcon
          name="i-lucide-search"
          class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search project name, client, or keyword..."
          class="h-10 w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 shadow-2xs hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Reset Button -->
        <button
          type="button"
          class="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors"
          @click="handleReset"
        >
          <UIcon name="i-lucide-rotate-ccw" class="h-3.5 w-3.5 text-slate-400" />
          <span>Reset</span>
        </button>

        <!-- GANTI KODE FEATURED ONLY DENGAN INI: -->
        <div
          class="inline-flex h-10 items-center gap-3 rounded-xl border border-slate-200/90 bg-white px-3 shadow-2xs"
        >
          <span class="text-xs font-bold text-slate-700 select-none">Featured Only</span>

          <!-- Pill Switcher (Kapsul Abu-abu) -->
          <div class="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              class="rounded-md px-3 py-1 font-semibold transition-all cursor-pointer"
              :class="
                filters.isFeatured === true
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              "
              @click="filters.isFeatured = filters.isFeatured === true ? null : true"
            >
              Yes
            </button>
            <button
              type="button"
              class="rounded-md px-3 py-1 font-semibold transition-all cursor-pointer"
              :class="
                filters.isFeatured === false
                  ? 'bg-white text-slate-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              "
              @click="filters.isFeatured = filters.isFeatured === false ? null : false"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Baris 2: Default Filters (Industries, Statuses, Years, More Filters Toggle) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      <!-- Industry -->
      <div class="relative">
        <select v-model="filters.industry" :class="selectClass">
          <option value="">All Industries</option>
          <option value="financial">Financial Services</option>
          <option value="it">Information Technology</option>
        </select>
        <UIcon
          name="i-lucide-chevron-down"
          class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        />
      </div>

      <!-- Project Statuses -->
      <div class="relative">
        <select v-model="filters.status" :class="selectClass">
          <option value="">All Project Statuses</option>
          <option value="on-going">On Going</option>
          <option value="closed">Closed</option>
          <option value="proposal">On Proposal</option>
          <option value="canceled">Canceled</option>
        </select>
        <UIcon
          name="i-lucide-chevron-down"
          class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        />
      </div>

      <!-- Years -->
      <div class="relative">
        <select v-model="filters.year" :class="selectClass">
          <option value="">All Years</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
        <UIcon
          name="i-lucide-chevron-down"
          class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        />
      </div>

      <!-- More Filters Toggle Button -->
      <button
        type="button"
        class="inline-flex h-9 w-full items-center justify-between rounded-xl border border-slate-200/90 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors"
        @click="isMoreFiltersOpen = !isMoreFiltersOpen"
      >
        <span>More Filters</span>
        <UIcon
          name="i-lucide-chevron-up"
          class="h-4 w-4 text-slate-400 transition-transform duration-200"
          :class="{ 'rotate-180': !isMoreFiltersOpen }"
        />
      </button>
    </div>

    <!-- Filter Baris 3: More Filters Container (Expandable Box) -->
    <div
      v-show="isMoreFiltersOpen"
      class="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3.5 space-y-2.5 transition-all"
    >
      <!-- Sub-row 1: Company Sizes, Products, Legal Structures, Business Units -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div class="relative">
          <select v-model="filters.companySize" :class="selectClass">
            <option value="">All Company Sizes</option>
          </select>
          <UIcon
            name="i-lucide-chevron-down"
            class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div class="relative">
          <select v-model="filters.product" :class="selectClass">
            <option value="">All Products</option>
          </select>
          <UIcon
            name="i-lucide-chevron-down"
            class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div class="relative">
          <select v-model="filters.legalStructure" :class="selectClass">
            <option value="">All Legal Structures</option>
          </select>
          <UIcon
            name="i-lucide-chevron-down"
            class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div class="relative">
          <select v-model="filters.businessUnit" :class="selectClass">
            <option value="">All Business Units</option>
          </select>
          <UIcon
            name="i-lucide-chevron-down"
            class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      <!-- Sub-row 2: Customer Types, Frontend Stacks, Backend Stacks, Databases -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div class="relative">
          <select v-model="filters.customerType" :class="selectClass">
            <option value="">All Customer Types</option>
          </select>
          <UIcon
            name="i-lucide-chevron-down"
            class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div class="relative">
          <select v-model="filters.frontendStack" :class="selectClass">
            <option value="">All Frontend Stacks</option>
          </select>
          <UIcon
            name="i-lucide-chevron-down"
            class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div class="relative">
          <select v-model="filters.backendStack" :class="selectClass">
            <option value="">All Backend Stacks</option>
          </select>
          <UIcon
            name="i-lucide-chevron-down"
            class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div class="relative">
          <select v-model="filters.database" :class="selectClass">
            <option value="">All Databases</option>
          </select>
          <UIcon
            name="i-lucide-chevron-down"
            class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>
    </div>
  </div>
</template>
