<script setup lang="ts">
interface IndustryItem {
  name: string
  projectCount: number
  amount: string
  percentage: number
  colorClass: string
  barClass: string
}

const props = withDefaults(
  defineProps<{
    industries?: IndustryItem[]
    activeVerticalsCount?: number
    insightText?: string
  }>(),
  {
    activeVerticalsCount: 2,
    insightText:
      'Financial Services accounts for the majority of the current enterprise valuation.',
    industries: () => [
      {
        name: 'Financial Services',
        projectCount: 1,
        amount: 'Rp 350.000.000',
        percentage: 58.3,
        colorClass: 'bg-blue-600',
        barClass: 'bg-blue-600'
      },
      {
        name: 'Information Technology (IT) and Software',
        projectCount: 1,
        amount: 'Rp 250.000.032',
        percentage: 41.7,
        colorClass: 'bg-indigo-500',
        barClass: 'bg-indigo-500'
      }
    ]
  }
)
</script>

<template>
  <div
    class="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs font-sans h-full"
  >
    <!-- Top Area: Header & List -->
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900 sm:text-base">Projects by Industry</h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Distribution across key industry verticals and contract volume
          </p>
        </div>
        <span
          class="inline-flex shrink-0 items-center rounded-lg border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
        >
          {{ props.activeVerticalsCount }} Active Verticals
        </span>
      </div>

      <!-- Industry Vertical Bars List -->
      <div class="space-y-4 pt-1">
        <div v-for="(item, idx) in props.industries" :key="idx" class="space-y-1.5">
          <!-- Label, Amount, and Percentage Row -->
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 min-w-0">
              <span class="h-2.5 w-2.5 shrink-0 rounded-xs" :class="item.colorClass" />
              <span class="font-bold text-slate-800 truncate">{{ item.name }}</span>
              <span class="text-slate-400 font-normal"
                >({{ item.projectCount }}
                {{ item.projectCount > 1 ? 'projects' : 'project' }})</span
              >
            </div>
            <div class="flex items-center gap-3 shrink-0 font-mono">
              <span class="font-bold text-slate-900">{{ item.amount }}</span>
              <span class="w-12 text-right font-bold text-blue-600">{{ item.percentage }}%</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="item.barClass"
              :style="{ width: `${item.percentage}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Area: Footnote Insight -->
    <div class="pt-6 border-t border-slate-100/80 mt-6">
      <p class="text-xs text-slate-400">
        {{ props.insightText }}
      </p>
    </div>
  </div>
</template>
