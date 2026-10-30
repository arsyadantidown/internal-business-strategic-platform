<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  portfolioBusinessUnitOptions,
  portfolioCompanySizeOptions,
  portfolioCustomerTypeOptions,
  portfolioDatabaseOptions,
  portfolioFrontendStackOptions,
  portfolioBackendStackOptions,
  portfolioIndustryOptions,
  portfolioLegalStructureOptions,
  portfolioProductOptions,
  portfolioProductPackageMap,
  portfolioProductStatusOptions,
  portfolioProjectStatusOptions
} from '~/modules/portofolio/data/portfolioOptions'
import {
  cmsRelatedPartnerFilterOptions,
  cmsTechnologyOptions
} from '../../data/cms.data'
import { stripCmsHtml } from '../../utils/cmsFormat'
import { cmsControlClass, cmsControlStateClass } from '../../utils/cmsForm'
import CmsFormField from './CmsFormField.vue'
import CmsFormSection from './CmsFormSection.vue'
import CmsOptionChips from './CmsOptionChips.vue'
import CmsRichTextEditor from './CmsRichTextEditor.vue'
import CmsUploadArea from './CmsUploadArea.vue'

interface UploadedImage {
  name: string
  url: string
}

interface UploadedDocument {
  name: string
  size: string
}

interface PortfolioAddDraft {
  projectName: string
  projectId: string
  shortDescription: string
  tags: string[]
  customerName: string
  companySize: string
  industry: string
  legalStructure: string
  customerType: string
  timelineStart: string
  timelineEnd: string
  businessUnit: string
  projectStatus: string
  product: string
  productPackage: string
  productStatus: string
  projectValue: string
  revenue: string
  cost: string
  profit: string
  overview: string
  background: string
  challenges: string
  solution: string
  successMetrics: string
  videoUrl: string
  technologies: string[]
  partners: string[]
  frontendStack: string
  backendStack: string
  database: string
  publishStatus: string
  publishDate: string
  visibility: string
}

const emit = defineEmits<{
  (e: 'back'): void
}>()

const toast = useToast()

const companySizeOptions = portfolioCompanySizeOptions
const legalStructureOptions = portfolioLegalStructureOptions
const customerTypeOptions = portfolioCustomerTypeOptions
const businessUnitOptions = portfolioBusinessUnitOptions

const publishStatusOptions = ['Draft', 'Scheduled', 'Published']

const sectionLinks = [
  { id: 'project-information', label: 'Project Information', icon: 'i-lucide-briefcase' },
  { id: 'customer-information', label: 'Customer Information', icon: 'i-lucide-building-2' },
  { id: 'project-details', label: 'Project Details', icon: 'i-lucide-calendar-range' },
  { id: 'financial-information', label: 'Financial Information', icon: 'i-lucide-wallet' },
  { id: 'project-content', label: 'Project Content', icon: 'i-lucide-file-text' },
  { id: 'media-documents', label: 'Media & Documents', icon: 'i-lucide-image' },
  { id: 'technology', label: 'Technology', icon: 'i-lucide-cpu' },
  { id: 'partners', label: 'Partners', icon: 'i-lucide-handshake' }
]

const openSections = reactive<Record<string, boolean>>(
  Object.fromEntries(sectionLinks.map(section => [section.id, false]))
)

const draft = reactive<PortfolioAddDraft>({
  projectName: '',
  projectId: '',
  shortDescription: '',
  tags: [],
  customerName: '',
  companySize: '',
  industry: '',
  legalStructure: '',
  customerType: '',
  timelineStart: '',
  timelineEnd: '',
  businessUnit: '',
  projectStatus: '',
  product: '',
  productPackage: '',
  productStatus: '',
  projectValue: '',
  revenue: '',
  cost: '',
  profit: '',
  overview: '',
  background: '',
  challenges: '',
  solution: '',
  successMetrics: '',
  videoUrl: '',
  technologies: [],
  partners: [],
  frontendStack: '',
  backendStack: '',
  database: '',
  publishStatus: 'Draft',
  publishDate: '',
  visibility: 'Internal'
})

const productPackageOptions = computed(() => {
  const product = draft.product
  if (!product) return []
  const packages = portfolioProductPackageMap[product] || []
  return packages.map(pkg => ({ label: pkg, value: pkg }))
})

watch(
  () => draft.product,
  () => {
    draft.productPackage = ''
  }
)

const activeSection = ref(sectionLinks[0]?.id ?? 'project-information')
const newTag = ref('')
const featuredImage = ref<UploadedImage | null>(null)
const galleryImages = ref<UploadedImage[]>([])
const caseStudyDocument = ref<UploadedDocument | null>(null)
const supportingDocuments = ref<UploadedDocument[]>([])
const objectUrls = new Set<string>()

const showToast = (
  title: string,
  description: string,
  color: 'info' | 'success' | 'error' = 'info'
) => {
  toast.add({ title, description, color })
}

const scrollToSection = async (id: string) => {
  activeSection.value = id
  openSections[id] = true
  if (!import.meta.client) return
  await nextTick()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const addTag = () => {
  const tag = newTag.value.trim().replace(/^#/, '')
  newTag.value = ''

  if (!tag) return
  if (draft.tags.some(item => item.toLowerCase() === tag.toLowerCase())) return

  draft.tags.push(tag)
}

const handleTagKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter' && event.key !== ',') return
  event.preventDefault()
  addTag()
}

const removeTag = (tag: string) => {
  draft.tags = draft.tags.filter(item => item !== tag)
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const createImage = (file: File): UploadedImage => {
  const url = URL.createObjectURL(file)
  objectUrls.add(url)
  return { name: file.name, url }
}

const releaseImage = (image: UploadedImage) => {
  URL.revokeObjectURL(image.url)
  objectUrls.delete(image.url)
}

const handleFeaturedImage = (files: File[]) => {
  const file = files.find(item => item.type.startsWith('image/'))
  if (!file) {
    showToast('Unsupported file', 'Choose a PNG, JPG, or WebP image.', 'error')
    return
  }

  if (featuredImage.value) releaseImage(featuredImage.value)
  featuredImage.value = createImage(file)
}

const removeFeaturedImage = () => {
  if (!featuredImage.value) return
  releaseImage(featuredImage.value)
  featuredImage.value = null
}

const handleGalleryImages = (files: File[]) => {
  const images = files.filter(file => file.type.startsWith('image/'))
  if (!images.length) {
    showToast('Unsupported file', 'Choose one or more PNG, JPG, or WebP images.', 'error')
    return
  }

  galleryImages.value.push(...images.map(createImage))
}

const removeGalleryImage = (index: number) => {
  const image = galleryImages.value[index]
  if (!image) return
  releaseImage(image)
  galleryImages.value.splice(index, 1)
}

const handleCaseStudy = (files: File[]) => {
  const file = files.find(item => item.type === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf'))
  if (!file) {
    showToast('Unsupported file', 'Upload a PDF case study document.', 'error')
    return
  }

  caseStudyDocument.value = {
    name: file.name,
    size: formatFileSize(file.size)
  }
}

const handleSupportingDocuments = (files: File[]) => {
  supportingDocuments.value.push(
    ...files.map(file => ({
      name: file.name,
      size: formatFileSize(file.size)
    }))
  )
}

const removeSupportingDocument = (index: number) => {
  supportingDocuments.value.splice(index, 1)
}

const customerComplete = computed(() => Boolean(
  draft.customerName.trim()
  && draft.companySize
  && draft.industry
  && draft.legalStructure
  && draft.customerType
))

const projectDetailsComplete = computed(() => Boolean(
  draft.timelineStart
  && draft.timelineEnd
  && draft.businessUnit
  && draft.projectStatus
))

const hasImages = computed(() => Boolean(featuredImage.value) || galleryImages.value.length > 0)

const checklist = computed(() => [
  { label: 'Project name is filled.', done: draft.projectName.trim().length > 0 },
  { label: 'Customer information is complete.', done: customerComplete.value },
  { label: 'Project details are filled.', done: projectDetailsComplete.value },
  { label: 'Project overview is filled.', done: stripCmsHtml(draft.overview).length > 0 },
  { label: 'At least one image is uploaded.', done: hasImages.value }
])

const completedChecklistCount = computed(() =>
  checklist.value.filter(item => item.done).length
)

const checklistProgress = computed(() => Math.round(
  (completedChecklistCount.value / checklist.value.length) * 100
))

const publishStatus = computed(() => {
  switch (draft.publishStatus) {
    case 'Published':
      return {
        chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dot: 'bg-emerald-500',
        hint: 'The portfolio content is ready to appear publicly.'
      }
    case 'Scheduled':
      return {
        chip: 'border-amber-200 bg-amber-50 text-amber-700',
        dot: 'bg-amber-500',
        hint: 'Publishing will follow the selected date and time.'
      }
    default:
      return {
        chip: 'border-slate-200 bg-slate-50 text-slate-600',
        dot: 'bg-slate-400',
        hint: 'Only internal editors can see this draft.'
      }
  }
})

const tips = [
  'Lead with the business problem and the measurable outcome.',
  'Use a strong cover image and at least three gallery images.',
  'Add specific success metrics to make the case study easier to evaluate.'
]

const handlePreview = () => {
  showToast(
    'Preview unavailable',
    'Preview is a visual placeholder in this UI prototype. No content was saved.'
  )
}

const handleSaveDraft = () => {
  showToast(
    'Draft not saved',
    'Save Draft is a visual placeholder. This form is not connected to a backend.'
  )
}

const handlePublish = () => {
  showToast(
    'Publishing not connected',
    'Publish is a visual placeholder. No content was published.'
  )
}

onMounted(() => {
  document.querySelector('main')?.scrollTo({ top: 0 })
})

onBeforeUnmount(() => {
  objectUrls.forEach(url => URL.revokeObjectURL(url))
  objectUrls.clear()
})
</script>

<template>
  <div class="flex flex-col gap-5 pb-10">
    <header class="flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
        <nav class="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-400">
          <span>Content Management</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="h-3 w-3 shrink-0"
          />
          <button
            type="button"
            class="rounded-sm transition-colors hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
            @click="emit('back')"
          >
            Portfolio Content
          </button>
          <UIcon
            name="i-lucide-chevron-right"
            class="h-3 w-3 shrink-0"
          />
          <span class="font-semibold text-slate-700">Add Portfolio</span>
        </nav>

        <h1 class="text-2xl font-bold leading-8 tracking-tight text-slate-900">
          Add Portfolio Content
        </h1>
        <p class="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
          Create a new portfolio content with project information, case studies, and supporting materials.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
        <button
          type="button"
          class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
          @click="handlePreview"
        >
          <UIcon
            name="i-lucide-eye"
            class="h-3.5 w-3.5"
          />
          Preview
        </button>

        <button
          type="button"
          class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
          @click="handleSaveDraft"
        >
          <UIcon
            name="i-lucide-file-pen-line"
            class="h-3.5 w-3.5"
          />
          Save Draft
        </button>

        <button
          type="button"
          class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
          @click="handlePublish"
        >
          <UIcon
            name="i-lucide-send"
            class="h-3.5 w-3.5"
          />
          Publish
        </button>
      </div>
    </header>

    <div class="xl:hidden">
      <div class="overflow-x-auto rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-xs">
        <div class="flex min-w-max items-center gap-1">
          <button
            v-for="section in sectionLinks"
            :key="section.id"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
            :class="
              activeSection === section.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            "
            @click="scrollToSection(section.id)"
          >
            <UIcon
              :name="section.icon"
              class="h-3.5 w-3.5"
            />
            {{ section.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:items-start">
      <aside class="hidden xl:col-span-2 xl:block xl:sticky xl:top-4 xl:self-start">
        <div class="rounded-xl border border-slate-200/80 bg-white p-2 shadow-xs">
          <p class="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Form Sections
          </p>
          <nav class="space-y-1">
            <button
              v-for="section in sectionLinks"
              :key="section.id"
              type="button"
              class="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-[11px] font-semibold leading-4 transition-colors cursor-pointer"
              :class="
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              "
              @click="scrollToSection(section.id)"
            >
              <UIcon
                :name="section.icon"
                class="mt-0.5 h-3.5 w-3.5 shrink-0"
              />
              <span>{{ section.label }}</span>
            </button>
          </nav>
        </div>
      </aside>

      <div class="min-w-0 space-y-4 xl:col-span-7">
        <div
          id="project-information"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['project-information']"
            title="Project Information"
            description="Set the core identity, cover image, and discoverability of this case study."
            icon="i-lucide-briefcase"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Project Name"
              html-for="add-portfolio-project-name"
              required
            >
              <input
                id="add-portfolio-project-name"
                v-model="draft.projectName"
                type="text"
                placeholder="e.g. Digital Banking Transformation"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Project ID"
              html-for="add-portfolio-project-id"
              hint="Optional internal reference."
            >
              <input
                id="add-portfolio-project-id"
                v-model="draft.projectId"
                type="text"
                placeholder="e.g. PF-2026-014"
                class="h-9 font-mono"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Short Description"
              html-for="add-portfolio-short-description"
              full
            >
              <textarea
                id="add-portfolio-short-description"
                v-model="draft.shortDescription"
                rows="3"
                placeholder="Summarize the project, the customer challenge, and the outcome in two or three sentences."
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <div class="grid gap-3 sm:col-span-2 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
              <CmsFormField
                label="Featured Image"
                hint="Recommended 1600 x 900 px. Shown on the portfolio listing."
              >
                <div class="space-y-2">
                  <div
                    v-if="featuredImage"
                    class="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                  >
                    <img
                      :src="featuredImage.url"
                      :alt="featuredImage.name"
                      class="h-32 w-full object-cover"
                    >
                    <div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/80 to-slate-950/0 px-2.5 pb-2 pt-8">
                      <p class="min-w-0 truncate text-[10px] font-semibold text-white">
                        {{ featuredImage.name }}
                      </p>
                      <button
                        type="button"
                        class="inline-flex shrink-0 items-center gap-1 rounded-md bg-white/15 px-1.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 cursor-pointer"
                        @click="removeFeaturedImage"
                      >
                        <UIcon
                          name="i-lucide-trash-2"
                          class="h-3 w-3"
                        />
                        Remove
                      </button>
                    </div>
                  </div>

                  <CmsUploadArea
                    v-else
                    label="Upload featured image"
                    description="Drag and drop a cover image, or click to browse."
                    accept-label="PNG, JPG, or WebP up to 10 MB"
                    accept="image/png,image/jpeg,image/webp"
                    icon="i-lucide-image-plus"
                    compact
                    @files="handleFeaturedImage"
                  />
                </div>
              </CmsFormField>

              <CmsFormField
                label="Tags"
                html-for="add-portfolio-tags"
                hint="Press Enter or comma after each tag."
              >
                <div class="min-h-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <div
                    v-if="draft.tags.length"
                    class="mb-1.5 flex max-h-20 flex-wrap gap-1.5 overflow-y-auto pr-0.5"
                  >
                    <span
                      v-for="tag in draft.tags"
                      :key="tag"
                      class="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700"
                    >
                      {{ tag }}
                      <button
                        type="button"
                        class="rounded-sm text-blue-400 transition-colors hover:text-blue-700 cursor-pointer"
                        :aria-label="`Remove ${tag}`"
                        @click="removeTag(tag)"
                      >
                        <UIcon
                          name="i-lucide-x"
                          class="h-3 w-3"
                        />
                      </button>
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <input
                      id="add-portfolio-tags"
                      v-model="newTag"
                      type="text"
                      placeholder="Add a tag and press Enter"
                      class="h-7 min-w-0 flex-1 border-0 bg-transparent px-1 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none"
                      @keydown="handleTagKeydown"
                    >
                    <button
                      type="button"
                      class="rounded-md px-1.5 py-1 text-[10px] font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300 cursor-pointer"
                      :disabled="!newTag.trim()"
                      @click="addTag"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </CmsFormField>
            </div>
          </CmsFormSection>
        </div>

        <div
          id="customer-information"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['customer-information']"
            title="Customer Information"
            description="Capture the customer profile and organization context."
            icon="i-lucide-building-2"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Customer Name"
              html-for="add-portfolio-customer-name"
              full
              required
            >
              <input
                id="add-portfolio-customer-name"
                v-model="draft.customerName"
                type="text"
                placeholder="e.g. ABC Bank"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Company Size"
              html-for="add-portfolio-company-size"
            >
              <select
                id="add-portfolio-company-size"
                v-model="draft.companySize"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select company size
                </option>
                <option
                  v-for="option in companySizeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Industry"
              html-for="add-portfolio-industry"
            >
              <select
                id="add-portfolio-industry"
                v-model="draft.industry"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select industry
                </option>
                <option
                  v-for="option in portfolioIndustryOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Legal Structure"
              html-for="add-portfolio-legal-structure"
            >
              <select
                id="add-portfolio-legal-structure"
                v-model="draft.legalStructure"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select legal structure
                </option>
                <option
                  v-for="option in legalStructureOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Customer Type"
              html-for="add-portfolio-customer-type"
            >
              <select
                id="add-portfolio-customer-type"
                v-model="draft.customerType"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select customer type
                </option>
                <option
                  v-for="option in customerTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>
          </CmsFormSection>
        </div>

        <div
          id="project-details"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['project-details']"
            title="Project Details"
            description="Define the delivery window, owning team, and current project state."
            icon="i-lucide-calendar-range"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Project Timeline"
              full
              hint="Choose the project start and end dates."
            >
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label
                    for="add-portfolio-timeline-start"
                    class="mb-1 block text-[10px] font-semibold text-slate-500"
                  >
                    Start Date
                  </label>
                  <input
                    id="add-portfolio-timeline-start"
                    v-model="draft.timelineStart"
                    type="date"
                    class="h-9"
                    :class="[cmsControlClass, cmsControlStateClass(false)]"
                  >
                </div>
                <div>
                  <label
                    for="add-portfolio-timeline-end"
                    class="mb-1 block text-[10px] font-semibold text-slate-500"
                  >
                    End Date
                  </label>
                  <input
                    id="add-portfolio-timeline-end"
                    v-model="draft.timelineEnd"
                    type="date"
                    class="h-9"
                    :class="[cmsControlClass, cmsControlStateClass(false)]"
                  >
                </div>
              </div>
            </CmsFormField>

            <CmsFormField
              label="Business Unit"
              html-for="add-portfolio-business-unit"
            >
              <select
                id="add-portfolio-business-unit"
                v-model="draft.businessUnit"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select business unit
                </option>
                <option
                  v-for="option in businessUnitOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Project Status"
              html-for="add-portfolio-project-status"
            >
              <select
                id="add-portfolio-project-status"
                v-model="draft.projectStatus"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select project status
                </option>
                <option
                  v-for="option in portfolioProjectStatusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Product"
              html-for="add-portfolio-product"
            >
              <select
                id="add-portfolio-product"
                v-model="draft.product"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select product
                </option>
                <option
                  v-for="option in portfolioProductOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Product Package"
              html-for="add-portfolio-product-package"
            >
              <select
                id="add-portfolio-product-package"
                v-model="draft.productPackage"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
                :disabled="!draft.product"
              >
                <option
                  value=""
                  disabled
                >
                  {{ draft.product ? 'Select product package' : 'Select product first' }}
                </option>
                <option
                  v-for="option in productPackageOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Product Status"
              html-for="add-portfolio-product-status"
            >
              <select
                id="add-portfolio-product-status"
                v-model="draft.productStatus"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select product status
                </option>
                <option
                  v-for="option in portfolioProductStatusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>
          </CmsFormSection>
        </div>

        <div
          id="financial-information"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['financial-information']"
            title="Financial Information"
            description="Document commercial value and the financial shape of the engagement."
            icon="i-lucide-wallet"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Project Value"
              html-for="add-portfolio-project-value"
              hint="Amount in IDR."
            >
              <input
                id="add-portfolio-project-value"
                v-model="draft.projectValue"
                type="text"
                inputmode="numeric"
                placeholder="e.g. 4500000000"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Revenue"
              html-for="add-portfolio-revenue"
              hint="Revenue recognized from this project."
            >
              <input
                id="add-portfolio-revenue"
                v-model="draft.revenue"
                type="text"
                inputmode="numeric"
                placeholder="e.g. 5200000000"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Cost"
              html-for="add-portfolio-cost"
              hint="Total delivery and operational cost."
            >
              <input
                id="add-portfolio-cost"
                v-model="draft.cost"
                type="text"
                inputmode="numeric"
                placeholder="e.g. 3100000000"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Profit"
              html-for="add-portfolio-profit"
              hint="Gross profit contribution."
            >
              <input
                id="add-portfolio-profit"
                v-model="draft.profit"
                type="text"
                inputmode="numeric"
                placeholder="e.g. 2100000000"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>
          </CmsFormSection>
        </div>

        <div
          id="project-content"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['project-content']"
            title="Project Content"
            description="Tell the story from business context through measurable outcomes."
            icon="i-lucide-file-text"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Overview"
              html-for="add-portfolio-overview"
              full
            >
              <CmsRichTextEditor
                id="add-portfolio-overview"
                v-model="draft.overview"
                placeholder="Describe the project, scope, delivery approach, and outcome."
              />
            </CmsFormField>

            <CmsFormField
              label="Background"
              html-for="add-portfolio-background"
              full
            >
              <textarea
                id="add-portfolio-background"
                v-model="draft.background"
                rows="4"
                placeholder="Explain the customer context, business need, and why this project was initiated."
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField
              label="Challenges"
              html-for="add-portfolio-challenges"
              hint="One challenge per line."
            >
              <textarea
                id="add-portfolio-challenges"
                v-model="draft.challenges"
                rows="5"
                placeholder="Legacy system with limited scalability"
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField
              label="Solution"
              html-for="add-portfolio-solution"
              hint="One solution per line."
            >
              <textarea
                id="add-portfolio-solution"
                v-model="draft.solution"
                rows="5"
                placeholder="Modern web and mobile banking platform"
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField
              label="Success Metrics"
              html-for="add-portfolio-success-metrics"
              full
              hint="One metric per line, including the baseline and result where possible."
            >
              <textarea
                id="add-portfolio-success-metrics"
                v-model="draft.successMetrics"
                rows="4"
                placeholder="35% faster transaction processing&#10;99.95% platform availability"
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>
          </CmsFormSection>
        </div>

        <div
          id="media-documents"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['media-documents']"
            title="Media & Documents"
            description="Add visual proof and downloadable materials for the case study."
            icon="i-lucide-image"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Image Gallery"
              full
              hint="Add supporting screenshots, product photos, or delivery documentation."
            >
              <div class="space-y-2">
                <CmsUploadArea
                  label="Upload gallery images"
                  description="Drag and drop multiple images, or click to browse."
                  accept-label="PNG, JPG, or WebP up to 10 MB each"
                  accept="image/png,image/jpeg,image/webp"
                  icon="i-lucide-images"
                  multiple
                  @files="handleGalleryImages"
                />

                <div
                  v-if="galleryImages.length"
                  class="grid grid-cols-2 gap-2 sm:grid-cols-4"
                >
                  <div
                    v-for="(image, index) in galleryImages"
                    :key="`${image.url}-${index}`"
                    class="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                  >
                    <img
                      :src="image.url"
                      :alt="image.name"
                      class="h-full w-full object-cover"
                    >
                    <button
                      type="button"
                      class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-slate-950/65 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-rose-600 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      :aria-label="`Remove ${image.name}`"
                      @click="removeGalleryImage(index)"
                    >
                      <UIcon
                        name="i-lucide-x"
                        class="h-3 w-3"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </CmsFormField>

            <CmsFormField
              label="Video"
              html-for="add-portfolio-video"
              full
              hint="Paste a YouTube, Vimeo, or hosted video URL."
            >
              <input
                id="add-portfolio-video"
                v-model="draft.videoUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Case Study PDF"
              full
              hint="Upload the final PDF version of the case study."
            >
              <div class="space-y-2">
                <div
                  v-if="caseStudyDocument"
                  class="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <UIcon
                      name="i-lucide-file-text"
                      class="h-4 w-4"
                    />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[11px] font-semibold text-slate-700">
                      {{ caseStudyDocument.name }}
                    </p>
                    <p class="text-[10px] text-slate-400">
                      {{ caseStudyDocument.size }} · PDF
                    </p>
                  </div>
                  <button
                    type="button"
                    class="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
                    aria-label="Remove case study PDF"
                    @click="caseStudyDocument = null"
                  >
                    <UIcon
                      name="i-lucide-x"
                      class="h-3.5 w-3.5"
                    />
                  </button>
                </div>

                <CmsUploadArea
                  v-else
                  label="Upload case study PDF"
                  description="Drag and drop the PDF, or click to browse."
                  accept-label="PDF up to 20 MB"
                  accept="application/pdf,.pdf"
                  icon="i-lucide-file-up"
                  @files="handleCaseStudy"
                />
              </div>
            </CmsFormField>

            <CmsFormField
              label="Supporting Documents"
              full
              hint="Attach proposals, architecture documents, or other supporting files."
            >
              <div class="space-y-2">
                <CmsUploadArea
                  label="Upload supporting documents"
                  description="Drag and drop files, or click to browse."
                  accept-label="PDF, DOCX, XLSX, or ZIP up to 20 MB each"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                  icon="i-lucide-files"
                  multiple
                  @files="handleSupportingDocuments"
                />

                <div
                  v-if="supportingDocuments.length"
                  class="space-y-1.5"
                >
                  <div
                    v-for="(document, index) in supportingDocuments"
                    :key="`${document.name}-${index}`"
                    class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5"
                  >
                    <UIcon
                      name="i-lucide-paperclip"
                      class="h-3.5 w-3.5 shrink-0 text-slate-400"
                    />
                    <p class="min-w-0 flex-1 truncate text-[10px] font-medium text-slate-600">
                      {{ document.name }}
                    </p>
                    <span class="shrink-0 text-[10px] text-slate-400">{{ document.size }}</span>
                    <button
                      type="button"
                      class="rounded-sm p-0.5 text-slate-400 transition-colors hover:text-rose-600 cursor-pointer"
                      :aria-label="`Remove ${document.name}`"
                      @click="removeSupportingDocument(index)"
                    >
                      <UIcon
                        name="i-lucide-x"
                        class="h-3 w-3"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </CmsFormField>
          </CmsFormSection>
        </div>

        <div
          id="technology"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['technology']"
            title="Technology"
            description="Show the delivery stack used in the project."
            icon="i-lucide-cpu"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Technology Stack"
              full
            >
              <CmsOptionChips
                v-model="draft.technologies"
                :options="cmsTechnologyOptions"
                empty-label="Select the technologies used in this project."
              />
            </CmsFormField>

            <CmsFormField
              label="Frontend Stack"
              html-for="add-portfolio-frontend-stack"
            >
              <select
                id="add-portfolio-frontend-stack"
                v-model="draft.frontendStack"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select frontend stack
                </option>
                <option
                  v-for="option in portfolioFrontendStackOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Backend Stack"
              html-for="add-portfolio-backend-stack"
            >
              <select
                id="add-portfolio-backend-stack"
                v-model="draft.backendStack"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select backend stack
                </option>
                <option
                  v-for="option in portfolioBackendStackOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Database"
              html-for="add-portfolio-database"
            >
              <select
                id="add-portfolio-database"
                v-model="draft.database"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select database
                </option>
                <option
                  v-for="option in portfolioDatabaseOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>
          </CmsFormSection>
        </div>

        <div
          id="partners"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['partners']"
            title="Partners"
            description="List the partners involved in the project."
            icon="i-lucide-handshake"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Related Partners"
              full
            >
              <CmsOptionChips
                v-model="draft.partners"
                :options="cmsRelatedPartnerFilterOptions"
                empty-label="Select the partners involved in delivery."
              />
            </CmsFormField>
          </CmsFormSection>
        </div>
      </div>

      <aside class="min-w-0 space-y-4 xl:col-span-3 xl:sticky xl:top-4 xl:self-start">
        <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div class="mb-3 flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <UIcon
                name="i-lucide-settings-2"
                class="h-3.5 w-3.5"
              />
            </div>
            <div>
              <h2 class="text-xs font-bold tracking-tight text-slate-900">
                Publish Settings
              </h2>
              <p class="mt-0.5 text-[10px] text-slate-400">
                Control when this content goes live.
              </p>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <label
                for="add-portfolio-publish-status"
                class="mb-1.5 block text-[11px] font-semibold text-slate-700"
              >
                Publication Status
              </label>
              <select
                id="add-portfolio-publish-status"
                v-model="draft.publishStatus"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  v-for="status in publishStatusOptions"
                  :key="status"
                  :value="status"
                >
                  {{ status }}
                </option>
              </select>
            </div>

            <div>
              <label
                for="add-portfolio-visibility"
                class="mb-1.5 block text-[11px] font-semibold text-slate-700"
              >
                Visibility
              </label>
              <select
                id="add-portfolio-visibility"
                v-model="draft.visibility"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="Internal">
                  Internal
                </option>
              </select>
            </div>

            <div class="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                  :class="publishStatus.chip"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="publishStatus.dot"
                  />
                  {{ draft.publishStatus }}
                </span>
              </div>
              <p class="mt-1.5 text-[10px] leading-4 text-slate-500">
                {{ publishStatus.hint }}
              </p>
            </div>

            <div>
              <label
                for="add-portfolio-publish-date"
                class="mb-1.5 block text-[11px] font-semibold text-slate-700"
              >
                Publish Date
              </label>
              <input
                id="add-portfolio-publish-date"
                v-model="draft.publishDate"
                type="datetime-local"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
              <p class="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                <UIcon
                  name="i-lucide-clock-3"
                  class="h-3 w-3"
                />
                Asia/Jakarta (GMT+7)
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div class="mb-3 flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div class="flex items-center gap-2.5">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <UIcon
                  name="i-lucide-list-checks"
                  class="h-3.5 w-3.5"
                />
              </div>
              <div>
                <h2 class="text-xs font-bold tracking-tight text-slate-900">
                  Content Checklist
                </h2>
                <p class="mt-0.5 text-[10px] text-slate-400">
                  Required before publishing.
                </p>
              </div>
            </div>
            <span class="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
              {{ completedChecklistCount }}/{{ checklist.length }}
            </span>
          </div>

          <div class="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-emerald-500 transition-all duration-300"
              :style="{ width: `${checklistProgress}%` }"
            />
          </div>

          <ul class="space-y-2">
            <li
              v-for="item in checklist"
              :key="item.label"
              class="flex items-start gap-2"
            >
              <span
                class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                :class="item.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'"
              >
                <UIcon
                  :name="item.done ? 'i-lucide-check' : 'i-lucide-circle'"
                  class="h-2.5 w-2.5"
                />
              </span>
              <span
                class="text-[10px] leading-4"
                :class="item.done ? 'font-medium text-slate-700' : 'text-slate-400'"
              >
                {{ item.label }}
              </span>
            </li>
          </ul>
        </section>

        <section class="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <div class="mb-2.5 flex items-center gap-2.5">
            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-xs">
              <UIcon
                name="i-lucide-lightbulb"
                class="h-3.5 w-3.5"
              />
            </div>
            <h2 class="text-xs font-bold tracking-tight text-slate-900">
              Tips
            </h2>
          </div>

          <ul class="space-y-2">
            <li
              v-for="tip in tips"
              :key="tip"
              class="flex items-start gap-2 text-[10px] leading-4 text-slate-600"
            >
              <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
              <span>{{ tip }}</span>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>
