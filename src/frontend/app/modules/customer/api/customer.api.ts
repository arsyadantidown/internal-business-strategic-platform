import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  CustomerLocationsResponse,
  CustomerNamesResponse,
  CustomerSearchParams
} from '../types/customer.types'

export const customerApi = {
  /**
   * GET /api/v1/customers/names
   */
  async getNames(params?: CustomerSearchParams): Promise<string[]> {
    const response = await apiClient.get<CustomerNamesResponse>(
      ENDPOINTS.CUSTOMERS.NAMES,
      { params }
    )
    const list = Array.isArray(response.data?.data) ? response.data.data : []
    return list.map(item => item.customer_name).filter(Boolean)
  },

  /**
   * GET /api/v1/customers/locations
   */
  async getLocations(): Promise<string[]> {
    const response = await apiClient.get<CustomerLocationsResponse>(
      ENDPOINTS.CUSTOMERS.LOCATIONS
    )
    const list = Array.isArray(response.data?.data) ? response.data.data : []
    return list.map(item => item.customer_location).filter(Boolean)
  }
}
