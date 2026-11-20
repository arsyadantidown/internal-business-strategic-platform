<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import CmsFormSection from '~/modules/cms/components/cms-form/CmsFormSection.vue'
import CmsFormField from '~/modules/cms/components/cms-form/CmsFormField.vue'
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
}

const isEditMode = computed(() => props.editingItem !== null)
const isCompanySize = computed(() => props.category.type === 'company-sizes')

const form = reactive<MasterDataFormState>({
  code: '',
  name: '',
  description: ''
})

const errors = ref<MasterDataFormErrors>({})

// Styling input/control dengan tinggi proporsional (h-10 / 40px), padding px-3.5, dan rounded-lg (8px)
const controlBaseClass =
  'h-10 w-full rounded-lg border bg-white px-3.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

const textareaBaseClass =
  'w-full rounded-lg border bg-white p-3 text-xs text-slate-800 placeholder-slate-400 shadow-2xs transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

const controlStateClass = (hasError: boolean) =>
  hasError
    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'

/**
 * Logika auto-generate code dari name saat create:
 * 1. Jika category adalah Company Size:
 *    Cek apakah mengandung pola Tier dan angka (misal "Tier 7 : bla bla bla" atau "Tier 7") -> "TIER_7"
 *    Jika tidak cocok pola tier, fallback ke slug CAPITAL_UNDERSCORE.
 * 2. Kategori lainnya:
 *    Mengubah spasi/simbol menjadi capital underscore (misal "nama saya" -> "NAMA_SAYA").
 */
const generateCodeFromName = (nameStr: string): string => {
  const trimmed = nameStr.trim()
  if (!trimmed) return ''

  if (isCompanySize.value) {
    const tierMatch = trimmed.match(/tier\s*(\d+)/i)
    if (tierMatch && tierMatch[1]) {
      return `TIER_${tierMatch[1]}`
    }
  }

  // Standar: ubah non-alfanumerik menjadi underscore, bersihkan ganda underscore, uppercase
  return trimmed
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
    .slice(0, 50)
}

// Watch perubahan form.name untuk mengupdate form.code otomatis baik saat mode ADD maupun EDIT
watch(
  () => form.name,
  (newName) => {
    form.code = generateCodeFromName(newName)
  }
)

const validate = (): MasterDataFormValues | null => {
  const next: MasterDataFormErrors = {}
  const name = form.name.trim()
  const code = form.code.trim()

  if (!name) {
    next.name = 'Name is required.'
  } else if (name.length > 150) {
    next.name = 'Name must be at most 150 characters.'
  }

  if (!isEditMode.value) {
    if (!code) {
      next.code = 'Code is required.'
    } else if (code.length > 50) {
      next.code = 'Code must be at most 50 characters.'
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(code)) {
      next.code = 'Code must start with a letter and use only uppercase letters, numbers, and underscores.'
    }
  }

  errors.value = next

  if (Object.keys(next).length > 0) return null

  const payload: MasterDataFormValues = {
    code: isEditMode.value ? (props.editingItem?.code ?? '') : code,
    name,
    sortOrder: props.editingItem?.sortOrder ?? null,
    isActive: props.editingItem?.isActive ?? true
  }

  // Kirim description jika Company Size
  if (isCompanySize.value) {
    payload.description = form.description.trim()
  } else if (props.editingItem?.description) {
    payload.description = props.editingItem.description
  }

  return payload
}

const handleSubmit = () => {
  if (props.isSaving) return
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

    if (props.editingItem) {
      form.code = props.editingItem.code
      form.name = props.editingItem.name
      form.description = props.editingItem.description ?? ''
    } else {
      form.code = ''
      form.name = ''
      form.description = ''
    }

    errors.value = {}
  },
  { immediate: true }
)
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm"
    @click.self="closeModal"
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white shadow-2xl transition-all"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'modal-title-' + category.type"
    >
      <header class="flex items-center justify-between border-b border-slate-100 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UIcon
              :name="category.icon"
              class="h-5 w-5"
            />
          </div>
          <div>
            <h2
              :id="'modal-title-' + category.type"
              class="text-sm font-bold tracking-tight text-slate-900 sm:text-base"
            >
              {{ isEditMode ? `Edit ${category.singular}` : `Add New ${category.singular}` }}
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              {{
                isEditMode
                  ? `Update information for this ${category.singular.toLowerCase()}.`
                  : `Create a new entry in ${category.label}.`
              }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
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
        <div class="p-5">
          <CmsFormSection
            :title="`${category.singular} Details`"
            :description="isEditMode ? 'Update the details of this master data entry.' : 'Fields marked with * are required. Codes are auto-generated from name.'"
            :icon="category.icon"
          >
            <!-- 1. Name Field (Atas, Lebar Penuh) -->
            <CmsFormField
              label="Name"
              html-for="master-data-name"
              required
              full
              :error="errors.name"
              :hint="`Displayed name of the ${category.singular.toLowerCase()}.`"
            >
              <input
                id="master-data-name"
                v-model="form.name"
                type="text"
                :placeholder="isCompanySize ? 'e.g. Tier 1 : Enterprise' : 'e.g. Micro & Small'"
                autocomplete="off"
                :class="[controlBaseClass, controlStateClass(!!errors.name)]"
                :disabled="isSaving"
              >
            </CmsFormField>

            <!-- 2. Code Field (Bawah, Disabled, Auto Capital Underscore) -->
            <CmsFormField
              label="Code"
              html-for="master-data-code"
              :required="!isEditMode"
              full
              :error="errors.code"
              hint="Auto-generated capital underscore code. Permanent once created."
            >
              <input
                id="master-data-code"
                v-model="form.code"
                type="text"
                placeholder="Auto-generated code..."
                autocomplete="off"
                spellcheck="false"
                class="font-mono uppercase bg-slate-50/80 cursor-not-allowed"
                :class="[controlBaseClass, controlStateClass(!!errors.code)]"
                disabled
              >
            </CmsFormField>

            <!-- 3. Description Field (Khusus Company Size) -->
            <CmsFormField
              v-if="isCompanySize"
              label="Description"
              html-for="master-data-description"
              :error="errors.description"
              full
              hint="Optional context or criteria for this company size tier."
            >
              <textarea
                id="master-data-description"
                v-model="form.description"
                rows="3"
                placeholder="Describe the revenue range or employee count for this tier..."
                class="resize-none"
                :class="[textareaBaseClass, controlStateClass(!!errors.description)]"
                :disabled="isSaving"
              />
            </CmsFormField>
          </CmsFormSection>
        </div>

        <footer class="flex items-center justify-end gap-2.5 border-t border-slate-100 p-5">
          <button
            type="button"
            class="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSaving"
            @click="closeModal"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
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
