<script setup lang="ts">
import { ref, computed } from 'vue'

const route = useRoute()
const roleId = route.params.id as string

// Data dummy role
const roleData = ref({
  id: roleId || '1',
  name: 'Super Admin / Executive',
  code: 'SUPER_ADMIN',
  status: 'Active',
  description:
    'Mempunyai hak akses penuh atas pengaturan sistem, manajemen pengguna, serta tampilan Executive Dashboard.'
})

// Data dummy available permissions
const allPermissions = ref([
  {
    id: '1',
    name: 'View Financial Data',
    code: 'financial.view',
    description:
      'Melihat angka keuangan project: nilai kontrak, carry over, revenue, COGS, biaya operasional, net profit.'
  },
  {
    id: '2',
    name: 'Manage Portfolio',
    code: 'portfolio.manage',
    description:
      'Menambah, mengubah, dan menghapus project, perspektifnya, file project, serta master data portfolio.'
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
  },
  {
    id: '6',
    name: 'User Management',
    code: 'user.manage',
    description: 'Mengelola data pengguna, mengatur role, serta status akses pengguna.'
  }
])

// State permission yang dipilih (ID)
// Default awal 3 item terpilih sesuai screenshot
const selectedPermissionIds = ref<string[]>(['1', '2', '3'])

// Helper Select All
const isAllSelected = computed(() => {
  return (
    allPermissions.value.length > 0 &&
    selectedPermissionIds.value.length === allPermissions.value.length
  )
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedPermissionIds.value = []
  } else {
    selectedPermissionIds.value = allPermissions.value.map((p) => p.id)
  }
}

const togglePermission = (id: string) => {
  const index = selectedPermissionIds.value.indexOf(id)
  if (index === -1) {
    selectedPermissionIds.value.push(id)
  } else {
    selectedPermissionIds.value.splice(index, 1)
  }
}

const handleCancel = () => {
  navigateTo(`/admin/permission/roles/${roleId}`)
}

const handleSave = () => {
  alert(
    `Saved permissions for role ${roleData.value.name}: [${selectedPermissionIds.value.join(', ')}]`
  )
  navigateTo(`/admin/permission/roles/${roleId}`)
}
</script>

<template>
  <div class="space-y-4 pb-10 font-sans">
    <!-- 1. Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs font-medium text-slate-500">
      <span>Administration</span>
      <UIcon name="i-lucide-chevron-right" class="h-3 w-3 text-slate-400" />
      <NuxtLink to="/admin/permission" class="hover:text-blue-600 transition-colors cursor-pointer">
        Permission
      </NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="h-3 w-3 text-slate-400" />
      <NuxtLink
        :to="`/admin/permission/roles/${roleId}`"
        class="hover:text-blue-600 transition-colors cursor-pointer"
      >
        Role Detail
      </NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="h-3 w-3 text-slate-400" />
      <span class="font-semibold text-slate-900">Manage Permissions</span>
    </nav>

    <!-- 2. Header Title & Back Button -->
    <div class="flex items-start gap-3 pt-1">
      <button
        type="button"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer mt-0.5"
        @click="handleCancel"
      >
        <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
      </button>

      <div>
        <h1 class="text-xl font-bold tracking-tight text-slate-900 leading-tight">
          Manage Role Permissions
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Configure permissions for role {{ roleData.name }}.
        </p>
      </div>
    </div>

    <!-- 3. Card Ringkasan Role -->
    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3.5">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
          >
            <UIcon name="i-lucide-user" class="h-5 w-5" />
          </div>

          <div>
            <h2 class="text-base font-bold text-slate-900 leading-tight">
              {{ roleData.name }}
            </h2>
            <div class="mt-1">
              <span
                class="inline-flex items-center rounded-md bg-[#EDF3FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#3B82F6]"
              >
                {{ roleData.code }}
              </span>
            </div>
          </div>
        </div>

        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>{{ roleData.status }}</span>
        </span>
      </div>

      <div class="flex items-start gap-4 border-t border-slate-100 pt-3 text-xs">
        <span class="font-bold text-slate-900 min-w-20">Description</span>
        <span class="text-slate-600 leading-relaxed">{{ roleData.description }}</span>
      </div>
    </div>

    <!-- 4. Card Select Permissions Table -->
    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-slate-900 tracking-tight">Select Permissions</h3>
          <p class="text-xs text-slate-500 mt-0.5">
            Choose the permissions to assign to this role.
          </p>
        </div>

        <!-- Selected Badge (Pastel Blue) -->
        <span
          class="inline-flex items-center rounded-lg bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#3B82F6]"
        >
          {{ selectedPermissionIds.length }} selected of {{ allPermissions.length }} permissions
        </span>
      </div>

      <!-- Table Selection -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-100 text-[11px] font-bold text-slate-400">
            <tr>
              <!-- Master Checkbox Header -->
              <th class="py-3 pl-2 pr-3 w-10">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="py-3 px-3">
                <div class="inline-flex items-center gap-1 cursor-pointer hover:text-slate-600">
                  <span>Permission Name</span>
                  <UIcon name="i-lucide-chevrons-up-down" class="h-3.5 w-3.5" />
                </div>
              </th>
              <th class="px-3 py-3">Code</th>
              <th class="px-3 py-3">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr
              v-for="perm in allPermissions"
              :key="perm.id"
              class="hover:bg-slate-50/60 transition-colors cursor-pointer"
              @click="togglePermission(perm.id)"
            >
              <!-- Row Checkbox -->
              <td class="py-3.5 pl-2 pr-3" @click.stop>
                <input
                  type="checkbox"
                  :value="perm.id"
                  :checked="selectedPermissionIds.includes(perm.id)"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  @change="togglePermission(perm.id)"
                />
              </td>

              <!-- Permission Name -->
              <td class="py-3.5 px-3 whitespace-nowrap font-bold text-slate-900">
                {{ perm.name }}
              </td>

              <!-- Code Badge -->
              <td class="px-3 py-3.5 whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-md bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-semibold text-[#6366F1]"
                >
                  {{ perm.code }}
                </span>
              </td>

              <!-- Description -->
              <td class="px-3 py-3.5 text-slate-600 leading-relaxed">
                {{ perm.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 5. Bottom Action Buttons (Cancel & Save Changes) -->
    <div class="flex items-center justify-end gap-3 pt-2">
      <button
        type="button"
        class="inline-flex h-9.5 min-w-24 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        @click="handleCancel"
      >
        Cancel
      </button>

      <button
        type="button"
        class="inline-flex h-9.5 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
        @click="handleSave"
      >
        <UIcon name="i-lucide-check" class="h-4 w-4 stroke-[2.5]" />
        <span>Save Changes</span>
      </button>
    </div>
  </div>
</template>
