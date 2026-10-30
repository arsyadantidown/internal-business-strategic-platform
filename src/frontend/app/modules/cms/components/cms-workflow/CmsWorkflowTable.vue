<script setup lang="ts">
import type { CmsWorkflowStage } from '../../types/cms.types'
import type { CmsWorkflowItem } from '../../types/cmsWorkflow.types'
import { cmsWorkflowStageMeta } from '../../composables/useCmsPartnershipWorkflow'
import { formatCmsDate, formatCmsDateTime, getCmsInitials } from '../../utils/cmsFormat'

interface Props {
  items: CmsWorkflowItem[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'move', item: CmsWorkflowItem, stage: CmsWorkflowStage): void
  (e: 'reset', item: CmsWorkflowItem): void
}>()

const stageOptions = cmsWorkflowStageMeta.map(meta => meta.stage)

const getStageMeta = (stage: CmsWorkflowStage) =>
  cmsWorkflowStageMeta.find(meta => meta.stage === stage) ?? cmsWorkflowStageMeta[0]!

const handleStageChange = (item: CmsWorkflowItem, event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('move', item, target.value as CmsWorkflowStage)
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[980px] border-collapse text-left">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50/80">
            <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Partner
            </th>
            <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Category
            </th>
            <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Workflow Stage
            </th>
            <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Partner Status
            </th>
            <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Contract
            </th>
            <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Active Project
            </th>
            <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Last Updated
            </th>
            <th class="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-bold text-blue-600">
                  {{ getCmsInitials(item.name) }}
                </span>
                <div class="min-w-0">
                  <p class="max-w-52 truncate text-[11px] font-bold text-slate-800">
                    {{ item.name }}
                  </p>
                  <p class="text-[10px] text-slate-400">
                    {{ item.id }} · {{ item.partnerType }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <p class="text-[11px] font-medium text-slate-600">
                {{ item.category }}
              </p>
              <p class="text-[10px] text-slate-400">
                {{ item.industry }}
              </p>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1.5">
                <select
                  :value="item.stage"
                  class="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 outline-none transition-colors focus:border-blue-300"
                  aria-label="Workflow stage"
                  @change="handleStageChange(item, $event)"
                >
                  <option
                    v-for="stage in stageOptions"
                    :key="stage"
                    :value="stage"
                  >
                    {{ stage }}
                  </option>
                </select>
                <span
                  v-if="item.isOverride"
                  class="inline-flex h-5 items-center rounded-full border border-sky-200 bg-sky-50 px-1.5 text-[8px] font-bold uppercase text-sky-600"
                >
                  Custom
                </span>
              </div>
              <p class="mt-1 text-[9px] text-slate-400">
                {{ getStageMeta(item.stage).description }}
              </p>
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                {{ item.status }}
              </span>
              <p class="mt-1 text-[9px] text-slate-400">
                {{ item.contractStatus }}
              </p>
            </td>
            <td class="px-4 py-3">
              <p class="text-[10px] font-medium text-slate-600">
                {{ formatCmsDate(item.contractEndDate) }}
              </p>
              <p class="text-[9px] text-slate-400">
                {{ item.location }}
              </p>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1 text-[10px] font-semibold"
                :class="item.hasActiveProject ? 'text-emerald-600' : 'text-slate-400'"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="item.hasActiveProject ? 'bg-emerald-500' : 'bg-slate-300'"
                />
                {{ item.hasActiveProject ? 'Active' : 'None' }}
              </span>
            </td>
            <td class="px-4 py-3 text-[10px] text-slate-500">
              {{ formatCmsDateTime(item.lastUpdated) }}
            </td>
            <td class="px-4 py-3 text-right">
              <button
                v-if="item.isOverride"
                type="button"
                class="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[9px] font-semibold text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                @click="emit('reset', item)"
              >
                <UIcon
                  name="i-lucide-rotate-ccw"
                  class="h-3 w-3"
                />
                Reset
              </button>
              <span
                v-else
                class="text-[9px] text-slate-300"
              >
                Derived
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="items.length === 0"
      class="flex flex-col items-center justify-center px-6 py-14 text-center"
    >
      <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <UIcon
          name="i-lucide-search-x"
          class="h-5 w-5"
        />
      </div>
      <p class="mt-3 text-xs font-bold text-slate-700">
        No partners match the current filters
      </p>
      <p class="mt-1 text-[11px] text-slate-400">
        Adjust the search or filter selections to see more records.
      </p>
    </div>
  </div>
</template>
