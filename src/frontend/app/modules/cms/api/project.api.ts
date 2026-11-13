import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  ProjectCreatePayload,
  ProjectCreatedResponse,
  FileCategory
} from '../types/project.types'

export const projectApi = {
  /**
   * 1. Create Project Baru
   * POST /api/v1/projects
   */
  async createProject(payload: ProjectCreatePayload): Promise<{
    success: boolean
    message: string
    data: ProjectCreatedResponse
  }> {
    const response = await apiClient.post(ENDPOINTS.PROJECTS.BASE, payload)
    return response.data
  },

  /**
   * 2. Upload File ke Project
   * POST /api/v1/projects/{project_id}/files (multipart/form-data)
   */
  async uploadProjectFile(
    projectId: string,
    file: File,
    category: FileCategory,
    title?: string,
    description?: string,
    sortOrder = 0
  ): Promise<{
    success: boolean
    message: string
    data: any
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_category', category)
    if (title) formData.append('file_title', title)
    if (description) formData.append('file_description', description)
    formData.append('sort_order', String(sortOrder))

    const response = await apiClient.post(ENDPOINTS.PROJECTS.FILES(projectId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * 3. Fetch Master Data Dropdown
   * GET /api/v1/master-data/{data_type}
   */
  async getMasterData(dataType: string): Promise<any[]> {
    const response = await apiClient.get(`${ENDPOINTS.MASTER_DATA.BASE}/${dataType}`, {
      params: { include_inactive: false }
    })
    return response.data?.data || []
  },

  /**
   * 4. Fetch Products Dropdown
   * GET /api/v1/products
   */
  async getProducts(): Promise<any[]> {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.BASE)
    return response.data?.data || []
  },

  /**
   * 5. Fetch Tech Stacks Dropdown
   * GET /api/v1/tech-stacks
   */
  async getTechStacks(): Promise<any[]> {
    const response = await apiClient.get(ENDPOINTS.TECH_STACKS.BASE)
    return response.data?.data || []
  },

  /**
   * 6. Fetch Partners Dropdown
   * GET /api/v1/partners
   */
  async getPartners(): Promise<any[]> {
    const response = await apiClient.get(ENDPOINTS.PARTNERS.BASE)
    return response.data?.data || []
  }
}
