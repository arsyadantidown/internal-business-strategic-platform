<script setup lang="ts">
import { computed } from 'vue'
import { formatCmsDate } from '~/modules/cms/utils/cmsFormat'
import type { PartnerDetail } from '../../types/partner.types'

interface Props {
  detail: PartnerDetail
}

const props = defineProps<Props>()

const documents = computed(() => props.detail.legalDocuments)

const isExpiringSoon = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false
  const expiry = new Date(expiresAt).getTime()
  if (Number.isNaN(expiry)) return false
  const ninetyDays = 90 * 24 * 60 * 60 * 1000
  return expiry - Date.now() <= ninetyDays
}

const isExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false
  const expiry = new Date(expiresAt).getTime()
  if (Number.isNaN(expiry)) return false
  return expiry < Date.now()
}

const expiryClass = (expiresAt: string | null): string => {
  if (isExpired(expiresAt)) return 'text-rose-600'
  if (isExpiringSoon(expiresAt)) return 'text-amber-600'
  return 'text-slate-500'
}
</script>

<template>
  <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
    <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon
          name="i-lucide-scale"
          class="h-3.5 w-3.5"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-bold tracking-tight text-slate-900">
          Legal Documents
        </h3>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Contracts and legal records covering the partnership
        </p>
      </div>
      <span
        v-if="documents.length"
        class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
      >
        {{ documents.length }} documents
      </span>
    </div>

    <div
      v-if="documents.length"
      class="mt-3 overflow-x-auto"
    >
      <table class="w-full min-w-[680px] text-left text-xs">
        <thead class="border-b border-slate-100">
          <tr>
            <th class="py-2 pr-4 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
              Document
            </th>
            <th class="py-2 pr-4 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
              Type
            </th>
            <th class="py-2 pr-4 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
              Number
            </th>
            <th class="py-2 pr-4 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
              Issued
            </th>
            <th class="py-2 pr-4 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
              Expires
            </th>
            <th class="py-2 text-right text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
              File
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="document in documents"
            :key="document.id"
          >
            <td class="py-2.5 pr-4">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-file-text"
                  class="h-3.5 w-3.5 shrink-0 text-slate-400"
                />
                <span class="font-semibold text-slate-700">
                  {{ document.documentName }}
                </span>
              </div>
            </td>
            <td class="py-2.5 pr-4">
              <span class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {{ document.documentType }}
              </span>
            </td>
            <td class="py-2.5 pr-4 font-mono text-[11px] text-slate-500">
              {{ document.documentNumber ?? '—' }}
            </td>
            <td class="py-2.5 pr-4 text-[11px] text-slate-500">
              {{ document.issuedAt ? formatCmsDate(document.issuedAt) : '—' }}
            </td>
            <td class="py-2.5 pr-4 text-[11px] font-semibold">
              <span :class="expiryClass(document.expiresAt)">
                {{ document.expiresAt ? formatCmsDate(document.expiresAt) : '—' }}
              </span>
            </td>
            <td class="py-2.5 text-right">
              <a
                v-if="document.fileUrl"
                :href="document.fileUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                title="Open document file"
              >
                <UIcon
                  name="i-lucide-download"
                  class="h-3.5 w-3.5"
                />
              </a>
              <span
                v-else
                class="text-[11px] text-slate-300"
              >
                —
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else
      class="mt-3 flex flex-col items-center gap-2 py-6 text-center"
    >
      <UIcon
        name="i-lucide-file-text"
        class="h-6 w-6 text-slate-300"
      />
      <div>
        <p class="text-[11px] font-semibold text-slate-600">
          No legal documents on record
        </p>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Contracts and agreements will appear here once provided.
        </p>
      </div>
    </div>
  </section>
</template>
