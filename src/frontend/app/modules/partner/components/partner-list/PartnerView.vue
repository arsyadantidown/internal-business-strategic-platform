<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { getPartnerErrorMessage } from '../../api/partner.api'
import { usePartnerStore } from '../../stores/partner.store'
import type { PartnerListItem } from '../../types/partner.types'
import PartnerDeleteDialog from '../partner-form/PartnerDeleteDialog.vue'
import PartnerPageHeader from './PartnerPageHeader.vue'
import PartnerTable from './PartnerTable.vue'
import PartnerToolbar from './PartnerToolbar.vue'

const router = useRouter()
const toast = useToast()
const partnerStore = usePartnerStore()
const { items, isLoading, errorMessage, filters, isFilterDirty } = storeToRefs(partnerStore)

const deleteTarget = ref<PartnerListItem | null>(null)
const isDeleteOpen = ref(false)
const togglingId = ref<string | null>(null)

const navigateToDetail = (item: PartnerListItem) => {
  router.push({ query: { mode: 'detail', id: item.id } })
}

const navigateToEdit = (item: PartnerListItem) => {
  router.push({ query: { mode: 'edit', id: item.id } })
}

const navigateToAdd = () => {
  router.push({ query: { mode: 'add' } })
}

const openDelete = (item: PartnerListItem) => {
  deleteTarget.value = item
  isDeleteOpen.value = true
}

const closeDelete = () => {
  isDeleteOpen.value = false
  deleteTarget.value = null
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return

  const target = deleteTarget.value

  try {
    const result = await partnerStore.deletePartner(target.id)

    toast.add({
      title: result.deleted ? 'Partner deleted' : 'Partner deactivated',
      description: result.deleted
        ? `"${target.partnerName}" has been removed from the directory.`
        : `"${target.partnerName}" has ongoing projects and was deactivated instead.`,
      color: 'success'
    })

    closeDelete()
  } catch (error) {
    toast.add({
      title: 'Failed to delete partner',
      description: getPartnerErrorMessage(error),
      color: 'error'
    })
  }
}

// Handler baru untuk Deactivate / Activate dari Table Utama
const handleToggleActive = async (item: PartnerListItem) => {
  togglingId.value = item.id
  const nextState = !item.isActive

  try {
    await partnerStore.setPartnerActive(item.id, nextState)

    toast.add({
      title: nextState ? 'Partner activated' : 'Partner deactivated',
      description: `"${item.partnerName}" is now ${nextState ? 'active' : 'inactive'}.`,
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Action failed',
      description: getPartnerErrorMessage(error),
      color: 'error'
    })
  } finally {
    togglingId.value = null
  }
}

onMounted(() => {
  partnerStore.fetchPartners()
})
</script>

<template>
  <div class="space-y-5">
    <PartnerPageHeader @add="navigateToAdd" />

    <PartnerToolbar
      :filters="filters"
      :is-filter-dirty="isFilterDirty"
      @update="partnerStore.setFilters"
      @reset="partnerStore.resetFilters"
    />

    <PartnerTable
      :items="items"
      :total-count="items.length"
      :is-loading="isLoading"
      :load-error="errorMessage ?? ''"
      :is-filter-dirty="isFilterDirty"
      :toggling-id="togglingId"
      @view="navigateToDetail"
      @edit="navigateToEdit"
      @delete="openDelete"
      @toggle-active="handleToggleActive"
      @retry="partnerStore.fetchPartners"
      @add="navigateToAdd"
    />

    <PartnerDeleteDialog
      :is-open="isDeleteOpen"
      :target="deleteTarget"
      :is-deleting="partnerStore.isSubmitting"
      @close="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
