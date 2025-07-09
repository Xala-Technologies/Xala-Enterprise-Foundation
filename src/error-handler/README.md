# error-handler

Centralized error handling with Norwegian compliance reporting and NSM security classifications.

## Features

- **Centralized error handling** - Unified error processing across all modules
- **Norwegian compliance** - NSM classified error reporting and GDPR considerations
- **Error categorization** - Business, technical, security, and compliance error types
- **Audit integration** - Automatic audit logging for compliance and security events
- **Recovery mechanisms** - Configurable error recovery and retry strategies
- **Security event handling** - Special handling for security-related errors

## Usage

### Basic Error Handling

```typescript
import {
  handleError,
  createBusinessError,
  createTechnicalError,
  createSecurityError,
} from '@xala-technologies/foundation/error-handler';

try {
  // Your application logic
  throw new Error('Database connection failed');
} catch (error) {
  // Handle with automatic classification and logging
  const result = await handleError(error, {
    context: 'user-authentication',
    userId: 'user_123',
    operation: 'login',
  });

  console.log('Error handled:', result.errorId);
}
```

### Creating Specific Error Types

```typescript
// Business logic errors
const businessError = createBusinessError(
  'INVALID_MUNICIPALITY_CODE',
  'The provided municipality code is not valid',
  { providedCode: '9999', validCodes: ['0301', '0318'] }
);

// Technical system errors
const technicalError = createTechnicalError(
  'DATABASE_CONNECTION_FAILED',
  'Unable to establish database connection',
  { host: 'db.example.com', timeout: 5000 }
);

// Security-related errors
const securityError = createSecurityError(
  'UNAUTHORIZED_ACCESS_ATTEMPT',
  'User attempted to access classified data without proper clearance',
  {
    userId: 'user_123',
    resourceId: 'classified_doc_456',
    nsmClassification: 'KONFIDENSIELT',
  }
);
```

### Norwegian Compliance Error Handling

```typescript
import {
  handleNSMClassifiedError,
  handleGDPRError,
} from '@xala-technologies/foundation/error-handler';

// Handle NSM classified errors
await handleNSMClassifiedError(error, {
  classification: 'KONFIDENSIELT',
  department: 'IT-sikkerhet',
  incidentLevel: 'high',
});

// Handle GDPR compliance errors
await handleGDPRError(error, {
  personalDataInvolved: true,
  dataSubjectId: 'citizen_123',
  lawfulBasis: 'public_task',
  retentionPeriod: '7_years',
});
```

## Error Categories

### Business Errors

- **Validation failures** - Invalid input data or business rule violations
- **Process errors** - Workflow and business process failures
- **Integration errors** - Third-party service or API failures

### Technical Errors

- **System errors** - Infrastructure, database, or service failures
- **Performance errors** - Timeout, resource exhaustion, or capacity issues
- **Configuration errors** - Missing or invalid configuration

### Security Errors

- **Authentication failures** - Login or identity verification failures
- **Authorization violations** - Access control and permission errors
- **Data security incidents** - Potential data breaches or security violations

### Compliance Errors

- **GDPR violations** - Personal data handling or consent issues
- **NSM policy breaches** - Security classification or handling violations
- **Audit failures** - Logging or compliance reporting failures

## Norwegian Compliance Features

- **NSM Security Classifications** - Automatic classification of security incidents
- **GDPR Compliance** - Special handling for personal data errors
- **DigDir Standards** - Error reporting following Norwegian government standards
- **Audit Integration** - Automatic compliance audit logging
- **Municipal Context** - Norwegian municipality-aware error handling

## Configuration

```typescript
const errorHandler = createErrorHandler({
  enableNorwegianCompliance: true,
  defaultNSMClassification: 'BEGRENSET',
  auditingEnabled: true,
  retryStrategies: {
    technical: { maxRetries: 3, backoffMs: 1000 },
    business: { maxRetries: 1, backoffMs: 0 },
  },
});
```

## Integration with Other Modules

- **Logger Module** - Automatic error logging with appropriate levels
- **Audit Module** - Compliance audit trails for all error events
- **Metrics Module** - Error rate and categorization metrics
- **Feature Toggle** - Error handling behavior controlled by feature flags
