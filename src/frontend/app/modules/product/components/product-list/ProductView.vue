<script setup lang="ts">
import { ref, watch } from 'vue'
import CmsPagination from '~/modules/cms/components/cms-list/CmsPagination.vue'
import ProductPageHeader from './ProductPageHeader.vue'
import ProductStats from './ProductStats.vue'
import ProductTable from './ProductTable.vue'
import ProductToolbar from './ProductToolbar.vue'
import ProductFormModal from '../product-form/ProductFormModal.vue'
import ProductDeleteDialog from '../product-form/ProductDeleteDialog.vue'
import { useProducts } from '../../composables/useProducts'
import type { ProductFormValues, ProductItem, ProductRecord } from '../../types/product.types'

const toast = useToast()

const {
  items,
  filters,
  currentPage,
  pageSize,
  paginatedItems,
  totalResults,
  statusCount,
  setFilters,
  resetFilters,
  setPage,
  setPageSize,
  createItem,
  updateItem,
  deleteItem,
  isLoading,
  isSubmitting,
  loadError,
  retryLoad
} = useProducts()

const isFormOpen = ref(false)
const editingItem = ref<ProductRecord | null>(null)
const deleteTarget = ref<ProductRecord | null>(null)

watch(isLoading, (loading, wasLoading) => {
  if (loading || !wasLoading || !loadError.value) return

  toast.add({
    title: 'Failed to load products',
    description: loadError.value,
    color: 'error',
    actions: [
      {
        label: 'Retry',
        onClick: () => {
          void retryLoad()
        }
      }
    ]
  })
})

const openCreateForm = () => {
  editingItem.value = null
  isFormOpen.value = true
}

const openEditForm = (item: ProductItem) => {
  editingItem.value = item as ProductRecord
  isFormOpen.value = true
}

const closeForm = () => {
  isFormOpen.value = false
  editingItem.value = null
}

const handleFormSubmit = async (values: ProductFormValues) => {
  if (isSubmitting.value) return

  try {
    if (editingItem.value) {
      await updateItem(editingItem.value, values)
      toast.add({
        title: 'Product updated',
        description: `"${values.productName}" has been updated successfully.`,
        color: 'success'
      })
    } else {
      await createItem(values)
      toast.add({
        title: 'Product added',
        description: `"${values.productName}" has been added to the product catalog.`,
        color: 'success'
      })
    }

    closeForm()
  } catch (error) {
    toast.add({
      title: 'Failed to save product',
      description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      color: 'error'
    })
  }
}

const openDeleteDialog = (item: ProductItem) => {
  deleteTarget.value = item as ProductRecord
}

const closeDeleteDialog = () => {
  deleteTarget.value = null
}

const handleDeleteConfirm = async () => {
  const target = deleteTarget.value
  if (!target || isSubmitting.value) return

  try {
    const result = await deleteItem(target)

    if (!result.deleted) {
      toast.add({
        title: 'Product deactivated',
        description: `"${target.productName}" is still used by projects and remains in the catalog.`,
        color: 'warning'
      })
      closeDeleteDialog()
      return
    }

    toast.add({
      title: 'Product deleted',
      description: `"${target.productName}" has been removed from the product catalog.`,
      color: 'success'
    })
    closeDeleteDialog()
  } catch (error) {
    toast.add({
      title: 'Failed to delete product',
      description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="space-y-5">
    <ProductPageHeader @add="openCreateForm" />

    <ProductStats
      :total="items.length"
      :active="statusCount('active')"
      :draft="statusCount('draft')"
      :inactive="statusCount('inactive')"
    />

    <ProductToolbar
      :filters="filters"
      @update="setFilters"
      @reset="resetFilters"
    />

    <ProductTable
      :items="paginatedItems"
      :total-count="items.length"
      :total-results="totalResults"
      @add="openCreateForm"
      @edit="openEditForm"
      @delete="openDeleteDialog"
    />

    <CmsPagination
      v-if="totalResults > 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-items="totalResults"
      item-label="products"
      @update:current-page="setPage"
      @update:page-size="setPageSize"
    />

    <ProductFormModal
      :is-open="isFormOpen"
      :editing-item="editingItem"
      @close="closeForm"
      @submit="handleFormSubmit"
    />

    <ProductDeleteDialog
      :is-open="deleteTarget !== null"
      :target="deleteTarget"
      @close="closeDeleteDialog"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
