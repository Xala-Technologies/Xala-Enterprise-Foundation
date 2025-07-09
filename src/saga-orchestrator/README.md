# saga-orchestrator

Complex workflow management with Norwegian compliance, audit trails, and compensation handling.

## Features

- **Distributed transactions** - Coordinate complex multi-service workflows
- **Compensation patterns** - Automatic rollback and recovery mechanisms
- **Norwegian compliance** - NSM classification and GDPR-aware workflow processing
- **Audit trails** - Complete workflow execution history for compliance
- **Timeout handling** - Configurable timeouts with automatic compensation
- **State persistence** - Durable workflow state management

## Usage

### Basic Saga Definition

```typescript
import {
  createSaga,
  defineSagaStep,
  executeSaga,
  SagaContext,
} from '@xala-technologies/foundation/saga-orchestrator';

// Define individual saga steps
const reservePayment = defineSagaStep({
  name: 'reserve_payment',
  execute: async (context: SagaContext) => {
    const { citizenId, amount } = context.data;
    const reservation = await paymentService.reserve(citizenId, amount);
    context.setStepResult('reserve_payment', { reservationId: reservation.id });
    return reservation;
  },
  compensate: async (context: SagaContext) => {
    const result = context.getStepResult('reserve_payment');
    if (result?.reservationId) {
      await paymentService.cancelReservation(result.reservationId);
    }
  },
  timeout: 30000, // 30 seconds
});

const processApplication = defineSagaStep({
  name: 'process_application',
  execute: async (context: SagaContext) => {
    const { applicationId } = context.data;
    const result = await applicationService.process(applicationId);
    context.setStepResult('process_application', result);
    return result;
  },
  compensate: async (context: SagaContext) => {
    const { applicationId } = context.data;
    await applicationService.cancel(applicationId);
  },
});

// Create and execute saga
const citizenApplicationSaga = createSaga({
  name: 'citizen_application_workflow',
  steps: [reservePayment, processApplication],
  nsmClassification: 'BEGRENSET',
});

const result = await executeSaga(citizenApplicationSaga, {
  citizenId: 'citizen_123',
  applicationId: 'app_456',
  amount: 500,
});
```

### Norwegian Government Workflow

```typescript
import { createGovernmentWorkflow } from '@xala-technologies/foundation/saga-orchestrator';

// Norwegian citizen service workflow
const passportApplicationWorkflow = createGovernmentWorkflow({
  name: 'passport_application_process',
  description: 'Complete passport application processing workflow',
  municipality: '0301', // Oslo
  nsmClassification: 'BEGRENSET',
  gdprRelevant: true,

  steps: [
    {
      name: 'validate_identity',
      execute: async context => {
        const { citizenId, personalNumber } = context.data;
        const validation = await idPortenService.validateIdentity(citizenId, personalNumber);

        context.auditLog('identity_validated', {
          citizenId,
          validationResult: validation.status,
          nsmClassification: 'BEGRENSET',
        });

        return validation;
      },
      compensate: async context => {
        // No compensation needed for validation
      },
      critical: true,
    },

    {
      name: 'check_existing_passport',
      execute: async context => {
        const { citizenId } = context.data;
        const existing = await passportRegistry.findActive(citizenId);

        if (existing) {
          await passportRegistry.markForRenewal(existing.id);
        }

        context.setStepResult('check_existing_passport', { existing });
        return { hasExisting: !!existing, existing };
      },
      compensate: async context => {
        const result = context.getStepResult('check_existing_passport');
        if (result?.existing) {
          await passportRegistry.restoreActive(result.existing.id);
        }
      },
    },

    {
      name: 'process_payment',
      execute: async context => {
        const { citizenId, amount } = context.data;
        const payment = await paymentService.processGovernmentFee(citizenId, amount, {
          service: 'passport_application',
          municipality: context.saga.municipality,
        });

        context.auditLog('payment_processed', {
          citizenId,
          amount,
          paymentId: payment.id,
          gdprBasis: 'public_task',
        });

        return payment;
      },
      compensate: async context => {
        const payment = context.getStepResult('process_payment');
        if (payment?.id) {
          await paymentService.refund(payment.id, 'workflow_compensation');
        }
      },
      timeout: 60000,
    },

    {
      name: 'schedule_appointment',
      execute: async context => {
        const { citizenId, preferredDate } = context.data;
        const appointment = await appointmentService.schedule({
          citizenId,
          serviceType: 'passport_photo_and_biometrics',
          preferredDate,
          municipality: context.saga.municipality,
        });

        return appointment;
      },
      compensate: async context => {
        const appointment = context.getStepResult('schedule_appointment');
        if (appointment?.id) {
          await appointmentService.cancel(appointment.id);
        }
      },
    },
  ],
});
```

### Saga Execution with Monitoring

```typescript
// Execute saga with comprehensive monitoring
const executionResult = await executeSaga(
  passportApplicationWorkflow,
  {
    citizenId: 'citizen_12345678901',
    personalNumber: '12345678901',
    amount: 650, // NOK
    preferredDate: new Date('2024-02-15T10:00:00Z'),
  },
  {
    // Execution options
    timeoutMs: 300000, // 5 minutes total timeout
    retryFailedSteps: true,
    maxRetries: 2,
    enableAuditLogging: true,
    complianceValidation: true,

    // Monitoring callbacks
    onStepStarted: (stepName, context) => {
      console.log(`Starting step: ${stepName}`);
      metricsService.incrementCounter('saga_step_started', { step: stepName });
    },

    onStepCompleted: (stepName, result, duration) => {
      console.log(`Completed step: ${stepName} in ${duration}ms`);
      metricsService.recordHistogram('saga_step_duration', duration, { step: stepName });
    },

    onStepFailed: (stepName, error, context) => {
      console.error(`Step failed: ${stepName}`, error);
      metricsService.incrementCounter('saga_step_failed', { step: stepName, error: error.name });
    },

    onCompensationStarted: (stepName, context) => {
      console.log(`Starting compensation for: ${stepName}`);
      auditService.log('compensation_started', { step: stepName, sagaId: context.sagaId });
    },
  }
);
```

## Norwegian Compliance Features

### NSM Classification Handling

```typescript
const classifiedWorkflow = createSaga({
  name: 'security_clearance_workflow',
  nsmClassification: 'KONFIDENSIELT',

  steps: [
    {
      name: 'verify_security_clearance',
      execute: async context => {
        // Handle classified data with proper security measures
        const clearance = await securityService.verifyClearance(
          context.data.employeeId,
          'KONFIDENSIELT'
        );

        // All audit logs automatically inherit NSM classification
        context.auditLog('security_clearance_verified', {
          employeeId: context.data.employeeId,
          clearanceLevel: clearance.level,
          department: context.data.department,
        });

        return clearance;
      },
      compensate: async context => {
        // Compensation actions also inherit classification
        await securityService.revokeTemporaryAccess(context.data.employeeId);
      },
      nsmClassification: 'KONFIDENSIELT',
    },
  ],
});
```

### GDPR Compliance Integration

```typescript
const gdprCompliantWorkflow = createSaga({
  name: 'citizen_data_processing',
  gdprRelevant: true,
  personalDataIncluded: true,
  lawfulBasis: 'public_task',
  retentionPeriod: '7_years',

  steps: [
    {
      name: 'collect_personal_data',
      execute: async context => {
        const { citizenId, consentId } = context.data;

        // Verify consent is still valid
        const consent = await consentService.verify(consentId);
        if (!consent.isValid) {
          throw new Error('Consent no longer valid');
        }

        const personalData = await citizenService.collectPersonalData(citizenId);

        // Automatic GDPR audit logging
        context.auditLog('personal_data_collected', {
          citizenId,
          dataCategories: personalData.categories,
          lawfulBasis: 'public_task',
          consentId,
        });

        return personalData;
      },
      compensate: async context => {
        // GDPR-compliant data deletion
        const { citizenId } = context.data;
        await citizenService.deleteProcessedData(citizenId, {
          reason: 'workflow_compensation',
          gdprBasis: 'right_to_erasure',
        });
      },
    },
  ],
});
```

## Error Handling and Recovery

### Compensation Strategies

```typescript
const compensationStrategies = {
  // Immediate compensation - rollback as soon as step fails
  immediate: async (failedStep, context) => {
    const completedSteps = context.getCompletedSteps();
    for (const step of completedSteps.reverse()) {
      await step.compensate(context);
    }
  },

  // Delayed compensation - attempt retry before compensation
  delayed: async (failedStep, context, retryCount = 0) => {
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      try {
        await failedStep.execute(context);
        return; // Success, no compensation needed
      } catch (error) {
        return compensationStrategies.delayed(failedStep, context, retryCount + 1);
      }
    }

    // Max retries exceeded, start compensation
    return compensationStrategies.immediate(failedStep, context);
  },

  // Manual compensation - require human intervention
  manual: async (failedStep, context) => {
    await notificationService.sendToOperationsTeam({
      severity: 'high',
      subject: `Manual compensation required for saga ${context.sagaId}`,
      details: {
        sagaName: context.saga.name,
        failedStep: failedStep.name,
        context: context.data,
        nsmClassification: context.saga.nsmClassification,
      },
    });

    // Store for manual processing
    await manualCompensationQueue.add({
      sagaId: context.sagaId,
      failedStep: failedStep.name,
      context: context.data,
    });
  },
};
```

## Monitoring and Observability

### Saga Metrics

```typescript
const sagaMetrics = {
  totalSagasExecuted: 1247,
  successfulCompletions: 1198,
  failuresRequiringCompensation: 49,
  averageExecutionTime: 45000, // 45 seconds
  stepSuccessRate: 98.7,
  compensationSuccessRate: 100,
  activeWorkflows: 23,
  pendingManualIntervention: 2,
};
```

### Audit Trail Structure

```typescript
const sagaAuditTrail = {
  sagaId: 'saga_123',
  sagaName: 'citizen_application_workflow',
  status: 'completed',
  startTime: new Date('2024-01-15T10:00:00Z'),
  endTime: new Date('2024-01-15T10:02:30Z'),
  duration: 150000, // milliseconds
  nsmClassification: 'BEGRENSET',
  steps: [
    {
      name: 'validate_identity',
      status: 'completed',
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T10:00:15Z'),
      duration: 15000,
      result: { valid: true, confidence: 0.99 },
    },
    {
      name: 'process_payment',
      status: 'completed',
      startTime: new Date('2024-01-15T10:00:15Z'),
      endTime: new Date('2024-01-15T10:02:30Z'),
      duration: 135000,
      result: { paymentId: 'pay_456', amount: 650 },
    },
  ],
  auditLogs: [
    {
      timestamp: new Date('2024-01-15T10:00:15Z'),
      event: 'identity_validated',
      data: { citizenId: 'citizen_123', validationResult: 'success' },
      nsmClassification: 'BEGRENSET',
    },
  ],
};
```

## Integration with Other Modules

- **Event Core** - Saga state changes published as events
- **Event Publisher** - Reliable saga event publishing
- **Logger Module** - Comprehensive saga execution logging
- **Metrics SDK** - Workflow performance and success metrics
- **Error Handler** - Saga failure and compensation handling
