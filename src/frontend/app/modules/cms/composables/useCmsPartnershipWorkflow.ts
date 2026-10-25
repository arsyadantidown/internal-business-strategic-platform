import { computed, onMounted, ref, watch } from 'vue'
import type { CmsWorkflowStage } from '../types/cms.types'
import type {
  CmsCollaborationHistoryRow,
  CmsWorkflowItem,
  CmsWorkflowStageMeta
} from '../types/cmsWorkflow.types'
import { useCmsContent } from '../components/cms-list/useCmsContent'
import { useCmsAuditTrail } from './useCmsAuditTrail'
import { downloadCmsCsv } from '../utils/cmsExport'
import { formatCmsDateTime } from '../utils/cmsFormat'
import { partners } from '~/modules/partnership/components/partnership-list/partnership.data'
import type { Partner } from '~/modules/partnership/components/partnership-list/partnership.types'

const STORAGE_KEY = 'ibsp:cms-workflow:v1'

export const cmsWorkflowStageMeta: CmsWorkflowStageMeta[] = [
  {
    stage: 'Draft',
    label: 'Draft',
    description: 'Partner record is being prepared.',
    icon: 'i-lucide-file-pen-line',
    dotClass: 'bg-slate-400',
    chipClass: 'border-slate-200 bg-slate-100 text-slate-600',
    columnClass: 'border-slate-200 bg-slate-50/60'
  },
  {
    stage: 'Verification',
    label: 'Verification',
    description: 'Documents and partner profile are being checked.',
    icon: 'i-lucide-shield-check',
    dotClass: 'bg-amber-500',
    chipClass: 'border-amber-200 bg-amber-50 text-amber-700',
    columnClass: 'border-amber-200 bg-amber-50/40'
  },
  {
    stage: 'Evaluation',
    label: 'Evaluation',
    description: 'Capability and commercial fit are under review.',
    icon: 'i-lucide-clipboard-check',
    dotClass: 'bg-violet-500',
    chipClass: 'border-violet-200 bg-violet-50 text-violet-700',
    columnClass: 'border-violet-200 bg-violet-50/40'
  },
  {
    stage: 'Active',
    label: 'Active',
    description: 'Partnership is approved and operating.',
    icon: 'i-lucide-circle-check-big',
    dotClass: 'bg-emerald-500',
    chipClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    columnClass: 'border-emerald-200 bg-emerald-50/40'
  },
  {
    stage: 'Closed',
    label: 'Closed',
    description: 'Contract expired or partnership terminated.',
    icon: 'i-lucide-circle-x',
    dotClass: 'bg-rose-500',
    chipClass: 'border-rose-200 bg-rose-50 text-rose-700',
    columnClass: 'border-rose-200 bg-rose-50/40'
  }
]

const stageMetaMap = new Map(
  cmsWorkflowStageMeta.map(meta => [meta.stage, meta])
)

const defaultReviewStages: Record<string, CmsWorkflowStage> = {
  'PIN-2026-006': 'Verification',
  'PIN-2026-018': 'Verification',
  'PIN-2026-011': 'Evaluation',
  'PIN-2026-016': 'Evaluation'
}

const getDefaultStage = (partner: Partner): CmsWorkflowStage => {
  if (partner.status === 'Draft') return 'Draft'
  if (partner.status === 'Active') return 'Active'
  if (partner.status === 'Expired' || partner.status === 'Terminated') return 'Closed'
  return defaultReviewStages[partner.id] ?? 'Verification'
}

const buildFilename = (prefix: string) => {
  const date = new Date().toISOString().slice(0, 10)
  return `${prefix}-${date}.csv`
}

export function useCmsPartnershipWorkflow() {
  const { portfolioContents } = useCmsContent('portfolio')
  const { addActivity } = useCmsAuditTrail()

  const stageOverrides = ref<Record<string, CmsWorkflowStage>>({})
  const hydrated = ref(false)
  const search = ref('')
  const stageFilter = ref<'all' | CmsWorkflowStage>('all')
  const categoryFilter = ref('all')

  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, CmsWorkflowStage>
        if (parsed && typeof parsed === 'object') {
          stageOverrides.value = parsed
        }
      }
    } catch {
      stageOverrides.value = {}
    } finally {
      hydrated.value = true
    }
  })

  watch(
    stageOverrides,
    (value) => {
      if (!hydrated.value || !import.meta.client) return

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        // Ignore storage quota or privacy mode errors.
      }
    },
    { deep: true }
  )

  const items = computed<CmsWorkflowItem[]>(() =>
    partners.map(partner => ({
      ...partner,
      stage: stageOverrides.value[partner.id] ?? getDefaultStage(partner),
      isOverride: Boolean(stageOverrides.value[partner.id])
    }))
  )

  const categoryOptions = computed(() =>
    [...new Set(partners.map(partner => partner.category))].sort()
  )

  const filteredItems = computed(() => {
    const query = search.value.trim().toLowerCase()

    return items.value.filter((item) => {
      if (stageFilter.value !== 'all' && item.stage !== stageFilter.value) return false
      if (categoryFilter.value !== 'all' && item.category !== categoryFilter.value) return false
      if (!query) return true

      return [
        item.id,
        item.name,
        item.category,
        item.partnerType,
        item.industry,
        item.expertise,
        item.location
      ].some(value => value.toLowerCase().includes(query))
    })
  })

  const stageCounts = computed(() =>
    cmsWorkflowStageMeta.reduce<Record<CmsWorkflowStage, number>>((counts, meta) => {
      counts[meta.stage] = items.value.filter(item => item.stage === meta.stage).length
      return counts
    }, {
      Draft: 0,
      Verification: 0,
      Evaluation: 0,
      Active: 0,
      Closed: 0
    })
  )

  const groupedItems = computed(() =>
    cmsWorkflowStageMeta.reduce<Record<CmsWorkflowStage, CmsWorkflowItem[]>>((groups, meta) => {
      groups[meta.stage] = filteredItems.value.filter(item => item.stage === meta.stage)
      return groups
    }, {
      Draft: [],
      Verification: [],
      Evaluation: [],
      Active: [],
      Closed: []
    })
  )

  const collaborationRows = computed<CmsCollaborationHistoryRow[]>(() => {
    const rows: CmsCollaborationHistoryRow[] = []

    for (const item of filteredItems.value) {
      for (const portfolio of portfolioContents.value) {
        const relatedPartner = portfolio.partners.find(
          partner => partner.name.toLowerCase() === item.name.toLowerCase()
        )

        if (!relatedPartner) continue

        rows.push({
          partnerId: item.id,
          partnerName: item.name,
          stage: item.stage,
          portfolioId: portfolio.id,
          portfolioTitle: portfolio.title,
          role: relatedPartner.role,
          focusTag: relatedPartner.tag,
          contentStatus: portfolio.status,
          lastUpdated: formatCmsDateTime(portfolio.updatedAt)
        })
      }
    }

    return rows.sort((a, b) => a.partnerName.localeCompare(b.partnerName))
  })

  const moveStage = (item: CmsWorkflowItem, nextStage: CmsWorkflowStage) => {
    if (item.stage === nextStage) return false

    const previousStage = item.stage
    stageOverrides.value = {
      ...stageOverrides.value,
      [item.id]: nextStage
    }

    addActivity({
      kind: 'workflow',
      type: 'stage-changed',
      contentTitle: item.name,
      detail: `${previousStage} to ${nextStage} for ${item.id}`
    })

    return true
  }

  const resetStage = (item: CmsWorkflowItem) => {
    if (!stageOverrides.value[item.id]) return false

    stageOverrides.value = Object.fromEntries(
      Object.entries(stageOverrides.value).filter(([id]) => id !== item.id)
    ) as Record<string, CmsWorkflowStage>

    addActivity({
      kind: 'workflow',
      type: 'stage-changed',
      contentTitle: item.name,
      detail: `Stage override removed; returned to ${getDefaultStage(item)}`
    })

    return true
  }

  const exportPartnerDatabase = () => {
    const rows = filteredItems.value.map(item => [
      item.id,
      item.name,
      item.category,
      item.partnerType,
      item.industry,
      item.expertise,
      item.location,
      item.status,
      item.stage,
      item.contractStatus,
      item.contractEndDate,
      item.hasActiveProject ? 'Yes' : 'No',
      formatCmsDateTime(item.lastUpdated)
    ])

    downloadCmsCsv(
      buildFilename('partner-database'),
      [
        'Partner ID',
        'Partner Name',
        'Category',
        'Partner Type',
        'Industry',
        'Expertise',
        'Location',
        'Partner Status',
        'Workflow Stage',
        'Contract Status',
        'Contract End Date',
        'Active Project',
        'Last Updated'
      ],
      rows
    )

    addActivity({
      kind: 'workflow',
      type: 'exported',
      contentTitle: 'Partner database CSV',
      detail: `${rows.length} partner records exported`
    })
  }

  const exportCollaborationHistory = () => {
    const rows = collaborationRows.value.map(row => [
      row.partnerId,
      row.partnerName,
      row.stage,
      row.portfolioId,
      row.portfolioTitle,
      row.role,
      row.focusTag,
      row.contentStatus,
      row.lastUpdated
    ])

    downloadCmsCsv(
      buildFilename('collaboration-history'),
      [
        'Partner ID',
        'Partner Name',
        'Workflow Stage',
        'Portfolio ID',
        'Portfolio Project',
        'Partner Role',
        'Focus Tag',
        'Content Status',
        'Content Last Updated'
      ],
      rows
    )

    addActivity({
      kind: 'workflow',
      type: 'exported',
      contentTitle: 'Collaboration history CSV',
      detail: `${rows.length} collaboration records exported`
    })
  }

  return {
    search,
    stageFilter,
    categoryFilter,
    categoryOptions,
    items,
    filteredItems,
    stageCounts,
    groupedItems,
    collaborationRows,
    moveStage,
    resetStage,
    exportPartnerDatabase,
    exportCollaborationHistory,
    getStageMeta: (stage: CmsWorkflowStage) => stageMetaMap.get(stage) ?? cmsWorkflowStageMeta[0]!
  }
}
