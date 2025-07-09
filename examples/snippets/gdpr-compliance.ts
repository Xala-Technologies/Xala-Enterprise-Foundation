/**
 * GDPR Compliance Snippets
 *
 * Reusable code snippets for implementing GDPR (General Data Protection Regulation)
 * compliance in Norwegian municipal applications.
 */

import { createGDPRAuditLog, createLogger, getEventPublisher } from '../../src';

// GDPR Legal Basis Types
export const GDPR_LEGAL_BASIS = {
  CONSENT: 'consent',
  CONTRACT: 'contract',
  LEGAL_OBLIGATION: 'legal_obligation',
  VITAL_INTERESTS: 'vital_interests',
  PUBLIC_TASK: 'public_task',
  LEGITIMATE_INTERESTS: 'legitimate_interests',
} as const;

// Snippet 1: GDPR Audit Logging
export function createGDPRAudit(
  action: string,
  dataType: string,
  userId: string,
  legalBasis: keyof typeof GDPR_LEGAL_BASIS,
  options?: {
    personalData?: boolean;
    specialCategories?: boolean;
    retentionPeriod?: string;
    consentId?: string;
  }
) {
  createGDPRAuditLog(action, dataType, {
    userId,
    gdprBasis: GDPR_LEGAL_BASIS[legalBasis],
    personalDataIncluded: options?.personalData ?? true,
    specialCategories: options?.specialCategories ?? false,
    retentionPeriod: options?.retentionPeriod,
    consentId: options?.consentId,
    timestamp: new Date().toISOString(),
  });
}

// Example usage:
// createGDPRAudit('data_access', 'citizen_profile', 'emp001', 'PUBLIC_TASK');

// Snippet 2: GDPR Consent Management
export class GDPRConsentManager {
  private logger = createLogger({ complianceEnabled: true });

  recordConsent(
    subjectId: string,
    purpose: string,
    dataTypes: string[],
    processingBasis: keyof typeof GDPR_LEGAL_BASIS = 'CONSENT'
  ) {
    const consentId = this.generateConsentId();

    this.logger.audit(
      {
        action: 'consent_recorded',
        entityType: 'gdpr_consent',
        timestamp: new Date(),
        gdprBasis: GDPR_LEGAL_BASIS[processingBasis],
        personalDataIncluded: true,
        nsmClassification: 'BEGRENSET',
      },
      {
        consentId,
        subjectId,
        purpose,
        dataTypes,
        timestamp: new Date().toISOString(),
        status: 'active',
      }
    );

    return consentId;
  }

  withdrawConsent(consentId: string, subjectId: string) {
    this.logger.audit(
      {
        action: 'consent_withdrawn',
        entityType: 'gdpr_consent',
        timestamp: new Date(),
        gdprBasis: 'consent',
        personalDataIncluded: true,
        nsmClassification: 'BEGRENSET',
      },
      {
        consentId,
        subjectId,
        withdrawalTimestamp: new Date().toISOString(),
        status: 'withdrawn',
      }
    );
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

// Example usage:
// const consentManager = new GDPRConsentManager();
// const consentId = consentManager.recordConsent('citizen123', 'health_services', ['medical_records']);

// Snippet 3: GDPR Data Subject Rights
export class GDPRDataSubjectRights {
  private logger = createLogger({ complianceEnabled: true });
  private publisher = getEventPublisher();

  async handleDataSubjectRequest(
    type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction',
    subjectId: string,
    requestDetails: Record<string, unknown>
  ) {
    const requestId = this.generateRequestId();

    // Log the request
    this.logger.audit(
      {
        action: `gdpr_${type}_request`,
        entityType: 'data_subject_request',
        timestamp: new Date(),
        gdprBasis: 'legal_obligation',
        personalDataIncluded: true,
        nsmClassification: 'BEGRENSET',
      },
      {
        requestId,
        subjectId,
        requestType: type,
        requestDetails,
        status: 'received',
      }
    );

    // Publish event for processing
    await this.publisher.publish({
      type: `gdpr.subject.${type}_request`,
      data: {
        requestId,
        subjectId,
        requestType: type,
        details: requestDetails,
      },
      metadata: {
        gdprBasis: 'legal_obligation',
        personalDataIncluded: true,
        auditRequired: true,
      },
      nsmClassification: 'BEGRENSET',
    });

    return requestId;
  }

  async fulfillDataAccess(subjectId: string, requestId: string) {
    const personalData = await this.collectPersonalData(subjectId);

    this.logger.audit(
      {
        action: 'gdpr_data_provided',
        entityType: 'data_subject_request',
        timestamp: new Date(),
        gdprBasis: 'legal_obligation',
        personalDataIncluded: true,
        nsmClassification: 'BEGRENSET',
      },
      {
        requestId,
        subjectId,
        dataProvided: Object.keys(personalData),
        fulfillmentDate: new Date().toISOString(),
      }
    );

    return personalData;
  }

  private async collectPersonalData(subjectId: string): Promise<Record<string, unknown>> {
    // This would collect data from various sources
    return {
      profile: { id: subjectId, name: 'Example Name' },
      services: ['health_records', 'education'],
      consents: ['marketing', 'analytics'],
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

// Example usage:
// const subjectRights = new GDPRDataSubjectRights();
// const requestId = await subjectRights.handleDataSubjectRequest('access', 'citizen123', {
//   email: 'citizen@example.com',
//   description: 'Request all personal data'
// });

// Snippet 4: GDPR Data Retention Management
export class GDPRDataRetention {
  private logger = createLogger({ complianceEnabled: true });

  setRetentionPolicy(
    dataType: string,
    retentionPeriod: string,
    legalBasis: keyof typeof GDPR_LEGAL_BASIS
  ) {
    this.logger.audit(
      {
        action: 'retention_policy_set',
        entityType: 'gdpr_retention',
        timestamp: new Date(),
        gdprBasis: GDPR_LEGAL_BASIS[legalBasis],
        personalDataIncluded: false,
        nsmClassification: 'ÅPEN',
      },
      {
        dataType,
        retentionPeriod,
        legalBasis: GDPR_LEGAL_BASIS[legalBasis],
        setDate: new Date().toISOString(),
      }
    );
  }

  checkRetentionCompliance(
    dataId: string,
    dataType: string,
    createdDate: Date,
    retentionPeriod: string
  ): boolean {
    const retentionEndDate = this.calculateRetentionEnd(createdDate, retentionPeriod);
    const isExpired = new Date() > retentionEndDate;

    if (isExpired) {
      this.logger.audit(
        {
          action: 'data_retention_expired',
          entityType: 'gdpr_retention',
          timestamp: new Date(),
          gdprBasis: 'legal_obligation',
          personalDataIncluded: true,
          nsmClassification: 'BEGRENSET',
        },
        {
          dataId,
          dataType,
          createdDate: createdDate.toISOString(),
          retentionEndDate: retentionEndDate.toISOString(),
          actionRequired: 'deletion',
        }
      );
    }

    return !isExpired;
  }

  private calculateRetentionEnd(createdDate: Date, period: string): Date {
    // Parse ISO 8601 duration (e.g., P7Y for 7 years)
    const match = period.match(/P(\d+)Y/);
    if (match) {
      const years = parseInt(match[1]);
      return new Date(
        createdDate.getFullYear() + years,
        createdDate.getMonth(),
        createdDate.getDate()
      );
    }
    return new Date(createdDate.getTime() + 7 * 365 * 24 * 60 * 60 * 1000); // Default 7 years
  }
}

// Example usage:
// const retention = new GDPRDataRetention();
// retention.setRetentionPolicy('citizen_data', 'P7Y', 'PUBLIC_TASK');

// Snippet 5: GDPR Impact Assessment
export function conductPrivacyImpactAssessment(processing: {
  purpose: string;
  dataTypes: string[];
  legalBasis: keyof typeof GDPR_LEGAL_BASIS;
  recipients: string[];
  retentionPeriod: string;
  automatedDecisionMaking: boolean;
  specialCategories: boolean;
}): {
  riskLevel: 'low' | 'medium' | 'high';
  requiresDPIA: boolean;
  recommendations: string[];
} {
  const logger = createLogger({ complianceEnabled: true });

  let riskScore = 0;
  const recommendations: string[] = [];

  // Risk assessment
  if (processing.specialCategories) {
    riskScore += 3;
    recommendations.push('Implement additional safeguards for special category data');
  }

  if (processing.automatedDecisionMaking) {
    riskScore += 2;
    recommendations.push('Ensure human oversight for automated decisions');
  }

  if (processing.recipients.includes('third_party')) {
    riskScore += 2;
    recommendations.push('Implement data processing agreements with third parties');
  }

  const riskLevel = riskScore >= 5 ? 'high' : riskScore >= 3 ? 'medium' : 'low';
  const requiresDPIA = riskLevel === 'high' || processing.specialCategories;

  logger.audit(
    {
      action: 'privacy_impact_assessment',
      entityType: 'gdpr_assessment',
      timestamp: new Date(),
      gdprBasis: 'legal_obligation',
      personalDataIncluded: false,
      nsmClassification: 'BEGRENSET',
    },
    {
      processing,
      riskLevel,
      riskScore,
      requiresDPIA,
      recommendations,
      assessmentDate: new Date().toISOString(),
    }
  );

  return { riskLevel, requiresDPIA, recommendations };
}

// Example usage:
// const assessment = conductPrivacyImpactAssessment({
//   purpose: 'municipal_services',
//   dataTypes: ['personal_data', 'contact_info'],
//   legalBasis: 'PUBLIC_TASK',
//   recipients: ['municipal_employees'],
//   retentionPeriod: 'P7Y',
//   automatedDecisionMaking: false,
//   specialCategories: false
// });

// Export all GDPR utilities
export const GDPRUtils = {
  auditLog: createGDPRAudit,
  ConsentManager: GDPRConsentManager,
  DataSubjectRights: GDPRDataSubjectRights,
  DataRetention: GDPRDataRetention,
  impactAssessment: conductPrivacyImpactAssessment,
  legalBasis: GDPR_LEGAL_BASIS,
};
