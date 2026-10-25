<script setup lang="ts">
import type { CmsContent } from '../../types/cms.types'

interface Props {
  isOpen: boolean
  content: CmsContent | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close' | 'confirm'): void
}>()
</script>

<template>
  <div
    v-if="isOpen && content"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 font-sans backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
      <div class="flex items-start gap-3 px-6 pt-6">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <UIcon
            name="i-lucide-trash-2"
            class="h-5 w-5"
          />
        </div>
        <div class="min-w-0">
          <h2 class="text-sm font-bold tracking-tight text-slate-900">
            Delete {{ content.kind === 'portfolio' ? 'Portfolio' : 'Partnership' }} Content
          </h2>
          <p class="mt-1 text-xs leading-relaxed text-slate-500">
            Are you sure you want to delete this content? This action cannot be undone.
          </p>
        </div>
      </div>

      <div class="mx-6 mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
        <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Content
        </p>
        <p class="mt-1 text-xs font-semibold text-slate-800">
          {{ content.title }}
        </p>
        <p class="mt-0.5 text-[10px] font-medium text-slate-400">
          <template v-if="content.kind === 'portfolio'">
            {{ content.client }} · {{ content.industry }} · {{ content.status }}
          </template>
          <template v-else>
            {{ content.category }} · {{ content.partnerType }} · {{ content.status }}
          </template>
        </p>
      </div>

      <div class="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
        <button
          type="button"
          class="inline-flex h-9 min-w-24 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>

        <button
          type="button"
          class="inline-flex h-9 min-w-24 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-rose-700 active:scale-95 cursor-pointer"
          @click="emit('confirm')"
        >
          <UIcon
            name="i-lucide-trash-2"
            class="h-3.5 w-3.5"
          />
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
