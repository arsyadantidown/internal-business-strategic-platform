import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '../api/user.api'
import type { UserStats, UserItem, UserPaginationMeta, UserQueryParams } from '../types/types'

export const useUserStore = defineStore('user', () => {
  const stats = ref<UserStats>({
    pendingRequests: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  })
  const isLoadingStats = ref<boolean>(false)
  const users = ref<UserItem[]>([])
  const usersPagination = ref<UserPaginationMeta>({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1
  })
  const isLoadingUsers = ref<boolean>(false)

  const fetchManagementStats = async () => {
    isLoadingStats.value = true
    try {
      const res = await userApi.getManagementStats()
      if (res.data) {
        stats.value = {
          pendingRequests: res.data.pending_requests,
          totalUsers: res.data.total_users,
          activeUsers: res.data.active_users,
          inactiveUsers: res.data.inactive_users
        }
      }
      return stats.value
    } catch (err) {
      console.error('Failed to fetch user management stats:', err)
      throw err
    } finally {
      isLoadingStats.value = false
    }
  }

  const fetchUsers = async (params?: UserQueryParams) => {
    isLoadingUsers.value = true
    try {
      const res = await userApi.getUsers(params)
      if (res.data) {
        // Hanya user yang SUDAH memiliki role
        users.value = res.data || []
        usersPagination.value = res.meta
      }
      return res
    } catch (err) {
      console.error('Failed to fetch users:', err)
      throw err
    } finally {
      isLoadingUsers.value = false
    }
  }

  return {
    stats,
    isLoadingStats,
    fetchManagementStats,
    users,
    usersPagination,
    isLoadingUsers,
    fetchUsers
  }
})
