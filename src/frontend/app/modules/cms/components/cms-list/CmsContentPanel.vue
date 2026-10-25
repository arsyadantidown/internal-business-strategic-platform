<script setup lang="ts">
import type { CmsContent, CmsContentKind, CmsFilters } from '../../types/cms.types'
import CmsToolbar from './CmsToolbar.vue'
import CmsTable from './CmsTable.vue'
import CmsPagination from './CmsPagination.vue'

interface Props {
  kind: CmsContentKind
  contents: CmsContent[]
  filters: CmsFilters
  totalResults: number
  totalContents: number
  currentPage: number
  pageSize: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:filters', value: CmsFilters): void
  (e: 'update:currentPage' | 'update:pageSize', value: number): void
  (e: 'reset'): void
  (e: 'view' | 'edit' | 'delete', content: CmsContent): void
}>()
</script>

<template>
  <section class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
    <CmsToolbar
      :kind="kind"
      :filters="filters"
      :total-results="totalResults"
      :total-contents="totalContents"
      @update:filters="emit('update:filters', $event)"
      @reset="emit('reset')"
    />

    <CmsTable
      :kind="kind"
      :contents="contents"
      @view="emit('view', $event)"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />

    <div class="border-t border-slate-100 px-4 py-3">
      <CmsPagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total-items="totalResults"
        @update:current-page="emit('update:currentPage', $event)"
        @update:page-size="emit('update:pageSize', $event)"
      />
    </div>
  </section>
</template>
