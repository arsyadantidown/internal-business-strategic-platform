<script setup lang="ts">
import pendingIllustration from '~/assets/pending-role-illustration.png'
import type { RoleRequestItem } from '~/modules/roles/types/role.types'

defineProps<{
  request: RoleRequestItem
  fullName: string
  email: string
}>()

const { formatDateTime } = useAppDate()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
    <!-- Sisi Kiri: Ilustrasi Pending -->
    <div class="lg:col-span-5 flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div class="relative">
        <div
          class="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/25 blur-2xl"
        />
        <img
          :src="pendingIllustration"
          alt="Role Request Pending Illustration"
          class="relative w-full max-w-[270px] drop-shadow-xl transition-transform duration-300 hover:scale-[1.03]"
        />
      </div>
      <p class="text-xs font-semibold text-slate-600 max-w-[280px] leading-relaxed">
        Your request is being reviewed by the Super Admin.<br />We will notify you once there is an
        update.
      </p>
    </div>

    <!-- Sisi Kanan: Card Status Kuning/Krem -->
    <div
      class="lg:col-span-7 rounded-2xl border border-white/80 bg-white/95 backdrop-blur-md p-6.5 sm:p-7.5 shadow-[0_12px_40px_-10px_rgba(245,158,11,0.12)] ring-1 ring-slate-200/80 space-y-6"
    >
      <!-- Banner Header Kuning -->
      <div
        class="flex items-start gap-4 rounded-xl border border-amber-200/80 bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7]/60 to-[#FFFBEB] p-4.5"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDE68A] text-amber-800 shadow-xs ring-4 ring-amber-100/80"
        >
          <UIcon name="i-lucide-clock" class="h-5 w-5" />
        </div>
        <div class="space-y-1">
          <h3 class="text-sm font-bold text-slate-900 leading-tight">Role Request Pending</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Your request has been submitted and is currently being reviewed by the Super Admin.
            Please wait for the approval. You will be notified once there is an update.
          </p>
        </div>
      </div>

      <!-- Section: Your Request Information -->
      <div class="space-y-3.5 pt-1">
        <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
          <UIcon name="i-lucide-user" class="h-4 w-4 text-[#155EEF]" />
          <span>Your Request Information</span>
        </div>

        <div class="space-y-2.5 text-xs">
          <div class="grid grid-cols-12 gap-2 py-1">
            <span class="col-span-4 sm:col-span-3 text-slate-500 font-medium">Full Name</span>
            <span class="col-span-8 sm:col-span-9 text-slate-900 font-semibold">{{
              fullName
            }}</span>
          </div>

          <div class="grid grid-cols-12 gap-2 py-1">
            <span class="col-span-4 sm:col-span-3 text-slate-500 font-medium">Email</span>
            <span class="col-span-8 sm:col-span-9 text-slate-900 font-semibold">{{ email }}</span>
          </div>

          <div class="grid grid-cols-12 gap-2 py-1">
            <span class="col-span-4 sm:col-span-3 text-slate-500 font-medium">Division</span>
            <span class="col-span-8 sm:col-span-9 text-slate-900 font-semibold">{{
              request.division_name
            }}</span>
          </div>

          <div class="grid grid-cols-12 gap-2 py-1">
            <span class="col-span-4 sm:col-span-3 text-slate-500 font-medium">Requested Role</span>
            <span class="col-span-8 sm:col-span-9 text-slate-900 font-semibold">{{
              request.role_name
            }}</span>
          </div>

          <div class="grid grid-cols-12 gap-2 py-1">
            <span class="col-span-4 sm:col-span-3 text-slate-500 font-medium">Request Date</span>
            <span class="col-span-8 sm:col-span-9 text-slate-900 font-semibold">{{
              formatDateTime(request.created_at)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Info Box Bawah -->
      <div
        class="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-[11px] text-slate-600 leading-relaxed"
      >
        <UIcon name="i-lucide-info" class="h-4 w-4 shrink-0 text-[#155EEF] mt-0.5" />
        <span>
          If you need to make changes or have any questions, please contact the administrator or
          your division representative.
        </span>
      </div>
    </div>
  </div>
</template>
