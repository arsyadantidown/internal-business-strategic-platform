<script setup lang="ts">
import { computed } from 'vue'
import { productStatusLabel } from '../../data/product.data'
import type { ProductItem } from '../../types/product.types'

interface Props {
  isOpen: boolean
  target: ProductItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close' | 'confirm'): void
}>()

const statusLabel = computed(() =>
  props.target ? productStatusLabel(props.target.productStatus) : ''
)
</script>

<template>
  <div
    v-if="isOpen && target"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
    @click.self="emit('close')"
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
            Delete Product
          </h2>

          <p class="mt-1 text-xs leading-5 text-slate-500">
            Are you sure you want to delete
            <span class="font-semibold text-slate-700">{{ target.productName }}</span>?
          </p>

          <div class="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Product
            </p>
            <p class="mt-1 text-xs font-semibold text-slate-800">
              {{ target.productName }}
            </p>
            <p class="mt-0.5 text-[10px] font-medium text-slate-400">
              Status: {{ statusLabel }}
            </p>
          </div>

          <p class="mt-3 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-4 text-amber-700">
            <UIcon
              name="i-lucide-circle-alert"
              class="mt-0.5 h-3.5 w-3.5 shrink-0"
            />
            <span>This action cannot be undone.</span>
          </p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2.5 border-t border-slate-100 p-5">
        <button
          type="button"
          class="inline-flex h-8.5 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>

        <button
          type="button"
          class="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-rose-700 cursor-pointer"
          @click="emit('confirm')"
        >
          <UIcon
            name="i-lucide-trash-2"
            class="h-3.5 w-3.5"
          />
          <span>Delete Product</span>
        </button>
      </div>
    </div>
  </div>
</template>
