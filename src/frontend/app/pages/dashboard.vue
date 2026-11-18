<script setup lang="ts">
import ExecutiveDashboard from '../modules/dashboard/components/executive/ExecutiveDashboardView.vue'
import CommercialDashboard from '../modules/dashboard/components/commercial/CommercialDashboardView.vue'
import EngineeringDashboard from '../modules/dashboard/components/engineering/EngineeringDashboardView.vue'

const { activeRole } = useDashboardRole()
const { selectedRangeLabel, rangeMenuItems } = useDashboardRange()
</script>

<template>
  <div class="flex flex-col gap-2">
    <ExecutiveDashboard v-if="activeRole === 'executive'" />
    <CommercialDashboard v-else-if="activeRole === 'commercial'" />
    <EngineeringDashboard v-else-if="activeRole === 'engineering'" />
  </div>
</template>
