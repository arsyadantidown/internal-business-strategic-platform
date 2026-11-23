export type ProductStatus = 'active' | 'draft' | 'inactive'

export interface ProductItem {
  id: string
  productName: string
  productDescription: string
  productStatus: ProductStatus
}

export interface ProductFormValues {
  productName: string
  productDescription: string
  productStatus: ProductStatus
}

export interface ProductFormErrors {
  productName?: string
  productDescription?: string
  productStatus?: string
}

export interface ProductFilters {
  search: string
  status: ProductStatus | ''
}

export interface ProductStatusOption {
  label: string
  value: ProductStatus
}
