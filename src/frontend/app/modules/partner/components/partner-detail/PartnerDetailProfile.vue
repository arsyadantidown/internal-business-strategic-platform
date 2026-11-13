<script setup lang="ts">
import { computed } from 'vue'
import type { PartnerDetail } from '../../types/partner.types'

interface Props {
  detail: PartnerDetail
}

const props = defineProps<Props>()

const rows = computed(() => [
  {
    label: 'Website',
    icon: 'i-lucide-globe',
    value: props.detail.profile.website,
    isLink: true
  },
  {
    label: 'Headquarters',
    icon: 'i-lucide-map-pin',
    value: props.detail.profile.headquarters,
    isLink: false
  },
  {
    label: 'Industry',
    icon: 'i-lucide-factory',
    value: props.detail.profile.industry,
    isLink: false
  },
  {
    label: 'Business Focus',
    icon: 'i-lucide-target',
    value: props.detail.profile.businessFocus,
    isLink: false
  }
])

const hasProfile = computed(() =>
  props.detail.profile.description !== null
  || rows.value.some(row => row.value !== null)
)
</script>

<template>
  <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
    <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon
          name="i-lucide-briefcase"
          class="h-3.5 w-3.5"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-bold tracking-tight text-slate-900">
          Company Profile
        </h3>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Who the partner is and where they operate
        </p>
      </div>
    </div>

    <div
      v-if="hasProfile"
      class="mt-3 space-y-3"
    >
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          v-for="row in rows.filter(row => row.value !== null)"
          :key="row.label"
          class="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5"
        >
          <UIcon
            :name="row.icon"
            class="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
          />
          <div class="min-w-0">
            <p class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
              {{ row.label }}
            </p>
            <a
              v-if="row.isLink"
              :href="row.value ?? '#'"
              target="_blank"
              rel="noopener"
              class="mt-0.5 block truncate text-xs font-semibold text-blue-600 hover:underline"
            >
              {{ row.value }}
            </a>
            <p
              v-else
              class="mt-0.5 text-xs font-semibold text-slate-700"
            >
              {{ row.value }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="detail.profile.description"
        class="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
      >
        <p class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
          Company Description
        </p>
        <p class="mt-1 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
          {{ detail.profile.description }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="mt-3 flex flex-col items-center gap-2 py-6 text-center"
    >
      <UIcon
        name="i-lucide-building-2"
        class="h-6 w-6 text-slate-300"
      />
      <div>
        <p class="text-[11px] font-semibold text-slate-600">
          No company profile on record yet
        </p>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Profile details will appear here once provided through the partner API.
        </p>
      </div>
    </div>
  </section>
</template>
