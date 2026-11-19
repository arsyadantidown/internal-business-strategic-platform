import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  TechStackCategory,
  TechStackCreatePayload,
  TechStackItem,
  TechStackRawItem,
  TechStackUpdatePayload
} from '../types/tech-stack.types'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const normalizeTechStack = (raw: TechStackRawItem): TechStackItem => ({
  id: String(raw.id || ''),
  name: String(raw.tech_stack_name || ''),
  category: raw.tech_stack_category,
  isActive: raw.is_active === true
})

export const techStackApi = {
  /**
   * GET /api/v1/tech-stacks
   */
  async list(params?: {
    tech_stack_category?: TechStackCategory
    include_inactive?: boolean
  }): Promise<TechStackItem[]> {
    const response = await apiClient.get<ApiResponse<TechStackRawItem[]>>(
      ENDPOINTS.TECH_STACKS.BASE,
      { params: { ...params, include_inactive: true } }
    )
    const list = Array.isArray(response.data?.data) ? response.data.data : []
    return list.map(normalizeTechStack)
  },

  /**
   * POST /api/v1/tech-stacks
   */
  async create(payload: TechStackCreatePayload): Promise<TechStackItem> {
    const response = await apiClient.post<ApiResponse<TechStackRawItem>>(
      ENDPOINTS.TECH_STACKS.BASE,
      payload
    )
    return normalizeTechStack(response.data.data)
  },

  /**
   * PATCH /api/v1/tech-stacks/{id}
   */
  async update(id: string, payload: TechStackUpdatePayload): Promise<TechStackItem> {
    const response = await apiClient.patch<ApiResponse<TechStackRawItem>>(
      `${ENDPOINTS.TECH_STACKS.BASE}/${id}`,
      payload
    )
    return normalizeTechStack(response.data.data)
  },

  /**
   * DELETE /api/v1/tech-stacks/{id}
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.TECH_STACKS.BASE}/${id}`)
  }
}
