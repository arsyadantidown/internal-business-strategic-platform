<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ProjectItem, ViewMode, PortfolioFilterState } from '../../types/types.ts'
import { createPortfolioFilterState } from '../../data/portfolioOptions'

import PortofolioHeader from './PortofolioHeader.vue'
import PortofolioFilter from './PortofolioFilter.vue'
import PortofolioToolbar from './PortofolioToolbar.vue'
import PortofolioGrid from './PortofolioGrid.vue'
import PortofolioTable from './PortofolioTable.vue'
import PortofolioPagination from './PortofolioPagination.vue'
import PortofolioFormModal from './PortofolioFormModal.vue'

const viewMode = ref<ViewMode>('grid')
const sortBy = ref<string>('latest')
const currentPage = ref<number>(1)
const pageSize = 12

const activeFilters = ref<PortfolioFilterState>(createPortfolioFilterState())
const isFormOpen = ref(false)
const editingProject = ref<ProjectItem | null>(null)

const createProject = (project: Omit<ProjectItem, 'technologies'>): ProjectItem => ({
  ...project,
  technologies: [project.frontendStack, project.backendStack, project.database]
    .filter((item): item is string => Boolean(item))
})

const dummyProjects = ref<ProjectItem[]>([
  createProject({
    id: '1',
    title: 'Digital Banking Transformation',
    client: 'ABC Bank',
    description: 'End-to-end digital banking platform for improved customer experience.',
    industry: 'Financial Services',
    companySize: 'Tier 1 : Strategic/Enterprise (>1T)',
    legalStructure: 'Private Company',
    businessUnit: 'ITMS',
    product: 'Bliv',
    customerType: 'Strategic Customer',
    productStatus: 'Ready to Sell',
    frontendStack: 'Vue.js (Vue, Vue2, Vue3)',
    backendStack: 'Python (Flask API, FastAPI)',
    database: 'PostgreSQL (Postgres)',
    status: 'Closed',
    year: '2025',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
    updatedAt: '2 days ago'
  }),
  createProject({
    id: '2',
    title: 'Smart Manufacturing Platform',
    client: 'PT. Manufaktur Indonesia',
    description: 'IoT-based manufacturing monitoring and predictive maintenance platform.',
    industry: 'Manufacturing',
    companySize: 'Tier 2 : Growth/Valued (100B<1T)',
    legalStructure: 'Private Company',
    businessUnit: 'SI',
    product: 'Semeru',
    customerType: 'Strategic Customer',
    productStatus: 'Ready to Sell',
    frontendStack: 'Vue.js (Vue, Vue2, Vue3)',
    backendStack: 'Golang',
    database: 'TimescaleDB',
    status: 'On Going',
    year: '2026',
    image:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop',
    updatedAt: '5 days ago'
  }),
  createProject({
    id: '3',
    title: 'Retail Analytics Platform',
    client: 'Retail Group',
    description: 'Analytics platform for retail business intelligence and sales optimization.',
    industry: 'Retail and Wholesale Trade',
    companySize: 'Tier 2 : Growth/Valued (100B<1T)',
    legalStructure: 'Private Company',
    businessUnit: 'CSD',
    product: 'Bliv',
    customerType: 'Regular Customer',
    productStatus: 'Under Development',
    frontendStack: 'React',
    backendStack: 'Python (Flask API, FastAPI)',
    database: 'ClickHouse (with CHProxy)',
    status: 'On Going',
    year: '2025',
    image:
      'https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=600&auto=format&fit=crop',
    updatedAt: '1 week ago'
  }),
  createProject({
    id: '4',
    title: 'Healthcare Management System',
    client: 'MediCare Hospital',
    description: 'Patient management and resource allocation system for healthcare providers.',
    industry: 'Healthcare',
    companySize: 'Tier 1 : Strategic/Enterprise (>1T)',
    legalStructure: 'State-owned Enterprise',
    businessUnit: 'ITMS',
    product: 'Semeru',
    customerType: 'Strategic Customer',
    productStatus: 'Ready to Sell',
    frontendStack: 'Vue.js (Vue, Vue2, Vue3)',
    backendStack: 'Java (for custom NiFi components)',
    database: 'PostgreSQL (Postgres)',
    status: 'Closed',
    year: '2025',
    image:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop',
    updatedAt: '2 weeks ago'
  }),
  createProject({
    id: '5',
    title: 'Logistics Tracking Platform',
    client: 'LogiTrans Indonesia',
    description: 'Real-time shipment tracking and supply chain visibility platform.',
    industry: 'Transportation and Logistics',
    companySize: 'Tier 3 : Standard/Transactional (50B<100B)',
    legalStructure: 'Private Company',
    businessUnit: 'SI',
    product: 'Teslakom',
    customerType: 'Regular Customer',
    productStatus: 'Ready to Sell',
    frontendStack: 'Nuxt 3 (JavaScript)',
    backendStack: 'Golang',
    database: 'MySQL',
    status: 'On Going',
    year: '2026',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600&auto=format&fit=crop',
    updatedAt: '2 weeks ago'
  }),
  createProject({
    id: '6',
    title: 'Government Service Portal',
    client: 'Kementerian Dalam Negeri',
    description: 'Digital service portal for government administration and citizen engagement.',
    industry: 'Government',
    companySize: 'Tier 1 : Strategic/Enterprise (>1T)',
    legalStructure: 'Goverment Institution',
    businessUnit: 'ITMS',
    product: 'Zabbix',
    customerType: 'Strategic Customer',
    productStatus: 'Ready to Sell',
    frontendStack: 'Vue.js (Vue, Vue2, Vue3)',
    backendStack: 'Python (Flask API, FastAPI)',
    database: 'PostgreSQL (Postgres)',
    status: 'On Going',
    year: '2026',
    image:
      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop',
    updatedAt: '3 weeks ago'
  }),
  createProject({
    id: '7',
    title: 'Internal ERP System',
    client: 'Internal Use',
    description: 'Integrated enterprise resource planning system for internal operations.',
    industry: 'Information Technology (IT) and Software',
    companySize: 'Tier 4 : Standard/Transactional (10B<50B)',
    legalStructure: 'Private Company',
    businessUnit: 'CSD',
    product: 'Bliv',
    customerType: 'Regular Customer',
    productStatus: 'Under Development',
    frontendStack: 'PHP (CI3, CI4)',
    backendStack: 'PHP (CI3, CI4)',
    database: 'MySQL',
    status: 'On Proposal',
    year: '2026',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
    updatedAt: '1 month ago'
  }),
  createProject({
    id: '8',
    title: 'Renewable Energy Dashboard',
    client: 'Green Energy Corp',
    description: 'Monitoring and analytics platform for renewable energy assets.',
    industry: 'Renewable Energy',
    companySize: 'Tier 2 : Growth/Valued (100B<1T)',
    legalStructure: 'State-owned Enterprise',
    businessUnit: 'SI',
    product: 'Semeru',
    customerType: 'Strategic Customer',
    productStatus: 'Ready to Sell',
    frontendStack: 'Flutter 3',
    backendStack: 'Python (Flask API, FastAPI)',
    database: 'TimescaleDB',
    status: 'On Going',
    year: '2025',
    image:
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=600&auto=format&fit=crop',
    updatedAt: '1 month ago'
  }),
  createProject({
    id: '9',
    title: 'Property Management System',
    client: 'Properti Sejahtera',
    description: 'Property asset management and tenant service platform.',
    industry: 'Real Estate Technology (PropTech)',
    companySize: 'Tier 3 : Standard/Transactional (50B<100B)',
    legalStructure: 'Private Company',
    businessUnit: 'ITMS',
    product: 'Bliv',
    customerType: 'Regular Customer',
    productStatus: 'Ready to Sell',
    frontendStack: 'Vue.js (Vue, Vue2, Vue3)',
    backendStack: 'PHP (Laravel)',
    database: 'PostgreSQL (Postgres)',
    status: 'Closed',
    year: '2024',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
    updatedAt: '1 month ago'
  }),
  createProject({
    id: '10',
    title: 'Education Learning Platform',
    client: 'EduTech Indonesia',
    description: 'Online learning platform with interactive content and assessment.',
    industry: 'Education',
    companySize: 'Tier 3 : Standard/Transactional (50B<100B)',
    legalStructure: 'Private Company',
    businessUnit: 'CSD',
    product: 'Teslakom',
    customerType: 'Regular Customer',
    productStatus: 'Under Development',
    frontendStack: 'React',
    backendStack: 'Golang',
    database: 'PostgreSQL (Postgres)',
    status: 'On Going',
    year: '2025',
    image:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop',
    updatedAt: '1 month ago'
  }),
  createProject({
    id: '11',
    title: 'Inventory Management System',
    client: 'Supply Chain Co.',
    description: 'Inventory tracking and warehouse operations solution.',
    industry: 'Retail and Wholesale Trade',
    companySize: 'Tier 4 : Standard/Transactional (10B<50B)',
    legalStructure: 'Private Company',
    businessUnit: 'SI',
    product: 'Zabbix',
    customerType: 'Regular Customer',
    productStatus: 'On Hold',
    frontendStack: 'PHP (CI3, CI4)',
    backendStack: 'PHP (CI3, CI4)',
    database: 'MySQL',
    status: 'On Going',
    year: '2026',
    image:
      'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=600&auto=format&fit=crop',
    updatedAt: '1 month ago'
  }),
  createProject({
    id: '12',
    title: 'Legacy System Migration',
    client: 'Internal Use',
    description: 'Migration of legacy systems to modern cloud infrastructure.',
    industry: 'Information Technology (IT) and Software',
    companySize: 'Tier 2 : Growth/Valued (100B<1T)',
    legalStructure: 'Private Company',
    businessUnit: 'ITMS',
    product: 'Zabbix',
    customerType: 'Strategic Customer',
    productStatus: 'Deprecated',
    frontendStack: 'Vue.js (Vue, Vue2, Vue3)',
    backendStack: 'Python (Flask API, FastAPI)',
    database: 'PostgreSQL (Postgres)',
    status: 'Canceled',
    year: '2024',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
    updatedAt: '2 months ago'
  })
])

const filteredProjects = computed(() => {
  return dummyProjects.value.filter((project) => {
    const keyword = activeFilters.value.search.trim().toLowerCase()
    const matchSearch
      = !keyword
        || project.title.toLowerCase().includes(keyword)
        || project.client.toLowerCase().includes(keyword)
        || project.description.toLowerCase().includes(keyword)
        || project.product?.toLowerCase().includes(keyword)

    const matches = (value: string | undefined, filter: string) =>
      !filter || value === filter

    return (
      matchSearch
      && matches(project.industry, activeFilters.value.industry)
      && matches(project.companySize, activeFilters.value.companySize)
      && matches(project.legalStructure, activeFilters.value.legalStructure)
      && matches(project.businessUnit, activeFilters.value.businessUnit)
      && matches(project.product, activeFilters.value.product)
      && matches(project.customerType, activeFilters.value.customerType)
      && matches(project.productStatus, activeFilters.value.productStatus)
      && matches(project.status, activeFilters.value.status)
      && matches(project.frontendStack, activeFilters.value.frontendStack)
      && matches(project.backendStack, activeFilters.value.backendStack)
      && matches(project.database, activeFilters.value.database)
      && matches(project.year, activeFilters.value.year)
    )
  })
})

const totalProjectsCount = computed(() => filteredProjects.value.length)

const handleFilterChange = (newFilters: PortfolioFilterState) => {
  activeFilters.value = newFilters
}

const handleResetFilter = () => {
  activeFilters.value = createPortfolioFilterState()
}

const handleAddProject = () => {
  editingProject.value = null
  isFormOpen.value = true
}

const handleEditProject = (project: ProjectItem) => {
  editingProject.value = project
  isFormOpen.value = true
}

const handleSaveProject = (project: ProjectItem) => {
  const index = dummyProjects.value.findIndex(item => item.id === project.id)

  if (index >= 0) {
    dummyProjects.value[index] = project
  } else {
    dummyProjects.value.unshift(project)
  }

  isFormOpen.value = false
  editingProject.value = null
}

const handleDeleteProject = (project: ProjectItem) => {
  if (!window.confirm(`Delete portfolio "${project.title}"?`)) return

  dummyProjects.value = dummyProjects.value.filter(item => item.id !== project.id)
}

const handleViewDetail = (project: ProjectItem) => {
  navigateTo(`/portofolio/${project.id}`)
}
</script>

<template>
  <div class="space-y-6">
    <PortofolioHeader @add-project="handleAddProject" />

    <PortofolioFilter
      @filter-change="handleFilterChange"
      @reset="handleResetFilter"
    />

    <PortofolioToolbar
      v-model:current-view="viewMode"
      v-model:sort-by="sortBy"
      :total-count="totalProjectsCount"
    />

    <div class="transition-all duration-200">
      <PortofolioGrid
        v-if="viewMode === 'grid'"
        :projects="filteredProjects"
        @view-detail="handleViewDetail"
      />

      <PortofolioTable
        v-else
        :projects="filteredProjects"
        @view-detail="handleViewDetail"
        @edit="handleEditProject"
        @delete="handleDeleteProject"
      />

      <div
        v-if="filteredProjects.length === 0"
        class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
      >
        <UIcon
          name="i-lucide-search-x"
          class="mx-auto h-8 w-8 text-slate-300"
        />
        <p class="mt-3 text-sm font-semibold text-slate-700">
          No portfolio matches the selected filters.
        </p>
        <p class="mt-1 text-xs text-slate-500">
          Adjust or reset the filters to see more projects.
        </p>
      </div>
    </div>

    <div class="pt-4">
      <PortofolioPagination
        v-model:current-page="currentPage"
        :total-items="totalProjectsCount"
        :page-size="pageSize"
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
