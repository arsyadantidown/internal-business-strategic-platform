type CmsCsvValue = string | number | boolean | null | undefined

const escapeCmsCsvValue = (value: CmsCsvValue) => {
  const text = value == null ? '' : String(value)
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safeText.replace(/"/g, '""')}"`
}

export const buildCmsCsv = (headers: string[], rows: CmsCsvValue[][]) =>
  [headers, ...rows]
    .map(row => row.map(escapeCmsCsvValue).join(','))
    .join('\r\n')

export const downloadCmsCsv = (filename: string, headers: string[], rows: CmsCsvValue[][]) => {
  if (!import.meta.client) return

  const blob = new Blob([`\uFEFF${buildCmsCsv(headers, rows)}`], {
    type: 'text/csv;charset=utf-8;'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
