import { defineStore } from 'pinia'
import { ref } from 'vue'
import { portfolioApi } from '../api/portofolio.api'
import { useAppDate } from '~/composables/useAppDate' // <-- Import composable
import type {
  ProjectItem,
  ProjectStatus,
  ProjectQueryParams,
  BackendProjectItem,
  ProjectDetailItem
} from '../types/types'

export const usePortfolioStore = defineStore('portfolio', () => {
  const { formatRelativeTime, formatDate } = useAppDate() // <-- Ambil helper dari composable

  const projects = ref<ProjectItem[]>([])
  const isLoading = ref<boolean>(false)
  const errorMessage = ref<string | null>(null)

  const currentProject = ref<ProjectDetailItem | null>(null)
  const isDetailLoading = ref<boolean>(false)
  const detailError = ref<string | null>(null)

  // Pagination states
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(12)
  const totalItems = ref<number>(0)
  const totalPages = ref<number>(1)

  // Normalisasi Status Badge
  const mapStatus = (statusName?: string): ProjectStatus => {
    if (!statusName) return 'On Going'
    const normalized = statusName.toLowerCase()
    if (normalized.includes('going') || normalized.includes('on going')) return 'On Going'
    if (normalized.includes('proposal')) return 'On Proposal'
    if (
      normalized.includes('closed') ||
      normalized.includes('selesai') ||
      normalized.includes('complete')
    )
      return 'Closed'
    if (normalized.includes('cancel')) return 'Canceled'
    return 'On Going'
  }

  // Mapper BackendProjectItem -> ProjectItem (Frontend schema)
  const mapBackendItemToProject = (item: BackendProjectItem): ProjectItem => {
    const defaultPlaceholder =
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop'

    const techStacks: string[] = []
    if (item.tech_stacks) {
      if (item.tech_stacks.frontend)
        techStacks.push(...item.tech_stacks.frontend.map((t) => t.name))
      if (item.tech_stacks.backend) techStacks.push(...item.tech_stacks.backend.map((t) => t.name))
      if (item.tech_stacks.data_storage)
        techStacks.push(...item.tech_stacks.data_storage.map((t) => t.name))
    }

    return {
      id: item.id,
      title: item.project_name || '-',
      client: item.customer_name || '-',
      description: item.project_objective || '-',
      industry: item.industry?.name || '-',
      technologies: techStacks,
      status: mapStatus(item.project_status?.name),
      year: item.year ? String(item.year) : undefined,
      image: item.cover_image_url || defaultPlaceholder,
      updatedAt: formatRelativeTime(item.updated_at) // <-- Menggunakan dayjs .fromNow()
    }
  }

  // Action Fetch Projects
  const fetchProjects = async (params: ProjectQueryParams = {}) => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const response = await portfolioApi.getProjects({
        page: currentPage.value,
        page_size: pageSize.value,
        ...params
      })

      if (response.success && response.data) {
        projects.value = (response.data.items || []).map(mapBackendItemToProject)
        currentPage.value = response.data.page
        pageSize.value = response.data.page_size
        totalItems.value = response.data.total
        totalPages.value = response.data.total_pages
      }
    } catch (err: any) {
      errorMessage.value =
        err?.response?.data?.message || err?.message || 'Failed to fetch projects'
      projects.value = []
      totalItems.value = 0
    } finally {
      isLoading.value = false
    }
  }

  // Mapper dari Response Backend ke ProjectDetailItem
  const mapBackendDetailToProject = (data: any): ProjectDetailItem => {
    const defaultPlaceholder =
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop'
    // 1. Ekstrak Semua Tech Stacks
    const techStacks: string[] = []
    if (data.tech_stacks) {
      if (data.tech_stacks.frontend)
        techStacks.push(...data.tech_stacks.frontend.map((t: any) => t.name))
      if (data.tech_stacks.backend)
        techStacks.push(...data.tech_stacks.backend.map((t: any) => t.name))
      if (data.tech_stacks.data_storage)
        techStacks.push(...data.tech_stacks.data_storage.map((t: any) => t.name))
    }
    // 2. Ekstrak Products
    const productNames = (data.products || []).map((p: any) => p.name).join(', ') || '-'
    // 3. Format Periode Tanggal (menggunakan useAppDate)
    const startDateFormatted = data.start_date ? formatDate(data.start_date) : '-'
    const endDateFormatted = data.end_date ? formatDate(data.end_date) : '-'
    const periodString = `${startDateFormatted} – ${endDateFormatted} (${data.total_days || 0} days)`
    // 4. Kelompokkan Files Berdasarkan Kategori
    const files = data.files || []

    // Media Images & Hero
    const imageFiles = files.filter((f: any) => f.file_category === 'image')
    const heroImages =
      imageFiles.length > 0
        ? imageFiles.map((f: any) => f.file_url)
        : [data.cover_image_url || defaultPlaceholder]
    // Media Gallery (Image + Video)
    const mediaGallery = files
      .filter((f: any) => ['image', 'video'].includes(f.file_category))
      .map((f: any) => ({
        type: f.file_category as 'image' | 'video',
        url: f.file_url,
        title: f.file_title || 'Media'
      }))
    // Documents
    const documents = files
      .filter((f: any) => f.file_category === 'document')
      .map((f: any) => ({
        name: f.file_title || 'Project Document',
        size: f.file_size ? `${(f.file_size / 1024 / 1024).toFixed(1)} MB` : '-',
        date: formatDate(f.created_at)
      }))
    // Case Study File (jika ada)
    const caseStudyFile = files.find((f: any) => f.file_category === 'case_study')
    // 5. Challenges & Solutions Parser (bila API mengembalikan string multiline/paragraf)
    const parseList = (text?: string): string[] => {
      if (!text) return []
      return text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    // 6. Success Metrics Parser
    const metrics = (data.success_metrics || []).map((m: any) => ({
      label: m.success_metric_label || '-',
      value: m.success_metric_value || '-',
      sublabel: ''
    }))
    // 7. Partners Parser
    const partners = (data.partners || []).map((p: any) => ({
      name: p.partner_name || '-',
      role: p.partner_role === 'principal' ? 'Principal Partner' : 'Vendor Partner',
      tag: p.partner_contribution || 'Collaborator'
    }))
    return {
      id: data.id,
      title: data.project_name || '-',
      client: data.customer?.customer_name || data.customer_name || '-',
      description: data.project_objective || '-',
      industry: data.industry?.name || '-',
      status: mapStatus(data.project_status?.name),
      technologies: techStacks,
      product: productNames,
      year: data.year ? String(data.year) : undefined,
      image: data.cover_image_url || defaultPlaceholder,
      updatedAt: formatRelativeTime(data.updated_at),
      lastUpdated: formatRelativeTime(data.updated_at),
      // Customer Info
      companySize: data.customer?.company_size?.name || '-',
      customerType: data.customer?.customer_type?.name || '-',
      legalStructure: data.customer?.legal_structure?.name || '-',
      // Status & Contract Info
      period: periodString,
      location: data.customer?.customer_location || '-',
      businessUnit: data.business_unit?.name || '-',
      projectManager: data.project_manager || '-',
      accountManager: data.account_manager || '-',
      contractName: data.contract_name || '-',
      contractNumber: data.contract_number || '-',
      // Financial Info
      valueBeforeTax: data.value_before_tax,
      valueAfterTax: data.value_after_tax || data.financial?.value_after_tax,
      carryOverValue: data.carry_over_value,
      projectValue: data.value_before_tax
        ? `Rp ${Number(data.value_before_tax).toLocaleString('id-ID')}`
        : '-',
      revenue: data.financial?.revenue,
      cogs: data.financial?.cogs,
      operationalCost: data.financial?.operational_cost,
      netProfit: data.financial?.net_profit,
      marginProfitPercent: data.financial?.net_margin_percent,
      // Content Overview
      overview: data.project_description || data.project_objective || '-',
      background: data.project_background || '-',
      challenges: parseList(data.project_challenges),
      solutions: parseList(data.project_solution),
      // Collections
      heroImages,
      mediaGallery,
      documents,
      partners,
      metrics,
      // Meta Service / Project Type
      serviceType: data.business_unit?.name || 'General Service',
      projectType: data.opportunity || 'Standard Project',

      // Tambahan properti caseStudy URL jika ada
      caseStudyUrl: caseStudyFile?.file_url || null
    } as ProjectDetailItem
  }
  // Action Fetch Detail
  const fetchProjectDetail = async (projectId: string) => {
    isDetailLoading.value = true
    detailError.value = null
    try {
      const response = await portfolioApi.getProjectDetail(projectId)
      if (response.success && response.data) {
        currentProject.value = mapBackendDetailToProject(response.data)
      }
    } catch (err: any) {
      detailError.value =
        err?.response?.data?.message || err?.message || 'Gagal mengambil detail project'
      currentProject.value = null
    } finally {
      isDetailLoading.value = false
    }
  }

  return {
    projects,
    isLoading,
    errorMessage,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    currentProject,
    isDetailLoading,
    detailError,
    fetchProjectDetail,
    fetchProjects
  }
})
