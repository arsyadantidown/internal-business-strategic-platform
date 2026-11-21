<script setup lang="ts">
import { ref } from 'vue'
import type { ProjectDocument } from '../../types/types'
import { portfolioApi } from '../../api/portofolio.api'

interface Props {
  documents: ProjectDocument[]
  projectId?: string
}

const props = defineProps<Props>()
const toast = useToast()

// Track file ID mana yang sedang proses download agar spinner hanya aktif di item terkait
const downloadingFileId = ref<string | null>(null)

const handleDownloadDocument = async (doc: ProjectDocument) => {
  const targetProjectId = doc.projectId || props.projectId

  if (!doc.id || !targetProjectId) {
    toast.add({
      title: 'Download Unavailable',
      description: 'Document identification is missing.',
      color: 'warning'
    })
    return
  }

  downloadingFileId.value = doc.id
  try {
    const res = await portfolioApi.downloadProjectFile(targetProjectId, doc.id)
    if (res.success && res.data?.download_url) {
      // Trigger download melalui browser
      const link = document.createElement('a')
      link.href = res.data.download_url
      link.download = res.data.file_name || doc.fileName || doc.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.add({
        title: 'Download Started',
        description: `Downloading ${doc.name}...`,
        color: 'success'
      })
    }
  } catch (err: any) {
    toast.add({
      title: 'Download Failed',
      description: err?.response?.data?.message || 'Unable to download file.',
      color: 'error'
    })
  } finally {
    downloadingFileId.value = null
  }
}

// Helper untuk menentukan badge type & style warna berdasarkan nama file / mime type
const getFileMeta = (doc: ProjectDocument) => {
  const target = (doc.fileName || doc.name || '').toLowerCase()
  const mime = (doc.mimeType || '').toLowerCase()

  // 1. PDF
  if (target.endsWith('.pdf') || mime.includes('pdf')) {
    return {
      label: 'PDF',
      badgeClass: 'bg-rose-50 text-rose-600 border border-rose-100'
    }
  }

  // 2. Excel / Spreadsheet
  if (
    target.endsWith('.xlsx') ||
    target.endsWith('.xls') ||
    target.endsWith('.csv') ||
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime.includes('csv')
  ) {
    return {
      label: 'XLSX',
      badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    }
  }

  // 3. Word / Document
  if (
    target.endsWith('.docx') ||
    target.endsWith('.doc') ||
    mime.includes('word') ||
    mime.includes('document')
  ) {
    return {
      label: 'DOC',
      badgeClass: 'bg-blue-50 text-blue-600 border border-blue-100'
    }
  }

  // 4. PowerPoint / Presentation
  if (
    target.endsWith('.pptx') ||
    target.endsWith('.ppt') ||
    mime.includes('presentation') ||
    mime.includes('powerpoint')
  ) {
    return {
      label: 'PPT',
      badgeClass: 'bg-amber-50 text-amber-600 border border-amber-100'
    }
  }

  // 5. ZIP / Archive
  if (target.endsWith('.zip') || target.endsWith('.rar') || mime.includes('zip')) {
    return {
      label: 'ZIP',
      badgeClass: 'bg-purple-50 text-purple-600 border border-purple-100'
    }
  }

  // Default / Other files
  const extMatch = target.match(/\.([a-z0-9]{3,4})$/i)
  const extLabel = extMatch ? extMatch[1].toUpperCase() : 'FILE'
  return {
    label: extLabel,
    badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200'
  }
}
</script>

<template>
  <div class="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
    <div class="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900">
      <UIcon name="i-lucide-file-text" class="h-4 w-4 text-blue-600" />
      <h3 class="text-sm font-bold">Internal Documentation</h3>
    </div>

    <!-- List Documents -->
    <div v-if="documents && documents.length > 0" class="space-y-2">
      <div
        v-for="doc in documents"
        :key="doc.id || doc.name"
        class="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 transition-colors hover:bg-slate-100/70"
      >
        <!-- Info Kiri: File Badge + Title + Meta -->
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            class="flex h-8 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-[10px] tracking-wider"
            :class="getFileMeta(doc).badgeClass"
          >
            {{ getFileMeta(doc).label }}
          </div>

          <div class="min-w-0 flex-1">
            <p
              class="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors"
              :title="doc.name"
            >
              {{ doc.name }}
            </p>
            <p class="text-[10px] text-slate-400">{{ doc.size }} • {{ doc.date }}</p>
          </div>
        </div>

        <!-- Tombol Aksi Kanan: Logo Download -->
        <button
          type="button"
          :disabled="downloadingFileId === doc.id"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          title="Download Document"
          @click="handleDownloadDocument(doc)"
        >
          <UIcon
            :name="downloadingFileId === doc.id ? 'i-lucide-loader-2' : 'i-lucide-download'"
            class="h-4 w-4"
            :class="{ 'animate-spin text-blue-600': downloadingFileId === doc.id }"
          />
        </button>
      </div>
    </div>

    <!-- Empty State Dokumen -->
    <div v-else class="py-4 text-center">
      <UIcon name="i-lucide-folder-open" class="mx-auto h-6 w-6 text-slate-300" />
      <p class="mt-1 text-xs text-slate-400 font-medium">No internal documents uploaded</p>
    </div>
  </div>
</template>
