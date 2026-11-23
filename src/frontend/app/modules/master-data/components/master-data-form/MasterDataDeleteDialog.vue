<script setup lang="ts">
import type { MasterDataCategory, MasterDataItem } from '../../types/master-data.types'

interface Props {
  isOpen: boolean
  category: MasterDataCategory
  target: MasterDataItem | null
  isDeleting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close' | 'confirm'): void
}>()

const closeDialog = () => {
  if (props.isDeleting) return
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
    @click.self="closeDialog"
  >
    <div class="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
      <div class="flex items-start gap-3 p-5">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <UIcon
            name="i-lucide-trash-2"
            class="h-5 w-5"
          />
        </div>

        <div class="min-w-0 flex-1">
          <h2 class="text-sm font-bold tracking-tight text-slate-900">
            Delete {{ category.singular }}
          </h2>

          <p class="mt-1 text-xs leading-5 text-slate-500">
            Are you sure you want to delete
            <span class="font-semibold text-slate-700">
              {{ target?.name }}
            </span>
            <span
              v-if="target"
              class="font-mono text-[11px] text-slate-400"
            >
              ({{ target.code }})
            </span>?
          </p>

          <p class="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-4 text-amber-700">
            <UIcon
              name="i-lucide-circle-alert"
              class="mt-0.5 h-3.5 w-3.5 shrink-0"
            />
            <span>
              Entries already used by existing records cannot be fully deleted. They will be
              deactivated and hidden from selection forms instead.
            </span>
          </p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2.5 border-t border-slate-100 p-5">
        <button
          type="button"
          class="inline-flex h-8.5 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isDeleting"
          @click="closeDialog"
        >
          Cancel
        </button>

        <button
          type="button"
          class="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-rose-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isDeleting"
          @click="emit('confirm')"
        >
          <UIcon
            v-if="isDeleting"
            name="i-lucide-loader-2"
            class="h-3.5 w-3.5 animate-spin"
          />
          <UIcon
            v-else
            name="i-lucide-trash-2"
            class="h-3.5 w-3.5"
          />
          <span>{{ isDeleting ? 'Deleting...' : 'Delete Entry' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
