<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePortfolioStore } from '../../stores/portofolio.store'

import PortofolioHeroCarousel from './PortofolioHeroCarousel.vue'
import PortofolioProjectOverview from './PortofolioProjectOverview.vue'
import PortofolioBackgroundChallanges from './PortofolioBackgroundChallanges.vue'
import PortofolioImplementedSolution from './PortofolioImplementedSolution.vue'
import PortofolioSuccessMetrics from './PortofolioSuccessMetrics.vue'
import PortofolioMediaGallery from './PortofolioMediaGallery.vue'
import PortofolioCaseStudyDownload from './PortofolioCaseStudyDownload.vue'

import ProjectStatusCard from './ProjectStatusCard.vue'
import CustomerInfoCard from './CustomerInfoCard.vue'
import ProjectFinancialCard from './ProjectFinancialCard.vue'
import ProjectTechStackCard from './ProjectTechStackCard.vue'
import ProjectLocationCard from './ProjectLocationCard.vue'
import ProjectDocumentCard from './ProjectDocumentCard.vue'
import ProjectPartnersCard from './ProjectPartnersCard.vue'

const route = useRoute()
const projectId = String(route.params.id)

const portfolioStore = usePortfolioStore()

onMounted(() => {
  if (projectId) {
    portfolioStore.fetchProjectDetail(projectId)
  }
})

const handleBack = () => {
  navigateTo('/portofolio')
}

const handleEditProject = () => {
  // Arahkan ke CMS Edit jika ada
}
</script>

<template>
  <div class="space-y-6">
    <!-- 1. Header Toolbar & Breadcrumb -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4"
    >
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 cursor-pointer"
          @click="handleBack"
        >
          <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
        </button>
        <div>
          <h1 class="text-lg font-bold text-slate-900">
            {{ portfolioStore.currentProject?.title || 'Project Detail' }}
          </h1>
          <p class="text-xs text-slate-500">
            Portfolio Detail / {{ portfolioStore.currentProject?.client || '-' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="portfolioStore.isDetailLoading" class="flex justify-center items-center py-28">
      <div class="flex flex-col items-center gap-3">
        <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-blue-600" />
        <p class="text-sm font-medium text-slate-500">Loading project detail...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="portfolioStore.detailError"
      class="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
    >
      <UIcon name="i-lucide-alert-circle" class="mx-auto h-8 w-8 text-red-500" />
      <p class="mt-2 text-sm font-semibold text-red-800">{{ portfolioStore.detailError }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
        @click="portfolioStore.fetchProjectDetail(projectId)"
      >
        Retry
      </button>
    </div>

    <!-- Main Content Detail (Tampil jika project ada) -->
    <div
      v-else-if="portfolioStore.currentProject"
      class="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start"
    >
      <!-- Left Column (Main Content - 8 Kolom) -->
      <div class="space-y-6 lg:col-span-8">
        <!-- Hero Carousel -->
        <PortofolioHeroCarousel
          :title="portfolioStore.currentProject.title"
          :subtitle="portfolioStore.currentProject.description"
          :status="portfolioStore.currentProject.status"
          :images="portfolioStore.currentProject.heroImages"
          :tags="[
            portfolioStore.currentProject.industry,
            ...portfolioStore.currentProject.technologies
          ]"
        />

        <!-- Project Overview -->
        <PortofolioProjectOverview :overview-text="portfolioStore.currentProject.overview" />

        <!-- Background & Challenges -->
        <PortofolioBackgroundChallanges
          :background="portfolioStore.currentProject.background"
          :challenges="portfolioStore.currentProject.challenges"
        />

        <!-- Implemented Solution -->
        <PortofolioImplementedSolution :solutions="portfolioStore.currentProject.solutions" />

        <!-- Success Metrics -->
        <PortofolioSuccessMetrics
          v-if="portfolioStore.currentProject.metrics.length > 0"
          :metrics="portfolioStore.currentProject.metrics"
        />

        <!-- Media Gallery -->
        <PortofolioMediaGallery :media="portfolioStore.currentProject.mediaGallery" />

        <!-- Case Study Download -->
        <PortofolioCaseStudyDownload
          :title="portfolioStore.currentProject.title"
          :file-url="(portfolioStore.currentProject as any).caseStudyUrl"
        />
      </div>

      <!-- Right Column (Sidebar Metadata - 4 Kolom) -->
      <div class="space-y-6 lg:col-span-4">
        <!-- Project Status Card -->
        <ProjectStatusCard
          :status="portfolioStore.currentProject.status"
          :client="portfolioStore.currentProject.client"
          :period="portfolioStore.currentProject.period"
          :project-value="portfolioStore.currentProject.projectValue"
          :location="portfolioStore.currentProject.location"
          :business-unit="portfolioStore.currentProject.businessUnit"
          :project-manager="portfolioStore.currentProject.projectManager"
          :account-manager="portfolioStore.currentProject.accountManager"
          :contract-name="portfolioStore.currentProject.contractName"
          :contract-number="portfolioStore.currentProject.contractNumber"
          :last-updated="portfolioStore.currentProject.lastUpdated"
        />

        <!-- Customer Info Card -->
        <CustomerInfoCard
          :customer-name="portfolioStore.currentProject.client"
          :company-size="portfolioStore.currentProject.companySize"
          :customer-type="portfolioStore.currentProject.customerType"
          :legal-structure="portfolioStore.currentProject.legalStructure"
        />

        <!-- Financial Overview Card -->
        <ProjectFinancialCard
          :value-before-tax="portfolioStore.currentProject.valueBeforeTax"
          :value-after-tax="portfolioStore.currentProject.valueAfterTax"
          :carry-over-value="portfolioStore.currentProject.carryOverValue"
          :revenue="portfolioStore.currentProject.revenue"
          :cogs="portfolioStore.currentProject.cogs"
          :operational-cost="portfolioStore.currentProject.operationalCost"
          :net-profit="portfolioStore.currentProject.netProfit"
          :margin-profit-percent="portfolioStore.currentProject.marginProfitPercent"
        />

        <!-- Industry & Technology Card -->
        <ProjectTechStackCard
          :industry="portfolioStore.currentProject.industry"
          :technologies="portfolioStore.currentProject.technologies"
          :product="portfolioStore.currentProject.product || '-'"
        />

        <!-- Project Location Card -->
        <ProjectLocationCard :location-name="portfolioStore.currentProject.location" />

        <!-- Internal Documentation Card -->
        <ProjectDocumentCard :documents="portfolioStore.currentProject.documents" />

        <!-- Related Partners Card -->
        <ProjectPartnersCard
          v-if="portfolioStore.currentProject.partners.length > 0"
          :partners="portfolioStore.currentProject.partners"
        />
      </div>
    </div>
  </div>
</template>
