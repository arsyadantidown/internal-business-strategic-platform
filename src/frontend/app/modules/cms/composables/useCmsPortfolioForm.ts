import { reactive, computed } from 'vue'

export function useCmsPortfolioForm() {
  // 1. Reactive Form State (100% cocok dengan CmsPortfolioFormModal.vue)
  const form = reactive({
    // General Information
    project_name: '',
    project_code: '',
    opportunity: '',
    year: '',
    contract_name: '',
    contract_number: '',
    business_unit_id: '',
    project_status_id: '',
    project_manager: '',
    account_manager: '',
    start_date: '',
    end_date: '',
    is_featured: false,

    // Customer Information
    customer: {
      customer_name: '',
      customer_location: '',
      annual_revenue: '',
      industry_id: '',
      company_size_id: '',
      customer_type_id: '',
      legal_structure_id: ''
    },

    // Financial Information
    value_before_tax: 0,
    carry_over_value: 0,
    financial: {
      cogs: 0,
      operational_cost: 0
    },

    // Project Content
    project_objective: '',
    project_description: '',
    project_background: '',
    project_challenges: '',
    project_solution: '',

    // Dynamic Lists & Relations
    success_metrics: [{ success_metric_value: '', success_metric_label: '', sort_order: 0 }],
    product_ids: [] as string[],
    tech_stack_ids: [] as string[],
    partners: [{ partner_id: '', partner_role: 'principal', partner_contribution: '' }],

    // Existing Media Files Metadata from API
    existing_files: [] as any[]
  })

  // 2. Computed Estimated Profit
  const estimatedProfit = computed(() => {
    const revenue = Number(form.value_before_tax) || 0
    const cogs = Number(form.financial.cogs) || 0
    const opex = Number(form.financial.operational_cost) || 0
    return revenue - (cogs + opex)
  })

  // 3. Mapper / Adapter: Mengisi form dari data Store / API
  const populateFormFromStore = (data: any) => {
    if (!data) return

    // 1. General & Status Information
    form.project_name = data.project_name || ''
    form.project_code = data.project_code || ''
    form.opportunity = data.opportunity || ''
    form.year = data.year ? String(data.year) : ''
    form.contract_name = data.contract_name || ''
    form.contract_number = data.contract_number || ''
    form.business_unit_id = data.business_unit?.id || data.business_unit_id || ''
    form.project_status_id = data.project_status?.id || data.project_status_id || ''
    form.project_manager = data.project_manager || ''
    form.account_manager = data.account_manager || ''
    form.start_date = data.start_date ? data.start_date.substring(0, 10) : ''
    form.end_date = data.end_date ? data.end_date.substring(0, 10) : ''
    form.is_featured = Boolean(data.is_featured)

    // 2. Customer Information
    const cust = data.customer || {}
    form.customer.customer_name = cust.customer_name || ''
    form.customer.customer_location = cust.customer_location || ''
    form.customer.annual_revenue = cust.annual_revenue || ''
    form.customer.industry_id = cust.industry?.id || cust.industry_id || ''
    form.customer.company_size_id = cust.company_size?.id || cust.company_size_id || ''
    form.customer.customer_type_id = cust.customer_type?.id || cust.customer_type_id || ''
    form.customer.legal_structure_id = cust.legal_structure?.id || cust.legal_structure_id || ''

    // 3. Financial Information
    const fin = data.financial || {}
    form.value_before_tax = Number(data.value_before_tax ?? fin.value_before_tax ?? 0)
    form.carry_over_value = Number(data.carry_over_value ?? fin.carry_over_value ?? 0)
    form.financial.cogs = Number(fin.cogs ?? 0)
    form.financial.operational_cost = Number(fin.operational_cost ?? 0)

    // 4. Project Content
    form.project_objective = data.project_objective || ''
    form.project_description = data.project_description || ''
    form.project_background = data.project_background || ''
    form.project_challenges = data.project_challenges || ''
    form.project_solution = data.project_solution || ''

    // 5. Success Metrics
    if (Array.isArray(data.success_metrics) && data.success_metrics.length > 0) {
      form.success_metrics = data.success_metrics.map((sm: any) => ({
        success_metric_value: sm.success_metric_value || sm.value || '',
        success_metric_label: sm.success_metric_label || sm.label || '',
        sort_order: sm.sort_order ?? 0
      }))
    } else {
      form.success_metrics = [{ success_metric_value: '', success_metric_label: '', sort_order: 0 }]
    }

    // 6. Products (IDs)
    form.product_ids = Array.isArray(data.products)
      ? data.products.map((p: any) => (typeof p === 'object' ? p.id : p))
      : []

    // 6. Tech Stacks (IDs) - Tangani jika array ATAU jika berbentuk object kategori (frontend, backend, data_storage)
    const extractedTechIds: string[] = []
    if (Array.isArray(data.tech_stacks)) {
      extractedTechIds.push(...data.tech_stacks.map((t: any) => (typeof t === 'object' ? t.id : t)))
    } else if (data.tech_stacks && typeof data.tech_stacks === 'object') {
      const { frontend, backend, data_storage } = data.tech_stacks
      if (Array.isArray(frontend)) {
        extractedTechIds.push(...frontend.map((t: any) => t.id || t))
      }
      if (Array.isArray(backend)) {
        extractedTechIds.push(...backend.map((t: any) => t.id || t))
      }
      if (Array.isArray(data_storage)) {
        extractedTechIds.push(...data_storage.map((t: any) => t.id || t))
      }
    }
    form.tech_stack_ids = extractedTechIds

    // Partners
    if (Array.isArray(data.partners) && data.partners.length > 0) {
      form.partners = data.partners.map((pt: any) => ({
        partner_id: pt.partner_id || pt.partner?.id || '',
        partner_role: pt.partner_role || 'principal',
        partner_contribution: pt.partner_contribution || ''
      }))
    } else {
      form.partners = [{ partner_id: '', partner_role: 'principal', partner_contribution: '' }]
    }

    // Files metadata
    if (Array.isArray(data.files)) {
      form.existing_files = data.files
    }
  }

  // 4. Dynamic Array Handlers
  const addPartner = () => {
    form.partners.push({
      partner_id: '',
      partner_role: 'principal',
      partner_contribution: ''
    })
  }

  const removePartner = (index: number) => {
    if (form.partners.length > 1) {
      form.partners.splice(index, 1)
    }
  }

  const addSuccessMetric = () => {
    form.success_metrics.push({
      success_metric_value: '',
      success_metric_label: '',
      sort_order: form.success_metrics.length
    })
  }

  const removeSuccessMetric = (index: number) => {
    if (form.success_metrics.length > 1) {
      form.success_metrics.splice(index, 1)
    }
  }

  return {
    form,
    estimatedProfit,
    populateFormFromStore,
    addPartner,
    removePartner,
    addSuccessMetric,
    removeSuccessMetric
  }
}
