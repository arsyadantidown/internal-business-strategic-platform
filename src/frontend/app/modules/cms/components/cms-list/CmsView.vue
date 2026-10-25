<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type {
  CmsContent,
  CmsContentKind,
  CmsContentSaveAction,
  CmsFilters,
  CmsPartnershipFormValues,
  CmsPortfolioFormValues
} from '../../types/cms.types'
import { useCmsContent } from './useCmsContent'
import CmsPageHeader from './CmsPageHeader.vue'
import CmsStats from './CmsStats.vue'
import CmsRecentActivity from './CmsRecentActivity.vue'
import CmsContentPanel from './CmsContentPanel.vue'
import CmsPortfolioFormModal from '../cms-form/CmsPortfolioFormModal.vue'
import CmsPartnershipFormModal from '../cms-form/CmsPartnershipFormModal.vue'
import CmsContentDetailModal from '../cms-detail/CmsContentDetailModal.vue'
import CmsDeleteDialog from '../cms-delete/CmsDeleteDialog.vue'

interface Props {
  initialKind?: CmsContentKind
}

const props = withDefaults(defineProps<Props>(), {
  initialKind: 'portfolio'
})

const toast = useToast()
const router = useRouter()

const {
  activeKind,
  activities,
  filters,
  currentPage,
  pageSize,
  stats,
  paginatedContents,
  totalResults,
  totalContents,
  createContent,
  updateContent,
  deleteContent,
  setFilters,
  resetFilters,
  setPage,
  setPageSize
} = useCmsContent(props.initialKind)

const isPortfolioFormOpen = ref(false)
const isPartnershipFormOpen = ref(false)
const isDetailOpen = ref(false)
const isDeleteOpen = ref(false)
const selectedContent = ref<CmsContent | null>(null)
const editingContent = ref<CmsContent | null>(null)

const editingPortfolio = computed(() =>
  editingContent.value?.kind === 'portfolio' ? editingContent.value : null
)

const editingPartnership = computed(() =>
  editingContent.value?.kind === 'partnership' ? editingContent.value : null
)

const openCreate = () => {
  editingContent.value = null
  if (activeKind.value === 'portfolio') {
    router.push({
      query: {
        ...router.currentRoute.value.query,
        mode: 'add'
      }
    })
    return
  }

  isPartnershipFormOpen.value = true
}

const openDetail = (content: CmsContent) => {
  selectedContent.value = content
  isDetailOpen.value = true
}

const openEdit = (content: CmsContent) => {
  editingContent.value = content
  isDetailOpen.value = false

  if (content.kind === 'portfolio') {
    isPortfolioFormOpen.value = true
  } else {
    isPartnershipFormOpen.value = true
  }
}

const openRequestDelete = (content: CmsContent) => {
  selectedContent.value = content
  isDeleteOpen.value = true
}

const saveActionPast: Record<CmsContentSaveAction, string> = {
  draft: 'saved as a draft',
  schedule: 'scheduled for publication',
  publish: 'published'
}

const handleSavePortfolio = (
  values: CmsPortfolioFormValues,
  action: CmsContentSaveAction
) => {
  if (editingPortfolio.value) {
    const updated = updateContent('portfolio', editingPortfolio.value.id, values)

    if (updated) {
      toast.add({
        title: 'Portfolio content updated',
        description: `"${updated.title}" was ${saveActionPast[action]} successfully.`,
        color: 'success'
      })
    } else {
      toast.add({
        title: 'Update failed',
        description: 'The selected portfolio content could not be found.',
        color: 'error'
      })
    }
  } else {
    const created = createContent('portfolio', values)
    resetFilters()
    setPage(1)
    toast.add({
      title: 'Portfolio content created',
      description: `"${created.title}" was ${saveActionPast[action]} successfully.`,
      color: 'success'
    })
  }

  isPortfolioFormOpen.value = false
  editingContent.value = null
}

const handleSavePartnership = (
  values: CmsPartnershipFormValues,
  action: CmsContentSaveAction
) => {
  if (editingPartnership.value) {
    const updated = updateContent('partnership', editingPartnership.value.id, values)

    if (updated) {
      toast.add({
        title: 'Partnership content updated',
        description: `"${updated.title}" was ${saveActionPast[action]} successfully.`,
        color: 'success'
      })
    } else {
      toast.add({
        title: 'Update failed',
        description: 'The selected partnership content could not be found.',
        color: 'error'
      })
    }
  } else {
    const created = createContent('partnership', values)
    resetFilters()
    setPage(1)
    toast.add({
      title: 'Partnership content created',
      description: `"${created.title}" was ${saveActionPast[action]} successfully.`,
      color: 'success'
    })
  }

  isPartnershipFormOpen.value = false
  editingContent.value = null
}

const handleDeleteConfirm = () => {
  const target = selectedContent.value
  if (target) {
    const deleted = deleteContent(target.kind, target.id)
    if (deleted) {
      toast.add({
        title: 'Content deleted',
        description: `"${deleted.title}" has been removed from the library.`,
        color: 'success'
      })
    } else {
      toast.add({
        title: 'Delete failed',
        description: 'The selected content could not be found.',
        color: 'error'
      })
    }
  }

  isDeleteOpen.value = false
  selectedContent.value = null
}

const handleFilters = (value: CmsFilters) => {
  setFilters(value)
}

const handleResetFilters = () => {
  resetFilters()
}

const handleDetailClose = () => {
  isDetailOpen.value = false
}

const handleDeleteClose = () => {
  isDeleteOpen.value = false
  selectedContent.value = null
}

const closePortfolioForm = () => {
  isPortfolioFormOpen.value = false
  editingContent.value = null
}

const closePartnershipForm = () => {
  isPartnershipFormOpen.value = false
  editingContent.value = null
}
</script>

<template>
  <div class="space-y-4 pb-8">
    <CmsPageHeader
      :kind="activeKind"
      @add-content="openCreate"
    />

    <CmsStats :stats="stats" />

    <CmsRecentActivity :activities="activities" />

    <CmsContentPanel
      :kind="activeKind"
      :contents="paginatedContents"
      :filters="filters"
      :total-results="totalResults"
      :total-contents="totalContents"
      :current-page="currentPage"
      :page-size="pageSize"
      @update:filters="handleFilters"
      @update:current-page="setPage"
      @update:page-size="setPageSize"
      @reset="handleResetFilters"
      @view="openDetail"
      @edit="openEdit"
      @delete="openRequestDelete"
    />

    <CmsPortfolioFormModal
      :is-open="isPortfolioFormOpen"
      :content="editingPortfolio"
      @close="closePortfolioForm"
      @save="handleSavePortfolio"
    />

    <CmsPartnershipFormModal
      :is-open="isPartnershipFormOpen"
      :content="editingPartnership"
      @close="closePartnershipForm"
      @save="handleSavePartnership"
    />

    <CmsContentDetailModal
      :is-open="isDetailOpen"
      :content="selectedContent"
      @close="handleDetailClose"
      @edit="openEdit"
    />

    <CmsDeleteDialog
      :is-open="isDeleteOpen"
      :content="selectedContent"
      @close="handleDeleteClose"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
