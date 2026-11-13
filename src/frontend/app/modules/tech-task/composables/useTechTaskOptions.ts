import { ref } from 'vue'
import { getTechTaskErrorMessage, techTaskApi } from '../api/tech-task.api'
import type { MasterDataOption, TechStackOption } from '../types/tech-task.types'

const techStackOptions = ref<TechStackOption[]>([])
const businessUnitOptions = ref<MasterDataOption[]>([])
const projectStatusOptions = ref<MasterDataOption[]>([])
const isLoadingOptions = ref(false)
const optionsError = ref('')
let isLoaded = false
let loadPromise: Promise<void> | null = null

const loadOptions = async () => {
  isLoadingOptions.value = true
  optionsError.value = ''

  try {
    const [techStacks, businessUnits, projectStatuses] = await Promise.all([
      techTaskApi.listTechStackOptions(),
      techTaskApi.listBusinessUnitOptions(),
      techTaskApi.listProjectStatusOptions()
    ])

    techStackOptions.value = techStacks
    businessUnitOptions.value = businessUnits
    projectStatusOptions.value = projectStatuses
    isLoaded = true
  } catch (error) {
    optionsError.value = getTechTaskErrorMessage(error)
  } finally {
    isLoadingOptions.value = false
    loadPromise = null
  }
}

export function useTechTaskOptions() {
  const ensureOptions = () => {
    if (isLoaded || loadPromise) return loadPromise
    loadPromise = loadOptions()
    return loadPromise
  }

  const retryLoadOptions = () => {
    isLoaded = false
    return ensureOptions()
  }

  return {
    techStackOptions,
    businessUnitOptions,
    projectStatusOptions,
    isLoadingOptions,
    optionsError,
    ensureOptions,
    retryLoadOptions
  }
}
