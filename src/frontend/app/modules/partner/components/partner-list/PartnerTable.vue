<script setup lang="ts">
import type { PartnerListItem } from '../../types/partner.types'
import PartnerStatusBadge from './PartnerStatusBadge.vue'

interface Props {
  items: PartnerListItem[]
  totalCount: number
  isLoading: boolean
  loadError: string
  isFilterDirty: boolean
  togglingId?: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'view' | 'edit' | 'delete' | 'toggle-active', item: PartnerListItem): void
  (e: 'retry' | 'add'): void
}>()
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
    <!-- Header Table -->
    <div
      class="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h2 class="text-sm font-bold text-slate-900">Partner Directory</h2>
        <p class="text-xs text-slate-400">{{ totalCount }} partners registered</p>
      </div>
      <p class="text-xs font-medium text-slate-400">Sorted by partner name</p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[640px] text-left text-xs">
        <thead class="border-b border-slate-100 bg-white">
          <tr>
            <th class="px-6 py-3.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              PARTNER
            </th>
            <th class="px-6 py-3.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              STATUS
            </th>
            <th
              class="px-6 py-3.5 text-right text-[11px] font-bold tracking-wider text-slate-400 uppercase"
            >
              ACTIONS
            </th>
          </tr>
        </thead>

        <!-- Loading State -->
        <tbody v-if="isLoading" class="divide-y divide-slate-100">
          <tr v-for="row in 4" :key="row" class="animate-pulse">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3.5">
                <div class="h-7 w-7 rounded-full bg-slate-100" />
                <div class="h-4 w-48 rounded-md bg-slate-100" />
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="h-5 w-16 rounded-full bg-slate-100" />
            </td>
            <td class="px-6 py-4">
              <div class="ml-auto h-7 w-28 rounded-lg bg-slate-100" />
            </td>
          </tr>
        </tbody>

        <!-- Error State -->
        <tbody v-else-if="loadError">
          <tr>
            <td colspan="3" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center gap-2">
                <UIcon name="i-lucide-circle-alert" class="h-8 w-8 text-rose-500" />
                <p class="text-xs font-bold text-slate-800">Failed to load partners</p>
                <p class="text-xs text-slate-400">
                  {{ loadError }}
                </p>
                <button
                  type="button"
                  class="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                  @click="emit('retry')"
                >
                  <UIcon name="i-lucide-rotate-ccw" class="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Filter Empty State -->
        <tbody v-else-if="items.length === 0 && isFilterDirty">
          <tr>
            <td colspan="3" class="px-6 py-12 text-center">
              <UIcon name="i-lucide-search-x" class="mx-auto h-8 w-8 text-slate-300" />
              <p class="mt-2 text-xs font-bold text-slate-800">No partners found</p>
              <p class="text-xs text-slate-400">Try adjusting your search criteria.</p>
            </td>
          </tr>
        </tbody>

        <!-- Empty State -->
        <tbody v-else-if="items.length === 0">
          <tr>
            <td colspan="3" class="px-6 py-12 text-center">
              <UIcon name="i-lucide-handshake" class="mx-auto h-8 w-8 text-slate-300" />
              <p class="mt-2 text-xs font-bold text-slate-800">No partners registered yet</p>
              <p class="text-xs text-slate-400">
                Add the first partner to start building the directory.
              </p>
              <button
                type="button"
                class="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
                @click="emit('add')"
              >
                <UIcon name="i-lucide-plus" class="h-3.5 w-3.5" />
                <span>Add Partner</span>
              </button>
            </td>
          </tr>
        </tbody>

        <!-- Data Rows -->
        <tbody v-else class="divide-y divide-slate-100 font-medium">
          <tr
            v-for="(item, idx) in items"
            :key="item.id"
            class="transition-colors hover:bg-slate-50/60"
          >
            <!-- 1. Partner Column: Nomor Bulat + Nama -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3.5">
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600"
                >
                  {{ idx + 1 }}
                </div>
                <span class="font-bold text-slate-800">
                  {{ item.partnerName }}
                </span>
              </div>
            </td>

            <!-- 2. Status Column -->
            <td class="px-6 py-4">
              <PartnerStatusBadge :is-active="item.isActive" />
            </td>

            <!-- 3. Actions Column -->
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2.5">
                <!-- Icon Action 1: View -->
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="View Details"
                  @click="emit('view', item)"
                >
                  <UIcon name="i-lucide-eye" class="h-4 w-4" />
                </button>

                <!-- Icon Action 2: Edit -->
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Edit Partner"
                  @click="emit('edit', item)"
                >
                  <UIcon name="i-lucide-pencil" class="h-4 w-4" />
                </button>

                <!-- Icon Action 3: Delete -->
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Partner"
                  @click="emit('delete', item)"
                >
                  <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                </button>

                <!-- Action Button 4: Deactivate / Activate Pill Button -->
                <button
                  type="button"
                  :disabled="togglingId === item.id"
                  class="min-w-22 rounded-lg border px-3 py-1 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    item.isActive
                      ? 'border-rose-200 bg-rose-50/70 text-rose-500 hover:bg-rose-100/70 hover:border-rose-300'
                      : 'border-emerald-200 bg-emerald-50/70 text-emerald-600 hover:bg-emerald-100/70 hover:border-emerald-300'
                  "
                  @click="emit('toggle-active', item)"
                >
                  <span v-if="togglingId === item.id">
                    <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin inline mr-1" />
                    Updating...
                  </span>
                  <span v-else>
                    {{ item.isActive ? 'Deactivate' : 'Activate' }}
                  </span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
