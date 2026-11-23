<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage?: number
  totalItems?: number
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  totalItems: 0,
  pageSize: 12
})

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
}>()

// Hitung total halaman
const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize) || 1)

// Hitung rentang data yang sedang ditampilkan (misal: "1 to 12")
const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.totalItems)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}

// Logika cerdas untuk deretan nomor halaman (Dynamic Windowing)
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.currentPage

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  // Jika di awal halaman
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  // Jika di akhir halaman
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  // Jika di tengah halaman
  return [1, '...', current - 1, current, current + 1, '...', total]
})
</script>

<template>
  <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
    <!-- Info Text Sisi Kiri -->
    <p class="text-xs font-medium text-slate-500">
      Showing <span class="font-semibold text-slate-700">{{ startItem }}</span> to
      <span class="font-semibold text-slate-700">{{ endItem }}</span> of
      <span class="font-semibold text-slate-700">{{ totalItems }}</span> projects
    </p>

    <!-- Tombol Pagination Sisi Kanan -->
    <div class="flex items-center gap-1">
      <!-- Tombol Prev -->
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        :disabled="currentPage <= 1"
        aria-label="Previous Page"
        @click="goToPage(currentPage - 1)"
      >
        <UIcon name="i-lucide-chevron-left" class="h-4 w-4" />
      </button>

      <!-- Daftar Tombol Halaman & Titik-titik -->
      <div class="flex items-center gap-1">
        <template v-for="(item, idx) in visiblePages" :key="idx">
          <!-- Jika berupa angka -->
          <button
            v-if="typeof item === 'number'"
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer"
            :class="[
              currentPage === item
                ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            ]"
            @click="goToPage(item)"
          >
            {{ item }}
          </button>

          <!-- Jika berupa tanda titik-titik (...) -->
          <span v-else class="px-1 text-xs font-medium text-slate-400">
            {{ item }}
          </span>
        </template>
      </div>

      <!-- Tombol Next -->
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        :disabled="currentPage >= totalPages"
        aria-label="Next Page"
        @click="goToPage(currentPage + 1)"
      >
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
