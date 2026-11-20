<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import CmsFormField from '~/modules/cms/components/cms-form/CmsFormField.vue'
import type {
  TechStackCategory,
  TechStackFormErrors,
  TechStackFormValues,
  TechStackItem
} from '../../types/tech-stack.types'

interface Props {
  isOpen: boolean
  editingItem: TechStackItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', values: TechStackFormValues): void
}>()

const isEditMode = computed(() => props.editingItem !== null)

const form = reactive<{
  name: string
  category: TechStackCategory
  isActive: boolean
}>({
  name: '',
  category: 'frontend',
  isActive: true
})

const errors = ref<TechStackFormErrors>({})

// Input styling dengan tinggi proporsional (h-10 / 40px) dan rounded-lg (8px)
const controlBaseClass =
  'h-10 w-full rounded-lg border bg-white px-3.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs transition-colors focus:outline-none focus:ring-2'

const controlStateClass = (hasError: boolean) =>
  hasError
    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'

const validate = (): TechStackFormValues | null => {
  const next: TechStackFormErrors = {}
  const name = form.name.trim()

  if (!name) {
    next.name = 'Tech stack name is required.'
  } else if (name.length > 150) {
    next.name = 'Tech stack name must be at most 150 characters.'
  }

  if (!form.category) {
    next.category = 'Category is required.'
  }

  errors.value = next

  if (Object.keys(next).length > 0) return null

  return {
    name,
    category: form.category,
    isActive: form.isActive
  }
}

const handleSubmit = () => {
  const values = validate()
  if (values) emit('submit', values)
}

const closeModal = () => {
  emit('close')
}

watch(
  () => props.isOpen,
  isOpen => {
    if (!isOpen) return

    if (props.editingItem) {
      form.name = props.editingItem.name
      form.category = props.editingItem.category
      form.isActive = props.editingItem.isActive
    } else {
      form.name = ''
      form.category = 'frontend'
      form.isActive = true
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
    <div class="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 class="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
            {{ isEditMode ? 'Edit Tech Stack' : 'Add Tech Stack' }}
          </h2>
          <p class="mt-0.5 text-xs text-slate-500">
            {{
              isEditMode
                ? 'Update tech stack information and status.'
                : 'Create a new tech stack entry in the catalog.'
            }}
          </p>
        </div>

        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          @click="closeModal"
        >
          <UIcon
            name="i-lucide-x"
            class="h-4 w-4"
          />
        </button>
      </div>

      <!-- Modal Body -->
      <form
        class="space-y-4 p-5"
        @submit.prevent="handleSubmit"
      >
        <!-- Name Field -->
        <CmsFormField
          id="tech-stack-name"
          label="Name"
          :required="true"
          :error="errors.name"
        >
          <input
            id="tech-stack-name"
            v-model="form.name"
            type="text"
            placeholder="e.g. Vue.js, Python, PostgreSQL"
            :class="[controlBaseClass, controlStateClass(Boolean(errors.name))]"
          >
        </CmsFormField>

        <!-- Category Field -->
        <CmsFormField
          id="tech-stack-category"
          label="Category"
          :required="true"
          :error="errors.category"
        >
          <div class="relative">
            <select
              id="tech-stack-category"
              v-model="form.category"
              :class="[controlBaseClass, controlStateClass(Boolean(errors.category)), 'appearance-none pr-9 cursor-pointer']"
            >
              <option value="frontend">
                Frontend
              </option>
              <option value="backend">
                Backend
              </option>
              <option value="data_storage">
                Data Storage
              </option>
            </select>
            <UIcon
              name="i-lucide-chevron-right"
              class="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400"
            />
          </div>
        </CmsFormField>

        <!-- Status Toggle (Only on edit) -->
        <div v-if="isEditMode" class="pt-1">
          <label class="inline-flex items-center gap-2.5 cursor-pointer">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            >
            <span class="text-xs font-semibold text-slate-700">Active status</span>
          </label>
          <p class="mt-1 text-[11px] text-slate-400">
            Inactive tech stacks will be hidden from project selection.
          </p>
        </div>

        <!-- Footer Buttons -->
        <div class="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            type="button"
            class="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
            @click="closeModal"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
          >
            <UIcon
              :name="isEditMode ? 'i-lucide-check' : 'i-lucide-plus'"
              class="h-3.5 w-3.5"
            />
            <span>{{ isEditMode ? 'Save Changes' : 'Create Tech Stack' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
