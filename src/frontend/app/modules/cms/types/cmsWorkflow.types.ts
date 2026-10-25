import type { Partner } from '~/modules/partnership/components/partnership-list/partnership.types'
import type { CmsWorkflowStage } from './cms.types'

export type CmsWorkflowViewMode = 'board' | 'table'

export interface CmsWorkflowItem extends Partner {
  stage: CmsWorkflowStage
  isOverride: boolean
}

export interface CmsWorkflowStageMeta {
  stage: CmsWorkflowStage
  label: string
  description: string
  icon: string
  dotClass: string
  chipClass: string
  columnClass: string
}

export interface CmsCollaborationHistoryRow {
  partnerId: string
  partnerName: string
  stage: CmsWorkflowStage
  portfolioId: string
  portfolioTitle: string
  role: string
  focusTag: string
  contentStatus: string
  lastUpdated: string
}
