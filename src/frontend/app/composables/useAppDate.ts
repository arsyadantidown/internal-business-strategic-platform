export function useAppDate() {
  const dayjs = useDayjs()

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

  return {
    dayjs,
    formatDateTime,
    formatDate
  }
}
