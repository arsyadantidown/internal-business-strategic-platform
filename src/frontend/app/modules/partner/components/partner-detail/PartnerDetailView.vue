<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePartnerStore } from '../../stores/partner.store'
import PartnerDetailHeader from './PartnerDetailHeader.vue'
import PartnerProjectCard from './PartnerProjectCard.vue'

interface Props {
  partnerId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const partnerStore = usePartnerStore()
const { detail, isDetailLoading: isLoading, detailError: loadError } = storeToRefs(partnerStore)

const fetchDetail = () => partnerStore.fetchPartnerDetail(props.partnerId)

onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Skeleton Loading -->
    <div v-if="isLoading" class="space-y-4">
      <div class="h-20 animate-pulse rounded-2xl bg-slate-100" />
      <div class="h-64 animate-pulse rounded-2xl bg-slate-100" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="loadError"
      class="rounded-2xl border border-slate-200/80 bg-white p-10 shadow-xs"
    >
      <div class="flex flex-col items-center gap-2.5 text-center">
        <UIcon name="i-lucide-circle-alert" class="h-8 w-8 text-rose-500" />
        <div>
          <p class="text-sm font-semibold text-slate-800">Failed to load partner detail</p>
          <p class="mt-1 text-xs text-slate-500">
            {{ loadError }}
          </p>
        </div>
        <button
          type="button"
          class="mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 cursor-pointer"
          @click="fetchDetail"
        >
          <UIcon name="i-lucide-rotate-ccw" class="h-3.5 w-3.5" />
          <span>Retry</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="detail" class="space-y-6">
      <PartnerDetailHeader :detail="detail" @back="emit('back')" />

      <!-- Section Title: Associated Projects -->
      <div class="space-y-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UIcon name="i-lucide-briefcase" class="h-5 w-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-slate-900">Associated Projects</h2>
              <span class="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                {{ detail.cooperationProjects?.length || 0 }} Projects
              </span>
            </div>
            <p class="text-xs text-slate-400">
              Portfolio projects executed in collaboration with this partner
            </p>
          </div>
        </div>

        <!-- Project Cards List -->
        <div v-if="detail.cooperationProjects?.length" class="space-y-4">
          <PartnerProjectCard
            v-for="project in detail.cooperationProjects"
            :key="project.id"
            :project="project"
          />
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center"
        >
          <UIcon name="i-lucide-folder-x" class="h-10 w-10 text-slate-300" />
          <p class="mt-2 text-sm font-semibold text-slate-700">No associated projects</p>
          <p class="mt-1 text-xs text-slate-400 max-w-sm">
            This partner hasn't been linked to any portfolio projects yet.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
