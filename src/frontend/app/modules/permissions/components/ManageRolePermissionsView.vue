<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '../stores/permission.store'
import type { RoleDetailResponse } from '../types/types'

const route = useRoute()
const roleId = route.params.id as string

const toast = useToast()
const permissionStore = usePermissionStore()

// State data
const roleDetail = ref<RoleDetailResponse | null>(null)
const isLoading = ref(true)

// State daftar ID permission yang sedang dicentang
const selectedPermissionIds = ref<string[]>([])

// 1. Fetch seluruh permission & detail role saat halaman dimuat
const loadPageData = async () => {
  if (!roleId) return
  isLoading.value = true
  try {
    const [detail] = await Promise.all([
      permissionStore.fetchRoleDetail(roleId),
      permissionStore.fetchPermissions()
    ])

    roleDetail.value = detail

    // Inisialisasi checklist: otomatis centang permission yang sudah dimiliki oleh role ini
    if (detail && detail.permissions) {
      selectedPermissionIds.value = detail.permissions.map((p) => p.id)
    }
  } catch (err: any) {
    toast.add({
      title: 'Failed to Load Data',
      description:
        err?.response?.data?.message || err?.message || 'Could not load role permissions.',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPageData()
})

// Shortcut / helper daftar seluruh permission dari store
const allPermissions = computed(() => permissionStore.permissions)

// Logic Checkbox "Select All"
const isAllSelected = computed({
  get() {
    return (
      allPermissions.value.length > 0 &&
      selectedPermissionIds.value.length === allPermissions.value.length
    )
  },
  set(checked: boolean) {
    if (checked) {
      selectedPermissionIds.value = allPermissions.value.map((p) => p.id)
    } else {
      selectedPermissionIds.value = []
    }
  }
})

// Toggle individual checkbox
const togglePermission = (id: string) => {
  const index = selectedPermissionIds.value.indexOf(id)
  if (index === -1) {
    selectedPermissionIds.value.push(id)
  } else {
    selectedPermissionIds.value.splice(index, 1)
  }
}

// 2. Submit Save Changes (PUT /api/v1/roles/{role_id}/permissions)
const handleSaveChanges = async () => {
  try {
    const res = await permissionStore.setRolePermissions(roleId, selectedPermissionIds.value)

    toast.add({
      title: 'Permissions Updated',
      description: res.message || 'Role permissions have been successfully updated.',
      color: 'success'
    })

    // Kembali ke halaman Role Detail
    navigateTo(`/admin/permission/roles/${roleId}`)
  } catch (err: any) {
    toast.add({
      title: 'Update Failed',
      description: err?.response?.data?.message || err?.message || 'Failed to update permissions.',
      color: 'error'
    })
  }
}

const handleCancel = () => {
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

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3"
    >
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-blue-600" />
      <p class="text-xs font-medium">Loading permissions data...</p>
    </div>

    <!-- Main Content Saat Data Siap -->
    <template v-else-if="roleDetail">
      <!-- 2. Header Title -->
      <div class="flex items-start gap-3 pt-1">
        <!-- Tombol Back Panah Kiri -->
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
            Configure permissions for role
            <span class="font-semibold text-slate-700">{{ roleDetail.name }}</span
            >.
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
                {{ roleDetail.name }}
              </h2>
              <div class="mt-1">
                <span
                  class="inline-flex items-center rounded-md bg-[#EDF3FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#3B82F6]"
                >
                  {{ roleDetail.code }}
                </span>
              </div>
            </div>
          </div>

          <!-- Badge Status Active -->
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
            :class="
              roleDetail.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            "
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="roleDetail.is_active ? 'bg-emerald-500' : 'bg-slate-400'"
            />
            <span>{{ roleDetail.is_active ? 'Active' : 'Inactive' }}</span>
          </span>
        </div>

        <!-- Deskripsi -->
        <div class="flex items-start gap-4 border-t border-slate-100 pt-3 text-xs">
          <span class="font-bold text-slate-900 min-w-20">Description</span>
          <span class="text-slate-600 leading-relaxed">{{ roleDetail.description || '-' }}</span>
        </div>
      </div>

      <!-- 4. Card Select Permissions Table -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
        <!-- Header Tabel & Counter -->
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 tracking-tight">Select Permissions</h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Choose the permissions to assign to this role.
            </p>
          </div>

          <!-- Counter Badge (3 selected of 6 permissions) -->
          <div
            class="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
          >
            {{ selectedPermissionIds.length }} selected of {{ allPermissions.length }} permissions
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="border-b border-slate-100 text-[11px] font-bold text-slate-400">
              <tr>
                <!-- Master Select All Checkbox -->
                <th class="w-10 py-3 pr-2 text-center">
                  <input
                    v-model="isAllSelected"
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th class="py-3 px-3">Permission Name</th>
                <th class="py-3 px-3">Code</th>
                <th class="py-3 px-3">Description</th>
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
                <td class="w-10 py-3.5 pr-2 text-center" @click.stop>
                  <input
                    :checked="selectedPermissionIds.includes(perm.id)"
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    @change="togglePermission(perm.id)"
                  />
                </td>

                <!-- Permission Name -->
                <td class="py-3.5 px-3 whitespace-nowrap font-bold text-slate-900">
                  {{ perm.name }}
                </td>

                <!-- Code Badge (Pastel Indigo/Blue) -->
                <td class="py-3.5 px-3 whitespace-nowrap">
                  <span
                    class="inline-flex items-center rounded-md bg-[#EDF3FF] px-2.5 py-1 text-[11px] font-semibold text-[#3B82F6]"
                  >
                    {{ perm.code }}
                  </span>
                </td>

                <!-- Description -->
                <td class="py-3.5 px-3 text-slate-600 leading-relaxed">
                  {{ perm.description || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5. Footer Action Buttons (Cancel & Save Changes) -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            @click="handleCancel"
          >
            Cancel
          </button>

          <button
            type="button"
            :disabled="permissionStore.isSavingRolePermissions"
            class="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleSaveChanges"
          >
            <UIcon
              :name="
                permissionStore.isSavingRolePermissions ? 'i-lucide-loader-2' : 'i-lucide-check'
              "
              class="h-4 w-4 stroke-[2.5]"
              :class="{ 'animate-spin': permissionStore.isSavingRolePermissions }"
            />
            <span>{{
              permissionStore.isSavingRolePermissions ? 'Saving...' : 'Save Changes'
            }}</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
