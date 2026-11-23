<script setup lang="ts">
import { ref } from 'vue'
import { portfolioApi } from '../../api/portofolio.api'

interface Props {
  title: string
  projectId?: string
  fileId?: string | null
  fileName?: string | null
  fileUrl?: string | null
}

const props = defineProps<Props>()
const toast = useToast()
const isDownloading = ref(false)

const handleDownload = async () => {
  // Jika ada projectId & fileId, gunakan API download resmi yang secure
  if (props.projectId && props.fileId) {
    isDownloading.value = true
    try {
      const res = await portfolioApi.downloadProjectFile(props.projectId, props.fileId)
      if (res.success && res.data?.download_url) {
        // Trigger browser download langsung
        const link = document.createElement('a')
        link.href = res.data.download_url
        link.download = res.data.file_name || 'Case-Study.pdf'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.add({
          title: 'Download Started',
          description: `Downloading ${res.data.file_name || 'Case Study'}...`,
          color: 'success'
        })
      }
    } catch (err: any) {
      toast.add({
        title: 'Download Failed',
        description: err?.response?.data?.message || 'Unable to download case study file.',
        color: 'error'
      })
    } finally {
      isDownloading.value = false
    }
  } else if (props.fileUrl) {
    // Fallback jika hanya ada fileUrl langsung
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
      v-if="fileId || fileUrl"
      class="flex flex-col gap-4 sm:flex-row sm:items-center rounded-xl border border-slate-100 bg-slate-50/50 p-4"
    >
      <div
        class="relative h-28 w-full sm:w-44 shrink-0 overflow-hidden rounded-lg bg-blue-900 text-white p-3 flex flex-col justify-between shadow-xs"
      >
        <div class="flex items-center gap-1.5 text-[10px] font-semibold text-blue-200">
          <UIcon name="i-lucide-box" class="h-3.5 w-3.5" />
          <span>Case Study</span>
        </div>
        <p class="text-xs font-bold leading-tight">{{ fileName || title }}</p>
      </div>

      <div class="flex-1 space-y-3">
        <div>
          <h3 class="text-sm font-bold text-slate-900">
            {{ fileName || `${title} – Case Study` }}
          </h3>
          <p class="mt-1 text-xs text-slate-500 leading-relaxed">
            Detailed case study covering project background, solution approach, implementation
            process, and business impact.
          </p>
        </div>

        <button
          type="button"
          :disabled="isDownloading"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          @click="handleDownload"
        >
          <UIcon
            :name="isDownloading ? 'i-lucide-loader-2' : 'i-lucide-download'"
            class="h-3.5 w-3.5"
            :class="{ 'animate-spin': isDownloading }"
          />
          <span>{{ isDownloading ? 'Preparing Download...' : 'Download Case Study' }}</span>
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
