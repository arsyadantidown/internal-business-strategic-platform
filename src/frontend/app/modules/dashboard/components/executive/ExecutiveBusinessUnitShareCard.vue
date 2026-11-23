<script setup lang="ts">
interface BusinessUnitShareItem {
  code: string
  name?: string
  revenue: string
}

const props = withDefaults(
  defineProps<{
    units?: BusinessUnitShareItem[]
  }>(),
  {
    units: () => [
      { code: 'ITMS', revenue: 'Rp 250M' },
      { code: 'CSD', revenue: 'Rp 200M' },
      { code: 'SI', revenue: 'Rp 150M' }
    ]
  }
)
</script>

<template>
  <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs font-sans">
    <!-- Header -->
    <div>
      <h2 class="text-sm font-bold text-slate-900 sm:text-base">Business Unit Share</h2>
      <p class="text-xs text-slate-500 mt-0.5">
        Contribution & revenue volume across ITMS, CSD, and SI
      </p>
    </div>

    <!-- 3 Unit Cards Grid -->
    <div class="mt-4 grid grid-cols-3 gap-3">
      <div
        v-for="(unit, idx) in props.units"
        :key="idx"
        class="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/60 py-3.5 px-2 text-center transition-all hover:bg-slate-50 hover:border-slate-200/60"
      >
        <span class="text-[11px] font-bold text-slate-500 tracking-wider">
          {{ unit.code }}
        </span>
        <span class="mt-1 text-xs font-bold text-slate-900 font-mono sm:text-sm truncate w-full">
          {{ unit.revenue }}
        </span>
      </div>
    </div>
  </div>
</template>
