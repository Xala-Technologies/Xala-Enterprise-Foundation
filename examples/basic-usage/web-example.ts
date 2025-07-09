/**
 * Basic Web Platform Example
 *
 * Demonstrates how to initialize the Foundation package for web applications
 * with Norwegian government compliance.
 */

import { setupWebFoundation } from '../../platforms/web';
import { createLogger, FoundationConfig, initializeFoundation } from '../../src';

// Example 1: Basic Foundation Initialization
async function basicSetup() {
  const foundation = await initializeFoundation({
    environment: 'production',
    enableNorwegianCompliance: true,
    enableAuditLogging: true,
    enableMetrics: true,
    enableHealthChecks: true,
  });

  console.log('Foundation initialized:', foundation);
  return foundation;
}

// Example 2: Web Platform Setup with Compliance
async function webPlatformSetup() {
  const config: FoundationConfig = {
    environment: 'production',
    municipality: '0301', // Oslo Kommune
    language: 'nb', // Norwegian Bokmål
    compliance: {
      nsmClassification: 'BEGRENSET',
      gdprEnabled: true,
    },
    securityConfig: {
      encryption: {
        algorithm: 'AES-256-GCM',
        keyRotationEnabled: true,
      },
      authentication: {
        mfaRequired: true,
        sessionTimeout: 3600,
      },
    },
    database: {
      host: 'localhost',
      port: 5432,
      database: 'foundation',
      ssl: true,
    },
    logging: {
      level: 'info',
      auditEnabled: true,
      complianceLogging: true,
      structuredLogging: true,
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
        privacyByDesign: true,
      },
      digdir: {
        interoperabilityStandards: true,
        accessibilityLevel: 'AA',
        dataFormats: ['JSON', 'XML'],
      },
    },
  };

  await setupWebFoundation(config);
  console.log('Web platform configured for Norwegian compliance');
}

// Example 3: Logger with Norwegian Compliance
function createComplianceLogger() {
  const logger = createLogger({
    level: 'info',
    auditEnabled: true,
    complianceEnabled: true,
  });

  // Log with NSM classification
  logger.info('Citizen portal accessed', {
    nsmClassification: 'BEGRENSET',
    userId: 'employee001',
    operation: 'citizen_profile_view',
  });

  // Audit log for GDPR compliance
  logger.audit({
    action: 'data_access',
    entityType: 'citizen_profile',
    userId: 'citizen123',
    timestamp: new Date(),
    gdprBasis: 'public_task',
    personalDataIncluded: true,
    nsmClassification: 'BEGRENSET',
  });

  return logger;
}

// Example 4: Error Handling with Compliance
function setupErrorHandling() {
  // This would typically be in your error boundary or global error handler
  window.addEventListener('error', event => {
    const logger = createLogger({ complianceEnabled: true });

    logger.error('Application error occurred', event.error, {
      nsmClassification: 'BEGRENSET',
      operation: 'citizen_portal_navigation',
      compliance: {
        gdprRelevant: false,
        auditRequired: true,
      },
    });
  });
}

// Usage Examples
export { basicSetup, createComplianceLogger, setupErrorHandling, webPlatformSetup };
