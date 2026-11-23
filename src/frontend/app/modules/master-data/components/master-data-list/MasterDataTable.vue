<script setup lang="ts">
import type { MasterDataCategory, MasterDataItem } from '../../types/master-data.types'
import MasterDataStatusBadge from './MasterDataStatusBadge.vue'

interface Props {
  category: MasterDataCategory
  items: MasterDataItem[]
  isLoading: boolean
  loadError: string
  totalResults: number
  hasActiveFilters: boolean
  togglingId: string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'add' | 'retry'): void
  (e: 'edit' | 'delete' | 'toggle', item: MasterDataItem): void
}>()

const descriptionTooltip = (item: MasterDataItem) =>
  item.description ? item.description : 'No description provided'
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
    <div class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-sm font-semibold text-slate-900">
          {{ category.label }}
        </h2>
        <p class="text-[11px] font-medium text-slate-500">
          {{ totalResults }} {{ category.label.toLowerCase() }} found
        </p>
      </div>
      <p class="text-[10px] font-medium text-slate-400">
        Sorted by sort order, then name
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[760px] text-left text-xs">
        <thead class="border-b border-slate-100 bg-slate-50/70">
          <tr>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Item
            </th>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Code
            </th>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Sort Order
            </th>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Status
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
            v-for="row in 5"
            :key="row"
            class="animate-pulse"
          >
            <td class="px-4 py-3">
              <div class="h-3.5 w-40 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="h-5 w-20 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="h-3.5 w-8 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="h-5 w-16 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="ml-auto h-6 w-24 rounded-lg bg-slate-100" />
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="loadError">
          <tr>
            <td
              colspan="5"
              class="px-4 py-10"
            >
              <div class="flex flex-col items-center gap-2.5 text-center">
                <UIcon
                  name="i-lucide-circle-alert"
                  class="h-8 w-8 text-red-400"
                />
                <div>
                  <p class="text-xs font-semibold text-slate-700">
                    Failed to load {{ category.label.toLowerCase() }}
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
              colspan="5"
              class="px-4 py-10"
            >
              <div class="flex flex-col items-center gap-2.5 text-center">
                <UIcon
                  name="i-lucide-database"
                  class="h-8 w-8 text-slate-300"
                />
                <div>
                  <p class="text-xs font-semibold text-slate-700">
                    No {{ category.label.toLowerCase() }} yet
                  </p>
                  <p class="mt-0.5 text-[11px] text-slate-500">
                    Get started by adding your first {{ category.singular.toLowerCase() }}.
                  </p>
                </div>
                <button
                  type="button"
                  class="mt-1 inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 cursor-pointer"
                  @click="emit('add')"
                >
                  <UIcon
                    name="i-lucide-plus"
                    class="h-3.5 w-3.5"
                  />
                  <span>Add {{ category.singular }}</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="totalResults === 0">
          <tr>
            <td
              colspan="5"
              class="px-4 py-10"
            >
              <div class="flex flex-col items-center gap-2.5 text-center">
                <UIcon
                  name="i-lucide-search-x"
                  class="h-8 w-8 text-slate-300"
                />
                <div>
                  <p class="text-xs font-semibold text-slate-700">
                    No matching {{ category.label.toLowerCase() }}
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
            v-for="item in items"
            :key="item.id"
            class="transition-colors hover:bg-slate-50/70"
          >
            <td class="max-w-md px-4 py-3">
              <p class="font-semibold text-slate-800">
                {{ item.name }}
              </p>
              <p
                v-if="item.description"
                class="mt-0.5 line-clamp-2 text-[11px] leading-4 text-slate-500"
                :title="descriptionTooltip(item)"
              >
                {{ item.description }}
              </p>
            </td>

            <td class="px-4 py-3">
              <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                {{ item.code }}
              </span>
            </td>

            <td class="px-4 py-3">
              <span class="inline-flex h-6 min-w-8 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] font-semibold text-slate-600">
                <UIcon
                  name="i-lucide-hash"
                  class="h-3 w-3 text-slate-400"
                />
                <span>{{ item.sortOrder }}</span>
              </span>
            </td>

            <td class="px-4 py-3">
              <MasterDataStatusBadge :is-active="item.isActive" />
            </td>

            <td class="px-4 py-3">
              <div class="flex justify-end gap-1.5">
                <button
                  type="button"
                  class="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="togglingId === item.id"
                  :title="item.isActive ? 'Set to inactive' : 'Set to active'"
                  @click="emit('toggle', item)"
                >
                  <UIcon
                    name="i-lucide-power"
                    class="h-3.5 w-3.5"
                    :class="item.isActive ? 'text-emerald-500' : 'text-slate-300'"
                  />
                </button>

                <button
                  type="button"
                  class="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                  title="Edit"
                  @click="emit('edit', item)"
                >
                  <UIcon
                    name="i-lucide-pencil"
                    class="h-3.5 w-3.5"
                  />
                </button>

                <button
                  type="button"
                  class="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                  title="Delete"
                  @click="emit('delete', item)"
                >
                  <UIcon
                    name="i-lucide-trash-2"
                    class="h-3.5 w-3.5"
                  />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
