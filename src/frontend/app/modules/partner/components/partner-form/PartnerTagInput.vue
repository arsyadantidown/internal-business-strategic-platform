<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Type and press Enter to add...',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const inputValue = ref('')

const MAX_ITEMS = 20
const MAX_ITEM_LENGTH = 100

const addTag = () => {
  if (props.disabled) return

  const value = inputValue.value.trim().slice(0, MAX_ITEM_LENGTH)
  inputValue.value = ''

  if (!value || props.modelValue.includes(value)) return
  if (props.modelValue.length >= MAX_ITEMS) return

  emit('update:modelValue', [...props.modelValue, value])
}

const removeTag = (tag: string) => {
  if (props.disabled) return
  emit('update:modelValue', props.modelValue.filter(item => item !== tag))
}

const removeLastTag = () => {
  if (props.disabled || props.modelValue.length === 0) return
  emit('update:modelValue', props.modelValue.slice(0, -1))
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addTag()
    return
  }

  if (event.key === 'Backspace' && inputValue.value === '') {
    event.preventDefault()
    removeLastTag()
  }
}
</script>

<template>
  <div
    class="flex w-full min-h-8.5 flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
    :class="disabled ? 'cursor-not-allowed opacity-60' : ''"
  >
    <span
      v-for="tag in modelValue"
      :key="tag"
      class="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 py-0.5 pr-1 pl-2.5 text-[11px] font-semibold text-blue-700"
    >
      <span>{{ tag }}</span>
      <button
        type="button"
        class="flex h-4 w-4 items-center justify-center rounded-full text-blue-400 transition-colors hover:bg-blue-100 hover:text-blue-600 cursor-pointer"
        :disabled="disabled"
        @click="removeTag(tag)"
      >
        <UIcon
          name="i-lucide-x"
          class="h-2.5 w-2.5"
        />
      </button>
    </span>

    <input
      v-model="inputValue"
      type="text"
      :placeholder="modelValue.length === 0 ? placeholder : 'Add more...'"
      :disabled="disabled"
      class="h-6.5 min-w-24 flex-1 border-0 bg-transparent p-0 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
      @keydown="onKeydown"
      @blur="addTag"
    >
  </div>
</template>
