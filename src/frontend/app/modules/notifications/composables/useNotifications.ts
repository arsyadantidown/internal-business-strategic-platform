import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { Notification, NotificationFilters } from '../types/notification.types'
import { createNotificationFilters, createNotifications } from '../data/notification.data'
import { useAppDate } from '../../../composables/useAppDate'

dayjs.extend(relativeTime)

export function useNotifications() {
  const { dayjs: appDayjs, formatDate, formatDateTime } = useAppDate()
  const items = useState<Notification[]>('notifications-items', () => createNotifications())
  const filters = ref<NotificationFilters>(createNotificationFilters())
  const currentPage = ref(1)
  const pageSize = ref(10)

  const totalCount = computed(() => items.value.length)
  const unreadCount = computed(() => items.value.filter(notification => !notification.isRead).length)
  const readCount = computed(() => items.value.filter(notification => notification.isRead).length)

  const filteredNotifications = computed(() =>
    items.value.filter((notification) => {
      if (filters.value.tab === 'unread' && notification.isRead) return false
      if (filters.value.tab === 'read' && !notification.isRead) return false
      if (filters.value.type !== 'all' && notification.type !== filters.value.type) return false
      return true
    })
  )

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredNotifications.value.length / pageSize.value))
  )

  const paginatedNotifications = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredNotifications.value.slice(start, start + pageSize.value)
  })

  watch(
    filters,
    () => {
      currentPage.value = 1
    },
    { deep: true }
  )

  watch([totalPages, pageSize], () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
    if (currentPage.value < 1) currentPage.value = 1
  })

  const setPage = (page: number) => {
    currentPage.value = page
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }

  const resetFilters = () => {
    filters.value = createNotificationFilters()
    currentPage.value = 1
  }

  const markAsRead = (id: string) => {
    items.value = items.value.map(notification =>
      notification.id === id && !notification.isRead
        ? { ...notification, isRead: true }
        : notification
    )
  }

  const markAllAsRead = () => {
    items.value = items.value.map(notification =>
      notification.isRead ? notification : { ...notification, isRead: true }
    )
  }

  const formatRelativeTime = (value: string) => appDayjs(value).fromNow()
  const formatFullDateTime = (value: string) => formatDateTime(value)
  const formatFullDate = (value: string) => formatDate(value)

  return {
    items,
    filters,
    currentPage,
    pageSize,
    totalCount,
    unreadCount,
    readCount,
    filteredNotifications,
    paginatedNotifications,
    totalPages,
    setPage,
    setPageSize,
    resetFilters,
    markAsRead,
    markAllAsRead,
    formatRelativeTime,
    formatFullDateTime,
    formatFullDate
  }
}
