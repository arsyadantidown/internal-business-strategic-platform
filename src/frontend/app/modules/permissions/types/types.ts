export interface RoleTableItem {
  id: string
  name: string
  code: string
  description: string
  status: 'Active' | 'Inactive'
}
export interface PermissionTableItem {
  id: string
  name: string
  code: string
  description: string
}
export interface PermissionItem {
  id: string
  code: string
  name: string
  description: string
}
