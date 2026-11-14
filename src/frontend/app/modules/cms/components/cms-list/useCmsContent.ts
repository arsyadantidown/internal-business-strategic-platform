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
import { cmsSeedPartnershipContents, createCmsFilters } from '../../data/cms.data'
import { isCmsScheduleDue } from '../../utils/cmsFormat'
import { useCmsAuditTrail } from '../../composables/useCmsAuditTrail'
import { usePortfolioStore } from '~/modules/portofolio/stores/portofolio.store'
import type { ProjectItem } from '~/modules/portofolio/types/types'

const STORAGE_KEY = 'ibsp:cms-content:v3'
const SCHEDULE_INTERVAL_MS = 60_000

const clonePartnershipContents = () => cmsSeedPartnershipContents.map((content) => ({ ...content }))

const normalizeContent = <T extends CmsContent>(content: T): T => ({
  ...content,
  scheduledAt: content.scheduledAt ?? null
})

const nowIso = () => new Date().toISOString()

// Mapper dari data store ProjectItem ke CmsPortfolioContent (DRY, struktur terpakai di CmsTable)
const mapProjectToCmsPortfolio = (project: ProjectItem): CmsPortfolioContent => {
  return {
    id: project.id,
    kind: 'portfolio',
    title: project.title,
    summary: project.description,
    status: 'Published',
    author: 'Admin',
    featured: false,
    publishedAt: project.updatedAt,
    scheduledAt: null,
    createdAt: project.updatedAt,
    updatedAt: project.updatedAt,
    client: project.client,
    industry: project.industry,
    clientIndustry: project.industry,
    clientLocation: '-',
    contactName: '-',
    contactEmail: '-',
    projectStatus: (project.status || 'On Going') as any,
    startDate: '',
    endDate: '',
    location: '-',
    teamSize: '-',
    projectValue: '0',
    currency: 'IDR',
    fundingType: '-',
    overview: project.description,
    background: '',
    challenges: [],
    solutions: [],
    image: project.image,
    documents: [],
    technologies: project.technologies || [],
    partners: [],
    visibility: 'Internal',
    projectType: 'Project'
  }
}

export function useCmsContent(initialKind: CmsContentKind = 'portfolio') {
  const portfolioStore = usePortfolioStore()
  const activeKind = ref<CmsContentKind>(initialKind)
  const portfolioContents = ref<CmsPortfolioContent[]>([])
  const partnershipContents = ref<CmsPartnershipContent[]>(clonePartnershipContents())
  const { activities, addActivity } = useCmsAuditTrail()
  const filters = ref<CmsFilters>(createCmsFilters())
  const currentPage = ref(1)
  const pageSize = ref(5)
  const isHydrated = ref(false)
  let scheduleTimer: ReturnType<typeof setInterval> | undefined

  // Mengambil daftar project dari Pinia portfolioStore
  const loadPortfolioData = () => {
    portfolioStore.fetchProjects({
      page: 1,
      page_size: 50,
      search: filters.value.search || undefined
    })
  }

  // Sinkronisasi data dari portfolioStore ke local portfolioContents
  watch(
    () => portfolioStore.projects,
    (projects) => {
      if (projects && projects.length > 0) {
        portfolioContents.value = projects.map(mapProjectToCmsPortfolio)
      }
    },
    { immediate: true }
  )

  const contents = computed<CmsContent[]>(() =>
    activeKind.value === 'portfolio' ? portfolioContents.value : partnershipContents.value
  )

  const totalContents = computed(() => contents.value.length)

  const countByStatus = (status: CmsContentStatus) =>
    contents.value.filter((content) => content.status === status).length

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
        icon: 'i-lucide-file-clock',
        tone: 'amber',
        hint: 'Work in progress'
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
        const searchable =
          content.kind === 'portfolio'
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

        const matchesSearch =
          !keyword || searchable.some((value) => (value || '').toLowerCase().includes(keyword))

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

  const endItem = computed(() => Math.min(currentPage.value * pageSize.value, totalResults.value))

  const buildNextId = (kind: CmsContentKind) => {
    const source = kind === 'portfolio' ? portfolioContents.value : partnershipContents.value
    const prefix = kind === 'portfolio' ? 'port' : 'part'
    const maxNumber = source.reduce((highest, item) => {
      const match = item.id.match(/-(\d+)$/)
      if (!match || !match[1]) return highest
      const parsed = Number(match[1])
      return Number.isNaN(parsed) ? highest : Math.max(highest, parsed)
    }, 0)

    return `${prefix}-${String(maxNumber + 1).padStart(3, '0')}`
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
      detail:
        content.status === 'Scheduled'
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
      const existing = portfolioContents.value.find((content) => content.id === id)
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

      portfolioContents.value = portfolioContents.value.map((content) =>
        content.id === id ? updated : content
      )

      trackStatusActivity(
        'portfolio',
        previousStatus,
        updated.status,
        updated.title,
        updated.scheduledAt
      )
      return updated
    }

    const existing = partnershipContents.value.find((content) => content.id === id)
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

    partnershipContents.value = partnershipContents.value.map((content) =>
      content.id === id ? updated : content
    )

    trackStatusActivity(
      'partnership',
      previousStatus,
      updated.status,
      updated.title,
      updated.scheduledAt
    )
    return updated
  }

  const trackStatusActivity = (
    kind: CmsContentKind,
    previousStatus: CmsContentStatus,
    nextStatus: CmsContentStatus,
    title: string,
    scheduledAt: string | null
  ) => {
    const type: CmsActivityType =
      nextStatus === 'Published'
        ? 'published'
        : nextStatus === 'Scheduled'
          ? 'scheduled'
          : nextStatus === 'Archived'
            ? 'archived'
            : 'updated'

    const detail =
      type === 'scheduled' && scheduledAt
        ? `Scheduled for ${scheduledAt}`
        : previousStatus === nextStatus
          ? `Status remained ${nextStatus}`
          : `Status changed from ${previousStatus} to ${nextStatus}`

    addActivity({ kind, type, contentTitle: title, detail })
  }

  const deleteContent = (kind: CmsContentKind, id: string): CmsContent | null => {
    if (kind === 'portfolio') {
      const target = portfolioContents.value.find((content) => content.id === id)
      if (!target) return null

      portfolioContents.value = portfolioContents.value.filter((content) => content.id !== id)
      addActivity({
        kind: 'portfolio',
        type: 'deleted',
        contentTitle: target.title,
        detail: `Deleted portfolio content ${target.id}`
      })
      return target
    }

    const target = partnershipContents.value.find((content) => content.id === id)
    if (!target) return null

    partnershipContents.value = partnershipContents.value.filter((content) => content.id !== id)
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
    loadPortfolioData()
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

  // Watcher search debounce untuk memanggil ulang API bila input search diubah
  let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined
  watch(
    () => filters.value.search,
    () => {
      if (activeKind.value === 'portfolio') {
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
        searchDebounceTimer = setTimeout(() => {
          loadPortfolioData()
        }, 400)
      }
    }
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
    // Ambil data project nyata dari backend
    loadPortfolioData()

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          partnershipContents?: CmsPartnershipContent[]
        }
        if (Array.isArray(parsed.partnershipContents)) {
          partnershipContents.value = parsed.partnershipContents.map(normalizeContent)
        }
      }
    } catch {
      // Keep seeded data
    } finally {
      isHydrated.value = true
      applyDueSchedules()
      scheduleTimer = setInterval(applyDueSchedules, SCHEDULE_INTERVAL_MS)
    }
  })

  onUnmounted(() => {
    if (scheduleTimer) clearInterval(scheduleTimer)
  })

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
    isLoading: computed(() => portfolioStore.isLoading),
    createContent,
    updateContent,
    deleteContent,
    setFilters,
    resetFilters,
    setPage,
    setPageSize
  }
}
