<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePermissionStore } from '../stores/permission.store'
import type { RoleDetailResponse } from '../types/types'

const route = useRoute()
const roleId = route.params.id as string

const toast = useToast()
const permissionStore = usePermissionStore()

// State data detail role dari API
const roleDetail = ref<RoleDetailResponse | null>(null)
const isLoading = ref(true)

const fetchRoleDetailData = async () => {
  if (!roleId) return
  isLoading.value = true
  try {
    const data = await permissionStore.fetchRoleDetail(roleId)
    roleDetail.value = data
  } catch (err: any) {
    toast.add({
      title: 'Failed to Fetch Role Detail',
      description: err?.response?.data?.message || err?.message || 'Could not load role detail.',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRoleDetailData()
})

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

    <!-- Loading Skeleton / Spinner -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3"
    >
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-blue-600" />
      <p class="text-xs font-medium">Loading role details...</p>
    </div>

    <!-- Main Content Saat Data Siap -->
    <template v-else-if="roleDetail">
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
            <h1 class="text-xl font-bold tracking-tight text-slate-900 leading-tight">
              Role Detail
            </h1>
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

          <!-- Badge Status Active / Inactive -->
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
          <span class="text-slate-600 leading-relaxed">
            {{ roleDetail.description || '-' }}
          </span>
        </div>
      </div>

      <!-- 4. Card Tabel Assigned Permissions -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 tracking-tight">
            Assigned Permissions ({{ roleDetail.permissions?.length || 0 }})
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">List of permissions assigned to this role.</p>
        </div>

        <!-- Jika tidak ada permission sama sekali -->
        <div
          v-if="!roleDetail.permissions || roleDetail.permissions.length === 0"
          class="py-10 text-center text-xs text-slate-400"
        >
          <UIcon name="i-lucide-shield-alert" class="mx-auto h-7 w-7 text-slate-300 mb-1.5" />
          No permissions assigned to this role yet. Click "Manage Permissions" to assign.
        </div>

        <!-- Tabel Assigned Permissions -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="border-b border-slate-100 text-[11px] font-bold text-slate-400">
              <tr>
                <th class="py-3 pr-4">Permission Name</th>
                <th class="px-4 py-3">Code</th>
                <th class="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              <tr
                v-for="perm in roleDetail.permissions"
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
                  {{ perm.description || '-' }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Bottom Status -->
          <div class="pt-2 border-t border-slate-100">
            <p class="text-[11px] text-slate-400">
              Showing
              <span class="font-bold text-slate-700">1 to {{ roleDetail.permissions.length }}</span>
              of
              <span class="font-bold text-slate-700">{{ roleDetail.permissions.length }}</span>
              results
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
