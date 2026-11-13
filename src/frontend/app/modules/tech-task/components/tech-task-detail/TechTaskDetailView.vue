<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getTechTaskErrorMessage, techTaskApi } from '../../api/tech-task.api'
import type { TechTaskDetail } from '../../types/tech-task.types'
import TechTaskDetailFiles from './TechTaskDetailFiles.vue'
import TechTaskDetailHeader from './TechTaskDetailHeader.vue'
import TechTaskDetailOverview from './TechTaskDetailOverview.vue'
import TechTaskDetailProject from './TechTaskDetailProject.vue'
import TechTaskDetailStacks from './TechTaskDetailStacks.vue'
import TechTaskDetailTechnical from './TechTaskDetailTechnical.vue'

interface Props {
  techTaskId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'edit', techTaskId: string): void
}>()

const detail = ref<TechTaskDetail | null>(null)
const isLoading = ref(true)
const loadError = ref('')

let fetchToken = 0

const fetchDetail = async () => {
  const token = ++fetchToken
  isLoading.value = true
  loadError.value = ''

  try {
    const result = await techTaskApi.getDetail(props.techTaskId)
    if (token === fetchToken) detail.value = result
  } catch (error) {
    if (token === fetchToken) {
      loadError.value = getTechTaskErrorMessage(error)
      detail.value = null
    }
  } finally {
    if (token === fetchToken) isLoading.value = false
  }
}

const goBack = () => {
  emit('back')
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
    <button
      type="button"
      class="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
      @click="goBack"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="h-3.5 w-3.5"
      />
      <span>Back to directory</span>
    </button>

    <div
      v-if="isLoading"
      class="space-y-4"
    >
      <div class="h-20 animate-pulse rounded-xl bg-slate-100" />
      <div class="h-48 animate-pulse rounded-xl bg-slate-100" />
      <div class="h-64 animate-pulse rounded-xl bg-slate-100" />
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
            Failed to load tech task detail
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
      <TechTaskDetailHeader
        :detail="detail"
        @back="goBack"
        @edit="goEdit"
      />

      <TechTaskDetailOverview :detail="detail" />

      <TechTaskDetailTechnical :detail="detail" />

      <TechTaskDetailStacks :detail="detail" />

      <TechTaskDetailProject :detail="detail" />

      <TechTaskDetailFiles :detail="detail" />
    </div>
  </div>
</template>
