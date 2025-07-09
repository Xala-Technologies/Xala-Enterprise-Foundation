# Foundation Feature Toggle API Reference

The Foundation Feature Toggle module provides Norwegian municipal-focused feature flag management with NSM compliance, GDPR considerations, and municipal service targeting capabilities.

## 📖 Overview

The FoundationFeatureToggle is specifically designed for Norwegian government and municipal applications, providing:

- **Municipal Targeting** - Target features by Norwegian municipality codes
- **NSM Security Classification** for feature access control
- **GDPR-compliant** feature flag data handling
- **User Group Targeting** - Citizens, employees, administrators
- **A/B Testing** support with compliance controls
- **Audit Logging** for all feature flag operations

## 🚀 Basic Usage

### Installation and Import

```typescript
import { FoundationFeatureToggle, FoundationConfig } from '@xala-technologies/foundation';
```

### Initialization

```typescript
const config: FoundationConfig = {
  name: 'oslo-municipal-services',
  platform: 'web',
  municipality: {
    code: '0301',
    name: 'Oslo',
  },
  nsm: {
    enabled: true,
    defaultClassification: 'ÅPEN',
  },
};

const featureToggle = new FoundationFeatureToggle(config);
```

## 📋 API Reference

### Constructor

```typescript
constructor(config: FoundationConfig, options?: FeatureToggleOptions)
```

#### Parameters

- `config`: FoundationConfig - Core foundation configuration
- `options`: FeatureToggleOptions (optional) - Feature toggle specific options

#### FeatureToggleOptions Interface

```typescript
interface FeatureToggleOptions {
  enableAuditLogging?: boolean;
  enableAnalytics?: boolean;
  cacheTTL?: number;
  remoteConfigUrl?: string;
  fallbackEnabled?: boolean;
  encryptFeatureData?: boolean;
}
```

### Core Methods

#### register(flagKey: string, flag: FeatureFlag): Promise\<void>

Registers a new feature flag with Norwegian compliance metadata.

```typescript
await featureToggle.register('new_citizen_portal', {
  name: 'New Citizen Portal Interface',
  description: 'Updated citizen services portal with improved accessibility',
  enabled: true,
  nsmClassification: 'ÅPEN',
  targetAudience: {
    municipalities: ['0301', '4601'], // Oslo, Bergen
    userGroups: ['citizens'],
    demographics: {
      ageRange: { min: 18, max: 100 },
      languages: ['nb-NO', 'nn-NO'],
    },
  },
  rolloutStrategy: {
    type: 'gradual',
    percentage: 25,
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-03-01T00:00:00Z',
  },
  gdprConsiderations: {
    affectsPersonalData: false,
    requiresConsent: false,
    dataCategories: [],
  },
});
```

#### isEnabled(flagKey: string, context?: EvaluationContext): Promise\<boolean>

Evaluates if a feature flag is enabled for the given context.

```typescript
const isEnabled = await featureToggle.isEnabled('new_citizen_portal', {
  userId: 'citizen_12345',
  municipality: '0301',
  userGroup: 'citizens',
  securityClearance: 'BEGRENSET',
  language: 'nb-NO',
});

if (isEnabled) {
  // Show new citizen portal interface
}
```

#### getFeatureValue<T>(flagKey: string, context?: EvaluationContext): Promise\<T | null>

Retrieves feature flag value with type safety.

```typescript
// Feature flag with configuration values
await featureToggle.register('payment_gateway_config', {
  name: 'Payment Gateway Configuration',
  enabled: true,
  nsmClassification: 'BEGRENSET',
  value: {
    provider: 'vipps',
    maxAmount: 50000,
    supportedMethods: ['vipps', 'bank_transfer', 'invoice'],
  },
});

// Retrieve typed configuration
const paymentConfig = await featureToggle.getFeatureValue<PaymentConfig>('payment_gateway_config', {
  municipality: '0301',
});

if (paymentConfig) {
  const { provider, maxAmount } = paymentConfig;
  // Use payment configuration
}
```

#### updateFlag(flagKey: string, updates: Partial\<FeatureFlag>): Promise\<void>

Updates an existing feature flag with audit logging.

```typescript
await featureToggle.updateFlag('new_citizen_portal', {
  enabled: true,
  rolloutStrategy: {
    type: 'full',
    percentage: 100,
  },
  lastModified: new Date(),
  modifiedBy: 'admin_user_123',
});
```

#### removeFlag(flagKey: string): Promise\<void>

Removes a feature flag with proper cleanup and audit logging.

```typescript
await featureToggle.removeFlag('deprecated_feature');
```

### Norwegian Municipal Methods

#### registerMunicipalService(serviceKey: string, service: MunicipalService): Promise\<void>

Registers a municipal service feature with Norwegian compliance.

```typescript
await featureToggle.registerMunicipalService('health_appointment_booking', {
  name: 'Digital Health Appointment Booking',
  description: 'Online booking system for municipal health services',
  enabled: true,
  nsmClassification: 'KONFIDENSIELT',
  department: 'helse_og_sosialetaten',
  municipalities: ['0301'], // Oslo only initially
  serviceLevel: 'essential',
  digitalByDefault: true,
  accessibilityCompliant: true,
  supportedLanguages: ['nb-NO', 'nn-NO', 'en-US'],
  gdprCompliance: {
    legalBasis: 'public_task',
    dataCategories: ['health_data', 'personal_identification'],
    retentionPeriod: 'P10Y',
  },
});
```

#### isMunicipalServiceEnabled(serviceKey: string, municipalityCode: string): Promise\<boolean>

Checks if a municipal service is enabled for a specific municipality.

```typescript
const isHealthBookingEnabled = await featureToggle.isMunicipalServiceEnabled(
  'health_appointment_booking',
  '0301' // Oslo
);
```

#### getMunicipalServiceConfig<T>(serviceKey: string, municipalityCode: string): Promise\<T | null>

Retrieves municipal service configuration for a specific municipality.

```typescript
const healthServiceConfig = await featureToggle.getMunicipalServiceConfig<HealthServiceConfig>(
  'health_appointment_booking',
  '0301'
);
```

### Advanced Targeting Methods

#### evaluateUserGroup(flagKey: string, user: UserContext): Promise\<boolean>

Evaluates feature flags based on user group membership.

```typescript
const canAccessAdminFeature = await featureToggle.evaluateUserGroup('admin_dashboard', {
  userId: 'employee_456',
  userGroup: 'municipal_employees',
  department: 'it_department',
  securityClearance: 'KONFIDENSIELT',
  municipality: '0301',
});
```

#### evaluateGeographic(flagKey: string, location: GeographicContext): Promise\<boolean>

Evaluates feature flags based on geographic targeting.

```typescript
const isRegionalFeatureEnabled = await featureToggle.evaluateGeographic(
  'northern_norway_services',
  {
    municipality: '1902', // Tromsø
    region: 'Nord-Norge',
    coordinates: {
      latitude: 69.6496,
      longitude: 18.956,
    },
  }
);
```

#### evaluateTimeWindow(flagKey: string, timeContext?: TimeContext): Promise\<boolean>

Evaluates feature flags based on time-based targeting.

```typescript
const isSeasonalServiceEnabled = await featureToggle.evaluateTimeWindow('summer_park_services', {
  currentTime: new Date(),
  timezone: 'Europe/Oslo',
  municipality: '0301',
});
```

## 🔧 Configuration Interfaces

### FeatureFlag Interface

```typescript
interface FeatureFlag {
  name: string;
  description?: string;
  enabled: boolean;
  nsmClassification: NSMClassification;
  value?: any;
  targetAudience?: TargetAudience;
  rolloutStrategy?: RolloutStrategy;
  gdprConsiderations?: GDPRConsiderations;
  validFrom?: Date;
  validTo?: Date;
  dependencies?: string[];
  tags?: string[];
  lastModified?: Date;
  modifiedBy?: string;
}
```

### TargetAudience Interface

```typescript
interface TargetAudience {
  municipalities?: string[];
  userGroups?: UserGroup[];
  securityClearances?: NSMClassification[];
  demographics?: {
    ageRange?: { min: number; max: number };
    languages?: string[];
    accessibility?: AccessibilityRequirement[];
  };
  departments?: string[];
  serviceAreas?: string[];
}
```

### MunicipalService Interface

```typescript
interface MunicipalService extends FeatureFlag {
  department: string;
  municipalities: string[];
  serviceLevel: 'essential' | 'standard' | 'enhanced';
  digitalByDefault: boolean;
  accessibilityCompliant: boolean;
  supportedLanguages: string[];
  gdprCompliance: {
    legalBasis: GDPRLegalBasis;
    dataCategories: string[];
    retentionPeriod: string;
    consentRequired?: boolean;
  };
  serviceHours?: {
    timezone: string;
    schedule: DaySchedule[];
  };
  contactInfo?: ContactInfo;
}
```

### EvaluationContext Interface

```typescript
interface EvaluationContext {
  userId?: string;
  sessionId?: string;
  municipality?: string;
  userGroup?: UserGroup;
  securityClearance?: NSMClassification;
  department?: string;
  language?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  ipAddress?: string;
  customAttributes?: Record<string, any>;
}
```

## 🇳🇴 Norwegian Municipal Examples

### Oslo Kommune Digital Services

```typescript
// Register Oslo-specific health services
await featureToggle.registerMunicipalService('oslo_digital_health_card', {
  name: 'Oslo Digital Health Card',
  description: 'Digital health card for Oslo residents',
  enabled: true,
  nsmClassification: 'KONFIDENSIELT',
  department: 'helse_og_sosialetaten',
  municipalities: ['0301'],
  serviceLevel: 'enhanced',
  digitalByDefault: true,
  accessibilityCompliant: true,
  supportedLanguages: ['nb-NO', 'nn-NO', 'en-US'],
  gdprCompliance: {
    legalBasis: 'public_task',
    dataCategories: ['health_data', 'personal_identification'],
    retentionPeriod: 'P10Y',
  },
  targetAudience: {
    municipalities: ['0301'],
    userGroups: ['citizens'],
    demographics: {
      ageRange: { min: 16, max: 100 },
    },
  },
});

// Check if health card is available for user
const hasHealthCard = await featureToggle.isMunicipalServiceEnabled(
  'oslo_digital_health_card',
  '0301'
);
```

### Bergen Kommune Education Services

```typescript
// Register Bergen-specific education features
await featureToggle.registerMunicipalService('bergen_school_portal', {
  name: 'Bergen School Portal Enhancement',
  description: 'Enhanced school portal with real-time communication',
  enabled: true,
  nsmClassification: 'BEGRENSET',
  department: 'utdanningsetaten',
  municipalities: ['4601'],
  serviceLevel: 'standard',
  digitalByDefault: true,
  accessibilityCompliant: true,
  supportedLanguages: ['nb-NO', 'nn-NO'],
  gdprCompliance: {
    legalBasis: 'public_task',
    dataCategories: ['educational_data', 'family_data'],
    retentionPeriod: 'P5Y',
  },
  targetAudience: {
    municipalities: ['4601'],
    userGroups: ['parents', 'students', 'teachers'],
  },
});
```

### Multi-Municipality Services

```typescript
// Register service available across multiple municipalities
await featureToggle.registerMunicipalService('norwegian_id_verification', {
  name: 'Enhanced ID Verification',
  description: 'Improved identity verification using BankID and ID-porten',
  enabled: true,
  nsmClassification: 'BEGRENSET',
  department: 'digital_services',
  municipalities: ['0301', '4601', '5001', '1103'], // Oslo, Bergen, Trondheim, Stavanger
  serviceLevel: 'essential',
  digitalByDefault: true,
  accessibilityCompliant: true,
  supportedLanguages: ['nb-NO', 'nn-NO', 'en-US'],
  gdprCompliance: {
    legalBasis: 'public_task',
    dataCategories: ['personal_identification'],
    retentionPeriod: 'P1Y',
  },
  rolloutStrategy: {
    type: 'municipal_phased',
    phases: [
      { municipalities: ['0301'], startDate: '2024-01-01T00:00:00Z' },
      { municipalities: ['4601'], startDate: '2024-02-01T00:00:00Z' },
      { municipalities: ['5001', '1103'], startDate: '2024-03-01T00:00:00Z' },
    ],
  },
});
```

## 🔐 Security and Compliance Features

### NSM Classification Access Control

```typescript
// Feature requiring high security clearance
await featureToggle.register('classified_document_system', {
  name: 'Classified Document Management',
  enabled: true,
  nsmClassification: 'HEMMELIG',
  targetAudience: {
    securityClearances: ['HEMMELIG'],
    userGroups: ['security_officers', 'classified_document_handlers'],
  },
});

// Check access with security clearance
const hasAccess = await featureToggle.isEnabled('classified_document_system', {
  userId: 'officer_123',
  securityClearance: 'HEMMELIG',
  department: 'security_department',
});
```

### GDPR Compliance Checks

```typescript
// Feature affecting personal data
await featureToggle.register('citizen_behavior_analytics', {
  name: 'Citizen Behavior Analytics',
  enabled: false, // Disabled by default for privacy
  nsmClassification: 'BEGRENSET',
  gdprConsiderations: {
    affectsPersonalData: true,
    requiresConsent: true,
    dataCategories: ['behavioral_data', 'usage_patterns'],
    automaticDecisionMaking: true,
    profilingActivities: true,
  },
  targetAudience: {
    userGroups: ['citizens'],
  },
});

// Automatic GDPR compliance validation
const canEnableAnalytics = await featureToggle.validateGDPRCompliance(
  'citizen_behavior_analytics',
  {
    userId: 'citizen_12345',
    hasConsent: true,
    consentTypes: ['analytics', 'profiling'],
  }
);
```

## 📊 Analytics and Monitoring

### Feature Usage Tracking

```typescript
// Track feature usage with compliance
await featureToggle.trackFeatureUsage('new_citizen_portal', {
  userId: 'citizen_12345',
  municipality: '0301',
  userGroup: 'citizens',
  action: 'feature_accessed',
  timestamp: new Date(),
  sessionDuration: 1800000, // 30 minutes
  nsmClassification: 'ÅPEN',
});
```

### A/B Testing with Norwegian Compliance

```typescript
// A/B test with Norwegian municipal focus
await featureToggle.createABTest('payment_interface_test', {
  name: 'Payment Interface A/B Test',
  description: 'Testing new payment interface design',
  variants: [
    {
      name: 'control',
      description: 'Current payment interface',
      percentage: 50,
    },
    {
      name: 'new_design',
      description: 'New accessible payment interface',
      percentage: 50,
    },
  ],
  targetAudience: {
    municipalities: ['0301'],
    userGroups: ['citizens'],
  },
  nsmClassification: 'ÅPEN',
  gdprCompliance: {
    requiresConsent: false,
    dataCategories: ['usage_analytics'],
    anonymized: true,
  },
  duration: {
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-02-29T23:59:59Z',
  },
});

// Get A/B test variant
const variant = await featureToggle.getABTestVariant('payment_interface_test', {
  userId: 'citizen_12345',
  municipality: '0301',
});
```

## 🧪 Testing and Validation

### Feature Toggle Testing

```typescript
import { FoundationFeatureToggle } from '@xala-technologies/foundation';
import { MockFeatureToggleProvider } from '@xala-technologies/foundation/testing';

describe('Foundation Feature Toggle', () => {
  let featureToggle: FoundationFeatureToggle;
  let mockProvider: MockFeatureToggleProvider;

  beforeEach(() => {
    mockProvider = new MockFeatureToggleProvider();
    featureToggle = new FoundationFeatureToggle(config, {
      provider: mockProvider,
    });
  });

  test('should enable feature for correct municipality', async () => {
    await featureToggle.register('oslo_service', {
      name: 'Oslo Service',
      enabled: true,
      nsmClassification: 'ÅPEN',
      targetAudience: {
        municipalities: ['0301'],
      },
    });

    const osloEnabled = await featureToggle.isEnabled('oslo_service', {
      municipality: '0301',
    });

    const bergenEnabled = await featureToggle.isEnabled('oslo_service', {
      municipality: '4601',
    });

    expect(osloEnabled).toBe(true);
    expect(bergenEnabled).toBe(false);
  });

  test('should enforce NSM security clearance', async () => {
    await featureToggle.register('classified_feature', {
      name: 'Classified Feature',
      enabled: true,
      nsmClassification: 'KONFIDENSIELT',
      targetAudience: {
        securityClearances: ['KONFIDENSIELT', 'HEMMELIG'],
      },
    });

    const authorizedAccess = await featureToggle.isEnabled('classified_feature', {
      securityClearance: 'KONFIDENSIELT',
    });

    const unauthorizedAccess = await featureToggle.isEnabled('classified_feature', {
      securityClearance: 'ÅPEN',
    });

    expect(authorizedAccess).toBe(true);
    expect(unauthorizedAccess).toBe(false);
  });
});
```

## 📈 Performance Optimization

### Caching and Performance

```typescript
// Configure caching for performance
const featureToggle = new FoundationFeatureToggle(config, {
  cacheTTL: 300000, // 5 minutes
  enableLocalCache: true,
  enableDistributedCache: true,
  cacheStrategy: 'write-through',
});

// Bulk feature evaluation for performance
const features = await featureToggle.evaluateFeatures(
  ['new_citizen_portal', 'health_appointment_booking', 'digital_payment_system'],
  {
    userId: 'citizen_12345',
    municipality: '0301',
  }
);
```

## 📞 Support and Resources

### Related Documentation

- [Logger API](./logger.md)
- [Norwegian Compliance Guide](../compliance/norwegian-compliance.md)
- [Municipal Configuration Guide](../../guides/municipal-configuration.md)

### Code Examples

- [Oslo Kommune Feature Flags](../../examples/municipal/oslo-citizen-portal/)
- [Multi-Municipality Setup](../../examples/tutorials/multi-municipality/)

### Troubleshooting

- [Feature Toggle Troubleshooting](../../troubleshooting.md#feature-toggle)
- [Performance Optimization](../../performance/feature-toggle-optimization.md)

---

**Version**: 2.0.0  
**Compatibility**: Node.js 18+, TypeScript 4.9+  
**Compliance**: NSM Security Framework, GDPR, Norwegian Municipal Standards
