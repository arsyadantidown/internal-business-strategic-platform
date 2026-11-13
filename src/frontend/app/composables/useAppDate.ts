import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// Aktifkan plugin relativeTime bawaan dayjs
dayjs.extend(relativeTime)

export function useAppDate() {
  /**
   * Format standar request/audit (contoh: "Oct 26, 2026 14:32")
   */
  const formatDateTime = (dateStr?: string | Date | null) => {
    if (!dateStr) return '-'
    return dayjs(dateStr).format('MMM D, YYYY HH:mm')
  }

  /**
   * Format hanya tanggal (contoh: "Oct 26, 2026")
   */
  const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return '-'
    return dayjs(dateStr).format('MMM D, YYYY')
  }

  /**
   * Format waktu relatif (contoh: "2 days ago", "a few seconds ago", "3 months ago")
   */
  const formatRelativeTime = (dateStr?: string | Date | null) => {
    if (!dateStr) return '-'
    return dayjs(dateStr).fromNow()
  }

  return {
    dayjs,
    formatDateTime,
    formatDate,
    formatRelativeTime
  }
}
