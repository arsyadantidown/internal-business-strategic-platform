import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type { UserManagementStatsResponse } from '../types/types'

export const userApi = {
  async getManagementStats(): Promise<{
    success: boolean
    message: string
    data: UserManagementStatsResponse
  }> {
    const response = await apiClient.get(ENDPOINTS.USERS.MANAGEMENT_STATS)
    return response.data
  }
}
