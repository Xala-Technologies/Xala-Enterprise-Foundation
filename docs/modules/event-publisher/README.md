# Event Publisher Module

The Event Publisher module provides secure event publishing with Norwegian compliance, NSM classification, and audit trail support.

## Overview

This module enables secure event publishing for Norwegian government applications with built-in compliance validation, security classification, and reliable delivery.

## Key Features

- **Secure Publishing**: NSM-classified event publishing
- **Compliance Validation**: Automatic GDPR and NSM compliance checking
- **Reliable Delivery**: Guaranteed event delivery with retry logic
- **Audit Trails**: Complete publishing audit for compliance
- **Performance Monitoring**: Publishing performance metrics

## Basic Usage

### Publishing Events

```typescript
import { publishEvent, getEventPublisher } from '@xala-technologies/foundation';

// Simple event publishing
await publishEvent('citizen.registered', {
  citizenId: 'NO-12345678901',
  municipality: '0301',
});

// Publishing with options
const publisher = getEventPublisher();
await publisher.publish(event, {
  validateCompliance: true,
  priority: 'high',
  retryAttempts: 3,
});
```

## API Reference

### Core Functions

#### `publishEvent(type, data, options?)`

Publishes an event with optional configuration.

#### `getEventPublisher()`

Gets the global event publisher instance.

## Related Documentation

- [Event Core](../event-core/README.md)
- [Event Subscriber](../event-subscriber/README.md)
