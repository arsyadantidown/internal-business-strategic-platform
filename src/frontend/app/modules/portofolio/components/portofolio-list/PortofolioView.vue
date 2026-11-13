<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { ProjectItem, ViewMode, PortfolioFilterState } from '../../types/types'
import { createPortfolioFilterState } from '../../data/portfolioOptions'
import { usePortfolioStore } from '../../stores/portofolio.store'

import PortofolioHeader from './PortofolioHeader.vue'
import PortofolioFilter from './PortofolioFilter.vue'
import PortofolioToolbar from './PortofolioToolbar.vue'
import PortofolioGrid from './PortofolioGrid.vue'
import PortofolioTable from './PortofolioTable.vue'
import PortofolioPagination from './PortofolioPagination.vue'
import PortofolioFormModal from './PortofolioFormModal.vue'

const portfolioStore = usePortfolioStore()

const viewMode = ref<ViewMode>('grid')
const sortBy = ref<string>('latest')
const activeFilters = ref<PortfolioFilterState>(createPortfolioFilterState())
const isFormOpen = ref(false)
const editingProject = ref<ProjectItem | null>(null)

// Debounce timer untuk search
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Map pilihan dropdown sortBy ke parameter 'sort' backend
const mapSortParam = (sort: string): string => {
  switch (sort) {
    case 'latest':
      return '-updated_at'
    case 'oldest':
      return 'updated_at'
    case 'name_asc':
      return 'project_name'
    case 'name_desc':
      return '-project_name'
    default:
      return '-updated_at'
  }
}

// Fungsi fetch data ke backend sesuai filter & pagination aktif
const loadProjects = () => {
  const techStackId =
    activeFilters.value.frontendStack ||
    activeFilters.value.backendStack ||
    activeFilters.value.database ||
    undefined

  portfolioStore.fetchProjects({
    search: activeFilters.value.search || undefined,
    industry_id: activeFilters.value.industry || undefined,
    company_size_id: activeFilters.value.companySize || undefined,
    legal_structure_id: activeFilters.value.legalStructure || undefined,
    business_unit_id: activeFilters.value.businessUnit || undefined,
    customer_type_id: activeFilters.value.customerType || undefined,
    project_status_id: activeFilters.value.status || undefined,
    tech_stack_id: techStackId,
    year: activeFilters.value.year ? Number(activeFilters.value.year) : undefined,
    sort: mapSortParam(sortBy.value),
    page: portfolioStore.currentPage,
    page_size: portfolioStore.pageSize
  })
}

// Handler filter change dengan debounce 400ms untuk search
const handleFilterChange = (newFilters: PortfolioFilterState) => {
  const isSearchChanged = activeFilters.value.search !== newFilters.search
  activeFilters.value = newFilters
  portfolioStore.currentPage = 1 // Selalu reset ke halaman 1 saat filter berubah

  if (debounceTimer) clearTimeout(debounceTimer)

  if (isSearchChanged) {
    debounceTimer = setTimeout(() => {
      loadProjects()
    }, 400)
  } else {
    loadProjects()
  }
}

// Reset filter
const handleResetFilter = () => {
  activeFilters.value = createPortfolioFilterState()
  portfolioStore.currentPage = 1
  loadProjects()
}

// Ganti halaman pagination
const handlePageChange = (newPage: number) => {
  portfolioStore.currentPage = newPage
  loadProjects()
}

// Watch perubahan sort dropdown
watch(sortBy, () => {
  portfolioStore.currentPage = 1
  loadProjects()
})

// Load pertama kali saat halaman dibuka
onMounted(() => {
  loadProjects()
})

const handleAddProject = () => {
  editingProject.value = null
  isFormOpen.value = true
}

const handleEditProject = (project: ProjectItem) => {
  editingProject.value = project
  isFormOpen.value = true
}

const handleSaveProject = () => {
  isFormOpen.value = false
  editingProject.value = null
  loadProjects()
}

const handleDeleteProject = (project: ProjectItem) => {
  if (!window.confirm(`Delete portfolio "${project.title}"?`)) return
}

const handleViewDetail = (project: ProjectItem) => {
  navigateTo(`/portofolio/${project.id}`)
}
</script>

<template>
  <div class="space-y-6">
    <PortofolioHeader @add-project="handleAddProject" />

    <PortofolioFilter @filter-change="handleFilterChange" @reset="handleResetFilter" />

    <PortofolioToolbar
      v-model:current-view="viewMode"
      v-model:sort-by="sortBy"
      :total-count="portfolioStore.totalItems"
    />

    <!-- Loading Skeleton/State -->
    <div v-if="portfolioStore.isLoading" class="flex justify-center items-center py-24">
      <div class="flex flex-col items-center gap-3">
        <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-blue-600" />
        <p class="text-sm font-medium text-slate-500">Loading portfolio projects...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="portfolioStore.errorMessage"
      class="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center"
    >
      <UIcon name="i-lucide-alert-circle" class="mx-auto h-8 w-8 text-red-500" />
      <p class="mt-2 text-sm font-semibold text-red-800">
        {{ portfolioStore.errorMessage }}
      </p>
      <button
        type="button"
        class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
        @click="loadProjects"
      >
        Try Again
      </button>
    </div>

    <!-- Data Loaded State -->
    <div v-else class="transition-all duration-200">
      <PortofolioGrid
        v-if="viewMode === 'grid' && portfolioStore.projects.length > 0"
        :projects="portfolioStore.projects"
        @view-detail="handleViewDetail"
      />

      <PortofolioTable
        v-else-if="viewMode === 'table' && portfolioStore.projects.length > 0"
        :projects="portfolioStore.projects"
        @view-detail="handleViewDetail"
        @edit="handleEditProject"
        @delete="handleDeleteProject"
      />

      <!-- Empty State -->
      <div
        v-if="portfolioStore.projects.length === 0"
        class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
      >
        <UIcon name="i-lucide-search-x" class="mx-auto h-8 w-8 text-slate-300" />
        <p class="mt-3 text-sm font-semibold text-slate-700">
          No portfolio matches the selected filters.
        </p>
        <p class="mt-1 text-xs text-slate-500">Adjust or reset the filters to see more projects.</p>
      </div>
    </div>

    <!-- Server-Side Pagination -->
    <div v-if="portfolioStore.totalItems > 0" class="pt-4">
      <PortofolioPagination
        :current-page="portfolioStore.currentPage"
        :total-items="portfolioStore.totalItems"
        :page-size="portfolioStore.pageSize"
        @update:current-page="handlePageChange"
      />
    </div>

    <PortofolioFormModal
      :is-open="isFormOpen"
      :project="editingProject"
      @close="isFormOpen = false"
      @save="handleSaveProject"
    />
  </div>
</template>
