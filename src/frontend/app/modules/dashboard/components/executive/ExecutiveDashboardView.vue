<script setup lang="ts">
import ExecutiveHeaderFilter from './ExecutiveHeaderFilter.vue'
import ExecutiveStatCards from './ExecutiveStatCards.vue'
import ExecutiveProjectsByIndustryCard from './ExecutiveProjectsByIndustryCard.vue'
import ExecutiveProjectStatusCard from './ExecutiveProjectStatusCard.vue'
import ExecutiveBusinessUnitShareCard from './ExecutiveBusinessUnitShareCard.vue'

// Handler saat filter diubah atau di-reset
const handleFilterChange = (filters: any) => {
  console.log('Filters updated:', filters)
}

const handleFilterReset = () => {
  console.log('Filters reset to default')
}
</script>

<template>
  <div class="flex flex-col gap-4 pb-8 font-sans">
    <!-- 1. Header & Filter Bar (Search, Reset, Featured Toggle, Main & More Filters) -->
    <ExecutiveHeaderFilter @update:filters="handleFilterChange" @reset="handleFilterReset" />

    <!-- 2. KPI Summary Cards (4 Columns) -->
    <ExecutiveStatCards />

    <!-- 3. Main Analytics Grid (Projects by Industry & Project Status + BU Share) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
      <!-- Left Column: Projects by Industry (Lebar 7 / 12) -->
      <div class="lg:col-span-7">
        <ExecutiveProjectsByIndustryCard />
      </div>

      <!-- Right Column: Project Status Donut + Business Unit Share (Lebar 5 / 12) -->
      <div class="lg:col-span-5 flex flex-col gap-4">
        <ExecutiveProjectStatusCard />
        <ExecutiveBusinessUnitShareCard />
      </div>
    </div>
  </div>
</template>
