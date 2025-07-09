# Foundation Logger API Reference

The Foundation Logger provides NSM-compliant logging with comprehensive audit trails, Norwegian government security classification support, and GDPR-compliant data handling.

## 📖 Overview

The FoundationLogger is designed specifically for Norwegian government and municipal applications, providing:

- **NSM Security Classification** support
- **GDPR-compliant** logging with data protection
- **Audit trails** for compliance monitoring
- **Multi-level logging** with structured output
- **Performance monitoring** integration
- **Real-time alerting** for critical events

## 🚀 Basic Usage

### Installation and Import

```typescript
import { FoundationLogger, FoundationConfig } from '@xala-technologies/foundation';
```

### Initialization

```typescript
const config: FoundationConfig = {
  name: 'my-municipal-app',
  platform: 'web',
  nsm: {
    enabled: true,
    defaultClassification: 'BEGRENSET',
  },
  gdpr: {
    enabled: true,
    consentRequired: true,
  },
};

const logger = new FoundationLogger(config);
```

## 📋 API Reference

### Constructor

```typescript
constructor(config: FoundationConfig, options?: LoggerOptions)
```

#### Parameters

- `config`: FoundationConfig - Core foundation configuration
- `options`: LoggerOptions (optional) - Logger-specific options

#### LoggerOptions Interface

```typescript
interface LoggerOptions {
  level?: LogLevel;
  format?: 'json' | 'text' | 'structured';
  enableConsole?: boolean;
  enableFile?: boolean;
  enableRemote?: boolean;
  filePath?: string;
  remoteEndpoint?: string;
  maxFileSize?: string;
  maxFiles?: number;
  auditLevel?: 'basic' | 'detailed' | 'comprehensive';
  redactPersonalData?: boolean;
  encryptLogs?: boolean;
}
```

### Basic Logging Methods

#### info(message: string, data?: LogData): Promise\<void>

Logs informational messages.

```typescript
await logger.info('User logged in successfully');
await logger.info('Database connection established', {
  connectionTime: '150ms',
  database: 'municipal_db',
});
```

#### warn(message: string, data?: LogData): Promise\<void>

Logs warning messages.

```typescript
await logger.warn('High memory usage detected', {
  memoryUsage: '85%',
  threshold: '80%',
});
```

#### error(message: string, error?: Error, context?: LogContext): Promise\<void>

Logs error messages with optional error object and context.

```typescript
try {
  // Some operation
} catch (error) {
  await logger.error('Database operation failed', error, {
    operation: 'citizen_data_update',
    userId: 'citizen_12345',
    nsmClassification: 'BEGRENSET',
  });
}
```

#### debug(message: string, data?: LogData): Promise\<void>

Logs debug information (only in development mode).

```typescript
await logger.debug('API request details', {
  endpoint: '/api/citizens/profile',
  method: 'GET',
  responseTime: '45ms',
});
```

### Advanced Logging Method

#### log(logEntry: LogEntry): Promise\<void>

Advanced logging with full NSM and GDPR compliance features.

```typescript
await logger.log({
  level: 'info',
  message: 'Personal data accessed',
  userId: 'citizen_12345',
  operation: 'profile_view',
  nsmClassification: 'KONFIDENSIELT',
  personalDataIncluded: true,
  gdprBasis: 'consent',
  component: 'citizen_portal',
  metadata: {
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    sessionId: 'sess_abc123',
  },
});
```

### Norwegian Compliance Methods

#### audit(auditEntry: AuditEntry): Promise\<void>

Creates audit log entries for compliance monitoring.

```typescript
await logger.audit({
  action: 'data_export',
  userId: 'citizen_12345',
  entityType: 'personal_data',
  entityId: 'profile_citizen_12345',
  nsmClassification: 'KONFIDENSIELT',
  personalDataIncluded: true,
  legalBasis: 'GDPR Article 20 - Data Portability',
  dataCategories: ['personal_identification', 'contact_information'],
  purpose: 'citizen_data_export_request',
  retentionPeriod: 'P7Y',
});
```

#### logSecurityEvent(securityEvent: SecurityEvent): Promise\<void>

Logs security-related events with enhanced monitoring.

```typescript
await logger.logSecurityEvent({
  eventType: 'unauthorized_access_attempt',
  severity: 'high',
  userId: 'unknown',
  ipAddress: '203.0.113.42',
  userAgent: 'curl/7.68.0',
  resource: '/api/classified/documents',
  nsmClassification: 'HEMMELIG',
  blocked: true,
  reason: 'insufficient_security_clearance',
});
```

#### logDataProcessing(processingEvent: DataProcessingEvent): Promise\<void>

Logs GDPR data processing activities.

```typescript
await logger.logDataProcessing({
  processingType: 'collection',
  dataSubject: 'citizen_12345',
  dataCategories: ['personal_identification', 'health_data'],
  legalBasis: 'consent',
  purpose: 'healthcare_service_delivery',
  processor: 'oslo_health_department',
  retentionPeriod: 'P10Y',
  thirdPartySharing: false,
  automaticDecisionMaking: false,
});
```

### Municipal Service Methods

#### logMunicipalService(serviceEvent: MunicipalServiceEvent): Promise\<void>

Logs municipal service interactions with Norwegian compliance.

```typescript
await logger.logMunicipalService({
  serviceType: 'health_appointment_booking',
  citizenId: 'citizen_12345',
  municipalityCode: '0301', // Oslo
  department: 'health_services',
  serviceOutcome: 'appointment_booked',
  appointmentDate: '2024-02-15T10:00:00Z',
  healthcareProvider: 'oslo_health_center_1',
  nsmClassification: 'KONFIDENSIELT',
});
```

## 🔧 Configuration Options

### Log Levels

```typescript
type LogLevel = 'error' | 'warn' | 'info' | 'debug';
```

### NSM Classifications

```typescript
type NSMClassification = 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
```

### GDPR Legal Basis

```typescript
type GDPRLegalBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests';
```

## 📊 Data Structures

### LogEntry Interface

```typescript
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
  operation?: string;
  component?: string;
  nsmClassification?: NSMClassification;
  personalDataIncluded?: boolean;
  gdprBasis?: GDPRLegalBasis;
  metadata?: Record<string, any>;
  correlationId?: string;
}
```

### AuditEntry Interface

```typescript
interface AuditEntry {
  action: string;
  userId: string;
  entityType: string;
  entityId: string;
  nsmClassification: NSMClassification;
  personalDataIncluded: boolean;
  legalBasis: string;
  dataCategories: string[];
  purpose: string;
  retentionPeriod: string;
  thirdPartySharing?: boolean;
  automaticDecisionMaking?: boolean;
  processingLocation?: string;
  dataController?: string;
  dataProcessor?: string;
}
```

### SecurityEvent Interface

```typescript
interface SecurityEvent {
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  resource: string;
  nsmClassification: NSMClassification;
  blocked: boolean;
  reason: string;
  detectionMethod?: string;
  mitigationAction?: string;
}
```

## 🇳🇴 Norwegian Municipal Examples

### Oslo Kommune Health Services

```typescript
// Health appointment booking
await logger.logMunicipalService({
  serviceType: 'health_appointment_booking',
  citizenId: 'citizen_12345',
  municipalityCode: '0301',
  department: 'helse_og_sosialetaten',
  serviceOutcome: 'appointment_confirmed',
  appointmentDetails: {
    date: '2024-02-15T14:30:00Z',
    provider: 'Oslo Legevakt',
    type: 'general_consultation',
  },
  nsmClassification: 'KONFIDENSIELT',
});

// Health record access
await logger.audit({
  action: 'health_record_access',
  userId: 'doctor_001',
  entityType: 'health_record',
  entityId: 'health_record_citizen_12345',
  nsmClassification: 'KONFIDENSIELT',
  personalDataIncluded: true,
  legalBasis: 'Healthcare Act - Patient Treatment',
  dataCategories: ['health_data', 'medical_history'],
  purpose: 'medical_consultation',
  retentionPeriod: 'P10Y',
});
```

### Bergen Kommune Education Services

```typescript
// School enrollment
await logger.logMunicipalService({
  serviceType: 'school_enrollment',
  citizenId: 'parent_67890',
  municipalityCode: '4601',
  department: 'utdanningsetaten',
  serviceOutcome: 'enrollment_submitted',
  studentDetails: {
    studentId: 'student_54321',
    schoolPreference: 'Bergen Elementary School',
    grade: '1st_grade',
  },
  nsmClassification: 'BEGRENSET',
});

// Grade record access
await logger.audit({
  action: 'student_grade_access',
  userId: 'parent_67890',
  entityType: 'educational_record',
  entityId: 'grades_student_54321',
  nsmClassification: 'BEGRENSET',
  personalDataIncluded: true,
  legalBasis: 'Education Act - Parental Rights',
  dataCategories: ['educational_data', 'assessment_results'],
  purpose: 'parental_monitoring',
  retentionPeriod: 'P5Y',
});
```

## 🔐 Security and Compliance Features

### Automatic Data Classification

The logger automatically applies NSM classification based on content:

```typescript
// Automatic classification based on data sensitivity
await logger.log({
  level: 'info',
  message: 'Citizen profile updated',
  userId: 'citizen_12345',
  operation: 'profile_update',
  // Classification automatically set to BEGRENSET due to personal data
  personalDataIncluded: true,
});
```

### GDPR Data Protection

```typescript
// Automatic GDPR compliance checks
await logger.logDataProcessing({
  processingType: 'automated_decision',
  dataSubject: 'citizen_12345',
  dataCategories: ['financial_data', 'behavioral_data'],
  legalBasis: 'legitimate_interests',
  purpose: 'fraud_detection',
  automaticDecisionMaking: true,
  // Automatically triggers GDPR Article 22 compliance checks
});
```

### Encryption and Storage

```typescript
// Configure encrypted logging for sensitive data
const secureLogger = new FoundationLogger(config, {
  encryptLogs: true,
  auditLevel: 'comprehensive',
  redactPersonalData: true, // Automatically redact PII in logs
  enableRemote: true,
  remoteEndpoint: 'https://secure-logs.oslo.kommune.no/api/logs',
});
```

## 📈 Performance and Monitoring

### Performance Tracking

```typescript
// Track operation performance with logging
const startTime = Date.now();
try {
  // Perform operation
  const result = await expensiveOperation();

  await logger.info('Operation completed successfully', {
    operation: 'citizen_data_export',
    duration: Date.now() - startTime,
    recordCount: result.recordCount,
    fileSize: result.fileSize,
  });
} catch (error) {
  await logger.error('Operation failed', error, {
    operation: 'citizen_data_export',
    duration: Date.now() - startTime,
  });
}
```

### Real-time Alerting

```typescript
// Configure alerts for critical events
await logger.logSecurityEvent({
  eventType: 'data_breach_detected',
  severity: 'critical',
  resource: 'citizen_database',
  nsmClassification: 'KONFIDENSIELT',
  blocked: true,
  reason: 'anomalous_access_pattern',
  // Automatically triggers real-time alert to security team
});
```

## 🧪 Testing and Validation

### Logger Testing

```typescript
import { FoundationLogger } from '@xala-technologies/foundation';
import { MockLoggerTransport } from '@xala-technologies/foundation/testing';

describe('Foundation Logger', () => {
  let logger: FoundationLogger;
  let mockTransport: MockLoggerTransport;

  beforeEach(() => {
    mockTransport = new MockLoggerTransport();
    logger = new FoundationLogger(config, {
      transports: [mockTransport],
    });
  });

  test('should log with NSM classification', async () => {
    await logger.log({
      level: 'info',
      message: 'Test log',
      nsmClassification: 'BEGRENSET',
    });

    expect(mockTransport.logs).toContainEqual(
      expect.objectContaining({
        nsmClassification: 'BEGRENSET',
        compliance: expect.objectContaining({
          nsmCompliant: true,
        }),
      })
    );
  });

  test('should enforce GDPR compliance', async () => {
    await logger.logDataProcessing({
      processingType: 'collection',
      dataSubject: 'test_user',
      dataCategories: ['personal_identification'],
      legalBasis: 'consent',
      purpose: 'service_delivery',
    });

    expect(mockTransport.logs).toContainEqual(
      expect.objectContaining({
        gdprCompliant: true,
        legalBasisValidated: true,
      })
    );
  });
});
```

## 🚨 Error Handling

### Logger Error Recovery

```typescript
try {
  await logger.log({
    level: 'info',
    message: 'Critical system operation',
    nsmClassification: 'HEMMELIG',
  });
} catch (logError) {
  // Logger errors are handled gracefully
  console.error('Logging failed:', logError);

  // Fallback to local logging
  await logger.logToFallback({
    originalLog: logEntry,
    error: logError,
    fallbackMethod: 'local_file',
  });
}
```

## 📞 Support and Resources

### Related Documentation

- [Error Handler API](./error-handler.md)
- [Metrics SDK API](./metrics-sdk.md)
- [Norwegian Compliance Guide](../compliance/norwegian-compliance.md)

### Code Examples

- [Oslo Kommune Logger Example](../../examples/municipal/oslo-citizen-portal/)
- [API Service Logger Example](../../examples/platforms/api-services/)

### Troubleshooting

- [Logger Troubleshooting Guide](../../troubleshooting.md#logger)
- [Performance Optimization](../../performance/logger-optimization.md)

---

**Version**: 2.0.0  
**Compatibility**: Node.js 18+, TypeScript 4.9+  
**Compliance**: NSM Security Framework, GDPR, Norwegian Data Protection Law
