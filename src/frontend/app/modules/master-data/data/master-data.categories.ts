import type { MasterDataCategory, MasterDataType } from '../types/master-data.types'

const companySizesCategory: MasterDataCategory = {
  type: 'company-sizes',
  label: 'Company Sizes',
  singular: 'Company Size',
  prefix: 'company_size',
  icon: 'i-lucide-building',
  description: 'Company size options available on customer and portfolio forms.'
}

export const masterDataCategories: MasterDataCategory[] = [
  companySizesCategory,
  {
    type: 'customer-types',
    label: 'Customer Types',
    singular: 'Customer Type',
    prefix: 'customer_type',
    icon: 'i-lucide-users',
    description: 'Classifications used to segment customers across the platform.'
  },
  {
    type: 'industries',
    label: 'Industries',
    singular: 'Industry',
    prefix: 'industry',
    icon: 'i-lucide-factory',
    description: 'Industry sectors used on portfolio, partnership, and customer records.'
  },
  {
    type: 'legal-structures',
    label: 'Legal Structures',
    singular: 'Legal Structure',
    prefix: 'legal_structure',
    icon: 'i-lucide-scale',
    description: 'Legal entity structures available for partner records.'
  },
  {
    type: 'business-units',
    label: 'Business Units',
    singular: 'Business Unit',
    prefix: 'business_unit',
    icon: 'i-lucide-network',
    description: 'Internal business units that own products and projects.'
  },
  {
    type: 'project-statuses',
    label: 'Project Statuses',
    singular: 'Project Status',
    prefix: 'project_status',
    icon: 'i-lucide-list-checks',
    description: 'Lifecycle statuses assigned to portfolio projects.'
  },
  {
    type: 'product-statuses',
    label: 'Product Statuses',
    singular: 'Product Status',
    prefix: 'product_status',
    icon: 'i-lucide-package',
    description: 'Lifecycle statuses assigned to products.'
  }
]

export const DEFAULT_MASTER_DATA_TYPE: MasterDataType = companySizesCategory.type

export const getMasterDataCategory = (type: MasterDataType): MasterDataCategory =>
  masterDataCategories.find(category => category.type === type) ?? companySizesCategory

export const resolveMasterDataType = (value: unknown): MasterDataType | null => {
  if (typeof value !== 'string') return null
  const category = masterDataCategories.find(item => item.type === value)
  return category ? category.type : null
}
