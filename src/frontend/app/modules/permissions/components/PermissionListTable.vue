<script setup lang="ts">
import { ref } from 'vue'
import type { PermissionTableItem } from '../types/types'

const emit = defineEmits<{
  (e: 'add-permission'): void
  (e: 'edit-permission', permission: PermissionTableItem): void
}>()

// Data Mockup sesuai tabel kedua di gambar
const permissions = ref<PermissionTableItem[]>([
  {
    id: '1',
    name: 'View Financial Data',
    code: 'financial.view',
    description:
      'Melihat angka keuangan project: nilai kontrak, carry over, revenue, COGS, biaya...'
  },
  {
    id: '2',
    name: 'Manage Portfolio',
    code: 'portfolio.manage',
    description: 'Menambah, mengubah, dan menghapus project, perspektifnya, file project, serta...'
  },
  {
    id: '3',
    name: 'View Portfolio',
    code: 'portfolio.view',
    description: 'Melihat portofolio, master data portofolio, dan mengunduh file project.'
  },
  {
    id: '4',
    name: 'Manage Roles and Permissions',
    code: 'role.manage',
    description:
      'Create and update roles, manage permission metadata, and assign permissions to roles.'
  },
  {
    id: '5',
    name: 'Review Role Request',
    code: 'role_request.review',
    description: 'Review and approve or reject role requests.'
  }
])

const currentPage = ref(1)
const totalPages = ref(2)
</script>

<template>
  <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 font-sans">
    <!-- Header Tabel -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-sm font-bold text-slate-900 tracking-tight">Permission Management</h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Manage permission metadata such as name and description, and view all available
          permissions in the system.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
        @click="emit('add-permission')"
      >
        <UIcon name="i-lucide-plus-circle" class="h-4 w-4" />
        <span>Add Permission</span>
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="border-b border-slate-100 text-[11px] font-bold text-slate-400">
          <tr>
            <th class="py-3 pr-4">
              <div class="inline-flex items-center gap-1 cursor-pointer hover:text-slate-600">
                <span>Permission Name</span>
                <UIcon name="i-lucide-chevrons-up-down" class="h-3.5 w-3.5" />
              </div>
            </th>
            <th class="px-4 py-3">Code</th>
            <th class="px-4 py-3">Description</th>
            <th class="py-3 pl-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          <tr
            v-for="item in permissions"
            :key="item.id"
            class="hover:bg-slate-50/60 transition-colors"
          >
            <!-- Name -->
            <td class="py-3.5 pr-4 whitespace-nowrap font-bold text-slate-900">
              {{ item.name }}
            </td>

            <!-- Code Badge (Pastel Purple/Indigo) -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-md bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-semibold text-[#6366F1]"
              >
                {{ item.code }}
              </span>
            </td>

            <!-- Description -->
            <td class="px-4 py-3.5 max-w-sm truncate text-slate-600" :title="item.description">
              {{ item.description }}
            </td>

            <!-- Actions (Edit Icon Button) -->
            <td class="py-3.5 pl-4 text-right whitespace-nowrap">
              <button
                type="button"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                title="Edit Permission"
                @click="emit('edit-permission', item)"
              >
                <UIcon name="i-lucide-pencil" class="h-4 w-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bottom Pagination -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
      <p class="text-[11px] text-slate-400">
        Showing <span class="font-bold text-slate-700">1 to 5</span> of
        <span class="font-bold text-slate-700">6</span> results
      </p>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          <UIcon name="i-lucide-chevron-left" class="h-3 w-3" />
        </button>

        <button
          v-for="p in totalPages"
          :key="p"
          type="button"
          class="flex h-6.5 w-6.5 items-center justify-center rounded-md text-[11px] font-bold cursor-pointer"
          :class="[
            currentPage === p
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
          ]"
          @click="currentPage = p"
        >
          {{ p }}
        </button>

        <button
          type="button"
          class="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          <UIcon name="i-lucide-chevron-right" class="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>
</template>
