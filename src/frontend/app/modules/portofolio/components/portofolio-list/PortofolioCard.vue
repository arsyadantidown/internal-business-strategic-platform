<script setup lang="ts">
import type { ProjectItem } from '../../types/types.ts'
import PortofolioStatusBadge from './PortofolioStatusBadge.vue'

interface Props {
  project: ProjectItem
}
const DUMMY_IMAGE =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop'
defineProps<Props>()

const emit = defineEmits<{
  (e: 'view-detail', project: ProjectItem): void
}>()
</script>

<template>
  <div
    class="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
  >
    <!-- Card Image Header & Floating Badges -->
    <div class="relative h-44 w-full overflow-hidden bg-slate-100">
      <img
        :src="project.cover_image_url || DUMMY_IMAGE"
        :alt="project.title"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <!-- Floating Status Badge -->
      <div class="absolute top-3 left-3">
        <PortofolioStatusBadge :status="project.status" />
      </div>

      <!-- Floating Year Badge -->
      <div
        v-if="project.year"
        class="absolute top-3 right-3 rounded-full bg-slate-900/75 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs"
      >
        Year {{ project.year }}
      </div>
    </div>

    <!-- Card Content Body -->
    <div class="flex flex-1 flex-col p-4.5">
      <!-- Title -->
      <h3
        class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2"
      >
        {{ project.title }}
      </h3>

      <!-- Industry & Company Size Badges -->
      <div class="mt-2.5 flex flex-wrap gap-1.5">
        <span
          v-if="project.industry"
          class="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
        >
          {{ project.industry }}
        </span>
        <span
          v-if="project.companySize"
          class="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
        >
          {{ project.companySize }}
        </span>
      </div>

      <!-- Tech Stack Badges -->
      <div v-if="project.technologies?.length" class="mt-1.5 flex flex-wrap gap-1.5">
        <span
          v-for="tech in project.technologies"
          :key="tech"
          class="rounded-md border border-blue-100/80 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600"
        >
          {{ tech }}
        </span>
      </div>

      <!-- Description -->
      <p class="mt-3 flex-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
        {{ project.description }}
      </p>

      <!-- Footer Info -->
      <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span class="font-medium text-slate-400">Updated {{ project.updatedAt }}</span>

        <button
          type="button"
          class="inline-flex items-center gap-1 font-semibold text-blue-600 transition-colors hover:text-blue-700 cursor-pointer"
          @click="emit('view-detail', project)"
        >
          <span>View Details</span>
          <UIcon
            name="i-lucide-arrow-right"
            class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  </div>
</template>
