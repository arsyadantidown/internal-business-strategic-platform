<script setup lang="ts">
import type { RoleRequestItem } from '~/modules/roles/types/role.types'

interface Props {
  isOpen: boolean
  request: RoleRequestItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'approve', request: RoleRequestItem): void
  (e: 'reject', request: RoleRequestItem): void
}>()

const { formatDateTime } = useAppDate()

const getRoleBadgeClass = (role?: string) => {
  const r = String(role || '').toLowerCase()
  if (r.includes('engineer')) return 'bg-[#e8f2fe] text-[#2563eb]'
  if (r.includes('commercial')) return 'bg-[#f3e8ff] text-[#9333ea]'
  return 'bg-[#fef3c7] text-[#b45309]'
}

const handleApprove = () => {
  if (props.request) {
    emit('approve', props.request)
  }
}

const handleReject = () => {
  if (props.request) {
    emit('reject', props.request)
  }
}
</script>

<template>
  <!-- Backdrop Overlay -->
  <div
    v-if="isOpen && request"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs transition-all animate-fade-in font-sans"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-100"
    >
      <!-- 1. Header Modal -->
      <div class="flex items-start justify-between p-6 pb-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 tracking-tight">Review Role Request</h3>
          <p class="text-xs text-slate-500 mt-1">
            Review the user's request details before making a decision.
          </p>
        </div>

        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          aria-label="Close"
          @click="emit('close')"
        >
          <UIcon name="i-lucide-x" class="h-4 w-4" />
        </button>
      </div>

      <!-- 2. Modal Body (3 Section Cards) -->
      <div class="space-y-3.5 px-6 pb-6">
        <!-- Section 1: User Information -->
        <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
            <UIcon name="i-lucide-user" class="h-4 w-4 text-blue-600" />
            <span>User Information</span>
          </div>

          <div class="grid grid-cols-[110px_1fr] gap-y-2 text-xs">
            <span class="text-slate-500 font-medium">Full Name</span>
            <span class="font-semibold text-slate-900">{{ request.requester_name }}</span>

            <span class="text-slate-500 font-medium">Email</span>
            <span class="font-semibold text-slate-900">{{ request.requester_email }}</span>

            <span class="text-slate-500 font-medium">Division</span>
            <span class="font-semibold text-slate-900">{{ request.division_name }}</span>
          </div>
        </div>

        <!-- Section 2: Role Request -->
        <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
            <UIcon name="i-lucide-briefcase" class="h-4 w-4 text-blue-600" />
            <span>Role Request</span>
          </div>

          <div class="grid grid-cols-[110px_1fr] items-center gap-y-2.5 text-xs">
            <span class="text-slate-500 font-medium">Requested Role</span>
            <div>
              <span
                class="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium"
                :class="getRoleBadgeClass(request.role_name)"
              >
                {{ request.role_name }}
              </span>
            </div>

            <span class="text-slate-500 font-medium">Request Date</span>
            <span class="font-semibold text-slate-900">{{
              formatDateTime(request.created_at)
            }}</span>
          </div>
        </div>

        <!-- Section 3: Request Reason -->
        <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2.5">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
            <UIcon name="i-lucide-message-square" class="h-4 w-4 text-blue-600" />
            <span>Request Reason</span>
          </div>

          <div
            class="rounded-lg border border-slate-200/60 bg-white p-3 text-xs leading-relaxed text-slate-600"
          >
            {{ request.reason || '-' }}
          </div>
        </div>
      </div>

      <!-- 3. Footer Action Buttons (Reject & Approve) -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
        <button
          type="button"
          class="inline-flex h-9 min-w-24 items-center justify-center rounded-xl border border-rose-300 bg-white px-5 text-xs font-semibold text-rose-600 shadow-2xs transition-all hover:bg-rose-50 active:scale-95 cursor-pointer"
          @click="handleReject"
        >
          Reject
        </button>

        <button
          type="button"
          class="inline-flex h-9 min-w-24 items-center justify-center rounded-xl bg-blue-600 px-6 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
          @click="handleApprove"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
</template>
