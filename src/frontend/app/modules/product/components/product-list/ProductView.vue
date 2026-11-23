<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CmsPagination from '~/modules/cms/components/cms-list/CmsPagination.vue'
import ProductPageHeader from './ProductPageHeader.vue'
import ProductStats from './ProductStats.vue'
import ProductTable from './ProductTable.vue'
import ProductToolbar from './ProductToolbar.vue'
import ProductFormModal from '../product-form/ProductFormModal.vue'
import ProductDeleteDialog from '../product-form/ProductDeleteDialog.vue'
import { useProductStore } from '../../stores/product.store'
import type { ProductFormValues, ProductItem } from '../../types/product.types'

const toast = useToast()
const productStore = useProductStore()

const isFormOpen = ref(false)
const editingItem = ref<ProductItem | null>(null)
const deleteTarget = ref<ProductItem | null>(null)

const openCreateForm = () => {
  editingItem.value = null
  isFormOpen.value = true
}

const openEditForm = (item: ProductItem) => {
  editingItem.value = item
  isFormOpen.value = true
}

const closeForm = () => {
  isFormOpen.value = false
  editingItem.value = null
}

const handleFormSubmit = async (values: ProductFormValues) => {
  if (productStore.isSubmitting) return

  try {
    if (editingItem.value) {
      await productStore.updateProduct(editingItem.value, values)
      toast.add({
        title: 'Product updated',
        description: `"${values.productName}" has been updated successfully.`,
        color: 'success'
      })
    } else {
      await productStore.createProduct(values)
      toast.add({
        title: 'Product added',
        description: `"${values.productName}" has been added to the product catalog.`,
        color: 'success'
      })
    }

    closeForm()
  } catch (error) {
    toast.add({
      title: 'Action failed',
      description: error instanceof Error ? error.message : 'Something went wrong.',
      color: 'error'
    })
  }
}

const openDeleteDialog = (item: ProductItem) => {
  deleteTarget.value = item
}

const closeDeleteDialog = () => {
  deleteTarget.value = null
}

const handleDeleteConfirm = async () => {
  const target = deleteTarget.value
  if (!target || productStore.isSubmitting) return

  try {
    await productStore.deleteProduct(target)
    toast.add({
      title: 'Product deleted',
      description: `"${target.productName}" has been removed from the product catalog.`,
      color: 'success'
    })
    closeDeleteDialog()
  } catch (error) {
    toast.add({
      title: 'Delete failed',
      description: error instanceof Error ? error.message : 'Failed to delete product.',
      color: 'error'
    })
  }
}

onMounted(async () => {
  await productStore.fetchStatuses()
  await productStore.fetchProducts()
})
</script>

<template>
  <div class="space-y-5">
    <ProductPageHeader @add="openCreateForm" />

    <ProductStats
      :total="productStore.totalCount"
      :active="productStore.statusCount('active')"
      :draft="productStore.statusCount('draft')"
      :inactive="productStore.statusCount('inactive')"
    />

    <ProductToolbar
      :filters="productStore.filters"
      :statuses="productStore.statuses"
      @update="productStore.setFilters"
      @reset="productStore.resetFilters"
    />

    <ProductTable
      :items="productStore.paginatedItems"
      :is-loading="productStore.isLoading"
      :load-error="productStore.errorMessage ?? ''"
      :total-count="productStore.totalCount"
      :total-results="productStore.totalResults"
      @add="openCreateForm"
      @edit="openEditForm"
      @delete="openDeleteDialog"
      @retry="productStore.fetchProducts"
    />

    <CmsPagination
      v-if="productStore.totalResults > 0"
      :current-page="productStore.currentPage"
      :page-size="productStore.pageSize"
      :total-items="productStore.totalResults"
      item-label="products"
      @update:current-page="productStore.setPage"
      @update:page-size="productStore.setPageSize"
    />

    <ProductFormModal
      :is-open="isFormOpen"
      :editing-item="editingItem"
      :statuses="productStore.statuses"
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
