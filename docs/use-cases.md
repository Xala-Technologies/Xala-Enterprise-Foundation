# Use Case Scenarios

This document presents real-world scenarios where the foundation package provides significant value in Norwegian government applications. Each scenario includes practical implementation examples and explains why specific patterns are used.

## Scenario 1: Municipal Citizen Portal

**Context**: A Norwegian municipality needs to build a citizen portal that handles personal data access, service applications, and maintains full audit trails for compliance.

**Requirements**:

- NSM BEGRENSET classification for citizen data
- GDPR compliance for personal data processing
- ID-porten integration for authentication
- DigDir service registration
- Complete audit trail for all citizen interactions

### Implementation

```typescript
// src/services/citizen-portal.service.ts
import {
  EventBus,
  NorwegianComplianceEvents,
  ServiceRegistry,
  logger,
  EncryptionService,
} from '@xala-technologies/foundation';

export class CitizenPortalService {
  private eventBus: EventBus;
  private encryption: EncryptionService;
  private serviceRegistry: ServiceRegistry;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.encryption = EncryptionService.getInstance();
    this.serviceRegistry = ServiceRegistry.getInstance();
    this.setupEventHandlers();
  }

  async initialize() {
    // Register the portal as a government service
    await this.serviceRegistry.register({
      name: 'municipal-citizen-portal',
      version: '2.1.0',
      endpoints: ['https://portal.oslo.kommune.no/api'],
      healthCheck: 'https://portal.oslo.kommune.no/health',
      compliance: {
        nsmClassification: 'BEGRENSET',
        gdprCompliant: true,
        digdirRegistered: true,
        accessibilityLevel: 'WCAG_2_2_AA',
      },
      metadata: {
        municipality: 'Oslo',
        serviceArea: 'citizen_services',
        supportedLanguages: ['nb', 'en'],
      },
    });

    logger.info('Citizen portal service initialized', {
      classification: 'BEGRENSET',
      serviceRegistered: true,
    });
  }

  async handleCitizenAuthentication(authResult: IDPortenAuthResult) {
    // Create NSM compliant authentication event
    const authEvent = NorwegianComplianceEvents.createIdPortenAuthenticationEvent(
      authResult.citizenId,
      authResult.securityLevel,
      authResult.success ? 'SUCCESS' : 'FAILURE'
    );

    await this.eventBus.publish(authEvent);

    if (authResult.success) {
      // Log successful authentication for audit
      logger.audit({
        action: 'AUTHENTICATE',
        entityType: 'citizen',
        userId: authResult.citizenId,
        tenantId: 'oslo-municipality',
        compliance: {
          securityClassification: 'BEGRENSET',
          gdprBasis: 'public_task',
          personalDataIncluded: true,
        },
        metadata: {
          authMethod: 'ID_PORTEN',
          securityLevel: authResult.securityLevel,
          sessionId: authResult.sessionId,
        },
      });
    }

    return authResult;
  }

  async processServiceApplication(citizenId: string, application: ServiceApplication) {
    // Encrypt sensitive application data
    const encryptedData = await this.encryption.encrypt(
      JSON.stringify(application.personalData),
      process.env.CITIZEN_DATA_KEY!,
      'BEGRENSET'
    );

    // Create GDPR data processing event
    const gdprEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
      'service.application.submitted',
      {
        applicationId: application.id,
        serviceType: application.serviceType,
        citizenId,
        encryptedPersonalData: encryptedData,
      },
      ['personal_data', 'contact_data', 'financial_data'],
      'public_task'
    );

    await this.eventBus.publish(gdprEvent);

    // Create municipal service event
    const municipalEvent = NorwegianComplianceEvents.createMunicipalServiceEvent(
      application.serviceType,
      citizenId,
      'Oslo',
      'PENDING'
    );

    await this.eventBus.publish(municipalEvent);

    logger.info('Service application processed', {
      applicationId: application.id,
      serviceType: application.serviceType,
      classification: 'BEGRENSET',
    });

    return { applicationId: application.id, status: 'submitted' };
  }

  private setupEventHandlers() {
    // Handle service decision events
    this.eventBus.subscribe('municipal.service.decision.*', async event => {
      const decision = event.data;

      // Notify citizen of decision
      await this.notifyCitizen(decision.citizenId, {
        type: 'service_decision',
        applicationId: decision.applicationId,
        result: decision.decision,
        reason: decision.reason,
      });

      // Log the decision for audit
      logger.audit({
        action: 'DECIDE',
        entityType: 'service_application',
        entityId: decision.applicationId,
        userId: decision.handlerId,
        compliance: {
          securityClassification: 'BEGRENSET',
          gdprBasis: 'public_task',
        },
        metadata: {
          decision: decision.decision,
          citizenNotified: true,
        },
      });
    });
  }

  private async notifyCitizen(citizenId: string, notification: any) {
    // Implementation for citizen notification
    // Could integrate with SMS, email, or in-app notifications
  }
}

interface IDPortenAuthResult {
  citizenId: string;
  securityLevel: 'Level3' | 'Level4';
  success: boolean;
  sessionId: string;
}

interface ServiceApplication {
  id: string;
  serviceType: string;
  personalData: any;
  submissionDate: Date;
}
```

**Benefits in this scenario**:

- Automatic NSM compliance for all citizen data handling
- Built-in GDPR event generation for data processing activities
- Structured audit logging that meets government requirements
- Service discovery for integration with other municipal systems

## Scenario 2: Cross-Municipal Collaboration Platform

**Context**: Multiple Norwegian municipalities need to share resources and collaborate on regional projects while maintaining data sovereignty and compliance.

**Requirements**:

- Cross-tenant isolation
- Municipal boundary respect in data handling
- Collaborative decision tracking
- Resource sharing with proper attribution
- Regional compliance reporting

### Implementation

```typescript
// src/services/municipal-collaboration.service.ts
import {
  EventBus,
  NorwegianComplianceEvents,
  logger,
  ServiceRegistry,
} from '@xala-technologies/foundation';

export class MunicipalCollaborationService {
  private eventBus: EventBus;
  private serviceRegistry: ServiceRegistry;

  constructor(private municipalityId: string) {
    this.eventBus = EventBus.getInstance();
    this.serviceRegistry = ServiceRegistry.getInstance();
    this.setupCollaborationHandlers();
  }

  async initiateResourceSharingRequest(request: ResourceSharingRequest) {
    // Create cross-municipal request event
    const requestEvent = {
      eventId: `resource_${Date.now()}`,
      eventType: 'municipal.resource.sharing.requested',
      timestamp: new Date(),
      source: `municipality-${this.municipalityId}`,
      tenantId: this.municipalityId,
      correlationId: request.collaborationId,
      compliance: {
        classification: 'BEGRENSET',
        gdprApplicable: false,
        personalDataIncluded: false,
        auditRequired: true,
        retentionPeriod: 'P10Y', // 10 years for municipal records
      },
      data: {
        requestingMunicipality: this.municipalityId,
        targetMunicipality: request.targetMunicipality,
        resourceType: request.resourceType,
        requestDetails: request.details,
        costSharingProposal: request.costSharing,
      },
      norwegian: {
        locale: 'nb',
        municipality: this.municipalityId,
        governmentLevel: 'LOCAL',
        serviceArea: 'RESOURCE_SHARING',
      },
    };

    await this.eventBus.publish(requestEvent);

    // Log the collaboration request
    logger.audit({
      action: 'CREATE',
      entityType: 'resource_sharing_request',
      entityId: request.id,
      userId: request.initiatedBy,
      tenantId: this.municipalityId,
      compliance: {
        securityClassification: 'BEGRENSET',
        gdprBasis: 'public_task',
      },
      metadata: {
        targetMunicipality: request.targetMunicipality,
        resourceType: request.resourceType,
        estimatedValue: request.costSharing.estimatedValue,
      },
    });

    return { requestId: request.id, status: 'pending_approval' };
  }

  async handleCollaborativeDecision(decisionData: CollaborativeDecision) {
    // Create decision tracking event with multiple municipality context
    const decisionEvent = {
      eventId: `decision_${Date.now()}`,
      eventType: 'municipal.collaborative.decision.made',
      timestamp: new Date(),
      source: `municipality-${this.municipalityId}`,
      tenantId: this.municipalityId,
      compliance: {
        classification: 'BEGRENSET',
        gdprApplicable: false,
        personalDataIncluded: false,
        auditRequired: true,
        retentionPeriod: 'P30Y', // Long retention for governance decisions
      },
      data: {
        decisionId: decisionData.id,
        participatingMunicipalities: decisionData.participants,
        decisionType: decisionData.type,
        outcome: decisionData.outcome,
        votingResults: decisionData.votes,
        implementationTimeline: decisionData.timeline,
        budgetImplications: decisionData.budget,
      },
      norwegian: {
        locale: 'nb',
        governmentLevel: 'REGIONAL',
        serviceArea: 'COLLABORATIVE_GOVERNANCE',
      },
    };

    await this.eventBus.publish(decisionEvent);

    // Notify all participating municipalities
    for (const municipality of decisionData.participants) {
      if (municipality !== this.municipalityId) {
        await this.notifyMunicipality(municipality, {
          type: 'collaborative_decision',
          decisionId: decisionData.id,
          outcome: decisionData.outcome,
        });
      }
    }

    return { decisionRecorded: true, participantsNotified: true };
  }

  async generateComplianceReport(period: ReportingPeriod) {
    // Discover related services for comprehensive reporting
    const collaborationServices = await this.serviceRegistry.find({
      tags: ['municipal-collaboration'],
      compliance: { nsmClassification: 'BEGRENSET' },
    });

    const reportData = {
      reportingPeriod: period,
      municipality: this.municipalityId,
      collaborationActivities: await this.getCollaborationActivities(period),
      resourceSharingAgreements: await this.getResourceSharingAgreements(period),
      complianceStatus: {
        nsmCompliant: true,
        gdprCompliant: true,
        auditTrailComplete: true,
      },
      participatingServices: collaborationServices.map(s => s.name),
    };

    // Create compliance reporting event
    const reportEvent = NorwegianComplianceEvents.createNSMClassificationEvent(
      'municipal.compliance.report.generated',
      reportData,
      'BEGRENSET',
      ['municipal_governance', 'compliance_reporting']
    );

    await this.eventBus.publish(reportEvent);

    logger.info('Municipal compliance report generated', {
      municipality: this.municipalityId,
      period: period,
      classification: 'BEGRENSET',
    });

    return reportData;
  }

  private setupCollaborationHandlers() {
    // Handle incoming resource sharing responses
    this.eventBus.subscribe('municipal.resource.sharing.response', async event => {
      if (event.data.targetMunicipality === this.municipalityId) {
        await this.processResourceSharingResponse(event.data);
      }
    });

    // Handle collaborative decision updates
    this.eventBus.subscribe('municipal.collaborative.decision.*', async event => {
      if (event.data.participatingMunicipalities?.includes(this.municipalityId)) {
        await this.updateLocalDecisionRecords(event.data);
      }
    });
  }

  private async processResourceSharingResponse(responseData: any) {
    // Implementation for handling responses from other municipalities
  }

  private async updateLocalDecisionRecords(decisionData: any) {
    // Implementation for updating local records with collaborative decisions
  }

  private async notifyMunicipality(municipalityId: string, notification: any) {
    // Implementation for inter-municipal communication
  }

  private async getCollaborationActivities(period: ReportingPeriod) {
    // Implementation for retrieving collaboration activities
    return [];
  }

  private async getResourceSharingAgreements(period: ReportingPeriod) {
    // Implementation for retrieving resource sharing agreements
    return [];
  }
}

interface ResourceSharingRequest {
  id: string;
  targetMunicipality: string;
  resourceType: string;
  details: string;
  costSharing: {
    estimatedValue: number;
    sharingRatio: Record<string, number>;
  };
  initiatedBy: string;
  collaborationId: string;
}

interface CollaborativeDecision {
  id: string;
  type: string;
  participants: string[];
  outcome: string;
  votes: Record<string, 'approve' | 'reject' | 'abstain'>;
  timeline: string;
  budget: number;
}

interface ReportingPeriod {
  startDate: Date;
  endDate: Date;
  type: 'quarterly' | 'annual';
}
```

**Benefits in this scenario**:

- Cross-municipal event tracking with proper tenant isolation
- Built-in compliance reporting for government audits
- Structured decision tracking across municipal boundaries
- Regional collaboration patterns that respect local sovereignty

## Scenario 3: Healthcare Data Integration

**Context**: A Norwegian health authority needs to integrate patient data across multiple healthcare providers while maintaining strict GDPR compliance and NSM HEMMELIG classification for sensitive medical records.

**Requirements**:

- NSM HEMMELIG classification for sensitive medical data
- GDPR consent tracking and withdrawal
- Cross-border data transfer controls
- Medical professional access auditing
- Patient right to erasure implementation

### Implementation

```typescript
// src/services/healthcare-integration.service.ts
import {
  EventBus,
  NorwegianComplianceEvents,
  EncryptionService,
  logger,
} from '@xala-technologies/foundation';

export class HealthcareIntegrationService {
  private eventBus: EventBus;
  private encryption: EncryptionService;

  constructor(private healthAuthorityId: string) {
    this.eventBus = EventBus.getInstance();
    this.encryption = EncryptionService.getInstance();
    this.setupHealthcareEventHandlers();
  }

  async processPatientDataAccess(request: PatientDataAccessRequest) {
    // Verify medical professional authorization
    const authCheck = await this.verifyMedicalProfessionalAccess(
      request.healthProfessionalId,
      request.patientId,
      request.accessReason
    );

    if (!authCheck.authorized) {
      // Log unauthorized access attempt
      logger.security({
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        securityClassification: 'HEMMELIG',
        userId: request.healthProfessionalId,
        targetEntity: 'patient_medical_record',
        targetEntityId: request.patientId,
        reason: authCheck.denialReason,
      });

      throw new Error('Access denied: Insufficient authorization');
    }

    // Encrypt patient data with highest security level
    const encryptedPatientData = await this.encryption.encrypt(
      JSON.stringify(request.requestedData),
      process.env.MEDICAL_DATA_ENCRYPTION_KEY!,
      'HEMMELIG'
    );

    // Create GDPR data processing event for medical data
    const gdprEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
      'healthcare.patient.data.accessed',
      {
        patientId: request.patientId,
        healthProfessionalId: request.healthProfessionalId,
        accessReason: request.accessReason,
        dataCategories: request.dataCategories,
        encryptedData: encryptedPatientData,
      },
      ['health_data', 'sensitive_personal_data', 'medical_history'],
      'vital_interests'
    );

    await this.eventBus.publish(gdprEvent);

    // Log the authorized access
    logger.audit({
      action: 'READ',
      entityType: 'patient_medical_record',
      entityId: request.patientId,
      userId: request.healthProfessionalId,
      tenantId: this.healthAuthorityId,
      compliance: {
        securityClassification: 'HEMMELIG',
        gdprBasis: 'vital_interests',
        personalDataIncluded: true,
      },
      metadata: {
        accessReason: request.accessReason,
        dataCategories: request.dataCategories,
        professionalRole: authCheck.professionalRole,
        institutionId: authCheck.institutionId,
      },
    });

    return {
      accessGranted: true,
      sessionId: authCheck.sessionId,
      accessibleData: encryptedPatientData,
    };
  }

  async handleConsentWithdrawal(consentWithdrawal: ConsentWithdrawalRequest) {
    // Create consent withdrawal event
    const consentEvent = {
      eventId: `consent_withdrawal_${Date.now()}`,
      eventType: 'healthcare.patient.consent.withdrawn',
      timestamp: new Date(),
      source: `health-authority-${this.healthAuthorityId}`,
      tenantId: this.healthAuthorityId,
      compliance: {
        classification: 'HEMMELIG',
        gdprApplicable: true,
        personalDataIncluded: true,
        auditRequired: true,
        retentionPeriod: 'P50Y', // Medical records retention
        legalBasis: 'consent',
      },
      data: {
        patientId: consentWithdrawal.patientId,
        withdrawnConsents: consentWithdrawal.consentTypes,
        withdrawalReason: consentWithdrawal.reason,
        effectiveDate: consentWithdrawal.effectiveDate,
        dataErasureRequired: consentWithdrawal.requestDataErasure,
      },
      norwegian: {
        locale: 'nb',
        governmentLevel: 'NATIONAL',
        serviceArea: 'HEALTHCARE',
      },
    };

    await this.eventBus.publish(consentEvent);

    // If data erasure is requested, initiate the process
    if (consentWithdrawal.requestDataErasure) {
      await this.initiateDataErasure(consentWithdrawal.patientId, consentWithdrawal.consentTypes);
    }

    // Notify all connected healthcare providers
    await this.notifyHealthcareProviders(consentWithdrawal);

    logger.info('Patient consent withdrawal processed', {
      patientId: consentWithdrawal.patientId,
      consentTypes: consentWithdrawal.consentTypes,
      dataErasureRequested: consentWithdrawal.requestDataErasure,
      classification: 'HEMMELIG',
    });

    return { processed: true, erasureInitiated: consentWithdrawal.requestDataErasure };
  }

  async handleCrossBorderDataTransfer(transferRequest: CrossBorderTransferRequest) {
    // Validate GDPR adequacy for destination country
    const adequacyCheck = await this.validateDataTransferAdequacy(
      transferRequest.destinationCountry
    );

    if (!adequacyCheck.adequate && !transferRequest.safeguards) {
      throw new Error(
        'Cross-border transfer not permitted: No adequacy decision and no safeguards provided'
      );
    }

    // Create cross-border transfer event
    const transferEvent = {
      eventId: `cross_border_${Date.now()}`,
      eventType: 'healthcare.data.cross.border.transfer',
      timestamp: new Date(),
      source: `health-authority-${this.healthAuthorityId}`,
      tenantId: this.healthAuthorityId,
      compliance: {
        classification: 'HEMMELIG',
        gdprApplicable: true,
        personalDataIncluded: true,
        auditRequired: true,
        retentionPeriod: 'P30Y',
      },
      data: {
        patientId: transferRequest.patientId,
        destinationCountry: transferRequest.destinationCountry,
        destinationInstitution: transferRequest.destinationInstitution,
        transferReason: transferRequest.reason,
        adequacyDecision: adequacyCheck.adequate,
        safeguards: transferRequest.safeguards,
        dataCategories: transferRequest.dataCategories,
      },
      norwegian: {
        locale: 'nb',
        governmentLevel: 'NATIONAL',
        serviceArea: 'HEALTHCARE',
      },
    };

    await this.eventBus.publish(transferEvent);

    // Log the international transfer
    logger.audit({
      action: 'TRANSFER',
      entityType: 'patient_medical_record',
      entityId: transferRequest.patientId,
      userId: transferRequest.requestedBy,
      tenantId: this.healthAuthorityId,
      compliance: {
        securityClassification: 'HEMMELIG',
        gdprBasis: 'vital_interests',
        personalDataIncluded: true,
      },
      metadata: {
        destinationCountry: transferRequest.destinationCountry,
        transferReason: transferRequest.reason,
        adequacyDecision: adequacyCheck.adequate,
        safeguardsApplied: !!transferRequest.safeguards,
      },
    });

    return { transferAuthorized: true, transferId: transferEvent.eventId };
  }

  private setupHealthcareEventHandlers() {
    // Handle medical emergency events that may override normal access controls
    this.eventBus.subscribe('healthcare.emergency.*', async event => {
      if (event.data.emergencyType === 'life_threatening') {
        // Emergency access provisions under GDPR vital interests
        await this.handleEmergencyDataAccess(event.data);
      }
    });

    // Handle patient data erasure completion events
    this.eventBus.subscribe('healthcare.data.erasure.completed', async event => {
      await this.notifyPatientOfErasureCompletion(event.data.patientId);
    });
  }

  private async verifyMedicalProfessionalAccess(
    professionalId: string,
    patientId: string,
    reason: string
  ) {
    // Implementation for professional authorization verification
    return {
      authorized: true,
      professionalRole: 'doctor',
      institutionId: 'oslo-university-hospital',
      sessionId: `session_${Date.now()}`,
    };
  }

  private async initiateDataErasure(patientId: string, consentTypes: string[]) {
    // Implementation for GDPR right to erasure
  }

  private async notifyHealthcareProviders(withdrawal: ConsentWithdrawalRequest) {
    // Implementation for notifying connected healthcare providers
  }

  private async validateDataTransferAdequacy(country: string) {
    // Implementation for GDPR adequacy decision validation
    return { adequate: false }; // Most countries don't have adequacy decisions
  }

  private async handleEmergencyDataAccess(emergencyData: any) {
    // Implementation for emergency access under vital interests legal basis
  }

  private async notifyPatientOfErasureCompletion(patientId: string) {
    // Implementation for patient notification of data erasure completion
  }
}

interface PatientDataAccessRequest {
  patientId: string;
  healthProfessionalId: string;
  accessReason: string;
  dataCategories: string[];
  requestedData: any;
}

interface ConsentWithdrawalRequest {
  patientId: string;
  consentTypes: string[];
  reason: string;
  effectiveDate: Date;
  requestDataErasure: boolean;
}

interface CrossBorderTransferRequest {
  patientId: string;
  destinationCountry: string;
  destinationInstitution: string;
  reason: string;
  safeguards?: string[];
  dataCategories: string[];
  requestedBy: string;
}
```

**Benefits in this scenario**:

- Highest level NSM security classification support for medical data
- Complete GDPR compliance including consent management and data erasure
- Cross-border transfer controls with adequacy validation
- Emergency access provisions while maintaining audit trails
- Professional authorization verification with detailed logging

## Common Patterns Across Use Cases

### Event-Driven Compliance

All scenarios use the event bus to ensure:

- Complete audit trails for compliance
- Decoupled system architecture
- Real-time compliance monitoring
- Cross-system integration without tight coupling

### Classification-Based Security

The foundation package automatically handles:

- NSM security classification enforcement
- Access control based on clearance levels
- Encryption requirements by classification
- Audit logging requirements by classification

### GDPR Integration

Built-in GDPR features provide:

- Legal basis tracking for all data processing
- Consent management and withdrawal handling
- Data minimization compliance
- Cross-border transfer controls
- Right to erasure implementation

These use cases demonstrate how the foundation package handles complex real-world Norwegian government application requirements while maintaining clean, maintainable code that automatically ensures compliance.
