import type { CmsDocument } from '../types/cms.types'

export const cmsControlClass
  = 'w-full rounded-lg border bg-white px-3 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-1'

export const cmsControlStateClass = (hasError: boolean) =>
  hasError
    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'

export const splitCmsLines = (value: string) =>
  value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

export const joinCmsLines = (values: string[]) => values.join('\n')

export const serializeCmsDocuments = (documents: CmsDocument[]) =>
  documents
    .map(document => [document.name, document.type, document.size].filter(Boolean).join(' | '))
    .join('\n')

export const parseCmsDocuments = (value: string): CmsDocument[] =>
  splitCmsLines(value)
    .map((line) => {
      const [name, type, size] = line.split('|').map(part => part.trim())
      return {
        name: name ?? '',
        type: type || 'PDF',
        size: size || '—'
      }
    })
    .filter(document => Boolean(document.name))

export const slugifyCmsTitle = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const todayCmsDate = () => new Date().toISOString().slice(0, 10)
