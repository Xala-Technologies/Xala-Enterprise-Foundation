/**
 * Norwegian Compliance Examples
 *
 * Complete examples for implementing NSM, GDPR, and DigDir compliance
 * using the Foundation package.
 */

import {
  createGDPRAuditLog,
  createLogger,
  createNSMClassifiedLog,
  FeatureToggle,
  HealthCheck,
  NORWEGIAN_COMPLIANCE,
} from '../../src';

// Example 1: NSM Security Classification Implementation
function nsmSecurityExamples() {
  const logger = createLogger({ complianceEnabled: true });

  // Different NSM classification levels
  const classifications = NORWEGIAN_COMPLIANCE.NSM_CLASSIFICATIONS;

  classifications.forEach(classification => {
    createNSMClassifiedLog(classification, `Example log for ${classification}`, {
      operation: 'security_demonstration',
      timestamp: new Date().toISOString(),
    });
  });

  // Feature toggle with NSM classification
  const featureToggle = new FeatureToggle();

  featureToggle.register({
    key: 'classified_data_access',
    enabled: true,
    nsmClassification: 'KONFIDENSIELT',
    description: 'Access to confidential citizen data',
  });

  // Check access based on security clearance
  const hasAccess = featureToggle.isEnabled('classified_data_access', {
    userId: 'employee001',
    attributes: {
      securityClearance: 'KONFIDENSIELT',
      department: 'social_services',
    },
  });

  logger.info('NSM access check completed', {
    hasAccess,
    nsmClassification: 'BEGRENSET',
  });
}

// Example 2: GDPR Data Protection Implementation
async function gdprComplianceExamples() {
  const logger = createLogger({ complianceEnabled: true });
  const publisher = new EventPublisher();

  // GDPR audit logging for different legal basis
  const gdprBasisExamples = NORWEGIAN_COMPLIANCE.GDPR_LEGAL_BASIS;

  for (const basis of gdprBasisExamples) {
    createGDPRAuditLog('data_processing', 'citizen_data', {
      userId: 'citizen123',
      gdprBasis: basis,
      personalDataIncluded: true,
    });
  }

  // Event publishing with GDPR compliance
  await publisher.publish({
    type: 'citizen.profile.updated',
    data: {
      profileId: 'citizen123',
      changes: ['address', 'phone'],
    },
    metadata: {
      gdprBasis: 'consent',
      personalDataIncluded: true,
      retentionPeriod: 'P7Y',
      auditRequired: true,
    },
    nsmClassification: 'BEGRENSET',
  });

  // Data retention compliance
  logger.audit(
    {
      action: 'data_retention_check',
      entityType: 'citizen_data',
      timestamp: new Date(),
      gdprBasis: 'public_task',
      personalDataIncluded: true,
      nsmClassification: 'BEGRENSET',
    },
    {
      retentionPolicy: {
        period: 'P7Y',
        lastReview: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    }
  );
}

// Example 3: DigDir Standards Implementation
async function digdirStandardsExamples() {
  const healthCheck = new HealthCheck();
  const logger = createLogger({ complianceEnabled: true });

  // Register DigDir compliance health checks
  healthCheck.register({
    name: 'digdir_api_compliance',
    check: async () => {
      // Example API compliance check
      const complianceChecks = {
        restfulAPI: true,
        jsonFormat: true,
        httpStatus: true,
        authentication: true,
        rateLimit: true,
      };

      const allCompliant = Object.values(complianceChecks).every(Boolean);

      return {
        status: allCompliant ? 'healthy' : 'degraded',
        message: allCompliant ? 'DigDir API standards compliant' : 'API compliance issues detected',
        metadata: complianceChecks,
      };
    },
    tags: ['compliance', 'digdir', 'api'],
  });

  // Accessibility compliance (WCAG 2.2 AA)
  healthCheck.register({
    name: 'accessibility_compliance',
    check: async () => {
      const accessibilityChecks = {
        keyboardNavigation: true,
        screenReaderSupport: true,
        colorContrast: true,
        alternativeText: true,
        languageAttributes: true,
      };

      const accessible = Object.values(accessibilityChecks).every(Boolean);

      return {
        status: accessible ? 'healthy' : 'unhealthy',
        message: accessible ? 'WCAG 2.2 AA compliant' : 'Accessibility issues detected',
        metadata: accessibilityChecks,
      };
    },
    tags: ['compliance', 'accessibility', 'wcag'],
  });

  const results = await healthCheck.checkAll();

  logger.info('DigDir compliance check completed', {
    results,
    nsmClassification: 'ÅPEN',
    compliance: {
      digdirStandards: true,
      accessibilityLevel: 'AA',
    },
  });
}

// Example 4: Municipal Integration
function municipalIntegrationExample() {
  const logger = createLogger({ complianceEnabled: true });

  // Norwegian municipalities from the compliance constants
  const validMunicipalities = NORWEGIAN_COMPLIANCE.NORWEGIAN_MUNICIPALITIES;

  function validateMunicipalityCode(code: string): boolean {
    return validMunicipalities.includes(code);
  }

  // Example municipality configurations
  const municipalityExamples = [
    { code: '0301', name: 'Oslo', language: 'nb' },
    { code: '4601', name: 'Bergen', language: 'nb' },
    { code: '5001', name: 'Trondheim', language: 'nb' },
  ];

  municipalityExamples.forEach(municipality => {
    const isValid = validateMunicipalityCode(municipality.code);

    logger.info('Municipality validation', {
      municipality: municipality.name,
      code: municipality.code,
      valid: isValid,
      language: municipality.language,
      nsmClassification: 'ÅPEN',
    });

    if (isValid) {
      createGDPRAuditLog('municipality_access', 'citizen_services', {
        userId: 'system',
        gdprBasis: 'public_task',
        personalDataIncluded: false,
      });
    }
  });
}

// Example 5: Complete Compliance Workflow
async function completeComplianceWorkflow() {
  const logger = createLogger({ complianceEnabled: true });

  try {
    // Step 1: NSM Security Check
    logger.info('Starting compliance workflow', {
      nsmClassification: 'BEGRENSET',
      workflow: 'citizen_data_processing',
    });

    // Step 2: GDPR Validation
    createGDPRAuditLog('workflow_start', 'citizen_data', {
      userId: 'employee001',
      gdprBasis: 'public_task',
      personalDataIncluded: true,
    });

    // Step 3: Data Processing with Classification
    createNSMClassifiedLog('BEGRENSET', 'Processing citizen application', {
      operation: 'application_processing',
      dataType: 'personal_information',
      processor: 'municipal_employee',
    });

    // Step 4: Compliance Validation
    const complianceStatus = {
      nsmCompliant: true,
      gdprCompliant: true,
      digdirCompliant: true,
    };

    // Step 5: Audit Trail Completion
    logger.audit(
      {
        action: 'compliance_workflow_completed',
        entityType: 'citizen_application',
        timestamp: new Date(),
        gdprBasis: 'public_task',
        personalDataIncluded: true,
        nsmClassification: 'BEGRENSET',
      },
      {
        workflowStatus: complianceStatus,
        processingTime: '00:02:30',
        complianceChecks: 'all_passed',
      }
    );

    logger.info('Compliance workflow completed successfully', {
      nsmClassification: 'BEGRENSET',
      status: complianceStatus,
    });
  } catch (error) {
    logger.error('Compliance workflow failed', error as Error, {
      nsmClassification: 'BEGRENSET',
      operation: 'citizen_data_processing',
    });
  }
}

// Export all examples for use
export {
  completeComplianceWorkflow,
  digdirStandardsExamples,
  gdprComplianceExamples,
  municipalIntegrationExample,
  nsmSecurityExamples,
};
