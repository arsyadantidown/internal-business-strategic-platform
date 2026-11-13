<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import CmsFormField from '~/modules/cms/components/cms-form/CmsFormField.vue'
import CmsFormSection from '~/modules/cms/components/cms-form/CmsFormSection.vue'
import { cmsControlClass, cmsControlStateClass } from '~/modules/cms/utils/cmsForm'
import { productStatusOptions } from '../../data/product.data'
import type {
  ProductFormErrors,
  ProductFormValues,
  ProductItem,
  ProductStatus
} from '../../types/product.types'

interface Props {
  isOpen: boolean
  editingItem: ProductItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', values: ProductFormValues): void
}>()

const isEditMode = computed(() => props.editingItem !== null)

const form = reactive<{
  productName: string
  productDescription: string
  productStatus: ProductStatus
}>({
  productName: '',
  productDescription: '',
  productStatus: 'active'
})

const errors = ref<ProductFormErrors>({})

const validate = (): ProductFormValues | null => {
  const next: ProductFormErrors = {}
  const productName = form.productName.trim()
  const productDescription = form.productDescription.trim()

  if (!productName) {
    next.productName = 'Product name is required.'
  } else if (productName.length > 150) {
    next.productName = 'Product name must be at most 150 characters.'
  }

  if (productDescription.length > 500) {
    next.productDescription = 'Product description must be at most 500 characters.'
  }

  if (!form.productStatus) {
    next.productStatus = 'Product status is required.'
  }

  errors.value = next

  if (Object.keys(next).length > 0) return null

  return {
    productName,
    productDescription,
    productStatus: form.productStatus
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
  (isOpen) => {
    if (!isOpen) return

    errors.value = {}

    if (props.editingItem) {
      form.productName = props.editingItem.productName
      form.productDescription = props.editingItem.productDescription
      form.productStatus = props.editingItem.productStatus
    } else {
      form.productName = ''
      form.productDescription = ''
      form.productStatus = 'active'
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
              name="i-lucide-package"
              class="h-4 w-4"
            />
          </div>
          <div>
            <h2 class="text-sm font-bold tracking-tight text-slate-900">
              {{ isEditMode ? 'Edit Product' : 'Add Product' }}
            </h2>
            <p class="mt-0.5 text-[11px] text-slate-500">
              {{
                isEditMode
                  ? 'Update the details of this product.'
                  : 'Create a new product entry for the catalog.'
              }}
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
            title="Product Details"
            description="Fields marked with * are required."
            icon="i-lucide-package"
          >
            <CmsFormField
              label="Product Name"
              html-for="product-name"
              required
              :error="errors.productName"
              hint="Displayed name of the product."
            >
              <input
                id="product-name"
                v-model="form.productName"
                type="text"
                maxlength="150"
                placeholder="e.g. Bliv"
                autocomplete="off"
                :class="[cmsControlClass, cmsControlStateClass(!!errors.productName)]"
              >
            </CmsFormField>

            <CmsFormField
              label="Product Status"
              html-for="product-status"
              required
              :error="errors.productStatus"
              hint="Controls availability across project forms."
            >
              <select
                id="product-status"
                v-model="form.productStatus"
                :class="[cmsControlClass, cmsControlStateClass(!!errors.productStatus)]"
              >
                <option
                  v-for="option in productStatusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </CmsFormField>

            <CmsFormField
              label="Product Description"
              html-for="product-description"
              :error="errors.productDescription"
              full
              hint="Optional summary shown to administrators (max 500 characters)."
            >
              <textarea
                id="product-description"
                v-model="form.productDescription"
                rows="4"
                maxlength="500"
                placeholder="Describe what this product does..."
                class="resize-none"
                :class="[cmsControlClass, cmsControlStateClass(!!errors.productDescription)]"
              />
            </CmsFormField>
          </CmsFormSection>
        </div>

        <footer class="flex items-center justify-end gap-2.5 border-t border-slate-100 p-5">
          <button
            type="button"
            class="inline-flex h-8.5 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
            @click="closeModal"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 cursor-pointer"
          >
            <UIcon
              name="i-lucide-circle-check-big"
              class="h-3.5 w-3.5"
            />
            <span>{{ isEditMode ? 'Save Changes' : 'Add Product' }}</span>
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>
