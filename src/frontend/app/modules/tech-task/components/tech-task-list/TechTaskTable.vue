<script setup lang="ts">
import { computed } from 'vue'
import { formatCmsDate } from '~/modules/cms/utils/cmsFormat'
import type { TechTaskListItem } from '../../types/tech-task.types'
import TechTaskProgressCell from './TechTaskProgressCell.vue'
import TechTaskStatusBadge from './TechTaskStatusBadge.vue'

interface Props {
  items: TechTaskListItem[]
  isLoading: boolean
  loadError: string
  total: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'view' | 'edit', item: TechTaskListItem): void
  (e: 'retry'): void
}>()

const flattenedStacks = computed(() =>
  props.items.map(item => [
    ...item.techStacks.frontend,
    ...item.techStacks.backend,
    ...item.techStacks.dataStorage
  ])
)

const stackChipClasses: Record<string, string> = {
  frontend: 'border-sky-200 bg-sky-50 text-sky-700',
  backend: 'border-violet-200 bg-violet-50 text-violet-700',
  data_storage: 'border-amber-200 bg-amber-50 text-amber-700'
}

const stackChipTone = (itemIndex: number, stackIndex: number): string => {
  const item = props.items[itemIndex]
  if (!item) return 'border-slate-200 bg-slate-100 text-slate-600'

  if (stackIndex < item.techStacks.frontend.length) return stackChipClasses.frontend ?? ''
  if (stackIndex < item.techStacks.frontend.length + item.techStacks.backend.length) {
    return stackChipClasses.backend ?? ''
  }
  return stackChipClasses.data_storage ?? ''
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
    <div class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-sm font-semibold text-slate-900">
          Tech Task Directory
        </h2>
        <p class="text-[11px] font-medium text-slate-500">
          {{ total }} technical works registered
        </p>
      </div>
      <p class="text-[10px] font-medium text-slate-400">
        Sorted by last update
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[880px] text-left text-xs">
        <thead class="border-b border-slate-100 bg-slate-50/70">
          <tr>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Technical Work
            </th>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Tech Stacks
            </th>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Status
            </th>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Progress
            </th>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Year
            </th>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Updated
            </th>
            <th class="px-4 py-3 text-right text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody
          v-if="isLoading"
          class="divide-y divide-slate-100"
        >
          <tr
            v-for="row in 6"
            :key="row"
            class="animate-pulse"
          >
            <td class="px-4 py-3">
              <div class="h-3.5 w-44 rounded-full bg-slate-100" />
              <div class="mt-2 h-2.5 w-24 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="h-5 w-36 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="h-5 w-20 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="h-1.5 w-28 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="h-3.5 w-8 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="h-3.5 w-16 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="ml-auto h-6 w-20 rounded-lg bg-slate-100" />
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="loadError">
          <tr>
            <td
              colspan="7"
              class="px-4 py-10"
            >
              <div class="flex flex-col items-center gap-2.5 text-center">
                <UIcon
                  name="i-lucide-circle-alert"
                  class="h-8 w-8 text-red-400"
                />
                <div>
                  <p class="text-xs font-semibold text-slate-700">
                    Failed to load tech tasks
                  </p>
                  <p class="mt-0.5 max-w-md text-[11px] text-slate-500">
                    {{ loadError }}
                  </p>
                </div>
                <button
                  type="button"
                  class="mt-1 inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 cursor-pointer"
                  @click="emit('retry')"
                >
                  <UIcon
                    name="i-lucide-rotate-ccw"
                    class="h-3.5 w-3.5"
                  />
                  <span>Retry</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="items.length === 0">
          <tr>
            <td
              colspan="7"
              class="px-4 py-10"
            >
              <div class="flex flex-col items-center gap-2.5 text-center">
                <UIcon
                  name="i-lucide-clipboard-list"
                  class="h-8 w-8 text-slate-300"
                />
                <div>
                  <p class="text-xs font-semibold text-slate-700">
                    No technical works found
                  </p>
                  <p class="mt-0.5 text-[11px] text-slate-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody
          v-else
          class="divide-y divide-slate-100"
        >
          <tr
            v-for="(item, itemIndex) in items"
            :key="item.id"
            class="transition-colors hover:bg-slate-50/70"
          >
            <td class="max-w-xs px-4 py-3">
              <div class="flex items-center gap-1.5">
                <span class="truncate text-xs font-semibold text-slate-800">
                  {{ item.projectName }}
                </span>
                <UIcon
                  v-if="item.isFeatured"
                  name="i-lucide-sparkles"
                  class="h-3 w-3 shrink-0 text-amber-500"
                  title="Featured project"
                />
              </div>
              <div class="mt-1 flex flex-wrap items-center gap-1.5">
                <span class="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                  {{ item.projectCode }}
                </span>
                <span
                  v-if="item.customerName"
                  class="truncate text-[10px] text-slate-400"
                >
                  {{ item.customerName }}
                </span>
              </div>
            </td>

            <td class="px-4 py-3">
              <div
                v-if="flattenedStacks[itemIndex]?.length"
                class="flex max-w-56 flex-wrap gap-1"
              >
                <span
                  v-for="(stack, stackIndex) in flattenedStacks[itemIndex]?.slice(0, 3)"
                  :key="stack.id"
                  class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
                  :class="stackChipTone(itemIndex, stackIndex)"
                >
                  {{ stack.name }}
                </span>
                <span
                  v-if="(flattenedStacks[itemIndex]?.length ?? 0) > 3"
                  class="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                >
                  +{{ (flattenedStacks[itemIndex]?.length ?? 0) - 3 }}
                </span>
              </div>
              <span
                v-else
                class="text-[11px] text-slate-400"
              >
                No stacks assigned
              </span>
            </td>

            <td class="px-4 py-3">
              <TechTaskStatusBadge :status="item.projectStatus" />
            </td>

            <td class="px-4 py-3">
              <TechTaskProgressCell :item="item" />
            </td>

            <td class="px-4 py-3">
              <span class="text-[11px] font-semibold text-slate-700">
                {{ item.year }}
              </span>
            </td>

            <td class="px-4 py-3">
              <div class="flex flex-col">
                <span class="text-[11px] font-medium text-slate-600">
                  {{ formatCmsDate(item.updatedAt) }}
                </span>
                <span class="text-[10px] text-slate-400">
                  {{ formatCmsDate(item.startDate) }} - {{ formatCmsDate(item.endDate) }}
                </span>
              </div>
            </td>

            <td class="px-4 py-3">
              <div class="flex justify-end gap-1.5">
                <button
                  type="button"
                  class="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                  title="View tech task detail"
                  @click="emit('view', item)"
                >
                  <UIcon
                    name="i-lucide-eye"
                    class="h-3.5 w-3.5"
                  />
                </button>

                <button
                  type="button"
                  class="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                  title="Edit tech task"
                  @click="emit('edit', item)"
                >
                  <UIcon
                    name="i-lucide-pencil"
                    class="h-3.5 w-3.5"
                  />
                </button>

                <a
                  :href="`/portofolio/${item.id}`"
                  target="_blank"
                  class="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                  title="Open in portfolio"
                >
                  <UIcon
                    name="i-lucide-external-link"
                    class="h-3.5 w-3.5"
                  />
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
