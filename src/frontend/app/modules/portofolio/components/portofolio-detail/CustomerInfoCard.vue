<script setup lang="ts">
interface Props {
  customerName?: string
  companySize?: string
  customerType?: string
  legalStructure?: string
}

withDefaults(defineProps<Props>(), {
  customerName: '-',
  companySize: '-',
  customerType: '-',
  legalStructure: '-'
})
</script>

<template>
  <div class="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
    <!-- Header Card -->
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-building" class="h-4 w-4 text-blue-600" />
        <h3 class="text-sm font-bold text-slate-900">Customer Info</h3>
      </div>
    </div>

    <!-- Metadata Rows -->
    <div class="space-y-3 text-xs">
      <!-- Customer Name -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-user" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Customer Name</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ customerName }}</span>
      </div>

      <!-- Company Size -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-users" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Company Size</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ companySize }}</span>
      </div>

      <!-- Customer Type -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-tag" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Customer Type</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ customerType }}</span>
      </div>

      <!-- Legal Structure -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-400 font-medium shrink-0">
          <UIcon name="i-lucide-scale" class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Legal Structure</span>
        </div>
        <span class="font-semibold text-slate-800 text-right">{{ legalStructure }}</span>
      </div>
    </div>
  </div>
</template>
