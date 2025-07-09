# Event Core Module

The Event Core module provides fundamental event-driven architecture with Norwegian compliance, security classification, and GDPR-compliant event processing.

## Overview

This module provides the foundation for event-driven architecture in Norwegian government applications with built-in security classification, compliance validation, and audit trails.

## Key Features

- **Event Creation**: Type-safe event creation with metadata
- **Security Classification**: NSM classification for sensitive events
- **GDPR Compliance**: Personal data handling in events
- **Audit Trails**: Comprehensive event audit logging
- **Type Safety**: Full TypeScript support for event data

## Basic Usage

### Creating Events

```typescript
import { createEvent } from '@xala-technologies/foundation';

// Create basic event
const citizenEvent = createEvent('citizen.registered', {
  citizenId: 'NO-12345678901',
  municipality: '0301',
  timestamp: new Date(),
});

// Create classified event
const secureEvent = createEvent(
  'document.accessed',
  {
    documentId: 'doc_123',
    userId: 'officer_456',
  },
  {
    nsmClassification: 'KONFIDENSIELT',
  }
);
```

### Event Metadata

```typescript
import { createEvent } from '@xala-technologies/foundation';

const event = createEvent(
  'payment.processed',
  {
    amount: 1500,
    currency: 'NOK',
    citizenId: 'NO-12345678901',
  },
  {
    nsmClassification: 'BEGRENSET',
    gdprData: {
      legalBasis: 'public_task',
      dataCategories: ['financial'],
    },
  }
);
```

## API Reference

### Core Functions

#### `createEvent(type, data, metadata?)`

Creates a new event with optional metadata and classification.

**Parameters:**

- `type: string` - Event type identifier
- `data: T` - Event payload data
- `metadata?: EventMetadata` - Optional metadata including NSM classification

**Returns:** `Event<T>`

## Norwegian Government Examples

### Oslo Kommune Citizen Registration

```typescript
import { createEvent } from '@xala-technologies/foundation';

// Citizen registration event for Oslo
const registrationEvent = createEvent(
  'citizen.registered',
  {
    citizenId: 'NO-12345678901',
    municipality: '0301',
    registrationDate: new Date(),
    serviceType: 'digital_identity',
  },
  {
    nsmClassification: 'BEGRENSET',
    gdprData: {
      legalBasis: 'public_task',
      dataCategories: ['identity', 'contact'],
    },
  }
);
```

## Testing

```bash
# Run event-core tests
pnpm test event-core

# Run classification tests
pnpm test --testNamePattern="NSM classification"
```

## Related Documentation

- [Event Publisher](../event-publisher/README.md)
- [Event Subscriber](../event-subscriber/README.md)
- [Norwegian Compliance](../../compliance/norwegian-compliance.md)
