<script setup lang="ts">
import { ref } from 'vue'

const route = useRoute()
const roleId = route.params.id as string

// Data dummy role detail sesuai screenshot
const roleData = ref({
  id: roleId || '1',
  name: 'Super Admin / Executive',
  code: 'SUPER_ADMIN',
  status: 'Active',
  description:
    'Mempunyai hak akses penuh atas pengaturan sistem, manajemen pengguna, serta tampilan Executive Dashboard.'
})

// Data dummy assigned permissions (8 items sesuai screenshot)
const assignedPermissions = ref([
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
  },
  {
    id: '7',
    name: 'View Partnership',
    code: 'partnership.view',
    description: 'Melihat data kemitraan, detail mitra, dan riwayat kolaborasi.'
  },
  {
    id: '8',
    name: 'Manage Partnership',
    code: 'partnership.manage',
    description:
      'Menambah, mengubah, dan menghapus data kemitraan serta mengelola riwayat kolaborasi.'
  }
])

const handleManagePermissions = () => {
  navigateTo(`/admin/permission/roles/${roleId}/manage`)
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
      <span class="font-semibold text-slate-900">Role Detail</span>
    </nav>

    <!-- 2. Header & Action -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
      <div class="flex items-start gap-3">
        <!-- Tombol Back Panah Kiri -->
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer mt-0.5"
          @click="navigateTo('/admin/permission')"
        >
          <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
        </button>

        <div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900 leading-tight">Role Detail</h1>
          <p class="text-xs text-slate-500 mt-0.5">
            View role information and its assigned permissions.
          </p>
        </div>
      </div>

      <!-- Tombol Manage Permissions -->
      <button
        type="button"
        class="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
        @click="handleManagePermissions"
      >
        <UIcon name="i-lucide-layers" class="h-4 w-4" />
        <span>Manage Permissions</span>
      </button>
    </div>

    <!-- 3. Card Ringkasan Role -->
    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3.5">
          <!-- Icon Bulat User Biru -->
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

        <!-- Badge Status Active -->
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>{{ roleData.status }}</span>
        </span>
      </div>

      <!-- Deskripsi -->
      <div class="flex items-start gap-4 border-t border-slate-100 pt-3 text-xs">
        <span class="font-bold text-slate-900 min-w-20">Description</span>
        <span class="text-slate-600 leading-relaxed">{{ roleData.description }}</span>
      </div>
    </div>

    <!-- 4. Card Tabel Assigned Permissions -->
    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
      <div>
        <h3 class="text-sm font-bold text-slate-900 tracking-tight">
          Assigned Permissions ({{ assignedPermissions.length }})
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">List of permissions assigned to this role.</p>
      </div>

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
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr
              v-for="perm in assignedPermissions"
              :key="perm.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <!-- Permission Name -->
              <td class="py-3.5 pr-4 whitespace-nowrap font-bold text-slate-900">
                {{ perm.name }}
              </td>

              <!-- Code Badge (Pastel Indigo/Purple) -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-md bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-semibold text-[#6366F1]"
                >
                  {{ perm.code }}
                </span>
              </td>

              <!-- Description -->
              <td class="px-4 py-3.5 text-slate-600 leading-relaxed">
                {{ perm.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bottom Status -->
      <div class="pt-2 border-t border-slate-100">
        <p class="text-[11px] text-slate-400">
          Showing
          <span class="font-bold text-slate-700">1 to {{ assignedPermissions.length }}</span> of
          <span class="font-bold text-slate-700">{{ assignedPermissions.length }}</span> results
        </p>
      </div>
    </div>
  </div>
</template>
