<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { PermissionItem, UpdatePermissionPayload } from '../types/types'

interface Props {
  isOpen: boolean
  permission: PermissionItem | null
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
})

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'submit',
    payload: {
      permissionId: string
      data: UpdatePermissionPayload
    }
  ): void
}>()

// Checkbox pengaman (enable input saat dicentang)
const enableName = ref(false)
const enableDescription = ref(false)

// State form
const formName = ref('')
const formDescription = ref('')

// Sinkronkan form saat modal terbuka
watch(
  () => props.isOpen,
  (open) => {
    if (open && props.permission) {
      enableName.value = false
      enableDescription.value = false

      formName.value = props.permission.name || ''
      formDescription.value = props.permission.description || ''
    }
  }
)

const handleSubmit = () => {
  if (!props.permission) return

  const payload: UpdatePermissionPayload = {}

  if (enableName.value && formName.value.trim()) {
    payload.name = formName.value.trim()
  }
  if (enableDescription.value && formDescription.value.trim()) {
    payload.description = formDescription.value.trim()
  }

  // Jika tidak ada perubahan yang dicentang
  if (Object.keys(payload).length === 0) return

  emit('submit', {
    permissionId: props.permission.id,
    data: payload
  })
}

// Cek apakah minimal ada 1 perubahan yang diaktifkan
const hasAnyEnabled = computed(() => {
  return enableName.value || enableDescription.value
})
</script>

<template>
  <!-- Backdrop Overlay -->
  <div
    v-if="isOpen && permission"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs transition-all animate-fade-in font-sans"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-100"
    >
      <!-- 1. Header Modal -->
      <div class="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
        <h3 class="text-base font-bold text-slate-900 tracking-tight">Edit Permission</h3>

        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <UIcon name="i-lucide-x" class="h-4 w-4" />
        </button>
      </div>

      <!-- 2. Modal Body -->
      <div class="space-y-4 p-6">
        <!-- Field 1: Permission Name -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label
              class="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-900"
            >
              <input
                v-model="enableName"
                type="checkbox"
                class="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Permission Name <span class="text-rose-500">*</span></span>
            </label>
            <span v-if="!enableName" class="text-[11px] text-slate-400 italic">Check to edit</span>
          </div>

          <input
            v-model="formName"
            type="text"
            :disabled="!enableName"
            placeholder="Enter permission name..."
            class="h-9 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>

        <!-- Field 2: Description -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label
              class="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-900"
            >
              <input
                v-model="enableDescription"
                type="checkbox"
                class="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Description <span class="text-rose-500">*</span></span>
            </label>
            <span v-if="!enableDescription" class="text-[11px] text-slate-400 italic"
              >Check to edit</span
            >
          </div>

          <textarea
            v-model="formDescription"
            rows="3"
            :disabled="!enableDescription"
            placeholder="Enter permission description..."
            class="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed resize-none"
          />
        </div>
      </div>

      <!-- 3. Footer Action Buttons -->
      <div
        class="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50"
      >
        <button
          type="button"
          class="inline-flex h-9 min-w-20 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
            :name="isSubmitting ? 'i-lucide-loader-2' : 'i-lucide-check'"
            class="h-4 w-4 stroke-[2.5]"
            :class="{ 'animate-spin': isSubmitting }"
          />
          <span>{{ isSubmitting ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
