import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '../api/user.api'
import type { UserStats } from '../types/types'

export const useUserStore = defineStore('user', () => {
  const stats = ref<UserStats>({
    pendingRequests: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  })
  const isLoadingStats = ref<boolean>(false)

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

  return {
    stats,
    isLoadingStats,
    fetchManagementStats
  }
})
