# event-publisher

Advanced event publishing with batching, scheduling, compliance validation, and reliable delivery.

## Features

- **Reliable event publishing** - Guaranteed delivery with retry mechanisms
- **Batch processing** - Efficient bulk event publishing
- **Scheduled publishing** - Delayed and time-based event delivery
- **Norwegian compliance** - NSM classification and GDPR-aware event validation
- **Priority handling** - High, normal, and low priority event queues
- **Dead letter queues** - Failed event handling and recovery

## Usage

### Basic Event Publishing

```typescript
import {
  getEventPublisher,
  publishEvent,
  publishEvents,
  scheduleEvent,
} from '@xala-technologies/foundation/event-publisher';

const publisher = getEventPublisher();

// Publish single event
await publishEvent('user.login', {
  userId: 'user_123',
  loginTime: new Date(),
  ipAddress: '192.168.1.1',
});

// Publish with options
await publishEvent(
  'document.uploaded',
  {
    documentId: 'doc_456',
    userId: 'user_123',
    fileSize: 2048576,
  },
  {
    priority: 'high',
    retries: 3,
    validateCompliance: true,
  }
);
```

### Batch Event Publishing

```typescript
import { publishBatch, createEventBatch } from '@xala-technologies/foundation/event-publisher';

// Create a batch of related events
const batch = createEventBatch('user_session_batch_001');

// Add events to batch
batch.addEvent('user.login', { userId: 'user_123', loginTime: new Date() });
batch.addEvent('user.page_view', { userId: 'user_123', page: '/dashboard' });
batch.addEvent('user.action', { userId: 'user_123', action: 'download_document' });

// Publish entire batch
await publishBatch(batch, {
  priority: 'normal',
  maxRetries: 2,
  batchTimeout: 30000, // 30 seconds
});

// Alternative: Publish multiple events as array
const events = [
  { type: 'citizen.application_started', data: { applicationId: 'app_001' } },
  { type: 'citizen.document_uploaded', data: { documentId: 'doc_001' } },
  { type: 'citizen.payment_initiated', data: { paymentId: 'pay_001' } },
];

await publishEvents(events, { batchId: 'citizen_workflow_001' });
```

### Scheduled Event Publishing

```typescript
import {
  scheduleEvent,
  scheduleRecurringEvent,
} from '@xala-technologies/foundation/event-publisher';

// Schedule event for future delivery
await scheduleEvent(
  'reminder.document_expiry',
  {
    citizenId: 'citizen_123',
    documentType: 'passport',
    expiryDate: new Date('2024-12-31'),
  },
  {
    publishAt: new Date('2024-12-01T09:00:00Z'), // 30 days before expiry
    priority: 'normal',
  }
);

// Schedule recurring events
await scheduleRecurringEvent(
  'system.health_check',
  { checkType: 'full_system_scan' },
  {
    schedule: '0 2 * * *', // Daily at 2 AM (cron syntax)
    timezone: 'Europe/Oslo',
  }
);
```

### Norwegian Compliance Publishing

```typescript
import {
  publishNSMClassifiedEvent,
  publishGDPREvent,
  validateEventCompliance,
} from '@xala-technologies/foundation/event-publisher';

// NSM classified event publishing
await publishNSMClassifiedEvent(
  'security.access_granted',
  {
    userId: 'user_123',
    resourceId: 'classified_doc_456',
    accessLevel: 'read',
    department: 'IT-sikkerhet',
  },
  'KONFIDENSIELT', // NSM classification
  {
    auditRequired: true,
    retentionPeriod: '7_years',
  }
);

// GDPR-compliant event publishing
await publishGDPREvent(
  'citizen.personal_data_processed',
  {
    citizenId: 'citizen_123',
    dataCategory: 'identification_data',
    processingPurpose: 'service_delivery',
    lawfulBasis: 'public_task',
  },
  {
    personalDataIncluded: true,
    consentRequired: false,
    retentionPeriod: '7_years',
  }
);

// Validate event compliance before publishing
const eventData = {
  userId: 'user_123',
  personalIdentifier: '12345678901',
};

const compliance = await validateEventCompliance('user.profile_updated', eventData);
if (compliance.isCompliant) {
  await publishEvent('user.profile_updated', eventData);
} else {
  console.log('Compliance violations:', compliance.violations);
}
```

## Publishing Options

### Priority Levels

```typescript
interface PublishOptions {
  priority: 'low' | 'normal' | 'high'; // Event priority
  delay?: number; // Delay in milliseconds
  retries?: number; // Max retry attempts
  validateCompliance?: boolean; // Enable compliance validation
  batchId?: string; // Group events in batch
  tags?: string[]; // Event tags for filtering
  metadata?: Record<string, any>; // Additional metadata
}
```

### Retry Configuration

```typescript
const retryConfig = {
  maxRetries: 3,
  retryBackoff: 'exponential', // 'linear' | 'exponential' | 'fixed'
  baseDelay: 1000, // Initial delay in ms
  maxDelay: 30000, // Maximum delay in ms
  retryConditions: ['network_error', 'service_unavailable', 'timeout'],
};
```

## Event Validation and Compliance

### NSM Classification Validation

```typescript
const nsmValidation = {
  ÅPEN: {
    allowedChannels: ['public_queue', 'notification_service'],
    encryptionRequired: false,
    auditRequired: false,
  },
  BEGRENSET: {
    allowedChannels: ['secure_queue'],
    encryptionRequired: true,
    auditRequired: true,
  },
  KONFIDENSIELT: {
    allowedChannels: ['classified_queue'],
    encryptionRequired: true,
    auditRequired: true,
    accessControl: 'strict',
  },
  HEMMELIG: {
    allowedChannels: ['top_secret_queue'],
    encryptionRequired: true,
    auditRequired: true,
    accessControl: 'maximum',
    specialHandling: true,
  },
};
```

### GDPR Compliance Validation

```typescript
const gdprValidation = {
  personalDataDetection: true,
  consentValidation: true,
  lawfulBasisRequired: true,
  retentionPolicyEnforcement: true,
  dataMinimization: true,
  encryptionForPersonalData: true,
};
```

## Event Publishing Patterns

### Transactional Publishing

```typescript
// Publish events as part of database transaction
await withTransaction(async tx => {
  // Database operations
  await tx.users.update(userId, userData);

  // Publish event within transaction
  await publishEventInTransaction('user.updated', userData, tx);

  // Event will only be published if transaction commits
});
```

### Event Sourcing Pattern

```typescript
// Event sourcing with aggregate events
const aggregateEvents = [
  { type: 'citizen.application_submitted', version: 1 },
  { type: 'citizen.documents_verified', version: 2 },
  { type: 'citizen.payment_processed', version: 3 },
  { type: 'citizen.application_approved', version: 4 },
];

await publishEventStream('citizen_application_stream', aggregateEvents, {
  streamId: 'citizen_123_application_001',
  expectedVersion: 3, // Optimistic concurrency control
});
```

## Error Handling and Dead Letter Queues

```typescript
// Configure dead letter queue handling
const dlqConfig = {
  enabled: true,
  maxRetries: 5,
  retryBackoff: 'exponential',
  dlqProcessor: async failedEvent => {
    // Custom handling for failed events
    await logFailedEvent(failedEvent);
    await notifyOperationsTeam(failedEvent);

    // Attempt manual recovery
    if (failedEvent.recoverable) {
      await scheduleEventRetry(failedEvent, { delay: 3600000 }); // 1 hour
    }
  },
};
```

## Monitoring and Metrics

```typescript
// Publishing metrics automatically collected
const publishingMetrics = {
  totalEventsPublished: 15420,
  successfulPublishes: 15380,
  failedPublishes: 40,
  averagePublishTime: 45, // milliseconds
  batchPublishes: 245,
  scheduledEvents: 128,
  dlqEvents: 12,
  complianceViolations: 2,
};
```

## Integration with Other Modules

- **Event Core** - Core event infrastructure and event bus
- **Event Subscriber** - Reliable event consumption
- **Logger Module** - Automatic event publishing audit logs
- **Metrics SDK** - Publishing performance and reliability metrics
- **Error Handler** - Failed event processing and recovery
