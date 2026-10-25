import type { PortfolioFilterState, PortfolioOption, ProjectStatus } from '../types/types'

export const portfolioCompanySizeOptions: PortfolioOption[] = [
  { label: 'Tier 1 : Strategic/Enterprise (>1T)', value: 'Tier 1 : Strategic/Enterprise (>1T)' },
  { label: 'Tier 2 : Growth/Valued (100B<1T)', value: 'Tier 2 : Growth/Valued (100B<1T)' },
  { label: 'Tier 3 : Standard/Transactional (50B<100B)', value: 'Tier 3 : Standard/Transactional (50B<100B)' },
  { label: 'Tier 4 : Standard/Transactional (10B<50B)', value: 'Tier 4 : Standard/Transactional (10B<50B)' },
  { label: 'Tier 5 : Standard/Transactional (1B<50B)', value: 'Tier 5 : Standard/Transactional (1B<50B)' },
  { label: 'Tier 6 : Standard/Transactional (<1B)', value: 'Tier 6 : Standard/Transactional (<1B)' }
]

export const portfolioIndustryOptions: PortfolioOption[] = [
  { label: 'Government', value: 'Government' },
  { label: 'Agriculture', value: 'Agriculture' },
  { label: 'Mining and Quarrying', value: 'Mining and Quarrying' },
  { label: 'Oil and Gas', value: 'Oil and Gas' },
  { label: 'Fishing', value: 'Fishing' },
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Construction', value: 'Construction' },
  { label: 'Utilities', value: 'Utilities' },
  { label: 'Retail and Wholesale Trade', value: 'Retail and Wholesale Trade' },
  { label: 'Financial Services', value: 'Financial Services' },
  { label: 'Transportation and Logistics', value: 'Transportation and Logistics' },
  { label: 'Hospitality and Tourism', value: 'Hospitality and Tourism' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Education', value: 'Education' },
  { label: 'Information Technology (IT) and Software', value: 'Information Technology (IT) and Software' },
  { label: 'Telecommunications', value: 'Telecommunications' },
  { label: 'Research and Development (R&D)', value: 'Research and Development (R&D)' },
  { label: 'Consulting', value: 'Consulting' },
  { label: 'Artificial Intelligence (AI) and Machine Learning', value: 'Artificial Intelligence (AI) and Machine Learning' },
  { label: 'Renewable Energy', value: 'Renewable Energy' },
  { label: 'Biotechnology', value: 'Biotechnology' },
  { label: 'Fintech', value: 'Fintech' },
  { label: 'E-commerce and Digital Marketing', value: 'E-commerce and Digital Marketing' },
  { label: 'Aerospace and Defense', value: 'Aerospace and Defense' },
  { label: 'Real Estate Technology (PropTech)', value: 'Real Estate Technology (PropTech)' }
]

export const portfolioLegalStructureOptions: PortfolioOption[] = [
  { label: 'Goverment Institution', value: 'Goverment Institution' },
  { label: 'State-owned Enterprise', value: 'State-owned Enterprise' },
  { label: 'Private Company', value: 'Private Company' },
  { label: 'Public Sector', value: 'Public Sector' }
]

export const portfolioBusinessUnitOptions: PortfolioOption[] = [
  { label: 'ITMS', value: 'ITMS' },
  { label: 'CSD', value: 'CSD' },
  { label: 'SI', value: 'SI' }
]

export const portfolioProductOptions: PortfolioOption[] = [
  { label: 'Zabbix', value: 'Zabbix' },
  { label: 'Bliv', value: 'Bliv' },
  { label: 'Semeru', value: 'Semeru' },
  { label: 'Teslakom', value: 'Teslakom' }
]

export const portfolioCustomerTypeOptions: PortfolioOption[] = [
  { label: 'Strategic Customer', value: 'Strategic Customer' },
  { label: 'Regular Customer', value: 'Regular Customer' }
]

export const portfolioProductStatusOptions: PortfolioOption[] = [
  { label: 'Ready to Sell', value: 'Ready to Sell' },
  { label: 'Under Development', value: 'Under Development' },
  { label: 'On Hold', value: 'On Hold' },
  { label: 'Deprecated', value: 'Deprecated' }
]

export const portfolioProjectStatusOptions: { label: ProjectStatus, value: ProjectStatus }[] = [
  { label: 'On Going', value: 'On Going' },
  { label: 'On Proposal', value: 'On Proposal' },
  { label: 'Closed', value: 'Closed' },
  { label: 'Canceled', value: 'Canceled' }
]

export const portfolioFrontendStackOptions: PortfolioOption[] = [
  { label: 'Vue.js (Vue, Vue2, Vue3)', value: 'Vue.js (Vue, Vue2, Vue3)' },
  { label: 'React', value: 'React' },
  { label: 'Nuxt 3 (JavaScript)', value: 'Nuxt 3 (JavaScript)' },
  { label: 'Flutter 3', value: 'Flutter 3' },
  { label: 'PHP (CI3, CI4)', value: 'PHP (CI3, CI4)' },
  { label: 'PHP (Laravel)', value: 'PHP (Laravel)' }
]

export const portfolioBackendStackOptions: PortfolioOption[] = [
  { label: 'Python (Flask API, FastAPI)', value: 'Python (Flask API, FastAPI)' },
  { label: 'Golang', value: 'Golang' },
  { label: 'PHP (CI3, CI4)', value: 'PHP (CI3, CI4)' },
  { label: 'Java (for custom NiFi components)', value: 'Java (for custom NiFi components)' },
  { label: 'PHP (Laravel)', value: 'PHP (Laravel)' }
]

export const portfolioDatabaseOptions: PortfolioOption[] = [
  { label: 'PostgreSQL (Postgres)', value: 'PostgreSQL (Postgres)' },
  { label: 'TimescaleDB', value: 'TimescaleDB' },
  { label: 'MySQL', value: 'MySQL' },
  { label: 'ClickHouse (with CHProxy)', value: 'ClickHouse (with CHProxy)' },
  { label: 'DuckDB', value: 'DuckDB' },
  { label: 'Redis', value: 'Redis' },
  { label: 'Hadoop', value: 'Hadoop' },
  { label: 'Minio', value: 'Minio' },
  { label: 'Google Cloud Storage', value: 'Google Cloud Storage' },
  { label: 'Elasticsearch', value: 'Elasticsearch' },
  { label: 'PGVector', value: 'PGVector' },
  { label: 'Weaviate', value: 'Weaviate' },
  { label: 'OpenMetadata', value: 'OpenMetadata' }
]

export const createPortfolioFilterState = (): PortfolioFilterState => ({
  search: '',
  industry: '',
  companySize: '',
  legalStructure: '',
  businessUnit: '',
  product: '',
  customerType: '',
  productStatus: '',
  status: '',
  frontendStack: '',
  backendStack: '',
  database: '',
  year: ''
})
