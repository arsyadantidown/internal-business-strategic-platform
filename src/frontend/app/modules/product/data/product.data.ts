import type { ProductItem, ProductStatus, ProductStatusOption } from '../types/product.types'

export const productStatusOptions: ProductStatusOption[] = [
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Inactive', value: 'inactive' }
]

export const productStatusLabel = (status: ProductStatus) =>
  productStatusOptions.find(option => option.value === status)?.label ?? 'Unknown'

export const dummyProducts: ProductItem[] = [
  {
    id: 'prd-001',
    productName: 'Bliv',
    productDescription:
      'Digital banking platform that streamlines onboarding, transaction monitoring, and customer engagement.',
    productStatus: 'active'
  },
  {
    id: 'prd-002',
    productName: 'Semeru',
    productDescription:
      'Enterprise data integration suite for connecting legacy systems with modern cloud services.',
    productStatus: 'active'
  },
  {
    id: 'prd-003',
    productName: 'Teslakom',
    productDescription:
      'Unified communication and collaboration workspace for distributed operational teams.',
    productStatus: 'active'
  },
  {
    id: 'prd-004',
    productName: 'Zabbix',
    productDescription:
      'Infrastructure monitoring and observability solution for hybrid data center environments.',
    productStatus: 'inactive'
  },
  {
    id: 'prd-005',
    productName: 'Arjuna',
    productDescription:
      'Customer relationship management module tailored for enterprise sales pipelines.',
    productStatus: 'draft'
  },
  {
    id: 'prd-006',
    productName: 'Nusantara',
    productDescription:
      'Cloud governance toolkit for cost allocation, compliance, and resource lifecycle management.',
    productStatus: 'active'
  },
  {
    id: 'prd-007',
    productName: 'Rajawali',
    productDescription:
      'Secure document management and workflow automation for regulated industries.',
    productStatus: 'active'
  },
  {
    id: 'prd-008',
    productName: 'Krakatau',
    productDescription:
      'High-volume data pipeline accelerator with built-in quality checks and lineage tracking.',
    productStatus: 'draft'
  },
  {
    id: 'prd-009',
    productName: 'Merapi',
    productDescription:
      'Business intelligence dashboard builder with self-service reporting capabilities.',
    productStatus: 'inactive'
  },
  {
    id: 'prd-010',
    productName: 'Bromo',
    productDescription:
      'API gateway and service mesh management console for microservice architectures.',
    productStatus: 'active'
  }
]
