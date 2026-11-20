<script setup lang="ts">
const emit = defineEmits<{
  (e: 'add'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-3">
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
      <span class="font-semibold text-slate-700">Tech Stack</span>
    </nav>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-xl font-bold leading-7 tracking-tight text-slate-900">
          Tech Stack
        </h1>
        <p class="max-w-2xl text-xs leading-5 text-slate-500">
          Manage technology stacks and frameworks categorized into frontend, backend, and data storage.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-8.5 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 sm:self-auto cursor-pointer"
        @click="emit('add')"
      >
        <UIcon
          name="i-lucide-plus"
          class="h-4 w-4"
        />
        <span>Add Tech Stack</span>
      </button>
    </div>
  </div>
</template>
