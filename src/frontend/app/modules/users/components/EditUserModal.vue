<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { UserItem, UpdateUserPayload } from '../types/types'
import type { RoleItem } from '~/modules/roles/types/role.types'

interface Props {
  isOpen: boolean
  user: UserItem | null
  roles: RoleItem[]
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { userId: string; data: UpdateUserPayload }): void
}>()

// State Checkbox Toggle per Section
const enableName = ref(false)
const enableRole = ref(false)
const enableStatus = ref(false)

// State Form Value
const formName = ref('')
const formRoleId = ref('')
const formIsActive = ref(true)

// Inisial Nama untuk Avatar Card
const userInitials = computed(() => {
  const name = props.user?.full_name || 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
})

// Sinkronkan data saat modal dibuka
watch(
  () => props.isOpen,
  (open) => {
    if (open && props.user) {
      enableName.value = false
      enableRole.value = false
      enableStatus.value = false

      formName.value = props.user.full_name || ''
      formRoleId.value = props.user.role_id || ''
      formIsActive.value = props.user.is_active ?? true
    }
  }
)

const handleSubmit = () => {
  if (!props.user) return

  const payload: UpdateUserPayload = {}

  if (enableName.value && formName.value.trim()) {
    payload.full_name = formName.value.trim()
  }
  if (enableRole.value && formRoleId.value) {
    payload.role_id = formRoleId.value
  }
  if (enableStatus.value) {
    payload.is_active = formIsActive.value
  }

  // Jika tidak ada satu pun checkbox yang dicentang
  if (Object.keys(payload).length === 0) {
    return
  }

  emit('submit', {
    userId: props.user.id,
    data: payload
  })
}

// Cek apakah minimal ada 1 perubahan yang diaktifkan
const hasAnyEnabled = computed(() => {
  return enableName.value || enableRole.value || enableStatus.value
})
</script>

<template>
  <!-- Backdrop Overlay -->
  <div
    v-if="isOpen && user"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs transition-all animate-fade-in font-sans"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-100"
    >
      <!-- 1. Header Modal -->
      <div class="flex items-start justify-between p-6 pb-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
          >
            <UIcon name="i-lucide-user-cog" class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 tracking-tight">Edit User</h3>
            <p class="text-xs text-slate-500">Update user information, role, and account status.</p>
          </div>
        </div>

        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <UIcon name="i-lucide-x" class="h-4 w-4" />
        </button>
      </div>

      <!-- 2. Modal Body -->
      <div class="space-y-3.5 px-6 pb-6 max-h-[75vh] overflow-y-auto">
        <!-- User Info Card (Biru Muda) -->
        <div
          class="flex items-center gap-3 rounded-xl bg-[#F0F5FF] p-3.5 border border-blue-100/60"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D6E4FF] text-xs font-bold text-blue-700 shadow-2xs"
          >
            {{ userInitials }}
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-bold text-slate-900 truncate">{{ user.full_name }}</h4>
            <p class="text-[11px] text-slate-500 truncate">{{ user.email }}</p>
          </div>
        </div>

        <!-- Section 1: Update Name -->
        <div class="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2.5">
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              v-model="enableName"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p class="text-xs font-bold text-slate-900 leading-tight">Update Name</p>
              <p class="text-[11px] text-slate-400">Enable to edit the user's name.</p>
            </div>
          </label>

          <div class="pt-1">
            <div class="grid grid-cols-[80px_1fr] items-center gap-3">
              <span class="text-xs font-medium text-slate-500">Name</span>
              <input
                v-model="formName"
                type="text"
                :disabled="!enableName"
                placeholder="Enter full name..."
                class="h-8.5 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <!-- Section 2: Change Role -->
        <div class="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2.5">
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              v-model="enableRole"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p class="text-xs font-bold text-slate-900 leading-tight">Change Role</p>
              <p class="text-[11px] text-slate-400">Enable to change the user's role.</p>
            </div>
          </label>

          <div class="pt-1">
            <div class="grid grid-cols-[80px_1fr] items-center gap-3">
              <span class="text-xs font-medium text-slate-500">Role</span>
              <select
                v-model="formRoleId"
                :disabled="!enableRole"
                class="h-8.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 outline-none transition-colors focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="" disabled>Select role</option>
                <option v-for="r in roles" :key="r.id" :value="r.id">
                  {{ r.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 3: Update Account Status -->
        <div class="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2.5">
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              v-model="enableStatus"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p class="text-xs font-bold text-slate-900 leading-tight">Update Account Status</p>
              <p class="text-[11px] text-slate-400">Enable to change the user's account status.</p>
            </div>
          </label>

          <div class="pt-1">
            <div class="grid grid-cols-[80px_1fr] items-center gap-3">
              <span class="text-xs font-medium text-slate-500">Status</span>
              <select
                v-model="formIsActive"
                :disabled="!enableStatus"
                class="h-8.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold outline-none transition-colors focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
                :class="formIsActive ? 'text-emerald-700' : 'text-slate-600'"
              >
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Footer Action Buttons -->
      <div
        class="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50"
      >
        <button
          type="button"
          :disabled="isSubmitting"
          class="inline-flex h-9 min-w-20 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          @click="emit('close')"
        >
          Cancel
        </button>

        <button
          type="button"
          :disabled="isSubmitting || !hasAnyEnabled"
          class="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleSubmit"
        >
          <UIcon
            :name="isSubmitting ? 'i-lucide-loader-2' : 'i-lucide-save'"
            class="h-4 w-4"
            :class="{ 'animate-spin': isSubmitting }"
          />
          <span>{{ isSubmitting ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
