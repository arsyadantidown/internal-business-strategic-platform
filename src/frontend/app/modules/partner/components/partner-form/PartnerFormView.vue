<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { cmsControlClass, cmsControlStateClass } from '~/modules/cms/utils/cmsForm'
import { getPartnerErrorMessage, partnerApi } from '../../api/partner.api'
import type {
  PartnerCategoryValue,
  PartnerDetail,
  PartnerFormErrors,
  PartnerFormValues
} from '../../types/partner.types'
import { PARTNER_CATEGORIES, PARTNER_LEGAL_DOCUMENT_TYPES, PARTNER_LIFECYCLE_STATUSES } from '../../types/partner.types'
import PartnerFormStepper from './PartnerFormStepper.vue'
import PartnerTagInput from './PartnerTagInput.vue'

interface Props {
  editingId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'back' | 'saved'): void
}>()

const toast = useToast()

const isEditMode = computed(() => props.editingId !== null)

const CATEGORY_DESCRIPTIONS: Record<PartnerCategoryValue, string> = {
  technology: 'Builds or supplies technical products and platforms',
  channel: 'Resells or distributes our solutions to market',
  service: 'Delivers implementation and managed services',
  marketing: 'Amplifies reach through campaigns and co-marketing'
}

const STEPS = [
  { label: 'Company Profile', icon: 'i-lucide-briefcase' },
  { label: 'Expertise', icon: 'i-lucide-sparkles' },
  { label: 'Legal Documents', icon: 'i-lucide-scale' },
  { label: 'Review & Status', icon: 'i-lucide-clipboard-list' }
]

const detail = ref<PartnerDetail | null>(null)
const isPreparing = ref(true)
const prepareError = ref('')
const isSubmitting = ref(false)
const currentStep = ref(0)

const createFormValues = (): PartnerFormValues => ({
  partnerName: '',
  category: '',
  status: 'active',
  website: '',
  headquarters: '',
  industry: '',
  businessFocus: '',
  description: '',
  expertiseAreas: [],
  capabilities: [],
  legalDocuments: []
})

const form = reactive<PartnerFormValues>(createFormValues())
const errors = ref<PartnerFormErrors>({})

const createDocumentRow = () => ({
  documentName: '',
  documentType: 'MoU',
  documentNumber: '',
  issuedAt: '',
  expiresAt: ''
})

const applyDetail = (source: PartnerDetail) => {
  form.partnerName = source.partnerName
  form.category = source.category ?? ''
  form.status = source.lifecycleStatus ?? (source.isActive ? 'active' : 'draft')
  form.website = source.profile.website ?? ''
  form.headquarters = source.profile.headquarters ?? ''
  form.industry = source.profile.industry ?? ''
  form.businessFocus = source.profile.businessFocus ?? ''
  form.description = source.profile.description ?? ''
  form.expertiseAreas = [...source.expertiseAreas]
  form.capabilities = [...source.capabilities]
  form.legalDocuments = source.legalDocuments.map(document => ({
    documentName: document.documentName,
    documentType: document.documentType || 'Other',
    documentNumber: document.documentNumber ?? '',
    issuedAt: document.issuedAt?.slice(0, 10) ?? '',
    expiresAt: document.expiresAt?.slice(0, 10) ?? ''
  }))
}

const prepareForm = async () => {
  isPreparing.value = true
  prepareError.value = ''

  try {
    if (props.editingId) {
      const loaded = await partnerApi.getDetail(props.editingId)
      detail.value = loaded
      applyDetail(loaded)
    }
  } catch (error) {
    prepareError.value = getPartnerErrorMessage(error)
  } finally {
    isPreparing.value = false
  }
}

const WEBSITE_PATTERN = /^https?:\/\/\S+\.\S+/

const validateStep = (step: number): boolean => {
  const next: PartnerFormErrors = {}

  if (step === 0) {
    const partnerName = form.partnerName.trim()

    if (!partnerName) {
      next.partnerName = 'Partner name is required.'
    } else if (partnerName.length > 200) {
      next.partnerName = 'Partner name must be at most 200 characters.'
    }

    if (!form.category) {
      next.category = 'Please select a partner category.'
    }

    if (form.website.trim()) {
      if (!WEBSITE_PATTERN.test(form.website.trim())) {
        next.website = 'Website must be a full URL starting with http:// or https://.'
      } else if (form.website.trim().length > 255) {
        next.website = 'Website must be at most 255 characters.'
      }
    }

    if (form.headquarters.trim().length > 200) {
      next.headquarters = 'Headquarters must be at most 200 characters.'
    }
    if (form.industry.trim().length > 150) {
      next.industry = 'Industry must be at most 150 characters.'
    }
    if (form.businessFocus.trim().length > 255) {
      next.businessFocus = 'Business focus must be at most 255 characters.'
    }
    if (form.description.trim().length > 2000) {
      next.description = 'Description must be at most 2000 characters.'
    }
  }

  if (step === 2) {
    form.legalDocuments.forEach((document, index) => {
      const name = document.documentName.trim()

      if (!name) {
        next[`legalDocuments.${index}.documentName`] = 'Document name is required.'
      } else if (name.length > 150) {
        next[`legalDocuments.${index}.documentName`] = 'Document name must be at most 150 characters.'
      }

      if (!document.documentType) {
        next[`legalDocuments.${index}.documentType`] = 'Type is required.'
      }

      if (document.documentNumber.trim().length > 100) {
        next[`legalDocuments.${index}.documentNumber`] = 'Document number must be at most 100 characters.'
      }

      if (document.issuedAt && document.expiresAt && document.expiresAt < document.issuedAt) {
        next[`legalDocuments.${index}.expiresAt`] = 'Expiry date must be on or after the issued date.'
      }
    })
  }

  errors.value = next
  return Object.keys(next).length === 0
}

const validateAllSteps = (): number => {
  for (let step = 0; step < STEPS.length; step += 1) {
    if (!validateStep(step)) return step
  }
  return -1
}

const goToStep = (step: number) => {
  if (step < currentStep.value) {
    currentStep.value = step
    errors.value = {}
  }
}

const nextStep = () => {
  if (!validateStep(currentStep.value)) return
  errors.value = {}
  currentStep.value = Math.min(currentStep.value + 1, STEPS.length - 1)
}

const previousStep = () => {
  errors.value = {}
  currentStep.value = Math.max(currentStep.value - 1, 0)
}

const addDocumentRow = () => {
  if (form.legalDocuments.length >= 15) return
  form.legalDocuments.push(createDocumentRow())
}

const removeDocumentRow = (index: number) => {
  form.legalDocuments.splice(index, 1)
}

const categoryLabel = computed(() =>
  form.category
    ? PARTNER_CATEGORIES.find(category => category.value === form.category)?.label ?? '—'
    : '—'
)

const statusLabel = computed(() =>
  PARTNER_LIFECYCLE_STATUSES.find(status => status.value === form.status)?.label ?? '—'
)

const handleSubmit = async () => {
  const failingStep = validateAllSteps()

  if (failingStep >= 0) {
    currentStep.value = failingStep
    toast.add({
      title: 'Form has errors',
      description: 'Please review the highlighted fields before submitting.',
      color: 'warning'
    })
    return
  }

  isSubmitting.value = true

  try {
    if (isEditMode.value && props.editingId && detail.value) {
      const changes = partnerApi.getUpdateChanges(detail.value, form)

      if (Object.keys(changes).length === 0) {
        toast.add({
          title: 'No changes to save',
          description: 'Nothing was modified on this partner.',
          color: 'warning'
        })
        return
      }

      await partnerApi.update(props.editingId, detail.value, form)

      toast.add({
        title: 'Partner updated',
        description: `"${form.partnerName.trim()}" has been updated successfully.`,
        color: 'success'
      })
    } else {
      await partnerApi.create(form)

      toast.add({
        title: 'Partner added',
        description: `"${form.partnerName.trim()}" has been registered as a new partner.`,
        color: 'success'
      })
    }

    emit('saved')
  } catch (error) {
    toast.add({
      title: isEditMode.value ? 'Failed to update partner' : 'Failed to add partner',
      description: getPartnerErrorMessage(error),
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  prepareForm()
})
</script>

<template>
  <div class="space-y-5">
    <button
      type="button"
      class="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
      :disabled="isSubmitting"
      @click="emit('back')"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="h-3.5 w-3.5"
      />
      <span>Back to directory</span>
    </button>

    <div>
      <nav class="flex flex-wrap items-center gap-1 text-[11px] font-medium text-slate-400">
        <span>Administration</span>
        <UIcon
          name="i-lucide-chevron-right"
          class="h-3 w-3"
        />
        <span>Content Management</span>
        <UIcon
          name="i-lucide-chevron-right"
          class="h-3 w-3"
        />
        <span>Partner</span>
        <UIcon
          name="i-lucide-chevron-right"
          class="h-3 w-3"
        />
        <span class="font-semibold text-slate-700">
          {{ isEditMode ? 'Edit' : 'Add' }}
        </span>
      </nav>
      <h1 class="mt-2 text-xl font-bold leading-7 tracking-tight text-slate-900">
        {{ isEditMode ? 'Edit Partner' : 'Add Partner' }}
      </h1>
      <p class="mt-0.5 max-w-2xl text-xs leading-5 text-slate-500">
        {{ isEditMode
          ? 'Update the partner profile, expertise, legal records, and status.'
          : 'Register a new partner in four guided steps. Fields marked with * are required.' }}
      </p>
    </div>

    <div
      v-if="isPreparing"
      class="space-y-4"
    >
      <div class="h-14 animate-pulse rounded-xl bg-slate-100" />
      <div class="h-64 animate-pulse rounded-xl bg-slate-100" />
      <div class="h-56 animate-pulse rounded-xl bg-slate-100" />
    </div>

    <div
      v-else-if="prepareError"
      class="rounded-xl border border-slate-200/80 bg-white p-10 shadow-xs"
    >
      <div class="flex flex-col items-center gap-2.5 text-center">
        <UIcon
          name="i-lucide-circle-alert"
          class="h-8 w-8 text-red-400"
        />
        <div>
          <p class="text-xs font-semibold text-slate-700">
            Failed to prepare the form
          </p>
          <p class="mt-0.5 max-w-md text-[11px] text-slate-500">
            {{ prepareError }}
          </p>
        </div>
        <button
          type="button"
          class="mt-1 inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 cursor-pointer"
          @click="prepareForm"
        >
          <UIcon
            name="i-lucide-rotate-ccw"
            class="h-3.5 w-3.5"
          />
          <span>Retry</span>
        </button>
      </div>
    </div>

    <template v-else>
      <div class="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[11px] leading-4 text-amber-700">
        <UIcon
          name="i-lucide-info"
          class="mt-0.5 h-4 w-4 shrink-0"
        />
        <p>
          <span class="font-semibold">Extended partner details await API integration.</span>
          Partner name and status are stored through the current partner API. Company profile,
          expertise, capabilities, and legal documents are collected here and will be stored
          automatically once the extended partner API is available.
        </p>
      </div>

      <PartnerFormStepper
        :steps="STEPS"
        :current-step="currentStep"
        @select="goToStep"
      />

      <form
        novalidate
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <section
          v-if="currentStep === 0"
          class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs"
        >
          <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <UIcon
                name="i-lucide-briefcase"
                class="h-3.5 w-3.5"
              />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold tracking-tight text-slate-900">
                Company Profile
              </h3>
              <p class="mt-0.5 text-[10px] text-slate-400">
                Identity and category of the partner organization
              </p>
            </div>
          </div>

          <div class="mt-3 space-y-3">
            <div>
              <label
                for="partner-name"
                class="mb-1.5 block text-[11px] font-semibold text-slate-700"
              >
                Partner Name <span class="text-rose-500">*</span>
              </label>
              <input
                id="partner-name"
                v-model="form.partnerName"
                type="text"
                placeholder="e.g. PT Maju Teknologi Nusantara"
                autocomplete="organization"
                :class="[cmsControlClass, cmsControlStateClass(!!errors.partnerName)]"
                :disabled="isSubmitting"
              >
              <p
                v-if="errors.partnerName"
                class="mt-1 text-[10px] font-medium text-rose-600"
              >
                {{ errors.partnerName }}
              </p>
            </div>

            <div>
              <p class="mb-1.5 block text-[11px] font-semibold text-slate-700">
                Partner Category <span class="text-rose-500">*</span>
              </p>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  v-for="option in PARTNER_CATEGORIES"
                  :key="option.value"
                  type="button"
                  class="flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  :class="form.category === option.value
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
                  :disabled="isSubmitting"
                  @click="form.category = option.value"
                >
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    :class="form.category === option.value ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'"
                  >
                    <UIcon
                      :name="option.icon"
                      class="h-4 w-4"
                    />
                  </div>
                  <div class="min-w-0">
                    <p
                      class="text-xs font-bold"
                      :class="form.category === option.value ? 'text-blue-700' : 'text-slate-700'"
                    >
                      {{ option.label }}
                    </p>
                    <p class="mt-0.5 text-[10px] leading-4 text-slate-400">
                      {{ CATEGORY_DESCRIPTIONS[option.value] }}
                    </p>
                  </div>
                </button>
              </div>
              <p
                v-if="errors.category"
                class="mt-1 text-[10px] font-medium text-rose-600"
              >
                {{ errors.category }}
              </p>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  for="partner-website"
                  class="mb-1.5 block text-[11px] font-semibold text-slate-700"
                >
                  Website
                </label>
                <input
                  id="partner-website"
                  v-model="form.website"
                  type="text"
                  placeholder="https://www.partner-domain.com"
                  autocomplete="url"
                  :class="[cmsControlClass, cmsControlStateClass(!!errors.website)]"
                  :disabled="isSubmitting"
                >
                <p
                  v-if="errors.website"
                  class="mt-1 text-[10px] font-medium text-rose-600"
                >
                  {{ errors.website }}
                </p>
              </div>

              <div>
                <label
                  for="partner-headquarters"
                  class="mb-1.5 block text-[11px] font-semibold text-slate-700"
                >
                  Headquarters
                </label>
                <input
                  id="partner-headquarters"
                  v-model="form.headquarters"
                  type="text"
                  placeholder="e.g. Jakarta, Indonesia"
                  autocomplete="address-level2"
                  :class="[cmsControlClass, cmsControlStateClass(!!errors.headquarters)]"
                  :disabled="isSubmitting"
                >
                <p
                  v-if="errors.headquarters"
                  class="mt-1 text-[10px] font-medium text-rose-600"
                >
                  {{ errors.headquarters }}
                </p>
              </div>

              <div>
                <label
                  for="partner-industry"
                  class="mb-1.5 block text-[11px] font-semibold text-slate-700"
                >
                  Industry
                </label>
                <input
                  id="partner-industry"
                  v-model="form.industry"
                  type="text"
                  placeholder="e.g. Cloud Infrastructure"
                  autocomplete="off"
                  :class="[cmsControlClass, cmsControlStateClass(!!errors.industry)]"
                  :disabled="isSubmitting"
                >
                <p
                  v-if="errors.industry"
                  class="mt-1 text-[10px] font-medium text-rose-600"
                >
                  {{ errors.industry }}
                </p>
              </div>

              <div>
                <label
                  for="partner-focus"
                  class="mb-1.5 block text-[11px] font-semibold text-slate-700"
                >
                  Business Focus
                </label>
                <input
                  id="partner-focus"
                  v-model="form.businessFocus"
                  type="text"
                  placeholder="e.g. Enterprise middleware solutions"
                  autocomplete="off"
                  :class="[cmsControlClass, cmsControlStateClass(!!errors.businessFocus)]"
                  :disabled="isSubmitting"
                >
                <p
                  v-if="errors.businessFocus"
                  class="mt-1 text-[10px] font-medium text-rose-600"
                >
                  {{ errors.businessFocus }}
                </p>
              </div>
            </div>

            <div>
              <label
                for="partner-description"
                class="mb-1.5 block text-[11px] font-semibold text-slate-700"
              >
                Company Description
              </label>
              <textarea
                id="partner-description"
                v-model="form.description"
                rows="3"
                placeholder="Short overview of the partner organization..."
                class="resize-none"
                :class="[cmsControlClass, cmsControlStateClass(!!errors.description)]"
                :disabled="isSubmitting"
              />
              <p
                v-if="errors.description"
                class="mt-1 text-[10px] font-medium text-rose-600"
              >
                {{ errors.description }}
              </p>
            </div>
          </div>
        </section>

        <section
          v-if="currentStep === 1"
          class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs"
        >
          <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <UIcon
                name="i-lucide-sparkles"
                class="h-3.5 w-3.5"
              />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold tracking-tight text-slate-900">
                Expertise & Capabilities
              </h3>
              <p class="mt-0.5 text-[10px] text-slate-400">
                What the partner is good at and what they can deliver
              </p>
            </div>
          </div>

          <div class="mt-3 space-y-3">
            <div>
              <label class="mb-1.5 block text-[11px] font-semibold text-slate-700">
                Expertise Areas
              </label>
              <PartnerTagInput
                v-model="form.expertiseAreas"
                placeholder="e.g. Cloud Migration - press Enter to add"
                :disabled="isSubmitting"
              />
              <p class="mt-1 text-[10px] text-slate-400">
                Up to 20 areas, e.g. Data Analytics, DevOps, ERP Implementation.
              </p>
            </div>

            <div>
              <label class="mb-1.5 block text-[11px] font-semibold text-slate-700">
                Capabilities
              </label>
              <PartnerTagInput
                v-model="form.capabilities"
                placeholder="e.g. 24/7 Managed Support - press Enter to add"
                :disabled="isSubmitting"
              />
              <p class="mt-1 text-[10px] text-slate-400">
                Up to 20 capabilities describing what the partner can deliver.
              </p>
            </div>
          </div>
        </section>

        <section
          v-if="currentStep === 2"
          class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs"
        >
          <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <UIcon
                name="i-lucide-scale"
                class="h-3.5 w-3.5"
              />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold tracking-tight text-slate-900">
                Legal Documents
              </h3>
              <p class="mt-0.5 text-[10px] text-slate-400">
                Contracts and agreements covering the partnership
              </p>
            </div>
          </div>

          <div class="mt-3 space-y-2.5">
            <div
              v-for="(document, index) in form.legalDocuments"
              :key="index"
              class="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <div class="flex flex-wrap items-start gap-2.5">
                <div class="min-w-40 flex-1">
                  <label class="mb-1.5 block text-[10px] font-semibold text-slate-500">
                    Document Name <span class="text-rose-500">*</span>
                  </label>
                  <input
                    v-model="document.documentName"
                    type="text"
                    placeholder="e.g. Master Distribution Agreement"
                    autocomplete="off"
                    :class="[cmsControlClass, cmsControlStateClass(!!errors[`legalDocuments.${index}.documentName`])]"
                    :disabled="isSubmitting"
                  >
                  <p
                    v-if="errors[`legalDocuments.${index}.documentName`]"
                    class="mt-1 text-[10px] font-medium text-rose-600"
                  >
                    {{ errors[`legalDocuments.${index}.documentName`] }}
                  </p>
                </div>

                <div class="w-full sm:w-48">
                  <label class="mb-1.5 block text-[10px] font-semibold text-slate-500">
                    Type <span class="text-rose-500">*</span>
                  </label>
                  <select
                    v-model="document.documentType"
                    :class="[cmsControlClass, cmsControlStateClass(!!errors[`legalDocuments.${index}.documentType`])]"
                    :disabled="isSubmitting"
                  >
                    <option
                      v-for="type in PARTNER_LEGAL_DOCUMENT_TYPES"
                      :key="type"
                      :value="type"
                    >
                      {{ type }}
                    </option>
                  </select>
                  <p
                    v-if="errors[`legalDocuments.${index}.documentType`]"
                    class="mt-1 text-[10px] font-medium text-rose-600"
                  >
                    {{ errors[`legalDocuments.${index}.documentType`] }}
                  </p>
                </div>

                <div class="min-w-36 flex-1">
                  <label class="mb-1.5 block text-[10px] font-semibold text-slate-500">
                    Number
                  </label>
                  <input
                    v-model="document.documentNumber"
                    type="text"
                    placeholder="Optional"
                    autocomplete="off"
                    class="font-mono"
                    :class="[cmsControlClass, cmsControlStateClass(!!errors[`legalDocuments.${index}.documentNumber`])]"
                    :disabled="isSubmitting"
                  >
                  <p
                    v-if="errors[`legalDocuments.${index}.documentNumber`]"
                    class="mt-1 text-[10px] font-medium text-rose-600"
                  >
                    {{ errors[`legalDocuments.${index}.documentNumber`] }}
                  </p>
                </div>

                <div class="w-full sm:w-36">
                  <label class="mb-1.5 block text-[10px] font-semibold text-slate-500">
                    Issued
                  </label>
                  <input
                    v-model="document.issuedAt"
                    type="date"
                    :class="[cmsControlClass, cmsControlStateClass(false)]"
                    :disabled="isSubmitting"
                  >
                </div>

                <div class="w-full sm:w-36">
                  <label class="mb-1.5 block text-[10px] font-semibold text-slate-500">
                    Expires
                  </label>
                  <input
                    v-model="document.expiresAt"
                    type="date"
                    :class="[cmsControlClass, cmsControlStateClass(!!errors[`legalDocuments.${index}.expiresAt`])]"
                    :disabled="isSubmitting"
                  >
                  <p
                    v-if="errors[`legalDocuments.${index}.expiresAt`]"
                    class="mt-1 text-[10px] font-medium text-rose-600"
                  >
                    {{ errors[`legalDocuments.${index}.expiresAt`] }}
                  </p>
                </div>

                <button
                  type="button"
                  class="mt-5.5 inline-flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 cursor-pointer"
                  title="Remove document"
                  :disabled="isSubmitting"
                  @click="removeDocumentRow(index)"
                >
                  <UIcon
                    name="i-lucide-trash-2"
                    class="h-3.5 w-3.5"
                  />
                </button>
              </div>
            </div>

            <button
              type="button"
              class="inline-flex h-8.5 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white text-xs font-semibold text-slate-500 transition-all hover:border-blue-400 hover:text-blue-600 cursor-pointer sm:w-auto sm:self-start sm:px-4"
              :disabled="isSubmitting"
              @click="addDocumentRow"
            >
              <UIcon
                name="i-lucide-file-plus"
                class="h-3.5 w-3.5"
              />
              <span>Add Legal Document</span>
            </button>
          </div>
        </section>

        <section
          v-if="currentStep === 3"
          class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs"
        >
          <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <UIcon
                name="i-lucide-clipboard-list"
                class="h-3.5 w-3.5"
              />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold tracking-tight text-slate-900">
                Review & Status
              </h3>
              <p class="mt-0.5 text-[10px] text-slate-400">
                Confirm the partner details and set the status
              </p>
            </div>
          </div>

          <div class="mt-3 space-y-3">
            <div>
              <p class="mb-1.5 block text-[11px] font-semibold text-slate-700">
                Partner Status
              </p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="option in PARTNER_LIFECYCLE_STATUSES"
                  :key="option.value"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  :class="form.status === option.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'"
                  :disabled="isSubmitting"
                  @click="form.status = option.value"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full bg-current opacity-70"
                  />
                  <span>{{ option.label }}</span>
                </button>
              </div>
              <p class="mt-1.5 text-[10px] leading-4 text-slate-400">
                New partners are saved as Active or Inactive today. Draft, Under Review,
                Expired, and Terminated detail will be retained once the extended partner
                API is available.
              </p>
            </div>

            <div class="space-y-2.5">
              <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div class="flex items-center justify-between gap-2">
                  <p class="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <UIcon
                      name="i-lucide-briefcase"
                      class="h-3.5 w-3.5 text-slate-400"
                    />
                    Company Profile
                  </p>
                  <button
                    type="button"
                    class="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    @click="goToStep(0)"
                  >
                    Edit
                  </button>
                </div>
                <dl class="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                  <div class="flex items-baseline justify-between gap-3 sm:col-span-2">
                    <dt class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      Partner Name
                    </dt>
                    <dd class="text-xs font-semibold text-slate-800">
                      {{ form.partnerName.trim() || '—' }}
                    </dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      Category
                    </dt>
                    <dd class="text-xs font-semibold text-slate-700">
                      {{ categoryLabel }}
                    </dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      Status
                    </dt>
                    <dd class="text-xs font-semibold text-slate-700">
                      {{ statusLabel }}
                    </dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      Website
                    </dt>
                    <dd class="truncate text-xs text-slate-600">
                      {{ form.website.trim() || '—' }}
                    </dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      Headquarters
                    </dt>
                    <dd class="truncate text-xs text-slate-600">
                      {{ form.headquarters.trim() || '—' }}
                    </dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      Industry
                    </dt>
                    <dd class="truncate text-xs text-slate-600">
                      {{ form.industry.trim() || '—' }}
                    </dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      Business Focus
                    </dt>
                    <dd class="truncate text-xs text-slate-600">
                      {{ form.businessFocus.trim() || '—' }}
                    </dd>
                  </div>
                </dl>
                <p
                  v-if="form.description.trim()"
                  class="mt-2 border-t border-slate-200/70 pt-2 text-[11px] leading-5 text-slate-500"
                >
                  {{ form.description.trim() }}
                </p>
              </div>

              <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div class="flex items-center justify-between gap-2">
                  <p class="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <UIcon
                      name="i-lucide-sparkles"
                      class="h-3.5 w-3.5 text-slate-400"
                    />
                    Expertise & Capabilities
                  </p>
                  <button
                    type="button"
                    class="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    @click="goToStep(1)"
                  >
                    Edit
                  </button>
                </div>
                <div class="mt-2 space-y-2">
                  <div>
                    <p class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      Expertise Areas
                    </p>
                    <div
                      v-if="form.expertiseAreas.length"
                      class="mt-1 flex flex-wrap gap-1"
                    >
                      <span
                        v-for="area in form.expertiseAreas"
                        :key="area"
                        class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
                      >
                        {{ area }}
                      </span>
                    </div>
                    <p
                      v-else
                      class="mt-1 text-[11px] text-slate-400"
                    >
                      None provided
                    </p>
                  </div>
                  <div>
                    <p class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      Capabilities
                    </p>
                    <div
                      v-if="form.capabilities.length"
                      class="mt-1 flex flex-wrap gap-1"
                    >
                      <span
                        v-for="capability in form.capabilities"
                        :key="capability"
                        class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                      >
                        {{ capability }}
                      </span>
                    </div>
                    <p
                      v-else
                      class="mt-1 text-[11px] text-slate-400"
                    >
                      None provided
                    </p>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div class="flex items-center justify-between gap-2">
                  <p class="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <UIcon
                      name="i-lucide-scale"
                      class="h-3.5 w-3.5 text-slate-400"
                    />
                    Legal Documents
                  </p>
                  <button
                    type="button"
                    class="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    @click="goToStep(2)"
                  >
                    Edit
                  </button>
                </div>
                <div
                  v-if="form.legalDocuments.length"
                  class="mt-2 space-y-1.5"
                >
                  <div
                    v-for="(document, index) in form.legalDocuments"
                    :key="index"
                    class="flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5"
                  >
                    <UIcon
                      name="i-lucide-file-text"
                      class="h-3 w-3 shrink-0 text-slate-400"
                    />
                    <span class="text-[11px] font-semibold text-slate-700">
                      {{ document.documentName.trim() || 'Unnamed document' }}
                    </span>
                    <span class="text-[10px] font-medium text-slate-400">
                      {{ document.documentType }}
                    </span>
                    <span
                      v-if="document.documentNumber.trim()"
                      class="font-mono text-[10px] text-slate-400"
                    >
                      {{ document.documentNumber.trim() }}
                    </span>
                  </div>
                </div>
                <p
                  v-else
                  class="mt-1 text-[11px] text-slate-400"
                >
                  No legal documents provided
                </p>
              </div>
            </div>
          </div>
        </section>

        <div class="flex items-center justify-between gap-2.5">
          <button
            type="button"
            class="inline-flex h-8.5 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting || currentStep === 0"
            @click="previousStep"
          >
            <UIcon
              name="i-lucide-chevron-left"
              class="h-3.5 w-3.5"
            />
            <span>Back</span>
          </button>

          <div class="flex items-center gap-2.5">
            <button
              v-if="currentStep < STEPS.length - 1"
              type="button"
              class="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
              @click="nextStep"
            >
              <span>Next Step</span>
              <UIcon
                name="i-lucide-chevron-right"
                class="h-3.5 w-3.5"
              />
            </button>

            <button
              v-else
              type="submit"
              class="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
            >
              <UIcon
                v-if="isSubmitting"
                name="i-lucide-loader-2"
                class="h-3.5 w-3.5 animate-spin"
              />
              <UIcon
                v-else
                name="i-lucide-circle-check-big"
                class="h-3.5 w-3.5"
              />
              <span>
                {{ isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Partner' }}
              </span>
            </button>
          </div>
        </div>
      </form>
    </template>
  </div>
</template>
