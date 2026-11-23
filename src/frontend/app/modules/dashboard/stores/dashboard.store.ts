import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dashboardApi } from '../api/dashboard.api'
import type {
  DashboardSummaryData,
  DashboardFilterParams,
  DashboardBusinessUnitItem,
  DashboardIndustryItem
} from '../types/dashboard.types'

// Import icon lokal yang sudah kita pasang
import totalProjectIcon from '~/assets/icon/total-project.svg'
import totalValueIcon from '~/assets/icon/total-value.svg'
import totalRevenueIcon from '~/assets/icon/total-revenue.svg'
import totalProfitIcon from '~/assets/icon/total-profit.svg'

export const useDashboardStore = defineStore('dashboard', () => {
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  // State raw data dari API
  const businessUnitRaw = ref<DashboardBusinessUnitItem[]>([])
  const industryRaw = ref<DashboardIndustryItem[]>([])

  const summary = ref<DashboardSummaryData>({
    total_projects: 0,
    active_projects: 0,
    total_value_before_tax: 0,
    total_revenue: 0,
    total_net_profit: 0,
    status_counts: []
  })

  // Format Helper Rupiah
  const formatRupiah = (val: number): string => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
  }

  // 1. Computed: 4 Kartu Metrik Utama
  const statCardsData = computed(() => {
    const s = summary.value

    // Perhitungan persen progress & margin
    const completedPct =
      s.total_projects > 0
        ? Math.round(((s.total_projects - s.active_projects) / s.total_projects) * 100)
        : 0
    const marginPct =
      s.total_revenue > 0 ? ((s.total_net_profit / s.total_revenue) * 100).toFixed(1) : '0'

    return [
      {
        title: 'Total Projects',
        value: String(s.total_projects || 0),
        iconSrc: totalProjectIcon,
        badgeText: `↗ ${s.active_projects || 0} Active`,
        subText: `${completedPct}% completed`
      },
      {
        title: 'Total Value (Before Tax)',
        value: formatRupiah(s.total_value_before_tax),
        iconSrc: totalValueIcon,
        badgeText: '↗ +100%',
        subText: 'gross contract'
      },
      {
        title: 'Total Revenue',
        value: formatRupiah(s.total_revenue),
        iconSrc: totalRevenueIcon,
        badgeText: '↗ 100%',
        subText: 'realized to date'
      },
      {
        title: 'Total Net Profit',
        value: formatRupiah(s.total_net_profit),
        iconSrc: totalProfitIcon,
        badgeText: `↗ ${marginPct}%`,
        subText: 'net margin'
      }
    ]
  })

  // 2. Computed: Project Status Slices (Selalu 4 status, jika kosong fallback 0)
  const projectStatusSlices = computed(() => {
    const rawCounts = summary.value.status_counts || []
    const total = summary.value.total_projects || 0

    // Master 4 status wajib
    const requiredStatuses = [
      {
        keyMatch: ['on_going', 'going', 'in_progress'],
        name: 'On Going',
        colorHex: '#2563EB',
        bgClass: 'bg-blue-600'
      },
      {
        keyMatch: ['closed', 'done', 'completed'],
        name: 'Closed',
        colorHex: '#10B981',
        bgClass: 'bg-emerald-500'
      },
      {
        keyMatch: ['on_proposal', 'proposal', 'pipeline'],
        name: 'On Proposal',
        colorHex: '#F59E0B',
        bgClass: 'bg-amber-500'
      },
      {
        keyMatch: ['canceled', 'cancelled'],
        name: 'Canceled',
        colorHex: '#94A3B8',
        bgClass: 'bg-slate-400'
      }
    ]

    return requiredStatuses.map((template) => {
      // Cari apakah status ini ada di respons API
      const found = rawCounts.find((item) => {
        const c = (item.code || '').toLowerCase()
        const n = (item.name || '').toLowerCase()
        return template.keyMatch.some((k) => c.includes(k) || n.includes(k))
      })

      const count = found ? found.count : 0
      const percentage = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0

      return {
        name: template.name,
        count,
        percentage,
        colorHex: template.colorHex,
        bgClass: template.bgClass
      }
    })
  })

  // Helper Format Mata Uang Ringkas: Juta (M), Miliar (B), Triliun (T)
  const formatCompactCurrency = (val: number): string => {
    const num = Number(val) || 0
    if (num <= 0) return 'Rp 0'
    if (num >= 1e12) {
      const formatted = (num / 1e12).toFixed(1).replace(/\.0$/, '')
      return `Rp ${formatted}T`
    }
    if (num >= 1e9) {
      const formatted = (num / 1e9).toFixed(1).replace(/\.0$/, '')
      return `Rp ${formatted}B`
    }
    if (num >= 1e6) {
      const formatted = (num / 1e6).toFixed(1).replace(/\.0$/, '')
      return `Rp ${formatted}M`
    }
    return 'Rp ' + num.toLocaleString('id-ID')
  }

  // Computed: 3 Business Unit Wajib (ITMS, CSD, SI)
  const businessUnitShares = computed(() => {
    const rawList = businessUnitRaw.value || []
    const requiredCodes = ['ITMS', 'CSD', 'SI']
    return requiredCodes.map((code) => {
      const found = rawList.find(
        (item) =>
          (item.code || '').toUpperCase() === code || (item.name || '').toUpperCase() === code
      )
      const amount = found ? found.total_value_before_tax : 0
      return {
        code,
        revenue: formatCompactCurrency(amount)
      }
    })
  })
  // Action Fetch Business Unit
  const fetchProjectsByBusinessUnit = async (params?: DashboardFilterParams) => {
    try {
      const res = await dashboardApi.getProjectsByBusinessUnit(params)
      if (res.success && Array.isArray(res.data)) {
        businessUnitRaw.value = res.data
      }
    } catch (err) {
      console.error('Failed to fetch business unit share:', err)
    }
  }
  // Action: Fetch Summary dari Backend API
  const fetchSummary = async (params?: DashboardFilterParams) => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const res = await dashboardApi.getSummary(params)
      if (res.success && res.data) {
        summary.value = res.data
      }
    } catch (err: any) {
      errorMessage.value =
        err?.response?.data?.message || err?.message || 'Gagal mengambil data summary dashboard'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  // Palet warna untuk list industry (rotasi jika lebih dari 5)
  const industryColors = [
    { colorClass: 'bg-blue-600', barClass: 'bg-blue-600' },
    { colorClass: 'bg-indigo-500', barClass: 'bg-indigo-500' },
    { colorClass: 'bg-cyan-500', barClass: 'bg-cyan-500' },
    { colorClass: 'bg-emerald-500', barClass: 'bg-emerald-500' },
    { colorClass: 'bg-amber-500', barClass: 'bg-amber-500' }
  ]

  // Computed: Projects by Industry (dihitung persen terhadap total value summary)
  const industryList = computed(() => {
    const totalEnterpriseValue = summary.value.total_value_before_tax || 0

    return industryRaw.value.map((item, index) => {
      const palette = industryColors[index % industryColors.length]
      const percentage =
        totalEnterpriseValue > 0
          ? Number(((item.total_value_before_tax / totalEnterpriseValue) * 100).toFixed(1))
          : 0

      return {
        name: item.name,
        projectCount: item.project_count,
        amount: formatRupiah(item.total_value_before_tax),
        percentage,
        colorClass: palette.colorClass,
        barClass: palette.barClass
      }
    })
  })

  // Footnote teks otomatis berdasarkan industri dengan nilai tertinggi
  const topIndustryInsight = computed(() => {
    if (!industryList.value.length) {
      return 'Belum ada data industri yang tercatat.'
    }
    const top = [...industryList.value].sort((a, b) => b.percentage - a.percentage)[0]
    return `${top.name} accounts for the majority of the current enterprise valuation.`
  })

  // Action Fetch Projects by Industry
  const fetchProjectsByIndustry = async (params?: DashboardFilterParams) => {
    try {
      const res = await dashboardApi.getProjectsByIndustry(params)
      if (res.success && Array.isArray(res.data)) {
        industryRaw.value = res.data
      }
    } catch (err) {
      console.error('Failed to fetch projects by industry:', err)
    }
  }

  return {
    summary,
    isLoading,
    errorMessage,
    statCardsData,
    projectStatusSlices,
    fetchSummary,
    businessUnitShares,
    fetchProjectsByBusinessUnit,
    industryList,
    topIndustryInsight,
    fetchProjectsByIndustry
  }
})
