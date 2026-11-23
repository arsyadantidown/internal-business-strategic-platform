<script setup lang="ts">
import { computed } from 'vue'
import PartnerDetailView from '~/modules/partner/components/partner-detail/PartnerDetailView.vue'
import PartnerFormView from '~/modules/partner/components/partner-form/PartnerFormView.vue'
import PartnerView from '~/modules/partner/components/partner-list/PartnerView.vue'

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
  <PartnerFormView
    v-if="isAddMode || isEditMode"
    :key="activeId ?? 'add'"
    :editing-id="isEditMode ? activeId : null"
    @back="closeOverlay"
    @saved="closeOverlay"
  />
  <PartnerDetailView
    v-else-if="isDetailMode"
    :key="activeId ?? 'detail'"
    :partner-id="activeId ?? ''"
    @back="closeOverlay"
    @edit="id => router.push({ query: { mode: 'edit', id } })"
  />
  <PartnerView v-else />
</template>
