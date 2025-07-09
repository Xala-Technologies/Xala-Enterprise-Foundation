# Norwegian Compliance Documentation

This document explains how the foundation package implements Norwegian regulatory compliance requirements including NSM security classifications, GDPR data protection, and DigDir interoperability standards.

## Overview

Norwegian government applications must comply with multiple regulatory frameworks. The foundation package provides built-in compliance features that automatically handle these requirements without requiring detailed knowledge of each framework from developers.

### Regulatory Frameworks Supported

- **NSM (Nasjonal sikkerhetsmyndighet)**: National security authority classifications
- **GDPR (General Data Protection Regulation)**: EU data protection requirements
- **DigDir (Digitaliseringsdirektoratet)**: Norwegian digitalization standards
- **Personopplysningsloven**: Norwegian personal data protection law
- **Forvaltningsloven**: Norwegian administrative procedures act

## NSM Security Classifications

The Norwegian National Security Authority (NSM) defines four classification levels for government information. The foundation package automatically enforces these classifications across all data handling operations.

### Classification Levels

```typescript
type NSMSecurityClassification =
  | 'ÅPEN' // Open - Public information
  | 'BEGRENSET' // Restricted - Limited distribution
  | 'KONFIDENSIELT' // Confidential - Serious harm if disclosed
  | 'HEMMELIG'; // Secret - Grave harm if disclosed
```

### Automatic Classification Enforcement

```typescript
import { EncryptionService, logger } from '@xala-technologies/foundation';

const encryption = EncryptionService.getInstance();

// Encryption automatically adjusts based on classification
const openData = await encryption.encrypt(
  publicInformation,
  key,
  'ÅPEN' // Uses standard encryption
);

const secretData = await encryption.encrypt(
  classifiedInformation,
  key,
  'HEMMELIG' // Uses enhanced encryption with key derivation
);

// Logging automatically includes classification metadata
logger.info('Document processed', {
  documentId: 'doc123',
  classification: 'KONFIDENSIELT', // Automatically tagged for audit
});
```

### Classification Validation

The package validates NSM classifications at runtime:

```typescript
import { isValidNSMClassification } from '@xala-technologies/foundation';

function processDocument(document: any, classification: string) {
  if (!isValidNSMClassification(classification)) {
    throw new Error(`Invalid NSM classification: ${classification}`);
  }

  // Process with validated classification
  return handleClassifiedDocument(document, classification);
}
```

### Access Control Integration

```typescript
import { NorwegianComplianceEvents } from '@xala-technologies/foundation';

// Access control automatically respects NSM classifications
class DocumentAccessService {
  async accessDocument(documentId: string, userId: string, userClearance: string) {
    const document = await this.getDocument(documentId);

    if (!this.hasRequiredClearance(userClearance, document.classification)) {
      // Automatically log unauthorized access attempt
      const securityEvent = NorwegianComplianceEvents.createNSMClassificationEvent(
        'document.access.denied',
        {
          documentId,
          userId,
          requiredClearance: document.classification,
          userClearance,
        },
        document.classification,
        ['unauthorized_access_attempt']
      );

      await eventBus.publish(securityEvent);
      throw new Error('Insufficient clearance for document access');
    }

    // Log authorized access
    logger.audit({
      action: 'READ',
      entityType: 'classified_document',
      entityId: documentId,
      userId,
      compliance: {
        securityClassification: document.classification,
        gdprBasis: 'public_task',
      },
    });

    return document;
  }

  private hasRequiredClearance(userClearance: string, documentClassification: string): boolean {
    const clearanceLevels = ['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'];
    const userLevel = clearanceLevels.indexOf(userClearance);
    const requiredLevel = clearanceLevels.indexOf(documentClassification);

    return userLevel >= requiredLevel;
  }
}
```

## GDPR Compliance

The foundation package provides comprehensive GDPR compliance features including consent management, legal basis tracking, and data subject rights implementation.

### Legal Basis Tracking

Every data processing operation must have a valid GDPR legal basis:

```typescript
type GDPRLegalBasis =
  | 'consent' // Data subject has given consent
  | 'contract' // Processing necessary for contract performance
  | 'legal_obligation' // Processing required by law
  | 'vital_interests' // Processing necessary to protect life
  | 'public_task' // Processing for public interest/official authority
  | 'legitimate_interests'; // Legitimate interests (not for public authorities)
```

### Automatic GDPR Event Generation

```typescript
import { NorwegianComplianceEvents } from '@xala-technologies/foundation';

// Automatically creates GDPR-compliant events
const gdprEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
  'citizen.personal.data.accessed',
  {
    citizenId: '12345678901',
    accessedBy: 'social_worker_123',
    purpose: 'welfare_assessment',
    dataCategories: ['personal_data', 'financial_data', 'health_data'],
  },
  ['personal_data', 'financial_data', 'health_data'],
  'public_task' // Legal basis for public authorities
);

await eventBus.publish(gdprEvent);
```

### Data Subject Rights Implementation

#### Right to Access (Article 15)

```typescript
class GDPRDataSubjectService {
  async handleDataAccessRequest(citizenId: string, requestId: string) {
    // Log the access request
    const accessEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
      'gdpr.data.access.request',
      {
        citizenId,
        requestId,
        requestDate: new Date(),
        requestType: 'data_access',
      },
      ['request_metadata'],
      'legal_obligation'
    );

    await eventBus.publish(accessEvent);

    // Compile all personal data for the citizen
    const personalData = await this.compilePersonalData(citizenId);

    return {
      citizenId,
      dataProcessed: personalData,
      legalBases: this.getLegalBasesForCitizen(citizenId),
      retentionPeriods: this.getRetentionPeriods(citizenId),
      dataRecipients: this.getDataRecipients(citizenId),
    };
  }
}
```

#### Right to Erasure (Article 17)

```typescript
class GDPRDataErasureService {
  async handleErasureRequest(citizenId: string, requestId: string) {
    // Validate erasure request
    const canErase = await this.validateErasureRequest(citizenId);

    if (!canErase.allowed) {
      const denialEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
        'gdpr.erasure.denied',
        {
          citizenId,
          requestId,
          denialReason: canErase.reason,
        },
        ['request_metadata'],
        'legal_obligation'
      );

      await eventBus.publish(denialEvent);
      throw new Error(`Erasure not permitted: ${canErase.reason}`);
    }

    // Perform data erasure
    const erasureResult = await this.performDataErasure(citizenId);

    // Log completion
    const completionEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
      'gdpr.erasure.completed',
      {
        citizenId,
        requestId,
        erasedDataCategories: erasureResult.categories,
        retainedDataCategories: erasureResult.retained,
        retentionReasons: erasureResult.retentionReasons,
      },
      ['erasure_metadata'],
      'legal_obligation'
    );

    await eventBus.publish(completionEvent);

    return erasureResult;
  }
}
```

### Cross-Border Data Transfer Controls

```typescript
class GDPRTransferService {
  async validateDataTransfer(transferRequest: DataTransferRequest): Promise<boolean> {
    // Check if destination country has adequacy decision
    const adequacyStatus = await this.checkAdequacyDecision(transferRequest.destinationCountry);

    if (adequacyStatus.adequate) {
      // Transfer allowed under adequacy decision
      return true;
    }

    // Check for appropriate safeguards
    if (!transferRequest.safeguards || transferRequest.safeguards.length === 0) {
      throw new Error(
        'Cross-border transfer requires appropriate safeguards for non-adequate countries'
      );
    }

    // Validate safeguards
    const validSafeguards = await this.validateSafeguards(transferRequest.safeguards);

    if (!validSafeguards) {
      throw new Error('Provided safeguards are insufficient for data transfer');
    }

    // Log the transfer with safeguards
    const transferEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
      'gdpr.cross.border.transfer',
      {
        destinationCountry: transferRequest.destinationCountry,
        safeguards: transferRequest.safeguards,
        dataCategories: transferRequest.dataCategories,
        transferReason: transferRequest.reason,
      },
      transferRequest.dataCategories,
      transferRequest.legalBasis
    );

    await eventBus.publish(transferEvent);

    return true;
  }
}
```

## DigDir Interoperability Standards

Digitaliseringsdirektoratet (DigDir) sets standards for Norwegian digital government services. The foundation package implements these standards automatically.

### Service Registration Standards

```typescript
import { ServiceRegistry } from '@xala-technologies/foundation';

// Automatically compliant with DigDir service registration standards
await serviceRegistry.register({
  name: 'municipal-building-permits',
  version: '2.1.0',
  endpoints: ['https://permits.oslo.kommune.no/api'],
  healthCheck: 'https://permits.oslo.kommune.no/health',
  compliance: {
    digdirRegistered: true,
    accessibilityLevel: 'WCAG_2_2_AA', // DigDir accessibility requirement
    norwegianLanguageSupport: true,
    interoperabilityStandard: 'FHIR_R4', // Health data standard
  },
  metadata: {
    serviceDescription: {
      nb: 'Byggetillatelser for Oslo kommune',
      en: 'Building permits for Oslo municipality',
    },
    contactPoint: {
      email: 'byggesak@oslo.kommune.no',
      phone: '+47-23-46-12-00',
    },
    legalFramework: ['Plan- og bygningsloven', 'Byggesaksforskriften'],
  },
});
```

### API Documentation Standards

```typescript
// DigDir requires specific API documentation standards
class DigDirAPIDocumentation {
  static generateCompliantDocumentation(service: ServiceRegistration) {
    return {
      openapi: '3.0.3',
      info: {
        title: service.name,
        version: service.version,
        description: service.metadata.serviceDescription,
        contact: service.metadata.contactPoint,
      },
      servers: service.endpoints.map(endpoint => ({ url: endpoint })),

      // DigDir required security schemes
      components: {
        securitySchemes: {
          IDPorten: {
            type: 'oauth2',
            flows: {
              authorizationCode: {
                authorizationUrl: 'https://login.idporten.no/authorize',
                tokenUrl: 'https://login.idporten.no/token',
                scopes: {
                  openid: 'OpenID Connect scope',
                  profile: 'Access to user profile',
                },
              },
            },
          },
        },
      },

      // Compliance metadata required by DigDir
      'x-compliance': {
        gdpr: true,
        nsm_classification: service.compliance.nsmClassification,
        accessibility: service.compliance.accessibilityLevel,
        legal_framework: service.metadata.legalFramework,
      },
    };
  }
}
```

### Norwegian Language Support

```typescript
import { norwegianFormatter } from '@xala-technologies/foundation';

// Automatic Norwegian formatting compliance
class NorwegianServiceInterface {
  formatCitizenData(citizen: CitizenData) {
    return {
      navn: citizen.name,
      adresse: norwegianFormatter.formatAddress(citizen.address),
      telefon: norwegianFormatter.formatPhoneNumber(citizen.phone),
      fødselsnummer: norwegianFormatter.formatPersonnummer(citizen.nationalId),

      // Currency formatting for Norwegian kroner
      årsinntekt: norwegianFormatter.formatCurrency(citizen.annualIncome),

      // Date formatting for Norwegian locale
      registreringsdato: norwegianFormatter.formatDate(citizen.registrationDate),
    };
  }
}
```

## Audit and Compliance Reporting

### Automatic Audit Trail Generation

The foundation package automatically generates audit trails that meet Norwegian government requirements:

```typescript
// Every compliance-sensitive operation is automatically audited
logger.audit({
  action: 'CREATE',
  entityType: 'welfare_application',
  entityId: 'app123',
  userId: 'caseworker456',
  tenantId: 'oslo-nav',
  compliance: {
    securityClassification: 'BEGRENSET',
    gdprBasis: 'public_task',
    personalDataIncluded: true,
  },
  metadata: {
    applicationCategory: 'disability_benefits',
    automaticProcessing: false,
    humanOversight: true,
  },
});
```

### Compliance Report Generation

```typescript
class ComplianceReportingService {
  async generateQuarterlyComplianceReport(quarter: string, year: number) {
    const reportData = {
      reportingPeriod: { quarter, year },
      nsmCompliance: {
        classificationDistribution: await this.getNSMClassificationStats(),
        unauthorizedAccessAttempts: await this.getUnauthorizedAccessStats(),
        classificationChanges: await this.getClassificationChangeStats(),
      },
      gdprCompliance: {
        dataProcessingActivities: await this.getDataProcessingStats(),
        consentWithdrawals: await this.getConsentWithdrawalStats(),
        dataSubjectRequests: await this.getDataSubjectRequestStats(),
        crossBorderTransfers: await this.getCrossBorderTransferStats(),
      },
      digdirCompliance: {
        serviceAvailability: await this.getServiceAvailabilityStats(),
        accessibilityCompliance: await this.getAccessibilityComplianceStats(),
        apiDocumentationStatus: await this.getAPIDocumentationStatus(),
      },
    };

    const reportEvent = NorwegianComplianceEvents.createNSMClassificationEvent(
      'compliance.quarterly.report.generated',
      reportData,
      'BEGRENSET',
      ['compliance_reporting', 'quarterly_audit']
    );

    await eventBus.publish(reportEvent);

    return reportData;
  }
}
```

## Integration with Norwegian Government Systems

### ID-porten Integration

```typescript
class IDPortenIntegrationService {
  async authenticateUser(authCode: string): Promise<AuthenticationResult> {
    // Exchange auth code for tokens
    const tokens = await this.exchangeAuthCode(authCode);

    // Validate and extract user information
    const userInfo = await this.validateAndExtractUserInfo(tokens.accessToken);

    // Create compliant authentication event
    const authEvent = NorwegianComplianceEvents.createIdPortenAuthenticationEvent(
      userInfo.personalId,
      userInfo.securityLevel,
      'SUCCESS'
    );

    await eventBus.publish(authEvent);

    return {
      authenticated: true,
      personalId: userInfo.personalId,
      securityLevel: userInfo.securityLevel,
      sessionId: generateSecureSessionId(),
    };
  }
}
```

### Altinn Integration

```typescript
class AltinnIntegrationService {
  async submitForm(formData: AltinnFormData): Promise<SubmissionResult> {
    // Validate form data against Altinn schema
    const validationResult = await this.validateAltinnForm(formData);

    if (!validationResult.valid) {
      throw new Error(`Form validation failed: ${validationResult.errors}`);
    }

    // Submit to Altinn with compliance tracking
    const submissionEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
      'altinn.form.submitted',
      {
        formType: formData.type,
        organizationNumber: formData.organizationNumber,
        submittedBy: formData.submitterId,
      },
      ['organizational_data', 'contact_data'],
      'legal_obligation'
    );

    await eventBus.publish(submissionEvent);

    return await this.submitToAltinn(formData);
  }
}
```

## Best Practices for Norwegian Compliance

### Data Minimization

```typescript
// Always process only necessary data
class DataMinimizationService {
  processApplicationData(application: any, purpose: string) {
    const allowedFields = this.getAllowedFieldsForPurpose(purpose);

    // Filter data to only include necessary fields
    const minimizedData = this.filterToAllowedFields(application, allowedFields);

    logger.audit({
      action: 'PROCESS',
      entityType: 'application_data',
      entityId: application.id,
      compliance: {
        securityClassification: 'BEGRENSET',
        gdprBasis: 'public_task',
        dataMinimization: true,
      },
      metadata: {
        purpose,
        allowedFields,
        originalFieldCount: Object.keys(application).length,
        processedFieldCount: Object.keys(minimizedData).length,
      },
    });

    return minimizedData;
  }
}
```

### Retention Period Management

```typescript
class RetentionManagementService {
  async scheduleDataRetention(dataType: string, entityId: string, creationDate: Date) {
    const retentionPeriod = this.getRetentionPeriodForDataType(dataType);
    const deletionDate = new Date(creationDate.getTime() + retentionPeriod);

    // Schedule automatic deletion
    await this.scheduleAutomaticDeletion(entityId, deletionDate);

    logger.audit({
      action: 'SCHEDULE_RETENTION',
      entityType: dataType,
      entityId,
      compliance: {
        securityClassification: 'BEGRENSET',
        gdprBasis: 'legal_obligation',
      },
      metadata: {
        retentionPeriod: retentionPeriod,
        scheduledDeletion: deletionDate.toISOString(),
      },
    });
  }
}
```

This comprehensive compliance documentation ensures Norwegian government applications meet all regulatory requirements while maintaining developer productivity and code quality.
