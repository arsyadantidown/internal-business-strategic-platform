<script setup lang="ts">
import type { CmsContent } from '../../types/cms.types'
import {
  formatCmsCurrency,
  formatCmsDate,
  formatCmsDateTime,
  formatCmsScheduledAt,
  getCmsInitials,
  renderCmsRichText
} from '../../utils/cmsFormat'
import CmsStatusBadge from '../cms-list/CmsStatusBadge.vue'
import CmsDetailSection from './CmsDetailSection.vue'
import CmsDetailItem from './CmsDetailItem.vue'

interface Props {
  isOpen: boolean
  content: CmsContent | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', content: CmsContent): void
}>()
</script>

<template>
  <div
    v-if="isOpen && content"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 py-8 font-sans backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
      <div class="flex items-start justify-between border-b border-slate-100 px-6 py-4">
        <div class="flex items-start gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UIcon
              :name="content.kind === 'portfolio' ? 'i-lucide-briefcase' : 'i-lucide-handshake'"
              class="h-4 w-4"
            />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {{ content.kind === 'portfolio' ? 'Portfolio' : 'Partnership' }} Detail · {{ content.id }}
            </p>
            <h2 class="mt-0.5 max-w-md text-sm font-bold leading-5 tracking-tight text-slate-900">
              {{ content.title }}
            </h2>
          </div>
        </div>

        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          aria-label="Close"
          @click="emit('close')"
        >
          <UIcon
            name="i-lucide-x"
            class="h-4 w-4"
          />
        </button>
      </div>

      <div class="max-h-[70vh] overflow-y-auto px-6 py-5">
        <div class="flex flex-wrap items-center gap-2">
          <CmsStatusBadge :status="content.status" />
          <span
            class="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold"
            :class="
              content.kind === 'portfolio'
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-violet-200 bg-violet-50 text-violet-700'
            "
          >
            {{ content.kind === 'portfolio' ? 'Portfolio Content' : 'Partnership Content' }}
          </span>
          <span class="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {{ content.visibility }}
          </span>
          <span
            v-if="content.featured"
            class="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
          >
            <UIcon
              name="i-lucide-star"
              class="h-3 w-3"
            />
            Featured
          </span>
        </div>

        <p class="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs leading-relaxed text-slate-600">
          {{ content.summary }}
        </p>

        <CmsDetailSection
          title="Publish Information"
          icon="i-lucide-send"
        >
          <div class="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5">
            <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Author
            </p>
            <div class="mt-1 flex items-center gap-2">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-700">
                {{ getCmsInitials(content.author) }}
              </span>
              <span class="text-[11px] font-semibold text-slate-700">
                {{ content.author }}
              </span>
            </div>
          </div>
          <CmsDetailItem
            label="Publication Date"
            :value="formatCmsDate(content.publishedAt)"
          />
          <CmsDetailItem
            v-if="content.status === 'Scheduled' && content.scheduledAt"
            label="Scheduled For"
            :value="formatCmsScheduledAt(content.scheduledAt)"
          />
          <CmsDetailItem
            label="Created At"
            :value="formatCmsDateTime(content.createdAt)"
          />
          <CmsDetailItem
            label="Last Updated"
            :value="formatCmsDateTime(content.updatedAt)"
          />
          <CmsDetailItem
            label="Slug"
            :value="content.slug"
          />
          <CmsDetailItem
            label="SEO Title"
            :value="content.seoTitle"
            full
          />
          <CmsDetailItem
            label="SEO Description"
            :value="content.seoDescription"
            full
          />
        </CmsDetailSection>

        <template v-if="content.kind === 'portfolio'">
          <CmsDetailSection
            title="Project Information"
            icon="i-lucide-info"
          >
            <CmsDetailItem
              label="Project Type"
              :value="content.projectType"
            />
            <CmsDetailItem
              label="Service Type"
              :value="content.serviceType"
            />
            <CmsDetailItem
              label="Industry"
              :value="content.industry"
            />
            <CmsDetailItem
              label="Project Status"
              :value="content.projectStatus"
            />
            <CmsDetailItem
              label="Start Date"
              :value="formatCmsDate(content.startDate)"
            />
            <CmsDetailItem
              label="End Date"
              :value="formatCmsDate(content.endDate)"
            />
            <CmsDetailItem
              label="Location"
              :value="content.location"
            />
            <CmsDetailItem
              label="Team Size"
              :value="content.teamSize"
            />
          </CmsDetailSection>

          <CmsDetailSection
            title="Customer Information"
            icon="i-lucide-building-2"
          >
            <CmsDetailItem
              label="Client"
              :value="content.client"
            />
            <CmsDetailItem
              label="Client Industry"
              :value="content.clientIndustry"
            />
            <CmsDetailItem
              label="Client Location"
              :value="content.clientLocation"
            />
            <CmsDetailItem
              label="Contact Name"
              :value="content.contactName"
            />
            <CmsDetailItem
              label="Contact Email"
              :value="content.contactEmail"
              full
            />
          </CmsDetailSection>

          <CmsDetailSection
            title="Financial Information"
            icon="i-lucide-wallet"
          >
            <CmsDetailItem
              label="Project Value"
              :value="formatCmsCurrency(content.projectValue, content.currency)"
            />
            <CmsDetailItem
              label="Funding Type"
              :value="content.fundingType"
            />
          </CmsDetailSection>

          <CmsDetailSection
            title="Project Content"
            icon="i-lucide-align-left"
          >
            <div class="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5 sm:col-span-2">
              <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Overview
              </p>
              <div
                v-if="content.overview"
                data-cms-rich-text
                class="mt-1 text-[11px] leading-5 text-slate-700"
                v-html="renderCmsRichText(content.overview)"
              />
              <p
                v-else
                class="mt-1 text-[11px] text-slate-400"
              >
                —
              </p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5 sm:col-span-2">
              <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Background
              </p>
              <div
                v-if="content.background"
                data-cms-rich-text
                class="mt-1 text-[11px] leading-5 text-slate-700"
                v-html="renderCmsRichText(content.background)"
              />
              <p
                v-else
                class="mt-1 text-[11px] text-slate-400"
              >
                —
              </p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5">
              <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Challenges
              </p>
              <ul
                v-if="content.challenges.length > 0"
                class="mt-1.5 space-y-1"
              >
                <li
                  v-for="challenge in content.challenges"
                  :key="challenge"
                  class="flex items-start gap-1.5 text-[11px] leading-5 text-slate-700"
                >
                  <UIcon
                    name="i-lucide-circle-alert"
                    class="mt-0.5 h-3 w-3 shrink-0 text-amber-500"
                  />
                  {{ challenge }}
                </li>
              </ul>
              <p
                v-else
                class="mt-1 text-[11px] text-slate-400"
              >
                No challenges recorded.
              </p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5">
              <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Solutions
              </p>
              <ul
                v-if="content.solutions.length > 0"
                class="mt-1.5 space-y-1"
              >
                <li
                  v-for="solution in content.solutions"
                  :key="solution"
                  class="flex items-start gap-1.5 text-[11px] leading-5 text-slate-700"
                >
                  <UIcon
                    name="i-lucide-circle-check"
                    class="mt-0.5 h-3 w-3 shrink-0 text-emerald-500"
                  />
                  {{ solution }}
                </li>
              </ul>
              <p
                v-else
                class="mt-1 text-[11px] text-slate-400"
              >
                No solutions recorded.
              </p>
            </div>
          </CmsDetailSection>

          <CmsDetailSection
            title="Media & Documents"
            icon="i-lucide-image"
          >
            <div
              v-if="content.image"
              class="overflow-hidden rounded-lg border border-slate-100 sm:col-span-2"
            >
              <img
                :src="content.image"
                alt="Portfolio cover"
                class="h-40 w-full object-cover"
              >
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5 sm:col-span-2">
              <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Documents
              </p>
              <div
                v-if="content.documents.length > 0"
                class="mt-1.5 space-y-1.5"
              >
                <div
                  v-for="document in content.documents"
                  :key="`${document.name}-${document.size}`"
                  class="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-white px-2.5 py-1.5"
                >
                  <div class="flex min-w-0 items-center gap-1.5">
                    <UIcon
                      name="i-lucide-file-text"
                      class="h-3.5 w-3.5 shrink-0 text-slate-400"
                    />
                    <span class="truncate text-[11px] font-medium text-slate-700">{{ document.name }}</span>
                  </div>
                  <span class="shrink-0 text-[10px] text-slate-400">{{ document.type }} · {{ document.size }}</span>
                </div>
              </div>
              <p
                v-else
                class="mt-1 text-[11px] text-slate-400"
              >
                No documents attached.
              </p>
            </div>
          </CmsDetailSection>

          <CmsDetailSection
            title="Technology Stack"
            icon="i-lucide-cpu"
          >
            <div class="flex flex-wrap gap-1.5 sm:col-span-2">
              <span
                v-for="technology in content.technologies"
                :key="technology"
                class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700"
              >
                {{ technology }}
              </span>
              <span
                v-if="content.technologies.length === 0"
                class="text-[11px] text-slate-400"
              >
                No technologies recorded.
              </span>
            </div>
          </CmsDetailSection>

          <CmsDetailSection
            title="Related Partners"
            icon="i-lucide-handshake"
          >
            <div
              v-if="content.partners.length > 0"
              class="space-y-1.5 sm:col-span-2"
            >
              <div
                v-for="partner in content.partners"
                :key="partner.name"
                class="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/40 px-3 py-2"
              >
                <div class="min-w-0">
                  <p class="truncate text-[11px] font-semibold text-slate-700">
                    {{ partner.name }}
                  </p>
                  <p class="text-[10px] text-slate-400">
                    {{ partner.role }}
                  </p>
                </div>
                <span class="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                  {{ partner.tag }}
                </span>
              </div>
            </div>
            <p
              v-else
              class="text-[11px] text-slate-400 sm:col-span-2"
            >
              No related partners recorded.
            </p>
          </CmsDetailSection>
        </template>

        <template v-else>
          <CmsDetailSection
            title="Partner Information"
            icon="i-lucide-info"
          >
            <CmsDetailItem
              label="Category"
              :value="content.category"
            />
            <CmsDetailItem
              label="Partner Type"
              :value="content.partnerType"
            />
            <CmsDetailItem
              label="Industry"
              :value="content.industry"
            />
            <CmsDetailItem
              label="Location"
              :value="content.location"
            />
            <CmsDetailItem
              label="Website"
              :value="content.website"
              full
            />
          </CmsDetailSection>

          <CmsDetailSection
            title="Expertise & Solutions"
            icon="i-lucide-sparkles"
          >
            <div class="flex flex-wrap gap-1.5 sm:col-span-2">
              <span
                v-for="expertise in content.expertise"
                :key="expertise"
                class="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700"
              >
                {{ expertise }}
              </span>
              <span
                v-if="content.expertise.length === 0"
                class="text-[11px] text-slate-400"
              >
                No expertise recorded.
              </span>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5 sm:col-span-2">
              <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Solutions
              </p>
              <ul
                v-if="content.solutions.length > 0"
                class="mt-1.5 space-y-1"
              >
                <li
                  v-for="solution in content.solutions"
                  :key="solution"
                  class="flex items-start gap-1.5 text-[11px] leading-5 text-slate-700"
                >
                  <UIcon
                    name="i-lucide-circle-check"
                    class="mt-0.5 h-3 w-3 shrink-0 text-emerald-500"
                  />
                  {{ solution }}
                </li>
              </ul>
              <p
                v-else
                class="mt-1 text-[11px] text-slate-400"
              >
                No solutions recorded.
              </p>
            </div>
          </CmsDetailSection>

          <CmsDetailSection
            title="Partnership Content"
            icon="i-lucide-align-left"
          >
            <div class="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5 sm:col-span-2">
              <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Overview
              </p>
              <div
                v-if="content.overview"
                data-cms-rich-text
                class="mt-1 text-[11px] leading-5 text-slate-700"
                v-html="renderCmsRichText(content.overview)"
              />
              <p
                v-else
                class="mt-1 text-[11px] text-slate-400"
              >
                —
              </p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5 sm:col-span-2">
              <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Collaboration Scope
              </p>
              <div
                v-if="content.collaborationScope"
                data-cms-rich-text
                class="mt-1 text-[11px] leading-5 text-slate-700"
                v-html="renderCmsRichText(content.collaborationScope)"
              />
              <p
                v-else
                class="mt-1 text-[11px] text-slate-400"
              >
                —
              </p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5 sm:col-span-2">
              <p class="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Benefits
              </p>
              <ul
                v-if="content.benefits.length > 0"
                class="mt-1.5 space-y-1"
              >
                <li
                  v-for="benefit in content.benefits"
                  :key="benefit"
                  class="flex items-start gap-1.5 text-[11px] leading-5 text-slate-700"
                >
                  <UIcon
                    name="i-lucide-circle-check"
                    class="mt-0.5 h-3 w-3 shrink-0 text-emerald-500"
                  />
                  {{ benefit }}
                </li>
              </ul>
              <p
                v-else
                class="mt-1 text-[11px] text-slate-400"
              >
                No benefits recorded.
              </p>
            </div>
          </CmsDetailSection>

          <CmsDetailSection
            title="Brand Asset"
            icon="i-lucide-image"
          >
            <div
              v-if="content.logo"
              class="overflow-hidden rounded-lg border border-slate-100 sm:col-span-2"
            >
              <img
                :src="content.logo"
                alt="Partner logo"
                class="h-32 w-full object-cover"
              >
            </div>
            <p
              v-else
              class="text-[11px] text-slate-400 sm:col-span-2"
            >
              No logo available.
            </p>
          </CmsDetailSection>

          <CmsDetailSection
            title="Related Portfolio"
            icon="i-lucide-briefcase"
          >
            <div class="flex flex-wrap gap-1.5 sm:col-span-2">
              <span
                v-for="portfolioTitle in content.relatedPortfolio"
                :key="portfolioTitle"
                class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700"
              >
                {{ portfolioTitle }}
              </span>
              <span
                v-if="content.relatedPortfolio.length === 0"
                class="text-[11px] text-slate-400"
              >
                No related portfolio recorded.
              </span>
            </div>
          </CmsDetailSection>
        </template>
      </div>

      <div class="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
        <button
          type="button"
          class="inline-flex h-9 min-w-24 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
          @click="emit('close')"
        >
          Close
        </button>

        <button
          type="button"
          class="inline-flex h-9 min-w-28 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
          @click="emit('edit', content)"
        >
          <UIcon
            name="i-lucide-pencil"
            class="h-3.5 w-3.5"
          />
          Edit Content
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
[data-cms-rich-text] :deep(p) {
  margin: 0.25rem 0;
}

[data-cms-rich-text] :deep(h2) {
  margin: 0.55rem 0 0.3rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-slate-900);
}

[data-cms-rich-text] :deep(h3) {
  margin: 0.45rem 0 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-slate-900);
}

[data-cms-rich-text] :deep(ul) {
  margin: 0.25rem 0;
  padding-left: 1rem;
  list-style: disc;
}

[data-cms-rich-text] :deep(ol) {
  margin: 0.25rem 0;
  padding-left: 1rem;
  list-style: decimal;
}

[data-cms-rich-text] :deep(blockquote) {
  margin: 0.35rem 0;
  border-left: 2px solid var(--color-slate-300);
  padding-left: 0.65rem;
  color: var(--color-slate-500);
}

[data-cms-rich-text] :deep(a) {
  color: var(--color-blue-600);
  text-decoration: underline;
}
</style>
