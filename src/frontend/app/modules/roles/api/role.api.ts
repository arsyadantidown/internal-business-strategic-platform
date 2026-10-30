import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  RoleItem,
  CreateRoleRequestPayload,
  RoleRequestItem,
  RoleRequestQueryParams,
  ApiPagination,
  ReviewRoleRequestPayload
} from '../types/role.types'

export const roleApi = {
  async getAll(): Promise<{ success: boolean; message: string; data: RoleItem[] }> {
    const response = await apiClient.get(ENDPOINTS.ROLES.BASE)
    return response.data
  },
  async submitRequest(
    payload: CreateRoleRequestPayload
  ): Promise<{ success: boolean; message: string; data: RoleRequestItem }> {
    const response = await apiClient.post(ENDPOINTS.ROLES.REQUESTS, payload)
    return response.data
  },
  async getMyRequest(): Promise<{
    success: boolean
    message: string
    data: RoleRequestItem | null
  }> {
    const response = await apiClient.get(ENDPOINTS.ROLES.MY_REQUEST)
    return response.data
  },

  async getRequests(params?: RoleRequestQueryParams): Promise<{
    success: boolean
    message: string
    data: {
      items: RoleRequestItem[]
      pagination: ApiPagination
    }
  }> {
    // Memetakan query param frontend ke query param backend ('page-size')
    const queryParams: Record<string, any> = {}
    if (params?.status) queryParams.status = params.status
    if (params?.page) queryParams.page = params.page
    if (params?.pageSize) queryParams['page-size'] = params.pageSize
    const response = await apiClient.get(ENDPOINTS.ROLES.REQUESTS, {
      params: queryParams
    })
    return response.data
  },

  async reviewRequest(
    requestId: string,
    payload: ReviewRoleRequestPayload
  ): Promise<{ success: boolean; message: string; data: RoleRequestItem }> {
    const response = await apiClient.patch(
      `${ENDPOINTS.ROLES.REQUESTS}/${requestId}/review`,
      payload
    )
    return response.data
  }
}
