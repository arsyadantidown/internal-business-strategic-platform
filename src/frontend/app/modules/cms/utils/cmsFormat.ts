const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
})

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC'
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC'
})

const toDate = (value: string) => new Date(value.length === 10 ? `${value}T00:00:00Z` : value)

export const formatCmsDate = (value: string | null | undefined) => {
  if (!value) return '—'
  return dateFormatter.format(toDate(value))
}

export const formatCmsTime = (value: string | null | undefined) => {
  if (!value) return ''
  return timeFormatter.format(toDate(value))
}

export const formatCmsDateTime = (value: string | null | undefined) => {
  if (!value) return '—'
  return `${dateFormatter.format(toDate(value))} · ${timeFormatter.format(toDate(value))}`
}

export const formatCmsShortDateTime = (value: string | null | undefined) => {
  if (!value) return '—'
  return `${shortDateFormatter.format(toDate(value))}, ${timeFormatter.format(toDate(value))}`
}

export const formatCmsScheduledAt = (value: string | null | undefined) => {
  if (!value) return '—'
  const [date, time] = value.split('T')
  if (!date) return '—'
  return `${formatCmsDate(date)}${time ? ` · ${time.slice(0, 5)}` : ''}`
}

export const formatCmsDateTimeLocalValue = (value: Date = new Date()) => {
  const offset = value.getTimezoneOffset() * 60_000
  return new Date(value.getTime() - offset).toISOString().slice(0, 16)
}

export const isCmsScheduleDue = (value: string | null | undefined) => {
  if (!value) return false
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) && timestamp <= Date.now()
}

export const stripCmsHtml = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()

const escapeCmsHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

export const renderCmsRichText = (value: string | null | undefined) => {
  if (!value) return ''
  const hasMarkup = /<[a-z][\s\S]*>/i.test(value)
  const normalized = hasMarkup
    ? value
    : escapeCmsHtml(value).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>')

  const withoutBlocks = normalized
    .replace(/<(script|style|iframe|object|embed|link|meta)[\s\S]*?<\/\1>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')

  if (!import.meta.client) return escapeCmsHtml(stripCmsHtml(withoutBlocks))

  const document = new DOMParser().parseFromString(`<div>${withoutBlocks}</div>`, 'text/html')
  const container = document.body.firstElementChild

  container?.querySelectorAll('script, style, iframe, object, embed, link, meta').forEach((node) => {
    node.remove()
  })

  container?.querySelectorAll('*').forEach((node) => {
    for (const attribute of [...node.attributes]) {
      if (attribute.name.startsWith('on') || /javascript:/i.test(attribute.value)) {
        node.removeAttribute(attribute.name)
      }
    }
  })

  return container?.innerHTML ?? ''
}

export const getCmsInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()

export const formatCmsCurrency = (value: string, currency = 'IDR') => {
  if (!value) return '—'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return value
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(numeric)
}
