<script setup lang="ts">
import type { CmsWorkflowStage } from '../../types/cms.types'
import type { CmsWorkflowItem, CmsWorkflowStageMeta } from '../../types/cmsWorkflow.types'
import { cmsWorkflowStageMeta } from '../../composables/useCmsPartnershipWorkflow'
import { formatCmsDate, getCmsInitials } from '../../utils/cmsFormat'

interface Props {
  item: CmsWorkflowItem
  meta: CmsWorkflowStageMeta
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'move', stage: CmsWorkflowStage): void
  (e: 'reset'): void
  (e: 'drag-start', event: DragEvent): void
}>()

const stageOptions = cmsWorkflowStageMeta.map(meta => meta.stage)

const handleStageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('move', target.value as CmsWorkflowStage)
}
</script>

<template>
  <article
    draggable="true"
    class="group cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md active:cursor-grabbing"
    @dragstart="emit('drag-start', $event)"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 items-start gap-2">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-bold text-blue-600">
          {{ getCmsInitials(item.name) }}
        </span>
        <div class="min-w-0">
          <p
            class="truncate text-xs font-bold text-slate-800"
            :title="item.name"
          >
            {{ item.name }}
          </p>
          <p class="text-[10px] font-medium text-slate-400">
            {{ item.id }}
          </p>
        </div>
      </div>

      <UIcon
        name="i-lucide-grip-vertical"
        class="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-400"
      />
    </div>

    <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
      <span
        class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold"
        :class="meta.chipClass"
      >
        <span
          class="h-1.5 w-1.5 rounded-full"
          :class="meta.dotClass"
        />
        {{ meta.label }}
      </span>
      <span class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-medium text-slate-500">
        {{ item.category }}
      </span>
    </div>

    <dl class="mt-3 grid grid-cols-2 gap-x-2 gap-y-2">
      <div>
        <dt class="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          Type
        </dt>
        <dd class="truncate text-[10px] font-medium text-slate-600">
          {{ item.partnerType }}
        </dd>
      </div>
      <div>
        <dt class="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          Industry
        </dt>
        <dd
          class="truncate text-[10px] font-medium text-slate-600"
          :title="item.industry"
        >
          {{ item.industry }}
        </dd>
      </div>
      <div>
        <dt class="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          Contract End
        </dt>
        <dd class="text-[10px] font-medium text-slate-600">
          {{ formatCmsDate(item.contractEndDate) }}
        </dd>
      </div>
      <div>
        <dt class="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          Active Project
        </dt>
        <dd class="flex items-center gap-1 text-[10px] font-medium">
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="item.hasActiveProject ? 'bg-emerald-500' : 'bg-slate-300'"
          />
          <span :class="item.hasActiveProject ? 'text-emerald-600' : 'text-slate-400'">
            {{ item.hasActiveProject ? 'Yes' : 'No' }}
          </span>
        </dd>
      </div>
    </dl>

    <div class="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5">
      <select
        :value="item.stage"
        class="h-7 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[10px] font-semibold text-slate-600 outline-none transition-colors focus:border-blue-300 focus:bg-white"
        aria-label="Move partner stage"
        @change="handleStageChange"
      >
        <option
          v-for="stage in stageOptions"
          :key="stage"
          :value="stage"
        >
          Move to {{ stage }}
        </option>
      </select>

      <button
        v-if="item.isOverride"
        type="button"
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
        title="Reset to derived stage"
        aria-label="Reset to derived stage"
        @click="emit('reset')"
      >
        <UIcon
          name="i-lucide-rotate-ccw"
          class="h-3 w-3"
        />
      </button>
    </div>
  </article>
</template>
