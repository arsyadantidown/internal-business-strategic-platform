<script setup lang="ts">
import type { PartnerListItem } from '../../types/partner.types'
import PartnerCategoryBadge from './PartnerCategoryBadge.vue'
import PartnerStatusBadge from './PartnerStatusBadge.vue'

interface Props {
  items: PartnerListItem[]
  totalCount: number
  isLoading: boolean
  loadError: string
  isFilterDirty: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'view' | 'edit', item: PartnerListItem): void
  (e: 'retry' | 'add'): void
}>()

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('') || 'P'
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
    <div class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-sm font-semibold text-slate-900">
          Partner Directory
        </h2>
        <p class="text-[11px] font-medium text-slate-500">
          {{ totalCount }} partners registered
        </p>
      </div>
      <p class="text-[10px] font-medium text-slate-400">
        Sorted by partner name
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[760px] text-left text-xs">
        <thead class="border-b border-slate-100 bg-slate-50/70">
          <tr>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Partner
            </th>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Category
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
            v-for="row in 6"
            :key="row"
            class="animate-pulse"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <div class="h-8 w-8 rounded-full bg-slate-100" />
                <div class="h-3.5 w-40 rounded-full bg-slate-100" />
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="h-5 w-32 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="h-5 w-20 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="ml-auto h-6 w-14 rounded-lg bg-slate-100" />
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="loadError">
          <tr>
            <td
              colspan="4"
              class="px-4 py-10"
            >
              <div class="flex flex-col items-center gap-2.5 text-center">
                <UIcon
                  name="i-lucide-circle-alert"
                  class="h-8 w-8 text-red-400"
                />
                <div>
                  <p class="text-xs font-semibold text-slate-700">
                    Failed to load partners
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

        <tbody v-else-if="totalCount === 0">
          <tr>
            <td
              colspan="4"
              class="px-4 py-10"
            >
              <div class="flex flex-col items-center gap-2.5 text-center">
                <UIcon
                  name="i-lucide-handshake"
                  class="h-8 w-8 text-slate-300"
                />
                <div>
                  <p class="text-xs font-semibold text-slate-700">
                    No partners registered yet
                  </p>
                  <p class="mt-0.5 text-[11px] text-slate-500">
                    Add the first partner to start building the directory.
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
                  <span>Add Partner</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="items.length === 0">
          <tr>
            <td
              colspan="4"
              class="px-4 py-10"
            >
              <div class="flex flex-col items-center gap-2.5 text-center">
                <UIcon
                  name="i-lucide-search-x"
                  class="h-8 w-8 text-slate-300"
                />
                <div>
                  <p class="text-xs font-semibold text-slate-700">
                    No partners match your filters
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
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600">
                  {{ initialsOf(item.partnerName) }}
                </div>
                <span class="truncate text-xs font-semibold text-slate-800">
                  {{ item.partnerName }}
                </span>
              </div>
            </td>

            <td class="px-4 py-3">
              <PartnerCategoryBadge :category="item.category" />
            </td>

            <td class="px-4 py-3">
              <PartnerStatusBadge
                :is-active="item.isActive"
                :lifecycle-status="item.lifecycleStatus"
              />
            </td>

            <td class="px-4 py-3">
              <div class="flex justify-end gap-1.5">
                <button
                  type="button"
                  class="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                  title="View partner detail"
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
                  title="Edit partner"
                  @click="emit('edit', item)"
                >
                  <UIcon
                    name="i-lucide-pencil"
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
