<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  CmsContentSaveAction,
  CmsFormErrors,
  CmsPartnershipContent,
  CmsPartnershipFormValues
} from '../../types/cms.types'
import {
  cmsAuthorOptions,
  cmsCurrentActor,
  cmsExpertiseOptions,
  cmsLocationOptions,
  cmsPartnerCategoryOptions,
  cmsPartnerTypeOptions,
  cmsRelatedPortfolioFilterOptions,
  cmsVisibilityFilterOptions
} from '../../data/cms.data'
import { portfolioIndustryOptions } from '~/modules/portofolio/data/portfolioOptions'
import {
  cmsControlClass,
  cmsControlStateClass,
  joinCmsLines,
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
  content: CmsPartnershipContent | null
}

type PartnershipFormState = CmsPartnershipFormValues & {
  solutionsText: string
  benefitsText: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', values: CmsPartnershipFormValues, action: CmsContentSaveAction): void
}>()

const emptyForm = (): PartnershipFormState => ({
  title: '',
  summary: '',
  status: 'Draft',
  author: cmsCurrentActor,
  featured: false,
  publishedAt: '',
  scheduledAt: '',
  category: 'Technology Partner',
  partnerType: 'Strategic Partner',
  industry: '',
  location: '',
  website: '',
  expertise: [],
  solutions: [],
  overview: '',
  collaborationScope: '',
  benefits: [],
  logo: '',
  relatedPortfolio: [],
  visibility: 'Internal',
  solutionsText: '',
  benefitsText: ''
})

const form = ref<PartnershipFormState>(emptyForm())
const errors = ref<CmsFormErrors>({})

const isEditing = computed(() => Boolean(props.content))
const modalTitle = computed(() =>
  isEditing.value ? 'Edit Partnership Content' : 'Add Partnership Content'
)
const currentStatusLabel = computed(() => props.content?.status ?? 'Draft')

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
    solutionsText: joinCmsLines(item.solutions),
    benefitsText: joinCmsLines(item.benefits)
  }
  errors.value = {}
}

const clearError = (field: string) => {
  if (!errors.value[field]) return
  errors.value = { ...errors.value, [field]: undefined }
}

const handleTitleBlur = () => {
}

const validate = (action: CmsContentSaveAction) => {
  const nextErrors: CmsFormErrors = {}

  if (form.value.title.trim().length < 3) {
    nextErrors.title = 'Partner name is required and must be at least 3 characters.'
  }
  if (form.value.summary.trim().length < 10) {
    nextErrors.summary = 'Summary must be at least 10 characters.'
  }
  if (!form.value.category) {
    nextErrors.category = 'Please select a partner category.'
  }
  if (!form.value.partnerType) {
    nextErrors.partnerType = 'Please select a partner type.'
  }
  if (!form.value.industry) {
    nextErrors.industry = 'Please select an industry.'
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
    solutionsText,
    benefitsText,
    ...values
  } = form.value

  emit('save', {
    ...values,
    status: action === 'publish' ? 'Published' : action === 'schedule' ? 'Scheduled' : 'Draft',
    publishedAt: action === 'publish' ? new Date().toISOString() : '',
    scheduledAt: action === 'schedule' ? values.scheduledAt : '',
    title: values.title.trim(),
    summary: values.summary.trim(),
    solutions: splitCmsLines(solutionsText),
    benefits: splitCmsLines(benefitsText)
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
              :name="isEditing ? 'i-lucide-pencil' : 'i-lucide-handshake'"
              class="h-4 w-4"
            />
          </div>
          <div>
            <h2 class="text-sm font-bold tracking-tight text-slate-900">
              {{ modalTitle }}
            </h2>
            <p class="mt-0.5 text-[11px] text-slate-500">
              {{ isEditing ? 'Update the partnership content and publication settings.' : 'Fill in the partner details across each content section.' }}
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

      <form @submit.prevent="handleSubmit('publish')">
        <div class="max-h-[72vh] space-y-4 overflow-y-auto bg-slate-50/40 px-6 py-5">
          <CmsFormSection
            title="Partner Information"
            description="Internal content visible to authorized team members only. Legal entity, contacts, contracts, and verification are managed in the Partnership module."
            icon="i-lucide-info"
          >
            <CmsFormField
              label="Partner Name"
              html-for="partnership-title"
              required
              :error="errors.title"
            >
              <input
                id="partnership-title"
                v-model="form.title"
                type="text"
                placeholder="Enter partner name"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.title))]"
                @input="clearError('title')"
                @blur="handleTitleBlur"
              >
            </CmsFormField>

            <CmsFormField
              label="Partner Category"
              html-for="partnership-category"
              required
              :error="errors.category"
            >
              <select
                id="partnership-category"
                v-model="form.category"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.category))]"
                @change="clearError('category')"
              >
                <option
                  value=""
                  disabled
                >
                  Select category
                </option>
                <option
                  v-for="option in cmsPartnerCategoryOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Partner Type"
              html-for="partnership-partner-type"
              required
              :error="errors.partnerType"
            >
              <select
                id="partnership-partner-type"
                v-model="form.partnerType"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.partnerType))]"
                @change="clearError('partnerType')"
              >
                <option
                  value=""
                  disabled
                >
                  Select partner type
                </option>
                <option
                  v-for="option in cmsPartnerTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Industry"
              html-for="partnership-industry"
              required
              :error="errors.industry"
            >
              <select
                id="partnership-industry"
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
              label="Location"
              html-for="partnership-location"
            >
              <select
                id="partnership-location"
                v-model="form.location"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  v-for="option in cmsLocationOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Website"
              html-for="partnership-website"
            >
              <input
                id="partnership-website"
                v-model="form.website"
                type="url"
                placeholder="https://partner.com"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Summary"
              html-for="partnership-summary"
              required
              full
              :error="errors.summary"
            >
              <textarea
                id="partnership-summary"
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
                Highlight this partner on the public directory
              </label>
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Expertise & Solutions"
            description="Capabilities and services delivered through the partnership."
            icon="i-lucide-sparkles"
          >
            <CmsFormField
              label="Expertise"
              full
            >
              <CmsOptionChips
                v-model="form.expertise"
                :options="cmsExpertiseOptions"
                empty-label="Select the partner's core expertise areas."
              />
            </CmsFormField>

            <CmsFormField
              label="Solutions"
              html-for="partnership-solutions"
              full
              hint="One solution per line."
            >
              <textarea
                id="partnership-solutions"
                v-model="form.solutionsText"
                rows="4"
                placeholder="Cloud infrastructure modernization"
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Partnership Content"
            description="Narrative used on the public partnership detail."
            icon="i-lucide-align-left"
          >
            <CmsFormField
              label="Overview"
              html-for="partnership-overview"
              required
              full
              :error="errors.overview"
            >
              <CmsRichTextEditor
                id="partnership-overview"
                v-model="form.overview"
                placeholder="Describe the partnership, focus areas, and value"
                @update:model-value="clearError('overview')"
              />
            </CmsFormField>

            <CmsFormField
              label="Collaboration Scope"
              html-for="partnership-scope"
              full
            >
              <CmsRichTextEditor
                id="partnership-scope"
                v-model="form.collaborationScope"
                placeholder="Explain how the teams collaborate"
              />
            </CmsFormField>

            <CmsFormField
              label="Benefits"
              html-for="partnership-benefits"
              full
              hint="One benefit per line."
            >
              <textarea
                id="partnership-benefits"
                v-model="form.benefitsText"
                rows="4"
                placeholder="Preferred pricing and technical support"
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Brand Asset"
            description="Logo used on the public partnership story."
            icon="i-lucide-image"
          >
            <CmsFormField
              label="Logo URL"
              html-for="partnership-logo"
              full
            >
              <input
                id="partnership-logo"
                v-model="form.logo"
                type="url"
                placeholder="https://example.com/logo.png"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>
          </CmsFormSection>

          <CmsFormSection
            title="Related Portfolio"
            description="Portfolio projects delivered with this partner."
            icon="i-lucide-briefcase"
          >
            <CmsFormField
              label="Portfolio Projects"
              full
            >
              <CmsOptionChips
                v-model="form.relatedPortfolio"
                :options="cmsRelatedPortfolioFilterOptions"
                empty-label="Select portfolio projects related to this partner."
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
              html-for="partnership-scheduled-at"
              :error="errors.scheduledAt"
              hint="Browser local time. Used by the Schedule action."
            >
              <input
                id="partnership-scheduled-at"
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
              html-for="partnership-visibility"
            >
              <select
                id="partnership-visibility"
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
              html-for="partnership-author"
              required
              :error="errors.author"
            >
              <select
                id="partnership-author"
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
