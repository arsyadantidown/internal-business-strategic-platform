import type {
  CmsActivity,
  CmsContentStatus,
  CmsFilterOption,
  CmsFilters,
  CmsPartnershipCategory,
  CmsPartnershipContent,
  CmsPartnerType,
  CmsPortfolioContent,
  CmsProjectStatus,
  CmsVisibility,
  CmsWorkflowStage
} from '../types/cms.types'
import {
  portfolioBusinessUnitOptions,
  portfolioCompanySizeOptions,
  portfolioCustomerTypeOptions,
  portfolioIndustryOptions,
  portfolioLegalStructureOptions,
  portfolioProjectStatusOptions
} from '~/modules/portofolio/data/portfolioOptions'

export const cmsCurrentActor = 'Roland Brilianto'

export const cmsAuthors = [
  'Nadia Safitri',
  'Rizky Hidayat',
  'Arief Nugroho',
  'Jessica Tan',
  'Sarah Wijaya',
  'Roland Brilianto',
  'Dimas Setiawan',
  'Putri Anggraini',
  'Cindy Aurelia',
  'Kevin Sanjaya',
  'Farhan Ramadhan',
  'Fajar Nugraha'
]

export const cmsStatuses: CmsContentStatus[] = ['Draft', 'Scheduled', 'Published', 'Archived']

export const cmsWorkflowStages: CmsWorkflowStage[] = [
  'Draft',
  'Verification',
  'Evaluation',
  'Active',
  'Closed'
]

export const cmsProjectStatuses: CmsProjectStatus[] = [
  'On Going',
  'On Proposal',
  'Closed',
  'Canceled'
]

export const cmsPartnerCategories: CmsPartnershipCategory[] = [
  'Technology Partner',
  'Channel Partner',
  'Service Partner',
  'Marketing Partner'
]

export const cmsPartnerTypes: CmsPartnerType[] = [
  'Strategic Partner',
  'Implementation Partner',
  'Consulting Partner',
  'Reseller',
  'Technology Provider',
  'Other'
]

export const cmsIndustries = portfolioIndustryOptions.map(industry => industry.value)

export const cmsProjectTypes = [
  'Digital Transformation',
  'System Development',
  'Data & Analytics',
  'Cloud Migration',
  'IoT Platform',
  'Enterprise Application',
  'Mobile Application',
  'Infrastructure Modernization'
]

export const cmsServiceTypes = [
  'End-to-End Delivery',
  'Consulting',
  'Implementation',
  'Managed Service',
  'System Integration',
  'Staff Augmentation'
]

export const cmsCurrencies = ['IDR', 'USD', 'SGD', 'EUR']

export const cmsFundingTypes = [
  'Client Funded',
  'Internal Investment',
  'Grant Funded',
  'Joint Investment'
]

export const cmsLocations = [
  'Jakarta, Indonesia',
  'Bandung, Indonesia',
  'Surabaya, Indonesia',
  'Singapore',
  'Kuala Lumpur, Malaysia',
  'Bangkok, Thailand',
  'Ho Chi Minh City, Vietnam',
  'Tokyo, Japan',
  'Sydney, Australia',
  'United States',
  'Europe',
  'Remote'
]

export const cmsExpertises = [
  'Cloud Platform',
  'Data Analytics',
  'AI & Machine Learning',
  'Network Solution',
  'IoT Solution',
  'Cybersecurity',
  'Digital Transformation',
  'Business Consulting',
  'Industrial Automation',
  'System Integration'
]

export const cmsTechnologies = [
  'Vue.js',
  'Nuxt',
  'React',
  'Node.js',
  'PostgreSQL',
  'AWS',
  'Azure',
  'Google Cloud',
  'Kubernetes',
  'Docker',
  'Flutter',
  'React Native',
  'IoT',
  'Data Analytics',
  'Power BI',
  'Tableau',
  'Python',
  'Machine Learning'
]

export const cmsRelatedPartnerOptions = [
  'Google Cloud',
  'Accenture',
  'PT Nusantara Teknologi',
  'Global Cloud Solutions',
  'SecureNet Cyber',
  'RetailFlow Digital',
  'PT Fintech Solution',
  'PT Cloud Indonesia',
  'PT SecureTech',
  'PT Consultindo'
]

export const cmsRelatedPortfolioOptions = [
  'Digital Banking Transformation',
  'Smart Manufacturing Platform',
  'Retail Analytics Platform',
  'Healthcare Management System',
  'Logistics Tracking Platform',
  'Government Service Portal',
  'Legacy System Migration'
]

export const cmsVisibilityOptions: CmsVisibility[] = ['Internal']

export const cmsStatusOptions: CmsFilterOption[] = cmsStatuses.map(status => ({
  label: status,
  value: status
}))

export const cmsWorkflowStageOptions: CmsFilterOption[] = cmsWorkflowStages.map(stage => ({
  label: stage,
  value: stage
}))

export const cmsAuthorOptions: CmsFilterOption[] = cmsAuthors.map(author => ({
  label: author,
  value: author
}))

export const cmsProjectStatusOptions: CmsFilterOption[] = portfolioProjectStatusOptions.map(status => ({
  label: status.label,
  value: status.value
}))

export const cmsIndustryOptions: CmsFilterOption[] = portfolioIndustryOptions

export const cmsProjectTypeOptions: CmsFilterOption[] = cmsProjectTypes.map(projectType => ({
  label: projectType,
  value: projectType
}))

export const cmsServiceTypeOptions: CmsFilterOption[] = cmsServiceTypes.map(serviceType => ({
  label: serviceType,
  value: serviceType
}))

export const cmsCurrencyOptions: CmsFilterOption[] = cmsCurrencies.map(currency => ({
  label: currency,
  value: currency
}))

export const cmsFundingTypeOptions: CmsFilterOption[] = cmsFundingTypes.map(fundingType => ({
  label: fundingType,
  value: fundingType
}))

export const cmsLocationOptions: CmsFilterOption[] = cmsLocations.map(location => ({
  label: location,
  value: location
}))

export const cmsPartnerCategoryOptions: CmsFilterOption[] = cmsPartnerCategories.map(category => ({
  label: category,
  value: category
}))

export const cmsPartnerTypeOptions: CmsFilterOption[] = cmsPartnerTypes.map(partnerType => ({
  label: partnerType,
  value: partnerType
}))

export const cmsExpertiseOptions: CmsFilterOption[] = cmsExpertises.map(expertise => ({
  label: expertise,
  value: expertise
}))

export const cmsTechnologyOptions: CmsFilterOption[] = cmsTechnologies.map(technology => ({
  label: technology,
  value: technology
}))

export const cmsRelatedPartnerFilterOptions: CmsFilterOption[] = cmsRelatedPartnerOptions.map(name => ({
  label: name,
  value: name
}))

export const cmsRelatedPortfolioFilterOptions: CmsFilterOption[] = cmsRelatedPortfolioOptions.map(title => ({
  label: title,
  value: title
}))

export const cmsVisibilityFilterOptions: CmsFilterOption[] = cmsVisibilityOptions.map(visibility => ({
  label: visibility,
  value: visibility
}))

export const createCmsFilters = (): CmsFilters => ({
  search: '',
  status: ''
})

type PortfolioSeed = Pick<CmsPortfolioContent, 'id' | 'title' | 'summary' | 'client'>
  & Partial<CmsPortfolioContent>

type PartnershipSeed = Pick<CmsPartnershipContent, 'id' | 'title' | 'summary'>
  & Partial<CmsPartnershipContent>

const portfolioDefaults: Omit<
  CmsPortfolioContent,
  'id' | 'kind' | 'title' | 'summary' | 'client'
> = {
  status: 'Draft',
  author: cmsCurrentActor,
  featured: false,
  publishedAt: null,
  scheduledAt: null,
  createdAt: '2026-09-01T08:00:00.000Z',
  updatedAt: '2026-09-01T08:00:00.000Z',
  projectType: 'System Development',
  serviceType: 'End-to-End Delivery',
  industry: 'Technology',
  clientIndustry: 'Technology',
  clientLocation: 'Jakarta, Indonesia',
  contactName: '',
  contactEmail: '',
  projectStatus: 'On Proposal',
  startDate: '',
  endDate: '',
  location: 'Jakarta, Indonesia',
  teamSize: '',
  projectValue: '',
  currency: 'IDR',
  fundingType: 'Client Funded',
  overview: '',
  background: '',
  challenges: [],
  solutions: [],
  image: '',
  documents: [],
  technologies: [],
  partners: [],
  visibility: 'Internal'
}

const partnershipDefaults: Omit<
  CmsPartnershipContent,
  'id' | 'kind' | 'title' | 'summary'
> = {
  status: 'Draft',
  author: cmsCurrentActor,
  featured: false,
  publishedAt: null,
  scheduledAt: null,
  createdAt: '2026-09-01T08:00:00.000Z',
  updatedAt: '2026-09-01T08:00:00.000Z',
  category: 'Technology Partner',
  partnerType: 'Strategic Partner',
  industry: 'Technology',
  location: 'Jakarta, Indonesia',
  website: '',
  expertise: [],
  solutions: [],
  overview: '',
  collaborationScope: '',
  benefits: [],
  logo: '',
  relatedPortfolio: [],
  visibility: 'Internal'
}

const createPortfolio = (seed: PortfolioSeed): CmsPortfolioContent => ({
  ...portfolioDefaults,
  ...seed,
  kind: 'portfolio'
})

const createPartnership = (seed: PartnershipSeed): CmsPartnershipContent => ({
  ...partnershipDefaults,
  ...seed,
  kind: 'partnership'
})

export const cmsSeedPortfolioContents: CmsPortfolioContent[] = [
  createPortfolio({
    id: 'PF-2026-001',
    title: 'Digital Banking Transformation',
    summary: 'End-to-end digital banking platform that modernizes customer journeys and core service operations.',
    client: 'ABC Bank',
    status: 'Published',
    featured: true,
    publishedAt: '2026-09-18T08:00:00.000Z',
    createdAt: '2026-08-10T03:20:00.000Z',
    updatedAt: '2026-10-25T09:15:00.000Z',
    projectType: 'Digital Transformation',
    serviceType: 'End-to-End Delivery',
    industry: 'Financial Services',
    clientIndustry: 'Financial Services',
    clientLocation: 'Jakarta, Indonesia',
    contactName: 'Andini Prameswari',
    contactEmail: 'andini.prameswari@abcbank.co.id',
    projectStatus: 'Closed',
    startDate: '2024-01-15',
    endDate: '2024-12-20',
    location: 'Jakarta, Indonesia',
    teamSize: '12 members',
    projectValue: '4500000000',
    currency: 'IDR',
    fundingType: 'Client Funded',
    overview:
      'Digital Banking Transformation is an end-to-end platform designed to modernize ABC Bank digital services. The project focused on building a secure, scalable, and user-friendly banking platform to improve customer experience and operational efficiency.',
    background:
      'ABC Bank needed to replace a legacy banking system that could no longer support growing transaction volumes, digital customer expectations, and strict regulatory requirements.',
    challenges: [
      'Legacy system with limited scalability',
      'High maintenance cost across multiple integrations',
      'Inconsistent digital customer experience',
      'Strict security and compliance requirements'
    ],
    solutions: [
      'Modern web and mobile banking platform',
      'Integration with core banking and third-party services',
      'Multi-factor authentication and fraud monitoring',
      'Scalable cloud infrastructure on AWS'
    ],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    documents: [
      { name: 'Project Proposal.pdf', type: 'PDF', size: '2.4 MB' },
      { name: 'Technical Architecture.pdf', type: 'PDF', size: '3.1 MB' },
      { name: 'UAT Report.pdf', type: 'PDF', size: '1.8 MB' }
    ],
    technologies: ['Vue.js', 'Node.js', 'PostgreSQL', 'AWS'],
    partners: [
      { name: 'Google Cloud', role: 'Cloud Partner', tag: 'Cloud Infrastructure' },
      { name: 'SecureNet Cyber', role: 'Security Partner', tag: 'Cybersecurity' },
      { name: 'PT Fintech Solution', role: 'Technology Partner', tag: 'Core System Development' }
    ],
    visibility: 'Internal'
  }),
  createPortfolio({
    id: 'PF-2026-002',
    title: 'Smart Manufacturing Platform',
    summary: 'IoT-based manufacturing monitoring and predictive maintenance platform for production efficiency.',
    client: 'PT. Manufaktur Indonesia',
    status: 'Published',
    publishedAt: '2026-09-22T04:30:00.000Z',
    createdAt: '2026-08-16T06:10:00.000Z',
    updatedAt: '2026-10-23T11:40:00.000Z',
    projectType: 'IoT Platform',
    serviceType: 'System Integration',
    industry: 'Manufacturing',
    clientIndustry: 'Manufacturing',
    clientLocation: 'Bandung, Indonesia',
    contactName: 'Budi Hartono',
    contactEmail: 'budi.hartono@manufaktur.co.id',
    projectStatus: 'On Going',
    startDate: '2025-02-01',
    endDate: '2026-12-31',
    location: 'Bandung, Indonesia',
    teamSize: '9 members',
    projectValue: '2800000000',
    currency: 'IDR',
    fundingType: 'Client Funded',
    overview:
      'Smart Manufacturing Platform connects production lines, sensors, and maintenance teams into a single operational dashboard. The platform provides real-time visibility into machine health and production performance.',
    background:
      'The client operated multiple production lines with limited visibility into machine utilization and unplanned downtime. Maintenance decisions were mostly reactive and relied on manual reports.',
    challenges: [
      'Fragmented operational data across production lines',
      'Unplanned downtime impacting delivery schedules',
      'Manual maintenance reporting',
      'Limited connectivity in older factory areas'
    ],
    solutions: [
      'IoT sensor integration across critical machines',
      'Predictive maintenance alerts and work orders',
      'Real-time production and OEE dashboards',
      'Edge gateway for unstable network areas'
    ],
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop',
    documents: [
      { name: 'Solution Overview.pdf', type: 'PDF', size: '1.6 MB' },
      { name: 'Integration Blueprint.pdf', type: 'PDF', size: '2.2 MB' }
    ],
    technologies: ['Vue.js', 'Node.js', 'IoT', 'Google Cloud', 'PostgreSQL'],
    partners: [
      { name: 'Google Cloud', role: 'Cloud Partner', tag: 'IoT Core' },
      { name: 'PT Nusantara Teknologi', role: 'Implementation Partner', tag: 'Field Integration' }
    ],
    visibility: 'Internal'
  }),
  createPortfolio({
    id: 'PF-2026-003',
    title: 'Retail Analytics Platform',
    summary: 'Business intelligence platform that unifies sales, inventory, and customer data for retail decision makers.',
    client: 'Retail Group',
    status: 'Published',
    featured: true,
    publishedAt: '2026-10-02T02:00:00.000Z',
    createdAt: '2026-09-05T07:25:00.000Z',
    updatedAt: '2026-10-22T08:30:00.000Z',
    projectType: 'Data & Analytics',
    serviceType: 'Implementation',
    industry: 'Retail and Wholesale Trade',
    clientIndustry: 'Retail and Wholesale Trade',
    clientLocation: 'Jakarta, Indonesia',
    contactName: 'Clara Wijaya',
    contactEmail: 'clara.wijaya@retailgroup.co.id',
    projectStatus: 'On Going',
    startDate: '2026-01-10',
    endDate: '2026-11-30',
    location: 'Jakarta, Indonesia',
    teamSize: '7 members',
    projectValue: '1650000000',
    currency: 'IDR',
    fundingType: 'Client Funded',
    overview:
      'Retail Analytics Platform consolidates sales, inventory, and customer behavior data into a single reporting layer. Business teams can monitor performance by store, category, and channel.',
    background:
      'Retail Group relied on spreadsheets from multiple departments to review performance. Reporting took days and often produced conflicting numbers.',
    challenges: [
      'Data spread across disconnected systems',
      'Slow and manual reporting cycles',
      'Inconsistent product and store master data',
      'Limited self-service analytics for business teams'
    ],
    solutions: [
      'Centralized data warehouse and semantic layer',
      'Sales and inventory performance dashboards',
      'Self-service reporting for category managers',
      'Automated daily data refresh'
    ],
    image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=1200&auto=format&fit=crop',
    documents: [
      { name: 'Analytics Roadmap.pdf', type: 'PDF', size: '1.9 MB' }
    ],
    technologies: ['Power BI', 'Data Analytics', 'Python', 'Azure'],
    partners: [
      { name: 'DataSphere Analytics', role: 'Analytics Partner', tag: 'Data Modeling' },
      { name: 'Accenture', role: 'Consulting Partner', tag: 'Business Transformation' }
    ],
    visibility: 'Internal'
  }),
  createPortfolio({
    id: 'PF-2026-004',
    title: 'Healthcare Management System',
    summary: 'Patient management and resource allocation system for hospitals and healthcare providers.',
    client: 'MediCare Hospital',
    status: 'Draft',
    createdAt: '2026-10-12T03:40:00.000Z',
    updatedAt: '2026-10-24T06:15:00.000Z',
    projectType: 'Enterprise Application',
    serviceType: 'Consulting',
    industry: 'Healthcare',
    clientIndustry: 'Healthcare',
    clientLocation: 'Surabaya, Indonesia',
    contactName: 'Dr. Maya Kusuma',
    contactEmail: 'maya.kusuma@medicare.co.id',
    projectStatus: 'Closed',
    startDate: '2023-03-01',
    endDate: '2024-06-30',
    location: 'Surabaya, Indonesia',
    teamSize: '15 members',
    projectValue: '3800000000',
    currency: 'IDR',
    fundingType: 'Client Funded',
    overview:
      'Healthcare Management System digitizes patient registration, scheduling, medical records, and resource allocation for hospital operations.',
    background:
      'MediCare Hospital managed patient flow and resource allocation through disconnected applications, causing long wait times and duplicated data entry.',
    challenges: [
      'Long patient registration and queue times',
      'Duplicate medical records across departments',
      'Limited visibility into bed and equipment availability',
      'Strict patient data privacy requirements'
    ],
    solutions: [
      'Unified patient registration and scheduling',
      'Integrated electronic medical records',
      'Real-time bed and equipment dashboard',
      'Role-based access control and audit trails'
    ],
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop',
    documents: [
      { name: 'Case Study Draft.docx', type: 'DOCX', size: '860 KB' }
    ],
    technologies: ['Vue.js', 'Node.js', 'PostgreSQL', 'Azure'],
    partners: [
      { name: 'PT SecureTech', role: 'Security Partner', tag: 'Data Privacy' }
    ],
    visibility: 'Internal'
  }),
  createPortfolio({
    id: 'PF-2026-005',
    title: 'Logistics Tracking Platform',
    summary: 'Real-time shipment tracking and supply chain visibility platform for nationwide distribution.',
    client: 'LogiTrans Indonesia',
    status: 'Draft',
    createdAt: '2026-10-15T05:00:00.000Z',
    updatedAt: '2026-10-20T09:10:00.000Z',
    projectType: 'System Development',
    serviceType: 'End-to-End Delivery',
    industry: 'Transportation and Logistics',
    clientIndustry: 'Transportation and Logistics',
    clientLocation: 'Jakarta, Indonesia',
    contactName: 'Dedi Santoso',
    contactEmail: 'dedi.santoso@logitrans.co.id',
    projectStatus: 'On Going',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    location: 'Jakarta, Indonesia',
    teamSize: '10 members',
    projectValue: '2200000000',
    currency: 'IDR',
    fundingType: 'Client Funded',
    overview:
      'Logistics Tracking Platform provides real-time visibility for shipments, fleet movement, and delivery exceptions across the client distribution network.',
    background:
      'LogiTrans relied on phone calls and manual spreadsheets to track shipments, making it difficult to respond quickly to delays and customer inquiries.',
    challenges: [
      'Limited real-time shipment visibility',
      'Manual exception handling',
      'High volume of customer status inquiries',
      'Integration with multiple logistics partners'
    ],
    solutions: [
      'Unified shipment tracking dashboard',
      'Automated milestone and exception notifications',
      'Customer-facing tracking page',
      'API integration with partner systems'
    ],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    documents: [],
    technologies: ['Vue.js', 'Node.js', 'Google Cloud', 'IoT'],
    partners: [
      { name: 'Google Cloud', role: 'Cloud Partner', tag: 'Cloud Hosting' }
    ],
    visibility: 'Internal'
  }),
  createPortfolio({
    id: 'PF-2026-006',
    title: 'Government Service Portal',
    summary: 'Digital service portal for government administration and citizen engagement.',
    client: 'Kementerian Dalam Negeri',
    status: 'Published',
    publishedAt: '2026-08-12T03:00:00.000Z',
    createdAt: '2026-06-18T02:20:00.000Z',
    updatedAt: '2026-10-18T04:25:00.000Z',
    projectType: 'Digital Transformation',
    serviceType: 'Managed Service',
    industry: 'Government',
    clientIndustry: 'Government',
    clientLocation: 'Jakarta, Indonesia',
    contactName: 'Rina Kartika',
    contactEmail: 'rina.kartika@kemendagri.go.id',
    projectStatus: 'On Going',
    startDate: '2025-07-01',
    endDate: '2027-06-30',
    location: 'Jakarta, Indonesia',
    teamSize: '18 members',
    projectValue: '7500000000',
    currency: 'IDR',
    fundingType: 'Grant Funded',
    overview:
      'Government Service Portal centralizes public service information and administrative workflows for citizens and local government offices.',
    background:
      'Citizens had to visit multiple offices and websites to access administrative services. Internal workflows were also inconsistent between regions.',
    challenges: [
      'Fragmented service information across agencies',
      'Inconsistent regional service workflows',
      'High citizen traffic during peak periods',
      'Accessibility and language requirements'
    ],
    solutions: [
      'Unified service catalog and application portal',
      'Standardized digital service workflows',
      'Scalable infrastructure for peak traffic',
      'Accessible interface with multilingual support'
    ],
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    documents: [
      { name: 'Service Catalog.pdf', type: 'PDF', size: '3.4 MB' },
      { name: 'Security Assessment.pdf', type: 'PDF', size: '1.2 MB' }
    ],
    technologies: ['Vue.js', 'Node.js', 'Kubernetes', 'AWS'],
    partners: [
      { name: 'PT Cloud Indonesia', role: 'Infrastructure Partner', tag: 'Cloud Services' },
      { name: 'PT SecureTech', role: 'Security Partner', tag: 'Security Implementation' }
    ],
    visibility: 'Internal'
  }),
  createPortfolio({
    id: 'PF-2026-007',
    title: 'Legacy System Migration',
    summary: 'Migration of legacy internal systems to modern cloud infrastructure with minimal service disruption.',
    client: 'Internal Use',
    status: 'Archived',
    publishedAt: '2026-04-10T02:00:00.000Z',
    createdAt: '2026-02-02T08:15:00.000Z',
    updatedAt: '2026-10-05T10:40:00.000Z',
    projectType: 'Cloud Migration',
    serviceType: 'Consulting',
    industry: 'Information Technology (IT) and Software',
    clientIndustry: 'Information Technology (IT) and Software',
    clientLocation: 'Jakarta, Indonesia',
    contactName: 'Fajar Nugraha',
    contactEmail: 'fajar.nugraha@company.co.id',
    projectStatus: 'Canceled',
    startDate: '2026-01-05',
    endDate: '2026-08-31',
    location: 'Jakarta, Indonesia',
    teamSize: '6 members',
    projectValue: '900000000',
    currency: 'IDR',
    fundingType: 'Internal Investment',
    overview:
      'Legacy System Migration assessed and planned the move of internal applications to a modern cloud environment. The initiative was paused after the discovery phase.',
    background:
      'The internal application portfolio contained several unsupported platforms with growing maintenance costs and security risks.',
    challenges: [
      'Undocumented legacy business rules',
      'Tight dependency between applications',
      'Limited internal cloud operations capability',
      'Competing priorities across product teams'
    ],
    solutions: [
      'Application dependency mapping',
      'Migration wave and risk assessment',
      'Target cloud architecture blueprint',
      'Knowledge transfer plan for internal teams'
    ],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
    documents: [
      { name: 'Migration Assessment.pdf', type: 'PDF', size: '4.8 MB' }
    ],
    technologies: ['AWS', 'Docker', 'Kubernetes'],
    partners: [
      { name: 'Accenture', role: 'Consulting Partner', tag: 'Cloud Strategy' }
    ],
    visibility: 'Internal'
  })
]

export const cmsSeedPartnershipContents: CmsPartnershipContent[] = [
  createPartnership({
    id: 'PT-2026-001',
    title: 'Google Cloud',
    summary: 'Strategic cloud partner supporting infrastructure modernization, data analytics, and AI initiatives.',
    status: 'Published',
    featured: true,
    publishedAt: '2026-09-12T05:00:00.000Z',
    createdAt: '2026-07-08T02:30:00.000Z',
    updatedAt: '2026-10-25T07:20:00.000Z',
    category: 'Technology Partner',
    partnerType: 'Strategic Partner',
    industry: 'Technology',
    location: 'Singapore',
    website: 'https://cloud.google.com',
    expertise: ['Cloud Platform', 'Data Analytics', 'AI & Machine Learning'],
    solutions: [
      'Cloud infrastructure modernization',
      'Data lake and analytics platform',
      'Machine learning enablement'
    ],
    overview:
      'Google Cloud is a strategic technology partner supporting the company cloud adoption journey across infrastructure, data, and AI. The partnership includes joint solution development and technical enablement.',
    collaborationScope:
      'The collaboration covers cloud architecture review, migration support, data platform design, and co-selling activities for enterprise clients.',
    benefits: [
      'Preferred cloud pricing and technical support',
      'Joint go-to-market programs',
      'Access to solution architecture workshops',
      'Early access to new cloud services'
    ],
    logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?q=80&w=600&auto=format&fit=crop',
    relatedPortfolio: ['Digital Banking Transformation', 'Smart Manufacturing Platform'],
    visibility: 'Internal'
  }),
  createPartnership({
    id: 'PT-2026-002',
    title: 'Accenture',
    summary: 'Consulting partner for business transformation, operating model design, and change management.',
    status: 'Published',
    publishedAt: '2026-09-20T04:15:00.000Z',
    createdAt: '2026-08-01T05:00:00.000Z',
    updatedAt: '2026-10-21T10:35:00.000Z',
    category: 'Service Partner',
    partnerType: 'Consulting Partner',
    industry: 'Technology',
    location: 'United States',
    website: 'https://www.accenture.com',
    expertise: ['Business Consulting', 'Digital Transformation'],
    solutions: [
      'Operating model transformation',
      'Change management program',
      'Digital strategy advisory'
    ],
    overview:
      'Accenture supports the company transformation programs through business consulting, process redesign, and change management. The partnership is focused on enterprise clients in financial services and retail.',
    collaborationScope:
      'Collaboration includes joint client pursuits, transformation roadmap development, and capability building for delivery teams.',
    benefits: [
      'Access to global consulting methodologies',
      'Joint proposal development',
      'Executive advisory sessions',
      'Change management toolkits'
    ],
    logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
    relatedPortfolio: ['Retail Analytics Platform', 'Legacy System Migration'],
    visibility: 'Internal'
  }),
  createPartnership({
    id: 'PT-2026-003',
    title: 'PT Nusantara Teknologi',
    summary: 'Implementation partner for IoT field deployment and regional system integration projects.',
    status: 'Draft',
    createdAt: '2026-10-10T08:40:00.000Z',
    updatedAt: '2026-10-22T06:10:00.000Z',
    category: 'Technology Partner',
    partnerType: 'Implementation Partner',
    industry: 'Technology',
    location: 'Jakarta, Indonesia',
    website: 'https://nusantarateknologi.co.id',
    expertise: ['IoT Solution', 'System Integration'],
    solutions: [
      'IoT field deployment',
      'Regional system integration',
      'On-site technical support'
    ],
    overview:
      'PT Nusantara Teknologi is being onboarded as an implementation partner for IoT and system integration projects across Indonesia. The partnership is currently under final review.',
    collaborationScope:
      'The partner will support field surveys, device installation, local integration work, and first-line support for selected projects.',
    benefits: [
      'Nationwide field deployment coverage',
      'Local technical support capability',
      'Faster project mobilization'
    ],
    logo: '',
    relatedPortfolio: ['Smart Manufacturing Platform'],
    visibility: 'Internal'
  }),
  createPartnership({
    id: 'PT-2026-004',
    title: 'Global Cloud Solutions',
    summary: 'Channel partner for cloud licensing, resale, and regional customer enablement.',
    status: 'Published',
    publishedAt: '2026-08-28T03:30:00.000Z',
    createdAt: '2026-07-19T09:15:00.000Z',
    updatedAt: '2026-10-19T13:00:00.000Z',
    category: 'Channel Partner',
    partnerType: 'Reseller',
    industry: 'Technology',
    location: 'Jakarta, Indonesia',
    website: 'https://globalcloud.co.id',
    expertise: ['Cloud Platform', 'Network Solution'],
    solutions: [
      'Cloud license resale',
      'Customer onboarding',
      'Regional sales enablement'
    ],
    overview:
      'Global Cloud Solutions supports cloud commercial growth through licensing, resale, and customer onboarding in Indonesia.',
    collaborationScope:
      'The partner manages selected customer accounts, provides first-level cloud advisory, and coordinates renewals with the internal commercial team.',
    benefits: [
      'Expanded commercial reach',
      'Faster customer onboarding',
      'Improved renewal coverage'
    ],
    logo: '',
    relatedPortfolio: ['Logistics Tracking Platform'],
    visibility: 'Internal'
  }),
  createPartnership({
    id: 'PT-2026-005',
    title: 'SecureNet Cyber',
    summary: 'Cybersecurity partner for security assessment, monitoring, and compliance support.',
    status: 'Published',
    publishedAt: '2026-09-30T06:45:00.000Z',
    createdAt: '2026-08-22T04:20:00.000Z',
    updatedAt: '2026-10-17T08:55:00.000Z',
    category: 'Technology Partner',
    partnerType: 'Strategic Partner',
    industry: 'Financial Services',
    location: 'United States',
    website: 'https://securenetcyber.com',
    expertise: ['Cybersecurity', 'Cloud Platform'],
    solutions: [
      'Security assessment and penetration testing',
      'Managed detection and response',
      'Compliance readiness support'
    ],
    overview:
      'SecureNet Cyber provides security assessment, monitoring, and compliance support for enterprise projects. The partner is engaged in projects with strict data protection requirements.',
    collaborationScope:
      'Collaboration covers security architecture review, penetration testing, managed monitoring, and incident response planning.',
    benefits: [
      'Specialized security expertise',
      'Faster compliance assessment',
      '24/7 monitoring capability'
    ],
    logo: '',
    relatedPortfolio: ['Digital Banking Transformation', 'Government Service Portal'],
    visibility: 'Internal'
  }),
  createPartnership({
    id: 'PT-2026-006',
    title: 'RetailFlow Digital',
    summary: 'Marketing partner for retail campaign activation and customer engagement programs.',
    status: 'Draft',
    createdAt: '2026-10-14T02:15:00.000Z',
    updatedAt: '2026-10-23T11:25:00.000Z',
    category: 'Marketing Partner',
    partnerType: 'Reseller',
    industry: 'Retail',
    location: 'Bangkok, Thailand',
    website: 'https://retailflow.digital',
    expertise: ['Digital Transformation', 'Business Consulting'],
    solutions: [
      'Retail campaign activation',
      'Customer engagement programs',
      'Channel performance analytics'
    ],
    overview:
      'RetailFlow Digital supports retail marketing programs through campaign activation and customer engagement. The partnership content is being prepared for publication.',
    collaborationScope:
      'The partner will support campaign planning, channel activation, and performance reporting for selected retail accounts.',
    benefits: [
      'Regional retail marketing coverage',
      'Faster campaign activation',
      'Additional customer engagement channels'
    ],
    logo: '',
    relatedPortfolio: ['Retail Analytics Platform'],
    visibility: 'Internal'
  }),
  createPartnership({
    id: 'PT-2026-007',
    title: 'LegacyCore Systems',
    summary: 'Former service partner for legacy application maintenance. Partnership has been terminated.',
    status: 'Archived',
    publishedAt: '2026-03-05T02:00:00.000Z',
    createdAt: '2025-11-12T07:35:00.000Z',
    updatedAt: '2026-09-28T05:50:00.000Z',
    category: 'Service Partner',
    partnerType: 'Consulting Partner',
    industry: 'Manufacturing',
    location: 'Europe',
    website: 'https://legacycore.example.com',
    expertise: ['Industrial Automation', 'Business Consulting'],
    solutions: [
      'Legacy application maintenance',
      'Industrial process consulting'
    ],
    overview:
      'LegacyCore Systems previously supported legacy application maintenance for manufacturing clients. The partnership was terminated after the contract ended and services were transitioned internally.',
    collaborationScope:
      'The archived scope covered maintenance support, minor enhancements, and process consulting for selected manufacturing accounts.',
    benefits: [
      'Historical maintenance coverage',
      'Manufacturing process expertise'
    ],
    logo: '',
    relatedPortfolio: [],
    visibility: 'Internal'
  })
]

export const cmsSeedActivities: CmsActivity[] = [
  {
    id: 'ACT-001',
    kind: 'portfolio',
    type: 'updated',
    contentTitle: 'Digital Banking Transformation',
    actor: 'Roland Brilianto',
    timestamp: '2026-10-25T09:15:00.000Z'
  },
  {
    id: 'ACT-002',
    kind: 'partnership',
    type: 'published',
    contentTitle: 'Google Cloud',
    actor: 'Nadia Safitri',
    timestamp: '2026-10-25T07:20:00.000Z'
  },
  {
    id: 'ACT-003',
    kind: 'portfolio',
    type: 'updated',
    contentTitle: 'Healthcare Management System',
    actor: 'Arief Nugroho',
    timestamp: '2026-10-24T06:15:00.000Z'
  },
  {
    id: 'ACT-004',
    kind: 'partnership',
    type: 'updated',
    contentTitle: 'RetailFlow Digital',
    actor: 'Jessica Tan',
    timestamp: '2026-10-23T11:25:00.000Z'
  },
  {
    id: 'ACT-005',
    kind: 'portfolio',
    type: 'published',
    contentTitle: 'Retail Analytics Platform',
    actor: 'Rizky Hidayat',
    timestamp: '2026-10-22T08:30:00.000Z'
  },
  {
    id: 'ACT-006',
    kind: 'partnership',
    type: 'created',
    contentTitle: 'PT Nusantara Teknologi',
    actor: 'Sarah Wijaya',
    timestamp: '2026-10-22T06:10:00.000Z'
  },
  {
    id: 'ACT-007',
    kind: 'portfolio',
    type: 'archived',
    contentTitle: 'Legacy System Migration',
    actor: 'Putri Anggraini',
    timestamp: '2026-10-05T10:40:00.000Z'
  },
  {
    id: 'ACT-008',
    kind: 'partnership',
    type: 'archived',
    contentTitle: 'LegacyCore Systems',
    actor: 'Cindy Aurelia',
    timestamp: '2026-09-28T05:50:00.000Z'
  }
]
