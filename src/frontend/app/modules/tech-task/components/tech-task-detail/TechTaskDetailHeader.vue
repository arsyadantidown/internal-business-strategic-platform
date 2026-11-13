<script setup lang="ts">
import type { TechTaskDetail } from '../../types/tech-task.types'
import TechTaskStatusBadge from '../tech-task-list/TechTaskStatusBadge.vue'

defineProps<{
  detail: TechTaskDetail
}>()

const emit = defineEmits<{
  (e: 'back' | 'edit'): void
}>()
</script>

<template>
  <div class="space-y-4">
    <button
      type="button"
      class="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
      @click="emit('back')"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="h-3.5 w-3.5"
      />
      <span>Back to directory</span>
    </button>

    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
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
          <span>Tech Task</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="h-3 w-3"
          />
          <span class="font-semibold text-slate-700">Detail</span>
        </nav>

        <div class="mt-2 flex flex-wrap items-center gap-2">
          <h1 class="text-xl font-bold leading-7 tracking-tight text-slate-900">
            {{ detail.projectName }}
          </h1>
          <UIcon
            v-if="detail.isFeatured"
            name="i-lucide-sparkles"
            class="h-4 w-4 text-amber-500"
            title="Featured project"
          />
        </div>

        <div class="mt-1.5 flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
            {{ detail.projectCode }}
          </span>
          <TechTaskStatusBadge :status="detail.projectStatus" />
          <span class="text-[11px] font-medium text-slate-400">
            Year {{ detail.year }}
          </span>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2.5">
        <a
          :href="`/portofolio/${detail.id}`"
          target="_blank"
          class="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
        >
          <UIcon
            name="i-lucide-external-link"
            class="h-3.5 w-3.5"
          />
          <span>Open in Portfolio</span>
        </a>

        <button
          type="button"
          class="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 cursor-pointer"
          @click="emit('edit')"
        >
          <UIcon
            name="i-lucide-pencil"
            class="h-3.5 w-3.5"
          />
          <span>Edit Tech Task</span>
        </button>
      </div>
    </div>
  </div>
</template>
