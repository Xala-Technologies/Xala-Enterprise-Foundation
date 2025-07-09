# Error Handler Module

The Error Handler module provides centralized error management with NSM security classification, GDPR compliance, and user-friendly Norwegian error messaging.

## Overview

This module enables robust error handling for Norwegian government applications with built-in support for security classification, compliance reporting, and localized error messages.

## Key Features

- **NSM Security Classifications**: Automatic error classification and secure logging
- **GDPR Compliance**: Error processing with personal data protection
- **Norwegian Localization**: Error messages in Bokmål and Nynorsk
- **Centralized Handling**: Unified error processing across applications
- **Compliance Reporting**: Automated error reporting for audits

## Basic Usage

### Simple Error Handling

```typescript
import { ErrorHandler, createError } from '@xala-technologies/foundation';

const errorHandler = new ErrorHandler();

try {
  // Your application code
  await processPayment(citizenId);
} catch (error) {
  const handledError = await errorHandler.handle(error, {
    context: { municipality: '0301', operation: 'payment' },
  });

  console.log(handledError.userMessage); // User-friendly Norwegian message
}
```

### NSM Classified Error Handling

```typescript
import { ErrorHandler, SecurityError } from '@xala-technologies/foundation';

const errorHandler = new ErrorHandler();

try {
  await accessClassifiedDocument(documentId);
} catch (error) {
  if (error instanceof SecurityError) {
    await errorHandler.handleSecurityError(error, {
      classification: 'KONFIDENSIELT',
      auditRequired: true,
      notifySecurityTeam: true,
    });
  }
}
```

## API Reference

### Core Functions

#### `handleError(error, context?)`

Central error handling with context and classification.

#### `createSecurityError(message, classification)`

Creates security-specific errors with NSM classification.

#### `getErrorStatistics()`

Retrieves error metrics and reporting data.

### ErrorHandler Class

```typescript
import { ErrorHandler } from '@xala-technologies/foundation';

const handler = new ErrorHandler({
  logErrors: true,
  reportToMetrics: true,
  norwegian: {
    language: 'nb', // Bokmål (default) or 'nn' for Nynorsk
    municipality: '0301',
  },
});
```

## Norwegian Government Examples

### Oslo Kommune Error Handling

```typescript
const osloErrorHandler = new ErrorHandler({
  municipality: '0301',
  language: 'nb',
  compliance: {
    nsm: true,
    gdpr: true,
    auditTrail: true,
  },
});

// Handle payment processing error
try {
  await processPayment();
} catch (error) {
  const result = await osloErrorHandler.handle(error, {
    context: { service: 'payment', municipality: '0301' },
  });

  // User sees: "Betalingen kunne ikke behandles. Prøv igjen senere."
  console.log(result.norwegianMessage);
}
```

## Testing

### User Story Tests

```bash
# Run error handler specific tests
pnpm test error-handler

# Run Norwegian localization tests
pnpm test --testNamePattern="Norwegian error messages"
```

## Related Documentation

- [Logger](../logger/README.md)
- [Norwegian Compliance](../../compliance/norwegian-compliance.md)
