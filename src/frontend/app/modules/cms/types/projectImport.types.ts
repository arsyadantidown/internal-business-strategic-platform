export interface ProjectImportError {
  field: string
  code: string
  message: string
}

export interface ProjectImportWarning {
  field: string
  code: string
  message: string
}

export interface ProjectImportRow {
  row: number
  valid: boolean
  errors: ProjectImportError[]
  warnings: ProjectImportWarning[]
  data: {
    project_code?: string
    project_name?: string
    customer_name?: string
    year?: number
    [key: string]: any
  }
}

export interface ProjectImportPreviewResponse {
  total_rows: number
  valid_rows: number
  invalid_rows: number
  rows: ProjectImportRow[]
}

export interface ProjectImportConfirmResponse {
  imported_count: number
  projects: Array<{
    id: string
    project_code: string
  }>
}
