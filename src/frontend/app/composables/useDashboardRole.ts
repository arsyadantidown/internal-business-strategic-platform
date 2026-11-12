import { computed } from 'vue'
import type { UserRole } from '../modules/dashboard/types/types'
import { useAuthStore } from '~/modules/auth/stores/auth.store'

export function useDashboardRole() {
  const authStore = useAuthStore()

  // Ambil role_code user saat ini
  const userRoleCode = computed(() => authStore.user?.role_code || '')

  // Tentukan tampilan dashboard langsung 1:1 berdasarkan role_code
  const activeRole = computed<UserRole>(() => {
    switch (userRoleCode.value) {
      case 'SUPER_ADMIN':
        return 'executive'
      case 'COMMERCIAL_PARTNERSHIP_OFFICER':
        return 'commercial'
      case 'ENGINEER_PROJECT_LEAD':
        return 'engineering'
      default:
        // Default jika belum terdeteksi
        return 'executive'
    }
  })

  return {
    activeRole
  }
}
