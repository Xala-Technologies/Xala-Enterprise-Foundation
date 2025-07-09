/**
 * Foundation Configuration Examples
 *
 * Demonstrates various configuration patterns for Norwegian government applications
 */

import { FoundationConfig } from '../../src/config-loader';

// Example 1: Basic Municipal Configuration
export const osloMunicipalConfig: FoundationConfig = {
  environment: 'production',
  municipality: '0301', // Oslo
  language: 'nb',

  compliance: {
    nsmClassification: 'BEGRENSET',
    gdprEnabled: true,
    auditRequired: true,
  },

  norwegianCompliance: {
    nsm: {
      securityClassification: 'BEGRENSET',
      auditRequired: true,
      encryptionRequired: true,
      accessControl: true,
    },
    gdpr: {
      enabled: true,
      dataProcessingBasis: 'public_task',
      retentionPeriod: 'P7Y',
      consentManagement: true,
      rightToErasure: true,
    },
    digdir: {
      interoperabilityStandards: true,
      accessibilityLevel: 'AA',
      dataFormats: ['JSON', 'XML'],
      apiStandards: 'REST',
    },
  },
};

// Example 2: High-Security Healthcare Configuration
export const healthcareConfig: FoundationConfig = {
  environment: 'production',
  municipality: '4601', // Bergen
  language: 'nb',

  compliance: {
    nsmClassification: 'KONFIDENSIELT',
    gdprEnabled: true,
    auditRequired: true,
  },

  norwegianCompliance: {
    nsm: {
      securityClassification: 'KONFIDENSIELT',
      auditRequired: true,
      encryptionRequired: true,
      accessControl: true,
      multiFactorAuth: true,
    },
    gdpr: {
      enabled: true,
      dataProcessingBasis: 'vital_interests',
      retentionPeriod: 'P30Y', // Healthcare records
      consentManagement: true,
      rightToErasure: false, // Healthcare exception
      specialCategories: true,
    },
    digdir: {
      interoperabilityStandards: true,
      accessibilityLevel: 'AAA', // Higher standard for healthcare
      dataFormats: ['HL7', 'JSON', 'XML'],
      apiStandards: 'REST',
    },
  },

  security: {
    encryption: true,
    accessControl: true,
    auditTrail: true,
    sessionTimeout: 900, // 15 minutes for healthcare
    passwordPolicy: {
      minLength: 12,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
    },
  },
};

// Example 3: Development Environment Configuration
export const developmentConfig: FoundationConfig = {
  environment: 'development',
  municipality: '0301',
  language: 'nb',

  compliance: {
    nsmClassification: 'ÅPEN',
    gdprEnabled: false, // Disabled for development
    auditRequired: false,
  },

  norwegianCompliance: {
    nsm: {
      securityClassification: 'ÅPEN',
      auditRequired: false,
      encryptionRequired: false,
      accessControl: false,
    },
    gdpr: {
      enabled: false,
      dataProcessingBasis: 'development',
      retentionPeriod: 'P1M',
      consentManagement: false,
      rightToErasure: true,
    },
    digdir: {
      interoperabilityStandards: false,
      accessibilityLevel: 'A',
      dataFormats: ['JSON'],
      apiStandards: 'REST',
    },
  },

  logging: {
    level: 'debug',
    enableConsole: true,
    enableFile: false,
    enableAudit: false,
  },
};

// Example 4: Multi-language Regional Configuration
export const multiLanguageConfig: FoundationConfig = {
  environment: 'production',
  municipality: '5001', // Trondheim
  language: 'nb',

  i18n: {
    supportedLanguages: ['nb', 'nn', 'en', 'se'], // Including Sami
    defaultLanguage: 'nb',
    fallbackLanguage: 'nb',
    dateFormats: {
      nb: 'dd.MM.yyyy',
      nn: 'dd.MM.yyyy',
      en: 'MM/dd/yyyy',
      se: 'dd.MM.yyyy',
    },
    numberFormats: {
      nb: 'nb-NO',
      nn: 'nn-NO',
      en: 'en-NO',
      se: 'se-NO',
    },
  },

  compliance: {
    nsmClassification: 'BEGRENSET',
    gdprEnabled: true,
    auditRequired: true,
  },

  norwegianCompliance: {
    nsm: {
      securityClassification: 'BEGRENSET',
      auditRequired: true,
      encryptionRequired: true,
    },
    gdpr: {
      enabled: true,
      dataProcessingBasis: 'public_task',
      retentionPeriod: 'P7Y',
      multilingualSupport: true,
    },
    digdir: {
      interoperabilityStandards: true,
      accessibilityLevel: 'AA',
      multilingualAPI: true,
    },
  },
};

// Example 5: Feature-Rich Enterprise Configuration
export const enterpriseConfig: FoundationConfig = {
  environment: 'production',
  municipality: '0301',
  language: 'nb',

  compliance: {
    nsmClassification: 'BEGRENSET',
    gdprEnabled: true,
    auditRequired: true,
  },

  norwegianCompliance: {
    nsm: {
      securityClassification: 'BEGRENSET',
      auditRequired: true,
      encryptionRequired: true,
      accessControl: true,
    },
    gdpr: {
      enabled: true,
      dataProcessingBasis: 'public_task',
      retentionPeriod: 'P7Y',
      consentManagement: true,
      rightToErasure: true,
    },
    digdir: {
      interoperabilityStandards: true,
      accessibilityLevel: 'AA',
      dataFormats: ['JSON', 'XML', 'RDF'],
      apiStandards: 'REST',
    },
  },

  features: {
    metrics: true,
    healthcheck: true,
    featureToggles: true,
    eventPublishing: true,
    i18n: true,
    caching: true,
    rateLimit: true,
  },

  modules: {
    'config-loader': { enabled: true },
    'error-handler': { enabled: true },
    'event-core': { enabled: true },
    'feature-toggle': { enabled: true },
    healthcheck: { enabled: true },
    'i18n-core': { enabled: true },
    logger: { enabled: true },
    'metrics-sdk': { enabled: true },
    'saga-orchestrator': { enabled: true },
  },
};

// Configuration Helper Functions
export function createMunicipalConfig(
  municipalityCode: string,
  nsmClassification: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG' = 'BEGRENSET'
): FoundationConfig {
  return {
    environment: 'production',
    municipality: municipalityCode,
    language: 'nb',

    compliance: {
      nsmClassification,
      gdprEnabled: true,
      auditRequired: true,
    },

    norwegianCompliance: {
      nsm: {
        securityClassification: nsmClassification,
        auditRequired: true,
        encryptionRequired: nsmClassification !== 'ÅPEN',
      },
      gdpr: {
        enabled: true,
        dataProcessingBasis: 'public_task',
        retentionPeriod: 'P7Y',
      },
      digdir: {
        interoperabilityStandards: true,
        accessibilityLevel: 'AA',
      },
    },
  };
}

// Export all configurations
export const EXAMPLE_CONFIGS = {
  oslo: osloMunicipalConfig,
  healthcare: healthcareConfig,
  development: developmentConfig,
  multiLanguage: multiLanguageConfig,
  enterprise: enterpriseConfig,
};
