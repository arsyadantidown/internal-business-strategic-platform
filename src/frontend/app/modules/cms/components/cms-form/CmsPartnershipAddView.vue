<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import type {
  CmsContentSaveAction,
  CmsFormErrors,
  CmsPartnershipFormValues
} from '../../types/cms.types'
import {
  cmsAuthorOptions,
  cmsCurrentActor,
  cmsExpertiseOptions,
  cmsLocationOptions,
  cmsPartnerCategoryOptions,
  cmsPartnerTypeOptions,
  cmsRelatedPortfolioFilterOptions
} from '../../data/cms.data'
import { portfolioIndustryOptions } from '~/modules/portofolio/data/portfolioOptions'
import {
  cmsControlClass,
  cmsControlStateClass,
  splitCmsLines
} from '../../utils/cmsForm'
import { formatCmsDateTimeLocalValue, stripCmsHtml } from '../../utils/cmsFormat'
import { scrollCmsSectionIntoView } from '../../utils/cmsScroll'
import { useCmsContent } from '../cms-list/useCmsContent'
import CmsFormField from './CmsFormField.vue'
import CmsFormSection from './CmsFormSection.vue'
import CmsOptionChips from './CmsOptionChips.vue'
import CmsRichTextEditor from './CmsRichTextEditor.vue'

type PartnershipFormState = CmsPartnershipFormValues & {
  solutionsText: string
  benefitsText: string
}

const emit = defineEmits<{
  (e: 'back'): void
}>()

const toast = useToast()
const { createContent, resetFilters, setPage } = useCmsContent('partnership')

const sectionLinks = [
  { id: 'partner-information', label: 'Partner Information', icon: 'i-lucide-info' },
  { id: 'expertise-solutions', label: 'Expertise & Solutions', icon: 'i-lucide-sparkles' },
  { id: 'partnership-content', label: 'Partnership Content', icon: 'i-lucide-align-left' },
  { id: 'brand-asset', label: 'Brand Asset', icon: 'i-lucide-image' },
  { id: 'related-portfolio', label: 'Related Portfolio', icon: 'i-lucide-briefcase' }
]

const openSections = reactive<Record<string, boolean>>(
  Object.fromEntries(sectionLinks.map(section => [section.id, false]))
)

const errorSectionMap: Record<string, string> = {
  title: 'partner-information',
  summary: 'partner-information',
  category: 'partner-information',
  partnerType: 'partner-information',
  industry: 'partner-information',
  overview: 'partnership-content',
  author: 'publish-settings',
  scheduledAt: 'publish-settings'
}

const errorFieldMap: Record<string, string> = {
  title: 'add-partnership-title',
  summary: 'add-partnership-summary',
  category: 'add-partnership-category',
  partnerType: 'add-partnership-partner-type',
  industry: 'add-partnership-industry',
  overview: 'add-partnership-overview',
  author: 'add-partnership-author',
  scheduledAt: 'add-partnership-scheduled-at'
}

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
const activeSection = ref(sectionLinks[0]?.id ?? 'partner-information')

const saveActionPast: Record<CmsContentSaveAction, string> = {
  draft: 'saved as a draft',
  schedule: 'scheduled for publication',
  publish: 'published'
}

const currentStatusLabel = computed(() => form.value.status || 'Draft')

const openAndScrollToSection = async (sectionId: string, targetId = sectionId) => {
  if (sectionId && sectionId in openSections) openSections[sectionId] = true
  await nextTick()
  scrollCmsSectionIntoView(targetId)
}

const scrollToSection = async (id: string) => {
  activeSection.value = id
  if (openSections[id]) {
    openSections[id] = false
    return
  }
  await openAndScrollToSection(id)
}

const clearError = (field: string) => {
  if (!errors.value[field]) return
  errors.value = { ...errors.value, [field]: undefined }
}

const focusFirstError = async (nextErrors: CmsFormErrors) => {
  const errorFields = Object.keys(nextErrors)
  if (!errorFields.length) return

  const sectionIds = new Set(
    errorFields
      .map(field => errorSectionMap[field])
      .filter((id): id is string => Boolean(id))
  )

  sectionIds.forEach((id) => {
    if (id in openSections) openSections[id] = true
  })

  const firstField = errorFields.find(field => errorFieldMap[field])
  if (!firstField) return

  const targetId = errorFieldMap[firstField]
  if (!targetId) return

  const firstSectionId = errorSectionMap[firstField] ?? ''
  await openAndScrollToSection(firstSectionId, targetId)
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

const handleSubmit = async (action: CmsContentSaveAction) => {
  if (!validate(action)) {
    await focusFirstError(errors.value)
    return
  }

  const {
    solutionsText,
    benefitsText,
    ...values
  } = form.value

  const created = createContent('partnership', {
    ...values,
    status: action === 'publish' ? 'Published' : action === 'schedule' ? 'Scheduled' : 'Draft',
    publishedAt: action === 'publish' ? new Date().toISOString() : '',
    scheduledAt: action === 'schedule' ? values.scheduledAt : '',
    title: values.title.trim(),
    summary: values.summary.trim(),
    solutions: splitCmsLines(solutionsText),
    benefits: splitCmsLines(benefitsText)
  })

  resetFilters()
  setPage(1)

  toast.add({
    title: 'Partnership content created',
    description: `"${created.title}" was ${saveActionPast[action]} successfully.`,
    color: 'success'
  })

  await nextTick()
  emit('back')
}

onMounted(() => {
  document.querySelector('main')?.scrollTo({ top: 0 })
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
            Partnership Content
          </button>
          <UIcon
            name="i-lucide-chevron-right"
            class="h-3 w-3 shrink-0"
          />
          <span class="font-semibold text-slate-700">Add Partnership</span>
        </nav>

        <h1 class="text-2xl font-bold leading-8 tracking-tight text-slate-900">
          Add Partnership Content
        </h1>
        <p class="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
          Create a new partnership content with partner details, expertise, and supporting materials.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
        <button
          type="button"
          class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
          @click="emit('back')"
        >
          Cancel
        </button>

        <button
          type="button"
          class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
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
          class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3.5 text-xs font-semibold text-sky-700 shadow-xs transition-all hover:bg-sky-100 active:scale-95 cursor-pointer"
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
          class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
          @click="handleSubmit('publish')"
        >
          <UIcon
            name="i-lucide-send"
            class="h-3.5 w-3.5"
          />
          Publish Now
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
          id="partner-information"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['partner-information']"
            title="Partner Information"
            description="Internal content visible to authorized team members only. Legal entity, contacts, contracts, and verification are managed in the Partnership module."
            icon="i-lucide-info"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Partner Name"
              html-for="add-partnership-title"
              required
              :error="errors.title"
            >
              <input
                id="add-partnership-title"
                v-model="form.title"
                type="text"
                placeholder="Enter partner name"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.title))]"
                @input="clearError('title')"
              >
            </CmsFormField>

            <CmsFormField
              label="Partner Category"
              html-for="add-partnership-category"
              required
              :error="errors.category"
            >
              <select
                id="add-partnership-category"
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
              html-for="add-partnership-partner-type"
              required
              :error="errors.partnerType"
            >
              <select
                id="add-partnership-partner-type"
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
              html-for="add-partnership-industry"
              required
              :error="errors.industry"
            >
              <select
                id="add-partnership-industry"
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
              html-for="add-partnership-location"
            >
              <select
                id="add-partnership-location"
                v-model="form.location"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option
                  value=""
                  disabled
                >
                  Select location
                </option>
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
              html-for="add-partnership-website"
            >
              <input
                id="add-partnership-website"
                v-model="form.website"
                type="url"
                placeholder="https://partner.com"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Summary"
              html-for="add-partnership-summary"
              required
              full
              :error="errors.summary"
            >
              <textarea
                id="add-partnership-summary"
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
                Highlight this partner on the internal dashboard
              </label>
            </CmsFormField>
          </CmsFormSection>
        </div>

        <div
          id="expertise-solutions"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['expertise-solutions']"
            title="Expertise & Solutions"
            description="Capabilities and services delivered through the partnership."
            icon="i-lucide-sparkles"
            class="shadow-xs"
            collapsible
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
              html-for="add-partnership-solutions"
              full
              hint="One solution per line."
            >
              <textarea
                id="add-partnership-solutions"
                v-model="form.solutionsText"
                rows="4"
                placeholder="Cloud infrastructure modernization"
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>
          </CmsFormSection>
        </div>

        <div
          id="partnership-content"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['partnership-content']"
            title="Partnership Content"
            description="Narrative used on the internal partnership detail."
            icon="i-lucide-align-left"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Overview"
              html-for="add-partnership-overview"
              required
              full
              :error="errors.overview"
            >
              <CmsRichTextEditor
                id="add-partnership-overview"
                v-model="form.overview"
                placeholder="Describe the partnership, focus areas, and value"
                @update:model-value="clearError('overview')"
              />
            </CmsFormField>

            <CmsFormField
              label="Collaboration Scope"
              html-for="add-partnership-scope"
              full
            >
              <CmsRichTextEditor
                id="add-partnership-scope"
                v-model="form.collaborationScope"
                placeholder="Explain how the teams collaborate"
              />
            </CmsFormField>

            <CmsFormField
              label="Benefits"
              html-for="add-partnership-benefits"
              full
              hint="One benefit per line."
            >
              <textarea
                id="add-partnership-benefits"
                v-model="form.benefitsText"
                rows="4"
                placeholder="Preferred pricing and technical support"
                class="py-2 leading-relaxed"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              />
            </CmsFormField>
          </CmsFormSection>
        </div>

        <div
          id="brand-asset"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['brand-asset']"
            title="Brand Asset"
            description="Logo used on the internal partnership story."
            icon="i-lucide-image"
            class="shadow-xs"
            collapsible
          >
            <CmsFormField
              label="Logo URL"
              html-for="add-partnership-logo"
              full
            >
              <input
                id="add-partnership-logo"
                v-model="form.logo"
                type="url"
                placeholder="https://example.com/logo.png"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
            </CmsFormField>
          </CmsFormSection>
        </div>

        <div
          id="related-portfolio"
          class="scroll-mt-4"
        >
          <CmsFormSection
            v-model:open="openSections['related-portfolio']"
            title="Related Portfolio"
            description="Portfolio projects delivered with this partner."
            icon="i-lucide-briefcase"
            class="shadow-xs"
            collapsible
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
        </div>
      </div>

      <aside
        id="publish-settings"
        class="min-w-0 space-y-4 xl:col-span-3 xl:sticky xl:top-4 xl:self-start"
      >
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
              <span class="mb-1.5 block text-[11px] font-semibold text-slate-700">
                Current Status
              </span>
              <div class="flex h-9 items-center">
                <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                  <span class="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  {{ currentStatusLabel }}
                </span>
              </div>
            </div>

            <CmsFormField
              label="Scheduled Publication"
              html-for="add-partnership-scheduled-at"
              :error="errors.scheduledAt"
              hint="Browser local time. Used by the Schedule action."
            >
              <input
                id="add-partnership-scheduled-at"
                v-model="form.scheduledAt"
                type="datetime-local"
                :min="formatCmsDateTimeLocalValue()"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(Boolean(errors.scheduledAt))]"
                @input="clearError('scheduledAt')"
              >
            </CmsFormField>

            <div>
              <label
                for="add-partnership-visibility"
                class="mb-1.5 block text-[11px] font-semibold text-slate-700"
              >
                Visibility
              </label>
              <select
                id="add-partnership-visibility"
                v-model="form.visibility"
                class="h-9"
                :class="[cmsControlClass, cmsControlStateClass(false)]"
              >
                <option value="Internal">
                  Internal
                </option>
              </select>
            </div>

            <CmsFormField
              label="Author"
              html-for="add-partnership-author"
              required
              :error="errors.author"
            >
              <select
                id="add-partnership-author"
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
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>
