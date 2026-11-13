<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { cmsControlClass, cmsControlStateClass } from '~/modules/cms/utils/cmsForm'
import { getTechTaskErrorMessage, techTaskApi } from '../../api/tech-task.api'
import { useTechTaskOptions } from '../../composables/useTechTaskOptions'
import type {
  TechTaskDetail,
  TechTaskFormErrors,
  TechTaskFormValues
} from '../../types/tech-task.types'
import TechTaskTechStackPicker from './TechTaskTechStackPicker.vue'

interface Props {
  editingId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'back' | 'saved'): void
}>()

const toast = useToast()

const isEditMode = computed(() => props.editingId !== null)

const detail = ref<TechTaskDetail | null>(null)
const isPreparing = ref(true)
const prepareError = ref('')
const isSubmitting = ref(false)

const {
  techStackOptions,
  businessUnitOptions,
  projectStatusOptions,
  isLoadingOptions,
  optionsError,
  ensureOptions,
  retryLoadOptions
} = useTechTaskOptions()

const createFormValues = (): TechTaskFormValues => ({
  projectCode: '',
  projectName: '',
  year: String(new Date().getFullYear()),
  businessUnitId: '',
  projectStatusId: '',
  valueBeforeTax: '',
  carryOverValue: '',
  startDate: '',
  endDate: '',
  opportunity: '',
  contractName: '',
  contractNumber: '',
  projectManager: '',
  accountManager: '',
  customerName: '',
  projectObjective: '',
  projectDescription: '',
  projectBackground: '',
  projectChallenges: '',
  projectSolution: '',
  isFeatured: false,
  techStackIds: []
})

const form = reactive<TechTaskFormValues>(createFormValues())
const errors = ref<TechTaskFormErrors>({})

const sameStacks = (first: string[], second: string[]): boolean => {
  if (first.length !== second.length) return false
  const sortedFirst = [...first].sort()
  const sortedSecond = [...second].sort()
  return sortedFirst.every((value, index) => value === sortedSecond[index])
}

const applyDetail = (source: TechTaskDetail) => {
  form.projectCode = source.projectCode
  form.projectName = source.projectName
  form.year = String(source.year)
  form.businessUnitId = source.businessUnit?.id ?? ''
  form.projectStatusId = source.projectStatus?.id ?? ''
  form.valueBeforeTax = source.valueBeforeTax ?? ''
  form.carryOverValue = source.carryOverValue ?? ''
  form.startDate = source.startDate
  form.endDate = source.endDate
  form.opportunity = source.opportunity ?? ''
  form.contractName = source.contractName ?? ''
  form.contractNumber = source.contractNumber ?? ''
  form.projectManager = source.projectManager ?? ''
  form.accountManager = source.accountManager ?? ''
  form.customerName = source.customerName ?? ''
  form.projectObjective = source.projectObjective ?? ''
  form.projectDescription = source.projectDescription ?? ''
  form.projectBackground = source.projectBackground ?? ''
  form.projectChallenges = source.projectChallenges ?? ''
  form.projectSolution = source.projectSolution ?? ''
  form.isFeatured = source.isFeatured
  form.techStackIds = [
    ...source.techStacks.frontend,
    ...source.techStacks.backend,
    ...source.techStacks.dataStorage
  ].map(stack => stack.id)
}

const prepareForm = async () => {
  isPreparing.value = true
  prepareError.value = ''

  try {
    ensureOptions()

    if (props.editingId) {
      const loaded = await techTaskApi.getDetail(props.editingId)
      detail.value = loaded
      applyDetail(loaded)
    }
  } catch (error) {
    prepareError.value = getTechTaskErrorMessage(error)
  } finally {
    isPreparing.value = false
  }
}

const validate = (): TechTaskFormValues | null => {
  const next: TechTaskFormErrors = {}
  const projectCode = form.projectCode.trim()
  const projectName = form.projectName.trim()
  const yearNumber = Number(form.year)
  const valueNumber = Number(form.valueBeforeTax)

  if (!projectCode) {
    next.projectCode = 'Project code is required.'
  } else if (projectCode.length > 100) {
    next.projectCode = 'Project code must be at most 100 characters.'
  }

  if (!projectName) {
    next.projectName = 'Project name is required.'
  } else if (projectName.length > 255) {
    next.projectName = 'Project name must be at most 255 characters.'
  }

  if (!form.year.trim() || !Number.isInteger(yearNumber) || yearNumber < 1900 || yearNumber > 2200) {
    next.year = 'Year must be a whole number between 1900 and 2200.'
  }

  if (!form.businessUnitId) {
    next.businessUnitId = 'Business unit is required.'
  }

  if (!form.projectStatusId) {
    next.projectStatusId = 'Project status is required.'
  }

  if (!form.valueBeforeTax.trim()) {
    next.valueBeforeTax = 'Project value is required.'
  } else if (!Number.isFinite(valueNumber) || valueNumber < 0) {
    next.valueBeforeTax = 'Project value must be a number of 0 or more.'
  } else if (!/^\d+(\.\d{1,2})?$/.test(form.valueBeforeTax.trim())) {
    next.valueBeforeTax = 'Project value accepts at most 2 decimal places.'
  }

  if (form.carryOverValue.trim()) {
    const carryNumber = Number(form.carryOverValue)
    if (!Number.isFinite(carryNumber) || carryNumber < 0) {
      next.carryOverValue = 'Carry over value must be a number of 0 or more.'
    } else if (!/^\d+(\.\d{1,2})?$/.test(form.carryOverValue.trim())) {
      next.carryOverValue = 'Carry over value accepts at most 2 decimal places.'
    }
  }

  if (!form.startDate) {
    next.startDate = 'Start date is required.'
  }
  if (!form.endDate) {
    next.endDate = 'End date is required.'
  }
  if (form.startDate && form.endDate && form.endDate <= form.startDate) {
    next.endDate = 'End date must be after start date.'
  }

  if (!isEditMode.value && !form.customerName.trim()) {
    next.customerName = 'Customer name is required.'
  } else if (form.customerName.trim().length > 255) {
    next.customerName = 'Customer name must be at most 255 characters.'
  }

  if (form.opportunity.trim().length > 255) {
    next.opportunity = 'Opportunity must be at most 255 characters.'
  }
  if (form.contractName.trim().length > 255) {
    next.contractName = 'Contract name must be at most 255 characters.'
  }
  if (form.contractNumber.trim().length > 150) {
    next.contractNumber = 'Contract number must be at most 150 characters.'
  }
  if (form.projectManager.trim().length > 150) {
    next.projectManager = 'Project manager must be at most 150 characters.'
  }
  if (form.accountManager.trim().length > 150) {
    next.accountManager = 'Account manager must be at most 150 characters.'
  }

  errors.value = next
  if (Object.keys(next).length > 0) return null

  return {
    ...form,
    projectCode,
    projectName,
    customerName: form.customerName.trim()
  }
}

const handleSubmit = async () => {
  const values = validate()

  if (!values) return

  isSubmitting.value = true

  try {
    if (isEditMode.value && props.editingId && detail.value) {
      const changes = techTaskApi.getUpdateChanges(detail.value, values)
      const stacksChanged = !sameStacks(
        values.techStackIds,
        [
          ...detail.value.techStacks.frontend,
          ...detail.value.techStacks.backend,
          ...detail.value.techStacks.dataStorage
        ].map(stack => stack.id)
      )

      if (Object.keys(changes).length === 0 && !stacksChanged) {
        toast.add({
          title: 'No changes to save',
          description: 'Nothing was modified on this tech task.',
          color: 'warning'
        })
        return
      }

      if (Object.keys(changes).length > 0) {
        await techTaskApi.update(props.editingId, detail.value, values)
      }
      if (stacksChanged) {
        await techTaskApi.updateTechStacks(props.editingId, values.techStackIds)
      }

      toast.add({
        title: 'Tech task updated',
        description: `"${values.projectName}" has been updated successfully.`,
        color: 'success'
      })
    } else {
      await techTaskApi.create(values)

      toast.add({
        title: 'Tech task added',
        description: `"${values.projectName}" has been registered as a new technical work.`,
        color: 'success'
      })
    }

    emit('saved')
  } catch (error) {
    toast.add({
      title: isEditMode.value ? 'Failed to update tech task' : 'Failed to add tech task',
      description: getTechTaskErrorMessage(error),
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

    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
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
          <span>Tech Task</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="h-3 w-3"
          />
          <span class="font-semibold text-slate-700">
            {{ isEditMode ? 'Edit' : 'Add' }}
          </span>
        </nav>
        <h1 class="mt-2 text-xl font-bold leading-7 tracking-tight text-slate-900">
          {{ isEditMode ? 'Edit Tech Task' : 'Add Tech Task' }}
        </h1>
        <p class="mt-0.5 max-w-2xl text-xs leading-5 text-slate-500">
          {{ isEditMode
            ? 'Update the technical work details, requirements, solutions, and capabilities.'
            : 'Register a new technical work tied to a company project. Fields marked with * are required.' }}
        </p>
      </div>
    </div>

    <div
      v-if="optionsError"
      class="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[11px] leading-4 text-amber-700"
    >
      <UIcon
        name="i-lucide-circle-alert"
        class="mt-0.5 h-4 w-4 shrink-0"
      />
      <div class="flex-1">
        <p class="font-semibold">
          Form options failed to load
        </p>
        <p class="mt-0.5">
          {{ optionsError }}
        </p>
      </div>
      <button
        type="button"
        class="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-100 cursor-pointer"
        @click="retryLoadOptions"
      >
        <UIcon
          name="i-lucide-rotate-ccw"
          class="h-3 w-3"
        />
        <span>Retry</span>
      </button>
    </div>

    <div
      v-if="isPreparing"
      class="space-y-4"
    >
      <div class="h-40 animate-pulse rounded-xl bg-slate-100" />
      <div class="h-56 animate-pulse rounded-xl bg-slate-100" />
      <div class="h-64 animate-pulse rounded-xl bg-slate-100" />
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

    <form
      v-else
      novalidate
      class="space-y-4"
      @submit.prevent="handleSubmit"
    >
      <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UIcon
              name="i-lucide-briefcase"
              class="h-3.5 w-3.5"
            />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-xs font-bold tracking-tight text-slate-900">
              Project Identity
            </h3>
            <p class="mt-0.5 text-[10px] text-slate-400">
              The project this technical work belongs to
            </p>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              for="tech-task-code"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Project Code <span class="text-rose-500">*</span>
            </label>
            <input
              id="tech-task-code"
              v-model="form.projectCode"
              type="text"
              placeholder="e.g. PRJ-2026-001"
              autocomplete="off"
              class="font-mono"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.projectCode)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.projectCode"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.projectCode }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-name"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Project Name <span class="text-rose-500">*</span>
            </label>
            <input
              id="tech-task-name"
              v-model="form.projectName"
              type="text"
              placeholder="e.g. Digital Banking Transformation"
              autocomplete="off"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.projectName)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.projectName"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.projectName }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-year"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Year <span class="text-rose-500">*</span>
            </label>
            <input
              id="tech-task-year"
              v-model="form.year"
              type="number"
              min="1900"
              max="2200"
              step="1"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.year)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.year"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.year }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-business-unit"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Business Unit <span class="text-rose-500">*</span>
            </label>
            <select
              id="tech-task-business-unit"
              v-model="form.businessUnitId"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.businessUnitId)]"
              :disabled="isSubmitting || isLoadingOptions"
            >
              <option value="">
                Select business unit...
              </option>
              <option
                v-for="option in businessUnitOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.name }}
              </option>
            </select>
            <p
              v-if="errors.businessUnitId"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.businessUnitId }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-status"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Work Status <span class="text-rose-500">*</span>
            </label>
            <select
              id="tech-task-status"
              v-model="form.projectStatusId"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.projectStatusId)]"
              :disabled="isSubmitting || isLoadingOptions"
            >
              <option value="">
                Select status...
              </option>
              <option
                v-for="option in projectStatusOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.name }}
              </option>
            </select>
            <p
              v-if="errors.projectStatusId"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.projectStatusId }}
            </p>
          </div>

          <div class="flex items-end">
            <label
              class="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors"
              :class="form.isFeatured
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-slate-200 bg-white text-slate-600'"
            >
              <UIcon
                name="i-lucide-sparkles"
                class="h-3.5 w-3.5"
              />
              <input
                v-model="form.isFeatured"
                type="checkbox"
                class="sr-only"
                :disabled="isSubmitting"
              >
              <span>{{ form.isFeatured ? 'Featured project' : 'Mark as featured' }}</span>
            </label>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UIcon
              name="i-lucide-calendar-range"
              class="h-3.5 w-3.5"
            />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-xs font-bold tracking-tight text-slate-900">
              Timeline & Value
            </h3>
            <p class="mt-0.5 text-[10px] text-slate-400">
              Delivery window and commercial value of the work
            </p>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              for="tech-task-start"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Start Date <span class="text-rose-500">*</span>
            </label>
            <input
              id="tech-task-start"
              v-model="form.startDate"
              type="date"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.startDate)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.startDate"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.startDate }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-end"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              End Date <span class="text-rose-500">*</span>
            </label>
            <input
              id="tech-task-end"
              v-model="form.endDate"
              type="date"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.endDate)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.endDate"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.endDate }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-value"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Project Value (before tax) <span class="text-rose-500">*</span>
            </label>
            <input
              id="tech-task-value"
              v-model="form.valueBeforeTax"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 150000000"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.valueBeforeTax)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.valueBeforeTax"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.valueBeforeTax }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-carry-over"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Carry Over Value
            </label>
            <input
              id="tech-task-carry-over"
              v-model="form.carryOverValue"
              type="number"
              min="0"
              step="0.01"
              placeholder="Optional"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.carryOverValue)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.carryOverValue"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.carryOverValue }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-opportunity"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Opportunity
            </label>
            <input
              id="tech-task-opportunity"
              v-model="form.opportunity"
              type="text"
              placeholder="Optional"
              autocomplete="off"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.opportunity)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.opportunity"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.opportunity }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-contract-name"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Contract Name
            </label>
            <input
              id="tech-task-contract-name"
              v-model="form.contractName"
              type="text"
              placeholder="Optional"
              autocomplete="off"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.contractName)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.contractName"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.contractName }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-contract-number"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Contract Number
            </label>
            <input
              id="tech-task-contract-number"
              v-model="form.contractNumber"
              type="text"
              placeholder="Optional"
              autocomplete="off"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.contractNumber)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.contractNumber"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.contractNumber }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-pm"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Project Manager
            </label>
            <input
              id="tech-task-pm"
              v-model="form.projectManager"
              type="text"
              placeholder="Optional"
              autocomplete="off"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.projectManager)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.projectManager"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.projectManager }}
            </p>
          </div>

          <div>
            <label
              for="tech-task-am"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Account Manager
            </label>
            <input
              id="tech-task-am"
              v-model="form.accountManager"
              type="text"
              placeholder="Optional"
              autocomplete="off"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.accountManager)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.accountManager"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.accountManager }}
            </p>
          </div>
        </div>
      </section>

      <section
        v-if="!isEditMode"
        class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs"
      >
        <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UIcon
              name="i-lucide-user"
              class="h-3.5 w-3.5"
            />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-xs font-bold tracking-tight text-slate-900">
              Customer
            </h3>
            <p class="mt-0.5 text-[10px] text-slate-400">
              Customer of the related project
            </p>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label
              for="tech-task-customer"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Customer Name <span class="text-rose-500">*</span>
            </label>
            <input
              id="tech-task-customer"
              v-model="form.customerName"
              type="text"
              placeholder="e.g. ABC Bank"
              autocomplete="off"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.customerName)]"
              :disabled="isSubmitting"
            >
            <p
              v-if="errors.customerName"
              class="mt-1 text-[10px] font-medium text-rose-600"
            >
              {{ errors.customerName }}
            </p>
            <p
              v-else
              class="mt-1 text-[10px] text-slate-400"
            >
              Detailed customer attributes are managed through the portfolio module.
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UIcon
              name="i-lucide-clipboard-list"
              class="h-3.5 w-3.5"
            />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-xs font-bold tracking-tight text-slate-900">
              Technical Work
            </h3>
            <p class="mt-0.5 text-[10px] text-slate-400">
              Requirements, solutions, and narrative of the engagement
            </p>
          </div>
        </div>

        <div class="mt-3 space-y-3">
          <div>
            <label
              for="tech-task-objective"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Objective
            </label>
            <textarea
              id="tech-task-objective"
              v-model="form.projectObjective"
              rows="2"
              placeholder="Goal this technical work delivers..."
              class="resize-none"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.projectObjective)]"
              :disabled="isSubmitting"
            />
          </div>

          <div>
            <label
              for="tech-task-description"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Work Description
            </label>
            <textarea
              id="tech-task-description"
              v-model="form.projectDescription"
              rows="3"
              placeholder="Scope of the technical work performed..."
              class="resize-none"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.projectDescription)]"
              :disabled="isSubmitting"
            />
          </div>

          <div>
            <label
              for="tech-task-background"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Background
            </label>
            <textarea
              id="tech-task-background"
              v-model="form.projectBackground"
              rows="3"
              placeholder="Context behind the engagement..."
              class="resize-none"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.projectBackground)]"
              :disabled="isSubmitting"
            />
          </div>

          <div>
            <label
              for="tech-task-challenges"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Technical Requirements
            </label>
            <textarea
              id="tech-task-challenges"
              v-model="form.projectChallenges"
              rows="3"
              placeholder="Needs and challenges to solve..."
              class="resize-none"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.projectChallenges)]"
              :disabled="isSubmitting"
            />
          </div>

          <div>
            <label
              for="tech-task-solution"
              class="mb-1.5 block text-[11px] font-semibold text-slate-700"
            >
              Technical Solution
            </label>
            <textarea
              id="tech-task-solution"
              v-model="form.projectSolution"
              rows="3"
              placeholder="Approach implemented to address the requirements..."
              class="resize-none"
              :class="[cmsControlClass, cmsControlStateClass(!!errors.projectSolution)]"
              :disabled="isSubmitting"
            />
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UIcon
              name="i-lucide-cpu"
              class="h-3.5 w-3.5"
            />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-xs font-bold tracking-tight text-slate-900">
              Technical Capabilities
            </h3>
            <p class="mt-0.5 text-[10px] text-slate-400">
              Tech stacks applied on this work
            </p>
          </div>
        </div>

        <div class="mt-3">
          <TechTaskTechStackPicker
            v-model="form.techStackIds"
            :options="techStackOptions"
            :disabled="isSubmitting || isLoadingOptions"
          />
        </div>
      </section>

      <div class="flex items-center justify-end gap-2.5">
        <button
          type="button"
          class="inline-flex h-8.5 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
          @click="emit('back')"
        >
          Cancel
        </button>

        <button
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
            {{ isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Tech Task' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>
