<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CreateRolePayload } from '../types/types'

interface Props {
  isOpen: boolean
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: CreateRolePayload): void
}>()

const formName = ref('')
const formDescription = ref('')

// Auto-generate Code: "Test Role" -> "TEST_ROLE"
const generatedCode = computed(() => {
  return formName.value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_') // Ganti spasi & karakter non-alfanumerik dengan underscore
    .replace(/^_+|_+$/g, '') // Hapus underscore di depan / belakang
})

// Reset form saat modal dibuka/tutup
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      formName.value = ''
      formDescription.value = ''
    }
  }
)

const handleSubmit = () => {
  if (!formName.value.trim() || !generatedCode.value) return

  emit('submit', {
    name: formName.value.trim(),
    code: generatedCode.value,
    description: formDescription.value.trim() || undefined
  })
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs transition-all animate-fade-in font-sans"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-100"
    >
      <!-- Header Modal -->
      <div class="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
        <div>
          <h3 class="text-base font-bold text-slate-900 tracking-tight">Add New Role</h3>
          <p class="text-xs text-slate-500 mt-0.5">
            Create a new system role and its code identifier.
          </p>
        </div>

        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <UIcon name="i-lucide-x" class="h-4 w-4" />
        </button>
      </div>

      <!-- Form Body -->
      <form class="space-y-4 p-6" @submit.prevent="handleSubmit">
        <!-- Field 1: Role Name -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-900">
            Role Name <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="formName"
            type="text"
            required
            placeholder="e.g. Commercial Specialist"
            class="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <!-- Field 2: Role Code (Auto-generated & Disabled) -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-slate-900">
              Role Code <span class="text-rose-500">*</span>
            </label>
            <span class="text-[11px] text-slate-400 italic">Auto-generated</span>
          </div>

          <div class="relative">
            <input
              :value="generatedCode"
              type="text"
              disabled
              placeholder="Will be generated from role name..."
              class="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-mono font-semibold text-blue-600 placeholder-slate-400 cursor-not-allowed select-none"
            />
            <div class="absolute right-3 top-2.5 text-slate-400">
              <UIcon name="i-lucide-lock" class="h-4 w-4" />
            </div>
          </div>
          <p class="text-[11px] text-slate-400">
            Uppercase identifier used for system permission checks.
          </p>
        </div>

        <!-- Field 3: Description -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-900">Description</label>
          <textarea
            v-model="formDescription"
            rows="3"
            placeholder="Enter role description and responsibilities..."
            class="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            class="inline-flex h-9 min-w-20 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="isSubmitting || !formName.trim()"
            class="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UIcon
              :name="isSubmitting ? 'i-lucide-loader-2' : 'i-lucide-plus'"
              class="h-4 w-4 stroke-[2.5]"
              :class="{ 'animate-spin': isSubmitting }"
            />
            <span>{{ isSubmitting ? 'Creating...' : 'Create Role' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
