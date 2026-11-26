import { defineStore } from 'pinia'
import { ref } from 'vue'
import { divisionApi } from '../api/division.api'
import type { DivisionItem } from '../types/division.types'

export const useDivisionStore = defineStore('division', () => {
  const divisions = ref<DivisionItem[]>([])
  const isLoading = ref<boolean>(false)

  const fetchDivisions = async (_force = false) => {
    isLoading.value = true
    try {
      const res = await divisionApi.getAll()
      divisions.value = res.data || []
      return divisions.value
    } catch (err) {
      console.error('Failed to fetch divisions:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    divisions,
    isLoading,
    fetchDivisions
  }
})
