<script setup lang="ts">
import { computed, ref } from 'vue'
import CmsPagination from '~/modules/cms/components/cms-list/CmsPagination.vue'
import MasterDataCategoryNav from './MasterDataCategoryNav.vue'
import MasterDataPageHeader from './MasterDataPageHeader.vue'
import MasterDataStats from './MasterDataStats.vue'
import MasterDataTable from './MasterDataTable.vue'
import MasterDataToolbar from './MasterDataToolbar.vue'
import MasterDataFormModal from '../master-data-form/MasterDataFormModal.vue'
import MasterDataDeleteDialog from '../master-data-form/MasterDataDeleteDialog.vue'
import { getMasterDataErrorMessage, useMasterData } from './useMasterData'
import type { MasterDataFormValues, MasterDataItem } from '../../types/master-data.types'

const toast = useToast()

const {
  masterDataCategories,
  activeCategoryType,
  activeCategory,
  isLoading,
  loadError,
  canViewInactive,
  isSaving,
  isDeleting,
  togglingId,
  filters,
  currentPage,
  pageSize,
  stats,
  paginatedItems,
  totalResults,
  retryLoad,
  createItem,
  updateItem,
  toggleActive,
  deleteItem,
  setFilters,
  resetFilters,
  setPage,
  setPageSize,
  selectCategory
} = useMasterData()

const isFormOpen = ref(false)
const editingItem = ref<MasterDataItem | null>(null)
const deleteTarget = ref<MasterDataItem | null>(null)

const hasActiveFilters = computed(() =>
  filters.value.search.trim() !== '' || filters.value.status !== ''
)

const openCreateForm = () => {
  editingItem.value = null
  isFormOpen.value = true
}

const openEditForm = (item: MasterDataItem) => {
  editingItem.value = item
  isFormOpen.value = true
}

const closeForm = () => {
  isFormOpen.value = false
  editingItem.value = null
}

const handleFormSubmit = async (values: MasterDataFormValues) => {
  const category = activeCategory.value

  try {
    if (editingItem.value) {
      await updateItem(editingItem.value, values)
      toast.add({
        title: `${category.singular} updated`,
        description: `"${values.name}" has been updated successfully.`,
        color: 'success'
      })
      closeForm()
    } else {
      await createItem(values)
      toast.add({
        title: `${category.singular} added`,
        description: `"${values.name}" has been added to ${category.label.toLowerCase()}.`,
        color: 'success'
      })
      closeForm()
      resetFilters()
      setPage(1)
    }
  } catch (error) {
    toast.add({
      title: `Failed to save ${category.singular.toLowerCase()}`,
      description: getMasterDataErrorMessage(error),
      color: 'error'
    })
  }
}

const handleToggleActive = async (item: MasterDataItem) => {
  const category = activeCategory.value

  try {
    await toggleActive(item)
    toast.add({
      title: item.isActive ? `${category.singular} deactivated` : `${category.singular} activated`,
      description: `"${item.name}" is now ${item.isActive ? 'inactive and hidden from selection forms' : 'active and selectable'}.`,
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: `Failed to update ${category.singular.toLowerCase()}`,
      description: getMasterDataErrorMessage(error),
      color: 'error'
    })
  }
}

const openDeleteDialog = (item: MasterDataItem) => {
  deleteTarget.value = item
}

const closeDeleteDialog = () => {
  deleteTarget.value = null
}

const handleDeleteConfirm = async () => {
  const target = deleteTarget.value
  const category = activeCategory.value

  if (!target) return

  try {
    const result = await deleteItem(target)

    if (result.deleted) {
      toast.add({
        title: `${category.singular} deleted`,
        description: `"${target.name}" has been permanently deleted.`,
        color: 'success'
      })
    } else {
      toast.add({
        title: `${category.singular} deactivated instead`,
        description: `"${target.name}" is still used by existing records, so it was deactivated and hidden from selection forms.`,
        color: 'warning'
      })
    }

    closeDeleteDialog()
  } catch (error) {
    toast.add({
      title: `Failed to delete ${category.singular.toLowerCase()}`,
      description: getMasterDataErrorMessage(error),
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="space-y-5">
    <MasterDataPageHeader
      :category="activeCategory"
      @add="openCreateForm"
    />

    <MasterDataCategoryNav
      :categories="masterDataCategories"
      :active-type="activeCategoryType"
      @select="selectCategory"
    />

    <MasterDataStats :stats="stats" />

    <MasterDataToolbar
      :filters="filters"
      :can-view-inactive="canViewInactive"
      @update="setFilters"
      @reset="resetFilters"
    />

    <MasterDataTable
      :category="activeCategory"
      :items="paginatedItems"
      :is-loading="isLoading"
      :load-error="loadError"
      :total-results="totalResults"
      :has-active-filters="hasActiveFilters"
      :toggling-id="togglingId"
      @add="openCreateForm"
      @edit="openEditForm"
      @delete="openDeleteDialog"
      @toggle="handleToggleActive"
      @retry="retryLoad"
    />

    <CmsPagination
      v-if="!isLoading && !loadError && totalResults > 0"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="totalResults"
      item-label="entries"
      @update:current-page="setPage"
      @update:page-size="setPageSize"
    />

    <MasterDataFormModal
      :is-open="isFormOpen"
      :category="activeCategory"
      :editing-item="editingItem"
      :is-saving="isSaving"
      @close="closeForm"
      @submit="handleFormSubmit"
    />

    <MasterDataDeleteDialog
      :is-open="deleteTarget !== null"
      :category="activeCategory"
      :target="deleteTarget"
      :is-deleting="isDeleting"
      @close="closeDeleteDialog"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
