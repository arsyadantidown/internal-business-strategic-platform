<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectStatus } from '../../types/types'

interface Props {
  status: ProjectStatus
  client?: string
  period?: string
  projectValue?: string
  location?: string
  businessUnit?: string
  projectManager?: string
  accountManager?: string
  contractName?: string
  contractNumber?: string
  lastUpdated?: string
}

const props = withDefaults(defineProps<Props>(), {
  client: '-',
  period: '-',
  projectValue: '-',
  location: '-',
  businessUnit: '-',
  projectManager: '-',
  accountManager: '-',
  contractName: '-',
  contractNumber: '-',
  lastUpdated: '-'
})

// Konfigurasi warna status badge
const statusConfig = computed(() => {
  switch (props.status) {
    case 'Closed':
      return {
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dot: 'bg-emerald-500'
      }
    case 'On Going':
      return {
        badge: 'border-blue-200 bg-blue-50 text-blue-700',
        dot: 'bg-blue-500'
      }
    case 'On Proposal':
      return {
        badge: 'border-amber-200 bg-amber-50 text-amber-700',
        dot: 'bg-amber-500'
      }
    case 'Canceled':
      return {
        badge: 'border-rose-200 bg-rose-50 text-rose-700',
        dot: 'bg-rose-500'
      }
    default:
      return {
        badge: 'border-slate-200 bg-slate-50 text-slate-700',
        dot: 'bg-slate-400'
      }
  }
})
</script>

<template>
  <div class="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
    <!-- Header Card -->
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <h3 class="text-sm font-bold text-slate-900">Project Status</h3>
      <span
        class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
        :class="statusConfig.badge"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="statusConfig.dot" />
        <span>{{ status }}</span>
      </span>
    </div>

    <!-- Metadata Rows -->
    <div class="space-y-3 text-xs">
      <!-- Client -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-user" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Client</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ client }}</span>
      </div>

      <!-- Business Unit -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-building-2" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Business Unit</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ businessUnit }}</span>
      </div>

      <!-- Project Period -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-calendar" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Project Period</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ period }}</span>
      </div>

      <!-- Project Value -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-circle-dollar-sign" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Project Value</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ projectValue }}</span>
      </div>

      <!-- Contract Name -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-file-text" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Contract Name</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ contractName }}</span>
      </div>

      <!-- Contract Number -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-hash" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Contract Number</span>
        </div>
        <span class="font-mono font-semibold text-slate-800 text-right">{{ contractNumber }}</span>
      </div>

      <!-- Project Manager -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-user-check" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Project Manager</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ projectManager }}</span>
      </div>

      <!-- Account Manager -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-briefcase" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Account Manager</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ accountManager }}</span>
      </div>

      <!-- Location -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-map-pin" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Location</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ location }}</span>
      </div>

      <!-- Last Updated -->
      <div class="flex items-start justify-between gap-2 border-t border-slate-100 pt-2.5">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-clock" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Last Updated</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ lastUpdated }}</span>
      </div>
    </div>
  </div>
</template>
