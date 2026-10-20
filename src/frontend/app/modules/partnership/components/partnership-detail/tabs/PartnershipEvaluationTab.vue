<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

type Recommendation
  = | 'Continue'
    | 'Continue with Improvement'
    | 'Review Required'
    | 'At Risk'

interface ScorecardRow {
  no: number | null
  criteria: string
  weight: string
  score: string
  weightedScore: string
  remarks: string
  isTotal?: boolean
}

interface ScorecardPeriod {
  key: string
  label: string
  rows: ScorecardRow[]
}

interface EvaluationRecord {
  id: string
  date: string
  year: string
  evaluator: string
  initials: string
  department: string
  score: string
  recommendation: Recommendation
  notes: string
}

interface RowMenuItem {
  label: string
  icon: string
  color?: 'error'
  onSelect: () => void
}

// 1. Performance Scorecard Data
const scorecardPeriods: ScorecardPeriod[] = [
  {
    key: '2026-08',
    label: 'Aug 2026 (Latest)',
    rows: [
      {
        no: 1,
        criteria: 'Project Delivery',
        weight: '30%',
        score: '88 / 100',
        weightedScore: '26.4',
        remarks: 'Timely delivery and good quality.'
      },
      {
        no: 2,
        criteria: 'Technical Capability',
        weight: '25%',
        score: '90 / 100',
        weightedScore: '22.5',
        remarks: 'Strong technical expertise and support.'
      },
      {
        no: 3,
        criteria: 'Communication & Responsiveness',
        weight: '20%',
        score: '80 / 100',
        weightedScore: '16.0',
        remarks: 'Generally responsive with minor delays.'
      },
      {
        no: 4,
        criteria: 'Commercial Alignment',
        weight: '15%',
        score: '82 / 100',
        weightedScore: '12.3',
        remarks: 'Aligned with business objectives.'
      },
      {
        no: 5,
        criteria: 'Compliance & Governance',
        weight: '10%',
        score: '85 / 100',
        weightedScore: '8.5',
        remarks: 'No major issues.'
      },
      {
        no: null,
        criteria: 'Total Score',
        weight: '100%',
        score: '85 / 100',
        weightedScore: '85.0',
        remarks: '-',
        isTotal: true
      }
    ]
  },
  {
    key: '2026-02',
    label: 'Feb 2026',
    rows: [
      {
        no: 1,
        criteria: 'Project Delivery',
        weight: '30%',
        score: '80 / 100',
        weightedScore: '24.0',
        remarks: 'Delivered on schedule with minor issues.'
      },
      {
        no: 2,
        criteria: 'Technical Capability',
        weight: '25%',
        score: '82 / 100',
        weightedScore: '20.5',
        remarks: 'Reliable technical support.'
      },
      {
        no: 3,
        criteria: 'Communication & Responsiveness',
        weight: '20%',
        score: '74 / 100',
        weightedScore: '14.8',
        remarks: 'Occasional delays in response.'
      },
      {
        no: 4,
        criteria: 'Commercial Alignment',
        weight: '15%',
        score: '78 / 100',
        weightedScore: '11.7',
        remarks: 'Generally aligned with objectives.'
      },
      {
        no: 5,
        criteria: 'Compliance & Governance',
        weight: '10%',
        score: '70 / 100',
        weightedScore: '7.0',
        remarks: 'Minor documentation gaps.'
      },
      {
        no: null,
        criteria: 'Total Score',
        weight: '100%',
        score: '78 / 100',
        weightedScore: '78.0',
        remarks: '-',
        isTotal: true
      }
    ]
  },
  {
    key: '2025-08',
    label: 'Aug 2025',
    rows: [
      {
        no: 1,
        criteria: 'Project Delivery',
        weight: '30%',
        score: '72 / 100',
        weightedScore: '21.6',
        remarks: 'Good delivery with some delays.'
      },
      {
        no: 2,
        criteria: 'Technical Capability',
        weight: '25%',
        score: '76 / 100',
        weightedScore: '19.0',
        remarks: 'Competent technical team.'
      },
      {
        no: 3,
        criteria: 'Communication & Responsiveness',
        weight: '20%',
        score: '70 / 100',
        weightedScore: '14.0',
        remarks: 'Response times inconsistent.'
      },
      {
        no: 4,
        criteria: 'Commercial Alignment',
        weight: '15%',
        score: '68 / 100',
        weightedScore: '10.2',
        remarks: 'Partial alignment with goals.'
      },
      {
        no: 5,
        criteria: 'Compliance & Governance',
        weight: '10%',
        score: '72 / 100',
        weightedScore: '7.2',
        remarks: 'No critical findings.'
      },
      {
        no: null,
        criteria: 'Total Score',
        weight: '100%',
        score: '72 / 100',
        weightedScore: '72.0',
        remarks: '-',
        isTotal: true
      }
    ]
  },
  {
    key: '2025-02',
    label: 'Feb 2025',
    rows: [
      {
        no: 1,
        criteria: 'Project Delivery',
        weight: '30%',
        score: '68 / 100',
        weightedScore: '20.4',
        remarks: 'Delivery timelines need improvement.'
      },
      {
        no: 2,
        criteria: 'Technical Capability',
        weight: '25%',
        score: '70 / 100',
        weightedScore: '17.5',
        remarks: 'Adequate technical capability.'
      },
      {
        no: 3,
        criteria: 'Communication & Responsiveness',
        weight: '20%',
        score: '65 / 100',
        weightedScore: '13.0',
        remarks: 'Slow response to requests.'
      },
      {
        no: 4,
        criteria: 'Commercial Alignment',
        weight: '15%',
        score: '70 / 100',
        weightedScore: '10.5',
        remarks: 'Aligned on core objectives.'
      },
      {
        no: 5,
        criteria: 'Compliance & Governance',
        weight: '10%',
        score: '66 / 100',
        weightedScore: '6.6',
        remarks: 'Some policy gaps identified.'
      },
      {
        no: null,
        criteria: 'Total Score',
        weight: '100%',
        score: '68 / 100',
        weightedScore: '68.0',
        remarks: '-',
        isTotal: true
      }
    ]
  }
]

// 2. Evaluation History Data
const evaluations: EvaluationRecord[] = [
  {
    id: 'EVAL-2026-08',
    date: '28 Aug 2026',
    year: '2026',
    evaluator: 'Sarah Wijaya',
    initials: 'SW',
    department: 'Partnership Management',
    score: '85 / 100',
    recommendation: 'Continue',
    notes:
      'The partner has demonstrated strong performance across most areas, especially in technical capability and project delivery. Communication has been generally responsive, with some opportunities for improvement. Overall, the partnership remains strategic and valuable to our business.'
  },
  {
    id: 'EVAL-2026-02',
    date: '15 Feb 2026',
    year: '2026',
    evaluator: 'Andi Pratama',
    initials: 'AP',
    department: 'Partnership Management',
    score: '78 / 100',
    recommendation: 'Continue with Improvement',
    notes:
      'Project delivery and technical capability remain solid. Communication response times need improvement, and commercial alignment should be strengthened in the next collaboration cycle.'
  },
  {
    id: 'EVAL-2025-08',
    date: '20 Aug 2025',
    year: '2025',
    evaluator: 'Sarah Wijaya',
    initials: 'SW',
    department: 'Partnership Management',
    score: '72 / 100',
    recommendation: 'Review Required',
    notes:
      'Delivery timelines slipped on two workstreams and communication was inconsistent. Technical quality is acceptable, but a formal improvement plan is required before expanding the engagement.'
  },
  {
    id: 'EVAL-2025-02',
    date: '10 Feb 2025',
    year: '2025',
    evaluator: 'Dian Novita',
    initials: 'DN',
    department: 'Business Development',
    score: '68 / 100',
    recommendation: 'At Risk',
    notes:
      'Performance fell below expectations in delivery, communication, and commercial alignment. Escalation is recommended, with a follow-up review to determine the future of the partnership.'
  }
]

// 3. Scorecard Period Filter
const selectedPeriodKey = ref(scorecardPeriods[0]?.key ?? '')

const selectedPeriod = computed(
  () => scorecardPeriods.find(period => period.key === selectedPeriodKey.value) ?? scorecardPeriods[0]!
)

// 4. History Filter State
const search = ref('')
const yearFilter = ref('')
const recommendationFilter = ref('')

const yearOptions = computed(() =>
  [...new Set(evaluations.map(evaluation => evaluation.year))].sort((a, b) =>
    b.localeCompare(a)
  )
)

// 5. Filtered Data
const filteredEvaluations = computed(() =>
  evaluations.filter((evaluation) => {
    const keyword = search.value.trim().toLowerCase()
    const matchSearch
      = !keyword
        || evaluation.date.toLowerCase().includes(keyword)
        || evaluation.evaluator.toLowerCase().includes(keyword)
        || evaluation.department.toLowerCase().includes(keyword)
        || evaluation.recommendation.toLowerCase().includes(keyword)
    const matchYear = !yearFilter.value || evaluation.year === yearFilter.value
    const matchRecommendation
      = !recommendationFilter.value || evaluation.recommendation === recommendationFilter.value

    return matchSearch && matchYear && matchRecommendation
  })
)

// 6. Pagination
const pageSize = 4
const page = ref(1)

watch([search, yearFilter, recommendationFilter], () => {
  page.value = 1
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredEvaluations.value.length / pageSize))
)

const pagedEvaluations = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredEvaluations.value.slice(start, start + pageSize)
})

const rangeStart = computed(() =>
  filteredEvaluations.value.length === 0 ? 0 : (page.value - 1) * pageSize + 1
)

const rangeEnd = computed(() =>
  Math.min(page.value * pageSize, filteredEvaluations.value.length)
)

// 7. Badge Helpers
const getRecommendationClass = (recommendation: Recommendation) => {
  switch (recommendation) {
    case 'Continue':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Continue with Improvement':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Review Required':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'At Risk':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

// 8. Actions & Detail Dialog
const selectedRecord = ref<EvaluationRecord | null>(null)

const openDetail = (record: EvaluationRecord) => {
  selectedRecord.value = record
}

const closeDetail = () => {
  selectedRecord.value = null
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && selectedRecord.value) {
    closeDetail()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const getRowMenuItems = (record: EvaluationRecord): RowMenuItem[][] => [
  [
    {
      label: 'View Details',
      icon: 'i-lucide-eye',
      onSelect: () => openDetail(record)
    },
    {
      label: 'Download Report',
      icon: 'i-lucide-download',
      onSelect: () => alert(`Downloading evaluation report: ${record.id}`)
    }
  ],
  [
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: () => alert(`Delete evaluation: ${record.id}`)
    }
  ]
]
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 1. Performance Summary Cards -->
    <div class="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Card 1: Latest Performance Score -->
      <div class="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <UIcon
            name="i-lucide-bar-chart-2"
            class="h-5 w-5"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Latest Performance Score
          </p>
          <div class="mt-1.5 flex items-center gap-2">
            <p class="text-[28px] leading-none font-bold text-slate-900">
              85 / 100
            </p>
            <span class="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600">
              <UIcon
                name="i-lucide-arrow-up"
                class="h-3.5 w-3.5"
              />
              +5
            </span>
          </div>
          <p class="mt-1.5 text-xs leading-snug text-slate-400">
            vs. previous evaluation
          </p>
        </div>
      </div>

      <!-- Card 2: Last Evaluation -->
      <div class="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <UIcon
            name="i-lucide-calendar"
            class="h-5 w-5"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Last Evaluation
          </p>
          <p class="mt-1.5 text-xl leading-none font-bold text-slate-900">
            28 Aug 2026
          </p>
          <p class="mt-1.5 text-xs leading-tight font-medium text-slate-600">
            Sarah Wijaya
          </p>
          <p class="text-[11px] leading-tight text-slate-400">
            Partnership Management
          </p>
        </div>
      </div>

      <!-- Card 3: Next Evaluation -->
      <div class="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <UIcon
            name="i-lucide-calendar-clock"
            class="h-5 w-5"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Next Evaluation
          </p>
          <p class="mt-1.5 text-xl leading-none font-bold text-slate-900">
            28 Aug 2027
          </p>
          <p class="mt-1.5 text-xs leading-tight font-medium text-amber-600">
            in 10 months
          </p>
        </div>
      </div>

      <!-- Card 4: Renewal Recommendation -->
      <div class="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <UIcon
            name="i-lucide-thumbs-up"
            class="h-5 w-5"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Renewal Recommendation
          </p>
          <p class="mt-1.5">
            <span class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              Continue Partnership
            </span>
          </p>
          <p class="mt-1.5 text-xs leading-snug text-slate-400">
            Based on latest evaluation
          </p>
        </div>
      </div>
    </div>

    <!-- 2. Performance Scorecard -->
    <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
      <div
        class="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <h2 class="text-base font-semibold tracking-tight text-slate-900">
              Performance Scorecard
            </h2>
            <UIcon
              name="i-lucide-info"
              class="h-3.5 w-3.5 shrink-0 text-slate-400"
            />
          </div>
          <p class="mt-0.5 text-xs leading-snug text-slate-500">
            Weighted evaluation criteria and scores for the selected period.
          </p>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-2">
          <span class="text-xs font-medium whitespace-nowrap text-slate-500">Evaluation Period</span>
          <select
            v-model="selectedPeriodKey"
            class="h-9 min-w-0 shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option
              v-for="period in scorecardPeriods"
              :key="period.key"
              :value="period.key"
            >
              {{ period.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-3 min-w-0 overflow-x-auto rounded-lg border border-slate-200">
        <table class="w-full min-w-[860px] table-fixed text-left text-[13px]">
          <thead class="bg-blue-50 text-xs font-semibold tracking-wide whitespace-nowrap text-blue-700">
            <tr>
              <th class="w-[6%] border border-slate-200 px-3 py-2.5 text-center">
                No.
              </th>
              <th class="w-[24%] border border-slate-200 px-3 py-2.5">
                Evaluation Criteria
              </th>
              <th class="w-[10%] border border-slate-200 px-3 py-2.5 text-center">
                Weight
              </th>
              <th class="w-[13%] border border-slate-200 px-3 py-2.5 text-center">
                Score
              </th>
              <th class="w-[13%] border border-slate-200 px-3 py-2.5 text-center">
                Weighted Score
              </th>
              <th class="w-[34%] border border-slate-200 px-3 py-2.5">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in selectedPeriod.rows"
              :key="`${selectedPeriod.key}-${row.criteria}`"
              class="transition-colors hover:bg-slate-50/60"
              :class="row.isTotal ? 'bg-blue-50/70 font-semibold text-slate-900' : 'text-slate-700'"
            >
              <td class="border border-slate-200 px-3 py-2.5 text-center align-middle whitespace-nowrap text-slate-500">
                {{ row.no ?? '-' }}
              </td>
              <td class="border border-slate-200 px-3 py-2.5 align-middle font-medium">
                {{ row.criteria }}
              </td>
              <td class="border border-slate-200 px-3 py-2.5 text-center align-middle whitespace-nowrap">
                {{ row.weight }}
              </td>
              <td class="border border-slate-200 px-3 py-2.5 text-center align-middle whitespace-nowrap">
                {{ row.score }}
              </td>
              <td class="border border-slate-200 px-3 py-2.5 text-center align-middle whitespace-nowrap font-semibold">
                {{ row.weightedScore }}
              </td>
              <td class="border border-slate-200 px-3 py-2.5 align-middle text-slate-600">
                {{ row.remarks }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. Bottom Row: Evaluation History vs Latest Evaluation Details -->
    <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
      <!-- Left: Evaluation History (~60%) -->
      <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs lg:col-span-7">
        <div
          class="flex flex-col gap-3 border-b border-slate-100 pb-3 2xl:flex-row 2xl:items-center 2xl:justify-between"
        >
          <div class="flex shrink-0 items-center gap-1.5">
            <h2 class="text-lg font-semibold tracking-tight whitespace-nowrap text-slate-900">
              Evaluation History
            </h2>
            <UIcon
              name="i-lucide-info"
              class="h-4 w-4 shrink-0 text-slate-400"
            />
          </div>

          <!-- Controls: Search, Year Filter, Recommendation Filter (single row on desktop) -->
          <div class="flex min-w-0 flex-wrap items-center gap-2.5 2xl:flex-nowrap">
            <div class="relative w-full min-w-0 sm:w-52">
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
                placeholder="Search evaluation..."
                class="h-11 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
            </div>

            <select
              v-model="yearFilter"
              class="h-11 w-32 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
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

            <select
              v-model="recommendationFilter"
              class="h-11 w-48 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="">
                All Recommendation
              </option>
              <option value="Continue">
                Continue
              </option>
              <option value="Continue with Improvement">
                Continue with Improvement
              </option>
              <option value="Review Required">
                Review Required
              </option>
              <option value="At Risk">
                At Risk
              </option>
            </select>
          </div>
        </div>

        <div class="mt-3 min-w-0 overflow-x-auto">
          <table class="w-full table-fixed text-left text-xs">
            <thead class="border-b border-slate-200 bg-blue-50/60 text-xs font-semibold tracking-tight text-slate-500">
              <tr>
                <th class="w-[16%] px-1.5 py-2.5 leading-tight break-words">
                  Evaluation Date
                </th>
                <th class="w-[20%] px-1.5 py-2.5">
                  Evaluator
                </th>
                <th class="w-[14%] px-1 py-2.5 text-center leading-tight break-words">
                  Performance Score
                </th>
                <th class="w-[24%] px-1.5 py-2.5 leading-tight break-words">
                  Recommendation
                </th>
                <th class="w-[26%] px-1 py-2.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="evaluation in pagedEvaluations"
                :key="evaluation.id"
                class="transition-colors hover:bg-slate-50/60"
              >
                <td class="px-1.5 py-2 text-slate-600">
                  {{ evaluation.date }}
                </td>

                <td class="px-1.5 py-2">
                  <div class="flex items-center gap-2">
                    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600">
                      {{ evaluation.initials }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-xs font-semibold text-slate-800">
                        {{ evaluation.evaluator }}
                      </p>
                      <p class="truncate text-[11px] text-slate-400">
                        {{ evaluation.department }}
                      </p>
                    </div>
                  </div>
                </td>

                <td class="px-1 py-2 text-center whitespace-nowrap">
                  <span class="text-xs font-bold text-slate-800">{{ evaluation.score }}</span>
                </td>

                <td class="px-1.5 py-2 break-words">
                  <span
                    class="inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-center text-[11px] leading-tight font-semibold"
                    :class="getRecommendationClass(evaluation.recommendation)"
                  >
                    {{ evaluation.recommendation }}
                  </span>
                </td>

                <td class="px-1 py-2">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
                      @click="openDetail(evaluation)"
                    >
                      <UIcon
                        name="i-lucide-eye"
                        class="h-3.5 w-3.5"
                      />
                      <span>View</span>
                    </button>

                    <UDropdownMenu
                      :items="getRowMenuItems(evaluation)"
                      :content="{ align: 'end' }"
                    >
                      <button
                        type="button"
                        class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                        aria-label="Evaluation actions"
                      >
                        <UIcon
                          name="i-lucide-ellipsis-vertical"
                          class="h-4 w-4"
                        />
                      </button>
                    </UDropdownMenu>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredEvaluations.length === 0">
                <td
                  colspan="5"
                  class="px-4 py-6 text-center"
                >
                  <div class="flex flex-col items-center gap-1.5">
                    <UIcon
                      name="i-lucide-search-x"
                      class="h-6 w-6 text-slate-300"
                    />
                    <p class="text-xs font-semibold text-slate-600">
                      No evaluations found
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
          <p class="text-xs text-slate-500">
            Showing
            <span class="font-semibold text-slate-700">{{ rangeStart }}</span>
            to
            <span class="font-semibold text-slate-700">{{ rangeEnd }}</span>
            of
            <span class="font-semibold text-slate-700">{{ filteredEvaluations.length }}</span>
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

      <!-- Right: Latest Evaluation Details (~40%) -->
      <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs lg:col-span-5">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div class="flex min-w-0 items-center gap-2">
            <h2 class="text-base font-semibold tracking-tight text-slate-900">
              Latest Evaluation Details
            </h2>
            <span class="inline-flex shrink-0 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Latest
            </span>
          </div>
          <span class="text-xs font-medium whitespace-nowrap text-slate-400">28 Aug 2026</span>
        </div>

        <div class="mt-4 space-y-4">
          <!-- Evaluation Notes -->
          <div>
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-file-text"
                class="h-4 w-4 shrink-0 text-blue-600"
              />
              <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Evaluation Notes
              </p>
            </div>
            <p class="mt-1.5 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-[13px] leading-relaxed text-slate-600">
              The partner has demonstrated strong performance across most areas, especially in
              technical capability and project delivery. Communication has been generally
              responsive, with some opportunities for improvement. Overall, the partnership
              remains strategic and valuable to our business.
            </p>
          </div>

          <!-- Renewal Recommendation -->
          <div>
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-thumbs-up"
                class="h-4 w-4 shrink-0 text-blue-600"
              />
              <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Renewal Recommendation
              </p>
            </div>
            <p class="mt-1.5">
              <span class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                Continue Partnership
              </span>
            </p>
          </div>

          <!-- Recommendation Details -->
          <div>
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-clipboard-list"
                class="h-4 w-4 shrink-0 text-blue-600"
              />
              <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Recommendation Details
              </p>
            </div>
            <p class="mt-1.5 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-[13px] leading-relaxed text-slate-600">
              Recommend continuing the partnership, focusing on improving communication response
              time and expanding collaboration into new portfolio opportunities.
            </p>
          </div>

          <!-- Next Evaluation Date -->
          <div>
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-calendar-clock"
                class="h-4 w-4 shrink-0 text-blue-600"
              />
              <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Next Evaluation Date
              </p>
            </div>
            <p class="mt-1.5 flex flex-wrap items-center gap-2">
              <span class="text-sm font-bold text-slate-900">28 August 2027</span>
              <span class="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                in 10 months
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Evaluation Detail Dialog -->
    <Teleport to="body">
      <div
        v-if="selectedRecord"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evaluation-detail-title"
        @click.self="closeDetail"
      >
        <div
          class="fixed inset-0 bg-slate-900/40"
          @click="closeDetail"
        />

        <div class="relative z-10 w-full max-w-md rounded-xl border border-slate-200/80 bg-white shadow-lg">
          <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3
              id="evaluation-detail-title"
              class="text-base font-semibold tracking-tight text-slate-900"
            >
              Evaluation Details
            </h3>
            <button
              type="button"
              class="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Close dialog"
              @click="closeDetail"
            >
              <UIcon
                name="i-lucide-x"
                class="h-4 w-4"
              />
            </button>
          </div>

          <div class="space-y-3 px-4 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                {{ selectedRecord.initials }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900">
                  {{ selectedRecord.evaluator }}
                </p>
                <p class="text-xs text-slate-400">
                  {{ selectedRecord.department }}
                </p>
              </div>
            </div>

            <div class="space-y-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs">
              <div class="flex items-center justify-between gap-3">
                <span class="font-medium text-slate-400">Evaluation Date</span>
                <span class="font-semibold text-slate-800">{{ selectedRecord.date }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="font-medium text-slate-400">Performance Score</span>
                <span class="font-bold text-slate-800">{{ selectedRecord.score }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="font-medium text-slate-400">Recommendation</span>
                <span
                  class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                  :class="getRecommendationClass(selectedRecord.recommendation)"
                >
                  {{ selectedRecord.recommendation }}
                </span>
              </div>
            </div>

            <div>
              <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Evaluation Notes
              </p>
              <p class="mt-1.5 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs leading-relaxed text-slate-600">
                {{ selectedRecord.notes }}
              </p>
            </div>
          </div>

          <div class="flex justify-end border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              class="inline-flex h-8 items-center rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700 cursor-pointer"
              @click="closeDetail"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
