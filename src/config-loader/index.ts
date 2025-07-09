/**
 * Configuration Loader Module
 * Centralized configuration management for Norwegian government-compliant applications
 */

// Core configuration types and interfaces
export interface ConfigOptions {
  environment?: string;
  configPath?: string;
  enableNorwegianCompliance?: boolean;
}

export interface FoundationConfig {
  environment: string;
  municipality?: string;
  language?: string;
  norwegianCompliance: ReturnType<typeof getNorwegianComplianceConfig> | null;
  securityConfig: ReturnType<typeof getSecurityConfig>;
  database: ReturnType<typeof getDatabaseConfig>;
  logging: ReturnType<typeof getLoggingConfig>;
  compliance?: {
    nsmClassification?: string;
    gdprEnabled?: boolean;
    retentionPeriod?: string;
    norwegian?: boolean;
    nsm?: boolean;
    gdpr?: boolean;
    encryption?: boolean;
  };
  security?: ReturnType<typeof getSecurityConfig>;
  modules?: {
    [key: string]: {
      enabled?: boolean;
      [key: string]: unknown;
    };
  };
  features?: {
    [key: string]: boolean;
  };
  i18n?: {
    supportedLanguages?: string[];
    defaultLanguage?: string;
    fallbackLanguage?: string;
    [key: string]: unknown;
  };
  norwegian?: {
    digdirIntegration?: boolean;
    idPortenReady?: boolean;
  };
}

// Main configuration loader function
export const loadConfig = (options: ConfigOptions = {}): FoundationConfig => {
  const {
    environment = process.env['NODE_ENV'] || 'development',
    enableNorwegianCompliance = true,
  } = options;

  const securityConfig = getSecurityConfig();

  return {
    environment,
    norwegianCompliance: enableNorwegianCompliance ? getNorwegianComplianceConfig() : null,
    securityConfig,
    security: securityConfig, // Alias for backward compatibility
    database: getDatabaseConfig(),
    logging: getLoggingConfig(),
  };
};

// Norwegian compliance configuration
export const getNorwegianComplianceConfig = () => ({
  nsm: {
    securityClassification: process.env['NSM_CLASSIFICATION'] || 'BEGRENSET',
    auditRequired: true,
    encryptionRequired: true,
  },
  gdpr: {
    enabled: true,
    dataProcessingBasis: 'public_task',
    retentionPeriod: 'P7Y', // 7 years ISO 8601 duration
    privacyByDesign: true,
  },
  digdir: {
    interoperabilityStandards: true,
    accessibilityLevel: 'AA',
    dataFormats: ['JSON', 'XML'],
  },
});

// Security configuration
export const getSecurityConfig = () => ({
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotationEnabled: true,
  },
  authentication: {
    mfaRequired: true,
    sessionTimeout: 3600, // 1 hour
  },
  accessControl: {
    enabled: true,
    rbacEnabled: true,
    permissionModel: 'strict',
  },
  auditTrail: {
    enabled: true,
    retentionPeriod: 'P7Y',
    logAllAccess: true,
  },
});

// Database configuration
export const getDatabaseConfig = () => ({
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432'),
  database: process.env['DB_NAME'] || 'foundation',
  ssl: process.env['NODE_ENV'] === 'production',
});

// Logging configuration
export const getLoggingConfig = () => ({
  level: process.env['LOG_LEVEL'] || 'info',
  auditEnabled: true,
  complianceLogging: true,
  structuredLogging: true,
});
