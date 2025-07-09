# Event Subscriber Module

The Event Subscriber module provides secure event subscription with Norwegian compliance, middleware support, and audit trail capabilities.

## Overview

This module enables secure event subscription for Norwegian government applications with built-in compliance validation, middleware processing, and reliable event handling.

## Key Features

- **Secure Subscription**: NSM-classified event subscription
- **Middleware Support**: Compliance and audit middleware
- **Reliable Processing**: Guaranteed event processing with error handling
- **Audit Trails**: Complete subscription audit for compliance
- **Performance Monitoring**: Subscription performance metrics

## Basic Usage

### Subscribing to Events

```typescript
import {
  getEventSubscriber,
  complianceMiddleware,
  auditMiddleware,
} from '@xala-technologies/foundation';

const subscriber = getEventSubscriber();

// Simple event subscription
subscriber.subscribe('citizen.*', async event => {
  console.log('Citizen event received:', event.type);
});

// Subscription with middleware
subscriber.use(complianceMiddleware());
subscriber.use(auditMiddleware());

subscriber.subscribe('payment.processed', async event => {
  await processPaymentEvent(event);
});
```

## API Reference

### Core Functions

#### `getEventSubscriber()`

Gets the global event subscriber instance.

#### `complianceMiddleware()`

Middleware for automatic compliance validation.

#### `auditMiddleware()`

Middleware for automatic audit trail creation.

## Related Documentation

- [Event Core](../event-core/README.md)
- [Event Publisher](../event-publisher/README.md)
