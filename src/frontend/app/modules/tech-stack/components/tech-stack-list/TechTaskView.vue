<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CmsPagination from '~/modules/cms/components/cms-list/CmsPagination.vue'
import TechTaskPageHeader from './TechTaskPageHeader.vue'
import TechTaskTable from './TechTaskTable.vue'
import TechTaskToolbar from './TechTaskToolbar.vue'
import TechStackFormModal from '../tech-stack-form/TechStackFormModal.vue'
import TechStackDeleteDialog from '../tech-stack-form/TechStackDeleteDialog.vue'
import { useTechStackStore } from '../../stores/tech-stack.store'
import type { TechStackFormValues, TechStackItem } from '../../types/tech-stack.types'

const toast = useToast()
const techStackStore = useTechStackStore()

const isFormOpen = ref(false)
const editingItem = ref<TechStackItem | null>(null)
const deleteTarget = ref<TechStackItem | null>(null)

const openCreateForm = () => {
  editingItem.value = null
  isFormOpen.value = true
}

const openEditForm = (item: TechStackItem) => {
  editingItem.value = item
  isFormOpen.value = true
}

const closeForm = () => {
  isFormOpen.value = false
  editingItem.value = null
}

const handleFormSubmit = async (values: TechStackFormValues) => {
  try {
    if (editingItem.value) {
      await techStackStore.updateTechStack(editingItem.value, values)
      toast.add({
        title: 'Tech stack updated',
        description: `"${values.name}" has been updated successfully.`,
        color: 'success'
      })
    } else {
      await techStackStore.createTechStack(values)
      toast.add({
        title: 'Tech stack added',
        description: `"${values.name}" has been added successfully.`,
        color: 'success'
      })
    }
    closeForm()
  } catch (err: any) {
    toast.add({
      title: 'Action failed',
      description: err?.message || 'Something went wrong.',
      color: 'error'
    })
  }
}

const openDeleteDialog = (item: TechStackItem) => {
  deleteTarget.value = item
}

const closeDeleteDialog = () => {
  deleteTarget.value = null
}

const handleDeleteConfirm = async () => {
  const target = deleteTarget.value
  if (!target) return

  try {
    await techStackStore.deleteTechStack(target)
    toast.add({
      title: 'Tech stack deleted',
      description: `"${target.name}" has been deleted.`,
      color: 'success'
    })
    closeDeleteDialog()
  } catch (err: any) {
    toast.add({
      title: 'Delete failed',
      description: err?.message || 'Failed to delete tech stack.',
      color: 'error'
    })
  }
}

onMounted(() => {
  techStackStore.fetchTechStacks()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <TechTaskPageHeader @add="openCreateForm" />

    <TechTaskToolbar
      :filters="techStackStore.filters"
      :is-filter-dirty="techStackStore.isFilterDirty"
      @update="techStackStore.setFilters"
      @reset="techStackStore.resetFilters"
    />

    <TechTaskTable
      :items="techStackStore.paginatedItems"
      :is-loading="techStackStore.isLoading"
      :load-error="techStackStore.errorMessage ?? ''"
      :total="techStackStore.totalResults"
      @edit="openEditForm"
      @delete="openDeleteDialog"
      @retry="techStackStore.fetchTechStacks"
    />

    <div
      v-if="techStackStore.totalResults > 0"
      class="flex justify-end"
    >
      <CmsPagination
        :current-page="techStackStore.currentPage"
        :page-size="techStackStore.pageSize"
        :total-items="techStackStore.totalResults"
        item-label="tech stacks"
        @update:current-page="techStackStore.setPage"
        @update:page-size="techStackStore.setPageSize"
      />
    </div>

    <!-- Modals -->
    <TechStackFormModal
      :is-open="isFormOpen"
      :editing-item="editingItem"
      @close="closeForm"
      @submit="handleFormSubmit"
    />

    <TechStackDeleteDialog
      :is-open="deleteTarget !== null"
      :target="deleteTarget"
      @close="closeDeleteDialog"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
