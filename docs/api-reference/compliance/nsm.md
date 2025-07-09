# NSM Security Classification API Reference

Complete API documentation for Norwegian Security Authority (NSM) classification support in the Foundation package, providing government-grade security classifications and compliance controls.

## 📖 Overview

The NSM module implements the Norwegian Security Authority's security classification framework, providing:

- **Four-tier Classification System** - ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG
- **Automatic Classification** based on data content and context
- **Access Control** enforcement based on security clearances
- **Audit Logging** for all classification-related operations
- **Encryption Requirements** for classified data
- **Compliance Validation** for Norwegian government standards

## 🇳🇴 NSM Classification Levels

### ÅPEN (Open)

Information that can be shared publicly without restriction.

- **Examples**: Public announcements, general municipal information, open data
- **Encryption**: Not required
- **Access**: All users
- **Audit**: Basic logging

### BEGRENSET (Restricted)

Information with limited distribution that could cause minor harm if disclosed.

- **Examples**: Internal procedures, citizen contact information, administrative data
- **Encryption**: Recommended
- **Access**: Authorized personnel only
- **Audit**: Standard logging

### KONFIDENSIELT (Confidential)

Information that could cause significant harm if disclosed to unauthorized parties.

- **Examples**: Personal health data, financial information, sensitive municipal data
- **Encryption**: Required
- **Access**: Need-to-know basis
- **Audit**: Comprehensive logging

### HEMMELIG (Secret)

Information that could cause serious harm to national security or public safety.

- **Examples**: Security protocols, classified operations, sensitive government data
- **Encryption**: Advanced encryption required
- **Access**: High-level security clearance only
- **Audit**: Full audit trail with monitoring

## 🚀 Basic Usage

### Installation and Import

```typescript
import { FoundationNSM, NSMClassification, NSMConfig } from '@xala-technologies/foundation';
```

### Initialization

```typescript
const nsmConfig: NSMConfig = {
  enabled: true,
  defaultClassification: 'BEGRENSET',
  encryptionRequired: true,
  auditRequired: true,
  allowClassificationOverride: false,
  classifications: {
    ÅPEN: {
      encryptionRequired: false,
      auditLevel: 'basic',
      accessControl: 'public',
    },
    BEGRENSET: {
      encryptionRequired: true,
      auditLevel: 'standard',
      accessControl: 'authenticated',
    },
    KONFIDENSIELT: {
      encryptionRequired: true,
      auditLevel: 'comprehensive',
      accessControl: 'authorized',
    },
    HEMMELIG: {
      encryptionRequired: true,
      auditLevel: 'maximum',
      accessControl: 'classified',
    },
  },
};

const nsm = new FoundationNSM(nsmConfig);
```

## 📋 Core API Reference

### FoundationNSM Class

#### Constructor

```typescript
constructor(config: NSMConfig)
```

#### classifyData(data: any, context?: ClassificationContext): NSMClassification

Automatically classifies data based on content and context.

```typescript
// Automatic classification of personal data
const personalData = {
  name: 'Ola Nordmann',
  ssn: '12345678901',
  address: 'Oslo Gate 123, 0123 Oslo',
};

const classification = nsm.classifyData(personalData, {
  municipality: '0301',
  department: 'citizen_services',
  purpose: 'service_delivery',
});
// Returns: 'KONFIDENSIELT' due to personal identifiable information
```

#### validateAccess(classification: NSMClassification, user: UserContext): Promise\<boolean>

Validates if a user has access to data with the specified classification.

```typescript
const hasAccess = await nsm.validateAccess('KONFIDENSIELT', {
  userId: 'employee_123',
  securityClearance: 'KONFIDENSIELT',
  department: 'health_services',
  role: 'healthcare_provider',
});
```

#### enforceClassification(data: any, classification: NSMClassification): Promise\<ClassifiedData>

Applies NSM classification enforcement to data.

```typescript
const classifiedData = await nsm.enforceClassification(sensitiveData, 'KONFIDENSIELT');
// Returns encrypted data with classification metadata
```

#### auditClassificationAccess(auditEntry: ClassificationAuditEntry): Promise\<void>

Creates audit logs for classification-related access.

```typescript
await nsm.auditClassificationAccess({
  userId: 'doctor_001',
  operation: 'data_access',
  classification: 'KONFIDENSIELT',
  dataType: 'patient_record',
  purpose: 'medical_consultation',
  municipality: '0301',
  department: 'health_services',
});
```

### Data Classification Methods

#### classifyPersonalData(personalData: PersonalDataContext): NSMClassification

Classifies personal data according to sensitivity.

```typescript
const personalDataClassification = nsm.classifyPersonalData({
  dataTypes: ['personal_identification', 'health_data'],
  sensitivity: 'high',
  legalBasis: 'healthcare_provision',
  municipalContext: {
    code: '0301',
    department: 'health_services',
  },
});
// Returns: 'KONFIDENSIELT'
```

#### classifyMunicipalData(municipalData: MunicipalDataContext): NSMClassification

Classifies municipal service data.

```typescript
const municipalClassification = nsm.classifyMunicipalData({
  serviceType: 'education',
  dataTypes: ['student_records', 'family_information'],
  publicFacing: false,
  departmentLevel: 'internal',
  municipality: '4601',
});
// Returns: 'BEGRENSET'
```

#### classifyGovernmentData(governmentData: GovernmentDataContext): NSMClassification

Classifies government operational data.

```typescript
const governmentClassification = nsm.classifyGovernmentData({
  dataType: 'security_protocol',
  operationalLevel: 'national',
  publicSafety: true,
  nationalSecurity: false,
});
// Returns: 'HEMMELIG'
```

### Access Control Methods

#### createSecurityContext(user: UserProfile): SecurityContext

Creates a security context for NSM access control.

```typescript
const securityContext = nsm.createSecurityContext({
  userId: 'municipal_employee_456',
  department: 'social_services',
  role: 'case_worker',
  securityClearance: 'BEGRENSET',
  municipality: '0301',
  certifications: ['data_protection', 'municipal_services'],
});
```

#### validateSecurityClearance(clearance: NSMClassification, requiredLevel: NSMClassification): boolean

Validates if a security clearance meets requirements.

```typescript
const canAccess = nsm.validateSecurityClearance('KONFIDENSIELT', 'BEGRENSET');
// Returns: true (KONFIDENSIELT clearance can access BEGRENSET data)

const cannotAccess = nsm.validateSecurityClearance('BEGRENSET', 'KONFIDENSIELT');
// Returns: false (BEGRENSET clearance cannot access KONFIDENSIELT data)
```

#### enforceNeedToKnow(data: ClassifiedData, user: UserContext, purpose: string): Promise\<boolean>

Enforces need-to-know principle for classified data access.

```typescript
const needToKnow = await nsm.enforceNeedToKnow(
  classifiedPatientData,
  {
    userId: 'nurse_789',
    role: 'registered_nurse',
    department: 'emergency_care',
    currentAssignment: 'patient_12345',
  },
  'emergency_treatment'
);
```

## 🔐 Encryption and Security

### FoundationNSMEncryption

Handles encryption requirements for classified data.

```typescript
import { FoundationNSMEncryption } from '@xala-technologies/foundation';

const encryption = new FoundationNSMEncryption(nsmConfig);

// Encrypt based on classification level
const encryptedData = await encryption.encryptByClassification(data, 'KONFIDENSIELT');

// Decrypt with access validation
const decryptedData = await encryption.decryptWithValidation(encryptedData, {
  userId: 'authorized_user',
  clearance: 'KONFIDENSIELT',
});
```

#### Encryption Algorithms by Classification

```typescript
interface ClassificationEncryption {
  ÅPEN: null; // No encryption required
  BEGRENSET: 'AES-256-GCM'; // Standard encryption
  KONFIDENSIELT: 'AES-256-GCM' | 'ChaCha20-Poly1305'; // Strong encryption
  HEMMELIG: 'AES-256-GCM' | 'Post-Quantum-Safe'; // Maximum security
}
```

### Key Management

```typescript
// Generate classification-specific encryption keys
const keyPair = await encryption.generateClassificationKeys('KONFIDENSIELT', {
  keySize: 256,
  algorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  municipality: '0301',
});

// Rotate encryption keys
await encryption.rotateKeys('KONFIDENSIELT', {
  rotationPeriod: 'P90D', // Every 90 days
  preserveOldKeys: true,
  notifyUsers: true,
});
```

## 🇳🇴 Norwegian Municipal Examples

### Oslo Kommune Health Services

```typescript
// Health appointment data classification
const healthAppointment = {
  citizenId: 'citizen_12345',
  appointmentType: 'general_consultation',
  healthcareProvider: 'Oslo Legevakt',
  medicalNotes: 'Patient reports chest pain',
  prescriptions: ['medication_abc_123'],
};

const healthClassification = nsm.classifyData(healthAppointment, {
  municipality: '0301',
  department: 'helse_og_sosialetaten',
  dataType: 'health_service',
});
// Returns: 'KONFIDENSIELT'

// Enforce access control for health data
const healthAccess = await nsm.validateAccess('KONFIDENSIELT', {
  userId: 'doctor_001',
  securityClearance: 'KONFIDENSIELT',
  department: 'health_services',
  licenseNumber: 'MD-NOR-12345',
  patientAssignment: 'citizen_12345',
});
```

### Bergen Kommune Education Data

```typescript
// Student record classification
const studentRecord = {
  studentId: 'student_67890',
  grades: [{ subject: 'Mathematics', grade: 'A' }],
  behaviorNotes: 'Excellent participation',
  parentContact: 'parent@example.com',
};

const educationClassification = nsm.classifyMunicipalData({
  serviceType: 'education',
  dataTypes: ['academic_records', 'family_contact'],
  publicFacing: false,
  departmentLevel: 'internal',
  municipality: '4601',
});
// Returns: 'BEGRENSET'

// Teacher access to student records
const teacherAccess = await nsm.validateAccess('BEGRENSET', {
  userId: 'teacher_456',
  securityClearance: 'BEGRENSET',
  department: 'education',
  teacherLicense: 'TEACHER-NO-67890',
  classAssignment: 'class_5b_math',
});
```

### Multi-Municipality Security Operations

```typescript
// Security incident data
const securityIncident = {
  incidentType: 'data_breach_attempt',
  severity: 'high',
  affectedSystems: ['citizen_portal', 'health_records'],
  investigationNotes: 'Suspected external attack',
  mitigationActions: ['system_isolation', 'password_reset'],
};

const securityClassification = nsm.classifyGovernmentData({
  dataType: 'security_incident',
  operationalLevel: 'municipal',
  publicSafety: true,
  nationalSecurity: false,
  crossMunicipal: true,
});
// Returns: 'HEMMELIG'

// Security officer access
const securityAccess = await nsm.validateAccess('HEMMELIG', {
  userId: 'security_chief_001',
  securityClearance: 'HEMMELIG',
  department: 'information_security',
  certifications: ['cissp', 'norwegian_security_clearance'],
  emergencyResponse: true,
});
```

## 📊 Audit and Monitoring

### Classification Audit Trail

```typescript
// Comprehensive audit logging
await nsm.auditClassificationAccess({
  userId: 'municipal_employee_789',
  operation: 'data_classification_change',
  originalClassification: 'BEGRENSET',
  newClassification: 'KONFIDENSIELT',
  reason: 'data_sensitivity_review',
  approvedBy: 'data_protection_officer',
  municipality: '0301',
  department: 'citizen_services',
  dataIdentifier: 'citizen_profile_12345',
  timestamp: new Date(),
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
});
```

### Compliance Monitoring

```typescript
// Monitor classification compliance
const complianceReport = await nsm.generateComplianceReport({
  municipality: '0301',
  timeRange: {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-31T23:59:59Z',
  },
  departments: ['health_services', 'education', 'social_services'],
  includeViolations: true,
  includeAccessPatterns: true,
});

// Check for classification violations
const violations = await nsm.detectClassificationViolations({
  checkPeriod: 'P7D', // Last 7 days
  municipality: '0301',
  departments: ['all'],
  severityThreshold: 'medium',
});
```

## 🧪 Testing NSM Compliance

### Unit Testing

```typescript
import { FoundationNSM } from '@xala-technologies/foundation';
import { MockNSMProvider } from '@xala-technologies/foundation/testing';

describe('NSM Classification Tests', () => {
  let nsm: FoundationNSM;
  let mockProvider: MockNSMProvider;

  beforeEach(() => {
    mockProvider = new MockNSMProvider();
    nsm = new FoundationNSM(nsmConfig, { provider: mockProvider });
  });

  test('should classify personal data as KONFIDENSIELT', () => {
    const personalData = {
      ssn: '12345678901',
      name: 'Test Person',
      address: 'Test Address',
    };

    const classification = nsm.classifyData(personalData);
    expect(classification).toBe('KONFIDENSIELT');
  });

  test('should enforce access control based on clearance', async () => {
    const access = await nsm.validateAccess('KONFIDENSIELT', {
      userId: 'test_user',
      securityClearance: 'BEGRENSET',
    });

    expect(access).toBe(false);
  });

  test('should create audit trail for access attempts', async () => {
    await nsm.validateAccess('KONFIDENSIELT', {
      userId: 'test_user',
      securityClearance: 'KONFIDENSIELT',
    });

    expect(mockProvider.auditLogs).toContainEqual(
      expect.objectContaining({
        operation: 'access_validation',
        classification: 'KONFIDENSIELT',
        userId: 'test_user',
      })
    );
  });
});
```

### Integration Testing

```typescript
// Test classification in real scenarios
describe('NSM Integration Tests', () => {
  test('should handle Oslo health service classification', async () => {
    const healthData = {
      patientId: 'patient_123',
      diagnosis: 'hypertension',
      treatment: 'medication',
    };

    const classification = nsm.classifyData(healthData, {
      municipality: '0301',
      department: 'health_services',
    });

    expect(classification).toBe('KONFIDENSIELT');

    const access = await nsm.validateAccess(classification, {
      userId: 'doctor_123',
      securityClearance: 'KONFIDENSIELT',
      department: 'health_services',
    });

    expect(access).toBe(true);
  });
});
```

## 📞 Support and Resources

### Related Documentation

- [GDPR Compliance API](./gdpr.md)
- [DigDir Integration API](./digdir.md)
- [Foundation Logger API](../core/logger.md)

### Government Resources

- [NSM Security Classification Guide](https://nsm.no/regelverk/veiledninger/)
- [Norwegian Government Security Standards](https://www.regjeringen.no/no/tema/digitalisering/)

### Code Examples

- [Municipal NSM Implementation](../../examples/municipal/oslo-citizen-portal/)
- [Multi-Classification Service](../../examples/government/security-service/)

### Troubleshooting

- [NSM Compliance Issues](../../troubleshooting.md#nsm-compliance)
- [Classification Performance](../../performance/nsm-optimization.md)

---

**Version**: 2.0.0  
**Compliance**: NSM Security Framework v2024.1  
**Authority**: Norwegian Security Authority (NSM)  
**Last Updated**: January 2024
