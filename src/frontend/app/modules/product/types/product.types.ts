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

export interface ProductApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface ProductListQuery {
  product_status_id?: string
}

export interface ProductCreatePayload {
  product_name: string
  product_description: string
  product_status_id: string
}

export interface ProductUpdatePayload {
  product_name?: string
  product_description?: string
  product_status_id?: string
}

export interface ProductStatusRef {
  id: string
  code: string
  name: string
}

export interface ProductRecord extends ProductItem {
  productStatusId: string
  productStatusName: string
}

export interface ProductMutationResult {
  item: ProductRecord
  message: string
}

export interface ProductDeleteResult {
  id: string
  deleted: boolean
  message: string
}
