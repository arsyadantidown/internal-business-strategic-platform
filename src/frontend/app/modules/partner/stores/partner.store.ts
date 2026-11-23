import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getPartnerErrorMessage, partnerApi } from '../api/partner.api'
import type {
  PartnerDeleteResult,
  PartnerDetail,
  PartnerFilters,
  PartnerFormValues,
  PartnerListItem,
  PartnerUpdatePayload
} from '../types/partner.types'

const createFilters = (): PartnerFilters => ({
  search: '',
  includeInactive: false
})

export const usePartnerStore = defineStore('partner', () => {
  const items = ref<PartnerListItem[]>([])
  const detail = ref<PartnerDetail | null>(null)
  const isLoading = ref(false)
  const isDetailLoading = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref<string | null>(null)
  const detailError = ref<string | null>(null)
  const filters = ref<PartnerFilters>(createFilters())

  let detailFetchToken = 0

  const isFilterDirty = computed(
    () => filters.value.search.trim() !== '' || filters.value.includeInactive
  )

  const fetchPartners = async () => {
    isLoading.value = true
    errorMessage.value = null
    try {
      items.value = await partnerApi.list(filters.value)
    } catch (error) {
      errorMessage.value = getPartnerErrorMessage(error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchPartnerDetail = async (partnerId: string): Promise<PartnerDetail | null> => {
    const token = ++detailFetchToken
    isDetailLoading.value = true
    detailError.value = null
    try {
      const result = await partnerApi.getDetail(partnerId)
      if (token === detailFetchToken) detail.value = result
      return result
    } catch (error) {
      if (token === detailFetchToken) {
        detailError.value = getPartnerErrorMessage(error)
        detail.value = null
      }
      return null
    } finally {
      if (token === detailFetchToken) isDetailLoading.value = false
    }
  }

  const setFilters = async (newFilters: PartnerFilters) => {
    filters.value = {
      search: newFilters.search.slice(0, 200),
      includeInactive: newFilters.includeInactive
    }
    await fetchPartners()
  }

  const resetFilters = async () => {
    filters.value = createFilters()
    await fetchPartners()
  }

  const getUpdateChanges = (
    current: PartnerDetail,
    values: PartnerFormValues
  ): PartnerUpdatePayload => {
    const changes: PartnerUpdatePayload = {}
    const name = values.partnerName.trim()

    if (name !== current.partnerName) changes.partner_name = name

    return changes
  }

  const createPartner = async (values: PartnerFormValues): Promise<PartnerListItem> => {
    isSubmitting.value = true
    errorMessage.value = null
    try {
      const created = await partnerApi.create({ partner_name: values.partnerName.trim() })
      await fetchPartners()
      return created
    } catch (error) {
      const message = getPartnerErrorMessage(error)
      errorMessage.value = message
      throw new Error(message, { cause: error })
    } finally {
      isSubmitting.value = false
    }
  }

  const updatePartner = async (
    partnerId: string,
    current: PartnerDetail,
    values: PartnerFormValues
  ): Promise<PartnerListItem | null> => {
    isSubmitting.value = true
    errorMessage.value = null
    try {
      const changes = getUpdateChanges(current, values)
      if (Object.keys(changes).length === 0) return null

      const updated = await partnerApi.update(partnerId, changes)
      if (detail.value?.id === partnerId) {
        detail.value = {
          ...detail.value,
          partnerName: updated.partnerName
        }
      }
      await fetchPartners()
      return updated
    } catch (error) {
      const message = getPartnerErrorMessage(error)
      errorMessage.value = message
      throw new Error(message, { cause: error })
    } finally {
      isSubmitting.value = false
    }
  }

  const setPartnerActive = async (
    partnerId: string,
    isActive: boolean
  ): Promise<PartnerListItem> => {
    isSubmitting.value = true
    errorMessage.value = null
    try {
      const updated = await partnerApi.setActive(partnerId, isActive)
      if (detail.value?.id === partnerId) {
        detail.value = { ...detail.value, isActive: updated.isActive }
      }
      await fetchPartners()
      return updated
    } catch (error) {
      const message = getPartnerErrorMessage(error)
      errorMessage.value = message
      throw new Error(message, { cause: error })
    } finally {
      isSubmitting.value = false
    }
  }

  const deletePartner = async (partnerId: string): Promise<PartnerDeleteResult> => {
    isSubmitting.value = true
    errorMessage.value = null
    try {
      const result = await partnerApi.delete(partnerId)
      await fetchPartners()
      return result
    } catch (error) {
      const message = getPartnerErrorMessage(error)
      errorMessage.value = message
      throw new Error(message, { cause: error })
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    items,
    detail,
    isLoading,
    isDetailLoading,
    isSubmitting,
    errorMessage,
    detailError,
    filters,
    isFilterDirty,
    fetchPartners,
    fetchPartnerDetail,
    setFilters,
    resetFilters,
    getUpdateChanges,
    createPartner,
    updatePartner,
    setPartnerActive,
    deletePartner
  }
})
