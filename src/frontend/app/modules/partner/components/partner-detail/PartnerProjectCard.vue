<script setup lang="ts">
import { computed } from 'vue'
import type { PartnerCooperationProject } from '../../types/partner.types'

interface Props {
  project: PartnerCooperationProject
}

const props = defineProps<Props>()

const formatCurrency = (val: number | null) => {
  if (val === null || val === undefined) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  })
    .format(val)
    .replace('IDR', 'Rp')
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const isCompleted = computed(() => {
  return (
    props.project.projectStatusName?.toLowerCase().includes('closed') ||
    props.project.projectStatusName?.toLowerCase().includes('completed') ||
    (props.project.progressPercent !== null && props.project.progressPercent >= 100)
  )
})

const getTechName = (tech: unknown): string => {
  if (typeof tech === 'string') return tech
  if (typeof tech === 'object' && tech !== null && 'name' in tech) {
    return String((tech as { name: unknown }).name)
  }
  return String(tech)
}

const statusBadgeClass = computed(() => {
  if (isCompleted.value) {
    return 'border-slate-200 bg-slate-50 text-slate-600'
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
})

const statusDotClass = computed(() => {
  if (isCompleted.value) return 'bg-slate-400'
  return 'bg-emerald-500'
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
    <!-- Card Top Header Tags -->
    <div class="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
      <div class="flex flex-wrap items-center gap-2">
        <span
          class="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-700"
        >
          {{ project.projectCode }}
        </span>
        <span
          v-if="project.isFeatured"
          class="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60"
        >
          <span>★</span> Featured
        </span>
        <span class="text-xs text-slate-400"> • Year {{ project.year }} </span>
      </div>

      <!-- Status badge -->
      <span
        class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
        :class="statusBadgeClass"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass" />
        {{ project.projectStatusName || (isCompleted ? 'Closed / Completed' : 'On Going') }}
      </span>
    </div>

    <!-- Content Grid (Left & Right) -->
    <div class="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-12">
      <!-- Left Column: Details -->
      <div class="space-y-4 lg:col-span-8">
        <div>
          <h3 class="text-lg font-bold text-slate-900">
            {{ project.projectName }}
          </h3>
          <p class="mt-0.5 text-xs font-medium text-blue-600">
            {{ project.customerName || 'Internal Company' }}
            <span v-if="project.industry" class="text-slate-400 font-normal">
              | {{ project.industry }}
            </span>
          </p>
        </div>

        <!-- Objective Box -->
        <div
          v-if="project.projectObjective"
          class="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-slate-600"
        >
          <strong class="font-semibold text-slate-800">Objective:</strong>
          {{ project.projectObjective }}
        </div>

        <!-- Partner Role & Contribution -->
        <div class="space-y-3 border-l-2 border-blue-500 pl-3.5">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PARTNER ROLE
            </div>
            <div class="text-xs font-bold text-slate-800 mt-0.5">
              {{ project.partnerRole }}
            </div>
          </div>

          <div v-if="project.partnerContribution">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PARTNER CONTRIBUTION
            </div>
            <p class="mt-0.5 text-xs leading-relaxed text-slate-600">
              {{ project.partnerContribution }}
            </p>
          </div>
        </div>

        <!-- Contract Ref & Timeline Bottom Footer -->
        <div class="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
          <!-- Contract Ref -->
          <div class="flex items-start gap-2.5 rounded-xl border border-slate-100 p-3">
            <UIcon name="i-lucide-file-text" class="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
            <div class="min-w-0">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CONTRACT REF
              </div>
              <div class="truncate text-xs font-semibold text-slate-800 mt-0.5">
                {{ project.contractName || 'Partnership Contract' }}
              </div>
              <div v-if="project.contractNumber" class="text-[11px] text-slate-400 font-mono">
                {{ project.contractNumber }}
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="flex items-start gap-2.5 rounded-xl border border-slate-100 p-3">
            <UIcon name="i-lucide-calendar" class="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
            <div class="min-w-0">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                TIMELINE
              </div>
              <div class="text-xs font-semibold text-slate-800 mt-0.5">
                {{ formatDate(project.startDate) }} – {{ formatDate(project.endDate) }}
                <span
                  class="font-normal"
                  :class="isCompleted ? 'text-emerald-600' : 'text-amber-600'"
                >
                  {{
                    isCompleted
                      ? '(Completed)'
                      : project.remainingDays
                        ? `(${project.remainingDays} days left)`
                        : ''
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Financial, Progress & Tech Stacks -->
      <div class="space-y-4 lg:col-span-4 lg:border-l lg:border-slate-100 lg:pl-6">
        <!-- Cover image thumbnail -->
        <div
          class="flex h-36 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 overflow-hidden"
        >
          <img
            v-if="project.coverImageUrl"
            :src="project.coverImageUrl"
            :alt="project.projectName"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex flex-col items-center gap-1.5 p-4 text-center">
            <UIcon name="i-lucide-image" class="h-6 w-6 text-slate-300" />
            <span class="text-[11px] text-slate-400">No cover image available</span>
          </div>
        </div>

        <!-- Value Before Tax -->
        <div v-if="project.valueBeforeTax !== null">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            VALUE BEFORE TAX
          </div>
          <div class="text-sm font-bold text-slate-900 mt-0.5 font-mono">
            {{ formatCurrency(project.valueBeforeTax) }}
          </div>
        </div>

        <!-- Progress -->
        <div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500">Progress</span>
            <span class="font-bold text-blue-600">{{ project.progressPercent ?? 0 }}%</span>
          </div>
          <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-blue-600 transition-all duration-300"
              :style="{ width: `${Math.min(Math.max(project.progressPercent ?? 0, 0), 100)}%` }"
            />
          </div>
        </div>

        <!-- Tech Stack -->
        <div class="space-y-2 pt-2">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            TECHNOLOGY STACK
          </div>

          <!-- Frontend -->
          <div v-if="project.techStacks?.frontend?.length" class="flex items-start gap-2">
            <span class="w-16 text-[11px] text-slate-400 shrink-0 pt-0.5">Frontend:</span>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(tech, idx) in project.techStacks.frontend"
                :key="idx"
                class="rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
              >
                {{ getTechName(tech) }}
              </span>
            </div>
          </div>

          <!-- Backend -->
          <div v-if="project.techStacks?.backend?.length" class="flex items-start gap-2">
            <span class="w-16 text-[11px] text-slate-400 shrink-0 pt-0.5">Backend:</span>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(tech, idx) in project.techStacks.backend"
                :key="idx"
                class="rounded-md border border-sky-200/60 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700"
              >
                {{ getTechName(tech) }}
              </span>
            </div>
          </div>

          <!-- Storage -->
          <div v-if="project.techStacks?.data_storage?.length" class="flex items-start gap-2">
            <span class="w-16 text-[11px] text-slate-400 shrink-0 pt-0.5">Storage:</span>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(tech, idx) in project.techStacks.data_storage"
                :key="idx"
                class="rounded-md border border-purple-200/60 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700"
              >
                {{ getTechName(tech) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
