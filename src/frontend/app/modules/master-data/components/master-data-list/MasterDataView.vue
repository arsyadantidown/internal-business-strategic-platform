<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CmsPagination from '~/modules/cms/components/cms-list/CmsPagination.vue'
import MasterDataCategoryNav from './MasterDataCategoryNav.vue'
import MasterDataPageHeader from './MasterDataPageHeader.vue'
import MasterDataStats from './MasterDataStats.vue'
import MasterDataTable from './MasterDataTable.vue'
import MasterDataToolbar from './MasterDataToolbar.vue'
import MasterDataFormModal from '../master-data-form/MasterDataFormModal.vue'
import MasterDataDeleteDialog from '../master-data-form/MasterDataDeleteDialog.vue'
import { getMasterDataErrorMessage, useMasterDataStore } from '../../stores/master-data.store'
import type { MasterDataFormValues, MasterDataItem } from '../../types/master-data.types'

const toast = useToast()
const masterDataStore = useMasterDataStore()

const isFormOpen = ref(false)
const editingItem = ref<MasterDataItem | null>(null)
const deleteTarget = ref<MasterDataItem | null>(null)

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
  try {
    if (editingItem.value) {
      const result = await masterDataStore.updateItem(editingItem.value, values)
      toast.add({
        title: `${masterDataStore.activeCategory.singular} updated`,
        description: result.message || `"${result.item.name}" has been updated.`,
        color: 'success'
      })
    } else {
      const result = await masterDataStore.createItem(values)
      toast.add({
        title: `${masterDataStore.activeCategory.singular} added`,
        description: result.message || `"${result.item.name}" has been added.`,
        color: 'success'
      })
    }
    closeForm()
  } catch (error) {
    toast.add({
      title: 'Action failed',
      description: getMasterDataErrorMessage(error),
      color: 'error'
    })
  }
}

const handleToggleActive = async (item: MasterDataItem) => {
  try {
    const result = await masterDataStore.toggleActive(item)
    toast.add({
      title: 'Status changed',
      description: `"${result.item.name}" is now ${result.item.isActive ? 'active' : 'inactive'}.`,
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Action failed',
      description: getMasterDataErrorMessage(error),
      color: 'error'
    })
  }
}

const openDeleteDialog = (item: MasterDataItem) => {
  deleteTarget.value = item
}

const closeDeleteDialog = () => {
  if (masterDataStore.isDeleting) return
  deleteTarget.value = null
}

const handleDeleteConfirm = async () => {
  if (!deleteTarget.value) return
  const target = deleteTarget.value

  try {
    const result = await masterDataStore.deleteItem(target)
    toast.add({
      title: result.deleted
        ? `${masterDataStore.activeCategory.singular} deleted`
        : `${masterDataStore.activeCategory.singular} deactivated`,
      description:
        result.message ||
        (result.deleted
          ? `"${target.name}" has been permanently removed.`
          : `"${target.name}" is in use and has been marked inactive instead.`),
      color: 'success'
    })
    closeDeleteDialog()
  } catch (error) {
    toast.add({
      title: 'Action failed',
      description: getMasterDataErrorMessage(error),
      color: 'error'
    })
  }
}

onMounted(() => {
  masterDataStore.fetchItems()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <MasterDataPageHeader
      :category="masterDataStore.activeCategory"
      @add="openCreateForm"
    />

    <MasterDataCategoryNav
      :categories="masterDataStore.masterDataCategories"
      :active-type="masterDataStore.activeCategoryType"
      @select="masterDataStore.selectCategory"
    />

    <MasterDataStats :stats="masterDataStore.stats" />

    <MasterDataToolbar
      :filters="masterDataStore.filters"
      :can-view-inactive="masterDataStore.canViewInactive"
      @update="masterDataStore.setFilters"
      @reset="masterDataStore.resetFilters"
    />

    <MasterDataTable
      :category="masterDataStore.activeCategory"
      :items="masterDataStore.paginatedItems"
      :is-loading="masterDataStore.isLoading"
      :load-error="masterDataStore.loadError"
      :total-results="masterDataStore.totalResults"
      :has-active-filters="masterDataStore.hasActiveFilters"
      :toggling-id="masterDataStore.togglingId"
      @add="openCreateForm"
      @retry="masterDataStore.retryLoad"
      @edit="openEditForm"
      @delete="openDeleteDialog"
      @toggle="handleToggleActive"
    />

    <div
      v-if="masterDataStore.totalResults > 0"
      class="flex justify-end"
    >
      <CmsPagination
        :current-page="masterDataStore.currentPage"
        :page-size="masterDataStore.pageSize"
        :total-items="masterDataStore.totalResults"
        :item-label="masterDataStore.activeCategory.label.toLowerCase()"
        @update:current-page="masterDataStore.setPage"
        @update:page-size="masterDataStore.setPageSize"
      />
    </div>

    <!-- Modals -->
    <MasterDataFormModal
      :is-open="isFormOpen"
      :category="masterDataStore.activeCategory"
      :editing-item="editingItem"
      :is-saving="masterDataStore.isSaving"
      @close="closeForm"
      @submit="handleFormSubmit"
    />

    <MasterDataDeleteDialog
      :is-open="deleteTarget !== null"
      :category="masterDataStore.activeCategory"
      :target="deleteTarget"
      :is-deleting="masterDataStore.isDeleting"
      @close="closeDeleteDialog"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
