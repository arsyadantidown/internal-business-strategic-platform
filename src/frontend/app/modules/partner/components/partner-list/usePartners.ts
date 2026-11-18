import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePartnerStore } from '../../stores/partner.store'
import type { PartnerFilters, PartnerListItem } from '../../types/partner.types'

const SEARCH_DEBOUNCE_MS = 400

const createPartnerFilters = (): PartnerFilters => ({
  search: '',
  category: '',
  status: ''
})

export function usePartners() {
  const store = usePartnerStore()

  const items = ref<PartnerListItem[]>([])
  const isLoading = ref(true)
  const loadError = ref('')

  const filters = ref<PartnerFilters>(createPartnerFilters())

  const isFilterDirty = computed(() =>
    filters.value.search.trim() !== ''
    || filters.value.category !== ''
    || filters.value.status !== ''
  )

  const filteredItems = computed(() => {
    const category = filters.value.category
    const status = filters.value.status

    return items.value.filter(item =>
      (category === '' || item.category === category)
      && (status === '' || (status === 'active') === item.isActive)
    )
  })

  let fetchToken = 0
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  const fetchPartners = async (options: { silent?: boolean } = {}) => {
    const token = ++fetchToken
    if (!options.silent) isLoading.value = true
    loadError.value = ''

    try {
      const result = await store.fetchPartners(filters.value)

      if (token === fetchToken) {
        items.value = result
      }
    } catch (error) {
      if (token === fetchToken) {
        loadError.value = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
        items.value = []
      }
    } finally {
      if (token === fetchToken) isLoading.value = false
    }
  }

  const retryLoad = () => {
    fetchPartners()
  }

  const scheduleFetch = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined
      fetchPartners({ silent: true })
    }, SEARCH_DEBOUNCE_MS)
  }

  const setFilters = (value: PartnerFilters) => {
    const searchChanged = value.search !== filters.value.search
    filters.value = { ...value }

    if (searchChanged) {
      scheduleFetch()
      return
    }

    fetchPartners()
  }

  const resetFilters = () => {
    filters.value = createPartnerFilters()
    fetchPartners()
  }

  onMounted(() => {
    fetchPartners()
  })

  onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    fetchToken += 1
  })

  return {
    items,
    filteredItems,
    isLoading,
    loadError,
    filters,
    isFilterDirty,
    fetchPartners,
    retryLoad,
    setFilters,
    resetFilters
  }
}
