<script setup lang="ts">
import { computed } from 'vue'
import CmsView from '~/modules/cms/components/cms-list/CmsView.vue'
import CmsPartnershipAddView from '~/modules/cms/components/cms-form/CmsPartnershipAddView.vue'

const route = useRoute()
const router = useRouter()

const isAddingPartnership = computed(() => route.query.mode === 'add')

const closeAddPartnership = () => {
  router.push({ path: route.path })
}
</script>

<template>
  <CmsPartnershipAddView
    v-if="isAddingPartnership"
    @back="closeAddPartnership"
  />
  <CmsView
    v-else
    initial-kind="partnership"
  />
</template>
