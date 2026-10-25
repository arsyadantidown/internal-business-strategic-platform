export type CmsContentKind = 'portfolio' | 'partnership'

export type CmsContentStatus = 'Draft' | 'Scheduled' | 'Published' | 'Archived'

export type CmsContentSaveAction = 'draft' | 'schedule' | 'publish'

export type CmsWorkflowStage = 'Draft' | 'Verification' | 'Evaluation' | 'Active' | 'Closed'

export type CmsVisibility = 'Public' | 'Internal'

export type CmsProjectStatus = 'Completed' | 'Active' | 'On Going' | 'Planned' | 'Cancelled'

export type CmsPartnershipCategory
  = | 'Technology Partner'
    | 'Channel Partner'
    | 'Service Partner'
    | 'Marketing Partner'

export type CmsPartnerType
  = | 'Strategic Partner'
    | 'Implementation Partner'
    | 'Consulting Partner'
    | 'Reseller'
    | 'Technology Provider'
    | 'Other'

export type CmsActivityKind = CmsContentKind | 'workflow'

export type CmsActivityType
  = | 'created'
    | 'updated'
    | 'scheduled'
    | 'published'
    | 'archived'
    | 'deleted'
    | 'stage-changed'
    | 'exported'

export type CmsTone = 'blue' | 'emerald' | 'amber' | 'slate' | 'rose'

export interface CmsDocument {
  name: string
  type: string
  size: string
}

export interface CmsRelatedPartner {
  name: string
  role: string
  tag: string
}

export interface CmsBaseContent {
  id: string
  kind: CmsContentKind
  title: string
  summary: string
  status: CmsContentStatus
  author: string
  featured: boolean
  publishedAt: string | null
  scheduledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CmsPortfolioContent extends CmsBaseContent {
  kind: 'portfolio'
  projectType: string
  serviceType: string
  industry: string
  client: string
  clientIndustry: string
  clientLocation: string
  contactName: string
  contactEmail: string
  projectStatus: CmsProjectStatus
  startDate: string
  endDate: string
  location: string
  teamSize: string
  projectValue: string
  currency: string
  fundingType: string
  overview: string
  background: string
  challenges: string[]
  solutions: string[]
  image: string
  documents: CmsDocument[]
  technologies: string[]
  partners: CmsRelatedPartner[]
  slug: string
  visibility: CmsVisibility
  seoTitle: string
  seoDescription: string
}

export interface CmsPartnershipContent extends CmsBaseContent {
  kind: 'partnership'
  category: CmsPartnershipCategory
  partnerType: CmsPartnerType
  industry: string
  location: string
  website: string
  expertise: string[]
  solutions: string[]
  overview: string
  collaborationScope: string
  benefits: string[]
  logo: string
  relatedPortfolio: string[]
  slug: string
  visibility: CmsVisibility
  seoTitle: string
  seoDescription: string
}

export type CmsContent = CmsPortfolioContent | CmsPartnershipContent

export type CmsPortfolioFormValues = Omit<
  CmsPortfolioContent,
  'id' | 'kind' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'scheduledAt'
> & {
  publishedAt: string
  scheduledAt: string
}

export type CmsPartnershipFormValues = Omit<
  CmsPartnershipContent,
  'id' | 'kind' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'scheduledAt'
> & {
  publishedAt: string
  scheduledAt: string
}

export type CmsFormErrors = Record<string, string | undefined>

export interface CmsActivity {
  id: string
  kind: CmsActivityKind
  type: CmsActivityType
  contentTitle: string
  detail?: string
  actor: string
  timestamp: string
}

export interface CmsFilters {
  search: string
  status: string
}

export interface CmsFilterOption {
  label: string
  value: string
}

export interface CmsStat {
  key: string
  label: string
  value: number
  icon: string
  tone: CmsTone
  hint: string
}
