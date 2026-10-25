import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type {
  CmsActivityType,
  CmsContent,
  CmsContentKind,
  CmsContentStatus,
  CmsFilters,
  CmsPartnershipContent,
  CmsPartnershipFormValues,
  CmsPortfolioContent,
  CmsPortfolioFormValues,
  CmsStat
} from '../../types/cms.types'
import {
  cmsSeedPartnershipContents,
  cmsSeedPortfolioContents,
  createCmsFilters
} from '../../data/cms.data'
import { isCmsScheduleDue } from '../../utils/cmsFormat'
import { useCmsAuditTrail } from '../../composables/useCmsAuditTrail'

const STORAGE_KEY = 'ibsp:cms-content:v3'
const SCHEDULE_INTERVAL_MS = 60_000

const clonePortfolioContents = () =>
  cmsSeedPortfolioContents.map(content => ({ ...content }))

const clonePartnershipContents = () =>
  cmsSeedPartnershipContents.map(content => ({ ...content }))

const normalizeContent = <T extends CmsContent>(content: T): T => ({
  ...content,
  scheduledAt: content.scheduledAt ?? null
})

const nowIso = () => new Date().toISOString()

export function useCmsContent(initialKind: CmsContentKind = 'portfolio') {
  const activeKind = ref<CmsContentKind>(initialKind)
  const portfolioContents = ref<CmsPortfolioContent[]>(clonePortfolioContents())
  const partnershipContents = ref<CmsPartnershipContent[]>(clonePartnershipContents())
  const { activities, addActivity } = useCmsAuditTrail()
  const filters = ref<CmsFilters>(createCmsFilters())
  const currentPage = ref(1)
  const pageSize = ref(5)
  const isHydrated = ref(false)
  let scheduleTimer: ReturnType<typeof setInterval> | undefined

  const contents = computed<CmsContent[]>(() =>
    activeKind.value === 'portfolio'
      ? portfolioContents.value
      : partnershipContents.value
  )

  const totalContents = computed(() => contents.value.length)

  const countByStatus = (status: CmsContentStatus) =>
    contents.value.filter(content => content.status === status).length

  const stats = computed<CmsStat[]>(() => {
    const isPortfolio = activeKind.value === 'portfolio'

    return [
      {
        key: 'total',
        label: isPortfolio ? 'Total Portfolio' : 'Total Partnership',
        value: totalContents.value,
        icon: isPortfolio ? 'i-lucide-briefcase' : 'i-lucide-handshake',
        tone: 'blue',
        hint: isPortfolio ? 'All portfolio content' : 'All partnership content'
      },
      {
        key: 'published',
        label: 'Published',
        value: countByStatus('Published'),
        icon: 'i-lucide-circle-check-big',
        tone: 'emerald',
        hint: 'Visible on the platform'
      },
      {
        key: 'draft',
        label: 'Draft',
        value: countByStatus('Draft'),
        icon: 'i-lucide-file-pen-line',
        tone: 'amber',
        hint: 'Still in progress'
      },
      {
        key: 'scheduled',
        label: 'Scheduled',
        value: countByStatus('Scheduled'),
        icon: 'i-lucide-calendar-clock',
        tone: 'rose',
        hint: 'Queued for publication'
      },
      {
        key: 'archived',
        label: 'Archived',
        value: countByStatus('Archived'),
        icon: 'i-lucide-archive',
        tone: 'slate',
        hint: 'Stored for reference'
      }
    ]
  })

  const filteredContents = computed(() => {
    const keyword = filters.value.search.trim().toLowerCase()

    return contents.value
      .filter((content) => {
        const searchable = content.kind === 'portfolio'
          ? [
              content.title,
              content.summary,
              content.client,
              content.industry,
              content.location,
              content.projectType,
              content.serviceType
            ]
          : [
              content.title,
              content.summary,
              content.website,
              content.industry,
              content.location,
              content.category,
              content.partnerType
            ]

        const matchesSearch = !keyword
          || searchable.some(value => value.toLowerCase().includes(keyword))

        const matchesStatus = !filters.value.status || content.status === filters.value.status
        return matchesSearch && matchesStatus
      })
      .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))
  })

  const totalResults = computed(() => filteredContents.value.length)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredContents.value.length / pageSize.value))
  )

  const paginatedContents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredContents.value.slice(start, start + pageSize.value)
  })

  const startItem = computed(() =>
    totalResults.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1
  )

  const endItem = computed(() =>
    Math.min(currentPage.value * pageSize.value, totalResults.value)
  )

  const buildNextId = (kind: CmsContentKind) => {
    const source = kind === 'portfolio' ? portfolioContents.value : partnershipContents.value
    const prefix = kind === 'portfolio' ? 'PF' : 'PT'

    const highestId = source.reduce((highest, content) => {
      const numericId = Number(content.id.replace(/\D/g, ''))
      return Number.isFinite(numericId) ? Math.max(highest, numericId) : highest
    }, 0)

    return `${prefix}-2026-${String(highestId + 1).padStart(3, '0')}`
  }

  const createContent = (
    kind: CmsContentKind,
    values: CmsPortfolioFormValues | CmsPartnershipFormValues
  ): CmsContent => {
    const timestamp = nowIso()

    if (kind === 'portfolio') {
      const portfolioValues = values as CmsPortfolioFormValues
      const content: CmsPortfolioContent = {
        ...portfolioValues,
        id: buildNextId('portfolio'),
        kind: 'portfolio',
        publishedAt: portfolioValues.publishedAt || null,
        scheduledAt: portfolioValues.scheduledAt || null,
        createdAt: timestamp,
        updatedAt: timestamp
      }

      portfolioContents.value = [content, ...portfolioContents.value]
      recordCreateActivity(content)
      return content
    }

    const partnershipValues = values as CmsPartnershipFormValues
    const content: CmsPartnershipContent = {
      ...partnershipValues,
      id: buildNextId('partnership'),
      kind: 'partnership',
      publishedAt: partnershipValues.publishedAt || null,
      scheduledAt: partnershipValues.scheduledAt || null,
      createdAt: timestamp,
      updatedAt: timestamp
    }

    partnershipContents.value = [content, ...partnershipContents.value]
    recordCreateActivity(content)
    return content
  }

  const recordCreateActivity = (content: CmsContent) => {
    addActivity({
      kind: content.kind,
      type: content.status === 'Scheduled' ? 'scheduled' : 'created',
      contentTitle: content.title,
      detail: content.status === 'Scheduled'
        ? `Created and scheduled for ${content.scheduledAt}`
        : `Created as ${content.status}`
    })
  }

  const updateContent = (
    kind: CmsContentKind,
    id: string,
    values: CmsPortfolioFormValues | CmsPartnershipFormValues
  ): CmsContent | null => {
    const timestamp = nowIso()

    if (kind === 'portfolio') {
      const existing = portfolioContents.value.find(content => content.id === id)
      if (!existing) return null

      const previousStatus = existing.status
      const portfolioValues = values as CmsPortfolioFormValues
      const updated: CmsPortfolioContent = {
        ...existing,
        ...portfolioValues,
        id: existing.id,
        kind: 'portfolio',
        publishedAt: portfolioValues.publishedAt || null,
        scheduledAt: portfolioValues.scheduledAt || null,
        createdAt: existing.createdAt,
        updatedAt: timestamp
      }

      portfolioContents.value = portfolioContents.value.map(content =>
        content.id === id ? updated : content
      )

      trackStatusActivity('portfolio', previousStatus, updated.status, updated.title, updated.scheduledAt)
      return updated
    }

    const existing = partnershipContents.value.find(content => content.id === id)
    if (!existing) return null

    const previousStatus = existing.status
    const partnershipValues = values as CmsPartnershipFormValues
    const updated: CmsPartnershipContent = {
      ...existing,
      ...partnershipValues,
      id: existing.id,
      kind: 'partnership',
      publishedAt: partnershipValues.publishedAt || null,
      scheduledAt: partnershipValues.scheduledAt || null,
      createdAt: existing.createdAt,
      updatedAt: timestamp
    }

    partnershipContents.value = partnershipContents.value.map(content =>
      content.id === id ? updated : content
    )

    trackStatusActivity('partnership', previousStatus, updated.status, updated.title, updated.scheduledAt)
    return updated
  }

  const trackStatusActivity = (
    kind: CmsContentKind,
    previousStatus: CmsContentStatus,
    nextStatus: CmsContentStatus,
    title: string,
    scheduledAt: string | null
  ) => {
    const type: CmsActivityType = previousStatus === nextStatus
      ? 'updated'
      : nextStatus === 'Scheduled'
        ? 'scheduled'
        : nextStatus === 'Published'
          ? 'published'
          : nextStatus === 'Archived'
            ? 'archived'
            : 'updated'

    const detail = type === 'scheduled' && scheduledAt
      ? `Scheduled for ${scheduledAt}`
      : previousStatus === nextStatus
        ? `Status remained ${nextStatus}`
        : `Status changed from ${previousStatus} to ${nextStatus}`

    addActivity({ kind, type, contentTitle: title, detail })
  }

  const deleteContent = (kind: CmsContentKind, id: string): CmsContent | null => {
    if (kind === 'portfolio') {
      const target = portfolioContents.value.find(content => content.id === id)
      if (!target) return null

      portfolioContents.value = portfolioContents.value.filter(content => content.id !== id)
      addActivity({
        kind: 'portfolio',
        type: 'deleted',
        contentTitle: target.title,
        detail: `Deleted portfolio content ${target.id}`
      })
      return target
    }

    const target = partnershipContents.value.find(content => content.id === id)
    if (!target) return null

    partnershipContents.value = partnershipContents.value.filter(content => content.id !== id)
    addActivity({
      kind: 'partnership',
      type: 'deleted',
      contentTitle: target.title,
      detail: `Deleted partnership content ${target.id}`
    })
    return target
  }

  const setFilters = (value: CmsFilters) => {
    filters.value = { ...value }
  }

  const resetFilters = () => {
    filters.value = createCmsFilters()
  }

  const setPage = (page: number) => {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }

  watch(
    filters,
    () => {
      currentPage.value = 1
    },
    { deep: true }
  )

  watch([totalPages, pageSize], () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
    if (currentPage.value < 1) currentPage.value = 1
  })

  const applyDueSchedules = () => {
    const timestamp = nowIso()
    let hasChanges = false

    const nextPortfolio = portfolioContents.value.map((content) => {
      if (content.status !== 'Scheduled' || !isCmsScheduleDue(content.scheduledAt)) {
        return content
      }

      hasChanges = true
      addActivity({
        kind: 'portfolio',
        type: 'published',
        contentTitle: content.title,
        detail: `Scheduled publication executed for ${content.scheduledAt}`
      })

      return {
        ...content,
        status: 'Published' as const,
        publishedAt: content.scheduledAt ? new Date(content.scheduledAt).toISOString() : timestamp,
        scheduledAt: null,
        updatedAt: timestamp
      }
    })

    const nextPartnership = partnershipContents.value.map((content) => {
      if (content.status !== 'Scheduled' || !isCmsScheduleDue(content.scheduledAt)) {
        return content
      }

      hasChanges = true
      addActivity({
        kind: 'partnership',
        type: 'published',
        contentTitle: content.title,
        detail: `Scheduled publication executed for ${content.scheduledAt}`
      })

      return {
        ...content,
        status: 'Published' as const,
        publishedAt: content.scheduledAt ? new Date(content.scheduledAt).toISOString() : timestamp,
        scheduledAt: null,
        updatedAt: timestamp
      }
    })

    if (!hasChanges) return

    portfolioContents.value = nextPortfolio
    partnershipContents.value = nextPartnership
  }

  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          portfolioContents?: CmsPortfolioContent[]
          partnershipContents?: CmsPartnershipContent[]
        }
        if (Array.isArray(parsed.portfolioContents)) {
          portfolioContents.value = parsed.portfolioContents.map(normalizeContent)
        }
        if (Array.isArray(parsed.partnershipContents)) {
          partnershipContents.value = parsed.partnershipContents.map(normalizeContent)
        }
      }
    } catch {
      // Keep the seeded data when local storage is unavailable or malformed.
    } finally {
      isHydrated.value = true
      applyDueSchedules()
      scheduleTimer = setInterval(applyDueSchedules, SCHEDULE_INTERVAL_MS)
    }
  })

  onUnmounted(() => {
    if (scheduleTimer) clearInterval(scheduleTimer)
  })

  watch(
    [portfolioContents, partnershipContents],
    () => {
      if (!isHydrated.value || !import.meta.client) return

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            portfolioContents: portfolioContents.value,
            partnershipContents: partnershipContents.value
          })
        )
      } catch {
        // Ignore storage quota or privacy mode errors.
      }
    },
    { deep: true }
  )

  return {
    activeKind,
    portfolioContents,
    partnershipContents,
    contents,
    activities,
    filters,
    currentPage,
    pageSize,
    stats,
    filteredContents,
    paginatedContents,
    totalResults,
    totalContents,
    totalPages,
    startItem,
    endItem,
    createContent,
    updateContent,
    deleteContent,
    setFilters,
    resetFilters,
    setPage,
    setPageSize
  }
}
