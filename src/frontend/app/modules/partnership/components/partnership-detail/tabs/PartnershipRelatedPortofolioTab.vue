<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface SummaryCard {
  label: string
  value: string
  description: string
  icon: string
  iconClass: string
}

type PortfolioCategory
  = | 'Digital Infrastructure'
    | 'Data & Analytics'
    | 'AI & Machine Learning'
    | 'Security'
    | 'Enablement'

type PortfolioStatus = 'Completed' | 'Ongoing'

interface RelatedPortfolio {
  id: string
  no: number
  name: string
  description: string
  category: PortfolioCategory
  contribution: string
  startDate: string
  endDate: string
  status: PortfolioStatus
  year: string
}

// 1. Summary Cards
const summaryCards: SummaryCard[] = [
  {
    label: 'Total Related Portfolios',
    value: '5',
    description: 'Projects involving this partner',
    icon: 'i-lucide-folder',
    iconClass: 'bg-blue-50 text-blue-600'
  },
  {
    label: 'Active Portfolios',
    value: '3',
    description: 'Currently in progress',
    icon: 'i-lucide-play-circle',
    iconClass: 'bg-emerald-50 text-emerald-600'
  },
  {
    label: 'Completed Portfolios',
    value: '2',
    description: 'Successfully completed',
    icon: 'i-lucide-check-circle',
    iconClass: 'bg-purple-50 text-purple-600'
  },
  {
    label: 'Total Portfolio Value',
    value: 'IDR 12.5B',
    description: 'From related portfolios',
    icon: 'i-lucide-bar-chart-2',
    iconClass: 'bg-blue-50 text-blue-600'
  }
]

// 2. Related Portfolios Mock Data
const portfolios: RelatedPortfolio[] = [
  {
    id: 'PF-2024-001',
    no: 1,
    name: 'Cloud Infrastructure Migration',
    description: 'Migration of on-premise infrastructure to Google Cloud.',
    category: 'Digital Infrastructure',
    contribution:
      'Cloud infrastructure design, migration support, and technical consulting.',
    startDate: 'Jan 15, 2024',
    endDate: 'Dec 20, 2024',
    status: 'Completed',
    year: '2024'
  },
  {
    id: 'PF-2024-002',
    no: 2,
    name: 'Data Analytics Platform',
    description: 'Implementation of enterprise data analytics platform.',
    category: 'Data & Analytics',
    contribution:
      'BigQuery implementation, data analytics consulting, and training.',
    startDate: 'Mar 1, 2024',
    endDate: 'Dec 31, 2024',
    status: 'Completed',
    year: '2024'
  },
  {
    id: 'PF-2024-003',
    no: 3,
    name: 'AI Customer Insights',
    description: 'Development of AI-powered customer insights solution.',
    category: 'AI & Machine Learning',
    contribution:
      'Vertex AI implementation, model development support, and knowledge transfer.',
    startDate: 'Aug 1, 2024',
    endDate: 'Jun 30, 2025',
    status: 'Ongoing',
    year: '2024'
  },
  {
    id: 'PF-2024-004',
    no: 4,
    name: 'Security Enhancement Program',
    description: 'Cloud security assessment and implementation.',
    category: 'Security',
    contribution:
      'Security assessment, best practice recommendation, and implementation support.',
    startDate: 'Sep 1, 2024',
    endDate: 'Feb 28, 2025',
    status: 'Completed',
    year: '2024'
  },
  {
    id: 'PF-2025-005',
    no: 5,
    name: 'Developer Enablement Initiative',
    description: 'Workshop series for internal developer community.',
    category: 'Enablement',
    contribution: 'Provide Google Cloud experts and training materials.',
    startDate: 'Apr 15, 2025',
    endDate: 'Apr 16, 2025',
    status: 'Ongoing',
    year: '2025'
  }
]

// 3. Filter State
const search = ref('')
const statusFilter = ref('')
const yearFilter = ref('')

const yearOptions = computed(() =>
  [...new Set(portfolios.map(portfolio => portfolio.year))].sort((a, b) =>
    b.localeCompare(a)
  )
)

// 4. Filtered Data
const filteredPortfolios = computed(() =>
  portfolios.filter((portfolio) => {
    const keyword = search.value.trim().toLowerCase()
    const matchSearch
      = !keyword
        || portfolio.name.toLowerCase().includes(keyword)
        || portfolio.description.toLowerCase().includes(keyword)
        || portfolio.category.toLowerCase().includes(keyword)
        || portfolio.contribution.toLowerCase().includes(keyword)
    const matchStatus
      = !statusFilter.value || portfolio.status === statusFilter.value
    const matchYear = !yearFilter.value || portfolio.year === yearFilter.value

    return matchSearch && matchStatus && matchYear
  })
)

// 5. Pagination
const pageSize = 5
const page = ref(1)

watch([search, statusFilter, yearFilter], () => {
  page.value = 1
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPortfolios.value.length / pageSize))
)

const pagedPortfolios = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredPortfolios.value.slice(start, start + pageSize)
})

const rangeStart = computed(() =>
  filteredPortfolios.value.length === 0 ? 0 : (page.value - 1) * pageSize + 1
)

const rangeEnd = computed(() =>
  Math.min(page.value * pageSize, filteredPortfolios.value.length)
)

// 6. Badge Helpers
const getCategoryClass = (category: PortfolioCategory) => {
  switch (category) {
    case 'Digital Infrastructure':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Data & Analytics':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'AI & Machine Learning':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'Security':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'Enablement':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

const getStatusClass = (status: PortfolioStatus) =>
  status === 'Completed'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-blue-50 text-blue-700 border-blue-200'
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- 1. Summary Cards -->
    <div class="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="flex min-h-[112px] items-center gap-4 rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-2xs"
      >
        <div
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
          :class="card.iconClass"
        >
          <UIcon
            :name="card.icon"
            class="h-6 w-6"
          />
        </div>
        <div class="min-w-0">
          <p class="text-[13px] leading-tight font-semibold text-slate-700">
            {{ card.label }}
          </p>
          <p class="mt-1 text-2xl leading-none font-bold text-slate-900">
            {{ card.value }}
          </p>
          <p class="mt-1 text-xs leading-tight text-slate-400">
            {{ card.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- 2. Related Portfolios Panel -->
    <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
      <div
        class="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="min-w-0">
          <h2 class="text-lg leading-tight font-semibold tracking-tight text-slate-900">
            Related Portfolios
          </h2>
          <p class="mt-0.5 text-[13px] leading-snug text-slate-500">
            List of portfolio projects that involve this partner and their contribution.
          </p>
        </div>

        <!-- Controls: Search, Status Filter, Year Filter -->
        <div class="flex flex-wrap items-center gap-2 lg:flex-nowrap">
          <div class="relative w-full min-w-0 sm:w-64 lg:w-72">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
            >
              <UIcon
                name="i-lucide-search"
                class="h-4 w-4"
              />
            </div>
            <input
              v-model="search"
              type="text"
              placeholder="Search portfolio name or description..."
              class="h-10 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-[13px] text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
          </div>

          <select
            v-model="statusFilter"
            class="h-10 min-w-0 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="">
              All Status
            </option>
            <option value="Completed">
              Completed
            </option>
            <option value="Ongoing">
              Ongoing
            </option>
          </select>

          <select
            v-model="yearFilter"
            class="h-10 min-w-0 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="">
              All Years
            </option>
            <option
              v-for="year in yearOptions"
              :key="year"
              :value="year"
            >
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-3 min-w-0 overflow-x-auto rounded-lg border border-slate-200">
        <table class="w-full min-w-[960px] table-fixed text-left">
          <thead
            class="bg-slate-50 text-xs font-semibold tracking-wide whitespace-nowrap text-slate-700"
          >
            <tr class="border-b border-slate-200">
              <th class="w-[4%] border-r border-slate-200 px-3 py-2.5 text-center">
                No.
              </th>
              <th class="w-[26%] border-r border-slate-200 px-3 py-2.5">
                Portfolio / Project
              </th>
              <th class="w-[14%] border-r border-slate-200 px-3 py-2.5">
                Category
              </th>
              <th class="w-[26%] border-r border-slate-200 px-3 py-2.5">
                Partner Contribution
              </th>
              <th class="w-[10%] border-r border-slate-200 px-3 py-2.5 text-center">
                Start Date
              </th>
              <th class="w-[10%] border-r border-slate-200 px-3 py-2.5 text-center">
                End Date
              </th>
              <th class="w-[10%] px-3 py-2.5 text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="portfolio in pagedPortfolios"
              :key="portfolio.id"
              class="h-[68px] border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/60"
            >
              <td class="border-r border-slate-100 px-3 py-2 text-center align-middle text-xs text-slate-500">
                {{ portfolio.no }}
              </td>

              <td class="border-r border-slate-100 px-3 py-2 align-middle">
                <p class="text-[13px] leading-tight font-semibold text-blue-600">
                  {{ portfolio.name }}
                </p>
                <p class="mt-0.5 text-xs leading-snug text-slate-500">
                  {{ portfolio.description }}
                </p>
              </td>

              <td class="border-r border-slate-100 px-3 py-2 align-middle whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                  :class="getCategoryClass(portfolio.category)"
                >
                  {{ portfolio.category }}
                </span>
              </td>

              <td class="border-r border-slate-100 px-3 py-2 align-middle text-xs leading-snug text-slate-600">
                {{ portfolio.contribution }}
              </td>

              <td class="border-r border-slate-100 px-3 py-2 text-center align-middle text-xs whitespace-nowrap text-slate-500">
                {{ portfolio.startDate }}
              </td>

              <td class="border-r border-slate-100 px-3 py-2 text-center align-middle text-xs whitespace-nowrap text-slate-500">
                {{ portfolio.endDate }}
              </td>

              <td class="px-3 py-2 text-center align-middle whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                  :class="getStatusClass(portfolio.status)"
                >
                  {{ portfolio.status }}
                </span>
              </td>
            </tr>

            <tr v-if="filteredPortfolios.length === 0">
              <td
                colspan="7"
                class="px-4 py-6 text-center"
              >
                <div class="flex flex-col items-center gap-1.5">
                  <UIcon
                    name="i-lucide-search-x"
                    class="h-6 w-6 text-slate-300"
                  />
                  <p class="text-xs font-semibold text-slate-600">
                    No portfolios found
                  </p>
                  <p class="text-[11px] text-slate-400">
                    Try adjusting your search or filters.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <p class="text-[13px] text-slate-500">
          Showing
          <span class="font-semibold text-slate-700">{{ rangeStart }}</span>
          to
          <span class="font-semibold text-slate-700">{{ rangeEnd }}</span>
          of
          <span class="font-semibold text-slate-700">{{ filteredPortfolios.length }}</span>
          results
        </p>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            :disabled="page <= 1"
            aria-label="Previous page"
            @click="page--"
          >
            <UIcon
              name="i-lucide-chevron-left"
              class="h-4 w-4"
            />
          </button>

          <button
            v-for="pageNumber in totalPages"
            :key="pageNumber"
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold cursor-pointer"
            :class="[
              page === pageNumber
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            ]"
            @click="page = pageNumber"
          >
            {{ pageNumber }}
          </button>

          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            :disabled="page >= totalPages"
            aria-label="Next page"
            @click="page++"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="h-4 w-4"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
