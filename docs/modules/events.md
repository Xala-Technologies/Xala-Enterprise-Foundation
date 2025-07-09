# Events Module Documentation

The events module provides a comprehensive event-driven architecture foundation specifically designed for Norwegian government applications. It handles event publishing, subscription, service discovery, and automatic compliance event generation.

## Overview

The events module consists of four main components:

- **EventBus**: Central event publishing and subscription system
- **ServiceRegistry**: Service discovery and health monitoring
- **NorwegianComplianceEvents**: Factory for creating compliance-aware events
- **Event Types**: TypeScript interfaces for type-safe event handling

## EventBus

The EventBus provides a singleton pattern for application-wide event communication with pattern-based subscription support.

### Basic Usage

```typescript
import { EventBus } from '@xala-technologies/foundation';

const eventBus = EventBus.getInstance();

// Subscribe to events with patterns
const unsubscribe = eventBus.subscribe('user.login.*', async event => {
  console.log('User login event:', event.eventType);
  console.log('Event data:', event.data);
});

// Publish events
await eventBus.publish({
  eventId: 'login_123',
  eventType: 'user.login.success',
  timestamp: new Date(),
  data: { userId: 'user123', sessionId: 'session456' },
});

// Clean up subscriptions when done
unsubscribe();
```

### Pattern Matching

The EventBus supports glob-style pattern matching for flexible event subscription:

```typescript
// Exact match
eventBus.subscribe('user.login.success', handler);

// Wildcard matches
eventBus.subscribe('user.login.*', handler); // Matches: user.login.success, user.login.failure
eventBus.subscribe('user.*', handler); // Matches: user.login.success, user.profile.updated
eventBus.subscribe('*.login.*', handler); // Matches: user.login.success, admin.login.failure

// Match all events
eventBus.subscribe('*', handler);
```

### Error Handling

The EventBus provides centralized error handling for event processing:

```typescript
// Set up global error handler
eventBus.onError((error, event) => {
  logger.error('Event processing failed', {
    error: error.message,
    eventId: event.eventId,
    eventType: event.eventType,
    stack: error.stack,
  });

  // Optional: Dead letter queue implementation
  deadLetterQueue.add(event);
});

// Errors in individual handlers are caught and passed to the error handler
eventBus.subscribe('problematic.event', async event => {
  throw new Error('Something went wrong'); // Caught by error handler
});
```

### Event Correlation

For tracking related events across system boundaries:

```typescript
// Create correlated events
await eventBus.publish({
  eventId: 'step1_123',
  eventType: 'process.started',
  correlationId: 'process_correlation_123',
  timestamp: new Date(),
  data: { processId: 'proc123' },
});

await eventBus.publish({
  eventId: 'step2_123',
  eventType: 'process.completed',
  correlationId: 'process_correlation_123', // Same correlation ID
  timestamp: new Date(),
  data: { processId: 'proc123', result: 'success' },
});
```

## ServiceRegistry

The ServiceRegistry provides service discovery and health monitoring capabilities for microservices architectures.

### Service Registration

```typescript
import { ServiceRegistry } from '@xala-technologies/foundation';

const registry = ServiceRegistry.getInstance();

await registry.register({
  name: 'citizen-portal',
  version: '2.1.0',
  endpoints: ['https://portal.example.no/api'],
  healthCheck: 'https://portal.example.no/health',
  metadata: {
    environment: 'production',
    municipality: 'Oslo',
    serviceType: 'web_application',
  },
  compliance: {
    nsmClassification: 'BEGRENSET',
    gdprCompliant: true,
    digdirRegistered: true,
  },
  tags: ['citizen-services', 'public-facing', 'oslo'],
});
```

### Service Discovery

```typescript
// Find services by criteria
const citizenServices = await registry.find({
  tags: ['citizen-services'],
  compliance: { nsmClassification: 'BEGRENSET' },
  metadata: { municipality: 'Oslo' },
});

// Find specific service
const portalService = await registry.findByName('citizen-portal');

// Health status monitoring
const healthStatus = await registry.getHealthStatus();
console.log('Unhealthy services:', healthStatus.unhealthy);
```

### Health Monitoring

```typescript
// Enable automatic health monitoring
await registry.startHealthMonitoring({
  checkInterval: 30000, // Check every 30 seconds
  timeout: 5000, // 5 second timeout
  retryAttempts: 3, // Retry failed checks 3 times
  onHealthChange: (service, status) => {
    logger.info('Service health changed', {
      serviceName: service.name,
      previousStatus: status.previous,
      currentStatus: status.current,
      lastCheck: status.lastCheck,
    });
  },
});
```

## NorwegianComplianceEvents

Factory functions for creating events that automatically include Norwegian compliance metadata.

### NSM Classification Events

For events that handle classified information according to NSM standards:

```typescript
import { NorwegianComplianceEvents } from '@xala-technologies/foundation';

const nsmEvent = NorwegianComplianceEvents.createNSMClassificationEvent(
  'data.processing.completed',
  {
    documentId: 'doc123',
    processingResult: 'approved',
    handlerId: 'official456',
  },
  'KONFIDENSIELT', // NSM classification level
  ['document_processing', 'manual_review_required']
);

await eventBus.publish(nsmEvent);
```

### ID-porten Authentication Events

For Norwegian government authentication integration:

```typescript
const authEvent = NorwegianComplianceEvents.createIdPortenAuthenticationEvent(
  '12345678901', // Norwegian personal ID
  'Level4', // Security level
  'SUCCESS' // Authentication result
);

await eventBus.publish(authEvent);
```

### GDPR Data Processing Events

For tracking personal data processing under GDPR:

```typescript
const gdprEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
  'citizen.data.accessed',
  {
    citizenId: '12345678901',
    accessedBy: 'official123',
    accessReason: 'service_application_review',
  },
  ['personal_data', 'contact_data'], // Data categories
  'public_task' // Legal basis
);

await eventBus.publish(gdprEvent);
```

### Municipal Service Events

For tracking municipal service interactions:

```typescript
const municipalEvent = NorwegianComplianceEvents.createMunicipalServiceEvent(
  'building_permit', // Service type
  '12345678901', // Citizen ID
  'Oslo', // Municipality
  'APPROVED' // Service status
);

await eventBus.publish(municipalEvent);
```

## Type Definitions

The events module provides comprehensive TypeScript types for type-safe event handling.

### Core Event Interface

```typescript
interface Event {
  eventId: string;
  eventType: string;
  timestamp: Date;
  data: any;
  source?: string;
  tenantId?: string;
  correlationId?: string;
}
```

### Compliance Event Interface

```typescript
interface ComplianceEvent extends Event {
  compliance: {
    classification: NSMSecurityClassification;
    gdprApplicable: boolean;
    personalDataIncluded: boolean;
    auditRequired: boolean;
    retentionPeriod: string;
    legalBasis?: GDPRLegalBasis;
    nsm?: NSMMetadata;
  };
  norwegian: {
    locale: string;
    municipality?: string;
    governmentLevel?: 'LOCAL' | 'REGIONAL' | 'NATIONAL';
    serviceArea?: string;
  };
}
```

### Service Registration Interface

```typescript
interface ServiceRegistration {
  name: string;
  version: string;
  endpoints: string[];
  healthCheck: string;
  metadata?: Record<string, any>;
  compliance?: {
    nsmClassification?: NSMSecurityClassification;
    gdprCompliant?: boolean;
    digdirRegistered?: boolean;
  };
  tags?: string[];
}
```

## Best Practices

### Event Naming Conventions

Use hierarchical event names that follow a consistent pattern:

```typescript
// Good: Hierarchical, descriptive
'citizen.authentication.id_porten.success';
'document.processing.classification.completed';
'service.application.building_permit.submitted';

// Avoid: Flat, unclear
'auth_success';
'doc_done';
'app_sub';
```

### Error Resilience

Implement proper error handling in event subscribers:

```typescript
eventBus.subscribe('critical.process.*', async event => {
  try {
    await processCriticalEvent(event);
  } catch (error) {
    // Log the error but don't throw (prevents breaking other subscribers)
    logger.error('Critical process failed', {
      eventId: event.eventId,
      error: error.message,
    });

    // Optionally publish a failure event
    await eventBus.publish({
      eventId: `${event.eventId}_failure`,
      eventType: 'critical.process.failure',
      timestamp: new Date(),
      data: {
        originalEventId: event.eventId,
        error: error.message,
      },
    });
  }
});
```

### Memory Management

Always clean up event subscriptions to prevent memory leaks:

```typescript
class ServiceClass {
  private subscriptions: (() => void)[] = [];

  constructor() {
    this.subscriptions.push(eventBus.subscribe('service.*', this.handleServiceEvent.bind(this)));
  }

  destroy() {
    // Clean up all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }

  private async handleServiceEvent(event: Event) {
    // Handle event
  }
}
```

### Compliance Event Usage

Always use the appropriate compliance event factory for government applications:

```typescript
// For personal data access
const event = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
  'citizen.data.read',
  eventData,
  ['personal_data'],
  'public_task'
);

// For classified document processing
const event = NorwegianComplianceEvents.createNSMClassificationEvent(
  'document.classified.processed',
  eventData,
  'KONFIDENSIELT',
  ['document_classification']
);
```

## Performance Considerations

### Event Batching

For high-volume scenarios, consider event batching:

```typescript
class EventBatcher {
  private batch: Event[] = [];
  private batchSize = 100;
  private flushInterval = 5000; // 5 seconds

  constructor() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  add(event: Event) {
    this.batch.push(event);
    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.batch.length === 0) return;

    const events = this.batch.splice(0);
    await Promise.all(events.map(event => eventBus.publish(event)));
  }
}
```

### Async Processing

Use asynchronous processing for heavy operations:

```typescript
eventBus.subscribe('heavy.processing.*', async event => {
  // Queue heavy work instead of blocking
  await jobQueue.add('process-heavy-event', event.data);
});
```

## Integration Examples

### Express.js Integration

```typescript
import express from 'express';
import { EventBus, NorwegianComplianceEvents } from '@xala-technologies/foundation';

const app = express();
const eventBus = EventBus.getInstance();

app.post('/api/citizen/login', async (req, res) => {
  try {
    // Perform authentication
    const authResult = await authenticateUser(req.body);

    // Create compliance event
    const authEvent = NorwegianComplianceEvents.createIdPortenAuthenticationEvent(
      authResult.citizenId,
      authResult.securityLevel,
      authResult.success ? 'SUCCESS' : 'FAILURE'
    );

    await eventBus.publish(authEvent);

    res.json({ success: authResult.success });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});
```

### React Component Integration

```typescript
import React, { useEffect, useState } from 'react';
import { EventBus } from '@xala-technologies/foundation';

function ServiceStatus() {
  const [services, setServices] = useState([]);
  const eventBus = EventBus.getInstance();

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('service.health.*', (event) => {
      setServices(prev => updateServiceStatus(prev, event.data));
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  return (
    <div>
      {services.map(service => (
        <div key={service.name}>
          {service.name}: {service.status}
        </div>
      ))}
    </div>
  );
}
```

This events module documentation provides the foundation for building robust, compliant event-driven applications in the Norwegian government context.
