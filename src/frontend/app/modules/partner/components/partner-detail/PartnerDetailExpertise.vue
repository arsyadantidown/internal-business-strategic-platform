<script setup lang="ts">
import { computed } from 'vue'
import type { PartnerDetail } from '../../types/partner.types'

interface Props {
  detail: PartnerDetail
}

const props = defineProps<Props>()

const hasExpertise = computed(() =>
  props.detail.expertiseAreas.length > 0 || props.detail.capabilities.length > 0
)
</script>

<template>
  <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
    <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon
          name="i-lucide-sparkles"
          class="h-3.5 w-3.5"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-bold tracking-tight text-slate-900">
          Expertise & Capabilities
        </h3>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Fields of expertise and what the partner can deliver
        </p>
      </div>
    </div>

    <div
      v-if="hasExpertise"
      class="mt-3 space-y-3"
    >
      <div v-if="detail.expertiseAreas.length">
        <p class="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
          <UIcon
            name="i-lucide-tag"
            class="h-3.5 w-3.5 text-slate-500"
          />
          Expertise Areas
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="area in detail.expertiseAreas"
            :key="area"
            class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
          >
            {{ area }}
          </span>
        </div>
      </div>

      <div v-if="detail.capabilities.length">
        <p class="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
          <UIcon
            name="i-lucide-badge-check"
            class="h-3.5 w-3.5 text-slate-500"
          />
          Capabilities
        </p>
        <ul class="space-y-1.5">
          <li
            v-for="capability in detail.capabilities"
            :key="capability"
            class="flex items-start gap-2 text-xs leading-5 text-slate-600"
          >
            <UIcon
              name="i-lucide-check"
              class="mt-0.5 h-3 w-3 shrink-0 text-emerald-500"
            />
            <span>{{ capability }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div
      v-else
      class="mt-3 flex flex-col items-center gap-2 py-6 text-center"
    >
      <UIcon
        name="i-lucide-sparkles"
        class="h-6 w-6 text-slate-300"
      />
      <div>
        <p class="text-[11px] font-semibold text-slate-600">
          No expertise recorded yet
        </p>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Expertise areas and capabilities will appear here once provided.
        </p>
      </div>
    </div>
  </section>
</template>
