<script setup lang="ts">
import { ref, computed } from 'vue'
import { projectImportApi } from '../../api/projectImport.api'
import type { ProjectImportPreviewResponse } from '../../types/projectImport.types'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const toast = useToast()

// States
const step = ref<'upload' | 'preview'>('upload')
const selectedFile = ref<File | null>(null)
const isDownloadingTemplate = ref(false)
const isValidating = ref(false)
const isConfirming = ref(false)
const previewData = ref<ProjectImportPreviewResponse | null>(null)

// Reset state saat modal ditutup
const handleClose = () => {
  if (isConfirming.value || isValidating.value) return
  step.value = 'upload'
  selectedFile.value = null
  previewData.value = null
  emit('close')
}

// 1. Download Template
const handleDownloadTemplate = async () => {
  isDownloadingTemplate.value = true
  try {
    const blob = await projectImportApi.downloadTemplate()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'portfolio_import_template.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.add({
      title: 'Template Downloaded',
      description: 'The Excel import template has been downloaded.',
      color: 'success'
    })
  } catch (err: any) {
    toast.add({
      title: 'Download Failed',
      description: err?.response?.data?.message || 'Failed to download template.',
      color: 'error'
    })
  } finally {
    isDownloadingTemplate.value = false
  }
}

// 2. File Selection & Drag-and-Drop
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    validateAndSetFile(target.files[0])
  }
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    validateAndSetFile(e.dataTransfer.files[0])
  }
}

const validateAndSetFile = (file: File) => {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    toast.add({
      title: 'Invalid File Type',
      description: 'Please upload an Excel file (.xlsx).',
      color: 'warning'
    })
    return
  }
  selectedFile.value = file
}

// 3. Eksekusi Preview
const handlePreview = async () => {
  if (!selectedFile.value) return
  isValidating.value = true
  try {
    const res = await projectImportApi.previewImport(selectedFile.value)
    if (res.success && res.data) {
      previewData.value = res.data
      step.value = 'preview'
    }
  } catch (err: any) {
    toast.add({
      title: 'Validation Failed',
      description:
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'Failed to preview Excel file.',
      color: 'error'
    })
  } finally {
    isValidating.value = false
  }
}

// 4. Eksekusi Confirm
const handleConfirm = async () => {
  if (!selectedFile.value) return
  isConfirming.value = true
  try {
    const res = await projectImportApi.confirmImport(selectedFile.value)
    if (res.success) {
      toast.add({
        title: 'Import Successful',
        description: `Successfully imported ${res.data?.imported_count || 0} projects.`,
        color: 'success'
      })
      emit('success')
      handleClose()
    }
  } catch (err: any) {
    const detailMsg =
      err?.response?.data?.message ||
      err?.response?.data?.detail?.message ||
      'Failed to confirm project import.'
    toast.add({
      title: 'Import Failed',
      description: detailMsg,
      color: 'error'
    })
  } finally {
    isConfirming.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs font-sans"
    @click.self="handleClose"
  >
    <div
      class="relative flex flex-col w-full max-h-[90vh] rounded-2xl border border-slate-100 bg-white shadow-2xl transition-all"
      :class="step === 'preview' ? 'max-w-4xl' : 'max-w-xl'"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
        <div class="flex items-center gap-2.5">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
          >
            <UIcon name="i-lucide-file-spreadsheet" class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900">Import Portfolio Projects</h2>
            <p class="text-xs text-slate-500">
              Bulk upload portfolio projects from an Excel spreadsheet.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          @click="handleClose"
        >
          <UIcon name="i-lucide-x" class="h-4 w-4" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="overflow-y-auto p-6 space-y-5">
        <!-- STEP 1: UPLOAD & TEMPLATE -->
        <template v-if="step === 'upload'">
          <!-- Card Info & Download Template -->
          <div
            class="flex items-center justify-between p-4 rounded-xl border border-blue-100 bg-blue-50/50"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-info" class="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p class="text-xs font-bold text-blue-900">Need the official format?</p>
                <p class="text-[11px] text-blue-700">
                  Download the pre-structured Excel template before filling your data.
                </p>
              </div>
            </div>
            <button
              type="button"
              :disabled="isDownloadingTemplate"
              class="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-2xs hover:bg-blue-50 hover:text-blue-700 cursor-pointer disabled:opacity-50"
              @click="handleDownloadTemplate"
            >
              <UIcon
                :name="isDownloadingTemplate ? 'i-lucide-loader-2' : 'i-lucide-download'"
                class="h-3.5 w-3.5"
                :class="{ 'animate-spin': isDownloadingTemplate }"
              />
              <span>{{ isDownloadingTemplate ? 'Downloading...' : 'Template' }}</span>
            </button>
          </div>

          <!-- Dropzone -->
          <div
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer"
            :class="
              isDragging
                ? 'border-blue-500 bg-blue-50/30'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            "
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="fileInputRef?.click()"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              class="hidden"
              @change="onFileChange"
            />
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-100 text-slate-500 mb-3"
            >
              <UIcon name="i-lucide-upload-cloud" class="h-6 w-6 text-blue-600" />
            </div>
            <p class="text-xs font-bold text-slate-800">
              {{ selectedFile ? selectedFile.name : 'Click to select or drag & drop Excel file' }}
            </p>
            <p class="text-[11px] text-slate-400 mt-1">Supports .xlsx files only</p>
          </div>
        </template>

        <!-- STEP 2: PREVIEW & VALIDATION RESULTS -->
        <template v-else-if="step === 'preview' && previewData">
          <!-- Summary Metrics Cards -->
          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center">
              <p class="text-[11px] font-medium text-slate-500">Total Rows</p>
              <p class="text-base font-bold text-slate-900 mt-0.5">{{ previewData.total_rows }}</p>
            </div>
            <div class="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
              <p class="text-[11px] font-medium text-emerald-600">Valid Rows</p>
              <p class="text-base font-bold text-emerald-700 mt-0.5">
                {{ previewData.valid_rows }}
              </p>
            </div>
            <div class="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-center">
              <p class="text-[11px] font-medium text-rose-600">Invalid Rows</p>
              <p class="text-base font-bold text-rose-700 mt-0.5">{{ previewData.invalid_rows }}</p>
            </div>
          </div>

          <!-- Alert jika ada error -->
          <div
            v-if="previewData.invalid_rows > 0"
            class="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/60 text-xs text-rose-800"
          >
            <UIcon name="i-lucide-alert-triangle" class="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p class="font-bold">Errors found in file</p>
              <p class="text-[11px] text-rose-700 mt-0.5">
                Please fix all issues listed below in your Excel sheet before confirming the import.
              </p>
            </div>
          </div>

          <!-- Review Table -->
          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead
                class="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600"
              >
                <tr>
                  <th class="py-2.5 px-3 w-14">Row</th>
                  <th class="py-2.5 px-3">Project Code</th>
                  <th class="py-2.5 px-3">Project Name</th>
                  <th class="py-2.5 px-3">Client</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3">Validation Details</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="row in previewData.rows"
                  :key="row.row"
                  class="transition-colors hover:bg-slate-50/50"
                  :class="{ 'bg-rose-50/30': !row.valid }"
                >
                  <td class="py-2.5 px-3 font-medium text-slate-500">#{{ row.row }}</td>
                  <td class="py-2.5 px-3 font-semibold text-slate-800">
                    {{ row.data?.project_code || '-' }}
                  </td>
                  <td class="py-2.5 px-3 text-slate-700">{{ row.data?.project_name || '-' }}</td>
                  <td class="py-2.5 px-3 text-slate-700">{{ row.data?.customer_name || '-' }}</td>
                  <td class="py-2.5 px-3">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      :class="
                        row.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      "
                    >
                      <UIcon :name="row.valid ? 'i-lucide-check' : 'i-lucide-x'" class="h-3 w-3" />
                      {{ row.valid ? 'Valid' : 'Invalid' }}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-[11px]">
                    <!-- Errors -->
                    <div v-if="row.errors.length > 0" class="space-y-0.5">
                      <p
                        v-for="(err, eIdx) in row.errors"
                        :key="eIdx"
                        class="text-rose-600 font-medium"
                      >
                        • {{ err.message }}
                      </p>
                    </div>
                    <!-- Warnings -->
                    <div v-if="row.warnings.length > 0" class="space-y-0.5 mt-0.5">
                      <p
                        v-for="(warn, wIdx) in row.warnings"
                        :key="wIdx"
                        class="text-amber-600 font-medium"
                      >
                        • {{ warn.message }}
                      </p>
                    </div>
                    <span
                      v-if="!row.errors.length && !row.warnings.length"
                      class="text-slate-400 italic"
                    >
                      Ready to import
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <!-- Modal Footer -->
      <div
        class="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50 shrink-0"
      >
        <div>
          <button
            v-if="step === 'preview'"
            type="button"
            class="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            @click="step = 'upload'"
          >
            ← Upload different file
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            @click="handleClose"
          >
            Cancel
          </button>

          <!-- Step 1 Button -->
          <button
            v-if="step === 'upload'"
            type="button"
            :disabled="!selectedFile || isValidating"
            class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            @click="handlePreview"
          >
            <UIcon
              :name="isValidating ? 'i-lucide-loader-2' : 'i-lucide-arrow-right'"
              class="h-3.5 w-3.5"
              :class="{ 'animate-spin': isValidating }"
            />
            <span>{{ isValidating ? 'Validating File...' : 'Preview Import' }}</span>
          </button>

          <!-- Step 2 Button -->
          <button
            v-else-if="step === 'preview'"
            type="button"
            :disabled="!previewData || previewData.invalid_rows > 0 || isConfirming"
            class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
            @click="handleConfirm"
          >
            <UIcon
              :name="isConfirming ? 'i-lucide-loader-2' : 'i-lucide-check-circle-2'"
              class="h-3.5 w-3.5"
              :class="{ 'animate-spin': isConfirming }"
            />
            <span>{{
              isConfirming
                ? 'Importing Data...'
                : `Confirm & Import (${previewData?.valid_rows || 0})`
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
