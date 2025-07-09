# Foundation Package API Reference

Complete API documentation for the `@xala-technologies/foundation` package, covering all modules, platforms, and Norwegian government compliance features.

## 📚 Documentation Structure

### Core Modules

- [Logger](./core/logger.md) - NSM-compliant logging with audit trails
- [Feature Toggle](./core/feature-toggle.md) - Norwegian municipal feature management
- [Error Handler](./core/error-handler.md) - Comprehensive error handling with compliance
- [I18n Core](./core/i18n-core.md) - Norwegian language internationalization
- [Metrics SDK](./core/metrics-sdk.md) - Performance monitoring and compliance tracking
- [Health Check](./core/healthcheck.md) - Service health monitoring with compliance validation
- [Event Core](./core/event-core.md) - Event-driven architecture foundation
- [Saga Orchestrator](./core/saga-orchestrator.md) - Workflow management with compensation
- [Config Loader](./core/config-loader.md) - Configuration management with validation

### Platform APIs

- [Web Platform](./platforms/web.md) - Browser-specific implementations
- [Mobile Platform](./platforms/mobile.md) - React Native optimizations
- [Desktop Platform](./platforms/desktop.md) - Electron integrations
- [API Platform](./platforms/api.md) - Backend service utilities

### Norwegian Compliance

- [NSM Classification](./compliance/nsm.md) - Norwegian Security Classification
- [GDPR Compliance](./compliance/gdpr.md) - Data protection implementation
- [DigDir Integration](./compliance/digdir.md) - Norwegian digitalization standards

### Advanced Features

- [Authentication](./advanced/authentication.md) - ID-porten and multi-provider auth
- [Database Integration](./advanced/database.md) - Compliant data persistence
- [Message Queue](./advanced/messaging.md) - Reliable message processing
- [File Storage](./advanced/storage.md) - Secure file management
- [Notifications](./advanced/notifications.md) - Multi-channel notification system

### Tools and CLI

- [Foundation CLI](./tools/cli.md) - Command-line interface
- [Config Validator](./tools/validator.md) - Configuration validation tools
- [Compliance Checker](./tools/compliance.md) - Automated compliance verification

## 🚀 Quick Start

### Installation

```bash
npm install @xala-technologies/foundation
```

### Basic Usage

```typescript
import {
  FoundationLogger,
  FoundationFeatureToggle,
  FoundationConfig,
} from '@xala-technologies/foundation';

const config: FoundationConfig = {
  name: 'my-app',
  platform: 'web',
  nsm: { enabled: true, defaultClassification: 'ÅPEN' },
  gdpr: { enabled: true, consentRequired: true },
};

const logger = new FoundationLogger(config);
const featureToggle = new FoundationFeatureToggle(config);
```

### Platform-Specific Imports

```typescript
// Web platform
import { FoundationWebSetup } from '@xala-technologies/foundation/web';

// Mobile platform
import { FoundationMobileSetup } from '@xala-technologies/foundation/mobile';

// Desktop platform
import { FoundationDesktopSetup } from '@xala-technologies/foundation/desktop';

// API platform
import { FoundationAPISetup } from '@xala-technologies/foundation/api';
```

## 🇳🇴 Norwegian Government Features

### NSM Security Classifications

- **ÅPEN** - Public information
- **BEGRENSET** - Limited distribution
- **KONFIDENSIELT** - Confidential information
- **HEMMELIG** - Secret information

### GDPR Compliance

- Data subject rights implementation
- Consent management
- Data retention policies
- Right to erasure
- Data portability

### DigDir Integration

- ID-porten authentication
- Altinn form submission
- Maskinporten API authentication
- Norwegian design standards

## 📖 Usage Patterns

### Municipal Services

```typescript
// Oslo Kommune example
const osloConfig: FoundationConfig = {
  name: 'oslo-citizen-portal',
  municipality: { code: '0301', name: 'Oslo' },
  nsm: { defaultClassification: 'BEGRENSET' },
  gdpr: { dataRetentionPeriod: 'P7Y' },
};
```

### Enterprise Applications

```typescript
// Enterprise compliance example
const enterpriseConfig: FoundationConfig = {
  name: 'enterprise-app',
  nsm: { defaultClassification: 'KONFIDENSIELT' },
  gdpr: { consentRequired: true, rightToErasure: true },
  audit: { level: 'comprehensive' },
};
```

### International Adaptation

```typescript
// UK adaptation example
const ukConfig: FoundationConfig = {
  name: 'uk-council-app',
  localization: { defaultLanguage: 'en-GB' },
  compliance: { region: 'UK', standard: 'DPA2018' },
};
```

## 🔧 Configuration Reference

### Core Configuration

```typescript
interface FoundationConfig {
  // Application metadata
  name: string;
  version: string;
  platform: 'web' | 'mobile' | 'desktop' | 'api';
  environment: 'development' | 'production' | 'test';

  // Norwegian compliance
  nsm?: NSMConfig;
  gdpr?: GDPRConfig;
  digdir?: DigDirConfig;

  // Localization
  localization?: LocalizationConfig;

  // Municipality (optional)
  municipality?: MunicipalityConfig;
}
```

### NSM Configuration

```typescript
interface NSMConfig {
  enabled: boolean;
  defaultClassification: NSMClassification;
  encryptionRequired?: boolean;
  auditRequired?: boolean;
  classifications?: Record<string, ClassificationConfig>;
}
```

### GDPR Configuration

```typescript
interface GDPRConfig {
  enabled: boolean;
  consentRequired: boolean;
  dataRetentionPeriod: string; // ISO 8601 duration
  rightToErasure: boolean;
  dataPortability?: boolean;
  dataProtectionOfficer?: ContactInfo;
}
```

## 🧪 Testing and Validation

### Unit Testing

```typescript
import { FoundationTestUtils } from '@xala-technologies/foundation/testing';

const testUtils = new FoundationTestUtils(config);
await testUtils.validateCompliance();
```

### Integration Testing

```typescript
// Test Norwegian compliance
await testUtils.testNorwegianCompliance({
  nsmClassification: 'BEGRENSET',
  gdprRequired: true,
  municipalityCode: '0301',
});
```

## 📊 Performance and Monitoring

### Metrics Collection

```typescript
import { FoundationMetrics } from '@xala-technologies/foundation';

const metrics = new FoundationMetrics(config);
await metrics.trackEvent('user_action', { action: 'login' });
```

### Health Monitoring

```typescript
import { FoundationHealthCheck } from '@xala-technologies/foundation';

const health = new FoundationHealthCheck(config);
const status = await health.check();
```

## 🔐 Security Features

### Encryption

- AES-256-GCM for data encryption
- TLS 1.3 for data in transit
- Norwegian government approved algorithms

### Authentication

- ID-porten integration
- Multi-factor authentication
- Session management
- Token validation

### Audit Logging

- Comprehensive audit trails
- NSM-compliant logging
- Tamper-evident logs
- Real-time monitoring

## 🌍 Internationalization

### Supported Languages

- **Norwegian Bokmål** (nb-NO) - Primary
- **Norwegian Nynorsk** (nn-NO) - Secondary
- **English** (en-US) - International
- **Custom languages** - Extensible

### Municipal Adaptations

- Oslo Kommune (0301)
- Bergen Kommune (4601)
- Trondheim Kommune (5001)
- Stavanger Kommune (1103)

## 📞 Support and Resources

### Documentation

- [Getting Started Guide](../examples/tutorials/getting-started/)
- [Migration Guide](../migration-guide.md)
- [Troubleshooting](../troubleshooting.md)
- [Examples](../examples/)

### Community

- GitHub Issues
- Discussion Forum
- Discord Community
- Developer Newsletter

### Professional Support

- Technical support
- Compliance consulting
- Migration assistance
- Training programs

## 📄 License and Compliance

This API documentation is part of the Foundation package, provided under the MIT License. Production use of Norwegian government features requires appropriate compliance certification and data processing agreements.

---

**Version**: 2.0.0  
**Last Updated**: January 2024  
**Compatibility**: Node.js 18+, TypeScript 4.9+
