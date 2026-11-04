<script setup lang="ts">
import { computed } from 'vue'
import type { Notification, NotificationChannel, NotificationType } from '../types/notification.types'
import PartnershipStatusBadge from '../../partnership/components/partnership-list/PartnershipStatusBadge.vue'

interface Props {
  notification: Notification
  relativeTime: string
  fullDate: string
  contractDate: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'open', notification: Notification): void
}>()

interface TypeMeta {
  icon: string
  iconClass: string
  label: string
}

const typeMeta: Record<NotificationType, TypeMeta> = {
  'partner-verification': {
    icon: 'i-lucide-user-check',
    iconClass: 'bg-blue-50 text-blue-600',
    label: 'Partner verification'
  },
  'status-update': {
    icon: 'i-lucide-refresh-cw',
    iconClass: 'bg-violet-50 text-violet-600',
    label: 'Status update'
  },
  'contract-expiry': {
    icon: 'i-lucide-calendar-clock',
    iconClass: 'bg-amber-50 text-amber-600',
    label: 'Contract expiry'
  }
}

const channelMeta: Record<NotificationChannel, { icon: string, label: string }> = {
  slack: {
    icon: 'i-simple-icons-slack',
    label: 'Slack'
  },
  email: {
    icon: 'i-lucide-mail',
    label: 'Email'
  }
}

const meta = computed(() => typeMeta[props.notification.type])

const open = () => {
  emit('open', props.notification)
}
</script>

<template>
  <article
    class="flex cursor-pointer gap-2.5 rounded-lg border p-2.5 transition-colors hover:bg-slate-50/70"
    :class="
      notification.isRead
        ? 'border-slate-200/80 bg-white'
        : 'border-blue-200 bg-blue-50/40'
    "
    role="button"
    tabindex="0"
    @click="open"
    @keydown.enter="open"
    @keydown.space.prevent="open"
  >
    <div
      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
      :class="meta.iconClass"
    >
      <UIcon
        :name="meta.icon"
        class="h-4 w-4"
      />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
        <div class="flex min-w-0 items-center gap-1.5">
          <span
            v-if="!notification.isRead"
            class="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600"
            aria-label="Unread notification"
          />
          <h3 class="truncate text-[11px] font-semibold text-slate-900">
            {{ notification.title }}
          </h3>
          <span class="hidden shrink-0 text-[10px] font-medium text-slate-400 sm:inline">
            · {{ meta.label }}
          </span>
        </div>
        <span
          class="shrink-0 text-[10px] font-medium text-slate-400"
          :title="fullDate"
        >
          {{ relativeTime }}
        </span>
      </div>

      <p class="mt-0.5 text-[11px] leading-4 text-slate-500">
        {{ notification.description }}
      </p>

      <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span
          class="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
        >
          <UIcon
            name="i-lucide-handshake"
            class="h-3 w-3 shrink-0 text-slate-400"
          />
          <span class="truncate">{{ notification.partnerName }}</span>
          <span class="shrink-0 font-mono text-slate-400">{{ notification.partnerId }}</span>
        </span>

        <template v-if="notification.verification">
          <span class="text-[10px] font-medium text-slate-500">
            Assigned to {{ notification.verification.assignedTo }}
            ({{ notification.verification.assignedRole }})
          </span>
          <button
            type="button"
            class="inline-flex h-6 items-center gap-1 rounded-md border border-blue-200 bg-white px-1.5 text-[10px] font-semibold text-blue-700 transition-colors hover:bg-blue-50 cursor-pointer"
            @click.stop="open"
          >
            <UIcon
              name="i-lucide-eye"
              class="h-3 w-3"
            />
            Review
          </button>
        </template>

        <template v-if="notification.statusUpdate">
          <PartnershipStatusBadge
            variant="partner"
            :status="notification.statusUpdate.fromStatus"
          />
          <UIcon
            name="i-lucide-arrow-right"
            class="h-3 w-3 shrink-0 text-slate-400"
          />
          <PartnershipStatusBadge
            variant="partner"
            :status="notification.statusUpdate.toStatus"
          />
        </template>

        <template v-if="notification.contractExpiry">
          <span class="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
            <UIcon
              name="i-lucide-calendar-x"
              class="h-3 w-3 text-slate-400"
            />
            Contract ends {{ contractDate }}
          </span>
          <span
            class="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
          >
            30 days before expiry
          </span>
        </template>

        <div class="ml-auto flex items-center gap-1">
          <span
            v-for="channel in notification.channels"
            :key="channel"
            class="inline-flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500"
            :title="channelMeta[channel].label"
          >
            <UIcon
              :name="channelMeta[channel].icon"
              class="h-3 w-3"
            />
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
