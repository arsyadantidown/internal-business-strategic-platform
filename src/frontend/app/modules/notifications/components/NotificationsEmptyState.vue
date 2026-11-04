<script setup lang="ts">
const emit = defineEmits<{
  (e: 'reset'): void
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-10 text-center shadow-xs"
  >
    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <UIcon
        name="i-lucide-bell-off"
        class="h-5 w-5"
      />
    </div>
    <div>
      <p class="text-xs font-semibold text-slate-700">
        No notifications found
      </p>
      <p class="mt-0.5 text-[11px] text-slate-400">
        You're all caught up, or the current filters have no matching notifications.
      </p>
    </div>
    <button
      type="button"
      class="inline-flex h-7.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 cursor-pointer"
      @click="emit('reset')"
    >
      <UIcon
        name="i-lucide-rotate-ccw"
        class="h-3.5 w-3.5 text-slate-500"
      />
      <span>Reset filters</span>
    </button>
  </div>
</template>
