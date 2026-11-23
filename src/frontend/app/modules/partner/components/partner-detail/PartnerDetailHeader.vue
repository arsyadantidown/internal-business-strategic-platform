<script setup lang="ts">
import type { PartnerDetail } from '../../types/partner.types'
import PartnerCategoryBadge from '../partner-list/PartnerCategoryBadge.vue'
import PartnerStatusBadge from '../partner-list/PartnerStatusBadge.vue'

defineProps<{
  detail: PartnerDetail
}>()

const emit = defineEmits<{
  (e: 'back' | 'edit' | 'toggle-active'): void
}>()
</script>

<template>
  <div class="space-y-4">
    <button
      type="button"
      class="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
      @click="emit('back')"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="h-3.5 w-3.5"
      />
      <span>Back to directory</span>
    </button>

    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div class="flex min-w-0 items-start gap-3">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
          {{ detail.partnerName.charAt(0).toUpperCase() }}
        </div>

        <div class="min-w-0">
          <nav class="flex flex-wrap items-center gap-1 text-[11px] font-medium text-slate-400">
            <span>Administration</span>
            <UIcon
              name="i-lucide-chevron-right"
              class="h-3 w-3"
            />
            <span>Content Management</span>
            <UIcon
              name="i-lucide-chevron-right"
              class="h-3 w-3"
            />
            <span>Partner</span>
            <UIcon
              name="i-lucide-chevron-right"
              class="h-3 w-3"
            />
            <span class="font-semibold text-slate-700">Detail</span>
          </nav>

          <h1 class="mt-1.5 text-xl font-bold leading-7 tracking-tight text-slate-900">
            {{ detail.partnerName }}
          </h1>

          <div class="mt-1.5 flex flex-wrap items-center gap-2">
            <PartnerCategoryBadge :category="detail.category" />
            <PartnerStatusBadge
              :is-active="detail.isActive"
              :lifecycle-status="detail.lifecycleStatus"
            />
            <span class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <UIcon
                name="i-lucide-history"
                class="h-3 w-3"
              />
              {{ detail.cooperationProjects.length }} projects together
            </span>
          </div>
        </div>
      </div>

      <div class="flex shrink-0 flex-wrap items-center gap-2.5">
        <button
          type="button"
          class="inline-flex h-8.5 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          :class="detail.isActive
            ? 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50'
            : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'"
          @click="emit('toggle-active')"
        >
          <UIcon
            :name="detail.isActive ? 'i-lucide-circle-x' : 'i-lucide-circle-check-big'"
            class="h-3.5 w-3.5"
          />
          <span>{{ detail.isActive ? 'Deactivate' : 'Activate' }}</span>
        </button>

        <button
          type="button"
          class="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 cursor-pointer"
          @click="emit('edit')"
        >
          <UIcon
            name="i-lucide-pencil"
            class="h-3.5 w-3.5"
          />
          <span>Edit Partner</span>
        </button>
      </div>
    </div>
  </div>
</template>
