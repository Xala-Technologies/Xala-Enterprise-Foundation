# event-core

Core event system providing type-safe event publishing and subscription with Norwegian compliance support.

## Features

- **Type-safe events** - Full TypeScript support with generic event types
- **Event bus architecture** - Publish/subscribe pattern for decoupled communication
- **Norwegian compliance** - Automatic NSM classification and GDPR metadata
- **Retry mechanisms** - Built-in retry logic for failed event handlers
- **Event history** - Audit trail of all published events
- **Personal data detection** - Automatic identification of GDPR-relevant events

## Usage

### Basic Event Publishing

```typescript
import { getEventBus, createEvent } from '@xala-technologies/foundation/event-core';

const eventBus = getEventBus();

// Create and publish an event
const event = createEvent('user.login', {
  userId: 'user_123',
  loginTime: new Date(),
});

await eventBus.publish(event);
```

### Event Subscription

```typescript
import { getEventBus } from '@xala-technologies/foundation/event-core';

const eventBus = getEventBus();

// Subscribe to events
const subscriptionId = eventBus.subscribe('user.login', async event => {
  console.log('User logged in:', event.userId);
  // Handle the event
});

// Unsubscribe when done
eventBus.unsubscribe(subscriptionId);
```

### Norwegian Compliance Events

```typescript
import { createComplianceEvent } from '@xala-technologies/foundation/event-core';

// Create NSM classified event
const classifiedEvent = createComplianceEvent(
  'security.audit',
  { operation: 'sensitive_data_access' },
  'KONFIDENSIELT'
);

await eventBus.publish(classifiedEvent);
```

## Event Structure

All events follow the `BaseEvent` interface:

```typescript
interface BaseEvent {
  id: string; // Unique event identifier
  type: string; // Event type (e.g., 'user.login')
  timestamp: Date; // When the event occurred
  source: string; // Source system/module
  version: string; // Event schema version
  metadata?: Record<string, any>; // Additional metadata
  nsmClassification?: string; // NSM security classification
}
```

## Compliance Features

- **Automatic NSM classification** - Events are classified according to Norwegian security standards
- **GDPR detection** - Personal data is automatically detected and flagged
- **Audit trails** - All events are stored for compliance reporting
- **Retention policies** - Configurable data retention periods
