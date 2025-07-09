# Feature Toggle Module

The Feature Toggle module provides comprehensive feature flag management with Norwegian municipal targeting, NSM security classification, and GDPR-compliant audit logging.

## Overview

This module enables controlled feature rollouts across Norwegian municipalities with built-in compliance controls, security classifications, and detailed audit trails. It supports gradual deployment, A/B testing, and emergency feature controls for government applications.

## Key Features

- **Municipal Targeting**: Target features by Norwegian municipality codes (Oslo: 0301, Bergen: 4601, etc.)
- **NSM Security Classifications**: Features classified as ÅPEN, BEGRENSET, KONFIDENSIELT, or HEMMELIG
- **GDPR Compliance**: Full audit trails with consent tracking and data retention policies
- **Role-Based Access**: Integration with Norwegian government role hierarchies
- **Emergency Controls**: Instant feature disable capabilities for security incidents

## Basic Usage

### Simple Feature Check

```typescript
import { isFeatureEnabled } from '@xala-technologies/foundation';

// Basic feature check for Oslo municipality
const isEnabled = await isFeatureEnabled('new_citizen_portal', {
  municipality: '0301', // Oslo Kommune
  userRole: 'municipal_employee',
});

if (isEnabled) {
  // Show new citizen portal interface
}
```

### Advanced Targeting

```typescript
import { FeatureToggleManager } from '@xala-technologies/foundation';

const featureManager = new FeatureToggleManager();

// Register feature with complex targeting
await featureManager.registerFlag('enhanced_payment_system', {
  name: 'Enhanced Payment System',
  enabled: true,
  nsmClassification: 'BEGRENSET',
  targeting: {
    municipalities: ['0301', '4601'], // Oslo and Bergen
    userRoles: ['municipal_employee', 'finance_officer'],
    rolloutPercentage: 25, // Gradual rollout to 25%
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31'),
    },
  },
});
```

## Norwegian Municipal Integration

### Municipality Codes Support

The module includes built-in support for Norwegian municipality codes:

```typescript
import { isFeatureEnabled, getMunicipalityInfo } from '@xala-technologies/foundation';

// Oslo Kommune (0301)
const osloFeature = await isFeatureEnabled('oslo_specific_feature', {
  municipality: '0301',
});

// Bergen Kommune (4601)
const bergenFeature = await isFeatureEnabled('nynorsk_interface', {
  municipality: '4601',
  language: 'nn', // Norwegian Nynorsk
});

// Trondheim Kommune (5001)
const trondheimFeature = await isFeatureEnabled('regional_service', {
  municipality: '5001',
});

// Get municipality information
const municipalityInfo = getMunicipalityInfo('0301');
console.log(municipalityInfo.name); // "Oslo"
console.log(municipalityInfo.region); // "Østlandet"
```

## Security and Compliance

### NSM Security Classifications

```typescript
import { FeatureToggleManager } from '@xala-technologies/foundation';

const manager = new FeatureToggleManager();

// HEMMELIG feature for sensitive government operations
await manager.registerFlag('classified_document_access', {
  name: 'Classified Document Access',
  enabled: true,
  nsmClassification: 'HEMMELIG',
  targeting: {
    userRoles: ['security_officer', 'classification_authority'],
    requiresMultiFactorAuth: true,
    auditLevel: 'detailed',
  },
});

// Check with security validation
const hasAccess = await manager.isEnabled('classified_document_access', {
  userId: 'officer_123',
  userRole: 'security_officer',
  securityClearance: 'HEMMELIG',
  mfaVerified: true,
});
```

### GDPR Compliance

```typescript
import { FeatureToggleManager } from '@xala-technologies/foundation';

const manager = new FeatureToggleManager();

// Feature with personal data processing
await manager.registerFlag('citizen_analytics', {
  name: 'Citizen Behavior Analytics',
  enabled: true,
  nsmClassification: 'KONFIDENSIELT',
  gdprCompliance: {
    legalBasis: 'public_task',
    dataCategories: ['behavioral', 'statistical'],
    retentionPeriod: '2-years',
    requiresConsent: false, // Public task basis
    dataMinimization: true,
  },
});
```

## Emergency Controls

### Instant Feature Disable

```typescript
import { FeatureToggleManager } from '@xala-technologies/foundation';

const manager = new FeatureToggleManager();

// Emergency disable for security incident
await manager.emergencyDisable('payment_processing', {
  reason: 'Security vulnerability detected',
  severity: 'CRITICAL',
  disabledBy: 'security_officer_456',
  notifyStakeholders: true,
});

// Re-enable after fix
await manager.emergencyEnable('payment_processing', {
  reason: 'Security patch applied',
  approvedBy: 'chief_security_officer',
  verificationRequired: true,
});
```

## API Reference

### Core Functions

#### `isFeatureEnabled(flagKey, context)`

Checks if a feature is enabled for the given context.

**Parameters:**

- `flagKey: string` - Feature flag identifier
- `context: TargetingContext` - User and municipality context

**Returns:** `Promise<boolean>`

#### `getFeatureValue(flagKey, property, context?)`

Gets a specific property value from a feature flag.

**Parameters:**

- `flagKey: string` - Feature flag identifier
- `property: string` - Property name to retrieve
- `context?: TargetingContext` - Optional targeting context

**Returns:** `Promise<any>`

### FeatureToggleManager Class

#### `registerFlag(flagKey, config)`

Registers a new feature flag with targeting and compliance settings.

#### `updateFlag(flagKey, updates)`

Updates an existing feature flag configuration.

#### `deleteFlag(flagKey)`

Removes a feature flag and its audit history.

#### `getAuditTrail(flagKey?)`

Retrieves detailed audit trail for feature flag operations.

#### `exportFlags(format?)`

Exports all feature flags in JSON or CSV format.

## Configuration

### Environment Variables

```bash
# Feature toggle storage backend
FEATURE_TOGGLE_STORAGE=redis
FEATURE_TOGGLE_REDIS_URL=redis://localhost:6379

# NSM security integration
NSM_CLASSIFICATION_ENDPOINT=https://nsm.regjeringen.no/api/classifications
NSM_AUDIT_ENDPOINT=https://nsm.regjeringen.no/api/audit

# GDPR compliance settings
GDPR_AUDIT_RETENTION_DAYS=2555  # 7 years
GDPR_CONSENT_ENDPOINT=https://consent.difi.no/api

# Municipality data source
MUNICIPALITY_DATA_SOURCE=kartverket
MUNICIPALITY_API_KEY=your_kartverket_api_key
```

### Default Configuration

```typescript
const defaultConfig = {
  storage: {
    type: 'memory',
    persistence: true,
    auditRetention: '7-years',
  },
  security: {
    nsmIntegration: true,
    auditLevel: 'standard',
    encryptionRequired: false,
  },
  compliance: {
    gdprEnabled: true,
    auditTrail: true,
    consentTracking: true,
  },
  municipalities: {
    validateCodes: true,
    loadMunicipalityData: true,
    cacheExpiry: '24-hours',
  },
};
```

## Testing

### User Story Tests

The module includes comprehensive tests for Norwegian government scenarios:

```bash
# Run feature toggle specific tests
pnpm test feature-toggle

# Run compliance tests
pnpm test --testNamePattern="Norwegian compliance"

# Run municipality targeting tests
pnpm test --testNamePattern="municipality"
```

### Test Coverage

- ✅ **Municipal targeting scenarios** (Oslo, Bergen, Trondheim)
- ✅ **NSM security classification** handling
- ✅ **GDPR compliance** with audit trails
- ✅ **Emergency disable/enable** workflows
- ✅ **Role-based access** controls
- ✅ **Gradual rollout** percentages
- ✅ **A/B testing** capabilities

## Norwegian Government Examples

### Oslo Kommune Digital Services

```typescript
// Feature for Oslo's new digital identity system
await featureManager.registerFlag('oslo_digital_identity', {
  name: 'Oslo Digital Identity System',
  enabled: true,
  nsmClassification: 'BEGRENSET',
  targeting: {
    municipalities: ['0301'],
    userRoles: ['citizen', 'municipal_employee'],
    rolloutPercentage: 50,
  },
  gdprCompliance: {
    legalBasis: 'public_task',
    dataCategories: ['identity', 'authentication'],
    requiresConsent: false,
  },
});
```

### Bergen Kommune Nynorsk Support

```typescript
// Feature for Bergen's Nynorsk interface requirement
await featureManager.registerFlag('nynorsk_interface', {
  name: 'Norwegian Nynorsk Interface',
  enabled: true,
  nsmClassification: 'ÅPEN',
  targeting: {
    municipalities: ['4601'], // Bergen
    languages: ['nn'], // Norwegian Nynorsk
    culturalCompliance: 'bergen_kommune_standards',
  },
});
```

## Troubleshooting

### Common Issues

**Feature not enabled despite configuration:**

- Verify municipality code format (4-digit string)
- Check user role permissions
- Validate NSM security clearance
- Review audit logs for access attempts

**GDPR compliance warnings:**

- Ensure legal basis is specified
- Verify consent tracking is enabled
- Check data retention policies
- Review cross-border transfer settings

**Performance issues:**

- Enable Redis caching for feature flags
- Optimize targeting rule complexity
- Consider feature flag archival
- Monitor audit log storage growth

### Debug Mode

```typescript
import { FeatureToggleManager } from '@xala-technologies/foundation';

const manager = new FeatureToggleManager({
  debug: true,
  verboseLogging: true,
  auditLevel: 'detailed',
});

// Detailed logging will show targeting evaluation steps
const result = await manager.isEnabled('complex_feature', context);
```

## Migration Guide

### Upgrading from 1.x

Feature toggle configurations from version 1.x require migration:

```typescript
// Version 1.x (deprecated)
const oldConfig = {
  enabled: true,
  targeting: ['oslo', 'bergen'],
};

// Version 2.x (current)
const newConfig = {
  enabled: true,
  nsmClassification: 'ÅPEN',
  targeting: {
    municipalities: ['0301', '4601'], // Proper codes
    userRoles: ['citizen'],
    rolloutPercentage: 100,
  },
  gdprCompliance: {
    legalBasis: 'public_task',
    auditTrail: true,
  },
};
```

## Best Practices

1. **Always specify NSM classification** for government features
2. **Use proper municipality codes** (4-digit format)
3. **Enable audit trails** for compliance requirements
4. **Test targeting rules** before production deployment
5. **Monitor feature usage** through metrics integration
6. **Plan rollback strategies** for emergency situations
7. **Document feature dependencies** and rollout schedules

## Related Documentation

- [Configuration Management](../config-loader/README.md)
- [Logging and Audit](../logger/README.md)
- [Error Handling](../error-handler/README.md)
- [Norwegian Compliance Guide](../../compliance/norwegian-compliance.md)
