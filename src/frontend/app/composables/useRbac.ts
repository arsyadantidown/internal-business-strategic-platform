import { useAuthStore } from '~/modules/auth/stores/auth.store'

export const useRbac = () => {
  const authStore = useAuthStore()

  /**
   * Cek apakah user memiliki permission tertentu (contoh: 'portfolio.view')
   */
  const can = (permissionCode?: string): boolean => {
    return authStore.hasPermission(permissionCode)
  }

  /**
   * Cek apakah user memiliki SALAH SATU dari daftar permission
   */
  const canAny = (permissionCodes: string[]): boolean => {
    return permissionCodes.some((code) => authStore.hasPermission(code))
  }

  /**
   * Cek apakah user memiliki SEMUA permission yang diminta
   */
  const canAll = (permissionCodes: string[]): boolean => {
    return permissionCodes.every((code) => authStore.hasPermission(code))
  }

  return {
    can,
    canAny,
    canAll,
    permissions: computed(() => authStore.userPermissions)
  }
}
