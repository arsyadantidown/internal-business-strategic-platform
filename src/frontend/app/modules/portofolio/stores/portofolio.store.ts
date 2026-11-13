import { defineStore } from 'pinia'
import { ref } from 'vue'
import { portfolioApi } from '../api/portofolio.api'
import { useAppDate } from '~/composables/useAppDate' // <-- Import composable
import type {
  ProjectItem,
  ProjectStatus,
  ProjectQueryParams,
  BackendProjectItem
} from '../types/types'

export const usePortfolioStore = defineStore('portfolio', () => {
  const { formatRelativeTime } = useAppDate() // <-- Ambil helper dari composable

  const projects = ref<ProjectItem[]>([])
  const isLoading = ref<boolean>(false)
  const errorMessage = ref<string | null>(null)

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

  return {
    projects,
    isLoading,
    errorMessage,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    fetchProjects
  }
})
