export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
    REFRESH: '/api/v1/auth/refresh',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    // Endpoint Email Verification & Resend OTP:
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    RESEND_OTP: '/api/v1/auth/resend-otp',
    GOOGLE_LOGIN: '/api/v1/auth/google/login',
    GOOGLE_CALLBACK: '/api/v1/auth/google/callback'
  },
  ROLES: {
    BASE: '/api/v1/roles',
    REQUESTS: '/api/v1/role-requests',
    MY_REQUEST: '/api/v1/role-requests/me'
  },
  USERS: {
    BASE: '/api/v1/users',
    MANAGEMENT_STATS: '/api/v1/users/management-stats'
  },
  DIVISIONS: {
    BASE: '/api/v1/divisions'
  },
  PERMISSIONS: {
    BASE: '/api/v1/permissions'
  },
  MASTER_DATA: {
    BASE: '/api/v1/master-data'
  },
  PROJECTS: {
    BASE: '/api/v1/projects',
    IMPORT_TEMPLATE: '/api/v1/projects/import/template',
    IMPORT_PREVIEW: '/api/v1/projects/import/preview',
    IMPORT_CONFIRM: '/api/v1/projects/import/confirm',
    DETAIL: (projectId: string) => `/api/v1/projects/${projectId}`,
    FILES: (projectId: string) => `/api/v1/projects/${projectId}/files`,
    FILE_DETAIL: (projectId: string, fileId: string) =>
      `/api/v1/projects/${projectId}/files/${fileId}`,
    FILE_DOWNLOAD: (projectId: string, fileId: string) =>
      `/api/v1/projects/${projectId}/files/${fileId}/download`,
    CUSTOMER: (projectId: string) => `/api/v1/projects/${projectId}/customer`,
    FINANCIAL: (projectId: string) => `/api/v1/projects/${projectId}/financial`,
    PRODUCTS: (projectId: string) => `/api/v1/projects/${projectId}/products`,
    TECH_STACKS: (projectId: string) => `/api/v1/projects/${projectId}/tech-stacks`,
    PARTNERS: (projectId: string) => `/api/v1/projects/${projectId}/partners`,
    SUCCESS_METRICS: (projectId: string) => `/api/v1/projects/${projectId}/success-metrics`
  },
  PRODUCTS: {
    BASE: '/api/v1/products'
  },
  TECH_STACKS: {
    BASE: '/api/v1/tech-stacks'
  },
  PARTNERS: {
    BASE: '/api/v1/partners'
  },
  CUSTOMERS: {
    NAMES: '/api/v1/customers/names',
    LOCATIONS: '/api/v1/customers/locations'
  },
  DASHBOARD: {
    SUMMARY: '/api/v1/dashboard/summary',
    PROJECTS_BY_BUSINESS_UNIT: '/api/v1/dashboard/projects-by-business-unit',
    PROJECTS_BY_INDUSTRY: '/api/v1/dashboard/projects-by-industry'
  }
} as const
