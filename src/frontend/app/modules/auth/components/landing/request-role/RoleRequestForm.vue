<script setup lang="ts">
import requestIllustration from '~/assets/request-role-illustration.png'
import type { RoleItem } from '~/modules/roles/types/role.types'
import type { DivisionItem } from '~/modules/divisions/types/division.types'

const props = defineProps<{
  fullName: string
  email: string
  roles: RoleItem[]
  divisions: DivisionItem[]
  isSubmitting: boolean
  isLoadingDivisions: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: { division_id: string; requested_role_id: string; reason: string }): void
}>()

const form = ref({
  division: '',
  requestedRole: '',
  reason: ''
})

const toast = useToast()

const onSubmit = () => {
  if (!form.value.division) {
    toast.add({
      title: 'Division Required',
      description: 'Please select your division.',
      color: 'error'
    })
    return
  }
  if (!form.value.requestedRole) {
    toast.add({
      title: 'Role Required',
      description: 'Please select the role you want to request.',
      color: 'error'
    })
    return
  }
  const trimmed = form.value.reason.trim()
  if (!trimmed || trimmed.length < 10) {
    toast.add({
      title: 'Invalid Reason',
      description: 'Reason must be at least 10 characters long.',
      color: 'error'
    })
    return
  }

  emit('submit', {
    division_id: form.value.division,
    requested_role_id: form.value.requestedRole,
    reason: trimmed
  })
}

// Method untuk reset form setelah submit sukses
const resetForm = () => {
  form.value.division = ''
  form.value.requestedRole = ''
  form.value.reason = ''
}

defineExpose({ resetForm })
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
    <!-- Sisi Kiri: Ilustrasi Form Normal -->
    <div class="lg:col-span-5 flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div class="relative">
        <div
          class="absolute -inset-4 rounded-full bg-gradient-to-r from-violet-500/30 to-blue-500/30 blur-2xl"
        />
        <img
          :src="requestIllustration"
          alt="Request Role Document Illustration"
          class="relative w-full max-w-[270px] drop-shadow-xl transition-transform duration-300 hover:scale-[1.03]"
        />
      </div>
      <p class="text-xs font-semibold text-slate-600 max-w-[250px] leading-relaxed">
        Gain access to the right resources and start contributing to strategic initiatives.
      </p>
    </div>

    <!-- Sisi Kanan: Form Card Kompak -->
    <div
      class="lg:col-span-7 rounded-2xl border border-white/80 bg-white/95 backdrop-blur-md p-6.5 sm:p-7.5 shadow-[0_12px_40px_-10px_rgba(37,99,235,0.12)] ring-1 ring-slate-200/80"
    >
      <form class="space-y-4.5" @submit.prevent="onSubmit">
        <!-- Section: Your Information -->
        <div class="space-y-2.5">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
            <UIcon name="i-lucide-user" class="h-4 w-4 text-[#155EEF]" />
            <span>Your Information</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                :value="fullName"
                type="text"
                readonly
                class="h-9 w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-3 text-xs font-medium text-slate-600 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
              <input
                :value="email"
                type="email"
                readonly
                class="h-9 w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-3 text-xs font-medium text-slate-600 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">Division</label>
            <select
              v-model="form.division"
              class="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-2xs outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF] cursor-pointer disabled:bg-slate-50 disabled:opacity-70"
              :disabled="isLoadingDivisions"
            >
              <option value="" disabled selected>
                {{ isLoadingDivisions ? 'Loading divisions...' : 'Select your division' }}
              </option>
              <option v-for="div in divisions" :key="div.id" :value="div.id">
                {{ div.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Section: Role Request -->
        <div class="space-y-2.5 border-t border-slate-100 pt-3.5">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
            <UIcon name="i-lucide-briefcase" class="h-4 w-4 text-[#155EEF]" />
            <span>Role Request</span>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1"
              >Requested Role</label
            >
            <select
              v-model="form.requestedRole"
              class="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-2xs outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF] cursor-pointer"
            >
              <option value="" disabled selected>Select the role you want to request</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Section: Request Reason -->
        <div class="space-y-2 border-t border-slate-100 pt-3.5">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
            <UIcon name="i-lucide-message-square" class="h-4 w-4 text-[#155EEF]" />
            <span>Request Reason</span>
          </div>

          <p class="text-[11px] text-slate-400">
            Please provide a clear reason for requesting this role.
          </p>

          <textarea
            v-model="form.reason"
            rows="3"
            maxlength="500"
            placeholder="Type your reason here..."
            class="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]"
          />

          <div class="flex justify-end text-[10px] text-slate-400">
            {{ form.reason.length }}/500
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end pt-1">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="relative flex h-10 w-full items-center justify-center rounded-xl bg-[#155EEF] px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            <UIcon v-if="isSubmitting" name="i-lucide-loader-2" class="size-4 animate-spin mr-2" />
            <span>{{ isSubmitting ? 'Submitting...' : 'Submit Request' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
