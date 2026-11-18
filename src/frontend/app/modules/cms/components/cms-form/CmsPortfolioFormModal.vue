<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { CmsPortfolioContent } from '../../types/cms.types'
import { usePortfolioStore } from '~/modules/portofolio/stores/portofolio.store'
import { useMasterDataStore } from '~/modules/portofolio/stores/master-data.store'
import { projectApi } from '~/modules/cms/api/project.api'
import { cmsControlClass, cmsControlStateClass } from '../../utils/cmsForm'
import CmsFormField from './CmsFormField.vue'
import CmsFormSection from './CmsFormSection.vue'
import CmsRichTextEditor from './CmsRichTextEditor.vue'
import CmsUploadArea from './CmsUploadArea.vue'
import { useCmsPortfolioForm } from '../../composables/useCmsPortfolioForm'

interface Props {
  isOpen: boolean
  content: CmsPortfolioContent | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()

const toast = useToast()

// 1. Inisialisasi Stores
const portfolioStore = usePortfolioStore()
const masterDataStore = useMasterDataStore()

// 2. Inisialisasi Form State & Logic dari Composable
const {
  form,
  estimatedProfit,
  populateFormFromStore,
  preparePayloads,
  addPartner,
  removePartner,
  addSuccessMetric,
  removeSuccessMetric,
  revertSection
} = useCmsPortfolioForm()

// Media local states (untuk cover preview dan case study)
const featuredCover = ref<any>(null)
const galleryFiles = ref<any[]>([])
const caseStudyFile = ref<any>(null)
const supportingDocuments = ref<any[]>([])

// Partner dropdown options
const partnerRoleOptions = [
  { value: 'principal', label: 'Principal' },
  { value: 'vendor', label: 'Vendor' }
]
const partnerList = ref<{ label: string; value: string }[]>([])

// Fungsi untuk memuat master data & partners HANYA saat dibutuhkan (Lazy Load)
const loadOptionsOnDemand = async () => {
  // fetchAllMasterData di store sudah pintar: jika sudah pernah ter-load, tidak akan nembak API lagi
  masterDataStore.fetchAllMasterData()

  // Partners hanya di-fetch jika partnerList masih kosong
  if (partnerList.value.length === 0) {
    try {
      const resPartners = await projectApi.getPartners()
      partnerList.value = (resPartners || []).map((p: any) => ({
        label: p.partner_name || p.name || '',
        value: p.id
      }))
    } catch (err) {
      console.error('Failed to load partners', err)
    }
  }
}

// Options dropdown Master Data
const businessUnitOptions = computed(() => masterDataStore.businessUnitOptions)
const projectStatusOptions = computed(() => masterDataStore.projectStatusOptions)
const industryOptions = computed(() => masterDataStore.industryOptions)
const companySizeOptions = computed(() => masterDataStore.companySizeOptions)
const customerTypeOptions = computed(() => masterDataStore.customerTypeOptions)
const legalStructureOptions = computed(() => masterDataStore.legalStructureOptions)
const productOptions = computed(() => masterDataStore.productOptions)
const techStackOptions = computed(() => {
  return (masterDataStore.techStacks || []).map((t: any) => ({
    label: t.tech_stack_name || t.name || '',
    value: t.id
  }))
})

// State Section Accordion
const openSections = reactive<Record<string, boolean>>({
  'project-information': true,
  'customer-information': true,
  'contract-governance': true,
  'financial-information': true,
  'project-content': true,
  'products-tech-partners': true,
  'media-documents': true
})

// State Allow Edit Checkbox (Default false)
const allowEdit = reactive<Record<string, boolean>>({
  'project-information': false,
  'customer-information': false,
  'contract-governance': false,
  'financial-information': false,
  'project-content': false,
  'products-tech-partners': false,
  'media-documents': false
})

// Deteksi jika user meng-uncheck section: otomatis revert isian section tersebut ke data asli!
watch(
  () => ({ ...allowEdit }),
  (newVal, oldVal) => {
    Object.keys(newVal).forEach((key) => {
      // Jika sebelumnya true, lalu berubah jadi false (di-uncheck oleh user):
      if (oldVal && oldVal[key] === true && newVal[key] === false) {
        revertSection(key)
      }
    })
  }
)

// Fungsi helper untuk mereset semua checkbox allowEdit kembali ke false
const resetAllowEdit = () => {
  Object.keys(allowEdit).forEach((key) => {
    allowEdit[key] = false
  })
}

// Watcher: Saat modal dibuka, fetch detail; Saat modal ditutup, reset checkbox!
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      // Saat modal ditutup (cancel / tombol X / klik luar / setelah save):
      resetAllowEdit()
      isYearOpen.value = false
    }
  }
)

// --- Year Picker Popover State ---
const isYearOpen = ref(false)
const currentYear = new Date().getFullYear()

// Basis dekade awal
const yearPickerBase = ref(Math.floor((Number(form.year) || currentYear) / 12) * 12)

// Ketika detail data project berhasil dimuat, sinkronkan basis dekade ke tahun project tersebut
watch(
  () => form.year,
  (newYear) => {
    if (newYear) {
      yearPickerBase.value = Math.floor(Number(newYear) / 12) * 12
    }
  }
)

const displayedYears = computed(() => {
  const start = yearPickerBase.value
  return Array.from({ length: 12 }, (_, i) => start + i)
})

const prevYears = () => {
  yearPickerBase.value -= 12
}

const nextYears = () => {
  yearPickerBase.value += 12
}

const selectYear = (yr: number) => {
  form.year = String(yr)
  isYearOpen.value = false
}

watch(
  () => [props.isOpen, props.content],
  async ([isOpen, content]) => {
    if (isOpen) {
      // 1. Load Master Data secara on-demand (hanya saat modal terbuka)
      loadOptionsOnDemand()

      // 2. Fetch Detail Project yang sedang diedit
      if (content?.id) {
        const detail = await portfolioStore.fetchProjectDetail(content.id)
        if (detail) {
          populateFormFromStore(detail)
        }
      }
    }
  },
  { immediate: true }
)

// Toggle helpers untuk Products & Tech Stacks
const toggleProduct = (id: string) => {
  if (!allowEdit['products-tech-partners']) return
  const idx = form.product_ids.indexOf(id)
  if (idx === -1) form.product_ids.push(id)
  else form.product_ids.splice(idx, 1)
}

const toggleTechStack = (id: string) => {
  if (!allowEdit['products-tech-partners']) return
  const idx = form.tech_stack_ids.indexOf(id)
  if (idx === -1) form.tech_stack_ids.push(id)
  else form.tech_stack_ids.splice(idx, 1)
}

// Media handlers
const handleCoverImage = (files: File[]) => {
  if (!files.length) return
  const file = files[0]
  if (featuredCover.value?.previewUrl) URL.revokeObjectURL(featuredCover.value.previewUrl)
  featuredCover.value = {
    file,
    category: 'image',
    title: 'Featured Cover',
    previewUrl: URL.createObjectURL(file)
  }
}
const removeCoverImage = () => {
  if (featuredCover.value?.previewUrl) URL.revokeObjectURL(featuredCover.value.previewUrl)
  featuredCover.value = null
}
const handleGalleryImages = (files: File[]) => {
  files.forEach((file) => {
    galleryFiles.value.push({
      file,
      category: 'image',
      title: file.name,
      previewUrl: URL.createObjectURL(file)
    })
  })
}
const removeGalleryImage = (index: number) => {
  const item = galleryFiles.value[index]
  if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
  galleryFiles.value.splice(index, 1)
}
const handleCaseStudy = (files: File[]) => {
  if (!files.length) return
  caseStudyFile.value = { file: files[0], category: 'case_study', title: files[0].name }
}
const handleSupportingDocuments = (files: File[]) => {
  files.forEach((file) => {
    supportingDocuments.value.push({ file, category: 'document', title: file.name })
  })
}
const removeSupportingDocument = (index: number) => {
  supportingDocuments.value.splice(index, 1)
}

onBeforeUnmount(() => {
  if (featuredCover.value?.previewUrl) URL.revokeObjectURL(featuredCover.value.previewUrl)
  galleryFiles.value.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl))
})

// Submitting state & Handler Save Changes
const isSubmitting = ref(false)

const handleSave = async () => {
  if (!props.content?.id) return

  // 1. Ambil payload tasks yang terseleksi
  const tasks = preparePayloads(allowEdit)

  // 2. Validasi: Jangan panggil store jika tidak ada section yang di-enable
  if (Object.keys(tasks).length === 0) {
    toast.add({
      title: 'No Section Enabled',
      description: 'Please enable editing on at least one section before saving.',
      color: 'warning'
    })
    return
  }

  isSubmitting.value = true
  try {
    // 3. Panggil action store untuk update modular
    await portfolioStore.updateProjectSectional(props.content.id, tasks)

    // Toast Sukses dengan Progress Bar Hijau Berjalan
    toast.add({
      title: 'Changes Saved',
      description: 'Portfolio project has been updated successfully.',
      color: 'success'
    })

    emit('save')
    emit('close')
  } catch (err: any) {
    // Toast Gagal dengan Progress Bar Merah Berjalan
    toast.add({
      title: 'Failed to Save',
      description: err?.response?.data?.message || err?.message || 'Something went wrong.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs font-sans"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-4xl rounded-2xl border border-slate-100 bg-white shadow-2xl flex flex-col max-h-[92vh]"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
        <div>
          <h2 class="text-base font-bold text-slate-900">
            {{ content ? 'Edit Portfolio Content' : 'Add Portfolio Content' }}
          </h2>
          <p class="text-xs text-slate-500">
            Configure project information, governance, metrics, and supporting assets.
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          @click="emit('close')"
        >
          <UIcon name="i-lucide-x" class="h-4 w-4" />
        </button>
      </div>

      <!-- Modal Body (Scrollable Container) -->
      <div class="overflow-y-auto p-6 space-y-5">
        <!-- Loading State saat fetch detail dari store -->
        <div
          v-if="portfolioStore.isDetailLoading"
          class="flex flex-col items-center justify-center py-20 gap-3"
        >
          <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-blue-600" />
          <p class="text-xs font-medium text-slate-500">Loading project detail from database...</p>
        </div>

        <template v-else>
          <!-- 1. PROJECT INFORMATION -->
          <CmsFormSection
            v-model:open="openSections['project-information']"
            title="Project Information"
            description="Basic information, identification, and business unit assignment."
            icon="i-lucide-briefcase"
            collapsible
          >
            <!-- Enable Editing Checkbox (KIRI) -->
            <div class="sm:col-span-2 -mt-1 mb-2.5 flex items-center justify-start">
              <label
                class="inline-flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-slate-600 hover:text-slate-900"
              >
                <input
                  v-model="allowEdit['project-information']"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span :class="{ 'font-bold text-blue-600': allowEdit['project-information'] }">
                  {{
                    allowEdit['project-information']
                      ? 'Editing enabled'
                      : 'Enable editing for this section'
                  }}
                </span>
              </label>
            </div>

            <CmsFormField label="Project Code" required>
              <input
                v-model="form.project_code"
                type="text"
                placeholder="e.g. PRJ-2026-001"
                :disabled="!allowEdit['project-information']"
                class="h-9 font-mono disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Project Name" required>
              <input
                v-model="form.project_name"
                type="text"
                placeholder="e.g. Digital Banking Transformation"
                :disabled="!allowEdit['project-information']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Opportunity / Service Type">
              <input
                v-model="form.opportunity"
                type="text"
                placeholder="e.g. Core Banking Upgrade"
                :disabled="!allowEdit['project-information']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <!-- KODE BARU: Year Picker Popover dengan Proteksi Allow Edit -->
            <CmsFormField label="Year" required>
              <div class="relative w-full">
                <!-- Trigger Button -->
                <button
                  type="button"
                  :disabled="!allowEdit['project-information']"
                  class="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-xs hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-200"
                  :class="{ 'cursor-pointer': allowEdit['project-information'] }"
                  @click="allowEdit['project-information'] && (isYearOpen = !isYearOpen)"
                >
                  <span
                    :class="{
                      'text-slate-400 font-normal': !form.year,
                      'font-medium font-mono text-slate-900': form.year
                    }"
                  >
                    {{ form.year || 'Select Year' }}
                  </span>
                  <UIcon name="i-lucide-calendar" class="h-4 w-4 text-slate-400" />
                </button>

                <!-- Invisible Backdrop (Tutup popover jika klik di luar) -->
                <div v-if="isYearOpen" class="fixed inset-0 z-40" @click="isYearOpen = false" />

                <!-- Popover Panel -->
                <div
                  v-if="isYearOpen"
                  class="absolute left-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl font-sans"
                >
                  <!-- Header: Rentang Tahun & Navigasi -->
                  <div
                    class="flex items-center justify-between mb-3 pb-2 border-b border-slate-100"
                  >
                    <span class="text-xs font-bold text-slate-700 font-mono">
                      {{ displayedYears[0] }} – {{ displayedYears[displayedYears.length - 1] }}
                    </span>
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        class="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
                        @click.stop="prevYears"
                      >
                        <UIcon name="i-lucide-chevron-left" class="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        class="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
                        @click.stop="nextYears"
                      >
                        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Grid 12 Tahun -->
                  <div class="grid grid-cols-3 gap-1.5">
                    <button
                      v-for="yr in displayedYears"
                      :key="yr"
                      type="button"
                      class="py-2 text-xs rounded-lg font-medium transition-all cursor-pointer font-mono text-center"
                      :class="
                        Number(form.year) === yr
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : yr === currentYear
                            ? 'border border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      "
                      @click="selectYear(yr)"
                    >
                      {{ yr }}
                    </button>
                  </div>
                </div>
              </div>
            </CmsFormField>

            <CmsFormField label="Business Unit" required>
              <select
                v-model="form.business_unit_id"
                :disabled="!allowEdit['project-information']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="">Select Business Unit</option>
                <option v-for="opt in businessUnitOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField label="Project Status" required>
              <select
                v-model="form.project_status_id"
                :disabled="!allowEdit['project-information']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="">Select Project Status</option>
                <option v-for="opt in projectStatusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>

            <!-- Checkbox: Is Featured Project (di kiri bawah) -->
            <div class="sm:col-span-2 pt-1">
              <label
                class="inline-flex items-center gap-2.5 text-xs font-medium cursor-pointer select-none text-slate-700"
                :class="{ 'opacity-50 cursor-not-allowed': !allowEdit['project-information'] }"
              >
                <input
                  v-model="form.is_featured"
                  type="checkbox"
                  :disabled="!allowEdit['project-information']"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-star" class="h-3.5 w-3.5 text-amber-500" />
                  <span>Mark as Featured Project</span>
                </span>
                <span class="text-[11px] text-slate-400 font-normal">
                  (Displays highlighted on top showcases & hero banners)
                </span>
              </label>
            </div>
          </CmsFormSection>

          <!-- 2. CUSTOMER INFORMATION -->
          <CmsFormSection
            v-model:open="openSections['customer-information']"
            title="Customer Information"
            description="Client identity, classification, and organization size."
            icon="i-lucide-building-2"
            collapsible
          >
            <!-- Enable Editing Checkbox (KIRI) -->
            <div class="sm:col-span-2 -mt-1 mb-2.5 flex items-center justify-start">
              <label
                class="inline-flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-slate-600 hover:text-slate-900"
              >
                <input
                  v-model="allowEdit['customer-information']"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span :class="{ 'font-bold text-blue-600': allowEdit['customer-information'] }">
                  {{
                    allowEdit['customer-information']
                      ? 'Editing enabled'
                      : 'Enable editing for this section'
                  }}
                </span>
              </label>
            </div>

            <CmsFormField label="Customer Name" required>
              <input
                v-model="form.customer.customer_name"
                type="text"
                placeholder="e.g. Bank Central Asia"
                :disabled="!allowEdit['customer-information']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Customer Location">
              <input
                v-model="form.customer.customer_location"
                type="text"
                placeholder="e.g. Jakarta, Indonesia"
                :disabled="!allowEdit['customer-information']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Annual Revenue">
              <input
                v-model="form.customer.annual_revenue"
                type="text"
                placeholder="e.g. 115T"
                :disabled="!allowEdit['customer-information']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Industry" required>
              <select
                v-model="form.customer.industry_id"
                :disabled="!allowEdit['customer-information']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="">Select Industry</option>
                <option v-for="opt in industryOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField label="Company Size">
              <select
                v-model="form.customer.company_size_id"
                :disabled="!allowEdit['customer-information']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="">Select Company Size</option>
                <option v-for="opt in companySizeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField label="Customer Type">
              <select
                v-model="form.customer.customer_type_id"
                :disabled="!allowEdit['customer-information']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="">Select Customer Type</option>
                <option v-for="opt in customerTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField label="Legal Structure">
              <select
                v-model="form.customer.legal_structure_id"
                :disabled="!allowEdit['customer-information']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="">Select Legal Structure</option>
                <option v-for="opt in legalStructureOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>
          </CmsFormSection>

          <!-- 3. CONTRACT & GOVERNANCE -->
          <CmsFormSection
            v-model:open="openSections['contract-governance']"
            title="Contract & Governance"
            description="Contract metadata, period, and project management personnel."
            icon="i-lucide-scroll"
            collapsible
          >
            <!-- Enable Editing Checkbox (KIRI) -->
            <div class="sm:col-span-2 -mt-1 mb-2.5 flex items-center justify-start">
              <label
                class="inline-flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-slate-600 hover:text-slate-900"
              >
                <input
                  v-model="allowEdit['contract-governance']"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span :class="{ 'font-bold text-blue-600': allowEdit['contract-governance'] }">
                  {{
                    allowEdit['contract-governance']
                      ? 'Editing enabled'
                      : 'Enable editing for this section'
                  }}
                </span>
              </label>
            </div>

            <CmsFormField label="Contract Name">
              <input
                v-model="form.contract_name"
                type="text"
                placeholder="Contract title"
                :disabled="!allowEdit['contract-governance']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Contract Number">
              <input
                v-model="form.contract_number"
                type="text"
                placeholder="CTR/2026/001"
                :disabled="!allowEdit['contract-governance']"
                class="h-9 font-mono disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Start Date" required>
              <input
                v-model="form.start_date"
                type="date"
                :disabled="!allowEdit['contract-governance']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="End Date" required>
              <input
                v-model="form.end_date"
                type="date"
                :disabled="!allowEdit['contract-governance']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Project Manager">
              <input
                v-model="form.project_manager"
                type="text"
                placeholder="Name of Project Manager"
                :disabled="!allowEdit['contract-governance']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Account Manager">
              <input
                v-model="form.account_manager"
                type="text"
                placeholder="Name of Account Manager"
                :disabled="!allowEdit['contract-governance']"
                class="h-9 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>
          </CmsFormSection>

          <!-- 4. FINANCIAL INFORMATION -->
          <CmsFormSection
            v-model:open="openSections['financial-information']"
            title="Financial Information"
            description="Budget, contract values, COGS, and estimated margins."
            icon="i-lucide-wallet"
            collapsible
          >
            <!-- Enable Editing Checkbox (KIRI) -->
            <div class="sm:col-span-2 -mt-1 mb-2.5 flex items-center justify-start">
              <label
                class="inline-flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-slate-600 hover:text-slate-900"
              >
                <input
                  v-model="allowEdit['financial-information']"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span :class="{ 'font-bold text-blue-600': allowEdit['financial-information'] }">
                  {{
                    allowEdit['financial-information']
                      ? 'Editing enabled'
                      : 'Enable editing for this section'
                  }}
                </span>
              </label>
            </div>

            <CmsFormField label="Value Before Tax (IDR)" required>
              <input
                v-model.number="form.value_before_tax"
                type="number"
                placeholder="0"
                :disabled="!allowEdit['financial-information']"
                class="h-9 font-mono disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Carry Over Value (IDR)">
              <input
                v-model.number="form.carry_over_value"
                type="number"
                placeholder="0"
                :disabled="!allowEdit['financial-information']"
                class="h-9 font-mono disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="COGS (IDR)" required>
              <input
                v-model.number="form.financial.cogs"
                type="number"
                placeholder="0"
                :disabled="!allowEdit['financial-information']"
                class="h-9 font-mono disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Operational Cost (IDR)" required>
              <input
                v-model.number="form.financial.operational_cost"
                type="number"
                placeholder="0"
                :disabled="!allowEdit['financial-information']"
                class="h-9 font-mono disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField full label="">
              <div
                class="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center justify-between text-xs"
              >
                <span class="font-medium text-slate-500">Estimated Net Profit:</span>
                <span class="font-bold text-slate-900">
                  Rp {{ (estimatedProfit || 0).toLocaleString('id-ID') }}
                </span>
              </div>
            </CmsFormField>
          </CmsFormSection>

          <!-- 5. PROJECT CONTENT & CASE STUDY -->
          <CmsFormSection
            v-model:open="openSections['project-content']"
            title="Project Content & Case Study"
            description="Objectives, background narrative, challenges, and solutions."
            icon="i-lucide-file-text"
            collapsible
          >
            <!-- Enable Editing Checkbox (KIRI) -->
            <div class="sm:col-span-2 -mt-1 mb-2.5 flex items-center justify-start">
              <label
                class="inline-flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-slate-600 hover:text-slate-900"
              >
                <input
                  v-model="allowEdit['project-content']"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span :class="{ 'font-bold text-blue-600': allowEdit['project-content'] }">
                  {{
                    allowEdit['project-content']
                      ? 'Editing enabled'
                      : 'Enable editing for this section'
                  }}
                </span>
              </label>
            </div>

            <CmsFormField full label="Project Objective" required>
              <textarea
                v-model="form.project_objective"
                rows="2"
                placeholder="Brief statement of project goals"
                :disabled="!allowEdit['project-content']"
                class="py-2 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <!-- Rich Text Editor dengan proteksi container -->
            <CmsFormField full label="Project Description">
              <div
                :class="{
                  'pointer-events-none opacity-60 bg-slate-50/80 rounded-lg cursor-not-allowed':
                    !allowEdit['project-content']
                }"
              >
                <CmsRichTextEditor v-model="form.project_description" />
              </div>
            </CmsFormField>

            <CmsFormField full label="Background">
              <textarea
                v-model="form.project_background"
                rows="2"
                placeholder="Context leading to the project"
                :disabled="!allowEdit['project-content']"
                class="py-2 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField full label="Challenges">
              <textarea
                v-model="form.project_challenges"
                rows="2"
                placeholder="Obstacles encountered"
                :disabled="!allowEdit['project-content']"
                class="py-2 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField full label="Solutions">
              <textarea
                v-model="form.project_solution"
                rows="2"
                placeholder="Solutions delivered"
                :disabled="!allowEdit['project-content']"
                class="py-2 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <!-- SUCCESS METRICS (LENGKAP: ADD + DELETE) -->
            <CmsFormField full label="Success Metrics">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-500">Measurable impact and achievements</span>
                  <button
                    type="button"
                    :disabled="!allowEdit['project-content']"
                    class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    @click="addSuccessMetric"
                  >
                    <UIcon name="i-lucide-plus" class="h-3.5 w-3.5" />
                    <span>Add Metric</span>
                  </button>
                </div>

                <div
                  v-for="(metric, idx) in form.success_metrics"
                  :key="idx"
                  class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <input
                    v-model="metric.success_metric_value"
                    type="text"
                    placeholder="e.g. +60% or $2M"
                    :disabled="!allowEdit['project-content']"
                    class="h-8 w-1/3 text-xs rounded-lg border border-slate-200 bg-white px-2.5 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <input
                    v-model="metric.success_metric_label"
                    type="text"
                    placeholder="Metric description (e.g. Increase in User Adoption)"
                    :disabled="!allowEdit['project-content']"
                    class="h-8 flex-1 text-xs rounded-lg border border-slate-200 bg-white px-2.5 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    :disabled="!allowEdit['project-content']"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    @click="removeSuccessMetric(idx)"
                  >
                    <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                  </button>
                </div>

                <p v-if="!form.success_metrics.length" class="text-xs text-slate-400 italic">
                  No success metrics added yet.
                </p>
              </div>
            </CmsFormField>
          </CmsFormSection>

          <!-- 6. PRODUCTS, TECHNOLOGIES & PARTNERS -->
          <CmsFormSection
            v-model:open="openSections['products-tech-partners']"
            title="Products, Technologies & Partners"
            description="Associate company products, technology stacks, and collaborating vendors."
            icon="i-lucide-cpu"
            collapsible
          >
            <!-- Enable Editing Checkbox (KIRI) -->
            <div class="sm:col-span-2 -mt-1 mb-2.5 flex items-center justify-start">
              <label
                class="inline-flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-slate-600 hover:text-slate-900"
              >
                <input
                  v-model="allowEdit['products-tech-partners']"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span :class="{ 'font-bold text-blue-600': allowEdit['products-tech-partners'] }">
                  {{
                    allowEdit['products-tech-partners']
                      ? 'Editing enabled'
                      : 'Enable editing for this section'
                  }}
                </span>
              </label>
            </div>

            <CmsFormField full label="Associated Products">
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="prod in productOptions"
                  :key="prod.value"
                  type="button"
                  :disabled="!allowEdit['products-tech-partners']"
                  class="rounded-lg px-2.5 py-1 text-xs font-medium border cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    form.product_ids.includes(prod.value)
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  "
                  @click="toggleProduct(prod.value)"
                >
                  {{ prod.label }}
                </button>
              </div>
            </CmsFormField>

            <CmsFormField full label="Tech Stacks">
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="tech in techStackOptions"
                  :key="tech.value"
                  type="button"
                  :disabled="!allowEdit['products-tech-partners']"
                  class="rounded-lg px-2.5 py-1 text-xs font-medium border cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    form.tech_stack_ids.includes(tech.value)
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  "
                  @click="toggleTechStack(tech.value)"
                >
                  {{ tech.label }}
                </button>
              </div>
            </CmsFormField>

            <!-- INVOLVED PARTNERS (LENGKAP: ADD + DELETE) -->
            <CmsFormField full label="Involved Partners">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-500">Collaborating principals or vendors</span>
                  <button
                    type="button"
                    :disabled="!allowEdit['products-tech-partners']"
                    class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    @click="addPartner"
                  >
                    <UIcon name="i-lucide-plus" class="h-3.5 w-3.5" />
                    <span>Add Partner</span>
                  </button>
                </div>

                <div
                  v-for="(partner, idx) in form.partners"
                  :key="idx"
                  class="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <!-- Dropdown 1: Pilih Nama Partner (AWS, Google, dll) -->
                  <select
                    v-model="partner.partner_id"
                    :disabled="!allowEdit['products-tech-partners']"
                    class="h-8 flex-1 text-xs rounded-lg border border-slate-200 bg-white px-2.5 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Partner</option>
                    <option v-for="p in partnerList" :key="p.value" :value="p.value">
                      {{ p.label }}
                    </option>
                  </select>

                  <!-- Dropdown 2: Pilih Role (Principal / Vendor) -->
                  <select
                    v-model="partner.partner_role"
                    :disabled="!allowEdit['products-tech-partners']"
                    class="h-8 w-32 text-xs rounded-lg border border-slate-200 bg-white px-2.5 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option
                      v-for="role in partnerRoleOptions"
                      :key="role.value"
                      :value="role.value"
                    >
                      {{ role.label }}
                    </option>
                  </select>

                  <input
                    v-model="partner.partner_contribution"
                    type="text"
                    placeholder="Contribution note..."
                    :disabled="!allowEdit['products-tech-partners']"
                    class="h-8 flex-1 text-xs rounded-lg border border-slate-200 bg-white px-2.5 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />

                  <button
                    type="button"
                    :disabled="!allowEdit['products-tech-partners']"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    @click="removePartner(idx)"
                  >
                    <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                  </button>
                </div>

                <p v-if="!form.partners.length" class="text-xs text-slate-400 italic">
                  No partners added yet.
                </p>
              </div>
            </CmsFormField>
          </CmsFormSection>

          <!-- 7. MEDIA & DOCUMENTS -->
          <CmsFormSection
            v-model:open="openSections['media-documents']"
            title="Media & Documents"
            description="Visual assets, gallery, downloadable case studies, and documents."
            icon="i-lucide-image"
            collapsible
          >
            <!-- Enable Editing Checkbox (KIRI) -->
            <div class="sm:col-span-2 -mt-1 mb-2.5 flex items-center justify-start">
              <label
                class="inline-flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-slate-600 hover:text-slate-900"
              >
                <input
                  v-model="allowEdit['media-documents']"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span :class="{ 'font-bold text-blue-600': allowEdit['media-documents'] }">
                  {{
                    allowEdit['media-documents']
                      ? 'Editing enabled'
                      : 'Enable editing for this section'
                  }}
                </span>
              </label>
            </div>

            <!-- Featured Cover -->
            <CmsFormField
              full
              label="Featured Cover Image"
              hint="Primary visual shown on cards & hero header"
            >
              <div
                :class="{
                  'pointer-events-none opacity-50 cursor-not-allowed': !allowEdit['media-documents']
                }"
              >
                <div
                  v-if="featuredCover"
                  class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 max-w-sm"
                >
                  <img
                    :src="featuredCover.previewUrl"
                    alt="Cover"
                    class="h-36 w-full object-cover"
                  />
                  <button
                    v-if="allowEdit['media-documents']"
                    type="button"
                    class="absolute top-2 right-2 rounded-md bg-slate-900/70 p-1 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                    @click="removeCoverImage"
                  >
                    <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                  </button>
                </div>
                <CmsUploadArea
                  v-else
                  label="Upload Cover Image"
                  hint="PNG, JPG up to 10MB"
                  accept="image/*"
                  @files="handleCoverImage"
                />
              </div>
            </CmsFormField>

            <!-- Media Gallery Images -->
            <CmsFormField full label="Gallery Images" hint="Additional screenshots and media">
              <div
                class="space-y-3"
                :class="{
                  'pointer-events-none opacity-50 cursor-not-allowed': !allowEdit['media-documents']
                }"
              >
                <CmsUploadArea
                  label="Add Gallery Images"
                  hint="PNG, JPG, multiple files allowed"
                  accept="image/*"
                  multiple
                  @files="handleGalleryImages"
                />

                <div v-if="galleryFiles.length" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div
                    v-for="(img, idx) in galleryFiles"
                    :key="idx"
                    class="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 group h-24"
                  >
                    <img :src="img.previewUrl" alt="Gallery" class="h-full w-full object-cover" />
                    <button
                      v-if="allowEdit['media-documents']"
                      type="button"
                      class="absolute top-1 right-1 rounded bg-black/60 p-1 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      @click="removeGalleryImage(idx)"
                    >
                      <UIcon name="i-lucide-trash-2" class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </CmsFormField>

            <!-- Case Study PDF -->
            <CmsFormField full label="Case Study (PDF)">
              <div
                :class="{
                  'pointer-events-none opacity-50 cursor-not-allowed': !allowEdit['media-documents']
                }"
              >
                <div
                  v-if="caseStudyFile"
                  class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div class="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <UIcon name="i-lucide-file-text" class="h-4 w-4 text-rose-500" />
                    <span>{{ caseStudyFile.title }}</span>
                  </div>
                  <button
                    v-if="allowEdit['media-documents']"
                    type="button"
                    class="text-slate-400 hover:text-rose-600 cursor-pointer"
                    @click="caseStudyFile = null"
                  >
                    <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                  </button>
                </div>
                <CmsUploadArea
                  v-else
                  label="Upload Case Study PDF"
                  hint="PDF up to 25MB"
                  accept=".pdf,application/pdf"
                  @files="handleCaseStudy"
                />
              </div>
            </CmsFormField>

            <!-- Supporting Documents -->
            <CmsFormField full label="Supporting Documents">
              <div
                class="space-y-2"
                :class="{
                  'pointer-events-none opacity-50 cursor-not-allowed': !allowEdit['media-documents']
                }"
              >
                <CmsUploadArea
                  label="Add Supporting Documents"
                  hint="PDF, DOCX, XLSX up to 25MB"
                  multiple
                  @files="handleSupportingDocuments"
                />

                <div v-if="supportingDocuments.length" class="space-y-1">
                  <div
                    v-for="(doc, idx) in supportingDocuments"
                    :key="idx"
                    class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div class="flex items-center gap-2 text-slate-700 truncate">
                      <UIcon name="i-lucide-paperclip" class="h-3.5 w-3.5 text-slate-400" />
                      <span class="truncate">{{ doc.title }}</span>
                    </div>
                    <button
                      v-if="allowEdit['media-documents']"
                      type="button"
                      class="text-slate-400 hover:text-rose-600 cursor-pointer"
                      @click="removeSupportingDocument(idx)"
                    >
                      <UIcon name="i-lucide-trash-2" class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </CmsFormField>
          </CmsFormSection>
        </template>
      </div>

      <!-- Modal Footer -->
      <div
        class="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 bg-slate-50/50 shrink-0"
      >
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSave"
          :disabled="isSubmitting || portfolioStore.isDetailLoading"
          class="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer disabled:opacity-50"
        >
          {{ isSubmitting ? submitProgressText || 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>
