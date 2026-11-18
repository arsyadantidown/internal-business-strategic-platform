<script setup lang="ts">
import { computed } from 'vue'

interface StatusSlice {
  name: string
  count: number
  percentage: number
  colorHex: string
  bgClass: string
}

const props = withDefaults(
  defineProps<{
    totalProjects?: number
    slices?: StatusSlice[]
  }>(),
  {
    totalProjects: 6,
    slices: () => [
      {
        name: 'On Going',
        count: 2,
        percentage: 33.3,
        colorHex: '#2563EB',
        bgClass: 'bg-blue-600'
      },
      {
        name: 'Closed',
        count: 2,
        percentage: 33.3,
        colorHex: '#10B981',
        bgClass: 'bg-emerald-500'
      },
      {
        name: 'On Proposal',
        count: 1,
        percentage: 16.7,
        colorHex: '#F59E0B',
        bgClass: 'bg-amber-500'
      },
      {
        name: 'Canceled',
        count: 1,
        percentage: 16.7,
        colorHex: '#94A3B8',
        bgClass: 'bg-slate-400'
      }
    ]
  }
)

// Menghitung offset stroke-dasharray SVG untuk Donut Chart
const donutSegments = computed(() => {
  const circumference = 2 * Math.PI * 42 // Radius = 42
  let accumulatedPercent = 0

  return props.slices.map((slice) => {
    const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference)
    accumulatedPercent += slice.percentage
    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset
    }
  })
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs font-sans">
    <!-- Header -->
    <div>
      <h2 class="text-sm font-bold text-slate-900 sm:text-base">Project Status</h2>
      <p class="text-xs text-slate-500 mt-0.5">
        Project lifecycle progression across all verticals
      </p>
    </div>

    <!-- Chart & Legend Container -->
    <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
      <!-- Donut Chart with Center Text -->
      <div class="relative flex h-36 w-36 shrink-0 items-center justify-center">
        <svg class="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
          <!-- Background Track -->
          <circle cx="50" cy="50" r="42" fill="transparent" stroke="#f1f5f9" stroke-width="13" />
          <!-- Colored Segments -->
          <circle
            v-for="(seg, idx) in donutSegments"
            :key="idx"
            cx="50"
            cy="50"
            r="42"
            fill="transparent"
            :stroke="seg.colorHex"
            stroke-width="13"
            :stroke-dasharray="seg.strokeDasharray"
            :stroke-dashoffset="seg.strokeDashoffset"
            class="transition-all duration-700 ease-out"
          />
        </svg>

        <!-- Center Label -->
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-xl font-extrabold text-slate-900 font-mono leading-none">
            {{ props.totalProjects }}
          </span>
          <span class="text-[9px] font-bold tracking-wider text-slate-400 mt-1 uppercase">
            Projects
          </span>
        </div>
      </div>

      <!-- Legend List -->
      <div class="w-full flex-1 space-y-2">
        <div
          v-for="(item, idx) in props.slices"
          :key="idx"
          class="flex items-center justify-between text-xs"
        >
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full shrink-0" :class="item.bgClass" />
            <span class="text-slate-600 font-medium">{{ item.name }}</span>
          </div>
          <div class="flex items-center gap-1 font-mono">
            <span class="font-bold text-slate-900">{{ item.count }}</span>
            <span class="text-slate-400 text-[11px]">({{ item.percentage }}%)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
