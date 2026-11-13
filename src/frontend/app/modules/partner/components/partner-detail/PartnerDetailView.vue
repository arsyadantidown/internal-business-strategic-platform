<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getPartnerErrorMessage, partnerApi } from '../../api/partner.api'
import type { PartnerDetail } from '../../types/partner.types'
import PartnerDetailCooperation from './PartnerDetailCooperation.vue'
import PartnerDetailDocuments from './PartnerDetailDocuments.vue'
import PartnerDetailExpertise from './PartnerDetailExpertise.vue'
import PartnerDetailHeader from './PartnerDetailHeader.vue'
import PartnerDetailProfile from './PartnerDetailProfile.vue'

interface Props {
  partnerId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'edit', partnerId: string): void
}>()

const toast = useToast()

const detail = ref<PartnerDetail | null>(null)
const isLoading = ref(true)
const loadError = ref('')
const isTogglingActive = ref(false)

let fetchToken = 0

const fetchDetail = async () => {
  const token = ++fetchToken
  isLoading.value = true
  loadError.value = ''

  try {
    const result = await partnerApi.getDetail(props.partnerId)
    if (token === fetchToken) detail.value = result
  } catch (error) {
    if (token === fetchToken) {
      loadError.value = getPartnerErrorMessage(error)
      detail.value = null
    }
  } finally {
    if (token === fetchToken) isLoading.value = false
  }
}

const toggleActive = async () => {
  if (!detail.value || isTogglingActive.value) return

  isTogglingActive.value = true

  try {
    const nextActive = !detail.value.isActive
    await partnerApi.setActive(props.partnerId, nextActive)

    detail.value = { ...detail.value, isActive: nextActive }

    toast.add({
      title: nextActive ? 'Partner activated' : 'Partner deactivated',
      description: `"${detail.value.partnerName}" is now ${nextActive ? 'active' : 'inactive'}.`,
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Failed to update partner status',
      description: getPartnerErrorMessage(error),
      color: 'error'
    })
  } finally {
    isTogglingActive.value = false
  }
}

const goEdit = () => {
  if (detail.value) emit('edit', detail.value.id)
}

onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <div class="space-y-5">
    <div
      v-if="isLoading"
      class="space-y-4"
    >
      <div class="h-20 animate-pulse rounded-xl bg-slate-100" />
      <div class="h-44 animate-pulse rounded-xl bg-slate-100" />
      <div class="h-56 animate-pulse rounded-xl bg-slate-100" />
      <div class="h-40 animate-pulse rounded-xl bg-slate-100" />
    </div>

    <div
      v-else-if="loadError"
      class="rounded-xl border border-slate-200/80 bg-white p-10 shadow-xs"
    >
      <div class="flex flex-col items-center gap-2.5 text-center">
        <UIcon
          name="i-lucide-circle-alert"
          class="h-8 w-8 text-red-400"
        />
        <div>
          <p class="text-xs font-semibold text-slate-700">
            Failed to load partner detail
          </p>
          <p class="mt-0.5 max-w-md text-[11px] text-slate-500">
            {{ loadError }}
          </p>
        </div>
        <button
          type="button"
          class="mt-1 inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 cursor-pointer"
          @click="fetchDetail"
        >
          <UIcon
            name="i-lucide-rotate-ccw"
            class="h-3.5 w-3.5"
          />
          <span>Retry</span>
        </button>
      </div>
    </div>

    <div
      v-else-if="detail"
      class="space-y-4"
    >
      <PartnerDetailHeader
        :detail="detail"
        @back="emit('back')"
        @edit="goEdit"
        @toggle-active="toggleActive"
      />

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <PartnerDetailProfile :detail="detail" />
        </div>
        <div class="lg:col-span-1">
          <PartnerDetailExpertise :detail="detail" />
        </div>
      </div>

      <PartnerDetailDocuments :detail="detail" />

      <PartnerDetailCooperation :detail="detail" />
    </div>
  </div>
</template>
