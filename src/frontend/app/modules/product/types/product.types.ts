export type ProductStatus = 'active' | 'draft' | 'inactive'

export interface ProductStatusRawItem {
  id?: string
  product_status_code?: string
  product_status_name?: string
}

export interface ProductStatusRef {
  id: string
  code: string
  name: string
}

export interface ProductRawItem {
  id?: string
  product_name?: string
  product_description?: string | null
  product_status?: ProductStatusRawItem
}

export interface ProductItem {
  id: string
  productName: string
  productDescription: string
  productStatus: ProductStatus
  productStatusId: string
  productStatusName: string
}

export interface ProductFormValues {
  productName: string
  productDescription: string
  productStatusId: string
}

export interface ProductFormErrors {
  productName?: string
  productDescription?: string
  productStatusId?: string
}

export interface ProductFilters {
  productStatusId: string
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
  product_name: string
  product_description: string
  product_status_id: string
}
