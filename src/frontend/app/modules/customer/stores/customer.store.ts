import { defineStore } from 'pinia'
import { ref } from 'vue'
import { customerApi } from '../api/customer.api'
import type { CustomerSearchParams } from '../types/customer.types'

export const useCustomerStore = defineStore('customer', () => {
  const customerNames = ref<string[]>([])
  const customerLocations = ref<string[]>([])
  const isLoadingNames = ref(false)
  const isLoadingLocations = ref(false)
  const errorMessage = ref<string | null>(null)

  const fetchCustomerNames = async (params?: CustomerSearchParams) => {
    isLoadingNames.value = true
    errorMessage.value = null
    try {
      customerNames.value = await customerApi.getNames(params)
    } catch (err: any) {
      errorMessage.value =
        err?.response?.data?.message || err?.message || 'Gagal memuat nama customer.'
      console.error(err)
    } finally {
      isLoadingNames.value = false
    }
  }

  const fetchCustomerLocations = async () => {
    isLoadingLocations.value = true
    errorMessage.value = null
    try {
      customerLocations.value = await customerApi.getLocations()
    } catch (err: any) {
      errorMessage.value =
        err?.response?.data?.message || err?.message || 'Gagal memuat lokasi customer.'
      console.error(err)
    } finally {
      isLoadingLocations.value = false
    }
  }

  return {
    customerNames,
    customerLocations,
    isLoadingNames,
    isLoadingLocations,
    errorMessage,
    fetchCustomerNames,
    fetchCustomerLocations
  }
})
