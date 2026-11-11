<script setup lang="ts">
import { computed } from 'vue'
import TechTaskDetailView from '~/modules/tech-task/components/tech-task-detail/TechTaskDetailView.vue'
import TechTaskFormView from '~/modules/tech-task/components/tech-task-form/TechTaskFormView.vue'
import TechTaskView from '~/modules/tech-task/components/tech-task-list/TechTaskView.vue'

const route = useRoute()
const router = useRouter()

const mode = computed(() => {
  const value = route.query.mode

  return typeof value === 'string' ? value : ''
})

const activeId = computed(() => {
  const value = route.query.id

  return typeof value === 'string' && value !== '' ? value : null
})

const isAddMode = computed(() => mode.value === 'add')
const isEditMode = computed(() => mode.value === 'edit' && activeId.value !== null)
const isDetailMode = computed(() => mode.value === 'detail' && activeId.value !== null)

const closeOverlay = () => {
  router.push({ path: route.path })
}
</script>

<template>
  <TechTaskFormView
    v-if="isAddMode || isEditMode"
    :key="activeId ?? 'add'"
    :editing-id="isEditMode ? activeId : null"
    @back="closeOverlay"
    @saved="closeOverlay"
  />
  <TechTaskDetailView
    v-else-if="isDetailMode"
    :key="activeId ?? 'detail'"
    :tech-task-id="activeId ?? ''"
    @back="closeOverlay"
    @edit="id => router.push({ query: { mode: 'edit', id } })"
  />
  <TechTaskView v-else />
</template>
