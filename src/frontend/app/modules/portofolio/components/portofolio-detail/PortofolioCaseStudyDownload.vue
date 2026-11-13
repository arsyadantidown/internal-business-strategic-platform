<script setup lang="ts">
interface Props {
  title: string
  fileUrl?: string | null
}

const props = defineProps<Props>()

const handleDownload = () => {
  if (props.fileUrl) {
    window.open(props.fileUrl, '_blank')
  }
}
</script>

<template>
  <div class="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs">
    <div class="flex items-center gap-2.5 text-slate-900">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon name="i-lucide-file-text" class="h-4.5 w-4.5" />
      </div>
      <h2 class="text-base font-bold tracking-tight">Case Study</h2>
    </div>

    <!-- Jika Ada File Case Study -->
    <div
      v-if="fileUrl"
      class="flex flex-col gap-4 sm:flex-row sm:items-center rounded-xl border border-slate-100 bg-slate-50/50 p-4"
    >
      <div
        class="relative h-28 w-full sm:w-44 shrink-0 overflow-hidden rounded-lg bg-blue-900 text-white p-3 flex flex-col justify-between shadow-xs"
      >
        <div class="flex items-center gap-1.5 text-[10px] font-semibold text-blue-200">
          <UIcon name="i-lucide-box" class="h-3.5 w-3.5" />
          <span>Case Study</span>
        </div>
        <p class="text-xs font-bold leading-tight">{{ title }}</p>
      </div>

      <div class="flex-1 space-y-3">
        <div>
          <h3 class="text-sm font-bold text-slate-900">{{ title }} – Case Study</h3>
          <p class="mt-1 text-xs text-slate-500 leading-relaxed">
            Detailed case study covering project background, solution approach, implementation
            process, and business impact.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
          @click="handleDownload"
        >
          <UIcon name="i-lucide-download" class="h-3.5 w-3.5" />
          <span>Download Case Study</span>
        </button>
      </div>
    </div>

    <!-- Empty State jika belum ada Case Study -->
    <div
      v-else
      class="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center"
    >
      <UIcon name="i-lucide-file-x" class="mx-auto h-7 w-7 text-slate-400" />
      <p class="mt-2 text-xs font-semibold text-slate-700">No Case Study Available</p>
      <p class="text-[11px] text-slate-400">
        A case study document has not been uploaded for this project.
      </p>
    </div>
  </div>
</template>
