<script setup lang="ts">
import type { PartnerDetail } from '../../types/partner.types'

defineProps<{
  detail: PartnerDetail
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()
</script>

<template>
  <div class="space-y-4">
    <!-- Back button -->
    <button
      type="button"
      class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 cursor-pointer"
      @click="emit('back')"
    >
      <UIcon name="i-lucide-arrow-left" class="h-4 w-4 text-slate-500" />
      <span>Back to directory</span>
    </button>

    <!-- Header info with Index Box -->
    <div class="flex items-start gap-3.5">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-base font-bold text-blue-600 border border-blue-100"
      >
        1
      </div>

      <div class="min-w-0">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span>Administration</span>
          <UIcon name="i-lucide-chevron-right" class="h-3 w-3 text-slate-300" />
          <span>Content Management</span>
          <UIcon name="i-lucide-chevron-right" class="h-3 w-3 text-slate-300" />
          <span>Partner</span>
          <UIcon name="i-lucide-chevron-right" class="h-3 w-3 text-slate-300" />
          <span class="font-bold text-slate-800">Detail</span>
        </nav>

        <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {{ detail.partnerName }}
        </h1>

        <!-- Badges: Active & Projects Together -->
        <div class="mt-2 flex flex-wrap items-center gap-2.5">
          <span
            class="inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold"
            :class="
              detail.isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-100 text-slate-500'
            "
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="detail.isActive ? 'bg-emerald-500' : 'bg-slate-400'"
            />
            {{ detail.isActive ? 'Active' : 'Inactive' }}
          </span>

          <span
            class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-xs font-medium text-slate-600"
          >
            <UIcon name="i-lucide-history" class="h-3.5 w-3.5 text-slate-400" />
            <span>{{ detail.cooperationProjects?.length || 0 }} projects together</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
