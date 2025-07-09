# Logger Module

The Logger module provides structured logging with NSM security classification, GDPR compliance, and Norwegian government audit trail requirements.

## Overview

This module enables secure, compliant logging for Norwegian government applications with built-in support for NSM security classifications, GDPR audit trails, and DigDir compliance standards.

## Key Features

- **NSM Security Classifications**: Automatic classification of log entries (ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG)
- **GDPR Compliance**: Personal data processing logs with legal basis tracking
- **Structured Logging**: JSON-based logging with contextual metadata
- **Audit Trails**: Comprehensive audit logging for government compliance
- **Performance Monitoring**: Application performance metrics integration

## Basic Usage

### Simple Logging

```typescript
import { createLogger } from '@xala-technologies/foundation';

const logger = createLogger('municipal-app');

// Standard logging levels
logger.info('Application started', { version: '2.0.0', municipality: '0301' });
logger.warn('High memory usage detected', { usage: '85%' });
logger.error('Database connection failed', { error: 'CONNECTION_TIMEOUT' });
```

### NSM Classified Logging

```typescript
import { createNSMClassifiedLog, createLogger } from '@xala-technologies/foundation';

const logger = createLogger('security-app');

// Create classified log entries
await createNSMClassifiedLog('KONFIDENSIELT', 'Citizen data accessed', {
  citizenId: 'NO-12345678901',
  accessedBy: 'officer_123',
  municipality: '0301',
  operation: 'READ',
});

// HEMMELIG classification for sensitive operations
await createNSMClassifiedLog('HEMMELIG', 'Security clearance verification', {
  officerId: 'sec_456',
  clearanceLevel: 'HEMMELIG',
  verificationResult: 'APPROVED',
});
```

### GDPR Audit Logging

```typescript
import { createGDPRAuditLog } from '@xala-technologies/foundation';

// Log personal data processing
await createGDPRAuditLog('Personal data processed for municipal service', {
  dataSubject: 'NO-12345678901',
  legalBasis: 'public_task',
  processingPurpose: 'municipal_service_delivery',
  dataCategories: ['identity', 'contact', 'address'],
  municipality: '0301',
  retentionPeriod: '7-years',
});

// Log consent changes
await createGDPRAuditLog('Consent withdrawn for data processing', {
  dataSubject: 'NO-98765432109',
  consentType: 'marketing_communications',
  action: 'WITHDRAWN',
  timestamp: new Date(),
});
```

## Configuration

### Environment Variables

```bash
# Log level configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Norwegian compliance settings
NSM_CLASSIFICATION_REQUIRED=true
GDPR_AUDIT_ENABLED=true
AUDIT_RETENTION_DAYS=2555  # 7 years

# Storage configuration
LOG_STORAGE=file
LOG_FILE_PATH=/var/log/foundation/app.log
LOG_ROTATION_SIZE=100MB
LOG_ROTATION_FILES=10
```

### Logger Configuration

```typescript
import { createLogger, LoggerConfig } from '@xala-technologies/foundation';

const config: LoggerConfig = {
  level: 'info',
  format: 'json',
  transports: ['console', 'file'],
  norwegian: {
    nsmClassification: true,
    gdprCompliance: true,
    auditTrail: true,
  },
  metadata: {
    municipality: '0301',
    application: 'citizen-portal',
    version: '2.0.0',
  },
};

const logger = createLogger('app', config);
```

## API Reference

### Core Functions

#### `createLogger(name, config?)`

Creates a new logger instance with optional configuration.

#### `createNSMClassifiedLog(classification, message, metadata)`

Creates a classified log entry with NSM security level.

#### `createGDPRAuditLog(message, gdprMetadata)`

Creates a GDPR-compliant audit log entry.

#### `getLoggerMetrics()`

Retrieves logging performance and usage metrics.

### Logger Class Methods

#### Standard Logging Methods

- `logger.debug(message, metadata?)` - Debug level logging
- `logger.info(message, metadata?)` - Info level logging
- `logger.warn(message, metadata?)` - Warning level logging
- `logger.error(message, metadata?)` - Error level logging
- `logger.fatal(message, metadata?)` - Fatal error logging

#### Norwegian Compliance Methods

- `logger.nsmLog(classification, message, metadata)` - NSM classified logging
- `logger.gdprAudit(message, gdprData)` - GDPR audit logging
- `logger.complianceLog(type, message, metadata)` - General compliance logging

## Norwegian Government Examples

### Oslo Kommune Citizen Services

```typescript
const osloLogger = createLogger('oslo-citizen-services', {
  metadata: { municipality: '0301', department: 'citizen_services' },
});

// Log citizen registration
await osloLogger.nsmLog('BEGRENSET', 'New citizen registered', {
  citizenId: 'NO-12345678901',
  registrationDate: new Date(),
  serviceType: 'digital_identity',
});

// GDPR compliance logging
await osloLogger.gdprAudit('Personal data collected for citizen registration', {
  legalBasis: 'public_task',
  dataCategories: ['identity', 'contact'],
  retentionPeriod: '7-years',
});
```

### Security Operations Center

```typescript
const secLogger = createLogger('security-operations', {
  level: 'debug',
  norwegian: { nsmClassification: true, auditTrail: true },
});

// Security incident logging
await secLogger.nsmLog('HEMMELIG', 'Security incident detected', {
  incidentId: 'SEC-2024-001',
  severity: 'HIGH',
  affectedSystems: ['citizen-portal', 'payment-gateway'],
  responseTeam: 'CERT-Norge',
});
```

## Performance and Monitoring

### Metrics Integration

```typescript
import { getLoggerMetrics, createLogger } from '@xala-technologies/foundation';

const logger = createLogger('app');

// Log with performance metrics
logger.info('Database query completed', {
  query: 'SELECT_CITIZENS',
  duration: 150,
  municipality: '0301',
});

// Get logging statistics
const metrics = getLoggerMetrics();
console.log(metrics.logEntriesPerSecond);
console.log(metrics.classifiedLogsCount);
console.log(metrics.gdprAuditCount);
```

### Log Rotation and Archive

```typescript
import { configureLogRotation } from '@xala-technologies/foundation';

configureLogRotation({
  maxFileSize: '100MB',
  maxFiles: 10,
  archiveCompression: true,
  retentionPeriod: '7-years', // Norwegian government requirement
  archiveLocation: '/archive/logs/foundation',
});
```

## Security and Compliance

### Access Control

```typescript
// Restrict access to classified logs
const secureLogger = createLogger('classified-ops', {
  security: {
    requireClearance: 'KONFIDENSIELT',
    auditAccess: true,
    encryptLogs: true,
  },
});
```

### Audit Trail Verification

```typescript
import { verifyAuditTrail, getAuditSummary } from '@xala-technologies/foundation';

// Verify audit trail integrity
const isValid = await verifyAuditTrail('2024-01-01', '2024-12-31');

// Generate compliance report
const auditSummary = await getAuditSummary({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  municipality: '0301',
  includeClassified: false,
});
```

## Testing

### User Story Tests

```bash
# Run logger specific tests
pnpm test logger

# Run NSM classification tests
pnpm test --testNamePattern="NSM classification"

# Run GDPR compliance tests
pnpm test --testNamePattern="GDPR audit"
```

## Troubleshooting

### Common Issues

**Logs not appearing:**

- Check LOG_LEVEL environment variable
- Verify file permissions for log directory
- Ensure transport configuration is correct

**Classification errors:**

- Validate NSM security clearance
- Check metadata completeness
- Verify audit trail configuration

**Performance issues:**

- Enable log rotation
- Consider async logging
- Monitor log file sizes
- Archive old logs regularly

## Best Practices

1. **Always classify sensitive logs** with appropriate NSM levels
2. **Include context metadata** for better debugging
3. **Use structured logging** with consistent field names
4. **Enable audit trails** for compliance requirements
5. **Monitor log performance** and storage usage
6. **Implement log rotation** to prevent disk space issues
7. **Test logging configuration** in development environment

## Related Documentation

- [Configuration Management](../config-loader/README.md)
- [Error Handling](../error-handler/README.md)
- [Metrics SDK](../metrics-sdk/README.md)
- [Norwegian Compliance Guide](../../compliance/norwegian-compliance.md)
