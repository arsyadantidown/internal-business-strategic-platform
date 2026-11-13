import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type { ProjectQueryParams, ProjectsListResponse } from '../types/types'

export const portfolioApi = {
  /**
   * Mengambil daftar proyek dari server dengan pagination, search, dan filter
   * GET /api/v1/projects
   */
  async getProjects(params: ProjectQueryParams = {}): Promise<ProjectsListResponse> {
    // Bersihkan parameter yang bernilai undefined, null, atau string kosong
    const cleanParams: Record<string, any> = {}
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value
      }
    })

    const response = await apiClient.get<ProjectsListResponse>(ENDPOINTS.PROJECTS.BASE, {
      params: cleanParams
    })
    return response.data
  }
}
