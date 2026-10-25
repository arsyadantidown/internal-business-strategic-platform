<script setup lang="ts">
import type { CmsContent, CmsContentKind } from '../../types/cms.types'
import { formatCmsDate, formatCmsScheduledAt, formatCmsTime, getCmsInitials } from '../../utils/cmsFormat'
import CmsStatusBadge from './CmsStatusBadge.vue'

interface Props {
  contents: CmsContent[]
  kind: CmsContentKind
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'view' | 'edit' | 'delete', content: CmsContent): void
}>()

const avatarPalette = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700'
]

const avatarClass = (name: string) => {
  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0)
  return avatarPalette[hash % avatarPalette.length]
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[860px] border-collapse text-left text-xs">
      <thead class="border-b border-slate-100 bg-slate-50/75">
        <tr class="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          <th class="py-2.5 pl-4 pr-3">
            Content
          </th>
          <th class="px-3 py-2.5">
            {{ kind === 'portfolio' ? 'Client / Industry' : 'Category / Partner Type' }}
          </th>
          <th class="px-3 py-2.5">
            Author
          </th>
          <th class="px-3 py-2.5">
            Updated
          </th>
          <th class="px-3 py-2.5">
            Status
          </th>
          <th class="py-2.5 pl-3 pr-4 text-right">
            Actions
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr
          v-for="content in contents"
          :key="content.id"
          class="transition-colors hover:bg-slate-50/70"
        >
          <td class="py-2.5 pl-4 pr-3">
            <p
              class="max-w-[320px] truncate text-xs font-semibold text-slate-900"
              :title="content.title"
            >
              {{ content.title }}
            </p>
            <p
              class="mt-0.5 max-w-[320px] truncate text-[10px] font-medium text-slate-400"
              :title="content.summary"
            >
              {{ content.summary }}
            </p>
          </td>

          <td class="px-3 py-2.5">
            <template v-if="content.kind === 'portfolio'">
              <p class="max-w-[190px] truncate text-[11px] font-semibold text-slate-700">
                {{ content.client }}
              </p>
              <p class="mt-0.5 max-w-[190px] truncate text-[10px] font-medium text-slate-400">
                {{ content.industry }} · {{ content.projectStatus }}
              </p>
            </template>
            <template v-else>
              <span class="inline-flex items-center rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                {{ content.category }}
              </span>
              <p class="mt-1 max-w-[190px] truncate text-[10px] font-medium text-slate-400">
                {{ content.partnerType }} · {{ content.industry }}
              </p>
            </template>
          </td>

          <td class="whitespace-nowrap px-3 py-2.5">
            <div class="flex items-center gap-1.5">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                :class="avatarClass(content.author)"
              >
                {{ getCmsInitials(content.author) }}
              </span>
              <span
                class="max-w-[120px] truncate text-[11px] font-medium text-slate-600"
                :title="content.author"
              >
                {{ content.author }}
              </span>
            </div>
          </td>

          <td class="whitespace-nowrap px-3 py-2.5">
            <p class="text-[11px] font-semibold text-slate-600">
              {{ formatCmsDate(content.updatedAt) }}
            </p>
            <p class="text-[10px] font-medium text-slate-400">
              {{ formatCmsTime(content.updatedAt) }}
            </p>
          </td>

          <td class="whitespace-nowrap px-3 py-2.5">
            <CmsStatusBadge :status="content.status" />
            <p
              v-if="content.status === 'Scheduled' && content.scheduledAt"
              class="mt-1 text-[10px] font-medium text-sky-600"
            >
              {{ formatCmsScheduledAt(content.scheduledAt) }}
            </p>
          </td>

          <td class="whitespace-nowrap py-2.5 pl-3 pr-4 text-right">
            <div class="inline-flex items-center gap-0.5">
              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                title="View content"
                aria-label="View content"
                @click="emit('view', content)"
              >
                <UIcon
                  name="i-lucide-eye"
                  class="h-3.5 w-3.5"
                />
              </button>

              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600 cursor-pointer"
                title="Edit content"
                aria-label="Edit content"
                @click="emit('edit', content)"
              >
                <UIcon
                  name="i-lucide-pencil"
                  class="h-3.5 w-3.5"
                />
              </button>

              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                title="Delete content"
                aria-label="Delete content"
                @click="emit('delete', content)"
              >
                <UIcon
                  name="i-lucide-trash-2"
                  class="h-3.5 w-3.5"
                />
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="contents.length === 0">
          <td
            colspan="6"
            class="px-6 py-10 text-center"
          >
            <div class="flex flex-col items-center gap-2">
              <UIcon
                name="i-lucide-search-x"
                class="h-8 w-8 text-slate-300"
              />
              <p class="text-sm font-semibold text-slate-600">
                No {{ kind }} content found
              </p>
              <p class="text-xs text-slate-400">
                Try adjusting your search or status filter.
              </p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
