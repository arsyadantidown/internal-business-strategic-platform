import type { PartnershipStatus } from '../../partnership/components/partnership-list/partnership.types'

export type NotificationType = 'partner-verification' | 'status-update' | 'contract-expiry'

export type NotificationChannel = 'slack' | 'email'

export type NotificationFilterTab = 'all' | 'unread' | 'read'

export type NotificationTypeFilter = 'all' | NotificationType

export interface NotificationVerification {
  assignedTo: string
  assignedRole: string
}

export interface NotificationStatusUpdate {
  fromStatus: PartnershipStatus
  toStatus: PartnershipStatus
}

export interface NotificationContractExpiry {
  contractEndDate: string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  partnerId: string
  partnerName: string
  channels: NotificationChannel[]
  createdAt: string
  isRead: boolean
  verification?: NotificationVerification
  statusUpdate?: NotificationStatusUpdate
  contractExpiry?: NotificationContractExpiry
}

export interface NotificationFilters {
  tab: NotificationFilterTab
  type: NotificationTypeFilter
}
