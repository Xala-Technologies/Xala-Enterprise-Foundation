# event-subscriber

Advanced event subscription with filtering, middleware, compliance handling, and reliable processing.

## Features

- **Flexible event subscriptions** - Subscribe to specific events, patterns, or event categories
- **Event filtering** - Advanced filtering based on content, metadata, and compliance classifications
- **Middleware support** - Pre/post-processing pipeline for event handling
- **Norwegian compliance** - NSM and GDPR-aware event processing
- **Dead letter queues** - Failed event handling and recovery mechanisms
- **Priority processing** - Handle high-priority events with dedicated processing

## Usage

### Basic Event Subscription

```typescript
import {
  getEventSubscriber,
  subscribeToEvent,
  subscribeToPattern,
  unsubscribe,
} from '@xala-technologies/foundation/event-subscriber';

const subscriber = getEventSubscriber();

// Subscribe to specific event type
const subscriptionId = await subscribeToEvent('user.login', async event => {
  console.log('User logged in:', event.data.userId);
  // Process the login event
  await processUserLogin(event.data);
});

// Subscribe to event pattern
const patternId = await subscribeToPattern('citizen.*', async event => {
  console.log('Citizen event received:', event.type);
  await processCitizenEvent(event);
});

// Unsubscribe when done
await unsubscribe(subscriptionId);
```

### Advanced Subscription with Options

```typescript
import { subscribe } from '@xala-technologies/foundation/event-subscriber';

// Subscribe with filtering and middleware
const advancedSubscription = await subscribe('document.uploaded', {
  filter: {
    // Only process documents from Oslo municipality
    municipality: '0301',
    fileSize: { $lt: 10485760 }, // Less than 10MB
    nsmClassification: { $in: ['ÅPEN', 'BEGRENSET'] },
  },
  middleware: [
    // Pre-processing middleware
    async (event, next) => {
      console.log('Processing event:', event.id);
      event.metadata.processedAt = new Date();
      await next();
    },
    // Validation middleware
    async (event, next) => {
      if (await validateEventCompliance(event)) {
        await next();
      } else {
        throw new Error('Compliance validation failed');
      }
    },
  ],
  priority: 'high',
  maxRetries: 3,
  deadLetterQueue: true,
  handler: async event => {
    await processDocumentUpload(event.data);
  },
});
```

### Norwegian Compliance Subscriptions

```typescript
import {
  subscribeToNSMClassifiedEvents,
  subscribeToGDPREvents,
  subscribeToMunicipalityEvents,
} from '@xala-technologies/foundation/event-subscriber';

// Subscribe to NSM classified events
await subscribeToNSMClassifiedEvents('KONFIDENSIELT', async event => {
  // Handle classified events with proper security measures
  await handleClassifiedEvent(event, {
    auditRequired: true,
    accessControl: 'strict',
    encryptionRequired: true,
  });
});

// Subscribe to GDPR-relevant events
await subscribeToGDPREvents(
  {
    personalDataIncluded: true,
    lawfulBasis: 'public_task',
  },
  async event => {
    // Process events containing personal data
    await processPersonalDataEvent(event, {
      gdprCompliance: true,
      auditTrail: true,
    });
  }
);

// Subscribe to municipality-specific events
await subscribeToMunicipalityEvents(
  '0301', // Oslo
  'citizen.service_request',
  async event => {
    await processOsloCitizenRequest(event.data);
  }
);
```

## Event Filtering

### Filter Operators

```typescript
const filterOptions = {
  // Equality
  userId: 'user_123',

  // Comparison operators
  timestamp: { $gt: new Date('2024-01-01') },
  fileSize: { $lt: 10485760 },
  priority: { $gte: 5 },

  // Array operators
  tags: { $in: ['urgent', 'citizen-service'] },
  municipality: { $nin: ['9999'] }, // Exclude invalid codes

  // Pattern matching
  email: { $regex: /.*@oslo\.kommune\.no$/ },

  // Norwegian compliance filters
  nsmClassification: { $in: ['ÅPEN', 'BEGRENSET'] },
  gdprRelevant: true,
  personalDataIncluded: false,
};
```

### Complex Filtering

```typescript
const complexFilter = {
  $and: [
    { municipality: '0301' },
    {
      $or: [{ priority: 'high' }, { urgent: true }],
    },
    {
      nsmClassification: { $in: ['ÅPEN', 'BEGRENSET'] },
    },
  ],
};
```

## Middleware Pipeline

### Pre-processing Middleware

```typescript
const preprocessingMiddleware = [
  // Logging middleware
  async (event, next) => {
    console.log(`Processing event ${event.id} of type ${event.type}`);
    const startTime = Date.now();

    await next();

    const duration = Date.now() - startTime;
    console.log(`Event processed in ${duration}ms`);
  },

  // Enrichment middleware
  async (event, next) => {
    if (event.data.userId) {
      event.data.userProfile = await getUserProfile(event.data.userId);
    }

    if (event.data.municipality) {
      event.data.municipalityInfo = await getMunicipalityInfo(event.data.municipality);
    }

    await next();
  },

  // Compliance validation middleware
  async (event, next) => {
    const compliance = await validateEventCompliance(event);

    if (!compliance.isValid) {
      throw new ComplianceError(
        `Event ${event.id} failed compliance check: ${compliance.violations.join(', ')}`
      );
    }

    event.metadata.complianceValidated = true;
    event.metadata.complianceScore = compliance.score;

    await next();
  },
];
```

## Error Handling and Recovery

### Retry Configuration

```typescript
const retryConfig = {
  maxRetries: 3,
  retryStrategy: 'exponential', // 'linear', 'exponential', 'fixed'
  baseDelay: 1000,
  maxDelay: 30000,
  retryConditions: ['network_error', 'temporary_failure', 'service_unavailable'],
};
```

### Dead Letter Queue Handling

```typescript
const dlqHandler = async (failedEvent, error, attempts) => {
  console.log(`Event ${failedEvent.id} failed after ${attempts} attempts:`, error.message);

  // Log the failure for compliance audit
  await auditLog({
    eventType: 'event_processing_failed',
    eventId: failedEvent.id,
    error: error.message,
    attempts,
    nsmClassification: failedEvent.nsmClassification || 'ÅPEN',
  });

  // Notify operations team for manual intervention
  if (failedEvent.priority === 'high' || failedEvent.critical) {
    await notifyOperationsTeam({
      severity: 'high',
      message: `Critical event processing failed: ${failedEvent.id}`,
      event: failedEvent,
      error: error.message,
    });
  }

  // Store in dead letter queue for later analysis
  await storeInDeadLetterQueue(failedEvent, error);
};
```

## Norwegian Government Integration

### Municipality Event Processing

```typescript
// Process events for specific Norwegian municipalities
const municipalityProcessors = {
  '0301': async event => {
    // Oslo
    await processOsloEvent(event);
  },
  '1103': async event => {
    // Stavanger
    await processStavangerEvent(event);
  },
  '5001': async event => {
    // Trondheim
    await processTrondheimEvent(event);
  },
};

await subscribeToPattern('municipality.*', async event => {
  const municipalityCode = event.data.municipality;
  const processor = municipalityProcessors[municipalityCode];

  if (processor) {
    await processor(event);
  } else {
    await processGenericMunicipalityEvent(event);
  }
});
```

## Performance and Monitoring

### Subscription Metrics

```typescript
const subscriptionMetrics = {
  totalSubscriptions: 45,
  activeSubscriptions: 42,
  eventsProcessed: 12847,
  processingErrors: 23,
  averageProcessingTime: 125, // milliseconds
  deadLetterQueueSize: 5,
  complianceViolations: 2,
};
```

### Monitoring Dashboard

```typescript
const monitoringConfig = {
  metricsCollection: true,
  performanceTracking: true,
  errorRateAlerts: {
    threshold: 5, // percent
    notificationChannels: ['email', 'slack'],
  },
  processingTimeAlerts: {
    threshold: 1000, // milliseconds
    notificationChannels: ['email'],
  },
};
```

## Integration with Other Modules

- **Event Core** - Core event infrastructure and bus
- **Event Publisher** - Reliable event publishing
- **Logger Module** - Automatic subscription audit logs
- **Metrics SDK** - Processing performance metrics
- **Error Handler** - Failed subscription processing
