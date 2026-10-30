<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CmsWorkflowStage } from '../../types/cms.types'
import type { CmsWorkflowItem, CmsWorkflowViewMode } from '../../types/cmsWorkflow.types'
import {
  cmsWorkflowStageMeta,
  useCmsPartnershipWorkflow
} from '../../composables/useCmsPartnershipWorkflow'
import CmsWorkflowCard from './CmsWorkflowCard.vue'
import CmsWorkflowTable from './CmsWorkflowTable.vue'

const toast = useToast()

const {
  search,
  stageFilter,
  categoryFilter,
  categoryOptions,
  filteredItems,
  stageCounts,
  groupedItems,
  collaborationRows,
  moveStage,
  resetStage,
  exportPartnerDatabase,
  exportCollaborationHistory
} = useCmsPartnershipWorkflow()

const viewMode = ref<CmsWorkflowViewMode>('board')
const draggingItem = ref<CmsWorkflowItem | null>(null)
const dragOverStage = ref<CmsWorkflowStage | null>(null)

const hasFilters = computed(() =>
  Boolean(search.value.trim()) || stageFilter.value !== 'all' || categoryFilter.value !== 'all'
)

const boardStats = computed(() =>
  cmsWorkflowStageMeta.map(meta => ({
    ...meta,
    count: stageCounts.value[meta.stage]
  }))
)

const resetFilters = () => {
  search.value = ''
  stageFilter.value = 'all'
  categoryFilter.value = 'all'
}

const handleStageFilter = (event: Event) => {
  stageFilter.value = (event.target as HTMLSelectElement).value as 'all' | CmsWorkflowStage
}

const handleMove = (item: CmsWorkflowItem, stage: CmsWorkflowStage) => {
  if (!moveStage(item, stage)) return

  toast.add({
    title: 'Workflow stage updated',
    description: `${item.name} moved from ${item.stage} to ${stage}.`,
    color: 'success'
  })
}

const handleReset = (item: CmsWorkflowItem) => {
  if (!resetStage(item)) return

  toast.add({
    title: 'Stage override removed',
    description: `${item.name} now follows its partner status.`,
    color: 'neutral'
  })
}

const handleDragStart = (event: DragEvent, item: CmsWorkflowItem) => {
  draggingItem.value = item
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.id)
  }
}

const handleDragEnd = () => {
  draggingItem.value = null
  dragOverStage.value = null
}

const handleDrop = (stage: CmsWorkflowStage) => {
  dragOverStage.value = null
  const item = draggingItem.value
  draggingItem.value = null
  if (!item) return

  handleMove(item, stage)
}

const handleExportPartners = () => {
  const count = filteredItems.value.length
  exportPartnerDatabase()
  toast.add({
    title: 'Partner database exported',
    description: `${count} records were written to CSV.`,
    color: 'success'
  })
}

const handleExportCollaborations = () => {
  const count = collaborationRows.value.length
  exportCollaborationHistory()
  toast.add({
    title: 'Collaboration history exported',
    description: `${count} collaboration records were written to CSV.`,
    color: 'success'
  })
}
</script>

<template>
  <div class="space-y-4 pb-8">
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UIcon
              name="i-lucide-columns-3"
              class="h-5 w-5"
            />
          </div>
          <div>
            <h1 class="text-base font-bold tracking-tight text-slate-900">
              Partnership Workflow
            </h1>
            <p class="mt-0.5 max-w-2xl text-[11px] leading-5 text-slate-500">
              Track partner onboarding from verification through evaluation and active collaboration.
              Stages are derived from partner status and can be adjusted locally.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600 shadow-2xs transition-colors hover:bg-slate-50"
            @click="handleExportCollaborations"
          >
            <UIcon
              name="i-lucide-history"
              class="h-3.5 w-3.5"
            />
            Collaboration History
          </button>
          <button
            type="button"
            class="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[10px] font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
            @click="handleExportPartners"
          >
            <UIcon
              name="i-lucide-download"
              class="h-3.5 w-3.5"
            />
            Partner Database
          </button>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      <button
        v-for="stat in boardStats"
        :key="stat.stage"
        type="button"
        class="rounded-xl border bg-white p-3 text-left shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-sm"
        :class="stageFilter === stat.stage ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'"
        @click="stageFilter = stageFilter === stat.stage ? 'all' : stat.stage"
      >
        <div class="flex items-center justify-between gap-2">
          <span
            class="flex h-7 w-7 items-center justify-center rounded-lg border text-[10px]"
            :class="stat.chipClass"
          >
            <UIcon
              :name="stat.icon"
              class="h-3.5 w-3.5"
            />
          </span>
          <span class="text-lg font-bold tabular-nums text-slate-900">{{ stat.count }}</span>
        </div>
        <p class="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {{ stat.label }}
        </p>
        <p class="mt-0.5 line-clamp-2 text-[9px] leading-4 text-slate-400">
          {{ stat.description }}
        </p>
      </button>
    </section>

    <section class="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
      <div class="relative min-w-52 flex-1">
        <UIcon
          name="i-lucide-search"
          class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search partner, ID, industry, expertise..."
          class="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-8 pr-3 text-[11px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
        >
      </div>

      <select
        :value="stageFilter"
        class="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 outline-none transition-colors focus:border-blue-300"
        aria-label="Filter by workflow stage"
        @change="handleStageFilter"
      >
        <option value="all">
          All stages
        </option>
        <option
          v-for="meta in cmsWorkflowStageMeta"
          :key="meta.stage"
          :value="meta.stage"
        >
          {{ meta.label }}
        </option>
      </select>

      <select
        v-model="categoryFilter"
        class="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 outline-none transition-colors focus:border-blue-300"
        aria-label="Filter by partner category"
      >
        <option value="all">
          All categories
        </option>
        <option
          v-for="category in categoryOptions"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>

      <button
        v-if="hasFilters"
        type="button"
        class="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-500 transition-colors hover:bg-slate-50"
        @click="resetFilters"
      >
        <UIcon
          name="i-lucide-x"
          class="h-3 w-3"
        />
        Clear
      </button>

      <div class="ml-auto flex items-center gap-2">
        <span class="text-[10px] font-medium text-slate-400">
          {{ filteredItems.length }} of {{ Object.values(stageCounts).reduce((sum, count) => sum + count, 0) }} partners
        </span>
        <div class="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            class="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-semibold transition-colors"
            :class="viewMode === 'board' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'"
            @click="viewMode = 'board'"
          >
            <UIcon
              name="i-lucide-columns-3"
              class="h-3 w-3"
            />
            Board
          </button>
          <button
            type="button"
            class="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-semibold transition-colors"
            :class="viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'"
            @click="viewMode = 'table'"
          >
            <UIcon
              name="i-lucide-table-2"
              class="h-3 w-3"
            />
            Table
          </button>
        </div>
      </div>
    </section>

    <section
      v-if="viewMode === 'board'"
      class="overflow-x-auto pb-2"
    >
      <div class="grid min-w-[1180px] grid-cols-5 gap-3">
        <div
          v-for="meta in cmsWorkflowStageMeta"
          :key="meta.stage"
          class="flex min-h-[420px] flex-col rounded-xl border p-2.5 transition-colors"
          :class="[
            meta.columnClass,
            dragOverStage === meta.stage ? 'ring-2 ring-blue-300' : ''
          ]"
          @dragover.prevent="dragOverStage = meta.stage"
          @dragleave="dragOverStage = null"
          @drop.prevent="handleDrop(meta.stage)"
        >
          <div class="mb-2.5 flex items-center justify-between gap-2 px-0.5">
            <div class="flex items-center gap-1.5">
              <span
                class="h-2 w-2 rounded-full"
                :class="meta.dotClass"
              />
              <h2 class="text-[11px] font-bold text-slate-700">
                {{ meta.label }}
              </h2>
            </div>
            <span class="inline-flex min-w-5 items-center justify-center rounded-full border border-white/70 bg-white/80 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-slate-500">
              {{ stageCounts[meta.stage] }}
            </span>
          </div>

          <div class="flex flex-1 flex-col gap-2">
            <CmsWorkflowCard
              v-for="item in groupedItems[meta.stage]"
              :key="item.id"
              :item="item"
              :meta="meta"
              @drag-start="handleDragStart($event, item)"
              @dragend="handleDragEnd"
              @move="handleMove(item, $event)"
              @reset="handleReset(item)"
            />

            <div
              v-if="groupedItems[meta.stage].length === 0"
              class="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200/80 bg-white/40 px-3 py-8 text-center"
            >
              <p class="text-[10px] font-medium text-slate-400">
                Drop partners here
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <CmsWorkflowTable
      v-else
      :items="filteredItems"
      @move="handleMove"
      @reset="handleReset"
    />

    <p class="flex items-start gap-1.5 px-1 text-[9px] leading-4 text-slate-400">
      <UIcon
        name="i-lucide-info"
        class="mt-0.5 h-3 w-3 shrink-0"
      />
      Workflow stage changes and export actions are recorded in the administrative audit trail.
      Stage overrides are stored in this browser; production workflows require backend persistence.
    </p>
  </div>
</template>
