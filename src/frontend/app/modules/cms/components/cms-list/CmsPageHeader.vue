<script setup lang="ts">
import { computed } from 'vue'
import type { CmsContentKind } from '../../types/cms.types'

interface Props {
  kind: CmsContentKind
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'add-content'): void
}>()

const pageMeta = computed(() => props.kind === 'portfolio'
  ? {
      label: 'Portfolio Content',
      description: 'Create, review, schedule, and publish portfolio case studies. Changes are stored locally in this browser.'
    }
  : {
      label: 'Partnership Content',
      description: 'Create, review, schedule, and publish partnership stories. Partner profiles, legal documents, and verification remain in the Partnership module.'
    })
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
      <span class="font-semibold text-slate-700">{{ pageMeta.label }}</span>
    </nav>

    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-xl font-bold leading-7 tracking-tight text-slate-900">
          {{ pageMeta.label }}
        </h1>
        <p class="max-w-2xl text-xs leading-5 text-slate-500">
          {{ pageMeta.description }}
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-8.5 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 lg:self-auto cursor-pointer"
        @click="emit('add-content')"
      >
        <UIcon
          name="i-lucide-plus"
          class="h-4 w-4"
        />
        <span>Add {{ kind === 'portfolio' ? 'Portfolio' : 'Partnership' }} Content</span>
      </button>
    </div>
  </div>
</template>
