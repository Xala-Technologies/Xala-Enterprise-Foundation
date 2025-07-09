/**
 * Saga Orchestrator User Story Tests
 * Tests real-world scenarios for Norwegian government complex workflow management
 */

import {
  SagaContext,
  SagaDefinition,
  SagaOrchestrator,
  createSagaOrchestrator,
  getSagaOrchestrator,
} from '../index';

describe('Saga Orchestrator User Stories', () => {
  let orchestrator: SagaOrchestrator;

  beforeEach(() => {
    orchestrator = createSagaOrchestrator({
      enableAuditLogging: true,
      enableCompliance: true,
      defaultTimeout: 5000,
      maxConcurrentSagas: 10,
    });
  });

  afterEach(() => {
    // Clean up global orchestrator
    const globalOrchestrator = getSagaOrchestrator();
    globalOrchestrator.cleanupOldExecutions(new Date());
  });

  // User Story 1: Oslo Kommune citizen onboarding workflow
  it('Municipality Onboarding Story: should orchestrate complete citizen onboarding for Oslo Kommune', async () => {
    // Given: Oslo Kommune needs to orchestrate citizen onboarding workflow
    const citizenData = {
      personnummer: '12345678901',
      name: 'Ola Nordmann',
      address: 'Karl Johans gate 1, 0154 Oslo',
      email: 'ola.nordmann@oslo.kommune.no',
      municipality: 'oslo',
    };

    // Define citizen onboarding saga
    const onboardingSaga: SagaDefinition = {
      name: 'citizen_onboarding',
      nsmClassification: 'KONFIDENSIELT',
      auditRequired: true,
      steps: [
        {
          name: 'validate_identity',
          execute: async () => {
            // Simulate identity validation
            await new Promise(resolve => setTimeout(resolve, 50));
            return {
              validated: true,
              identityScore: 95,
              validatedAt: new Date(),
            };
          },
          compensate: async (context: SagaContext) => {
            // Cleanup identity validation
            context.data.identityValidated = false;
          },
          critical: true,
        },
        {
          name: 'create_digital_identity',
          execute: async (context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 30));
            return {
              digitalId: `DIG-${context.data.personnummer}`,
              certificates: ['auth_cert', 'sign_cert'],
              createdAt: new Date(),
            };
          },
          compensate: async (context: SagaContext) => {
            // Revoke digital identity
            context.data.digitalIdentityRevoked = true;
          },
          critical: true,
        },
        {
          name: 'register_municipal_services',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 40));
            return {
              services: ['digital_post', 'tax_services', 'health_services'],
              registrationId: 'REG-OSLO-2025-001',
              accessGranted: new Date(),
            };
          },
          compensate: async (context: SagaContext) => {
            // Deregister services
            context.data.servicesDeregistered = true;
          },
        },
        {
          name: 'send_welcome_notification',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 20));
            return {
              notificationId: 'NOT-WELCOME-001',
              channel: 'email',
              sentAt: new Date(),
            };
          },
          // No compensation needed for notification
          critical: false,
        },
      ],
      timeout: 10000,
      retryPolicy: {
        maxRetries: 2,
        backoffStrategy: 'exponential',
        baseDelay: 100,
      },
    };

    orchestrator.registerSaga(onboardingSaga);

    // When: Citizen onboarding workflow is started
    const sagaId = await orchestrator.startSaga('citizen_onboarding', citizenData, {
      metadata: { municipality: 'oslo', department: 'digital_services' },
      nsmClassification: 'KONFIDENSIELT',
    });

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 350));

    // Then: Onboarding should complete successfully with full audit trail
    const execution = orchestrator.getSagaStatus(sagaId);

    expect(execution).toBeDefined();
    expect(execution!.status).toBe('completed');
    expect(execution!.completedSteps).toHaveLength(4);
    expect(execution!.completedSteps).toEqual([
      'validate_identity',
      'create_digital_identity',
      'register_municipal_services',
      'send_welcome_notification',
    ]);

    // Verify step results
    const context = execution!.context;
    expect(context.stepResults.validate_identity.validated).toBe(true);
    expect(context.stepResults.create_digital_identity.digitalId).toBe('DIG-12345678901');
    expect(context.stepResults.register_municipal_services.services).toContain('digital_post');
    expect(context.stepResults.send_welcome_notification.notificationId).toBe('NOT-WELCOME-001');

    // Verify compliance metadata
    expect(context.nsmClassification).toBe('KONFIDENSIELT');
    expect(execution!.auditTrail.length).toBeGreaterThan(0);

    const stats = orchestrator.getStats();
    expect(stats.successfulExecutions).toBe(1);
    expect(stats.complianceEnabled).toBe(true);
  });

  // User Story 2: Security officer handling classified document workflow
  it('Security Officer Story: should handle classified document processing with NSM compliance', async () => {
    // Given: Security officer needs to process HEMMELIG classified documents
    const documentData = {
      documentId: 'DOC-HEMMELIG-2025-001',
      classification: 'HEMMELIG',
      author: 'security_officer_001',
      title: 'Classified Security Assessment',
      department: 'national_security',
    };

    const classifiedDocumentSaga: SagaDefinition = {
      name: 'classified_document_processing',
      nsmClassification: 'HEMMELIG',
      auditRequired: true,
      steps: [
        {
          name: 'security_clearance_check',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 30));
            return {
              clearanceLevel: 'HEMMELIG',
              verified: true,
              verifiedBy: 'security_system',
              timestamp: new Date(),
            };
          },
          critical: true,
        },
        {
          name: 'encrypt_document',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 40));
            return {
              encryptionAlgorithm: 'AES-256-GCM',
              encryptionKey: 'ENC-KEY-HEMMELIG-001',
              encryptedAt: new Date(),
            };
          },
          compensate: async (context: SagaContext) => {
            // Securely delete encryption keys
            context.data.encryptionKeyDestroyed = true;
          },
          critical: true,
        },
        {
          name: 'store_in_classified_vault',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 25));
            return {
              vaultLocation: 'NSM_VAULT_OSLO',
              storageId: 'VAULT-HEMMELIG-001',
              accessControlList: ['security_officer_001'],
              storedAt: new Date(),
            };
          },
          compensate: async (context: SagaContext) => {
            // Remove from vault
            context.data.removedFromVault = true;
          },
          critical: true,
        },
        {
          name: 'log_security_audit',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 15));
            return {
              auditLogId: 'AUDIT-HEMMELIG-001',
              auditTrail: 'document_classified_and_stored',
              loggedAt: new Date(),
            };
          },
          critical: true,
        },
      ],
      timeout: 8000,
    };

    orchestrator.registerSaga(classifiedDocumentSaga);

    // When: Classified document processing is initiated
    const sagaId = await orchestrator.startSaga('classified_document_processing', documentData, {
      metadata: {
        securityLevel: 'HEMMELIG',
        operator: 'security_officer_001',
        facility: 'NSM_OSLO',
      },
      nsmClassification: 'HEMMELIG',
    });

    await new Promise(resolve => setTimeout(resolve, 150));

    // Then: Document should be securely processed with full audit compliance
    const execution = orchestrator.getSagaStatus(sagaId);

    expect(execution!.status).toBe('completed');
    expect(execution!.completedSteps).toHaveLength(4);
    expect(execution!.context.nsmClassification).toBe('HEMMELIG');

    // Verify security processing results
    const results = execution!.context.stepResults;
    expect(results.security_clearance_check.clearanceLevel).toBe('HEMMELIG');
    expect(results.encrypt_document.encryptionAlgorithm).toBe('AES-256-GCM');
    expect(results.store_in_classified_vault.vaultLocation).toBe('NSM_VAULT_OSLO');
    expect(results.log_security_audit.auditLogId).toBe('AUDIT-HEMMELIG-001');

    // Verify comprehensive audit trail
    expect(execution!.auditTrail.length).toBeGreaterThan(0);
    const auditActions = execution!.auditTrail.map(entry => entry.action);
    expect(auditActions.filter(action => action === 'execute')).toHaveLength(5); // 4 steps + saga_completed
  });

  // User Story 3: Developer debugging failed payment workflow
  it('Developer Debugging Story: should handle payment workflow failure with compensation', async () => {
    // Given: Developer needs to debug a payment workflow that fails at processing step
    const paymentData = {
      paymentId: 'PAY-2025-FAIL-001',
      amount: 500.0,
      currency: 'NOK',
      from: 'citizen_account_123',
      to: 'municipality_account_oslo',
      description: 'Municipal fee payment',
    };

    let processPaymentAttempts = 0;

    const paymentSaga: SagaDefinition = {
      name: 'payment_processing',
      nsmClassification: 'BEGRENSET',
      steps: [
        {
          name: 'validate_payment',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 20));
            return {
              validationStatus: 'passed',
              checks: ['amount_valid', 'account_exists', 'sufficient_funds'],
              validatedAt: new Date(),
            };
          },
          compensate: async (context: SagaContext) => {
            context.data.validationCompensated = true;
          },
        },
        {
          name: 'reserve_funds',
          execute: async (context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 30));
            return {
              reservationId: 'RES-001',
              reservedAmount: context.data.amount,
              reservedAt: new Date(),
            };
          },
          compensate: async (context: SagaContext) => {
            // Release reserved funds
            context.data.fundsReleased = true;
          },
        },
        {
          name: 'process_payment',
          execute: async (context: SagaContext) => {
            processPaymentAttempts++;

            // Simulate payment processing failure
            if (processPaymentAttempts <= 2) {
              throw new Error('Payment gateway temporarily unavailable');
            }

            await new Promise(resolve => setTimeout(resolve, 40));
            return {
              transactionId: 'TXN-SUCCESS-001',
              processedAmount: context.data.amount,
              processedAt: new Date(),
            };
          },
          compensate: async (context: SagaContext) => {
            // Reverse payment if needed
            context.data.paymentReversed = true;
          },
          retries: 2,
        },
        {
          name: 'send_confirmation',
          execute: async (context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 15));
            return {
              confirmationId: 'CONF-001',
              recipient: context.data.from,
              sentAt: new Date(),
            };
          },
        },
      ],
      retryPolicy: {
        maxRetries: 2,
        backoffStrategy: 'exponential',
        baseDelay: 50,
      },
    };

    orchestrator.registerSaga(paymentSaga);

    // When: Payment workflow is executed with retry logic
    const sagaId = await orchestrator.startSaga('payment_processing', paymentData);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Then: Payment should eventually succeed after retries
    const execution = orchestrator.getSagaStatus(sagaId);

    expect(execution!.status).toBe('completed');
    expect(processPaymentAttempts).toBe(3); // Failed twice, succeeded on third

    // Verify retry audit trail
    const retryEntries = execution!.auditTrail.filter(entry => entry.action === 'retry');
    expect(retryEntries.length).toBe(2); // Two retry attempts

    // Verify final success
    const results = execution!.context.stepResults;
    expect(results.process_payment.transactionId).toBe('TXN-SUCCESS-001');
    expect(results.send_confirmation.confirmationId).toBe('CONF-001');
  });

  // User Story 4: Compliance officer handling failed workflow compensation
  it('Compliance Officer Story: should properly compensate failed GDPR data processing workflow', async () => {
    // Given: GDPR data processing workflow that fails and needs compensation
    const gdprData = {
      dataSubjectId: 'DS-2025-001',
      personnummer: '98765432109',
      requestType: 'data_export',
      requestedData: ['personal_info', 'contact_details', 'service_history'],
      municipality: 'bergen',
    };

    const gdprProcessingSaga: SagaDefinition = {
      name: 'gdpr_data_processing',
      nsmClassification: 'KONFIDENSIELT',
      auditRequired: true,
      steps: [
        {
          name: 'verify_data_subject',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 25));
            return {
              verified: true,
              identityConfirmed: true,
              verificationMethod: 'BankID',
              verifiedAt: new Date(),
            };
          },
          compensate: async (context: SagaContext) => {
            context.data.verificationCanceled = true;
          },
        },
        {
          name: 'collect_personal_data',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 40));
            return {
              collectedData: {
                personal_info: { name: 'Kari Nordmann', age: 35 },
                contact_details: { email: 'kari@example.no', phone: '+47 12345678' },
                service_history: ['tax_filing', 'parking_permits'],
              },
              dataSize: '2.5MB',
              collectedAt: new Date(),
            };
          },
          compensate: async (context: SagaContext) => {
            // Securely delete collected data
            context.data.collectedDataDeleted = true;
          },
        },
        {
          name: 'encrypt_export_package',
          execute: async (_context: SagaContext) => {
            // Simulate encryption failure
            throw new Error('Encryption service unavailable');
          },
          compensate: async (context: SagaContext) => {
            context.data.encryptionAttemptCanceled = true;
          },
        },
        {
          name: 'deliver_to_data_subject',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 20));
            return {
              deliveryMethod: 'secure_download',
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            };
          },
        },
      ],
    };

    orchestrator.registerSaga(gdprProcessingSaga);

    // When: GDPR processing workflow fails at encryption step
    const sagaId = await orchestrator.startSaga('gdpr_data_processing', gdprData, {
      metadata: {
        legalBasis: 'data_subject_request',
        processor: 'bergen_municipality',
        gdprArticle: 'Article_15_access_right',
      },
      nsmClassification: 'KONFIDENSIELT',
    });

    await new Promise(resolve => setTimeout(resolve, 150));

    // Then: Workflow should fail and compensate completed steps
    const execution = orchestrator.getSagaStatus(sagaId);

    expect(execution!.status).toBe('compensated');
    expect(execution!.error?.message).toBe('Encryption service unavailable');
    expect(execution!.completedSteps).toEqual(['verify_data_subject', 'collect_personal_data']);
    expect(execution!.compensatedSteps).toEqual(['collect_personal_data', 'verify_data_subject']);

    // Verify compensation was performed
    const context = execution!.context;
    expect(context.data.collectedDataDeleted).toBe(true);
    expect(context.data.verificationCanceled).toBe(true);

    // Verify audit trail includes compensation
    const compensateEntries = execution!.auditTrail.filter(entry => entry.action === 'compensate');
    expect(compensateEntries.length).toBe(2);

    const stats = orchestrator.getStats();
    expect(stats.failedExecutions).toBe(1);
  });

  // User Story 5: Operations team monitoring concurrent sagas
  it('Operations Team Story: should manage multiple concurrent municipal workflows', async () => {
    // Given: Operations team needs to monitor multiple concurrent workflows

    // Simple workflow for testing concurrency
    const simpleWorkflow: SagaDefinition = {
      name: 'simple_municipal_task',
      steps: [
        {
          name: 'task_execution',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 50));
            return { completed: true, timestamp: new Date() };
          },
        },
      ],
    };

    orchestrator.registerSaga(simpleWorkflow);

    // When: Multiple concurrent workflows are started
    const sagaPromises: Promise<string>[] = [];
    for (let i = 0; i < 5; i++) {
      const sagaId = orchestrator.startSaga('simple_municipal_task', { taskId: `task-${i}` });
      sagaPromises.push(sagaId);
    }

    const sagaIds = await Promise.all(sagaPromises);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Then: All workflows should complete successfully
    const stats = orchestrator.getStats();
    expect(stats.runningExecutions).toBeLessThanOrEqual(10); // Respects concurrency limit
    expect(stats.successfulExecutions).toBe(5);

    // Verify all sagas completed
    sagaIds.forEach(sagaId => {
      const execution = orchestrator.getSagaStatus(sagaId);
      expect(execution!.status).toBe('completed');
    });
  });

  // User Story 6: Municipal service integration
  it('Municipal Integration Story: should coordinate complex multi-service municipal operations', async () => {
    // Given: Complex municipal workflow involving multiple services
    const municipalOperationSaga: SagaDefinition = {
      name: 'municipal_service_coordination',
      steps: [
        {
          name: 'facility_booking',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 30));
            return {
              facilityId: 'oslo-town-hall-room-a',
              bookingConfirmed: true,
              bookingTime: new Date(),
            };
          },
          compensate: async (context: SagaContext) => {
            context.data.facilityBookingCanceled = true;
          },
        },
        {
          name: 'catering_arrangement',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 25));
            return {
              cateringId: 'municipal-catering-001',
              menuSelected: 'norwegian_traditional',
              arranged: true,
            };
          },
          compensate: async (context: SagaContext) => {
            context.data.cateringCanceled = true;
          },
        },
        {
          name: 'security_clearance',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 20));
            return {
              securityLevel: 'standard',
              clearanceGranted: true,
              validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
            };
          },
          compensate: async (context: SagaContext) => {
            context.data.securityClearanceRevoked = true;
          },
        },
      ],
    };

    orchestrator.registerSaga(municipalOperationSaga);

    // When: Municipal coordination workflow is executed
    const sagaId = await orchestrator.startSaga('municipal_service_coordination', {
      eventType: 'council_meeting',
      municipality: 'oslo',
      organizer: 'city_council',
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Then: All municipal services should be coordinated successfully
    const execution = orchestrator.getSagaStatus(sagaId);

    expect(execution!.status).toBe('completed');
    expect(execution!.completedSteps).toEqual([
      'facility_booking',
      'catering_arrangement',
      'security_clearance',
    ]);

    const results = execution!.context.stepResults;
    expect(results.facility_booking.facilityId).toBe('oslo-town-hall-room-a');
    expect(results.catering_arrangement.menuSelected).toBe('norwegian_traditional');
    expect(results.security_clearance.clearanceGranted).toBe(true);
  });

  // User Story 7: Long-running workflow with timeouts
  it('Timeout Management Story: should handle workflow timeouts appropriately', async () => {
    // Given: Workflow with aggressive timeout for testing
    const timeoutWorkflow: SagaDefinition = {
      name: 'timeout_test_workflow',
      timeout: 100, // Very short timeout
      steps: [
        {
          name: 'quick_step',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 50));
            return { completed: true };
          },
        },
        {
          name: 'slow_step',
          execute: async (_context: SagaContext) => {
            // This will cause timeout
            await new Promise(resolve => setTimeout(resolve, 200));
            return { completed: true };
          },
          compensate: async (context: SagaContext) => {
            context.data.slowStepCompensated = true;
          },
        },
      ],
    };

    orchestrator.registerSaga(timeoutWorkflow);

    // When: Workflow is executed and times out
    const sagaId = await orchestrator.startSaga('timeout_test_workflow', { testData: true });

    await new Promise(resolve => setTimeout(resolve, 250));

    // Then: Workflow should timeout and compensate
    const execution = orchestrator.getSagaStatus(sagaId);

    expect(execution!.status).toBe('timeout');
    expect(execution!.error?.message).toContain('timeout');

    const stats = orchestrator.getStats();
    expect(stats.failedExecutions).toBe(1);
  });

  // User Story 8: Error handling and recovery
  it('Error Recovery Story: should provide comprehensive error handling and recovery options', async () => {
    // Given: Workflow with error handling capabilities
    const errorRecoveryWorkflow: SagaDefinition = {
      name: 'error_recovery_workflow',
      steps: [
        {
          name: 'stable_step',
          execute: async (_context: SagaContext) => {
            await new Promise(resolve => setTimeout(resolve, 20));
            return { status: 'success' };
          },
        },
        {
          name: 'error_prone_step',
          execute: async (_context: SagaContext) => {
            throw new Error('Simulated service failure');
          },
          compensate: async (context: SagaContext) => {
            context.data.errorProneStepCompensated = true;
          },
        },
      ],
    };

    orchestrator.registerSaga(errorRecoveryWorkflow);

    // When: Workflow encounters error
    const sagaId = await orchestrator.startSaga('error_recovery_workflow', {
      errorHandling: 'enabled',
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Then: Error should be handled appropriately with compensation
    const execution = orchestrator.getSagaStatus(sagaId);

    expect(execution!.status).toBe('compensated');
    expect(execution!.error?.message).toBe('Simulated service failure');
    expect(execution!.completedSteps).toEqual(['stable_step']);
    expect(execution!.compensatedSteps).toEqual(['stable_step']);

    // Verify error is recorded in audit trail
    const errorEntries = execution!.auditTrail.filter(entry => entry.action === 'error');
    expect(errorEntries.length).toBe(1);
    expect(errorEntries[0].error).toBe('Simulated service failure');
  });
});
