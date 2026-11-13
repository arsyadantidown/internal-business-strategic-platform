<script setup lang="ts">
import type { PartnerListItem } from '../../types/partner.types'
import PartnerPageHeader from './PartnerPageHeader.vue'
import PartnerTable from './PartnerTable.vue'
import PartnerToolbar from './PartnerToolbar.vue'
import { usePartners } from './usePartners'

const router = useRouter()

const {
  items,
  filteredItems,
  isLoading,
  loadError,
  filters,
  isFilterDirty,
  retryLoad,
  setFilters,
  resetFilters
} = usePartners()

const navigateToDetail = (item: PartnerListItem) => {
  router.push({ query: { mode: 'detail', id: item.id } })
}

const navigateToEdit = (item: PartnerListItem) => {
  router.push({ query: { mode: 'edit', id: item.id } })
}

const navigateToAdd = () => {
  router.push({ query: { mode: 'add' } })
}
</script>

<template>
  <div class="space-y-5">
    <PartnerPageHeader @add="navigateToAdd" />

    <PartnerToolbar
      :filters="filters"
      :is-filter-dirty="isFilterDirty"
      @update="setFilters"
      @reset="resetFilters"
    />

    <PartnerTable
      :items="filteredItems"
      :total-count="items.length"
      :is-loading="isLoading"
      :load-error="loadError"
      :is-filter-dirty="isFilterDirty"
      @view="navigateToDetail"
      @edit="navigateToEdit"
      @retry="retryLoad"
      @add="navigateToAdd"
    />
  </div>
</template>
