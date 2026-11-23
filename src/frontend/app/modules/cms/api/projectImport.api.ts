import { apiClient } from '~/api/client'
import { ENDPOINTS } from '~/api/endpoints'
import type {
  ProjectImportPreviewResponse,
  ProjectImportConfirmResponse
} from '../types/projectImport.types'

export const projectImportApi = {
  /**
   * 1. Unduh template Excel kosong
   * GET /api/v1/projects/import/template
   */
  async downloadTemplate(): Promise<Blob> {
    const response = await apiClient.get(ENDPOINTS.PROJECTS.IMPORT_TEMPLATE, {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * 2. Preview & validasi file Excel sebelum commit
   * POST /api/v1/projects/import/preview
   */
  async previewImport(file: File): Promise<{
    success: boolean
    message: string
    data: ProjectImportPreviewResponse
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(ENDPOINTS.PROJECTS.IMPORT_PREVIEW, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * 3. Konfirmasi dan simpan ke database
   * POST /api/v1/projects/import/confirm
   */
  async confirmImport(file: File): Promise<{
    success: boolean
    message: string
    data: ProjectImportConfirmResponse
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(ENDPOINTS.PROJECTS.IMPORT_CONFIRM, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}
