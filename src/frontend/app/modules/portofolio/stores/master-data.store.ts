import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { masterDataApi } from '../api/master-data.api'
import type { MasterDataItem, MasterDataType, PortfolioOption } from '../types/types'
import { projectApi } from '~/modules/cms/api/project.api'
export const useMasterDataStore = defineStore('masterData', () => {
  // State raw master data
  const products = ref<any[]>([])
  const techStacks = ref<any[]>([])
  const companySizes = ref<MasterDataItem[]>([])
  const customerTypes = ref<MasterDataItem[]>([])
  const industries = ref<MasterDataItem[]>([])
  const legalStructures = ref<MasterDataItem[]>([])
  const businessUnits = ref<MasterDataItem[]>([])
  const projectStatuses = ref<MasterDataItem[]>([])
  const productStatuses = ref<MasterDataItem[]>([])

  const isLoading = ref(false)
  const isLoaded = ref(false)

  // Helper untuk mengekstrak display name dari item
  const getItemName = (item: MasterDataItem): string => {
    // Cari key yang berakhiran '_name' atau 'name'
    const nameKey = Object.keys(item).find((key) => key.endsWith('_name') || key === 'name')
    return (nameKey ? item[nameKey] : item.name || item.code || item.id) as string
  }

  // Helper untuk mengubah array MasterDataItem menjadi PortfolioOption[]
  const toOptions = (items: MasterDataItem[]): PortfolioOption[] => {
    return items.map((item) => {
      const name = getItemName(item)
      return {
        label: name,
        value: item.id // ID UUID digunakan sebagai value untuk query filter backend
      }
    })
  }

  // Computed Options untuk Dropdown Filter
  const companySizeOptions = computed(() => toOptions(companySizes.value))
  const customerTypeOptions = computed(() => toOptions(customerTypes.value))
  const industryOptions = computed(() => toOptions(industries.value))
  const legalStructureOptions = computed(() => toOptions(legalStructures.value))
  const businessUnitOptions = computed(() => toOptions(businessUnits.value))
  const projectStatusOptions = computed(() => toOptions(projectStatuses.value))
  const productStatusOptions = computed(() => toOptions(productStatuses.value))
  const productOptions = computed<PortfolioOption[]>(() => {
    return products.value.map((item) => ({
      label: item.product_name || item.name || '',
      value: item.id
    }))
  })
  // Tech Stacks: Frontend
  const frontendStackOptions = computed<PortfolioOption[]>(() => {
    return techStacks.value
      .filter((item) => item.tech_stack_category === 'frontend')
      .map((item) => ({
        label: item.tech_stack_name || item.name || '',
        value: item.id
      }))
  })
  // Tech Stacks: Backend
  const backendStackOptions = computed<PortfolioOption[]>(() => {
    return techStacks.value
      .filter((item) => item.tech_stack_category === 'backend')
      .map((item) => ({
        label: item.tech_stack_name || item.name || '',
        value: item.id
      }))
  })
  // Tech Stacks: Database (kategori di backend: data_storage)
  const databaseOptions = computed<PortfolioOption[]>(() => {
    return techStacks.value
      .filter((item) => item.tech_stack_category === 'data_storage')
      .map((item) => ({
        label: item.tech_stack_name || item.name || '',
        value: item.id
      }))
  })

  // Action untuk memuat semua 7 master data sekaligus
  const fetchAllMasterData = async (force = false) => {
    if (isLoaded.value && !force) return

    isLoading.value = true
    try {
      const [
        resCompanySizes,
        resCustomerTypes,
        resIndustries,
        resLegalStructures,
        resBusinessUnits,
        resProjectStatuses,
        resProductStatuses,
        resProducts,
        resTechStacks
      ] = await Promise.all([
        masterDataApi.getMasterData('company-sizes'),
        masterDataApi.getMasterData('customer-types'),
        masterDataApi.getMasterData('industries'),
        masterDataApi.getMasterData('legal-structures'),
        masterDataApi.getMasterData('business-units'),
        masterDataApi.getMasterData('project-statuses'),
        masterDataApi.getMasterData('product-statuses'),
        projectApi.getProducts(),
        projectApi.getTechStacks()
      ])
      companySizes.value = resCompanySizes.data || []
      customerTypes.value = resCustomerTypes.data || []
      industries.value = resIndustries.data || []
      legalStructures.value = resLegalStructures.data || []
      businessUnits.value = resBusinessUnits.data || []
      projectStatuses.value = resProjectStatuses.data || []
      productStatuses.value = resProductStatuses.data || []
      products.value = resProducts || []
      techStacks.value = resTechStacks || []

      isLoaded.value = true
    } catch (error) {
      console.error('Failed to fetch master data:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Raw States
    companySizes,
    customerTypes,
    industries,
    legalStructures,
    businessUnits,
    projectStatuses,
    productStatuses,
    products,
    techStacks,
    isLoading,
    isLoaded,

    // Computed Options untuk Dropdown
    companySizeOptions,
    customerTypeOptions,
    industryOptions,
    legalStructureOptions,
    businessUnitOptions,
    projectStatusOptions,
    productStatusOptions,
    productOptions,
    frontendStackOptions,
    backendStackOptions,
    databaseOptions,

    // Actions
    fetchAllMasterData
  }
})
