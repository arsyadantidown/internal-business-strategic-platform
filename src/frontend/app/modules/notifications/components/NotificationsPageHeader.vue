<script setup lang="ts">
interface Props {
  unreadCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'mark-all-read'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <nav class="flex items-center gap-1 text-[11px] font-medium text-slate-400">
      <span>Notifications</span>
      <UIcon
        name="i-lucide-chevron-right"
        class="h-3 w-3"
      />
      <span class="font-semibold text-slate-700">All Notifications</span>
    </nav>

    <div class="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div class="flex flex-wrap items-center gap-1.5">
          <h1 class="text-base leading-5 font-bold tracking-tight text-slate-900">
            Notifications
          </h1>
          <span
            class="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold"
            :class="
              unreadCount > 0
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-slate-50 text-slate-500'
            "
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="unreadCount > 0 ? 'bg-blue-600' : 'bg-slate-400'"
            />
            {{ unreadCount }} unread
          </span>
        </div>
        <p class="max-w-2xl text-[11px] leading-4 text-slate-500">
          Stay updated on partner verification tasks, partnership status changes, and contract
          renewals.
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          class="inline-flex h-7.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          :disabled="unreadCount === 0"
          @click="emit('mark-all-read')"
        >
          <UIcon
            name="i-lucide-check-check"
            class="h-3.5 w-3.5 text-slate-500"
          />
          <span>Mark all as read</span>
        </button>
      </div>
    </div>
  </div>
</template>
