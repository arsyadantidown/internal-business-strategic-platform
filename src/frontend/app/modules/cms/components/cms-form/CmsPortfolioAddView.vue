<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { scrollCmsSectionIntoView } from '../../utils/cmsScroll'
import { cmsControlClass, cmsControlStateClass } from '../../utils/cmsForm'
import { useCmsPortfolioAdd } from '../../composables/useCmsPortfolioAdd'
import CmsFormField from './CmsFormField.vue'
import CmsFormSection from './CmsFormSection.vue'
import CmsRichTextEditor from './CmsRichTextEditor.vue'
import CmsUploadArea from './CmsUploadArea.vue'

const emit = defineEmits<{
  (e: 'back'): void
}>()

const {
  form,
  isLoadingOptions,
  isSubmitting,
  submitProgressText,
  estimatedProfit,
  businessUnitOptions,
  projectStatusOptions,
  industryOptions,
  companySizeOptions,
  customerTypeOptions,
  legalStructureOptions,
  productOptions,
  techStackOptions,
  partnerOptions,
  addSuccessMetric,
  removeSuccessMetric,
  addPartner,
  removePartner,
  featuredCover,
  galleryFiles,
  caseStudyFile,
  supportingDocuments,
  submitProject
} = useCmsPortfolioAdd()

// 7 Section Navigasi
const sectionLinks = [
  { id: 'project-information', label: 'Project Information', icon: 'i-lucide-briefcase' },
  { id: 'customer-information', label: 'Customer Information', icon: 'i-lucide-building-2' },
  { id: 'contract-governance', label: 'Contract & Governance', icon: 'i-lucide-scroll' },
  { id: 'financial-information', label: 'Financial Information', icon: 'i-lucide-wallet' },
  { id: 'project-content', label: 'Project Content', icon: 'i-lucide-file-text' },
  { id: 'products-tech-partners', label: 'Tech & Partners', icon: 'i-lucide-cpu' },
  { id: 'media-documents', label: 'Media & Documents', icon: 'i-lucide-image' }
]

const activeSection = ref('project-information')
const openSections = reactive<Record<string, boolean>>({
  'project-information': true,
  'customer-information': true,
  'contract-governance': true,
  'financial-information': true,
  'project-content': true,
  'products-tech-partners': true,
  'media-documents': true
})

const scrollToSection = (id: string) => {
  activeSection.value = id
  openSections[id] = true
  scrollCmsSectionIntoView(id)
}

// File Upload Handlers (Local)
const handleCoverImage = (files: File[]) => {
  if (!files.length) return
  const file = files[0]
  if (featuredCover.value?.previewUrl) {
    URL.revokeObjectURL(featuredCover.value.previewUrl)
  }
  featuredCover.value = {
    file,
    category: 'image',
    title: 'Featured Cover',
    previewUrl: URL.createObjectURL(file)
  }
}

const removeCoverImage = () => {
  if (featuredCover.value?.previewUrl) {
    URL.revokeObjectURL(featuredCover.value.previewUrl)
  }
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
  if (item?.previewUrl) {
    URL.revokeObjectURL(item.previewUrl)
  }
  galleryFiles.value.splice(index, 1)
}

const handleCaseStudy = (files: File[]) => {
  if (!files.length) return
  const file = files[0]
  caseStudyFile.value = {
    file,
    category: 'case_study',
    title: file.name
  }
}

const handleSupportingDocuments = (files: File[]) => {
  files.forEach((file) => {
    supportingDocuments.value.push({
      file,
      category: 'document',
      title: file.name
    })
  })
}

const removeSupportingDocument = (index: number) => {
  supportingDocuments.value.splice(index, 1)
}

// Multi-select helper untuk chips/checkboxes (Product & Tech Stack IDs)
const toggleProduct = (id: string) => {
  const idx = form.product_ids.indexOf(id)
  if (idx === -1) form.product_ids.push(id)
  else form.product_ids.splice(idx, 1)
}

const toggleTechStack = (id: string) => {
  const idx = form.tech_stack_ids.indexOf(id)
  if (idx === -1) form.tech_stack_ids.push(id)
  else form.tech_stack_ids.splice(idx, 1)
}

const handlePublish = () => {
  submitProject(() => {
    emit('back')
  })
}

onMounted(() => {
  document.querySelector('main')?.scrollTo({ top: 0 })
})

onBeforeUnmount(() => {
  if (featuredCover.value?.previewUrl) URL.revokeObjectURL(featuredCover.value.previewUrl)
  galleryFiles.value.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl))
})
</script>

<template>
  <div class="flex flex-col gap-5 pb-10 font-sans">
    <!-- Header -->
    <header
      class="flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-start lg:justify-between"
    >
      <div class="min-w-0">
        <nav
          class="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-400"
        >
          <span>Content Management</span>
          <UIcon name="i-lucide-chevron-right" class="h-3 w-3 shrink-0" />
          <button
            type="button"
            class="rounded-sm transition-colors hover:text-slate-700 cursor-pointer"
            @click="emit('back')"
          >
            Portfolio Content
          </button>
          <UIcon name="i-lucide-chevron-right" class="h-3 w-3 shrink-0" />
          <span class="font-semibold text-slate-700">Add Portfolio</span>
        </nav>

        <h1 class="text-2xl font-bold leading-8 tracking-tight text-slate-900">
          Add Portfolio Content
        </h1>
        <p class="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
          Create a new project portfolio, configure governance, metrics, and supporting assets.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
        <button
          type="button"
          class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
          @click="emit('back')"
        >
          Cancel
        </button>

        <button
          type="button"
          :disabled="isSubmitting || isLoadingOptions"
          class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handlePublish"
        >
          <UIcon
            :name="isSubmitting ? 'i-lucide-loader-2' : 'i-lucide-send'"
            class="h-4 w-4"
            :class="{ 'animate-spin': isSubmitting }"
          />
          <span>{{
            isSubmitting ? submitProgressText || 'Publishing...' : 'Publish Project'
          }}</span>
        </button>
      </div>
    </header>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:items-start">
      <!-- Left Sticky Section Navigator -->
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
              <UIcon :name="section.icon" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{{ section.label }}</span>
            </button>
          </nav>
        </div>
      </aside>

      <!-- Center Form Fields (7 Sections) -->
      <div class="min-w-0 space-y-4 xl:col-span-7">
        <!-- 1. PROJECT INFORMATION -->
        <div id="project-information" class="scroll-mt-4">
          <CmsFormSection
            v-model:open="openSections['project-information']"
            title="Project Information"
            description="Core identity, project code, status, and division unit."
            icon="i-lucide-briefcase"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Project Code"
              html-for="field-project-code"
              required
              hint="Unique identifier"
            >
              <input
                id="field-project-code"
                v-model="form.project_code"
                type="text"
                required
                placeholder="e.g. PRJ-2026-001"
                class="h-9 font-mono"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Project Name" html-for="field-project-name" required>
              <input
                id="field-project-name"
                v-model="form.project_name"
                type="text"
                required
                placeholder="e.g. Digital Banking Transformation"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Opportunity" html-for="field-opportunity">
              <input
                id="field-opportunity"
                v-model="form.opportunity"
                type="text"
                placeholder="e.g. Core Banking Modernization RFP"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Year" html-for="field-year" required>
              <input
                id="field-year"
                v-model.number="form.year"
                type="number"
                min="1900"
                max="2200"
                required
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Business Unit" html-for="field-bu" required>
              <select
                id="field-bu"
                v-model="form.business_unit_id"
                required
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="" disabled>Select business unit</option>
                <option v-for="opt in businessUnitOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField label="Project Status" html-for="field-status" required>
              <select
                id="field-status"
                v-model="form.project_status_id"
                required
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="" disabled>Select project status</option>
                <option v-for="opt in projectStatusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>
          </CmsFormSection>
        </div>

        <!-- 2. CUSTOMER INFORMATION -->
        <div id="customer-information" class="scroll-mt-4">
          <CmsFormSection
            v-model:open="openSections['customer-information']"
            title="Customer Information"
            description="Client organization details, sector, and background."
            icon="i-lucide-building-2"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField label="Customer Name" html-for="field-cust-name" required full>
              <input
                id="field-cust-name"
                v-model="form.customer.customer_name"
                type="text"
                required
                placeholder="e.g. Bank Mandiri"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Location" html-for="field-cust-loc">
              <input
                id="field-cust-loc"
                v-model="form.customer.customer_location"
                type="text"
                placeholder="e.g. Jakarta, Indonesia"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField
              label="Annual Revenue"
              html-for="field-cust-rev"
              hint="e.g. 115T (FY 2025)"
            >
              <input
                id="field-cust-rev"
                v-model="form.customer.annual_revenue"
                type="text"
                placeholder="e.g. 115T"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Industry" html-for="field-cust-ind">
              <select
                id="field-cust-ind"
                v-model="form.customer.industry_id"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="">Select industry</option>
                <option v-for="opt in industryOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField label="Company Size" html-for="field-cust-size">
              <select
                id="field-cust-size"
                v-model="form.customer.company_size_id"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="">Select company size</option>
                <option v-for="opt in companySizeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField label="Customer Type" html-for="field-cust-type">
              <select
                id="field-cust-type"
                v-model="form.customer.customer_type_id"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="">Select customer type</option>
                <option v-for="opt in customerTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField label="Legal Structure" html-for="field-cust-legal">
              <select
                id="field-cust-legal"
                v-model="form.customer.legal_structure_id"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="">Select legal structure</option>
                <option v-for="opt in legalStructureOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </CmsFormField>
          </CmsFormSection>
        </div>

        <!-- 3. CONTRACT & GOVERNANCE -->
        <div id="contract-governance" class="scroll-mt-4">
          <CmsFormSection
            v-model:open="openSections['contract-governance']"
            title="Contract & Governance"
            description="Timeline dates, contract identifiers, and lead managers."
            icon="i-lucide-scroll"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField label="Contract Name" html-for="field-contract-name">
              <input
                id="field-contract-name"
                v-model="form.contract_name"
                type="text"
                placeholder="e.g. Master Services Agreement 2026"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Contract Number" html-for="field-contract-num">
              <input
                id="field-contract-num"
                v-model="form.contract_number"
                type="text"
                placeholder="e.g. CTR/2026/089"
                class="h-9 font-mono"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Start Date" html-for="field-start-date" required>
              <input
                id="field-start-date"
                v-model="form.start_date"
                type="date"
                required
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="End Date" html-for="field-end-date" required>
              <input
                id="field-end-date"
                v-model="form.end_date"
                type="date"
                required
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Project Manager" html-for="field-pm">
              <input
                id="field-pm"
                v-model="form.project_manager"
                type="text"
                placeholder="e.g. John Doe, PMP"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Account Manager" html-for="field-am">
              <input
                id="field-am"
                v-model="form.account_manager"
                type="text"
                placeholder="e.g. Jane Smith"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>
          </CmsFormSection>
        </div>

        <!-- 4. FINANCIAL INFORMATION -->
        <div id="financial-information" class="scroll-mt-4">
          <CmsFormSection
            v-model:open="openSections['financial-information']"
            title="Financial Information"
            description="Contract values, carry-over, costs, and profit estimation."
            icon="i-lucide-wallet"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Value Before Tax (Revenue)"
              html-for="field-val-before-tax"
              required
              hint="Amount in IDR"
            >
              <input
                id="field-val-before-tax"
                v-model.number="form.value_before_tax"
                type="number"
                min="0"
                required
                placeholder="e.g. 5000000000"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Carry Over Value" html-for="field-carry-over" hint="Optional IDR">
              <input
                id="field-carry-over"
                v-model.number="form.carry_over_value"
                type="number"
                min="0"
                placeholder="e.g. 1500000000"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="COGS" html-for="field-cogs" hint="Cost of Goods Sold">
              <input
                id="field-cogs"
                v-model.number="form.financial.cogs"
                type="number"
                min="0"
                placeholder="e.g. 2500000000"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Operational Cost" html-for="field-opex" hint="Operating expenses">
              <input
                id="field-opex"
                v-model.number="form.financial.operational_cost"
                type="number"
                min="0"
                placeholder="e.g. 500000000"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <!-- Estimated Profit Card -->
            <div
              class="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 sm:col-span-2 flex items-center justify-between"
            >
              <div>
                <p class="text-[11px] font-semibold text-blue-800">Estimated Gross Profit</p>
                <p class="text-[10px] text-blue-600">
                  Calculated automatically as (Value Before Tax - Total Cost)
                </p>
              </div>
              <span class="text-sm font-bold text-blue-900 font-mono">
                Rp {{ estimatedProfit.toLocaleString('id-ID') }}
              </span>
            </div>
          </CmsFormSection>
        </div>

        <!-- 5. PROJECT CONTENT & CASE STUDY -->
        <div id="project-content" class="scroll-mt-4">
          <CmsFormSection
            v-model:open="openSections['project-content']"
            title="Project Content & Case Study"
            description="Detailed narrative, objective, challenges, solution, and metrics."
            icon="i-lucide-file-text"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField label="Project Objective" html-for="field-obj" full>
              <textarea
                id="field-obj"
                v-model="form.project_objective"
                rows="3"
                placeholder="What did this project aim to achieve?"
                class="py-2"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Project Description" html-for="field-desc" full>
              <CmsRichTextEditor
                id="field-desc"
                v-model="form.project_description"
                placeholder="Comprehensive overview of the solution and deployment..."
              />
            </CmsFormField>

            <CmsFormField label="Background" html-for="field-bg" full>
              <textarea
                id="field-bg"
                v-model="form.project_background"
                rows="3"
                placeholder="Context, problem statement, and driver for the engagement..."
                class="py-2"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Challenges" html-for="field-chal" full>
              <textarea
                id="field-chal"
                v-model="form.project_challenges"
                rows="3"
                placeholder="Technical or operational bottlenecks faced..."
                class="py-2"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField label="Solution" html-for="field-sol" full>
              <textarea
                id="field-sol"
                v-model="form.project_solution"
                rows="3"
                placeholder="How the team designed and implemented the resolution..."
                class="py-2"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <!-- Success Metrics Repeater -->
            <div class="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-slate-800">Success Metrics</h4>
                  <p class="text-[10px] text-slate-400">
                    Measurable impact (e.g. "35%", "Faster Processing")
                  </p>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  @click="addSuccessMetric"
                >
                  <UIcon name="i-lucide-plus" class="h-3.5 w-3.5" />
                  <span>Add Metric</span>
                </button>
              </div>

              <div
                v-if="!form.success_metrics.length"
                class="text-center py-4 border border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400"
              >
                No success metrics added yet.
              </div>

              <div
                v-for="(metric, idx) in form.success_metrics"
                :key="idx"
                class="flex items-center gap-2"
              >
                <input
                  v-model="metric.success_metric_value"
                  type="text"
                  placeholder="Value (e.g. 99.9%)"
                  class="h-9 w-1/3 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 placeholder-slate-400"
                />
                <input
                  v-model="metric.success_metric_label"
                  type="text"
                  placeholder="Label (e.g. Uptime Guaranteed)"
                  class="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 placeholder-slate-400"
                />
                <button
                  type="button"
                  class="p-2 text-slate-400 hover:text-rose-600 cursor-pointer"
                  @click="removeSuccessMetric(idx)"
                >
                  <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </CmsFormSection>
        </div>

        <!-- 6. PRODUCTS, TECH & PARTNERS -->
        <div id="products-tech-partners" class="scroll-mt-4">
          <CmsFormSection
            v-model:open="openSections['products-tech-partners']"
            title="Products, Technologies & Partners"
            description="Associate company products, technology stacks, and collaborating vendors."
            icon="i-lucide-cpu"
            class="shadow-xs"
            collapsible
          >
            <!-- Products Selection -->
            <CmsFormField
              label="Associated Products"
              full
              hint="Click to select products delivered in this project"
            >
              <div
                class="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50/50 min-h-12"
              >
                <button
                  v-for="prod in productOptions"
                  :key="prod.value"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer"
                  :class="
                    form.product_ids.includes(prod.value)
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  "
                  @click="toggleProduct(prod.value)"
                >
                  <span>{{ prod.label }}</span>
                  <UIcon
                    :name="
                      form.product_ids.includes(prod.value) ? 'i-lucide-check' : 'i-lucide-plus'
                    "
                    class="h-3 w-3"
                  />
                </button>
                <span v-if="!productOptions.length" class="text-xs text-slate-400 p-1"
                  >No products found.</span
                >
              </div>
            </CmsFormField>

            <!-- Tech Stacks Selection -->
            <CmsFormField label="Tech Stacks" full hint="Frameworks, languages, and platforms used">
              <div
                class="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50/50 min-h-12"
              >
                <button
                  v-for="tech in techStackOptions"
                  :key="tech.value"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer"
                  :class="
                    form.tech_stack_ids.includes(tech.value)
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  "
                  @click="toggleTechStack(tech.value)"
                >
                  <span>{{ tech.label }}</span>
                  <UIcon
                    :name="
                      form.tech_stack_ids.includes(tech.value) ? 'i-lucide-check' : 'i-lucide-plus'
                    "
                    class="h-3 w-3"
                  />
                </button>
                <span v-if="!techStackOptions.length" class="text-xs text-slate-400 p-1"
                  >No tech stacks found.</span
                >
              </div>
            </CmsFormField>

            <!-- Partners Repeater -->
            <div class="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-slate-800">Involved Partners</h4>
                  <p class="text-[10px] text-slate-400">Collaborating principals or vendors</p>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  @click="addPartner"
                >
                  <UIcon name="i-lucide-plus" class="h-3.5 w-3.5" />
                  <span>Add Partner</span>
                </button>
              </div>

              <div
                v-if="!form.partners.length"
                class="text-center py-4 border border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400"
              >
                No partners added.
              </div>

              <div
                v-for="(part, idx) in form.partners"
                :key="idx"
                class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50 border border-slate-200"
              >
                <!-- Partner Select -->
                <div class="sm:col-span-5">
                  <select
                    v-model="part.partner_id"
                    class="h-8.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800"
                  >
                    <option value="" disabled>Select partner</option>
                    <option v-for="opt in partnerOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>

                <!-- Role Select -->
                <div class="sm:col-span-3">
                  <select
                    v-model="part.partner_role"
                    class="h-8.5 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-800"
                  >
                    <option value="principal">Principal</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>

                <!-- Contribution -->
                <div class="sm:col-span-3">
                  <input
                    v-model="part.partner_contribution"
                    type="text"
                    placeholder="Contribution..."
                    class="h-8.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800"
                  />
                </div>

                <!-- Delete -->
                <div class="sm:col-span-1 text-right">
                  <button
                    type="button"
                    class="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    @click="removePartner(idx)"
                  >
                    <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </CmsFormSection>
        </div>

        <!-- 7. MEDIA & DOCUMENTS -->
        <div id="media-documents" class="scroll-mt-4">
          <CmsFormSection
            v-model:open="openSections['media-documents']"
            title="Media & Documents"
            description="Featured cover, gallery images, case study PDF, and supporting docs."
            icon="i-lucide-image"
            class="shadow-xs"
            collapsible
          >
            <!-- Cover Image -->
            <CmsFormField
              label="Featured Cover Image"
              full
              hint="Main thumbnail shown on project listings"
            >
              <div
                v-if="featuredCover"
                class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
              >
                <img :src="featuredCover.previewUrl" alt="Cover" class="h-40 w-full object-cover" />
                <button
                  type="button"
                  class="absolute top-2 right-2 rounded-md bg-slate-900/70 p-1 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  @click="removeCoverImage"
                >
                  <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                </button>
              </div>
              <CmsUploadArea
                v-else
                label="Upload cover image"
                description="PNG, JPG, or WebP"
                accept="image/png,image/jpeg,image/webp"
                icon="i-lucide-image-plus"
                compact
                @files="handleCoverImage"
              />
            </CmsFormField>

            <!-- Gallery Images -->
            <CmsFormField
              label="Image Gallery"
              full
              hint="Supporting screenshots and delivery documentation"
            >
              <div class="space-y-2">
                <CmsUploadArea
                  label="Upload gallery images"
                  description="Multiple PNG, JPG, WebP"
                  accept="image/png,image/jpeg,image/webp"
                  icon="i-lucide-images"
                  multiple
                  @files="handleGalleryImages"
                />

                <div v-if="galleryFiles.length" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div
                    v-for="(img, idx) in galleryFiles"
                    :key="idx"
                    class="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group"
                  >
                    <img
                      :src="img.previewUrl"
                      :alt="img.title"
                      class="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      class="absolute top-1 right-1 rounded bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 cursor-pointer"
                      @click="removeGalleryImage(idx)"
                    >
                      <UIcon name="i-lucide-x" class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </CmsFormField>

            <!-- Case Study PDF -->
            <CmsFormField label="Case Study PDF" full hint="Official case study PDF">
              <div
                v-if="caseStudyFile"
                class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-file-text" class="h-5 w-5 text-rose-500" />
                  <span class="text-xs font-semibold text-slate-800">{{
                    caseStudyFile.file.name
                  }}</span>
                </div>
                <button
                  type="button"
                  class="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  @click="caseStudyFile = null"
                >
                  <UIcon name="i-lucide-x" class="h-4 w-4" />
                </button>
              </div>
              <CmsUploadArea
                v-else
                label="Upload case study PDF"
                description="PDF file up to 20MB"
                accept="application/pdf,.pdf"
                icon="i-lucide-file-up"
                @files="handleCaseStudy"
              />
            </CmsFormField>

            <!-- Supporting Documents -->
            <CmsFormField
              label="Supporting Documents"
              full
              hint="Proposals, architectures, spreadsheets"
            >
              <div class="space-y-2">
                <CmsUploadArea
                  label="Upload documents"
                  description="PDF, DOCX, XLSX, ZIP"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                  icon="i-lucide-paperclip"
                  multiple
                  @files="handleSupportingDocuments"
                />

                <div v-if="supportingDocuments.length" class="space-y-1">
                  <div
                    v-for="(doc, idx) in supportingDocuments"
                    :key="idx"
                    class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                  >
                    <span class="truncate">{{ doc.file.name }}</span>
                    <button
                      type="button"
                      class="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                      @click="removeSupportingDocument(idx)"
                    >
                      <UIcon name="i-lucide-x" class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </CmsFormField>
          </CmsFormSection>
        </div>
      </div>

      <!-- Right Aside (Publish Settings & Status) -->
      <aside class="min-w-0 space-y-4 xl:col-span-3 xl:sticky xl:top-4 xl:self-start">
        <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <UIcon name="i-lucide-settings-2" class="h-4 w-4 text-blue-600" />
            <h3 class="text-xs font-bold text-slate-900">Project Visibility</h3>
          </div>

          <!-- Featured Switch -->
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              v-model="form.is_featured"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5"
            />
            <div>
              <span class="text-xs font-semibold text-slate-800">Featured Portfolio</span>
              <p class="text-[10px] text-slate-400">
                Showcase this project on top cards & executive summary.
              </p>
            </div>
          </label>

          <div class="pt-3 border-t border-slate-100">
            <button
              type="button"
              :disabled="isSubmitting || isLoadingOptions"
              class="w-full inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handlePublish"
            >
              <UIcon
                :name="isSubmitting ? 'i-lucide-loader-2' : 'i-lucide-check'"
                class="h-4 w-4 stroke-[2.5]"
                :class="{ 'animate-spin': isSubmitting }"
              />
              <span>{{
                isSubmitting ? submitProgressText || 'Publishing...' : 'Publish Project'
              }}</span>
            </button>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>
