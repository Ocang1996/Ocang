/**
 * Main configuration file for the ASN Dashboard frontend
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Base URL for API calls - change this to your server's IP address in local network
  // For development: http://localhost:5000
  // For production in local network: http://192.168.1.x:5000
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // Headers to include in API requests
  HEADERS: {
    'Accept': 'application/json',
    'X-App-Version': '1.0.0'
  },
  
  // API endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      VERIFY: '/auth/verify',
      REFRESH: '/auth/refresh',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    
    // Employee endpoints
    EMPLOYEES: {
      BASE: '/employees',
      GET_ALL: '/employees',
      GET_BY_ID: (id: string) => `/employees/${id}`,
      CREATE: '/employees',
      UPDATE: (id: string) => `/employees/${id}`,
      DELETE: (id: string) => `/employees/${id}`,
    },
    
    // Work unit endpoints
    WORK_UNITS: {
      BASE: '/work-units',
      GET_ALL: '/work-units',
      GET_BY_ID: (id: string) => `/work-units/${id}`,
      CREATE: '/work-units',
      UPDATE: (id: string) => `/work-units/${id}`,
      DELETE: (id: string) => `/work-units/${id}`,
    },
    
    // Dashboard stats
    STATS: {
      OVERVIEW: '/stats/overview',
      EMPLOYEE_TYPES: '/stats/employee-types',
      GENDER_DISTRIBUTION: '/stats/gender-distribution',
      AGE_DISTRIBUTION: '/stats/age-distribution',
      WORK_UNIT_DISTRIBUTION: '/stats/work-unit-distribution',
      EDUCATION_DISTRIBUTION: '/stats/education-distribution',
      RANK_DISTRIBUTION: '/stats/rank-distribution',
      POSITION_DISTRIBUTION: '/stats/position-distribution',
      RETIREMENT_BUP: '/stats/retirement-bup',
      DETAILED: '/stats/detailed',
    },
    
    // User management
    USERS: {
      BASE: '/users',
      GET_ALL: '/users',
      GET_BY_ID: (id: string) => `/users/${id}`,
      CREATE: '/users',
      UPDATE: (id: string) => `/users/${id}`,
      DELETE: (id: string) => `/users/${id}`,
    },
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Set to false to use mock data
  USE_BACKEND: false,
};

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  // Application name
  APP_NAME: 'ASN Dashboard',
  
  // Version
  APP_VERSION: '1.0.0',
  
  // Theme options
  THEME: {
    // Enable dark mode
    DARK_MODE_ENABLED: true,
    
    // Default theme ('light' or 'dark')
    DEFAULT_THEME: 'light',
    
    // Primary color (tailwind color)
    PRIMARY_COLOR: 'blue',
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'asn_auth_token',
    USER_DATA: 'asn_user_data',
    SETTINGS: 'asn_settings',
    THEME: 'asn_theme',
  },
  
  DEFAULT_LANGUAGE: 'id',
};

/**
 * Application configuration settings
 */

/**
 * Image handling configuration
 */
export const IMAGE_CONFIG = {
  // Maximum file size in bytes (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Compression settings
  COMPRESSION: {
    // Target size after compression (1MB - updated from 2MB)
    TARGET_SIZE: 1 * 1024 * 1024,
    
    // Max dimensions for resizing (updated from 1200x1200)
    MAX_WIDTH: 1000,
    MAX_HEIGHT: 1000,
    
    // Default quality for JPEG compression (0-1) (updated from 0.9)
    DEFAULT_QUALITY: 0.8,
    
    // Quality for large images (0-1) (updated from 0.7) 
    LARGE_IMAGE_QUALITY: 0.6,
    
    // Size threshold to use lower quality (3MB)
    LARGE_IMAGE_THRESHOLD: 3 * 1024 * 1024
  },
  
  // Thumbnail settings
  THUMBNAIL: {
    MAX_DIMENSION: 200,
    QUALITY: 0.7
  },
  
  // Allowed image types
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif']
};

// Exported configs can be imported directly using named imports