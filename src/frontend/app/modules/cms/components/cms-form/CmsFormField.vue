<script setup lang="ts">
interface Props {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  full?: boolean
}

withDefaults(defineProps<Props>(), {
  htmlFor: '',
  required: false,
  error: '',
  hint: '',
  full: false
})
</script>

<template>
  <div :class="full ? 'sm:col-span-2' : ''">
    <label
      :for="htmlFor || undefined"
      class="mb-1.5 block text-[11px] font-semibold text-slate-700"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-rose-500"
      >*</span>
    </label>

    <slot />

    <p
      v-if="error"
      class="mt-1 flex items-center gap-1 text-[10px] font-medium text-rose-600"
    >
      <UIcon
        name="i-lucide-circle-alert"
        class="h-3 w-3"
      />
      {{ error }}
    </p>
    <p
      v-else-if="hint"
      class="mt-1 text-[10px] text-slate-400"
    >
      {{ hint }}
    </p>
  </div>
</template>
