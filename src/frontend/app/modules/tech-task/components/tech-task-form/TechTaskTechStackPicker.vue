<script setup lang="ts">
import { computed } from 'vue'
import type { TechStackOption } from '../../types/tech-task.types'

interface Props {
  options: TechStackOption[]
  modelValue: string[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const groups = computed(() => [
  { key: 'frontend', label: 'Frontend', icon: 'i-lucide-monitor', stacks: props.options.filter(option => option.category === 'frontend') },
  { key: 'backend', label: 'Backend', icon: 'i-lucide-server', stacks: props.options.filter(option => option.category === 'backend') },
  { key: 'data_storage', label: 'Data Storage', icon: 'i-lucide-database', stacks: props.options.filter(option => option.category === 'data_storage') }
])

const isSelected = (id: string) => props.modelValue.includes(id)

const toggleStack = (id: string) => {
  if (props.disabled) return

  const next = props.modelValue.includes(id)
    ? props.modelValue.filter(value => value !== id)
    : [...props.modelValue, id]

  emit('update:modelValue', next)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="group in groups"
      :key="group.key"
    >
      <p class="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
        <UIcon
          :name="group.icon"
          class="h-3.5 w-3.5 text-slate-500"
        />
        {{ group.label }}
        <span class="font-medium text-slate-400">
          ({{ group.stacks.length }})
        </span>
      </p>

      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="stack in group.stacks"
          :key="stack.id"
          type="button"
          class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          :class="
            isSelected(stack.id)
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          "
          :disabled="disabled"
          @click="toggleStack(stack.id)"
        >
          <UIcon
            :name="isSelected(stack.id) ? 'i-lucide-check' : 'i-lucide-plus'"
            class="h-3 w-3"
          />
          <span>{{ stack.name }}</span>
        </button>

        <span
          v-if="!group.stacks.length"
          class="text-[11px] italic text-slate-400"
        >
          No options available.
        </span>
      </div>
    </div>
  </div>
</template>
