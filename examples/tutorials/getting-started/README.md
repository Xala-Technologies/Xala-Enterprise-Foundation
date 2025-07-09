# Getting Started with Foundation Package

A comprehensive tutorial for setting up and using the `@xala-technologies/foundation` package in your Norwegian municipal or government application.

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18.0.0 or higher
- TypeScript knowledge (basic to intermediate)
- Understanding of Norwegian government compliance requirements
- Development environment set up

## 🚀 Installation

### 1. Install the Foundation Package

```bash
# Using npm
npm install @xala-technologies/foundation

# Using pnpm (recommended)
pnpm add @xala-technologies/foundation

# Using yarn
yarn add @xala-technologies/foundation
```

### 2. Install Platform-Specific Dependencies

```bash
# For web applications
npm install @xala-technologies/foundation/web

# For mobile applications
npm install @xala-technologies/foundation/mobile

# For desktop applications
npm install @xala-technologies/foundation/desktop

# For API services
npm install @xala-technologies/foundation/api
```

## 🔧 Basic Configuration

### 1. Create Foundation Configuration

Create a `foundation.config.ts` file in your project:

```typescript
import { FoundationConfig } from '@xala-technologies/foundation';

export const foundationConfig: FoundationConfig = {
  // Basic application information
  name: 'my-municipal-app',
  version: '1.0.0',
  platform: 'web', // 'web' | 'mobile' | 'desktop' | 'api'
  environment: 'development', // 'development' | 'production' | 'test'

  // Norwegian Security Classification (NSM)
  nsm: {
    enabled: true,
    defaultClassification: 'ÅPEN', // 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG'
    encryptionRequired: false,
    auditRequired: true,
  },

  // GDPR Compliance
  gdpr: {
    enabled: true,
    consentRequired: true,
    dataRetentionPeriod: 'P7Y', // 7 years
    rightToErasure: true,
  },

  // Norwegian language support
  localization: {
    enabled: true,
    defaultLanguage: 'nb-NO',
    supportedLanguages: ['nb-NO', 'nn-NO', 'en-US'],
    fallbackLanguage: 'nb-NO',
  },

  // Municipality configuration (optional)
  municipality: {
    code: '0301', // Oslo Kommune
    name: 'Oslo',
    region: 'Østlandet',
  },
};
```

### 2. Environment Variables

Create a `.env` file for sensitive configuration:

```bash
# Authentication
ID_PORTEN_CLIENT_ID=your_client_id
ID_PORTEN_CLIENT_SECRET=your_client_secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Encryption
NSM_ENCRYPTION_KEY=your_encryption_key

# External APIs
ALTINN_API_KEY=your_altinn_api_key
```

## 📚 Core Modules Tutorial

### 1. Logger Module

The logger provides NSM-compliant logging with automatic classification:

```typescript
import { FoundationLogger } from '@xala-technologies/foundation';
import { foundationConfig } from './foundation.config';

// Initialize logger
const logger = new FoundationLogger(foundationConfig);

// Basic logging
logger.info('Application started');
logger.error('Database connection failed', error);

// NSM-classified logging
logger.log({
  level: 'info',
  message: 'User accessed personal data',
  userId: 'user_123',
  nsmClassification: 'BEGRENSET',
  personalDataIncluded: true,
});

// Audit logging
logger.audit({
  action: 'data_export',
  userId: 'user_123',
  entityType: 'citizen_data',
  nsmClassification: 'KONFIDENSIELT',
});
```

### 2. Feature Toggle Module

Manage feature flags with Norwegian compliance:

```typescript
import { FoundationFeatureToggle } from '@xala-technologies/foundation';
import { foundationConfig } from './foundation.config';

// Initialize feature toggle
const featureToggle = new FoundationFeatureToggle(foundationConfig);

// Register features
featureToggle.register('new_payment_system', {
  name: 'New Payment System',
  enabled: true,
  nsmClassification: 'BEGRENSET',
  targetAudience: {
    municipalities: ['0301', '4601'], // Oslo, Bergen
    userGroups: ['citizens', 'employees'],
  },
});

// Check feature availability
const isEnabled = featureToggle.isEnabled('new_payment_system', {
  userId: 'user_123',
  municipality: '0301',
});

if (isEnabled) {
  // Show new payment system
}
```

### 3. Error Handler Module

Comprehensive error handling with compliance:

```typescript
import { FoundationErrorHandler } from '@xala-technologies/foundation';
import { foundationConfig } from './foundation.config';

// Initialize error handler
const errorHandler = new FoundationErrorHandler(foundationConfig);

// Handle application errors
try {
  // Your application logic
} catch (error) {
  errorHandler.handleError(error, {
    userId: 'user_123',
    operation: 'data_processing',
    nsmClassification: 'BEGRENSET',
  });
}

// Handle personal data errors
try {
  // Personal data processing
} catch (error) {
  errorHandler.handlePersonalDataError(error, {
    userId: 'user_123',
    operation: 'personal_data_export',
    personalDataInvolved: true,
    nsmClassification: 'KONFIDENSIELT',
  });
}
```

### 4. I18n Module

Norwegian language support:

```typescript
import { FoundationI18n } from '@xala-technologies/foundation';
import { foundationConfig } from './foundation.config';

// Initialize i18n
const i18n = new FoundationI18n({
  defaultLanguage: 'nb-NO',
  supportedLanguages: ['nb-NO', 'nn-NO', 'en-US'],
  fallbackLanguage: 'nb-NO',
});

// Load translations
i18n.loadTranslations('nb-NO', {
  welcome: 'Velkommen til Oslo Kommune',
  services: 'Tjenester',
  applications: 'Søknader',
});

i18n.loadTranslations('nn-NO', {
  welcome: 'Velkommen til Oslo Kommune',
  services: 'Tenester',
  applications: 'Søknader',
});

// Use translations
const welcomeMessage = i18n.translate('welcome');
const servicesText = i18n.translate('services');
```

## 🌐 Platform-Specific Setup

### Web Application Setup

```typescript
import { FoundationWebSetup } from '@xala-technologies/foundation/web';
import { foundationConfig } from './foundation.config';

// Initialize web platform
const webSetup = new FoundationWebSetup(foundationConfig);

// Configure web-specific features
webSetup.configureStorage({
  type: 'localStorage',
  encryption: true,
  nsmClassification: 'BEGRENSET',
});

webSetup.configureAnalytics({
  enabled: true,
  anonymizeData: true,
  trackingId: 'UA-XXXXX-X',
});

// Start web application
webSetup.start();
```

### Mobile Application Setup

```typescript
import { FoundationMobileSetup } from '@xala-technologies/foundation/mobile';
import { foundationConfig } from './foundation.config';

// Initialize mobile platform
const mobileSetup = new FoundationMobileSetup(foundationConfig);

// Configure mobile-specific features
mobileSetup.configureStorage({
  type: 'AsyncStorage',
  encryption: true,
  nsmClassification: 'BEGRENSET',
});

mobileSetup.configureOfflineSupport({
  enabled: true,
  syncInterval: 300000, // 5 minutes
  maxQueueSize: 100,
});

// Start mobile application
mobileSetup.start();
```

### API Service Setup

```typescript
import { FoundationAPISetup } from '@xala-technologies/foundation/api';
import { foundationConfig } from './foundation.config';

// Initialize API platform
const apiSetup = new FoundationAPISetup(foundationConfig);

// Configure API-specific features
apiSetup.configureDatabase({
  type: 'postgresql',
  url: process.env.DATABASE_URL,
  encryption: true,
});

apiSetup.configureAuthentication({
  provider: 'idporten',
  clientId: process.env.ID_PORTEN_CLIENT_ID,
  clientSecret: process.env.ID_PORTEN_CLIENT_SECRET,
});

// Start API service
apiSetup.start();
```

## 🏛️ Norwegian Government Integration

### 1. ID-porten Integration

```typescript
import { FoundationAuth } from '@xala-technologies/foundation';
import { foundationConfig } from './foundation.config';

// Initialize authentication
const auth = new FoundationAuth(foundationConfig);

// Configure ID-porten
auth.configureProvider('idporten', {
  clientId: process.env.ID_PORTEN_CLIENT_ID,
  clientSecret: process.env.ID_PORTEN_CLIENT_SECRET,
  discoveryUrl: 'https://oidc.difi.no/idporten-oidc-provider/.well-known/openid_configuration',
  scopes: ['openid', 'profile'],
  redirectUri: 'https://yourapp.com/auth/callback',
});

// Handle authentication
const loginUrl = auth.getLoginUrl('idporten');
// Redirect user to loginUrl

// Handle callback
const tokens = await auth.handleCallback('idporten', callbackParams);
const userProfile = await auth.getUserProfile(tokens.accessToken);
```

### 2. Altinn Integration

```typescript
import { FoundationAltinn } from '@xala-technologies/foundation';
import { foundationConfig } from './foundation.config';

// Initialize Altinn integration
const altinn = new FoundationAltinn(foundationConfig);

// Configure Altinn
altinn.configure({
  apiKey: process.env.ALTINN_API_KEY,
  baseUrl: 'https://www.altinn.no/api',
  serviceOwner: 'Oslo Kommune',
});

// Submit form to Altinn
const submission = await altinn.submitForm({
  serviceCode: 'serviceCode',
  serviceEdition: 'serviceEdition',
  formData: {
    // Your form data
  },
  nsmClassification: 'BEGRENSET',
});
```

## 🧪 Testing Your Implementation

### 1. Unit Tests

```typescript
import { FoundationLogger } from '@xala-technologies/foundation';
import { foundationConfig } from './foundation.config';

describe('Foundation Logger', () => {
  let logger: FoundationLogger;

  beforeEach(() => {
    logger = new FoundationLogger(foundationConfig);
  });

  test('should log with NSM classification', () => {
    const logSpy = jest.spyOn(console, 'log');

    logger.log({
      level: 'info',
      message: 'Test message',
      nsmClassification: 'ÅPEN',
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        message: 'Test message',
        nsmClassification: 'ÅPEN',
      })
    );
  });
});
```

### 2. Integration Tests

```typescript
import { FoundationTestUtils } from '@xala-technologies/foundation/testing';
import { foundationConfig } from './foundation.config';

describe('Foundation Integration', () => {
  let testUtils: FoundationTestUtils;

  beforeEach(() => {
    testUtils = new FoundationTestUtils(foundationConfig);
  });

  test('should handle Norwegian compliance', async () => {
    const result = await testUtils.testCompliance({
      nsmClassification: 'BEGRENSET',
      gdprRequired: true,
      personalDataIncluded: true,
    });

    expect(result.compliant).toBe(true);
    expect(result.nsmCompliant).toBe(true);
    expect(result.gdprCompliant).toBe(true);
  });
});
```

## 🚀 Deployment

### 1. Build Configuration

```typescript
// build.config.ts
import { FoundationBuildConfig } from '@xala-technologies/foundation';

export const buildConfig: FoundationBuildConfig = {
  target: 'production',
  platform: 'web',
  optimization: {
    minify: true,
    bundleSplitting: true,
    treeshaking: true,
  },
  compliance: {
    nsmValidation: true,
    gdprValidation: true,
    auditTrail: true,
  },
};
```

### 2. Production Deployment

```bash
# Build for production
npm run build

# Run compliance checks
npm run compliance:check

# Deploy to production
npm run deploy
```

## 📊 Monitoring and Metrics

### 1. Application Metrics

```typescript
import { FoundationMetrics } from '@xala-technologies/foundation';
import { foundationConfig } from './foundation.config';

// Initialize metrics
const metrics = new FoundationMetrics(foundationConfig);

// Track custom events
metrics.trackEvent({
  eventType: 'form_submission',
  userId: 'user_123',
  properties: {
    formType: 'health_application',
    municipality: '0301',
  },
});

// Track performance
metrics.trackPerformance({
  operation: 'database_query',
  duration: 150,
  success: true,
});
```

### 2. Health Checks

```typescript
import { FoundationHealthCheck } from '@xala-technologies/foundation';
import { foundationConfig } from './foundation.config';

// Initialize health checks
const healthCheck = new FoundationHealthCheck(foundationConfig);

// Add custom health checks
healthCheck.addCheck('database', async () => {
  const isConnected = await database.ping();
  return {
    status: isConnected ? 'healthy' : 'unhealthy',
    details: { connectionStatus: isConnected },
  };
});

// Run health checks
const health = await healthCheck.check();
console.log(health);
```

## 🔧 Advanced Configuration

### 1. Custom Compliance Rules

```typescript
import { FoundationCompliance } from '@xala-technologies/foundation';
import { foundationConfig } from './foundation.config';

// Initialize compliance
const compliance = new FoundationCompliance(foundationConfig);

// Add custom NSM rules
compliance.addNSMRule('custom_classification', {
  name: 'Custom Classification',
  level: 'BEGRENSET',
  requirements: {
    encryption: true,
    auditTrail: true,
    accessControl: true,
  },
});

// Add custom GDPR rules
compliance.addGDPRRule('custom_processing', {
  name: 'Custom Processing',
  legalBasis: 'consent',
  dataCategories: ['personal_identification'],
  retentionPeriod: 'P5Y',
});
```

### 2. Event System

```typescript
import { FoundationEvents } from '@xala-technologies/foundation';
import { foundationConfig } from './foundation.config';

// Initialize event system
const events = new FoundationEvents(foundationConfig);

// Subscribe to events
events.on('user:login', event => {
  console.log('User logged in:', event.userId);
});

events.on('data:export', event => {
  console.log('Data exported:', event.dataType);
});

// Emit events
events.emit('user:login', {
  userId: 'user_123',
  loginMethod: 'idporten',
  timestamp: new Date(),
});
```

## 📞 Getting Help

### Documentation

- [Complete API Reference](../../docs/api-reference.md)
- [Norwegian Compliance Guide](../../docs/compliance/norwegian-compliance.md)
- [Platform-Specific Guides](../../docs/platforms/)

### Community

- [GitHub Issues](https://github.com/xala-technologies/foundation/issues)
- [Discussion Forum](https://github.com/xala-technologies/foundation/discussions)
- [Discord Community](https://discord.gg/foundation)

### Professional Support

- Email: support@xala-technologies.com
- Phone: +47 XXXX XXXX
- Emergency: 24/7 support for production issues

## 🎯 Next Steps

1. **Complete the Tutorial**: Follow this guide step by step
2. **Explore Examples**: Check out the [examples directory](../) for more complex implementations
3. **Read the Documentation**: Dive deeper into specific modules and features
4. **Join the Community**: Connect with other developers using the Foundation package
5. **Start Building**: Create your Norwegian-compliant application

## 📚 Additional Resources

- [Norwegian Government API Guidelines](https://www.regjeringen.no/en/topics/information-management/information-technology/api-guidelines/id2691123/)
- [NSM Security Guidelines](https://nsm.no/regelverk-og-hjelp/veiledninger/)
- [GDPR Compliance Guide](https://gdpr.eu/compliance/)
- [ID-porten Documentation](https://docs.digdir.no/idporten_index.html)
- [Altinn Documentation](https://docs.altinn.studio/)

---

**Congratulations!** You're now ready to build Norwegian-compliant applications with the Foundation package. Start with the basic setup and gradually add more advanced features as needed.
