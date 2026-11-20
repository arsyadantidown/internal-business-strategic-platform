<script setup lang="ts">
import { computed } from 'vue'
import type { TechStackCategory, TechStackItem } from '../../types/tech-stack.types'
import TechTaskStatusBadge from './TechTaskStatusBadge.vue'

interface Props {
  items: TechStackItem[]
  isLoading: boolean
  loadError: string
  total: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit' | 'delete', item: TechStackItem): void
  (e: 'retry'): void
}>()

const categoryLabels: Record<TechStackCategory, { label: string; badgeClass: string }> = {
  frontend: {
    label: 'Frontend',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700'
  },
  backend: {
    label: 'Backend',
    badgeClass: 'border-violet-200 bg-violet-50 text-violet-700'
  },
  data_storage: {
    label: 'Data Storage',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700'
  }
}

const getCategoryBadge = (category: TechStackCategory) => {
  return (
    categoryLabels[category] || {
      label: category,
      badgeClass: 'border-slate-200 bg-slate-50 text-slate-700'
    }
  )
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
    <div class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-sm font-semibold text-slate-900">
          Tech Stack Directory
        </h2>
        <p class="text-[11px] font-medium text-slate-500">
          {{ total }} tech stacks registered
        </p>
      </div>
      <p class="text-[10px] font-medium text-slate-400">
        Sorted alphabetically by name
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[600px] text-left text-xs">
        <thead class="border-b border-slate-100 bg-slate-50/70">
          <tr>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Name
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
            v-for="row in 5"
            :key="row"
            class="animate-pulse"
          >
            <td class="px-4 py-3">
              <div class="h-3.5 w-36 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="h-5 w-20 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3">
              <div class="h-5 w-16 rounded-full bg-slate-100" />
            </td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex h-6 w-14 rounded-md bg-slate-100" />
            </td>
          </tr>
        </tbody>

        <tbody
          v-else-if="loadError"
          class="divide-y divide-slate-100"
        >
          <tr>
            <td
              colspan="4"
              class="px-4 py-8"
            >
              <div class="flex flex-col items-center gap-2 text-center">
                <UIcon
                  name="i-lucide-alert-triangle"
                  class="h-7 w-7 text-amber-500"
                />
                <div>
                  <p class="text-xs font-semibold text-slate-800">
                    Failed to load tech stacks
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
              colspan="4"
              class="px-4 py-10"
            >
              <div class="flex flex-col items-center gap-2.5 text-center">
                <UIcon
                  name="i-lucide-layers"
                  class="h-8 w-8 text-slate-300"
                />
                <div>
                  <p class="text-xs font-semibold text-slate-700">
                    No tech stacks found
                  </p>
                  <p class="mt-0.5 text-[11px] text-slate-500">
                    Try adjusting your search or category filter.
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
            <!-- 1. Name -->
            <td class="px-4 py-3">
              <span class="text-xs font-semibold text-slate-800">
                {{ item.name }}
              </span>
            </td>

            <!-- 2. Category -->
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
                :class="getCategoryBadge(item.category).badgeClass"
              >
                {{ getCategoryBadge(item.category).label }}
              </span>
            </td>

            <!-- 3. Status -->
            <td class="px-4 py-3">
              <TechTaskStatusBadge :is-active="item.isActive" />
            </td>

            <!-- 4. Actions: Edit (Pensil) & Delete (Tong Sampah) -->
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1.5">
                <button
                  type="button"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                  title="Edit tech stack"
                  aria-label="Edit tech stack"
                  @click="emit('edit', item)"
                >
                  <UIcon
                    name="i-lucide-pencil"
                    class="h-3.5 w-3.5"
                  />
                </button>

                <button
                  type="button"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                  title="Delete tech stack"
                  aria-label="Delete tech stack"
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
