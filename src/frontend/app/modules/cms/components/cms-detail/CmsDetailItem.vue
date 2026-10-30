<script setup lang="ts">
interface Props {
  label: string
  value?: string
  full?: boolean
}

withDefaults(defineProps<Props>(), {
  value: '',
  full: false
})
</script>

<template>
  <div
    class="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5"
    :class="full ? 'sm:col-span-2' : ''"
  >
    <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
      {{ label }}
    </p>
    <p class="mt-0.5 break-words text-[11px] font-semibold text-slate-700">
      {{ value || '—' }}
    </p>
  </div>
</template>
