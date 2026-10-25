export type ProjectStatus
  = | 'On Going'
    | 'On Proposal'
    | 'Closed'
    | 'Canceled'
    | 'Completed'
    | 'Active'
    | 'Planned'
    | 'Cancelled'

export type PortfolioOption = {
  label: string
  value: string
}

export interface ProjectItem {
  id: string
  title: string
  client: string
  description: string
  industry: string
  companySize?: string
  legalStructure?: string
  businessUnit?: string
  product?: string
  customerType?: string
  productStatus?: string
  frontendStack?: string
  backendStack?: string
  database?: string
  technologies: string[]
  status: ProjectStatus
  year?: string
  image: string
  updatedAt: string
}

export type ViewMode = 'grid' | 'table'

export interface PortfolioFilterState {
  search: string
  industry: string
  companySize: string
  legalStructure: string
  businessUnit: string
  product: string
  customerType: string
  productStatus: string
  status: string
  frontendStack: string
  backendStack: string
  database: string
  year: string
}

// --- Tambahan Khusus untuk Halaman Detail ---

export interface ProjectDocument {
  name: string
  size: string
  date: string
}

export interface RelatedPartner {
  name: string
  role: string
  tag: string
  icon?: string
}

export interface ProjectDetailItem extends ProjectItem {
  period: string
  projectValue: string
  location: string
  teamSize: string
  serviceType: string
  projectType: string
  heroImages: string[]
  overview: string
  background: string
  challenges: string[]
  solutions: string[]
  metrics: {
    label: string
    value: string
    sublabel: string
  }[]
  mediaGallery: {
    type: 'image' | 'video'
    url: string
    title: string
  }[]
  documents: ProjectDocument[]
  partners: RelatedPartner[]
  lastUpdated?: string
}
