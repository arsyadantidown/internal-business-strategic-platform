<script setup lang="ts">
import type { RoleRequestItem } from '~/modules/roles/types/role.types'

interface Props {
  isOpen: boolean
  request: RoleRequestItem | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { formatDateTime } = useAppDate()
</script>

<template>
  <div
    v-if="isOpen && request"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs transition-all animate-fade-in font-sans"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-100"
    >
      <!-- Header -->
      <div class="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2.5">
            <h3 class="text-base font-bold text-slate-900 tracking-tight">
              Request Details & Audit Log
            </h3>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize"
              :class="
                request.status === 'approved'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border border-rose-200 bg-rose-50 text-rose-700'
              "
            >
              {{ request.status }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Complete information and review notes for this request.
          </p>
        </div>

        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          @click="emit('close')"
        >
          <UIcon name="i-lucide-x" class="h-4 w-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-3.5 p-6 max-h-[75vh] overflow-y-auto">
        <!-- 1. Requester Info -->
        <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2.5">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
            <UIcon name="i-lucide-user" class="h-4 w-4 text-blue-600" />
            <span>Applicant Details</span>
          </div>
          <div class="grid grid-cols-[120px_1fr] gap-y-2 text-xs">
            <span class="text-slate-500 font-medium">Full Name</span>
            <span class="font-semibold text-slate-900">{{ request.requester_name }}</span>
            <span class="text-slate-500 font-medium">Email</span>
            <span class="font-semibold text-slate-900">{{ request.requester_email }}</span>
            <span class="text-slate-500 font-medium">Division</span>
            <span class="font-semibold text-slate-900">{{ request.division_name }}</span>
            <span class="text-slate-500 font-medium">Requested Role</span>
            <span class="font-semibold text-blue-700">{{ request.role_name }}</span>
            <span class="text-slate-500 font-medium">Submitted At</span>
            <span class="font-semibold text-slate-700">{{
              formatDateTime(request.created_at)
            }}</span>
          </div>
        </div>

        <!-- 2. Applicant Reason -->
        <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
            <UIcon name="i-lucide-message-square" class="h-4 w-4 text-blue-600" />
            <span>Applicant Reason</span>
          </div>
          <div
            class="rounded-lg border border-slate-200/60 bg-white p-3 text-xs leading-relaxed text-slate-700"
          >
            {{ request.reason || '-' }}
          </div>
        </div>

        <!-- 3. Reviewer Audit & Notes -->
        <div
          class="rounded-xl border p-4 space-y-3"
          :class="
            request.status === 'approved'
              ? 'border-emerald-200/80 bg-emerald-50/30'
              : 'border-rose-200/80 bg-rose-50/30'
          "
        >
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
            <UIcon
              :name="
                request.status === 'approved' ? 'i-lucide-check-circle-2' : 'i-lucide-alert-circle'
              "
              class="h-4 w-4"
              :class="request.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'"
            />
            <span>Decision & Review Notes</span>
          </div>

          <div class="grid grid-cols-[120px_1fr] gap-y-2 text-xs">
            <span class="text-slate-500 font-medium">Reviewed By</span>
            <span class="font-semibold text-slate-900">
              {{ request.reviewer_name || 'Super Admin' }}
              <span v-if="request.reviewer_email" class="text-slate-400 font-normal"
                >({{ request.reviewer_email }})</span
              >
            </span>

            <span class="text-slate-500 font-medium">Decision Date</span>
            <span class="font-semibold text-slate-900">
              {{ formatDateTime(request.reviewed_at || request.updated_at) }}
            </span>
          </div>

          <div class="pt-1">
            <p class="text-[11px] font-semibold text-slate-500 mb-1.5">
              Reviewer Notes / Feedback:
            </p>
            <div
              class="rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-800"
            >
              {{ request.review_notes || 'No review notes provided.' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-end px-6 py-3.5 border-t border-slate-100 bg-slate-50/50"
      >
        <button
          type="button"
          class="inline-flex h-8.5 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
          @click="emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
