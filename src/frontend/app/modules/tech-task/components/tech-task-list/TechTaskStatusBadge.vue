<script setup lang="ts">
import { computed } from 'vue'
import type { TechTaskMasterDataRef } from '../../types/tech-task.types'

interface Props {
  status: TechTaskMasterDataRef | null
}

const props = defineProps<Props>()

const statusName = computed(() => props.status?.name ?? 'Unknown')
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-blue-700">
    <span class="h-1.5 w-1.5 rounded-full bg-blue-500" />
    {{ statusName }}
  </span>
</template>
