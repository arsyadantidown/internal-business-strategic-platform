<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import CmsFormSection from '~/modules/cms/components/cms-form/CmsFormSection.vue'
import CmsFormField from '~/modules/cms/components/cms-form/CmsFormField.vue'
import { cmsControlClass, cmsControlStateClass } from '~/modules/cms/utils/cmsForm'
import type {
  MasterDataCategory,
  MasterDataFormErrors,
  MasterDataFormValues,
  MasterDataItem
} from '../../types/master-data.types'

interface Props {
  isOpen: boolean
  category: MasterDataCategory
  editingItem: MasterDataItem | null
  isSaving: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', values: MasterDataFormValues): void
}>()

interface MasterDataFormState {
  code: string
  name: string
  description: string
  sortOrder: string
  isActive: boolean
}

const isEditMode = computed(() => props.editingItem !== null)

const form = reactive<MasterDataFormState>({
  code: '',
  name: '',
  description: '',
  sortOrder: '',
  isActive: true
})

const errors = ref<MasterDataFormErrors>({})

const validate = (): MasterDataFormValues | null => {
  const next: MasterDataFormErrors = {}
  const name = form.name.trim()

  if (!isEditMode.value) {
    const code = form.code.trim()

    if (!code) {
      next.code = 'Code is required.'
    } else if (code.length > 50) {
      next.code = 'Code must be at most 50 characters.'
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(code)) {
      next.code = 'Code must start with a letter and use only uppercase letters, numbers, and underscores.'
    }
  }

  if (!name) {
    next.name = 'Name is required.'
  } else if (name.length > 150) {
    next.name = 'Name must be at most 150 characters.'
  }

  if (form.sortOrder !== '') {
    const parsed = Number(form.sortOrder)

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 32767) {
      next.sortOrder = 'Sort order must be a whole number between 1 and 32767.'
    }
  }

  errors.value = next

  if (Object.keys(next).length > 0) return null

  return {
    code: isEditMode.value ? '' : form.code.trim(),
    name,
    description: form.description.trim() || '',
    sortOrder: form.sortOrder === '' ? null : Number(form.sortOrder),
    isActive: isEditMode.value ? form.isActive : true
  }
}

const handleSubmit = () => {
  const values = validate()

  if (values) emit('submit', values)
}

const closeModal = () => {
  if (props.isSaving) return
  emit('close')
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) return

    errors.value = {}

    if (props.editingItem) {
      form.code = props.editingItem.code
      form.name = props.editingItem.name
      form.description = props.editingItem.description ?? ''
      form.sortOrder = props.editingItem.sortOrder === null ? '' : String(props.editingItem.sortOrder)
      form.isActive = props.editingItem.isActive
    } else {
      form.code = ''
      form.name = ''
      form.description = ''
      form.sortOrder = ''
      form.isActive = true
    }
  }
)
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
    @click.self="closeModal"
  >
    <div class="w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
      <header class="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
        <div class="flex items-start gap-2.5">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UIcon
              :name="category.icon"
              class="h-4 w-4"
            />
          </div>
          <div>
            <h2 class="text-sm font-bold tracking-tight text-slate-900">
              {{ isEditMode ? 'Edit' : 'Add' }} {{ category.singular }}
            </h2>
            <p class="mt-0.5 text-[11px] text-slate-500">
              {{ isEditMode ? 'Update the details of this entry.' : `Create a new ${category.singular.toLowerCase()} entry.` }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          title="Close"
          @click="closeModal"
        >
          <UIcon
            name="i-lucide-x"
            class="h-4 w-4"
          />
        </button>
      </header>

      <form
        novalidate
        @submit.prevent="handleSubmit"
      >
        <div class="max-h-[60vh] overflow-y-auto p-5">
          <CmsFormSection
            :title="`${category.singular} Details`"
            :description="`Fields marked with * are required. Codes are permanent once created.`"
            :icon="category.icon"
          >
            <CmsFormField
              label="Code"
              html-for="master-data-code"
              :required="!isEditMode"
              :error="errors.code"
              hint="Uppercase letters, numbers, and underscores. Cannot be changed later."
            >
              <input
                id="master-data-code"
                v-model="form.code"
                type="text"
                placeholder="e.g. MICRO_SMALL"
                autocomplete="off"
                spellcheck="false"
                class="font-mono uppercase"
                :class="[cmsControlClass, cmsControlStateClass(!!errors.code)]"
                :disabled="isEditMode || isSaving"
                @input="form.code = form.code.toUpperCase()"
              >
            </CmsFormField>

            <CmsFormField
              label="Name"
              html-for="master-data-name"
              required
              :error="errors.name"
              :hint="`Displayed name of the ${category.singular.toLowerCase()}.`"
            >
              <input
                id="master-data-name"
                v-model="form.name"
                type="text"
                placeholder="e.g. Micro & Small"
                autocomplete="off"
                :class="[cmsControlClass, cmsControlStateClass(!!errors.name)]"
                :disabled="isSaving"
              >
            </CmsFormField>

            <CmsFormField
              label="Sort Order"
              html-for="master-data-sort-order"
              :error="errors.sortOrder"
              hint="Optional. Lower numbers appear first (1-32767)."
            >
              <input
                id="master-data-sort-order"
                v-model="form.sortOrder"
                type="number"
                min="1"
                max="32767"
                step="1"
                placeholder="e.g. 10"
                :class="[cmsControlClass, cmsControlStateClass(!!errors.sortOrder)]"
                :disabled="isSaving"
              >
            </CmsFormField>

            <CmsFormField
              label="Status"
              html-for="master-data-active"
              hint="Inactive entries are hidden from selection forms."
            >
              <label
                class="flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-medium text-slate-700 transition-colors"
                :class="form.isActive
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600'"
              >
                <span
                  class="h-2 w-2 rounded-full"
                  :class="form.isActive ? 'bg-emerald-500' : 'bg-slate-400'"
                />
                <input
                  id="master-data-active"
                  v-model="form.isActive"
                  type="checkbox"
                  class="sr-only"
                  :disabled="isSaving"
                >
                <span>{{ form.isActive ? 'Active' : 'Inactive' }}</span>
              </label>
            </CmsFormField>

            <CmsFormField
              label="Description"
              html-for="master-data-description"
              :error="errors.description"
              full
              hint="Optional context shown to administrators."
            >
              <textarea
                id="master-data-description"
                v-model="form.description"
                rows="3"
                placeholder="Describe what this entry represents..."
                class="resize-none"
                :class="[cmsControlClass, cmsControlStateClass(!!errors.description)]"
                :disabled="isSaving"
              />
            </CmsFormField>
          </CmsFormSection>
        </div>

        <footer class="flex items-center justify-end gap-2.5 border-t border-slate-100 p-5">
          <button
            type="button"
            class="inline-flex h-8.5 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSaving"
            @click="closeModal"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSaving"
          >
            <UIcon
              v-if="isSaving"
              name="i-lucide-loader-2"
              class="h-3.5 w-3.5 animate-spin"
            />
            <UIcon
              v-else
              name="i-lucide-circle-check-big"
              class="h-3.5 w-3.5"
            />
            <span>{{ isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : `Add ${category.singular}` }}</span>
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>
