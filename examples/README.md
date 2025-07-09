# Foundation Package Examples

This directory contains **lightweight code snippets and usage examples** for the `@xala-technologies/foundation` package.

> **Note**: This package contains only code examples and snippets. For full application examples, see our [examples repository](https://github.com/xala-technologies/foundation-examples).

## 📁 Directory Structure

```
examples/
├── basic-usage/           # Simple usage snippets
│   ├── web-example.ts        # Basic web platform setup
│   ├── logger-usage.ts      # Logger implementation examples
│   ├── config-setup.ts      # Configuration examples
│   └── norwegian-compliance.ts # Norwegian compliance setup
├── tutorials/             # Step-by-step guides
│   ├── getting-started/      # Basic setup tutorial
│   ├── norwegian-setup/      # Norwegian compliance guide
│   └── platform-setup/      # Platform-specific setup
└── snippets/             # Reusable code snippets
    ├── nsm-classification.ts # NSM security examples
    ├── gdpr-compliance.ts    # GDPR implementation snippets
    └── digdir-integration.ts # DigDir standards examples
```

## 🚀 Quick Start Examples

### Basic Foundation Setup

```typescript
import { initializeFoundation, createLogger } from '@xala-technologies/foundation';

// Initialize with Norwegian compliance
const foundation = await initializeFoundation({
  municipality: '0301', // Oslo
  language: 'nb',
  compliance: {
    nsmClassification: 'BEGRENSET',
    gdprEnabled: true,
    auditRequired: true,
  },
});

// Create logger with Norwegian compliance
const logger = createLogger({
  level: 'info',
  auditEnabled: true,
  complianceEnabled: true,
});

logger.info('Foundation initialized successfully', {
  municipality: foundation.municipality,
  compliance: foundation.compliance,
});
```

### Norwegian Municipal Application

```typescript
import {
  FoundationConfig,
  createNSMClassifiedLog,
  createGDPRAuditLog,
} from '@xala-technologies/foundation';

// Norwegian municipal configuration
const config: FoundationConfig = {
  environment: 'production',
  municipality: '0301', // Oslo
  language: 'nb',
  compliance: {
    nsmClassification: 'BEGRENSET',
    gdprEnabled: true,
    auditRequired: true,
  },
  norwegianCompliance: {
    nsm: { securityClassification: 'BEGRENSET' },
    gdpr: { enabled: true, dataProcessingBasis: 'public_task' },
    digdir: { interoperabilityStandards: true },
  },
};

// NSM classified logging
createNSMClassifiedLog('BEGRENSET', 'Citizen data accessed', {
  userId: 'clerk001',
  operation: 'view_citizen_profile',
});

// GDPR audit logging
createGDPRAuditLog('data_access', 'citizen_profile', {
  userId: 'citizen123',
  gdprBasis: 'public_task',
  personalDataIncluded: true,
});
```

### Web Platform Setup

```typescript
import { setupWebFoundation } from '@xala-technologies/foundation/web';

// Setup web platform with Norwegian compliance
await setupWebFoundation({
  environment: 'production',
  compliance: {
    nsmClassification: 'BEGRENSET',
    gdprEnabled: true,
  },
  features: {
    metrics: true,
    healthcheck: true,
    i18n: true,
  },
});
```

## 🇳🇴 Norwegian Compliance Examples

### NSM Security Classification

```typescript
import { FeatureToggle } from '@xala-technologies/foundation';

const featureToggle = new FeatureToggle();

// Register NSM classified feature
featureToggle.register({
  key: 'sensitive_data_access',
  enabled: true,
  nsmClassification: 'KONFIDENSIELT',
  description: 'Access to sensitive citizen data',
});

// Check feature with security clearance
const hasAccess = featureToggle.isEnabled('sensitive_data_access', {
  userId: 'employee001',
  attributes: { securityClearance: 'KONFIDENSIELT' },
});
```

### GDPR Data Protection

```typescript
import { EventPublisher } from '@xala-technologies/foundation';

const publisher = new EventPublisher();

// Publish GDPR-compliant event
await publisher.publish({
  type: 'citizen.data.accessed',
  data: { profileId: 'citizen123' },
  metadata: {
    gdprBasis: 'public_task',
    personalDataIncluded: true,
    auditRequired: true,
  },
  nsmClassification: 'BEGRENSET',
});
```

## 📋 Available Examples

### `/basic-usage/`

- **web-example.ts** - Basic web platform initialization
- **logger-usage.ts** - Logging with Norwegian compliance
- **config-setup.ts** - Foundation configuration
- **norwegian-compliance.ts** - Complete compliance setup

### `/tutorials/getting-started/`

- Step-by-step foundation setup
- Norwegian municipality configuration
- Basic compliance implementation

### `/snippets/`

- Reusable code snippets for common patterns
- Norwegian government compliance examples
- Platform-specific implementations

## 🛠️ Usage in Your Project

1. **Install the foundation package:**

```bash
pnpm add @xala-technologies/foundation
```

2. **Copy relevant examples:**

```bash
# Copy the example you need
cp node_modules/@xala-technologies/foundation/examples/basic-usage/web-example.ts ./src/
```

3. **Adapt to your needs:**

```typescript
// Modify the example for your specific requirements
import { initializeFoundation } from '@xala-technologies/foundation';
// ... your implementation
```

## 📖 Additional Resources

- **[Full Applications](https://github.com/xala-technologies/foundation-examples)** - Complete application examples
- **[Documentation](https://foundation.xala.no)** - Comprehensive guides
- **[API Reference](./docs/api-reference/)** - Detailed API documentation

## ⚠️ Important Notes

- Examples are **code snippets only** - not runnable applications
- For complete applications, see our separate examples repository
- All examples follow Norwegian government compliance standards
- Modify examples to match your specific requirements
