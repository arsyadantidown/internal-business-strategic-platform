import type { Notification, NotificationFilters } from '../types/notification.types'
import { partners } from '../../partnership/components/partnership-list/partnership.data'

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

const daysAgo = (days: number) => hoursAgo(days * 24)

const addDays = (iso: string, days: number) =>
  new Date(new Date(iso).getTime() + days * 24 * 60 * 60 * 1000).toISOString()

const getPartner = (id: string) => {
  const partner = partners.find(item => item.id === id)
  if (!partner) throw new Error(`Unknown partner id: ${id}`)
  return partner
}

export const createNotificationFilters = (): NotificationFilters => ({
  tab: 'all',
  type: 'all'
})

export const createNotifications = (): Notification[] => {
  const logiChain = getPartner('PIN-2026-016')
  const nusantara = getPartner('PIN-2026-006')
  const iotDynamics = getPartner('PIN-2026-011')
  const govTech = getPartner('PIN-2026-018')
  const schneider = getPartner('PIN-2026-003')
  const globalCloud = getPartner('PIN-2026-005')
  const smartFactory = getPartner('PIN-2026-025')
  const insightRetail = getPartner('PIN-2026-026')
  const legacyCore = getPartner('PIN-2026-022')
  const greenGrid = getPartner('PIN-2026-013')
  const renewCo = getPartner('PIN-2026-020')

  const schneiderCreatedAt = daysAgo(2)
  const globalCloudCreatedAt = daysAgo(3)
  const greenGridCreatedAt = daysAgo(7)

  return [
    {
      id: 'NTF-2026-001',
      type: 'status-update',
      title: 'Partnership status updated',
      description: `${logiChain.name} moved from Under Review to Active after completing the verification process.`,
      partnerId: logiChain.id,
      partnerName: logiChain.name,
      channels: ['slack'],
      createdAt: hoursAgo(1),
      isRead: false,
      statusUpdate: {
        fromStatus: 'Under Review',
        toStatus: 'Active'
      }
    },
    {
      id: 'NTF-2026-002',
      type: 'partner-verification',
      title: 'New partner verification assigned',
      description: `${nusantara.name} has submitted partnership data and is waiting for verification.`,
      partnerId: nusantara.id,
      partnerName: nusantara.name,
      channels: ['email'],
      createdAt: hoursAgo(2),
      isRead: false,
      verification: {
        assignedTo: 'Alya Prameswari',
        assignedRole: 'Partnership Officer'
      }
    },
    {
      id: 'NTF-2026-003',
      type: 'partner-verification',
      title: 'New partner verification assigned',
      description: `${iotDynamics.name} needs a document and profile review before evaluation.`,
      partnerId: iotDynamics.id,
      partnerName: iotDynamics.name,
      channels: ['slack', 'email'],
      createdAt: hoursAgo(6),
      isRead: false,
      verification: {
        assignedTo: 'Budi Santoso',
        assignedRole: 'Partnership Officer'
      }
    },
    {
      id: 'NTF-2026-004',
      type: 'status-update',
      title: 'Partnership moved to review',
      description: `${nusantara.name} has been moved from Draft to Under Review for further assessment.`,
      partnerId: nusantara.id,
      partnerName: nusantara.name,
      channels: ['email'],
      createdAt: hoursAgo(18),
      isRead: true,
      statusUpdate: {
        fromStatus: 'Draft',
        toStatus: 'Under Review'
      }
    },
    {
      id: 'NTF-2026-005',
      type: 'partner-verification',
      title: 'New partner verification assigned',
      description: `${govTech.name} requires verification of its company profile and legal documents.`,
      partnerId: govTech.id,
      partnerName: govTech.name,
      channels: ['email'],
      createdAt: daysAgo(1),
      isRead: true,
      verification: {
        assignedTo: 'Citra Lestari',
        assignedRole: 'Project Lead'
      }
    },
    {
      id: 'NTF-2026-006',
      type: 'contract-expiry',
      title: 'Contract ends in 30 days',
      description: `The partnership contract for ${schneider.name} is approaching its end date. Review renewal options before it expires.`,
      partnerId: schneider.id,
      partnerName: schneider.name,
      channels: ['slack', 'email'],
      createdAt: schneiderCreatedAt,
      isRead: true,
      contractExpiry: {
        contractEndDate: addDays(schneiderCreatedAt, 30)
      }
    },
    {
      id: 'NTF-2026-007',
      type: 'contract-expiry',
      title: 'Contract ends in 30 days',
      description: `The partnership contract for ${globalCloud.name} will expire soon. Coordinate with the partner to start the renewal process.`,
      partnerId: globalCloud.id,
      partnerName: globalCloud.name,
      channels: ['slack', 'email'],
      createdAt: globalCloudCreatedAt,
      isRead: true,
      contractExpiry: {
        contractEndDate: addDays(globalCloudCreatedAt, 30)
      }
    },
    {
      id: 'NTF-2026-008',
      type: 'status-update',
      title: 'Partnership moved to review',
      description: `${smartFactory.name} has been moved from Draft to Under Review for capability assessment.`,
      partnerId: smartFactory.id,
      partnerName: smartFactory.name,
      channels: ['email'],
      createdAt: daysAgo(4),
      isRead: true,
      statusUpdate: {
        fromStatus: 'Draft',
        toStatus: 'Under Review'
      }
    },
    {
      id: 'NTF-2026-009',
      type: 'partner-verification',
      title: 'New partner verification assigned',
      description: `${insightRetail.name} requires a verification review before the partnership can proceed.`,
      partnerId: insightRetail.id,
      partnerName: insightRetail.name,
      channels: ['slack'],
      createdAt: daysAgo(5),
      isRead: true,
      verification: {
        assignedTo: 'Dewi Anggraini',
        assignedRole: 'Partnership Officer'
      }
    },
    {
      id: 'NTF-2026-010',
      type: 'status-update',
      title: 'Partnership status updated',
      description: `${legacyCore.name} moved from Active to Terminated based on the latest partnership review.`,
      partnerId: legacyCore.id,
      partnerName: legacyCore.name,
      channels: ['slack', 'email'],
      createdAt: daysAgo(6),
      isRead: true,
      statusUpdate: {
        fromStatus: 'Active',
        toStatus: 'Terminated'
      }
    },
    {
      id: 'NTF-2026-011',
      type: 'contract-expiry',
      title: 'Contract ends in 30 days',
      description: `The partnership contract for ${greenGrid.name} is nearing its end date. Prepare the renewal documents in advance.`,
      partnerId: greenGrid.id,
      partnerName: greenGrid.name,
      channels: ['email'],
      createdAt: greenGridCreatedAt,
      isRead: true,
      contractExpiry: {
        contractEndDate: addDays(greenGridCreatedAt, 30)
      }
    },
    {
      id: 'NTF-2026-012',
      type: 'status-update',
      title: 'Partnership status updated',
      description: `${renewCo.name} moved from Active to Expired after the contract period ended.`,
      partnerId: renewCo.id,
      partnerName: renewCo.name,
      channels: ['slack'],
      createdAt: daysAgo(8),
      isRead: true,
      statusUpdate: {
        fromStatus: 'Active',
        toStatus: 'Expired'
      }
    }
  ]
}
