<script setup lang="ts">
interface EnablementItem {
  id: string
  title: string
  date: string
  status: 'Completed' | 'Planned'
  note: string
}

const knowledgeEnablement: EnablementItem[] = [
  { id: 'ke-1', title: 'Cloud Architecture Workshop', date: '2026-03-12', status: 'Completed', note: 'Intro to GCP architecture and best practices.' },
  { id: 'ke-2', title: 'Data & Analytics Training', date: '2026-06-18', status: 'Completed', note: 'BigQuery, Looker, and data pipelines.' }
]

const salesEnablement: EnablementItem[] = [
  { id: 'se-1', title: 'Partner Sales Playbook Session', date: '2026-04-05', status: 'Completed', note: 'Joint sales approach and ICP alignment.' },
  { id: 'se-2', title: 'Q4 Joint Pipeline Review', date: '2026-11-10', status: 'Planned', note: 'Review opportunities and next steps.' }
]

const marketingEnablement: EnablementItem[] = [
  { id: 'me-1', title: 'Co-Branded Content Planning', date: '2026-05-20', status: 'Completed', note: 'Defined topics for blog and social posts.' }
]

const coMarketingHistory: EnablementItem[] = [
  { id: 'cm-1', title: 'Webinar: AI in Enterprise', date: '2026-07-15', status: 'Completed', note: 'Co-hosted webinar with 150+ registrants.' },
  { id: 'cm-2', title: 'Joint Booth at Tech Expo', date: '2026-10-08', status: 'Completed', note: 'Co-marketing booth with lead capture.' },
  { id: 'cm-3', title: 'Industry Report Co-Publishing', date: '2027-01-12', status: 'Planned', note: 'Planned co-authored industry report.' }
]

const getStatusClass = (status: EnablementItem['status']) => {
  if (status === 'Completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}
</script>

<template>
  <div class="space-y-4">
    <section class="rounded-xl border border-slate-200 bg-white shadow-2xs">
      <header class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UIcon name="i-lucide-book-open" class="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Knowledge Enablement</h3>
            <p class="text-[11px] text-slate-500">Training and knowledge sharing activities</p>
          </div>
        </div>
      </header>
      <div class="divide-y divide-slate-100">
        <div v-for="item in knowledgeEnablement" :key="item.id" class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900">{{ item.title }}</p>
            <p class="text-xs text-slate-500">{{ item.note }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">{{ item.date }}</span>
            <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium" :class="getStatusClass(item.status)">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white shadow-2xs">
      <header class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <UIcon name="i-lucide-briefcase" class="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Sales Enablement</h3>
            <p class="text-[11px] text-slate-500">Sales support and joint go-to-market activities</p>
          </div>
        </div>
      </header>
      <div class="divide-y divide-slate-100">
        <div v-for="item in salesEnablement" :key="item.id" class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900">{{ item.title }}</p>
            <p class="text-xs text-slate-500">{{ item.note }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">{{ item.date }}</span>
            <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium" :class="getStatusClass(item.status)">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white shadow-2xs">
      <header class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <UIcon name="i-lucide-megaphone" class="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Marketing Enablement</h3>
            <p class="text-[11px] text-slate-500">Marketing materials and enablement</p>
          </div>
        </div>
      </header>
      <div class="divide-y divide-slate-100">
        <div v-for="item in marketingEnablement" :key="item.id" class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900">{{ item.title }}</p>
            <p class="text-xs text-slate-500">{{ item.note }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">{{ item.date }}</span>
            <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium" :class="getStatusClass(item.status)">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white shadow-2xs">
      <header class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <UIcon name="i-lucide-handshake" class="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Co-Marketing History</h3>
            <p class="text-[11px] text-slate-500">Joint marketing activities and campaigns</p>
          </div>
        </div>
      </header>
      <div class="divide-y divide-slate-100">
        <div v-for="item in coMarketingHistory" :key="item.id" class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900">{{ item.title }}</p>
            <p class="text-xs text-slate-500">{{ item.note }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">{{ item.date }}</span>
            <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium" :class="getStatusClass(item.status)">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
