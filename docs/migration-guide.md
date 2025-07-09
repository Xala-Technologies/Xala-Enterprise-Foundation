# Migration Guide: Foundation 1.x to 2.0

This guide helps you migrate from foundation package version 1.x to 2.0. Version 2.0 introduces a modular architecture with significant improvements in Norwegian compliance support and event-driven capabilities.

## Overview of Changes

Version 2.0 represents a major architectural overhaul designed to provide better separation of concerns, enhanced compliance features, and improved developer experience.

### Major Changes

- **Modular Architecture**: All functionality moved to `src/modules/` for better organization
- **Event-Driven System**: New EventBus and ServiceRegistry for decoupled communication
- **Enhanced Norwegian Compliance**: Comprehensive NSM, GDPR, and DigDir support
- **Improved Type Safety**: Better TypeScript support with comprehensive type definitions
- **Performance Improvements**: Optimized for production government applications

### Breaking Changes Summary

1. **Import paths changed** due to modular restructuring
2. **Configuration API updated** with better Norwegian compliance support
3. **Logging API enhanced** with audit and compliance features
4. **New event system** replaces some previous communication patterns
5. **Package manager requirement** changed to pnpm

## Pre-Migration Preparation

### Check Current Version

```bash
npm list @xala-technologies/foundation
```

### Backup Your Project

```bash
git add .
git commit -m "Pre-migration backup before foundation 2.0 upgrade"
```

### Review Dependencies

Ensure your project uses compatible versions:

- Node.js 18.0.0 or higher
- TypeScript 5.0 or higher
- Install pnpm if not already available

## Installation Migration

### Update Package Manager

Foundation 2.0 requires pnpm for package management:

```bash
# Install pnpm globally if not installed
npm install -g pnpm

# Remove existing node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install using pnpm
pnpm install
```

### Update Package.json

```json
{
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### Update Foundation Package

```bash
pnpm add @xala-technologies/foundation@^2.0.0
```

## Import Path Migration

The most significant change in 2.0 is the modular architecture. All imports now come from the main package export.

### Before (1.x)

```typescript
import { ConfigService } from '@xala-technologies/foundation/config';
import { logger } from '@xala-technologies/foundation/logger';
import { createConfig } from '@xala-technologies/foundation/utils';
```

### After (2.0)

```typescript
import { ConfigService, logger, defaultConfig } from '@xala-technologies/foundation';
```

### Automated Import Migration

Use this script to automatically update import statements:

```bash
# Create migration script
cat > migrate-imports.sh << 'EOF'
#!/bin/bash

# Update config imports
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from "@xala-technologies/foundation/config"|from "@xala-technologies/foundation"|g'

# Update logger imports
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from "@xala-technologies/foundation/logger"|from "@xala-technologies/foundation"|g'

# Update utils imports
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from "@xala-technologies/foundation/utils"|from "@xala-technologies/foundation"|g'

# Update type imports
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from "@xala-technologies/foundation/types"|from "@xala-technologies/foundation"|g'

EOF

chmod +x migrate-imports.sh
./migrate-imports.sh
```

## Configuration Migration

### Before (1.x)

```typescript
// Old configuration pattern
import { createConfig } from '@xala-technologies/foundation';

const config = createConfig({
  environment: 'production',
  locale: 'no',
});
```

### After (2.0)

```typescript
// New configuration with enhanced Norwegian compliance
import { ConfigService, defaultNorwegianCompliance } from '@xala-technologies/foundation';

const configService = new ConfigService({
  environment: 'production',
  norwegianCompliance: {
    ...defaultNorwegianCompliance,
    nsm: {
      ...defaultNorwegianCompliance.nsm,
      securityClassification: 'BEGRENSET',
    },
  },
});

// Access configuration
const dbConfig = configService.getDatabaseConfig();
const securityConfig = configService.getSecurityConfig();
```

### Configuration Migration Steps

1. **Replace createConfig calls**:

```typescript
// Before
const config = createConfig(options);

// After
const configService = new ConfigService(options);
```

2. **Update Norwegian settings**:

```typescript
// Before (minimal Norwegian support)
const config = createConfig({
  locale: 'no',
  region: 'norway',
});

// After (comprehensive Norwegian compliance)
const configService = new ConfigService({
  norwegianCompliance: {
    nsm: {
      securityClassification: 'BEGRENSET',
      auditLogging: true,
    },
    gdpr: {
      dataMinimization: true,
      consentManagement: true,
      auditLogging: true,
    },
    digdir: {
      serviceRegistration: true,
      accessibility: 'WCAG_2_2_AA',
    },
  },
});
```

## Logging Migration

The logging system has been significantly enhanced with audit and compliance features.

### Before (1.x)

```typescript
import { logger } from '@xala-technologies/foundation';

logger.info('User logged in', { userId: 'user123' });
logger.error('Database connection failed', { error: dbError });
```

### After (2.0)

```typescript
import { logger } from '@xala-technologies/foundation';

// Standard logging (unchanged)
logger.info('User logged in', { userId: 'user123' });
logger.error('Database connection failed', { error: dbError });

// New audit logging for compliance
logger.audit({
  action: 'LOGIN',
  entityType: 'user',
  userId: 'user123',
  compliance: {
    securityClassification: 'BEGRENSET',
    gdprBasis: 'public_task',
    personalDataIncluded: true,
  },
});

// New security logging
logger.security({
  eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
  securityClassification: 'HEMMELIG',
  userId: 'attacker123',
  targetEntity: 'classified_document',
  reason: 'Insufficient clearance',
});
```

### Logging Migration Steps

1. **Identify compliance-sensitive operations** in your existing code
2. **Replace standard logging** with audit logging for these operations
3. **Add security classifications** to sensitive log entries

## Event System Integration

Version 2.0 introduces a powerful event-driven architecture. If your 1.x application used custom event handling, consider migrating to the new EventBus.

### New Event System Usage

```typescript
import { EventBus, NorwegianComplianceEvents } from '@xala-technologies/foundation';

const eventBus = EventBus.getInstance();

// Subscribe to events
const unsubscribe = eventBus.subscribe('user.login.*', async event => {
  console.log('User login event:', event.eventType);
});

// Publish Norwegian compliance events
const authEvent = NorwegianComplianceEvents.createIdPortenAuthenticationEvent(
  '12345678901',
  'Level4',
  'SUCCESS'
);

await eventBus.publish(authEvent);
```

### Migrating Custom Event Handling

If you had custom event handling in 1.x:

```typescript
// Before (1.x) - Custom event emitter
class CustomEventEmitter {
  private listeners = new Map();

  on(event: string, callback: Function) {
    // Custom implementation
  }

  emit(event: string, data: any) {
    // Custom implementation
  }
}

const events = new CustomEventEmitter();
events.on('user.login', handleUserLogin);
events.emit('user.login', userData);
```

```typescript
// After (2.0) - Use EventBus
import { EventBus } from '@xala-technologies/foundation';

const eventBus = EventBus.getInstance();

// Subscribe with patterns
eventBus.subscribe('user.login.*', handleUserLogin);

// Publish structured events
await eventBus.publish({
  eventId: 'login_123',
  eventType: 'user.login.success',
  timestamp: new Date(),
  data: userData,
});
```

## Norwegian Compliance Migration

Version 2.0 significantly expands Norwegian compliance support. Existing applications should migrate to use the new compliance features.

### NSM Classification Migration

```typescript
// Before (1.x) - Manual classification handling
function processClassifiedData(data: any, classification: string) {
  if (classification === 'secret') {
    // Manual encryption and handling
  }
  // Process data
}

// After (2.0) - Automatic NSM compliance
import { EncryptionService, NorwegianComplianceEvents } from '@xala-technologies/foundation';

const encryption = EncryptionService.getInstance();

async function processClassifiedData(data: any, classification: NSMSecurityClassification) {
  // Automatic encryption based on NSM classification
  const encryptedData = await encryption.encrypt(data, key, classification);

  // Automatic compliance event generation
  const nsmEvent = NorwegianComplianceEvents.createNSMClassificationEvent(
    'data.classified.processed',
    { dataId: data.id },
    classification,
    ['data_processing']
  );

  await eventBus.publish(nsmEvent);

  return encryptedData;
}
```

### GDPR Compliance Migration

```typescript
// Before (1.x) - Manual GDPR handling
function processPersonalData(citizenData: any) {
  // Manual consent checking and logging
  if (hasConsent(citizenData.citizenId)) {
    processData(citizenData);
    logDataProcessing(citizenData.citizenId);
  }
}

// After (2.0) - Automatic GDPR compliance
import { NorwegianComplianceEvents } from '@xala-technologies/foundation';

async function processPersonalData(citizenData: any) {
  // Automatic GDPR event generation
  const gdprEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
    'citizen.personal.data.processed',
    citizenData,
    ['personal_data', 'contact_data'],
    'public_task'
  );

  await eventBus.publish(gdprEvent);

  // Process data with compliance tracking
  return processData(citizenData);
}
```

## TypeScript Migration

Version 2.0 provides enhanced TypeScript support with comprehensive type definitions.

### Type Import Migration

```typescript
// Before (1.x) - Limited type support
interface ConfigOptions {
  environment: string;
  locale?: string;
}

// After (2.0) - Comprehensive types
import {
  ConfigServiceOptions,
  NSMSecurityClassification,
  GDPRLegalBasis,
  Event,
  ComplianceEvent,
} from '@xala-technologies/foundation';

// Use provided types for better type safety
const config: ConfigServiceOptions = {
  environment: 'production',
  norwegianCompliance: {
    nsm: {
      securityClassification: 'BEGRENSET' as NSMSecurityClassification,
    },
  },
};
```

## Testing Migration

Update your tests to work with the new modular architecture.

### Before (1.x)

```typescript
import { createConfig } from '@xala-technologies/foundation/config';
import { logger } from '@xala-technologies/foundation/logger';

describe('Config Tests', () => {
  test('should create config', () => {
    const config = createConfig({ environment: 'test' });
    expect(config.environment).toBe('test');
  });
});
```

### After (2.0)

```typescript
import { ConfigService, EventBus, logger } from '@xala-technologies/foundation';

describe('Config Tests', () => {
  test('should create config service', () => {
    const configService = new ConfigService({ environment: 'test' });
    expect(configService.getEnvironment()).toBe('test');
  });

  test('should handle events', async () => {
    const eventBus = EventBus.getInstance();
    let receivedEvent: any = null;

    eventBus.subscribe('test.*', event => {
      receivedEvent = event;
    });

    await eventBus.publish({
      eventId: 'test-1',
      eventType: 'test.example',
      timestamp: new Date(),
      data: { test: true },
    });

    expect(receivedEvent.eventType).toBe('test.example');
  });
});
```

## Performance Considerations

Version 2.0 includes performance optimizations, but you should verify your application's performance after migration.

### Event System Performance

The new event system is optimized for high-throughput scenarios. If you have high-volume event processing:

```typescript
// Use async processing for heavy operations
eventBus.subscribe('heavy.processing.*', async event => {
  // Queue heavy work instead of blocking
  await jobQueue.add('process-heavy-event', event.data);
});

// Consider event batching for high-volume scenarios
class EventBatcher {
  private batch: Event[] = [];

  add(event: Event) {
    this.batch.push(event);
    if (this.batch.length >= 100) {
      this.flush();
    }
  }

  private async flush() {
    const events = this.batch.splice(0);
    await Promise.all(events.map(event => eventBus.publish(event)));
  }
}
```

## Validation and Testing

After completing the migration, thoroughly test your application:

### 1. Build Verification

```bash
pnpm run build
```

### 2. Test Suite Execution

```bash
pnpm run test
```

### 3. Norwegian Compliance Verification

Create a test to verify Norwegian compliance features:

```typescript
import { NorwegianComplianceEvents, logger } from '@xala-technologies/foundation';

test('Norwegian compliance features work', async () => {
  // Test NSM classification
  const nsmEvent = NorwegianComplianceEvents.createNSMClassificationEvent(
    'test.classification',
    { test: true },
    'BEGRENSET',
    ['test_handling']
  );

  expect(nsmEvent.compliance.classification).toBe('BEGRENSET');

  // Test audit logging
  logger.audit({
    action: 'TEST',
    entityType: 'test_entity',
    userId: 'test_user',
    compliance: {
      securityClassification: 'BEGRENSET',
      gdprBasis: 'public_task',
    },
  });

  // Should not throw
  expect(true).toBe(true);
});
```

## Rollback Plan

If issues arise during migration, you can rollback:

### 1. Restore from Git

```bash
git checkout HEAD~1  # Go back to pre-migration state
```

### 2. Reinstall 1.x Version

```bash
npm install @xala-technologies/foundation@^1.0.0
```

### 3. Remove 2.0 Changes

```bash
# Remove any 2.0-specific code changes
git reset --hard HEAD
```

## Common Migration Issues

### Import Resolution Errors

**Problem**: TypeScript cannot resolve imports after migration.

**Solution**: Update `tsconfig.json` with proper module resolution:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### Event Handler Memory Leaks

**Problem**: Event subscriptions not being cleaned up.

**Solution**: Always unsubscribe from events:

```typescript
class ComponentClass {
  private subscriptions: (() => void)[] = [];

  constructor() {
    this.subscriptions.push(eventBus.subscribe('events.*', this.handleEvent.bind(this)));
  }

  destroy() {
    this.subscriptions.forEach(unsub => unsub());
  }
}
```

### NSM Classification Validation Errors

**Problem**: Invalid NSM classifications causing runtime errors.

**Solution**: Use provided type definitions and validation:

```typescript
import { NSMSecurityClassification, isValidNSMClassification } from '@xala-technologies/foundation';

function validateClassification(classification: string): NSMSecurityClassification {
  if (!isValidNSMClassification(classification)) {
    throw new Error(`Invalid NSM classification: ${classification}`);
  }
  return classification as NSMSecurityClassification;
}
```

## Post-Migration Checklist

- [ ] All imports updated to use main package export
- [ ] Configuration migrated to ConfigService with Norwegian compliance
- [ ] Audit logging implemented for compliance-sensitive operations
- [ ] Event system integrated where appropriate
- [ ] Tests updated and passing
- [ ] Build successful without errors
- [ ] Norwegian compliance features verified
- [ ] Performance verified in development environment
- [ ] Documentation updated to reflect 2.0 usage

## Getting Help

If you encounter issues during migration:

1. **Check the troubleshooting guide**: `docs/troubleshooting.md`
2. **Review module documentation**: [docs/modules/](modules/README.md)
3. **Create a minimal reproduction** of the issue
4. **Submit an issue** with migration context and error details

This migration guide should help you successfully upgrade to foundation 2.0 while taking advantage of the enhanced Norwegian compliance features and improved architecture.
