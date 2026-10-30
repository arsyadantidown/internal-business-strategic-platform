<script setup lang="ts">
import { computed } from 'vue'
import CmsView from '~/modules/cms/components/cms-list/CmsView.vue'
import CmsPortfolioAddView from '~/modules/cms/components/cms-form/CmsPortfolioAddView.vue'

const route = useRoute()
const router = useRouter()

const isAddingPortfolio = computed(() => route.query.mode === 'add')

const closeAddPortfolio = () => {
  router.push({ path: route.path })
}
</script>

<template>
  <CmsPortfolioAddView
    v-if="isAddingPortfolio"
    @back="closeAddPortfolio"
  />
  <CmsView
    v-else
    initial-kind="portfolio"
  />
</template>
