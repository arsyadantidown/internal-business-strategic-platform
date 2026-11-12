import { ref, reactive, computed, onMounted } from 'vue'
import { projectApi } from '../api/project.api'
import type {
  ProjectCreatePayload,
  ProjectPartnerInput,
  SuccessMetricInput,
  LocalProjectFile
} from '../types/project.types'

export function useCmsPortfolioAdd() {
  const toast = useToast()

  // 1. Loading States
  const isLoadingOptions = ref(false)
  const isSubmitting = ref(false)
  const submitProgressText = ref('')

  // 2. Options Data (dari Backend API)
  const businessUnitOptions = ref<{ label: string; value: string }[]>([])
  const projectStatusOptions = ref<{ label: string; value: string }[]>([])
  const industryOptions = ref<{ label: string; value: string }[]>([])
  const companySizeOptions = ref<{ label: string; value: string }[]>([])
  const customerTypeOptions = ref<{ label: string; value: string }[]>([])
  const legalStructureOptions = ref<{ label: string; value: string }[]>([])
  const productOptions = ref<{ label: string; value: string }[]>([])
  const techStackOptions = ref<{ label: string; value: string }[]>([])
  const partnerOptions = ref<{ label: string; value: string }[]>([])

  // 3. Form State Utama (Cocok dengan ProjectCreatePayload)
  const form = reactive({
    // Section 1: Project Information
    project_code: '',
    project_name: '',
    opportunity: '',
    year: new Date().getFullYear(),
    business_unit_id: '',
    project_status_id: '',

    // Section 2: Customer Information
    customer: {
      customer_name: '',
      customer_location: '',
      annual_revenue: '',
      industry_id: '',
      company_size_id: '',
      customer_type_id: '',
      legal_structure_id: ''
    },

    // Section 3: Contract & Governance
    contract_name: '',
    contract_number: '',
    start_date: '',
    end_date: '',
    project_manager: '',
    account_manager: '',

    // Section 4: Financial Information
    value_before_tax: 0,
    carry_over_value: 0,
    financial: {
      cogs: 0,
      operational_cost: 0
    },

    // Section 5: Project Content
    project_objective: '',
    project_description: '',
    project_background: '',
    project_challenges: '',
    project_solution: '',

    // Section 6: Relations
    product_ids: [] as string[],
    tech_stack_ids: [] as string[],
    partners: [] as ProjectPartnerInput[],
    success_metrics: [] as SuccessMetricInput[],

    // Section 8: Publish Settings
    is_featured: false
  })

  // 4. File States (Lokal sebelum di-POST ke backend)
  const featuredCover = ref<LocalProjectFile | null>(null)
  const galleryFiles = ref<LocalProjectFile[]>([])
  const caseStudyFile = ref<LocalProjectFile | null>(null)
  const supportingDocuments = ref<LocalProjectFile[]>([])

  // Helper Profit Otomatis (Display Only)
  const estimatedProfit = computed(() => {
    const revenue = Number(form.value_before_tax) || 0
    const cogs = Number(form.financial.cogs) || 0
    const opex = Number(form.financial.operational_cost) || 0
    return revenue - (cogs + opex)
  })

  // 5. Success Metrics Repeater Actions
  const addSuccessMetric = () => {
    form.success_metrics.push({
      success_metric_value: '',
      success_metric_label: '',
      sort_order: form.success_metrics.length
    })
  }

  const removeSuccessMetric = (index: number) => {
    form.success_metrics.splice(index, 1)
  }

  // 6. Partners Repeater Actions
  const addPartner = () => {
    form.partners.push({
      partner_id: '',
      partner_role: 'principal',
      partner_contribution: ''
    })
  }

  const removePartner = (index: number) => {
    form.partners.splice(index, 1)
  }

  // 7. Load Semua Dropdown Sekaligus
  const loadOptions = async () => {
    isLoadingOptions.value = true
    try {
      const [buRes, statusRes, indRes, sizeRes, custTypeRes, legalRes, prodRes, techRes, partRes] =
        await Promise.all([
          projectApi.getMasterData('business-units'),
          projectApi.getMasterData('project-statuses'),
          projectApi.getMasterData('industries'),
          projectApi.getMasterData('company-sizes'),
          projectApi.getMasterData('customer-types'),
          projectApi.getMasterData('legal-structures'),
          projectApi.getProducts(),
          projectApi.getTechStacks(),
          projectApi.getPartners()
        ])

      businessUnitOptions.value = buRes.map((i: any) => ({
        label: i.business_unit_name || i.name,
        value: i.id
      }))
      projectStatusOptions.value = statusRes.map((i: any) => ({
        label: i.project_status_name || i.name,
        value: i.id
      }))
      industryOptions.value = indRes.map((i: any) => ({
        label: i.industry_name || i.name,
        value: i.id
      }))
      companySizeOptions.value = sizeRes.map((i: any) => ({
        label: i.company_size_name || i.name,
        value: i.id
      }))
      customerTypeOptions.value = custTypeRes.map((i: any) => ({
        label: i.customer_type_name || i.name,
        value: i.id
      }))
      legalStructureOptions.value = legalRes.map((i: any) => ({
        label: i.legal_structure_name || i.name,
        value: i.id
      }))
      productOptions.value = prodRes.map((i: any) => ({
        label: i.product_name || i.name,
        value: i.id
      }))
      techStackOptions.value = techRes.map((i: any) => ({
        label: i.tech_stack_name || i.name,
        value: i.id
      }))
      partnerOptions.value = partRes.map((i: any) => ({
        label: i.partner_name || i.name,
        value: i.id
      }))
    } catch (err) {
      console.error('Failed to load dropdown options:', err)
    } finally {
      isLoadingOptions.value = false
    }
  }

  onMounted(() => {
    loadOptions()
  })

  // 8. Submit: Two-Step Process
  const submitProject = async (onSuccess?: (createdId: string) => void) => {
    // Validasi basic
    if (
      !form.project_name ||
      !form.project_code ||
      !form.business_unit_id ||
      !form.project_status_id
    ) {
      toast.add({
        title: 'Validation Error',
        description:
          'Please fill in all required fields (Project Code, Name, Business Unit, Status).',
        color: 'error'
      })
      return
    }

    if (!form.customer.customer_name) {
      toast.add({
        title: 'Validation Error',
        description: 'Customer Name is required.',
        color: 'error'
      })
      return
    }

    if (!form.start_date || !form.end_date) {
      toast.add({
        title: 'Validation Error',
        description: 'Start Date and End Date are required.',
        color: 'error'
      })
      return
    }

    if (new Date(form.end_date) <= new Date(form.start_date)) {
      toast.add({
        title: 'Validation Error',
        description: 'End Date must be after Start Date.',
        color: 'error'
      })
      return
    }

    isSubmitting.value = true
    submitProgressText.value = 'Creating project...'

    try {
      // Step 1: Format Payload & Create Project
      const payload: ProjectCreatePayload = {
        project_code: form.project_code.trim(),
        project_name: form.project_name.trim(),
        opportunity: form.opportunity?.trim() || null,
        year: Number(form.year),
        contract_name: form.contract_name?.trim() || null,
        contract_number: form.contract_number?.trim() || null,
        business_unit_id: form.business_unit_id,
        project_status_id: form.project_status_id,
        value_before_tax: Number(form.value_before_tax) || 0,
        carry_over_value: form.carry_over_value ? Number(form.carry_over_value) : null,
        project_manager: form.project_manager?.trim() || null,
        account_manager: form.account_manager?.trim() || null,
        start_date: form.start_date,
        end_date: form.end_date,
        project_objective: form.project_objective?.trim() || null,
        project_description: form.project_description?.trim() || null,
        project_background: form.project_background?.trim() || null,
        project_challenges: form.project_challenges?.trim() || null,
        project_solution: form.project_solution?.trim() || null,
        is_featured: Boolean(form.is_featured),
        customer: {
          customer_name: form.customer.customer_name.trim(),
          customer_location: form.customer.customer_location?.trim() || null,
          annual_revenue: form.customer.annual_revenue?.trim() || null,
          industry_id: form.customer.industry_id || null,
          company_size_id: form.customer.company_size_id || null,
          customer_type_id: form.customer.customer_type_id || null,
          legal_structure_id: form.customer.legal_structure_id || null
        },
        financial: {
          cogs: Number(form.financial.cogs) || 0,
          operational_cost: Number(form.financial.operational_cost) || 0
        },
        product_ids: form.product_ids || [],
        tech_stack_ids: form.tech_stack_ids || [],
        partners: form.partners.filter((p) => p.partner_id),
        success_metrics: form.success_metrics.filter(
          (m) => m.success_metric_value && m.success_metric_label
        )
      }

      const res = await projectApi.createProject(payload)
      const createdId = res.data.id

      // Step 2: Upload Files (jika ada file yang dipilih)
      const uploadTasks: Promise<any>[] = []

      // a. Featured Cover Image
      if (featuredCover.value) {
        submitProgressText.value = 'Uploading cover image...'
        uploadTasks.push(
          projectApi.uploadProjectFile(
            createdId,
            featuredCover.value.file,
            'image',
            'Featured Cover',
            undefined,
            0
          )
        )
      }

      // b. Gallery Images
      if (galleryFiles.value.length > 0) {
        submitProgressText.value = 'Uploading gallery images...'
        galleryFiles.value.forEach((item, idx) => {
          uploadTasks.push(
            projectApi.uploadProjectFile(
              createdId,
              item.file,
              'image',
              item.title || item.file.name,
              undefined,
              idx + 1
            )
          )
        })
      }

      // c. Case Study Document
      if (caseStudyFile.value) {
        submitProgressText.value = 'Uploading case study PDF...'
        uploadTasks.push(
          projectApi.uploadProjectFile(
            createdId,
            caseStudyFile.value.file,
            'case_study',
            caseStudyFile.value.file.name,
            undefined,
            0
          )
        )
      }

      // d. Supporting Documents
      if (supportingDocuments.value.length > 0) {
        submitProgressText.value = 'Uploading supporting documents...'
        supportingDocuments.value.forEach((item, idx) => {
          uploadTasks.push(
            projectApi.uploadProjectFile(
              createdId,
              item.file,
              'document',
              item.title || item.file.name,
              undefined,
              idx
            )
          )
        })
      }

      // Jalankan seluruh upload
      if (uploadTasks.length > 0) {
        await Promise.all(uploadTasks)
      }

      toast.add({
        title: 'Project Created',
        description: 'Project and all files have been successfully published.',
        color: 'success'
      })

      if (onSuccess) {
        onSuccess(createdId)
      }
    } catch (err: any) {
      console.error('Submit error:', err)
      toast.add({
        title: 'Submission Failed',
        description: err?.response?.data?.message || err?.message || 'Failed to create project.',
        color: 'error'
      })
    } finally {
      isSubmitting.value = false
      submitProgressText.value = ''
    }
  }

  return {
    form,
    isLoadingOptions,
    isSubmitting,
    submitProgressText,
    estimatedProfit,

    // Options
    businessUnitOptions,
    projectStatusOptions,
    industryOptions,
    companySizeOptions,
    customerTypeOptions,
    legalStructureOptions,
    productOptions,
    techStackOptions,
    partnerOptions,

    // Repeaters
    addSuccessMetric,
    removeSuccessMetric,
    addPartner,
    removePartner,

    // Files
    featuredCover,
    galleryFiles,
    caseStudyFile,
    supportingDocuments,

    // Actions
    submitProject
  }
}
