import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  DashboardSummaryResponse,
  DashboardFilterParams,
  DashboardBusinessUnitResponse,
  DashboardIndustryResponse
} from '../types/dashboard.types'

export const dashboardApi = {
  /**
   * GET /api/v1/dashboard/summary
   */
  async getSummary(params?: DashboardFilterParams): Promise<DashboardSummaryResponse> {
    const response = await apiClient.get<DashboardSummaryResponse>(ENDPOINTS.DASHBOARD.SUMMARY, {
      params
    })
    return response.data
  },

  /**
   * GET /api/v1/dashboard/projects-by-business-unit
   */
  async getProjectsByBusinessUnit(
    params?: DashboardFilterParams
  ): Promise<DashboardBusinessUnitResponse> {
    const response = await apiClient.get<DashboardBusinessUnitResponse>(
      ENDPOINTS.DASHBOARD.PROJECTS_BY_BUSINESS_UNIT,
      { params }
    )
    return response.data
  },

  /**
   * GET /api/v1/dashboard/projects-by-industry
   */
  async getProjectsByIndustry(params?: DashboardFilterParams): Promise<DashboardIndustryResponse> {
    const response = await apiClient.get<DashboardIndustryResponse>(
      ENDPOINTS.DASHBOARD.PROJECTS_BY_INDUSTRY,
      { params }
    )
    return response.data
  }
}
