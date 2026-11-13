<script setup lang="ts">
import { computed } from 'vue'
import { formatCmsCurrency } from '~/modules/cms/utils/cmsFormat'
import type { TechTaskDetail } from '../../types/tech-task.types'

const props = defineProps<{
  detail: TechTaskDetail
}>()

const partnerRoleLabel = (role: string) =>
  role.charAt(0).toUpperCase() + role.slice(1)

const identityRows = computed(() => {
  const rows: Array<{ label: string, value: string }> = []

  if (props.detail.businessUnit) {
    rows.push({ label: 'Business unit', value: props.detail.businessUnit.name })
  }
  if (props.detail.customer?.customerName || props.detail.customerName) {
    rows.push({ label: 'Customer', value: props.detail.customer?.customerName ?? props.detail.customerName ?? '—' })
  }
  if (props.detail.customer?.industry) {
    rows.push({ label: 'Industry', value: props.detail.customer.industry.name })
  }
  if (props.detail.opportunity) {
    rows.push({ label: 'Opportunity', value: props.detail.opportunity })
  }

  return rows
})

const productNames = computed(() =>
  props.detail.products.map(product => product.name)
)
</script>

<template>
  <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
    <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon
          name="i-lucide-briefcase"
          class="h-3.5 w-3.5"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-bold tracking-tight text-slate-900">
          Related Project & Portfolio
        </h3>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Portfolio project this technical work belongs to
        </p>
      </div>
      <a
        :href="`/portofolio/${detail.id}`"
        target="_blank"
        class="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
      >
        <UIcon
          name="i-lucide-external-link"
          class="h-3 w-3"
        />
        <span>Portfolio</span>
      </a>
    </div>

    <div class="mt-3 space-y-3">
      <dl class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div
          v-for="row in identityRows"
          :key="row.label"
          class="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2"
        >
          <dt class="text-[10px] font-semibold text-slate-400 uppercase">
            {{ row.label }}
          </dt>
          <dd class="mt-0.5 text-xs font-semibold text-slate-700">
            {{ row.value }}
          </dd>
        </div>

        <div
          v-if="detail.valueBeforeTax"
          class="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2"
        >
          <dt class="text-[10px] font-semibold text-slate-400 uppercase">
            Project value
          </dt>
          <dd class="mt-0.5 text-xs font-semibold text-slate-700">
            {{ formatCmsCurrency(detail.valueBeforeTax) }}
          </dd>
        </div>
      </dl>

      <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div
          v-if="productNames.length"
          class="rounded-lg border border-slate-100 bg-slate-50/70 p-3"
        >
          <p class="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
            <UIcon
              name="i-lucide-package"
              class="h-3.5 w-3.5 text-slate-500"
            />
            Products
          </p>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="name in productNames"
              :key="name"
              class="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600"
            >
              {{ name }}
            </span>
          </div>
        </div>

        <div
          v-if="detail.partners.length"
          class="rounded-lg border border-slate-100 bg-slate-50/70 p-3"
        >
          <p class="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
            <UIcon
              name="i-lucide-handshake"
              class="h-3.5 w-3.5 text-slate-500"
            />
            Partners
          </p>
          <ul class="mt-2 space-y-1.5">
            <li
              v-for="partner in detail.partners"
              :key="`${partner.partnerId}-${partner.partnerRole}`"
              class="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600"
            >
              <span class="font-semibold text-slate-700">
                {{ partner.partnerName }}
              </span>
              <span class="inline-flex items-center rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 uppercase">
                {{ partnerRoleLabel(partner.partnerRole) }}
              </span>
              <span
                v-if="partner.partnerContribution"
                class="text-slate-400"
              >
                {{ partner.partnerContribution }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
