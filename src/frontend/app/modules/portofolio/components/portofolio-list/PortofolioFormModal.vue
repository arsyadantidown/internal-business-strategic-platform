<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProjectItem, ProjectStatus } from '../../types/types'
import {
  portfolioBackendStackOptions,
  portfolioBusinessUnitOptions,
  portfolioCompanySizeOptions,
  portfolioCustomerTypeOptions,
  portfolioDatabaseOptions,
  portfolioFrontendStackOptions,
  portfolioIndustryOptions,
  portfolioLegalStructureOptions,
  portfolioProductOptions,
  portfolioProductStatusOptions,
  portfolioProjectStatusOptions
} from '../../data/portfolioOptions'

interface Props {
  isOpen: boolean
  project: ProjectItem | null
}

type FormState = {
  title: string
  client: string
  description: string
  image: string
  industry: string
  companySize: string
  legalStructure: string
  businessUnit: string
  product: string
  customerType: string
  productStatus: string
  status: ProjectStatus
  frontendStack: string
  backendStack: string
  database: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', project: ProjectItem): void
}>()

const fallbackImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop'

const emptyForm = (): FormState => ({
  title: '',
  client: '',
  description: '',
  image: '',
  industry: '',
  companySize: '',
  legalStructure: '',
  businessUnit: '',
  product: '',
  customerType: '',
  productStatus: '',
  status: 'On Going',
  frontendStack: '',
  backendStack: '',
  database: ''
})

const form = ref<FormState>(emptyForm())
const errors = ref<FormErrors>({})

const isEditing = computed(() => Boolean(props.project))
const modalTitle = computed(() => isEditing.value ? 'Edit Portfolio' : 'Add Portfolio')

const populateForm = () => {
  if (!props.project) {
    form.value = emptyForm()
    errors.value = {}
    return
  }

  form.value = {
    title: props.project.title,
    client: props.project.client,
    description: props.project.description,
    image: props.project.image,
    industry: props.project.industry,
    companySize: props.project.companySize ?? '',
    legalStructure: props.project.legalStructure ?? '',
    businessUnit: props.project.businessUnit ?? '',
    product: props.project.product ?? '',
    customerType: props.project.customerType ?? '',
    productStatus: props.project.productStatus ?? '',
    status: props.project.status,
    frontendStack: props.project.frontendStack ?? '',
    backendStack: props.project.backendStack ?? '',
    database: props.project.database ?? ''
  }
  errors.value = {}
}

const clearError = (field: keyof FormState) => {
  if (!errors.value[field]) return

  const nextErrors = { ...errors.value }
  Reflect.deleteProperty(nextErrors, field)
  errors.value = nextErrors
}

const validate = () => {
  const nextErrors: FormErrors = {}

  if (form.value.title.trim().length < 3) {
    nextErrors.title = 'Project name must be at least 3 characters.'
  }
  if (!form.value.client.trim()) {
    nextErrors.client = 'Client is required.'
  }
  if (form.value.description.trim().length < 10) {
    nextErrors.description = 'Description must be at least 10 characters.'
  }

  const requiredFields: (keyof FormState)[] = [
    'industry',
    'companySize',
    'legalStructure',
    'businessUnit',
    'product',
    'customerType',
    'productStatus',
    'frontendStack',
    'backendStack',
    'database'
  ]

  requiredFields.forEach((field) => {
    if (!form.value[field]) {
      nextErrors[field] = 'Please select an option.'
    }
  })

  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

const handleSubmit = () => {
  if (!validate()) return

  const stacks = [form.value.frontendStack, form.value.backendStack, form.value.database]
    .filter((item): item is string => Boolean(item))

  emit('save', {
    id: props.project?.id ?? `local-${Date.now()}`,
    title: form.value.title.trim(),
    client: form.value.client.trim(),
    description: form.value.description.trim(),
    image: form.value.image.trim() || fallbackImage,
    industry: form.value.industry,
    companySize: form.value.companySize,
    legalStructure: form.value.legalStructure,
    businessUnit: form.value.businessUnit,
    product: form.value.product,
    customerType: form.value.customerType,
    productStatus: form.value.productStatus,
    status: form.value.status,
    frontendStack: form.value.frontendStack,
    backendStack: form.value.backendStack,
    database: form.value.database,
    technologies: stacks,
    year: props.project?.year ?? String(new Date().getFullYear()),
    updatedAt: 'Just now'
  })
}

watch(
  [() => props.isOpen, () => props.project],
  ([isOpen]) => {
    if (isOpen) populateForm()
  },
  { immediate: true }
)

const inputClass = 'h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const textareaClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 py-8 font-sans backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
      <div class="flex items-start justify-between border-b border-slate-100 px-6 py-4">
        <div class="flex items-start gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UIcon
              :name="isEditing ? 'i-lucide-pencil' : 'i-lucide-folder-plus'"
              class="h-4 w-4"
            />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Portfolio Directory
            </p>
            <h2 class="mt-0.5 text-sm font-bold leading-5 tracking-tight text-slate-900">
              {{ modalTitle }}
            </h2>
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

      <form @submit.prevent="handleSubmit">
        <div class="max-h-[72vh] space-y-5 overflow-y-auto px-6 py-5">
          <section class="space-y-3">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
              <UIcon
                name="i-lucide-folder-open"
                class="h-4 w-4 text-blue-600"
              />
              <h3 class="text-xs font-bold text-slate-900">
                Project Information
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Project Name</span>
                <input
                  id="portfolio-title"
                  v-model="form.title"
                  :class="inputClass"
                  placeholder="Enter project name"
                  @input="clearError('title')"
                >
                <span
                  v-if="errors.title"
                  class="block text-[10px] text-rose-600"
                >{{ errors.title }}</span>
              </label>

              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Client</span>
                <input
                  id="portfolio-client"
                  v-model="form.client"
                  :class="inputClass"
                  placeholder="Enter client name"
                  @input="clearError('client')"
                >
                <span
                  v-if="errors.client"
                  class="block text-[10px] text-rose-600"
                >{{ errors.client }}</span>
              </label>

              <label class="space-y-1.5 sm:col-span-2">
                <span class="text-[11px] font-semibold text-slate-600">Description</span>
                <textarea
                  id="portfolio-description"
                  v-model="form.description"
                  rows="3"
                  :class="textareaClass"
                  placeholder="Describe the portfolio project"
                  @input="clearError('description')"
                />
                <span
                  v-if="errors.description"
                  class="block text-[10px] text-rose-600"
                >{{ errors.description }}</span>
              </label>

              <label class="space-y-1.5 sm:col-span-2">
                <span class="text-[11px] font-semibold text-slate-600">Cover Image URL</span>
                <input
                  id="portfolio-image"
                  v-model="form.image"
                  :class="inputClass"
                  placeholder="https://example.com/image.jpg"
                >
              </label>
            </div>
          </section>

          <section class="space-y-3">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
              <UIcon
                name="i-lucide-building-2"
                class="h-4 w-4 text-blue-600"
              />
              <h3 class="text-xs font-bold text-slate-900">
                Business Profile
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Industry</span>
                <select
                  id="portfolio-industry"
                  v-model="form.industry"
                  :class="inputClass"
                  @change="clearError('industry')"
                >
                  <option
                    value=""
                    disabled
                  >Select industry</option>
                  <option
                    v-for="option in portfolioIndustryOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span
                  v-if="errors.industry"
                  class="block text-[10px] text-rose-600"
                >{{ errors.industry }}</span>
              </label>

              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Company Size</span>
                <select
                  id="portfolio-company-size"
                  v-model="form.companySize"
                  :class="inputClass"
                  @change="clearError('companySize')"
                >
                  <option
                    value=""
                    disabled
                  >Select company size</option>
                  <option
                    v-for="option in portfolioCompanySizeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span
                  v-if="errors.companySize"
                  class="block text-[10px] text-rose-600"
                >{{ errors.companySize }}</span>
              </label>

              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Legal Structure</span>
                <select
                  id="portfolio-legal-structure"
                  v-model="form.legalStructure"
                  :class="inputClass"
                  @change="clearError('legalStructure')"
                >
                  <option
                    value=""
                    disabled
                  >Select legal structure</option>
                  <option
                    v-for="option in portfolioLegalStructureOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span
                  v-if="errors.legalStructure"
                  class="block text-[10px] text-rose-600"
                >{{ errors.legalStructure }}</span>
              </label>

              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Business Unit</span>
                <select
                  id="portfolio-business-unit"
                  v-model="form.businessUnit"
                  :class="inputClass"
                  @change="clearError('businessUnit')"
                >
                  <option
                    value=""
                    disabled
                  >Select business unit</option>
                  <option
                    v-for="option in portfolioBusinessUnitOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span
                  v-if="errors.businessUnit"
                  class="block text-[10px] text-rose-600"
                >{{ errors.businessUnit }}</span>
              </label>

              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Product</span>
                <select
                  id="portfolio-product"
                  v-model="form.product"
                  :class="inputClass"
                  @change="clearError('product')"
                >
                  <option
                    value=""
                    disabled
                  >Select product</option>
                  <option
                    v-for="option in portfolioProductOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span
                  v-if="errors.product"
                  class="block text-[10px] text-rose-600"
                >{{ errors.product }}</span>
              </label>

              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Customer Type</span>
                <select
                  id="portfolio-customer-type"
                  v-model="form.customerType"
                  :class="inputClass"
                  @change="clearError('customerType')"
                >
                  <option
                    value=""
                    disabled
                  >Select customer type</option>
                  <option
                    v-for="option in portfolioCustomerTypeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span
                  v-if="errors.customerType"
                  class="block text-[10px] text-rose-600"
                >{{ errors.customerType }}</span>
              </label>

              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Product Status</span>
                <select
                  id="portfolio-product-status"
                  v-model="form.productStatus"
                  :class="inputClass"
                  @change="clearError('productStatus')"
                >
                  <option
                    value=""
                    disabled
                  >Select product status</option>
                  <option
                    v-for="option in portfolioProductStatusOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span
                  v-if="errors.productStatus"
                  class="block text-[10px] text-rose-600"
                >{{ errors.productStatus }}</span>
              </label>

              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Project Status</span>
                <select
                  id="portfolio-project-status"
                  v-model="form.status"
                  :class="inputClass"
                  @change="clearError('status')"
                >
                  <option
                    v-for="option in portfolioProjectStatusOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </div>
          </section>

          <section class="space-y-3">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
              <UIcon
                name="i-lucide-layers-3"
                class="h-4 w-4 text-blue-600"
              />
              <h3 class="text-xs font-bold text-slate-900">
                Technology Stack
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Frontend Stack</span>
                <select
                  id="portfolio-frontend-stack"
                  v-model="form.frontendStack"
                  :class="inputClass"
                  @change="clearError('frontendStack')"
                >
                  <option
                    value=""
                    disabled
                  >Select frontend</option>
                  <option
                    v-for="option in portfolioFrontendStackOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span
                  v-if="errors.frontendStack"
                  class="block text-[10px] text-rose-600"
                >{{ errors.frontendStack }}</span>
              </label>

              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Backend Stack</span>
                <select
                  id="portfolio-backend-stack"
                  v-model="form.backendStack"
                  :class="inputClass"
                  @change="clearError('backendStack')"
                >
                  <option
                    value=""
                    disabled
                  >Select backend</option>
                  <option
                    v-for="option in portfolioBackendStackOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span
                  v-if="errors.backendStack"
                  class="block text-[10px] text-rose-600"
                >{{ errors.backendStack }}</span>
              </label>

              <label class="space-y-1.5">
                <span class="text-[11px] font-semibold text-slate-600">Database</span>
                <select
                  id="portfolio-database"
                  v-model="form.database"
                  :class="inputClass"
                  @change="clearError('database')"
                >
                  <option
                    value=""
                    disabled
                  >Select database</option>
                  <option
                    v-for="option in portfolioDatabaseOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span
                  v-if="errors.database"
                  class="block text-[10px] text-rose-600"
                >{{ errors.database }}</span>
              </label>
            </div>
          </section>
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            class="inline-flex h-9 min-w-24 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="inline-flex h-9 min-w-28 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
          >
            <UIcon
              name="i-lucide-save"
              class="h-3.5 w-3.5"
            />
            {{ isEditing ? 'Save Changes' : 'Add Portfolio' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
