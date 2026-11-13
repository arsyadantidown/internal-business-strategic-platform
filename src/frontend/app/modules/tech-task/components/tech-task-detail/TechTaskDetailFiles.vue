<script setup lang="ts">
import { computed } from 'vue'
import { formatCmsDate } from '~/modules/cms/utils/cmsFormat'
import type { TechTaskDetail, TechTaskFile } from '../../types/tech-task.types'

const props = defineProps<{
  detail: TechTaskDetail
}>()

const categoryLabel = (category: string) =>
  category
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const formatSize = (bytes: number): string => {
  if (bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const categoryTone: Record<string, string> = {
  document: 'border-slate-200 bg-white text-slate-600',
  image: 'border-sky-200 bg-sky-50 text-sky-700',
  video: 'border-violet-200 bg-violet-50 text-violet-700',
  case_study: 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

const sortedFiles = computed<TechTaskFile[]>(() =>
  [...props.detail.files].sort((first, second) =>
    first.sortOrder - second.sortOrder || second.createdAt.localeCompare(first.createdAt)
  )
)
</script>

<template>
  <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
    <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon
          name="i-lucide-file-text"
          class="h-3.5 w-3.5"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-bold tracking-tight text-slate-900">
          Technical Documents
        </h3>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Files attached to the related project
        </p>
      </div>
      <span class="shrink-0 text-[10px] font-semibold text-slate-400">
        {{ sortedFiles.length }} files
      </span>
    </div>

    <div
      v-if="sortedFiles.length"
      class="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2"
    >
      <article
        v-for="file in sortedFiles"
        :key="file.id"
        class="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2"
      >
        <UIcon
          name="i-lucide-file-text"
          class="h-4 w-4 shrink-0 text-slate-400"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-semibold text-slate-700">
            {{ file.fileTitle || file.fileName }}
          </p>
          <p class="truncate text-[10px] text-slate-400">
            {{ file.fileName }} - {{ formatSize(file.fileSizeBytes) }} - {{ formatCmsDate(file.createdAt) }}
          </p>
        </div>
        <span
          class="inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 uppercase"
          :class="categoryTone[file.fileCategory] ?? 'border-slate-200 bg-white text-slate-600'"
        >
          {{ categoryLabel(file.fileCategory) }}
        </span>
      </article>
    </div>

    <p
      v-else
      class="mt-3 text-xs italic text-slate-400"
    >
      No documents attached to this project yet.
    </p>
  </section>
</template>
