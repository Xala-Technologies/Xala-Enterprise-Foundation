# logger

Provides structured logging with Norwegian government compliance and audit trail capabilities.

## Features

- **Structured logging** - JSON-formatted logs with metadata
- **Audit logging** - Compliance-aware audit trails for government applications
- **NSM classification** - Security classification support (ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG)
- **GDPR compliance** - Personal data handling and legal basis tracking
- **Error handling** - Detailed error logging with stack traces

## Usage

### Basic Logging

```typescript
import { getLogger, createLogger } from '@xala-technologies/foundation/logger';

const logger = getLogger();

logger.info('User logged in', { userId: '123', ip: '192.168.1.1' });
logger.error('Database connection failed', new Error('Connection timeout'));
logger.debug('Processing request', { requestId: 'req_123' });
```

### Audit Logging

```typescript
import { auditLog, createGDPRAuditLog } from '@xala-technologies/foundation/logger';

// Standard audit log
auditLog({
  userId: 'user_123',
  action: 'data_access',
  entityType: 'citizen_record',
  entityId: 'citizen_456',
  timestamp: new Date(),
  nsmClassification: 'BEGRENSET',
  gdprBasis: 'public_task',
  personalDataIncluded: true,
});

// GDPR-specific audit log
createGDPRAuditLog('data_processing', 'personal_data', {
  userId: 'user_123',
  entityId: 'data_456',
  gdprBasis: 'consent',
  personalDataIncluded: true,
});
```

### Norwegian Compliance Logging

```typescript
import { createNSMClassifiedLog } from '@xala-technologies/foundation/logger';

// NSM classified logging
createNSMClassifiedLog('KONFIDENSIELT', 'Sensitive operation performed', {
  operation: 'security_analysis',
  department: 'IT',
});
```

## Configuration

```typescript
const logger = createLogger({
  level: 'info',
  auditEnabled: true,
  complianceEnabled: true,
});
```

## Norwegian Compliance Features

- **NSM Security Classifications** - Automatic classification tagging
- **GDPR Audit Trails** - Legal basis and personal data tracking
- **Retention Policies** - Configurable log retention for compliance
- **Data Protection** - Personal data anonymization in logs
