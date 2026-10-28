import { defineStore } from 'pinia'
import { ref } from 'vue'
import { roleApi } from '../api/role.api'
import type {
  RoleItem,
  CreateRoleRequestPayload,
  RoleRequestItem,
  ApiPagination
} from '../types/role.types'

export const useRoleStore = defineStore('role', () => {
  const roles = ref<RoleItem[]>([])
  const myRequest = ref<RoleRequestItem | null>(null)
  const isLoading = ref<boolean>(false)
  const isSubmitting = ref<boolean>(false)
  const isReviewing = ref<boolean>(false)

  const pendingRequests = ref<RoleRequestItem[]>([])
  const pendingPagination = ref<ApiPagination>({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1
  })
  const isLoadingPending = ref<boolean>(false)

  const fetchPendingRequests = async (page = 1, pageSize = 10) => {
    isLoadingPending.value = true
    try {
      const res = await roleApi.getRequests({
        status: 'pending',
        page,
        pageSize
      })
      if (res.data) {
        pendingRequests.value = res.data.items || []
        pendingPagination.value = res.data.pagination
      }
      return res.data
    } catch (err) {
      console.error('Failed to fetch pending role requests:', err)
      throw err
    } finally {
      isLoadingPending.value = false
    }
  }

  const reviewRoleRequest = async (
    requestId: string,
    payload: { status: 'approved' | 'rejected'; review_notes?: string }
  ) => {
    isReviewing.value = true
    try {
      const res = await roleApi.reviewRequest(requestId, payload)
      // Hapus item yang sudah di-review dari list pending di frontend
      pendingRequests.value = pendingRequests.value.filter((item) => item.id !== requestId)
      if (pendingPagination.value.total > 0) {
        pendingPagination.value.total--
      }
      return res
    } catch (err) {
      console.error('Failed to review role request:', err)
      throw err
    } finally {
      isReviewing.value = false
    }
  }

  const fetchRoles = async (force = false) => {
    if (roles.value.length > 0 && !force) return roles.value

    isLoading.value = true
    try {
      const res = await roleApi.getAll()
      roles.value = res.data || []
      return roles.value
    } catch (err) {
      console.error('Failed to fetch roles:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const submitRoleRequest = async (payload: CreateRoleRequestPayload) => {
    isSubmitting.value = true
    try {
      const res = await roleApi.submitRequest(payload)
      if (res.data) {
        myRequest.value = res.data
      }
      return res
    } finally {
      isSubmitting.value = false
    }
  }

  const fetchMyRequest = async () => {
    try {
      const res = await roleApi.getMyRequest()
      myRequest.value = res.data || null
      return myRequest.value
    } catch (err) {
      console.error('Failed to fetch my role request:', err)
      return null
    }
  }
  return {
    roles,
    isLoading,
    fetchRoles,
    myRequest,
    isSubmitting,
    submitRoleRequest,
    fetchMyRequest,
    pendingRequests,
    pendingPagination,
    isLoadingPending,
    fetchPendingRequests,
    isReviewing,
    reviewRoleRequest
  }
})
