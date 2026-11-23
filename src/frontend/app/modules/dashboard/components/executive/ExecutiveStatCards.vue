<script setup lang="ts">
// 1. Import icon SVG langsung dari assets/icon/
import totalProjectIcon from '~/assets/icon/total-project.svg'
import totalValueIcon from '~/assets/icon/total-value.svg'
import totalRevenueIcon from '~/assets/icon/total-revenue.svg'
import totalProfitIcon from '~/assets/icon/total-profit.svg'

interface StatMetric {
  title: string
  value: string | number
  iconSrc: string
  badgeText: string
  subText: string
}

const props = withDefaults(
  defineProps<{
    stats?: StatMetric[]
  }>(),
  {
    stats: () => [
      {
        title: 'Total Projects',
        value: '2',
        iconSrc: totalProjectIcon,
        badgeText: '↗ 1 Active',
        subText: '50% completed'
      },
      {
        title: 'Total Value (Before Tax)',
        value: 'Rp 600.000.032',
        iconSrc: totalValueIcon,
        badgeText: '↗ +100%',
        subText: 'gross contract'
      },
      {
        title: 'Total Revenue',
        value: 'Rp 600.000.032',
        iconSrc: totalRevenueIcon,
        badgeText: '↗ 100%',
        subText: 'realized to date'
      },
      {
        title: 'Total Net Profit',
        value: 'Rp 519.996.530',
        iconSrc: totalProfitIcon,
        badgeText: '↗ 86.7%',
        subText: 'net margin'
      }
    ]
  }
)
</script>

<template>
  <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 font-sans">
    <div
      v-for="(item, idx) in props.stats"
      :key="idx"
      class="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow"
    >
      <!-- Top Row: Icon + Title & Value -->
      <div class="flex items-start gap-3.5">
        <!-- SVG Icon utuh dari Figma (44x44px) -->
        <img :src="item.iconSrc" class="h-11 w-11 shrink-0 object-contain" :alt="item.title" />
        <!-- Metric Details -->
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-medium text-slate-500 truncate">
            {{ item.title }}
          </p>
          <p
            class="mt-0.5 text-lg font-bold tracking-tight text-slate-900 font-mono sm:text-xl truncate"
          >
            {{ item.value }}
          </p>
        </div>
      </div>

      <!-- Bottom Row: Trend Badge + Subtext Description -->
      <div class="mt-3 flex items-center gap-2 pt-1 border-t border-slate-50">
        <span
          class="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600"
        >
          {{ item.badgeText }}
        </span>
        <span class="text-[11px] font-normal text-slate-400 truncate">
          {{ item.subText }}
        </span>
      </div>
    </div>
  </div>
</template>
