<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  modelValue: string | number
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  customClass:
    'h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 pr-8 text-left text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors flex items-center justify-between'
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'change', val: string): void
}>()

const isOpen = ref(false)
const popoverRef = ref<HTMLElement | null>(null)

// Dekade awal berdasarkan nilai saat ini atau tahun sekarang
const currentYear = new Date().getFullYear()
const startDecadeYear = ref(
  props.modelValue ? Math.floor(Number(props.modelValue) / 12) * 12 : Math.floor(currentYear / 12) * 12
)

// 12 tahun yang ditampilkan dalam grid 3x4
const years = computed(() => {
  const list: number[] = []
  for (let i = 0; i < 12; i++) {
    list.push(startDecadeYear.value + i)
  }
  return list
})

const decadeRangeLabel = computed(() => {
  return `${years.value[0]} - ${years.value[years.value.length - 1]}`
})

const nextDecade = () => {
  startDecadeYear.value += 12
}

const prevDecade = () => {
  startDecadeYear.value -= 12
}

const selectYear = (year: number) => {
  const val = String(year)
  emit('update:modelValue', val)
  emit('change', val)
  isOpen.value = false
}

const clearYear = () => {
  emit('update:modelValue', '')
  emit('change', '')
  isOpen.value = false
}

const togglePopover = () => {
  isOpen.value = !isOpen.value
}

// Tutup popover jika user klik di luar komponen
const handleClickOutside = (event: MouseEvent) => {
  if (popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="popoverRef" class="relative w-full">
    <!-- Trigger Button -->
    <button
      type="button"
      :class="[
        props.customClass,
        props.modelValue ? 'text-slate-900 font-semibold' : 'text-slate-700'
      ]"
      @click="togglePopover"
    >
      <span class="truncate">
        {{ props.modelValue ? props.modelValue : 'All Years' }}
      </span>

      <!-- Calendar Icon -->
      <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        <UIcon
          name="i-lucide-calendar"
          class="h-3.5 w-3.5 text-slate-400"
        />
      </div>
    </button>

    <!-- Popover Year Picker Content -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl font-sans"
    >
      <!-- Popover Header: Decades Navigation -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          @click.stop="prevDecade"
        >
          <UIcon name="i-lucide-chevron-left" class="h-4 w-4" />
        </button>

        <span class="text-xs font-bold text-slate-800">
          {{ decadeRangeLabel }}
        </span>

        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          @click.stop="nextDecade"
        >
          <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        </button>
      </div>

      <!-- Years Grid 3x4 -->
      <div class="grid grid-cols-3 gap-1.5 py-2.5">
        <button
          v-for="year in years"
          :key="year"
          type="button"
          class="h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center"
          :class="
            String(props.modelValue) === String(year)
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          "
          @click.stop="selectYear(year)"
        >
          {{ year }}
        </button>
      </div>

      <!-- Popover Footer: Reset / All Years -->
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          class="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          @click.stop="clearYear"
        >
          Clear (All Years)
        </button>
        <button
          type="button"
          class="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          @click.stop="selectYear(currentYear)"
        >
          This Year
        </button>
      </div>
    </div>
  </div>
</template>
