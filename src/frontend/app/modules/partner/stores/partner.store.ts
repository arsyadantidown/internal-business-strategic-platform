import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPartnerErrorMessage, partnerApi } from '../api/partner.api'
import type {
  PartnerDetail,
  PartnerFilters,
  PartnerFormValues,
  PartnerListItem,
  PartnerStatusFilterValue
} from '../types/partner.types'

const emptyFilters = (): PartnerFilters => ({ search: '', category: '', status: '' })

const readErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const detail = (error as { data?: { detail?: unknown } }).data?.detail
    if (Array.isArray(detail)) {
      const first = detail.find((item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null && typeof item.msg === 'string') ?? detail[0]
      const message = typeof first?.msg === 'string' ? first.msg : ''
      if (message) return message
    }
  }

  return getPartnerErrorMessage(error)
}

const toListItem = (detail: PartnerDetail): PartnerListItem => ({
  id: detail.id,
  partnerName: detail.partnerName,
  category: detail.category,
  isActive: detail.isActive,
  lifecycleStatus: detail.lifecycleStatus
})

export const usePartnerStore = defineStore('partner', () => {
  const partners = ref<PartnerListItem[]>([])
  const currentPartner = ref<PartnerDetail | null>(null)
  const isLoading = ref<boolean>(false)
  const isSubmitting = ref<boolean>(false)
  const error = ref<string>('')

  let lastFilters: PartnerFilters = emptyFilters()

  const fetchPartners = async (filters: PartnerFilters = lastFilters) => {
    lastFilters = { ...filters, search: filters.search.trim().slice(0, 200) }
    isLoading.value = true
    error.value = ''
    try {
      const items = await partnerApi.list(lastFilters)
      const byCategory = lastFilters.category
        ? items.filter(item => item.category === lastFilters.category)
        : items

      partners.value = partnerApi.applyStatusFilter(byCategory, lastFilters.status)
      return partners.value
    } catch (err) {
      const message = readErrorMessage(err)
      error.value = message
      throw new Error(message, { cause: err })
    } finally {
      isLoading.value = false
    }
  }

  const fetchPartnerDetail = async (partnerId: string) => {
    isLoading.value = true
    error.value = ''
    try {
      currentPartner.value = await partnerApi.getDetail(partnerId)
      return currentPartner.value
    } catch (err) {
      const message = readErrorMessage(err)
      error.value = message
      throw new Error(message, { cause: err })
    } finally {
      isLoading.value = false
    }
  }

  const createPartner = async (values: PartnerFormValues) => {
    isSubmitting.value = true
    error.value = ''
    try {
      const result = await partnerApi.create(values)
      const item: PartnerListItem = {
        id: result.id,
        partnerName: values.partnerName.trim(),
        category: values.category || null,
        isActive: values.status === 'active',
        lifecycleStatus: values.status
      }

      partners.value = [item, ...partners.value]
      return result
    } catch (err) {
      const message = readErrorMessage(err)
      error.value = message
      throw new Error(message, { cause: err })
    } finally {
      isSubmitting.value = false
    }
  }

  const updatePartner = async (
    partnerId: string,
    values: PartnerFormValues,
    detail?: PartnerDetail
  ) => {
    isSubmitting.value = true
    error.value = ''
    try {
      const current = detail
        ?? (currentPartner.value?.id === partnerId ? currentPartner.value : null)
        ?? await partnerApi.getDetail(partnerId)

      const result = await partnerApi.update(partnerId, current, values)
      partners.value = partners.value.map((item) => {
        if (item.id !== partnerId) return item

        return toListItem({
          ...current,
          partnerName: values.partnerName.trim(),
          category: values.category || null,
          isActive: values.status === 'active',
          lifecycleStatus: values.status
        })
      })

      if (currentPartner.value?.id === partnerId) {
        currentPartner.value = {
          ...currentPartner.value,
          partnerName: values.partnerName.trim()
        }
      }

      return result
    } catch (err) {
      const message = readErrorMessage(err)
      error.value = message
      throw new Error(message, { cause: err })
    } finally {
      isSubmitting.value = false
    }
  }

  const setPartnerActive = async (partnerId: string, isActive: boolean) => {
    isSubmitting.value = true
    error.value = ''
    try {
      const result = await partnerApi.setActive(partnerId, isActive)
      partners.value = partners.value.map(item =>
        item.id === partnerId ? { ...item, isActive } : item)

      if (currentPartner.value?.id === partnerId) {
        currentPartner.value = { ...currentPartner.value, isActive }
      }

      return result
    } catch (err) {
      const message = readErrorMessage(err)
      error.value = message
      throw new Error(message, { cause: err })
    } finally {
      isSubmitting.value = false
    }
  }

  const deletePartner = async (partnerId: string) => {
    isSubmitting.value = true
    error.value = ''
    try {
      const result = await partnerApi.remove(partnerId)
      if (result.deleted) {
        partners.value = partners.value.filter(item => item.id !== partnerId)
        if (currentPartner.value?.id === partnerId) currentPartner.value = null
      } else {
        partners.value = partners.value.map(item =>
          item.id === partnerId ? { ...item, isActive: false } : item)

        if (currentPartner.value?.id === partnerId) {
          currentPartner.value = { ...currentPartner.value, isActive: false }
        }
      }

      return result
    } catch (err) {
      const message = readErrorMessage(err)
      error.value = message
      throw new Error(message, { cause: err })
    } finally {
      isSubmitting.value = false
    }
  }

  const getUpdateChanges = (detail: PartnerDetail, values: PartnerFormValues) =>
    partnerApi.getUpdateChanges(detail, values)

  const applyStatusFilter = (items: PartnerListItem[], status: PartnerStatusFilterValue) =>
    partnerApi.applyStatusFilter(items, status)

  return {
    partners,
    currentPartner,
    isLoading,
    isSubmitting,
    error,
    fetchPartners,
    fetchPartnerDetail,
    createPartner,
    updatePartner,
    setPartnerActive,
    deletePartner,
    getUpdateChanges,
    applyStatusFilter
  }
})
