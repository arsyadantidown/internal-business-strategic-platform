<script setup lang="ts">
import { computed } from 'vue'
import type { TechTaskDetail } from '../../types/tech-task.types'

const props = defineProps<{
  detail: TechTaskDetail
}>()

const groups = computed(() => [
  { key: 'frontend', label: 'Frontend', icon: 'i-lucide-monitor', stacks: props.detail.techStacks.frontend },
  { key: 'backend', label: 'Backend', icon: 'i-lucide-server', stacks: props.detail.techStacks.backend },
  { key: 'data_storage', label: 'Data Storage', icon: 'i-lucide-database', stacks: props.detail.techStacks.dataStorage }
])

const chipTone: Record<string, string> = {
  frontend: 'border-sky-200 bg-sky-50 text-sky-700',
  backend: 'border-violet-200 bg-violet-50 text-violet-700',
  data_storage: 'border-amber-200 bg-amber-50 text-amber-700'
}
</script>

<template>
  <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
    <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon
          name="i-lucide-cpu"
          class="h-3.5 w-3.5"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-bold tracking-tight text-slate-900">
          Technical Capabilities
        </h3>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Technologies applied on this work
        </p>
      </div>
    </div>

    <div class="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div
        v-for="group in groups"
        :key="group.key"
        class="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5"
      >
        <div class="flex items-center gap-1.5">
          <UIcon
            :name="group.icon"
            class="h-3.5 w-3.5 text-slate-500"
          />
          <h4 class="text-[11px] font-bold text-slate-700">
            {{ group.label }}
          </h4>
          <span class="text-[10px] font-semibold text-slate-400">
            ({{ group.stacks.length }})
          </span>
        </div>

        <div
          v-if="group.stacks.length"
          class="mt-2 flex flex-wrap gap-1.5"
        >
          <span
            v-for="stack in group.stacks"
            :key="stack.id"
            class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
            :class="chipTone[group.key]"
          >
            {{ stack.name }}
          </span>
        </div>
        <p
          v-else
          class="mt-2 text-xs italic text-slate-400"
        >
          None assigned.
        </p>
      </div>
    </div>
  </section>
</template>
