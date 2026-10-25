<script setup lang="ts">
import type { CmsFilterOption } from '../../types/cms.types'

interface Props {
  modelValue: string[]
  options: CmsFilterOption[]
  emptyLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  emptyLabel: 'No options selected'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const toggle = (value: string) => {
  const next = props.modelValue.includes(value)
    ? props.modelValue.filter(item => item !== value)
    : [...props.modelValue, value]

  emit('update:modelValue', next)
}
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer"
        :class="
          modelValue.includes(option.value)
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
        "
        :aria-pressed="modelValue.includes(option.value)"
        @click="toggle(option.value)"
      >
        <UIcon
          v-if="modelValue.includes(option.value)"
          name="i-lucide-check"
          class="h-3 w-3"
        />
        {{ option.label }}
      </button>
    </div>

    <p
      v-if="modelValue.length === 0"
      class="text-[10px] text-slate-400"
    >
      {{ emptyLabel }}
    </p>
  </div>
</template>
