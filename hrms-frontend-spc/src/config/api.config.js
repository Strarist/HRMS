/**
 * Centralized API Configuration
 * Automatically switches between local and production environments
 * 
 * DEVELOPMENT (npm run dev):
 *   - Uses '/api' which is proxied to http://localhost:5001 via Vite
 *   - No CORS issues, seamless local development
 * 
 * PRODUCTION (npm run build):
 *   - Uses VITE_API_URL from environment variables
 *   - Falls back to default production URL if not set
 */

const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging'
};

// Detect current environment
const getCurrentEnvironment = () => {
  if (import.meta.env.DEV) {
    return ENV.DEVELOPMENT;
  }
  
  if (import.meta.env.MODE === 'staging') {
    return ENV.STAGING;
  }
  
  return ENV.PRODUCTION;
};

// Get API base URL based on environment
const getApiBaseUrl = (env) => {
  switch (env) {
    case ENV.DEVELOPMENT: {
      // Prefer VITE_API_URL; default matches backend PORT=5001
      const base = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');
      return base.endsWith('/api') ? base : `${base}/api`;
    }
      
    case ENV.STAGING: {
      const base = (import.meta.env.VITE_API_URL || 'https://hrms-backend-staging.onrender.com').replace(/\/$/, '');
      return base.endsWith('/api') ? base : `${base}/api`;
    }
      
    case ENV.PRODUCTION:
    default: {
      // Relative /api for nginx proxy, or absolute VITE_API_URL when hosted separately
      if (!import.meta.env.VITE_API_URL) return '/api';
      const base = import.meta.env.VITE_API_URL.replace(/\/$/, '');
      return base.endsWith('/api') ? base : `${base}/api`;
    }
  }
};

// Get frontend URL based on environment
const getFrontendUrl = (env) => {
  switch (env) {
    case ENV.DEVELOPMENT:
      return 'http://localhost:5173';
      
    case ENV.STAGING:
      return import.meta.env.VITE_FRONTEND_URL || 'https://hrms-staging.vercel.app';
      
    case ENV.PRODUCTION:
    default:
      return import.meta.env.VITE_FRONTEND_URL || 'https://hrms-frontend-blush.vercel.app';
  }
};

// Get current environment
const currentEnv = getCurrentEnvironment();

// Export configuration
export const config = {
  env: currentEnv,
  isDevelopment: currentEnv === ENV.DEVELOPMENT,
  isProduction: currentEnv === ENV.PRODUCTION,
  isStaging: currentEnv === ENV.STAGING,
  
  // API Configuration
  apiBaseUrl: getApiBaseUrl(currentEnv),
  frontendUrl: getFrontendUrl(currentEnv),
  
  // Timeout settings
  apiTimeout: 300000, // 5 minutes (increased for long-running operations like resume parsing)
  
  // Feature flags (can be controlled via env variables)
  features: {
    aiAnalysis: import.meta.env.VITE_ENABLE_AI_ANALYSIS !== 'false',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  }
};

// Configuration logging removed for production

export default config;
