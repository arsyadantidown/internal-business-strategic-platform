<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  CmsContentSaveAction,
  CmsFormErrors,
  CmsPortfolioContent,
  CmsPortfolioFormValues
} from '../../types/cms.types'
import {
  cmsAuthorOptions,
  cmsCurrencyOptions,
  cmsCurrentActor,
  cmsFundingTypeOptions,
  cmsProjectTypeOptions,
  cmsRelatedPartnerFilterOptions,
  cmsServiceTypeOptions,
  cmsTechnologyOptions,
  cmsVisibilityFilterOptions
} from '../../data/cms.data'
import {
  portfolioIndustryOptions,
  portfolioProjectStatusOptions
} from '~/modules/portofolio/data/portfolioOptions'
import {
  cmsControlClass,
  cmsControlStateClass,
  joinCmsLines,
  parseCmsDocuments,
  serializeCmsDocuments,
  slugifyCmsTitle,
  splitCmsLines
} from '../../utils/cmsForm'
import { formatCmsDateTimeLocalValue, stripCmsHtml } from '../../utils/cmsFormat'
import CmsFormSection from './CmsFormSection.vue'
import CmsFormField from './CmsFormField.vue'
import CmsOptionChips from './CmsOptionChips.vue'
import CmsRichTextEditor from './CmsRichTextEditor.vue'

interface Props {
  isOpen: boolean
  content: CmsPortfolioContent | null
}

type PortfolioFormState = CmsPortfolioFormValues & {
  challengesText: string
  solutionsText: string
  documentsText: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', values: CmsPortfolioFormValues, action: CmsContentSaveAction): void
}>()

const emptyForm = (): PortfolioFormState => ({
  title: '',
  summary: '',
  status: 'Draft',
  author: cmsCurrentActor,
  featured: false,
  publishedAt: '',
  scheduledAt: '',
  projectType: '',
  serviceType: '',
  industry: '',
  client: '',
  clientIndustry: '',
  clientLocation: '',
  contactName: '',
  contactEmail: '',
  projectStatus: 'On Proposal',
  startDate: '',
  endDate: '',
  location: '',
  teamSize: '',
  projectValue: '',
  currency: 'IDR',
  fundingType: 'Client Funded',
  overview: '',
  background: '',
  challenges: [],
  solutions: [],
  image: '',
  documents: [],
  technologies: [],
  partners: [],
  visibility: 'Internal',
  challengesText: '',
  solutionsText: '',
  documentsText: ''
})

const form = ref<PortfolioFormState>(emptyForm())
const errors = ref<CmsFormErrors>({})

const isEditing = computed(() => Boolean(props.content))
const modalTitle = computed(() =>
  isEditing.value ? 'Edit Portfolio Content' : 'Add Portfolio Content'
)

const currentStatusLabel = computed(() => props.content?.status ?? 'Draft')

const partnerNames = computed<string[]>({
  get: () => form.value.partners.map(partner => partner.name),
  set: (names) => {
    form.value.partners = names.map((name) => {
      const existing = form.value.partners.find(partner => partner.name === name)
      return existing ?? { name, role: 'Partner', tag: 'Related Partner' }
    })
  }
})

const populateForm = () => {
  const item = props.content

  if (!item) {
    form.value = emptyForm()
    errors.value = {}
    return
  }

  form.value = {
    ...emptyForm(),
    ...item,
    publishedAt: item.publishedAt ?? '',
    scheduledAt: item.scheduledAt ? item.scheduledAt.slice(0, 16) : '',
    challengesText: joinCmsLines(item.challenges),
    solutionsText: joinCmsLines(item.solutions),
    documentsText: serializeCmsDocuments(item.documents)
  }
  errors.value = {}
}

const clearError = (field: string) => {
  if (!errors.value[field]) return
  errors.value = { ...errors.value, [field]: undefined }
}

const handleTitleBlur = () => {
  // slug removed
}

const validate = (action: CmsContentSaveAction) => {
  const nextErrors: CmsFormErrors = {}

  if (form.value.title.trim().length < 3) {
    nextErrors.title = 'Title is required and must be at least 3 characters.'
  }
  if (form.value.summary.trim().length < 10) {
    nextErrors.summary = 'Summary must be at least 10 characters.'
  }
  if (!form.value.client.trim()) {
    nextErrors.client = 'Client name is required.'
  }
  if (!form.value.industry) {
    nextErrors.industry = 'Please select an industry.'
  }
  if (!form.value.projectType) {
    nextErrors.projectType = 'Please select a project type.'
  }
  if (!form.value.serviceType) {
    nextErrors.serviceType = 'Please select a service type.'
  }
  if (!form.value.projectStatus) {
    nextErrors.projectStatus = 'Please select a project status.'
  }
  if (stripCmsHtml(form.value.overview).length < 30) {
    nextErrors.overview = 'Overview must be at least 30 characters.'
  }
  if (!form.value.author) {
    nextErrors.author = 'Please select an author.'
  }
  if (action === 'schedule') {
    if (!form.value.scheduledAt) {
      nextErrors.scheduledAt = 'Choose the publication date and time.'
    } else if (new Date(form.value.scheduledAt).getTime() <= Date.now()) {
      nextErrors.scheduledAt = 'Scheduled publication must be in the future.'
    }
  }

  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

const handleSubmit = (action: CmsContentSaveAction) => {
  if (!validate(action)) return

  const {
    challengesText,
    solutionsText,
    documentsText,
    ...values
  } = form.value

  emit('save', {
    ...values,
    status: action === 'publish' ? 'Published' : action === 'schedule' ? 'Scheduled' : 'Draft',
    publishedAt: action === 'publish' ? new Date().toISOString() : '',
    scheduledAt: action === 'schedule' ? values.scheduledAt : '',
    title: values.title.trim(),
    summary: values.summary.trim(),
    client: values.client.trim(),
    challenges: splitCmsLines(challengesText),
    solutions: splitCmsLines(solutionsText),
    documents: parseCmsDocuments(documentsText)
  }, action)
}

watch(
  [() => props.isOpen, () => props.content],
  ([isOpen]) => {
    if (isOpen) populateForm()
  },
  { immediate: true }
)
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 py-6 font-sans backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
      <div class="flex items-start justify-between border-b border-slate-100 px-6 py-4">
        <div class="flex items-start gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UIcon
              :name="isEditing ? 'i-lucide-pencil' : 'i-lucide-briefcase'"
              class="h-4 w-4"
            />
          </div>
          <div>
            <h2 class="text-sm font-bold tracking-tight text-slate-900">
              {{ modalTitle }}
            </h2>
            <p class="mt-0.5 text-[11px] text-slate-500">
              {{ isEditing ? 'Update the portfolio content and publication settings.' : 'Fill in the portfolio details across each content section.' }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          aria-label="Close"
          @click="emit('close')"
        >
          <UIcon
            name="i-lucide-x"
            class="h-4 w-4"
          />
        </button>
      </div>

      <form @submit.prevent>
        <div class="max-h-[72vh] space-y-4 overflow-y-auto bg-slate-50/40 px-6 py-5">
          <CmsFormSection
            title="Project Information"
            description="Core identity and positioning of the portfolio item."
            icon="i-lucide-info"
          >
            <CmsFormField
              label="Project Title"
              html-for="portfolio-title"
              required
              :error="errors.title"
            >
              <input
                id="portfolio-title"
                v-model="form.title"
                type="text"
                placeholder="Enter project title"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.title))]"
                @input="clearError('title')"
                @blur="handleTitleBlur"
              >
            </CmsFormField>

            <CmsFormField
              label="Project Type"
              html-for="portfolio-project-type"
              required
              :error="errors.projectType"
            >
              <select
                id="portfolio-project-type"
                v-model="form.projectType"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.projectType))]"
                @change="clearError('projectType')"
              >
                <option
                  value=""
                  disabled
                >
                  Select project type
                </option>
                <option
                  v-for="option in cmsProjectTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Service Type"
              html-for="portfolio-service-type"
              required
              :error="errors.serviceType"
            >
              <select
                id="portfolio-service-type"
                v-model="form.serviceType"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.serviceType))]"
                @change="clearError('serviceType')"
              >
                <option
                  value=""
                  disabled
                >
                  Select service type
                </option>
                <option
                  v-for="option in cmsServiceTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Industry"
              html-for="portfolio-industry"
              required
              :error="errors.industry"
            >
              <select
                id="portfolio-industry"
                v-model="form.industry"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.industry))]"
                @change="clearError('industry')"
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
              label="Summary"
              html-for="portfolio-summary"
              required
              full
              :error="errors.summary"
            >
              <textarea
                id="portfolio-summary"
                v-model="form.summary"
                rows="2"
                placeholder="Write a short summary shown in listings"
                class="py-2"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.summary))]"
                @input="clearError('summary')"
              />
            </CmsFormField>

            <CmsFormField
              label="Featured"
              full
            >
              <label class="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600">
                <input
                  v-model="form.featured"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                >
                Highlight this portfolio item on the public directory
              </label>
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Customer Information"
            description="Client profile and primary contact."
            icon="i-lucide-building-2"
          >
            <CmsFormField
              label="Client Name"
              html-for="portfolio-client"
              required
              :error="errors.client"
            >
              <input
                id="portfolio-client"
                v-model="form.client"
                type="text"
                placeholder="Enter client or organization name"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.client))]"
                @input="clearError('client')"
              >
            </CmsFormField>

            <CmsFormField
              label="Client Industry"
              html-for="portfolio-client-industry"
            >
              <select
                id="portfolio-client-industry"
                v-model="form.clientIndustry"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select client industry
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
              label="Client Location"
              html-for="portfolio-client-location"
            >
              <input
                id="portfolio-client-location"
                v-model="form.clientLocation"
                type="text"
                placeholder="City, Country"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Contact Name"
              html-for="portfolio-contact-name"
            >
              <input
                id="portfolio-contact-name"
                v-model="form.contactName"
                type="text"
                placeholder="Primary client contact"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Contact Email"
              html-for="portfolio-contact-email"
              full
            >
              <input
                id="portfolio-contact-email"
                v-model="form.contactEmail"
                type="email"
                placeholder="name@company.com"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Project Details"
            description="Delivery timeline, location, and status."
            icon="i-lucide-calendar-range"
          >
            <CmsFormField
              label="Project Status"
              html-for="portfolio-project-status"
              required
              :error="errors.projectStatus"
            >
              <select
                id="portfolio-project-status"
                v-model="form.projectStatus"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.projectStatus))]"
                @change="clearError('projectStatus')"
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
              label="Team Size"
              html-for="portfolio-team-size"
            >
              <input
                id="portfolio-team-size"
                v-model="form.teamSize"
                type="text"
                placeholder="e.g. 12 members"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Start Date"
              html-for="portfolio-start-date"
            >
              <input
                id="portfolio-start-date"
                v-model="form.startDate"
                type="date"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="End Date"
              html-for="portfolio-end-date"
            >
              <input
                id="portfolio-end-date"
                v-model="form.endDate"
                type="date"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Project Location"
              html-for="portfolio-location"
              full
            >
              <input
                id="portfolio-location"
                v-model="form.location"
                type="text"
                placeholder="City, Country"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Financial Information"
            description="Commercial value and funding context."
            icon="i-lucide-wallet"
          >
            <CmsFormField
              label="Project Value"
              html-for="portfolio-project-value"
              hint="Numeric amount without separators."
            >
              <input
                id="portfolio-project-value"
                v-model="form.projectValue"
                type="text"
                inputmode="numeric"
                placeholder="e.g. 4500000000"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Currency"
              html-for="portfolio-currency"
            >
              <select
                id="portfolio-currency"
                v-model="form.currency"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  v-for="option in cmsCurrencyOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Funding Type"
              html-for="portfolio-funding-type"
              full
            >
              <select
                id="portfolio-funding-type"
                v-model="form.fundingType"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  v-for="option in cmsFundingTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Project Content"
            description="Narrative used on the public portfolio detail."
            icon="i-lucide-align-left"
          >
            <CmsFormField
              label="Overview"
              html-for="portfolio-overview"
              required
              full
              :error="errors.overview"
            >
              <CmsRichTextEditor
                id="portfolio-overview"
                v-model="form.overview"
                placeholder="Describe the project, scope, and outcome"
                @update:model-value="clearError('overview')"
              />
            </CmsFormField>

            <CmsFormField
              label="Background"
              html-for="portfolio-background"
              full
            >
              <CmsRichTextEditor
                id="portfolio-background"
                v-model="form.background"
                placeholder="Explain the client context and business need"
              />
            </CmsFormField>

            <CmsFormField
              label="Challenges"
              html-for="portfolio-challenges"
              full
              hint="One challenge per line."
            >
              <textarea
                id="portfolio-challenges"
                v-model="form.challengesText"
                rows="4"
                placeholder="Legacy system with limited scalability"
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>

            <CmsFormField
              label="Solutions"
              html-for="portfolio-solutions"
              full
              hint="One solution per line."
            >
              <textarea
                id="portfolio-solutions"
                v-model="form.solutionsText"
                rows="4"
                placeholder="Modern web and mobile banking platform"
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Media & Documents"
            description="Cover image and downloadable project files."
            icon="i-lucide-image"
          >
            <CmsFormField
              label="Cover Image URL"
              html-for="portfolio-image"
              full
            >
              <input
                id="portfolio-image"
                v-model="form.image"
                type="url"
                placeholder="https://example.com/cover.jpg"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Documents"
              html-for="portfolio-documents"
              full
              hint="One document per line: File Name.pdf | PDF | 2.4 MB"
            >
              <textarea
                id="portfolio-documents"
                v-model="form.documentsText"
                rows="4"
                placeholder="Project Proposal.pdf | PDF | 2.4 MB"
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Technology Stack"
            description="Technologies and platforms used in delivery."
            icon="i-lucide-cpu"
          >
            <CmsFormField
              label="Technologies"
              full
            >
              <CmsOptionChips
                v-model="form.technologies"
                :options="cmsTechnologyOptions"
                empty-label="Select at least one technology used in this project."
              />
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Related Partners"
            description="Partners involved in delivering the project."
            icon="i-lucide-handshake"
          >
            <CmsFormField
              label="Partners"
              full
            >
              <CmsOptionChips
                v-model="partnerNames"
                :options="cmsRelatedPartnerFilterOptions"
                empty-label="Select the partners related to this portfolio item."
              />
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Publish Settings"
            description="Status, visibility, and search metadata."
            icon="i-lucide-send"
          >
            <CmsFormField
              label="Current Status"
              hint="Use the action buttons below to change the publication state."
            >
              <div class="flex h-9 items-center">
                <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                  <span class="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  {{ currentStatusLabel }}
                </span>
              </div>
            </CmsFormField>

            <CmsFormField
              label="Scheduled Publication"
              html-for="portfolio-scheduled-at"
              :error="errors.scheduledAt"
              hint="Browser local time. Used by the Schedule action."
            >
              <input
                id="portfolio-scheduled-at"
                v-model="form.scheduledAt"
                type="datetime-local"
                :min="formatCmsDateTimeLocalValue()"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.scheduledAt))]"
                @input="clearError('scheduledAt')"
              >
            </CmsFormField>

            <CmsFormField
              label="Visibility"
              html-for="portfolio-visibility"
            >
              <select
                id="portfolio-visibility"
                v-model="form.visibility"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="Internal">
                  Internal
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Author"
              html-for="portfolio-author"
              required
              :error="errors.author"
            >
              <select
                id="portfolio-author"
                v-model="form.author"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.author))]"
                @change="clearError('author')"
              >
                <option
                  value=""
                  disabled
                >
                  Select author
                </option>
                <option
                  v-for="option in cmsAuthorOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>
          </CmsFormSection>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            class="inline-flex h-9 min-w-20 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>

          <button
            type="button"
            class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
            @click="handleSubmit('draft')"
          >
            <UIcon
              name="i-lucide-file-pen-line"
              class="h-3.5 w-3.5"
            />
            Save as Draft
          </button>

          <button
            type="button"
            class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-4 text-xs font-semibold text-sky-700 shadow-2xs transition-all hover:bg-sky-100 active:scale-95 cursor-pointer"
            @click="handleSubmit('schedule')"
          >
            <UIcon
              name="i-lucide-calendar-clock"
              class="h-3.5 w-3.5"
            />
            Schedule
          </button>

          <button
            type="button"
            class="inline-flex h-9 min-w-28 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
            @click="handleSubmit('publish')"
          >
            <UIcon
              name="i-lucide-send"
              class="h-3.5 w-3.5"
            />
            Publish Now
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
