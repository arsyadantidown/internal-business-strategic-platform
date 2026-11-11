import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getTechTaskErrorMessage, techTaskApi } from '../../api/tech-task.api'
import type { TechTaskFilters, TechTaskListItem } from '../../types/tech-task.types'

const SEARCH_DEBOUNCE_MS = 400

const createTechTaskFilters = (): TechTaskFilters => ({
  search: '',
  techStackId: '',
  projectStatusId: '',
  year: ''
})

export function useTechTasks() {
  const items = ref<TechTaskListItem[]>([])
  const isLoading = ref(true)
  const loadError = ref('')
  const total = ref(0)
  const totalPages = ref(0)

  const filters = ref<TechTaskFilters>(createTechTaskFilters())
  const currentPage = ref(1)
  const pageSize = ref(10)

  const isFilterDirty = computed(() =>
    filters.value.search.trim() !== ''
    || filters.value.techStackId !== ''
    || filters.value.projectStatusId !== ''
    || filters.value.year.trim() !== ''
  )

  let fetchToken = 0
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  const fetchTasks = async (options: { silent?: boolean } = {}) => {
    const token = ++fetchToken
    if (!options.silent) isLoading.value = true
    loadError.value = ''

    try {
      const result = await techTaskApi.list(
        filters.value,
        currentPage.value,
        pageSize.value
      )

      if (token === fetchToken) {
        items.value = result.items
        total.value = result.total
        totalPages.value = Math.max(result.totalPages, 1)
        if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
      }
    } catch (error) {
      if (token === fetchToken) {
        loadError.value = getTechTaskErrorMessage(error)
        items.value = []
        total.value = 0
        totalPages.value = 0
      }
    } finally {
      if (token === fetchToken) isLoading.value = false
    }
  }

  const retryLoad = () => {
    fetchTasks()
  }

  const scheduleFetch = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined
      fetchTasks({ silent: true })
    }, SEARCH_DEBOUNCE_MS)
  }

  const setFilters = (value: TechTaskFilters) => {
    const searchChanged = value.search !== filters.value.search
    filters.value = { ...value }

    if (!searchChanged) {
      currentPage.value = 1
      fetchTasks()
      return
    }

    currentPage.value = 1
    scheduleFetch()
  }

  const resetFilters = () => {
    filters.value = createTechTaskFilters()
    currentPage.value = 1
    fetchTasks()
  }

  const setPage = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages.value)
    if (clamped === currentPage.value) return
    currentPage.value = clamped
    fetchTasks()
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    fetchTasks()
  }

  watch(filters, () => {
    currentPage.value = 1
  }, { deep: true })

  onMounted(() => {
    fetchTasks()
  })

  onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    fetchToken += 1
  })

  return {
    items,
    isLoading,
    loadError,
    total,
    totalPages,
    filters,
    currentPage,
    pageSize,
    isFilterDirty,
    fetchTasks,
    retryLoad,
    setFilters,
    resetFilters,
    setPage,
    setPageSize
  }
}
