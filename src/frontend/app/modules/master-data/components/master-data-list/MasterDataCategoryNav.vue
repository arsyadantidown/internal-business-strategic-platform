<script setup lang="ts">
import { computed } from 'vue'
import type { MasterDataCategory, MasterDataType } from '../../types/master-data.types'

interface Props {
  categories: MasterDataCategory[]
  activeType: MasterDataType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', value: MasterDataType): void
}>()

const activeCategory = computed(() =>
  props.categories.find(category => category.type === props.activeType)
)
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex gap-1.5 overflow-x-auto pb-1">
      <button
        v-for="category in categories"
        :key="category.type"
        type="button"
        class="inline-flex h-8.5 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors cursor-pointer"
        :class="
          category.type === activeType
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
        "
        @click="emit('select', category.type)"
      >
        <UIcon
          :name="category.icon"
          class="h-3.5 w-3.5"
        />
        <span>{{ category.label }}</span>
      </button>
    </div>

    <p
      v-if="activeCategory"
      class="text-[11px] leading-5 text-slate-500"
    >
      {{ activeCategory.description }}
    </p>
  </div>
</template>
