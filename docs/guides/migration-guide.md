# Foundation Multi-Platform Migration Guide

Complete guide for migrating from the single-platform Foundation package (v1.x) to the multi-platform Foundation framework (v2.x) with enhanced Norwegian government compliance.

## 📖 Migration Overview

This guide covers:

- **Breaking Changes** between v1.x and v2.x
- **Step-by-step Migration** for each platform
- **Configuration Updates** for new compliance features
- **Code Modernization** with new APIs
- **Testing Strategy** for migrated applications

## 🔄 Breaking Changes Summary

### Package Structure Changes

```typescript
// v1.x (Old)
import { FoundationLogger } from '@xala-technologies/foundation';

// v2.x (New)
import { FoundationLogger } from '@xala-technologies/foundation';
// Platform-specific imports
import { FoundationWebSetup } from '@xala-technologies/foundation/web';
import { FoundationMobileSetup } from '@xala-technologies/foundation/mobile';
```

### Configuration Schema Updates

```typescript
// v1.x Configuration
interface OldFoundationConfig {
  name: string;
  environment: string;
  nsm?: { enabled: boolean };
  gdpr?: { enabled: boolean };
}

// v2.x Configuration
interface NewFoundationConfig {
  name: string;
  version: string; // NEW: Required
  platform: 'web' | 'mobile' | 'desktop' | 'api'; // NEW: Required
  environment: 'development' | 'production' | 'test';
  municipality?: MunicipalityConfig; // NEW: Enhanced
  nsm?: NSMConfig; // ENHANCED: More detailed
  gdpr?: GDPRConfig; // ENHANCED: More detailed
  localization?: LocalizationConfig; // NEW
  authentication?: AuthenticationConfig; // NEW
}
```

### API Method Changes

```typescript
// v1.x Logger Usage
logger.log('info', 'User action', { userId: '123' });

// v2.x Logger Usage (Enhanced)
await logger.log({
  level: 'info',
  message: 'User action',
  userId: '123',
  nsmClassification: 'BEGRENSET',
  personalDataIncluded: false,
  operation: 'user_action',
});
```

## 🚀 Pre-Migration Assessment

### 1. Analyze Current Usage

Run the Foundation CLI analyzer to assess your current implementation:

```bash
npx @xala-technologies/foundation-cli analyze
```

This will generate a report showing:

- Current Foundation v1.x usage patterns
- Identified Norwegian compliance gaps
- Recommended migration paths
- Estimated migration effort

### 2. Backup Current Implementation

```bash
# Create backup branch
git checkout -b foundation-v1-backup
git commit -am "Backup before Foundation v2 migration"

# Return to main branch
git checkout main
```

### 3. Install Migration Tools

```bash
npm install --save-dev @xala-technologies/foundation-migration-tools
```

## 📱 Platform-Specific Migrations

### Web Application Migration

#### Step 1: Update Dependencies

```bash
# Remove old Foundation
npm uninstall @xala-technologies/foundation

# Install new Foundation with web platform
npm install @xala-technologies/foundation @xala-technologies/foundation/web
```

#### Step 2: Update Configuration

Migrate your configuration file:

```typescript
// OLD: foundation.config.ts
export const config = {
  name: 'oslo-portal',
  environment: 'production',
  nsm: { enabled: true },
  gdpr: { enabled: true },
};

// NEW: foundation.config.ts
export const config: FoundationConfig = {
  name: 'oslo-portal',
  version: '1.0.0', // NEW
  platform: 'web', // NEW
  environment: 'production',

  // ENHANCED: Municipality configuration
  municipality: {
    code: '0301',
    name: 'Oslo',
    region: 'Østlandet',
  },

  // ENHANCED: NSM configuration
  nsm: {
    enabled: true,
    defaultClassification: 'BEGRENSET',
    encryptionRequired: true,
    auditRequired: true,
  },

  // ENHANCED: GDPR configuration
  gdpr: {
    enabled: true,
    consentRequired: true,
    dataRetentionPeriod: 'P7Y',
    rightToErasure: true,
    dataPortability: true,
  },

  // NEW: Localization
  localization: {
    defaultLanguage: 'nb-NO',
    supportedLanguages: ['nb-NO', 'nn-NO', 'en-US'],
  },
};
```

#### Step 3: Update Application Initialization

```typescript
// OLD: App.tsx
import { FoundationProvider } from '@xala-technologies/foundation';

function App() {
  return (
    <FoundationProvider config={config}>
      <YourApp />
    </FoundationProvider>
  );
}

// NEW: App.tsx
import { FoundationProvider } from '@xala-technologies/foundation/web';
import { FoundationWebSetup } from '@xala-technologies/foundation/web';

function App() {
  useEffect(() => {
    const webSetup = new FoundationWebSetup(config);
    webSetup.start();
  }, []);

  return (
    <FoundationProvider config={config}>
      <YourApp />
    </FoundationProvider>
  );
}
```

#### Step 4: Migrate Logger Usage

```typescript
// OLD: Logger usage
import { useFoundation } from '@xala-technologies/foundation';

function Component() {
  const { logger } = useFoundation();

  const handleAction = () => {
    logger.log('info', 'Button clicked', { buttonId: 'submit' });
  };
}

// NEW: Enhanced logger usage
import { useFoundation } from '@xala-technologies/foundation/web';

function Component() {
  const { logger } = useFoundation();

  const handleAction = async () => {
    await logger.log({
      level: 'info',
      message: 'Button clicked',
      operation: 'button_click',
      component: 'submit_form',
      nsmClassification: 'ÅPEN',
      personalDataIncluded: false,
      metadata: { buttonId: 'submit' },
    });
  };
}
```

#### Step 5: Add Norwegian Compliance Features

```typescript
// NEW: Add municipal service logging
import { useFoundation } from '@xala-technologies/foundation/web';

function HealthServiceComponent() {
  const { logger } = useFoundation();

  const bookAppointment = async appointmentData => {
    try {
      const result = await api.bookHealthAppointment(appointmentData);

      // Enhanced municipal service logging
      await logger.logMunicipalService({
        serviceType: 'health_appointment_booking',
        citizenId: appointmentData.citizenId,
        municipalityCode: '0301',
        department: 'health_services',
        serviceOutcome: 'appointment_booked',
        appointmentDetails: result,
        nsmClassification: 'KONFIDENSIELT',
      });
    } catch (error) {
      await logger.error('Health appointment booking failed', error, {
        nsmClassification: 'KONFIDENSIELT',
        operation: 'health_appointment_booking',
      });
    }
  };
}
```

### Mobile Application Migration

#### Step 1: Update React Native Dependencies

```bash
# Update Foundation packages
npm uninstall @xala-technologies/foundation
npm install @xala-technologies/foundation @xala-technologies/foundation/mobile

# Add mobile-specific dependencies
npm install @react-native-async-storage/async-storage react-native-keychain
```

#### Step 2: Configure Mobile Platform

```typescript
// NEW: Mobile-specific configuration
export const mobileConfig: FoundationConfig = {
  name: 'bergen-municipal-app',
  version: '1.0.0',
  platform: 'mobile', // NEW
  environment: 'production',

  municipality: {
    code: '4601',
    name: 'Bergen',
  },

  // Mobile-specific features
  mobile: {
    enableBiometrics: true,
    enablePushNotifications: true,
    enableOfflineSync: true,
    secureStorage: 'keychain',
  },
};
```

#### Step 3: Initialize Mobile Foundation

```typescript
// NEW: App.tsx for React Native
import { FoundationMobileProvider } from '@xala-technologies/foundation/mobile';

function App() {
  return (
    <FoundationMobileProvider config={mobileConfig}>
      <NavigationContainer>
        <YourAppNavigator />
      </NavigationContainer>
    </FoundationMobileProvider>
  );
}
```

### Backend API Migration

#### Step 1: Update Server Dependencies

```bash
# Update Foundation for API platform
npm uninstall @xala-technologies/foundation
npm install @xala-technologies/foundation @xala-technologies/foundation/api
```

#### Step 2: Migrate Server Configuration

```typescript
// OLD: Basic server setup
import { FoundationLogger } from '@xala-technologies/foundation';

const logger = new FoundationLogger(config);

// NEW: API platform setup
import { FoundationAPISetup } from '@xala-technologies/foundation/api';

const apiSetup = new FoundationAPISetup({
  name: 'municipal-api',
  version: '1.0.0',
  platform: 'api',
  environment: 'production',

  municipality: {
    code: '1103',
    name: 'Stavanger',
  },

  api: {
    port: 3000,
    enableCORS: true,
    enableHelmet: true,
    authentication: {
      jwtSecret: process.env.JWT_SECRET!,
      tokenExpiry: '1h',
    },
  },
});

await apiSetup.start();
```

#### Step 3: Add Compliance Middleware

```typescript
// NEW: Enhanced API with compliance middleware
app.use(apiSetup.middleware.auditLogging);
app.use(apiSetup.middleware.nsmClassification);
app.use(apiSetup.middleware.gdprCompliance);

// Enhanced route with compliance
app.get('/api/citizens/:id', apiSetup.middleware.authenticate, async (req, res) => {
  // Automatic audit logging and NSM classification
  const citizenData = await getCitizenData(req.params.id);
  res.json(citizenData);
});
```

## 🔧 Configuration Migration Tool

### Automated Migration Script

Create a migration script to automatically update configurations:

```typescript
// scripts/migrate-config.ts
import { readFileSync, writeFileSync } from 'fs';
import { FoundationMigrationTool } from '@xala-technologies/foundation-migration-tools';

async function migrateConfiguration() {
  const migrationTool = new FoundationMigrationTool();

  // Read old configuration
  const oldConfig = JSON.parse(readFileSync('foundation.config.json', 'utf8'));

  // Migrate to new format
  const newConfig = await migrationTool.migrateConfig(oldConfig, {
    platform: 'web', // Specify target platform
    municipality: {
      code: '0301', // Add municipality
      name: 'Oslo',
    },
    enhanceCompliance: true, // Enable enhanced compliance
  });

  // Write new configuration
  writeFileSync('foundation.config.v2.json', JSON.stringify(newConfig, null, 2));

  console.log('Configuration migrated successfully!');
}

migrateConfiguration();
```

Run the migration:

```bash
npx ts-node scripts/migrate-config.ts
```

## 🧪 Testing Migration

### Automated Migration Testing

```typescript
// tests/migration.test.ts
import { FoundationMigrationValidator } from '@xala-technologies/foundation-migration-tools';

describe('Foundation Migration', () => {
  let validator: FoundationMigrationValidator;

  beforeEach(() => {
    validator = new FoundationMigrationValidator();
  });

  test('should validate configuration migration', async () => {
    const oldConfig = loadOldConfig();
    const newConfig = loadNewConfig();

    const validation = await validator.validateConfigMigration(oldConfig, newConfig);

    expect(validation.isValid).toBe(true);
    expect(validation.complianceImproved).toBe(true);
    expect(validation.breakingChanges).toHaveLength(0);
  });

  test('should validate API compatibility', async () => {
    const compatibility = await validator.validateAPICompatibility();

    expect(compatibility.criticalBreaks).toHaveLength(0);
    expect(compatibility.deprecationWarnings.length).toBeLessThan(5);
  });

  test('should validate Norwegian compliance features', async () => {
    const compliance = await validator.validateNorwegianCompliance();

    expect(compliance.nsmClassificationEnabled).toBe(true);
    expect(compliance.gdprComplianceEnabled).toBe(true);
    expect(compliance.municipalityConfigured).toBe(true);
  });
});
```

### Manual Testing Checklist

#### ✅ Core Functionality

- [ ] Logger works with new API format
- [ ] Feature toggles function correctly
- [ ] Error handling maintains functionality
- [ ] Configuration loads properly

#### ✅ Norwegian Compliance

- [ ] NSM classifications applied automatically
- [ ] GDPR compliance features working
- [ ] Municipal service logging functional
- [ ] Audit trails generated correctly

#### ✅ Platform-Specific Features

- [ ] Web: Browser storage and analytics
- [ ] Mobile: Biometrics and offline sync
- [ ] Desktop: Electron integration
- [ ] API: Middleware and authentication

#### ✅ Performance

- [ ] Application startup time acceptable
- [ ] Memory usage within limits
- [ ] Log performance maintained
- [ ] Bundle size optimized

## 🚨 Common Migration Issues

### Issue 1: Configuration Format Changes

**Problem**: Old configuration format not recognized
**Solution**:

```typescript
// Use migration tool to convert configuration
const migratedConfig = await migrationTool.migrateConfig(oldConfig);
```

### Issue 2: Async Logger Methods

**Problem**: Logger methods now return Promises
**Solution**:

```typescript
// OLD: Synchronous
logger.log('info', 'Message');

// NEW: Asynchronous
await logger.log({ level: 'info', message: 'Message' });
```

### Issue 3: Missing NSM Classification

**Problem**: Data not properly classified
**Solution**:

```typescript
// Add NSM classification to all log entries
await logger.log({
  level: 'info',
  message: 'User action',
  nsmClassification: 'ÅPEN', // Always specify
  personalDataIncluded: false,
});
```

### Issue 4: Platform-Specific Imports

**Problem**: Import errors for platform-specific features
**Solution**:

```typescript
// Use platform-specific imports
import { FoundationWebSetup } from '@xala-technologies/foundation/web';
// NOT: import { FoundationWebSetup } from '@xala-technologies/foundation';
```

## 📈 Post-Migration Optimization

### Performance Optimization

```typescript
// Configure caching for better performance
const webSetup = new FoundationWebSetup(config, {
  enableServiceWorker: true,
  cacheStrategy: 'stale-while-revalidate',
  enableAnalytics: true,
  enablePerformanceMonitoring: true,
});
```

### Enhanced Monitoring

```typescript
// Add comprehensive monitoring
await logger.configureMonitoring({
  enableRealTimeAlerts: true,
  complianceMonitoring: true,
  performanceTracking: true,
  errorAggregation: true,
});
```

### Security Hardening

```typescript
// Enable enhanced security features
await security.configure({
  enableCSP: true,
  enableHSTS: true,
  encryptLocalStorage: true,
  enableIntegrityChecks: true,
});
```

## 📞 Migration Support

### Professional Migration Services

- **Migration Assessment** - Detailed analysis of your current implementation
- **Custom Migration Planning** - Tailored migration strategy for your application
- **Hands-on Migration Support** - Expert assistance during migration process
- **Post-Migration Optimization** - Performance and compliance optimization

### Community Resources

- **Migration Discussion Forum** - Community support for migration questions
- **Migration Examples** - Real-world migration examples and patterns
- **Video Tutorials** - Step-by-step migration video guides
- **Office Hours** - Weekly community support sessions

### Emergency Support

For critical migration issues:

- **Emergency Hotline** - Immediate support for blocking issues
- **Dedicated Migration Engineer** - One-on-one expert support
- **Rollback Assistance** - Help reverting to v1.x if needed

---

**Migration Support**: Available 24/7 during migration period  
**Version Compatibility**: v1.x → v2.x  
**Estimated Migration Time**: 2-5 days depending on application complexity
