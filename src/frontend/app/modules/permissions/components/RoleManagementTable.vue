<script setup lang="ts">
import { ref } from 'vue'
import type { RoleItem } from '~/modules/roles/types/role.types'

interface Props {
  roles: RoleItem[]
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  roles: () => [],
  isLoading: false
})

const emit = defineEmits<{
  (e: 'add-role'): void
  (e: 'view-role', role: RoleItem): void
  (e: 'edit-role', role: RoleItem): void
}>()

const currentPage = ref(1)
const totalPages = ref(4)
</script>

<template>
  <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 font-sans">
    <!-- Header Tabel -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-sm font-bold text-slate-900 tracking-tight">Role Management</h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Manage existing roles, update role information, and configure permissions.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
        @click="emit('add-role')"
      >
        <UIcon name="i-lucide-plus-circle" class="h-4 w-4" />
        <span>Add Role</span>
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="border-b border-slate-100 text-[11px] font-bold text-slate-400">
          <tr>
            <th class="py-3 pr-4">
              <div class="inline-flex items-center gap-1 cursor-pointer hover:text-slate-600">
                <span>Role Name</span>
                <UIcon name="i-lucide-chevrons-up-down" class="h-3.5 w-3.5" />
              </div>
            </th>
            <th class="px-4 py-3">Code</th>
            <th class="px-4 py-3">Description</th>
            <th class="px-4 py-3">Status</th>
            <th class="py-3 pl-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          <tr v-for="item in roles" :key="item.id" class="hover:bg-slate-50/60 transition-colors">
            <!-- Role Name -->
            <td class="py-3.5 pr-4 whitespace-nowrap font-bold text-slate-900">
              {{ item.name }}
            </td>

            <!-- Code Badge (Pastel Blue) -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-md bg-[#EDF3FF] px-2.5 py-1 text-[11px] font-semibold text-[#3B82F6]"
              >
                {{ item.code }}
              </span>
            </td>

            <!-- Description -->
            <td class="px-4 py-3.5 max-w-xs truncate text-slate-600" :title="item.description">
              {{ item.description }}
            </td>

            <!-- Status Badge -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
                :class="
                  item.is_active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                "
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="item.is_active ? 'bg-emerald-500' : 'bg-slate-400'"
                />
                <span>{{ item.is_active ? 'Active' : 'Inactive' }}</span>
              </span>
            </td>

            <!-- Actions (View & Edit Icon Buttons) -->
            <td class="py-3.5 pl-4 text-right whitespace-nowrap">
              <div class="inline-flex items-center gap-1">
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                  title="View Role & Permissions"
                  @click="emit('view-role', item)"
                >
                  <UIcon name="i-lucide-eye" class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Edit Role"
                  @click="emit('edit-role', item)"
                >
                  <UIcon name="i-lucide-pencil" class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bottom Pagination -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
      <p class="text-[11px] text-slate-400">
        Showing <span class="font-bold text-slate-700">1 to {{ roles.length }}</span> of
        <span class="font-bold text-slate-700">{{ roles.length }}</span> results
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
