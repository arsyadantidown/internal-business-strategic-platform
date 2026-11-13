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
      <span class="font-semibold text-slate-700">Tech Task</span>
    </nav>

    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-xl font-bold leading-7 tracking-tight text-slate-900">
          Tech Task
        </h1>
        <p class="max-w-2xl text-xs leading-5 text-slate-500">
          Manage technical work and capabilities across company projects. Each entry tracks the
          requirements, solutions, and delivery status tied to a portfolio project.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-8.5 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 lg:self-auto cursor-pointer"
        @click="emit('add')"
      >
        <UIcon
          name="i-lucide-plus"
          class="h-4 w-4"
        />
        <span>Add Tech Task</span>
      </button>
    </div>
  </div>
</template>
