<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  label: string
  description?: string
  acceptLabel?: string
  accept?: string
  multiple?: boolean
  icon?: string
  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  description: 'Click to upload or drag and drop',
  acceptLabel: 'PNG, JPG up to 10 MB',
  accept: '',
  multiple: false,
  icon: 'i-lucide-cloud-upload',
  compact: false
})

const emit = defineEmits<{
  (e: 'files', files: File[]): void
}>()

const inputElement = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const openPicker = () => {
  inputElement.value?.click()
}

const submitFiles = (files: FileList | null) => {
  if (!files?.length) return
  emit('files', Array.from(files))
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  submitFiles(target.files)
  target.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  submitFiles(event.dataTransfer?.files ?? null)
}
</script>

<template>
  <div
    role="button"
    tabindex="0"
    class="group flex cursor-pointer rounded-xl border border-dashed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
    :class="[
      isDragging
        ? 'border-blue-400 bg-blue-50/70'
        : 'border-slate-300 bg-slate-50/70 hover:border-blue-300 hover:bg-blue-50/40',
      compact
        ? 'items-center justify-start gap-2.5 px-3 py-2.5 text-left'
        : 'flex-col items-center justify-center gap-2 px-4 py-5 text-center'
    ]"
    @click="openPicker"
    @keydown.enter.prevent="openPicker"
    @keydown.space.prevent="openPicker"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <input
      ref="inputElement"
      type="file"
      class="sr-only"
      :accept="accept || undefined"
      :multiple="multiple"
      @click.stop
      @change="handleChange"
    >

    <span
      class="flex shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-xs ring-1 ring-slate-200/80 transition-colors group-hover:bg-blue-600 group-hover:text-white"
      :class="compact ? 'h-8 w-8' : 'h-9 w-9'"
    >
      <UIcon
        :name="icon"
        :class="compact ? 'h-3.5 w-3.5' : 'h-4 w-4'"
      />
    </span>

    <span class="min-w-0">
      <span
        class="block font-semibold text-slate-700"
        :class="compact ? 'text-[11px]' : 'text-xs'"
      >{{ label }}</span>
      <span
        class="block text-[10px] leading-4 text-slate-400"
        :class="compact ? 'mt-0' : 'mt-0.5'"
      >{{ description }}</span>
      <span
        v-if="acceptLabel"
        class="block text-[10px] font-medium text-slate-400"
        :class="compact ? 'mt-0.5' : 'mt-1'"
      >
        {{ acceptLabel }}
      </span>
    </span>
  </div>
</template>
