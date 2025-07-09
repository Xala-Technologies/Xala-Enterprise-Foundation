# Saga Orchestrator Module

The Saga Orchestrator module provides workflow management with compensation handling, Norwegian compliance, and document processing workflows.

## Overview

This module enables complex workflow orchestration for Norwegian government applications with built-in compensation logic, security classification, and compliance validation.

## Key Features

- **Workflow Orchestration**: Complex multi-step process management
- **Compensation Logic**: Automatic rollback and error recovery
- **Security Classification**: NSM-classified workflow processing
- **Document Processing**: Government document workflow support
- **Audit Trails**: Complete workflow audit and compliance tracking

## Basic Usage

### Creating Sagas

```typescript
import { SagaOrchestrator } from '@xala-technologies/foundation';

const orchestrator = new SagaOrchestrator();

// Define simple saga
const citizenOnboardingSaga = orchestrator
  .createSaga('citizen_onboarding')
  .addStep('validate_identity', validateCitizenIdentity)
  .addStep('create_account', createCitizenAccount)
  .addStep('send_confirmation', sendConfirmationEmail)
  .addCompensation('create_account', rollbackAccountCreation)
  .addCompensation('validate_identity', logValidationFailure);

// Execute saga
await orchestrator.execute('citizen_onboarding', {
  citizenId: 'NO-12345678901',
  municipality: '0301',
});
```

### Classified Document Workflow

```typescript
import { SagaOrchestrator } from '@xala-technologies/foundation';

const orchestrator = new SagaOrchestrator();

// HEMMELIG document processing saga
const classifiedDocSaga = orchestrator.createSaga('classified_document_processing')
  .addStep('verify_clearance', verifySecurity Clearance)
  .addStep('decrypt_document', decryptClassifiedDocument)
  .addStep('process_content', processDocumentContent)
  .addStep('audit_access', auditDocumentAccess)
  .withClassification('HEMMELIG')
  .withAuditTrail(true);
```

## API Reference

### Core Functions

#### `createSaga(name)`

Creates a new saga workflow definition.

#### `execute(sagaName, data)`

Executes a saga with the provided data.

#### `getSagaStatus(sagaId)`

Gets the current status of a running saga.

### SagaOrchestrator Class

```typescript
import { SagaOrchestrator } from '@xala-technologies/foundation';

const orchestrator = new SagaOrchestrator({
  compliance: {
    nsm: true,
    gdpr: true,
    auditTrail: true,
  },
});
```

## Norwegian Government Examples

### Document Processing Workflow

```typescript
// Government document approval workflow
const documentApprovalSaga = orchestrator
  .createSaga('document_approval')
  .addStep('initial_review', performInitialReview)
  .addStep('security_classification', classifyDocument)
  .addStep('department_approval', getDepartmentApproval)
  .addStep('final_approval', getFinalApproval)
  .addStep('publish_document', publishToPortal)
  .withTimeout(7200000) // 2 hours
  .withClassification('KONFIDENSIELT');

await orchestrator.execute('document_approval', {
  documentId: 'doc_123',
  department: 'social_services',
  municipality: '0301',
});
```

## Testing

```bash
# Run saga orchestrator tests
pnpm test saga-orchestrator

# Run workflow tests
pnpm test --testNamePattern="workflow"
```

## Related Documentation

- [Event Core](../event-core/README.md)
- [Logger](../logger/README.md)
- [Norwegian Compliance](../../compliance/norwegian-compliance.md)
