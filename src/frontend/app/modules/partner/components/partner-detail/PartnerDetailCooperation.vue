<script setup lang="ts">
import { computed } from 'vue'
import { formatCmsDate } from '~/modules/cms/utils/cmsFormat'
import type { PartnerDetail } from '../../types/partner.types'

interface Props {
  detail: PartnerDetail
}

const props = defineProps<Props>()

const projects = computed(() => props.detail.cooperationProjects)

const roleChipClass = (role: string): string =>
  role === 'principal'
    ? 'border-violet-200 bg-violet-50 text-violet-700'
    : 'border-sky-200 bg-sky-50 text-sky-700'

const progressWidth = (percent: number | null): string =>
  `${Math.min(Math.max(percent ?? 0, 0), 100)}%`
</script>

<template>
  <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
    <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon
          name="i-lucide-history"
          class="h-3.5 w-3.5"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-bold tracking-tight text-slate-900">
          Cooperation History
        </h3>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Company projects delivered together with this partner
        </p>
      </div>
      <span
        v-if="projects.length"
        class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
      >
        {{ projects.length }} projects
      </span>
    </div>

    <div
      v-if="projects.length"
      class="mt-3 space-y-2.5"
    >
      <div
        v-for="project in projects"
        :key="project.id"
        class="rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50/70"
      >
        <div class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <NuxtLink
                :to="`/admin/content/tech-task?mode=detail&id=${project.id}`"
                class="truncate text-xs font-semibold text-slate-800 transition-colors hover:text-blue-600 hover:underline"
              >
                {{ project.projectName }}
              </NuxtLink>
              <span class="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                {{ project.projectCode }}
              </span>
              <span
                class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize"
                :class="roleChipClass(project.partnerRole)"
              >
                {{ project.partnerRole }}
              </span>
            </div>

            <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-400">
              <span class="inline-flex items-center gap-1">
                <UIcon
                  name="i-lucide-calendar"
                  class="h-3 w-3"
                />
                {{ project.startDate ? formatCmsDate(project.startDate) : '—' }}
                -
                {{ project.endDate ? formatCmsDate(project.endDate) : '—' }}
              </span>
              <span
                v-if="project.customerName"
                class="inline-flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-user"
                  class="h-3 w-3"
                />
                {{ project.customerName }}
              </span>
              <span
                v-if="project.projectStatusName"
                class="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500"
              >
                {{ project.projectStatusName }}
              </span>
            </div>

            <p
              v-if="project.partnerContribution"
              class="mt-1.5 text-[11px] leading-5 text-slate-500"
            >
              {{ project.partnerContribution }}
            </p>
          </div>

          <div class="w-full shrink-0 lg:w-44">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-semibold text-slate-500">
                Progress
              </span>
              <span class="text-[11px] font-bold text-slate-700">
                {{ project.progressPercent ?? 0 }}%
              </span>
            </div>
            <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full transition-all"
                :class="(project.progressPercent ?? 0) >= 100 ? 'bg-emerald-500' : 'bg-blue-500'"
                :style="{ width: progressWidth(project.progressPercent) }"
              />
            </div>
            <p class="mt-1 text-right text-[10px] font-medium text-slate-400">
              Year {{ project.year }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="mt-3 flex flex-col items-center gap-2 py-6 text-center"
    >
      <UIcon
        name="i-lucide-clipboard-list"
        class="h-6 w-6 text-slate-300"
      />
      <div>
        <p class="text-[11px] font-semibold text-slate-600">
          No cooperation history yet
        </p>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Projects involving this partner will be listed here automatically.
        </p>
      </div>
    </div>
  </section>
</template>
