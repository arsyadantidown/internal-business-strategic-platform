export interface CustomerNameItem {
  customer_name: string
}

export interface CustomerLocationItem {
  customer_location: string
}

export interface CustomerNamesResponse {
  success: boolean
  message: string
  data: CustomerNameItem[]
  meta?: any
}

export interface CustomerLocationsResponse {
  success: boolean
  message: string
  data: CustomerLocationItem[]
  meta?: any
}

export interface CustomerSearchParams {
  search?: string
}
