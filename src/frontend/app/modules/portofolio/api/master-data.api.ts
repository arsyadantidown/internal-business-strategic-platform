import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type { MasterDataItem, MasterDataType } from '../types/types'

export const masterDataApi = {
  /**
   * Mengambil list master data berdasarkan data_type
   * GET /api/v1/master-data/{data_type}?include_inactive=false
   */
  async getMasterData(
    dataType: MasterDataType,
    includeInactive = false
  ): Promise<{
    success: boolean
    message: string
    data: MasterDataItem[]
  }> {
    const response = await apiClient.get(`${ENDPOINTS.MASTER_DATA.BASE}/${dataType}`, {
      params: { include_inactive: includeInactive }
    })
    return response.data
  }
}
