<script setup lang="ts">
import { onMounted } from 'vue'
import CmsPagination from '~/modules/cms/components/cms-list/CmsPagination.vue'
import { useTechTaskOptions } from '../../composables/useTechTaskOptions'
import type { TechTaskListItem } from '../../types/tech-task.types'
import TechTaskPageHeader from './TechTaskPageHeader.vue'
import TechTaskTable from './TechTaskTable.vue'
import TechTaskToolbar from './TechTaskToolbar.vue'
import { useTechTasks } from './useTechTasks'

const router = useRouter()

const {
  items,
  isLoading,
  loadError,
  total,
  filters,
  currentPage,
  pageSize,
  isFilterDirty,
  retryLoad,
  setFilters,
  resetFilters,
  setPage,
  setPageSize
} = useTechTasks()

const {
  techStackOptions,
  projectStatusOptions,
  isLoadingOptions,
  optionsError,
  ensureOptions,
  retryLoadOptions
} = useTechTaskOptions()

const navigateToDetail = (item: TechTaskListItem) => {
  router.push({ query: { mode: 'detail', id: item.id } })
}

const navigateToEdit = (item: TechTaskListItem) => {
  router.push({ query: { mode: 'edit', id: item.id } })
}

const navigateToAdd = () => {
  router.push({ query: { mode: 'add' } })
}

onMounted(() => {
  ensureOptions()
})
</script>

<template>
  <div class="space-y-5">
    <TechTaskPageHeader @add="navigateToAdd" />

    <div
      v-if="optionsError"
      class="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[11px] leading-4 text-amber-700"
    >
      <UIcon
        name="i-lucide-circle-alert"
        class="mt-0.5 h-4 w-4 shrink-0"
      />
      <div class="flex-1">
        <p class="font-semibold">
          Filter options failed to load
        </p>
        <p class="mt-0.5">
          {{ optionsError }}
        </p>
      </div>
      <button
        type="button"
        class="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-100 cursor-pointer"
        @click="retryLoadOptions"
      >
        <UIcon
          name="i-lucide-rotate-ccw"
          class="h-3 w-3"
        />
        <span>Retry</span>
      </button>
    </div>

    <TechTaskToolbar
      :filters="filters"
      :tech-stack-options="isLoadingOptions ? [] : techStackOptions"
      :project-status-options="isLoadingOptions ? [] : projectStatusOptions"
      :is-filter-dirty="isFilterDirty"
      @update="setFilters"
      @reset="resetFilters"
    />

    <TechTaskTable
      :items="items"
      :is-loading="isLoading"
      :load-error="loadError"
      :total="total"
      @view="navigateToDetail"
      @edit="navigateToEdit"
      @retry="retryLoad"
    />

    <CmsPagination
      v-if="!isLoading && !loadError && total > 0"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="total"
      item-label="tech tasks"
      @update:current-page="setPage"
      @update:page-size="setPageSize"
    />
  </div>
</template>
