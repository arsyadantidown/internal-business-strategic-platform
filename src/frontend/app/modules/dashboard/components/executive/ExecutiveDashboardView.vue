<script setup lang="ts">
import { onMounted } from 'vue'
import { useDashboardStore } from '../../stores/dashboard.store'
import ExecutiveHeaderFilter from './ExecutiveHeaderFilter.vue'
import ExecutiveStatCards from './ExecutiveStatCards.vue'
import ExecutiveProjectsByIndustryCard from './ExecutiveProjectsByIndustryCard.vue'
import ExecutiveProjectStatusCard from './ExecutiveProjectStatusCard.vue'
import ExecutiveBusinessUnitShareCard from './ExecutiveBusinessUnitShareCard.vue'

const dashboardStore = useDashboardStore()

onMounted(() => {
  // Panggil semua API dashboard saat mount
  dashboardStore.fetchSummary({ is_featured: true })
  dashboardStore.fetchProjectsByBusinessUnit({ is_featured: true })
  dashboardStore.fetchProjectsByIndustry({ is_featured: true })
})

const handleFilterChange = (filters: any) => {
  const params = {
    search: filters.search || undefined,
    is_featured: filters.isFeatured ?? undefined,
    industry_id: filters.industry || undefined,
    project_status_id: filters.status || undefined,
    year: filters.year ? Number(filters.year) : undefined,
    company_size_id: filters.companySize || undefined,
    customer_name: filters.customerName || undefined,
    customer_location: filters.customerLocation || undefined,
    legal_structure_id: filters.legalStructure || undefined,
    business_unit_id: filters.businessUnit || undefined,
    customer_type_id: filters.customerType || undefined,
    frontend_tech_stack_id: filters.frontendStack || undefined,
    backend_tech_stack_id: filters.backendStack || undefined,
    database_tech_stack_id: filters.database || undefined
  }

  dashboardStore.fetchSummary(params)
  dashboardStore.fetchProjectsByBusinessUnit(params)
  dashboardStore.fetchProjectsByIndustry(params)
}

const handleFilterReset = () => {
  dashboardStore.fetchSummary({ is_featured: true })
  dashboardStore.fetchProjectsByBusinessUnit({ is_featured: true })
  dashboardStore.fetchProjectsByIndustry({ is_featured: true })
}
</script>

<template>
  <div class="flex flex-col gap-4 pb-8 font-sans">
    <!-- 1. Header & Filter Bar -->
    <ExecutiveHeaderFilter @update:filters="handleFilterChange" @reset="handleFilterReset" />

    <!-- 2. KPI Summary Cards -->
    <ExecutiveStatCards :stats="dashboardStore.statCardsData" />

    <!-- 3. Main Analytics Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
      <!-- Left Column: Projects by Industry -->
      <div class="lg:col-span-7">
        <ExecutiveProjectsByIndustryCard
          :industries="dashboardStore.industryList"
          :active-verticals-count="dashboardStore.industryList.length"
          :insight-text="dashboardStore.topIndustryInsight"
        />
      </div>

      <!-- Right Column: Project Status Donut + Business Unit Share -->
      <div class="lg:col-span-5 flex flex-col gap-4">
        <ExecutiveProjectStatusCard
          :total-projects="dashboardStore.summary.total_projects"
          :slices="dashboardStore.projectStatusSlices"
        />
        <ExecutiveBusinessUnitShareCard :units="dashboardStore.businessUnitShares" />
      </div>
    </div>
  </div>
</template>
