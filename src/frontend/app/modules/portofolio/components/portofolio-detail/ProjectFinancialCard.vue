<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  valueBeforeTax?: number | string | null
  valueAfterTax?: number | string | null
  carryOverValue?: number | string | null
  revenue?: number | string | null
  cogs?: number | string | null
  operationalCost?: number | string | null
  netProfit?: number | string | null
  marginProfitPercent?: number | string | null
}

const props = withDefaults(defineProps<Props>(), {
  valueBeforeTax: null,
  valueAfterTax: null,
  carryOverValue: null,
  revenue: null,
  cogs: null,
  operationalCost: null,
  netProfit: null,
  marginProfitPercent: null
})

// Helper format angka ke IDR (Rupiah)
const formatCurrency = (val?: number | string | null): string => {
  if (val === null || val === undefined || val === '') return '-'
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num)
}

// Helper format Margin Profit %
const formattedMarginPercent = computed(() => {
  if (
    props.marginProfitPercent === null ||
    props.marginProfitPercent === undefined ||
    props.marginProfitPercent === ''
  ) {
    return '-'
  }
  const num =
    typeof props.marginProfitPercent === 'string'
      ? parseFloat(props.marginProfitPercent)
      : props.marginProfitPercent

  if (isNaN(num)) return '-'
  return `${num.toFixed(1)}%`
})

// Cek apakah profit positif/negatif untuk pewarnaan
const isProfitPositive = computed(() => {
  if (props.netProfit === null || props.netProfit === undefined) return true
  const num = typeof props.netProfit === 'string' ? parseFloat(props.netProfit) : props.netProfit
  return num >= 0
})
</script>

<template>
  <div class="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
    <!-- Header Card -->
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-badge-dollar-sign" class="h-4 w-4 text-emerald-600" />
        <h3 class="text-sm font-bold text-slate-900">Financial Overview</h3>
      </div>
    </div>

    <!-- Metadata Rows -->
    <div class="space-y-3 text-xs">
      <!-- Value Before Tax -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-file-text" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Value Before Tax</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">
          {{ formatCurrency(valueBeforeTax) }}
        </span>
      </div>

      <!-- Value After Tax -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-receipt" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Value After Tax</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">
          {{ formatCurrency(valueAfterTax) }}
        </span>
      </div>

      <!-- Carry Over Value -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-arrow-right-left" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Carry Over Value</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">
          {{ formatCurrency(carryOverValue) }}
        </span>
      </div>

      <!-- Revenue -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-trending-up" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Revenue</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">
          {{ formatCurrency(revenue) }}
        </span>
      </div>

      <!-- COGS -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-coins" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>COGS</span>
        </div>
        <span class="font-semibold text-slate-800 text-right text-rose-600">
          {{ formatCurrency(cogs) }}
        </span>
      </div>

      <!-- Operational Cost -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-wallet" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Operational Cost</span>
        </div>
        <span class="font-semibold text-slate-800 text-right text-rose-600">
          {{ formatCurrency(operationalCost) }}
        </span>
      </div>

      <!-- Divider untuk Summary Profit -->
      <div class="border-t border-slate-100 pt-2.5 space-y-3">
        <!-- Net Profit -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 text-slate-600 font-bold shrink-0">
            <UIcon name="i-lucide-piggy-bank" class="h-4 w-4 shrink-0 text-slate-500" />
            <span>Net Profit</span>
          </div>
          <span
            class="font-bold text-right"
            :class="isProfitPositive ? 'text-emerald-600' : 'text-rose-600'"
          >
            {{ formatCurrency(netProfit) }}
          </span>
        </div>

        <!-- Margin Profit % -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 text-slate-600 font-bold shrink-0">
            <UIcon name="i-lucide-percent" class="h-4 w-4 shrink-0 text-slate-500" />
            <span>Margin Profit</span>
          </div>
          <span
            class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold"
            :class="
              isProfitPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            "
          >
            {{ formattedMarginPercent }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
