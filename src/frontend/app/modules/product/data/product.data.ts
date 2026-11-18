import type { ProductStatus, ProductStatusOption } from '../types/product.types'

export const productStatusOptions: ProductStatusOption[] = [
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Inactive', value: 'inactive' }
]

export const productStatusLabel = (status: ProductStatus) =>
  productStatusOptions.find(option => option.value === status)?.label ?? 'Unknown'
