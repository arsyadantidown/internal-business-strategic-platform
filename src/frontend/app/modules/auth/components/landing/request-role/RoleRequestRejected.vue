<script setup lang="ts">
import rejectedIllustration from '~/assets/rejected-role-illustration.png'
import type { RoleRequestItem } from '~/modules/roles/types/role.types'

const props = defineProps<{
  request: RoleRequestItem
  fullName: string
  email: string
}>()

const emit = defineEmits<{
  (e: 'reapply'): void
}>()

const { formatDateTime } = useAppDate()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
    <!-- Sisi Kiri: Ilustrasi Rejected -->
    <div class="lg:col-span-5 flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div class="relative">
        <div
          class="absolute -inset-4 rounded-full bg-gradient-to-r from-rose-500/25 to-pink-500/25 blur-2xl"
        />
        <img
          :src="rejectedIllustration"
          alt="Role Request Rejected Illustration"
          class="relative w-full max-w-[270px] drop-shadow-xl transition-transform duration-300 hover:scale-[1.03]"
        />
      </div>
      <p class="text-xs font-semibold text-slate-600 max-w-[300px] leading-relaxed">
        Your role request has been rejected.<br />
        Please check the details on the right for more information. You may submit a new request
        after addressing the reason.
      </p>
    </div>

    <!-- Sisi Kanan: Card Status Merah/Rose -->
    <div
      class="lg:col-span-7 rounded-2xl border border-white/80 bg-white/95 backdrop-blur-md p-6.5 sm:p-7.5 shadow-[0_12px_40px_-10px_rgba(244,63,94,0.12)] ring-1 ring-slate-200/80 space-y-5"
    >
      <!-- Banner Header Merah/Rose -->
      <div
        class="flex items-start gap-4 rounded-xl border border-rose-200/80 bg-gradient-to-r from-[#FFF1F2] via-[#FFE4E6]/60 to-[#FFF1F2] p-4.5"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FECDD3] text-rose-700 shadow-xs ring-4 ring-rose-100/80"
        >
          <UIcon name="i-lucide-x" class="h-5 w-5 stroke-[2.5]" />
        </div>
        <div class="space-y-1">
          <h3 class="text-sm font-bold text-slate-900 leading-tight">Role Request Rejected</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Your request has been reviewed and cannot be approved at this time. Please see the
            reason below. You may submit a new request after addressing it.
          </p>
        </div>
      </div>

      <!-- Section: Your Request Information -->
      <div class="space-y-3 pt-0.5">
        <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
          <UIcon name="i-lucide-user" class="h-4 w-4 text-[#155EEF]" />
          <span>Your Request Information</span>
        </div>

        <div class="space-y-2 text-xs">
          <div class="grid grid-cols-12 gap-2 py-0.5">
            <span class="col-span-4 sm:col-span-3 text-slate-500 font-medium">Full Name</span>
            <span class="col-span-8 sm:col-span-9 text-slate-900 font-semibold">{{
              fullName
            }}</span>
          </div>

          <div class="grid grid-cols-12 gap-2 py-0.5">
            <span class="col-span-4 sm:col-span-3 text-slate-500 font-medium">Email</span>
            <span class="col-span-8 sm:col-span-9 text-slate-900 font-semibold">{{ email }}</span>
          </div>

          <div class="grid grid-cols-12 gap-2 py-0.5">
            <span class="col-span-4 sm:col-span-3 text-slate-500 font-medium">Division</span>
            <span class="col-span-8 sm:col-span-9 text-slate-900 font-semibold">{{
              request.division_name
            }}</span>
          </div>

          <div class="grid grid-cols-12 gap-2 py-0.5">
            <span class="col-span-4 sm:col-span-3 text-slate-500 font-medium">Requested Role</span>
            <span class="col-span-8 sm:col-span-9 text-slate-900 font-semibold">{{
              request.role_name
            }}</span>
          </div>

          <div class="grid grid-cols-12 gap-2 py-0.5">
            <span class="col-span-4 sm:col-span-3 text-slate-500 font-medium">Request Date</span>
            <span class="col-span-8 sm:col-span-9 text-slate-900 font-semibold">{{
              formatDateTime(request.created_at)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Section: Reason for Rejection -->
      <div class="space-y-2 pt-1 border-t border-slate-100">
        <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
          <UIcon name="i-lucide-message-square" class="h-4 w-4 text-rose-500" />
          <span>Reason for Rejection</span>
        </div>

        <!-- Box Isi Alasan Penolakan -->
        <div
          class="rounded-xl border border-rose-100 bg-[#FFF5F5] p-3 text-xs text-slate-700 leading-relaxed font-normal"
        >
          {{
            request.review_notes ||
            'Your request does not match the current role assignment criteria for your division. Please consult your division representative for more information.'
          }}
        </div>
      </div>

      <!-- Action Button: Submit a New Request -->
      <div class="pt-2">
        <button
          type="button"
          class="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#155EEF] px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.99] cursor-pointer"
          @click="emit('reapply')"
        >
          <UIcon name="i-lucide-rotate-cw" class="h-4 w-4 stroke-[2.2]" />
          <span>Submit a New Request</span>
        </button>
      </div>
    </div>
  </div>
</template>
