import { onMounted, watch } from 'vue'
import { useState } from '#imports'
import type { CmsActivity } from '../types/cms.types'
import { cmsCurrentActor, cmsSeedActivities } from '../data/cms.data'

const STORAGE_KEY = 'ibsp:cms-audit:v1'
const STATE_KEY = 'cms-audit-entries'
const HYDRATED_KEY = 'cms-audit-hydrated'

type CmsActivityInput = Omit<CmsActivity, 'id' | 'actor' | 'timestamp'> & {
  actor?: string
  timestamp?: string
}

const cloneSeedActivities = () => cmsSeedActivities.map(activity => ({ ...activity }))

export function useCmsAuditTrail() {
  const activities = useState<CmsActivity[]>(STATE_KEY, cloneSeedActivities)
  const isHydrated = useState<boolean>(HYDRATED_KEY, () => false)

  const addActivity = (input: CmsActivityInput) => {
    const activity: CmsActivity = {
      ...input,
      id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actor: input.actor ?? cmsCurrentActor,
      timestamp: input.timestamp ?? new Date().toISOString()
    }

    activities.value = [activity, ...activities.value]
    return activity
  }

  onMounted(() => {
    if (isHydrated.value) return

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CmsActivity[]
        if (Array.isArray(parsed)) activities.value = parsed
      }
    } catch {
      // Keep the seeded audit trail when local storage is unavailable or malformed.
    } finally {
      isHydrated.value = true
    }
  })

  watch(
    activities,
    () => {
      if (!isHydrated.value || !import.meta.client) return

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activities.value))
      } catch {
        // Ignore storage quota or privacy mode errors.
      }
    },
    { deep: true }
  )

  return {
    activities,
    addActivity
  }
}
