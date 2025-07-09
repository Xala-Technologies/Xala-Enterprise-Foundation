# Foundation Package

A comprehensive, modular foundation package designed specifically for Norwegian government-compliant applications. This package provides event-driven architecture, security utilities, compliance validation, and configuration management in a hub-and-spoke pattern.

## Overview

The Foundation Package serves as the central infrastructure layer for building secure, compliant, and maintainable enterprise applications that meet Norwegian government standards including NSM security classifications, GDPR compliance, and DigDir interoperability requirements.

## Why This Package Exists

After extensive experience building Norwegian government applications, we identified the need for a standardized foundation that handles the complexity of regulatory compliance while providing clean, modular architecture. This package eliminates repetitive implementation of NSM security classifications, GDPR compliance, DigDir standards, and event-driven patterns across projects.

## Quick Start

### Installation

```bash
pnpm add @xala-technologies/foundation
```

### Basic Usage

```typescript
import {
  getEventBus,
  createLogger,
  loadConfig,
  isFeatureEnabled,
  getMetricsCollector,
} from '@xala-technologies/foundation';

// Initialize foundation components
const eventBus = getEventBus();
const logger = createLogger('my-app');
const config = await loadConfig('production');

// Use Norwegian compliance features
logger.createNSMClassifiedLog('KONFIDENSIELT', 'Sensitive operation completed');
const isEnabled = await isFeatureEnabled('oslo-kommune-feature', { municipality: '0301' });
```

## Architecture

### Modular Hub-and-Spoke Design

The foundation follows a strict modular architecture with 9 core modules:

```
Foundation Package
├── config-loader        # Configuration management with Norwegian compliance
├── feature-toggle       # Feature flags with municipal targeting
├── logger              # Structured logging with NSM classification
├── error-handler       # Centralized error handling with compliance
├── i18n-core           # Internationalization with Norwegian support
├── metrics-sdk         # Application monitoring and performance
├── healthcheck         # Service health monitoring with compliance
├── event-core          # Event system foundation for pub/sub
└── saga-orchestrator   # Workflow management with compensation
```

### Norwegian Compliance Features

#### NSM Security Classifications

- **ÅPEN**: Public information with standard processing
- **BEGRENSET**: Restricted access with enhanced audit trails
- **KONFIDENSIELT**: Confidential data with encryption and access control
- **HEMMELIG**: Secret classification with AES-256-GCM encryption

#### GDPR Compliance

- Personal data processing with legal basis tracking
- Consent management and withdrawal capabilities
- Data minimization and retention policies
- Right to erasure with systematic data deletion
- Cross-border transfer controls and audit trails

#### DigDir Standards

- Interoperability compliance for government services
- Accessibility support (WCAG 2.2 AA)
- Norwegian language support (Bokmål and Nynorsk)
- API versioning and documentation standards

## Module Usage Examples

### Configuration Management

```typescript
import { loadConfig, getNorwegianComplianceConfig } from '@xala-technologies/foundation';

// Load municipality-specific configuration
const osloConfig = await loadConfig({
  municipality: '0301', // Oslo Kommune
  environment: 'production',
  compliance: ['NSM', 'GDPR', 'DigDir'],
});

// Access Norwegian compliance settings
const complianceConfig = getNorwegianComplianceConfig();
console.log(complianceConfig.nsmClassifications); // ['ÅPEN', 'BEGRENSET', ...]
```

### Event-Driven Communication

```typescript
import { getEventBus, createComplianceEvent } from '@xala-technologies/foundation';

const eventBus = getEventBus();

// Create compliance-aware events
const citizenEvent = createComplianceEvent(
  'citizen.registered',
  {
    citizenId: 'NO-12345678901',
    municipality: '0301',
    timestamp: new Date(),
  },
  'KONFIDENSIELT'
);

// Publish with automatic audit trail
await eventBus.publish(citizenEvent);

// Subscribe with compliance validation
eventBus.subscribe('citizen.*', async event => {
  console.log('Citizen event received:', event.type);
});
```

### Logging with Classification

```typescript
import {
  getLogger,
  createNSMClassifiedLog,
  createGDPRAuditLog,
} from '@xala-technologies/foundation';

const logger = getLogger('municipal-app');

// Standard logging
logger.info('Application started', { version: '2.0.0' });

// NSM classified logging
await createNSMClassifiedLog('BEGRENSET', 'Municipal employee accessed citizen data', {
  employeeId: 'emp-456',
  citizenId: 'NO-12345678901',
  action: 'READ',
  municipality: '0301',
});

// GDPR audit logging
await createGDPRAuditLog('Personal data processed for municipal service', {
  dataSubject: 'NO-12345678901',
  legalBasis: 'public_task',
  processingPurpose: 'municipal_service_delivery',
});
```

### Feature Management

```typescript
import { isFeatureEnabled, getFeatureValue } from '@xala-technologies/foundation';

// Municipal feature targeting
const osloFeatureEnabled = await isFeatureEnabled('new-citizen-portal', {
  municipality: '0301',
  userRole: 'municipal_employee',
});

// Gradual rollout management
const rolloutPercentage = await getFeatureValue('beta-features', 'rollout_percentage');
console.log(`Feature enabled for ${rolloutPercentage}% of users`);
```

### Health Monitoring

```typescript
import {
  registerHealthCheck,
  runHealthCheck,
  getOverallHealth,
} from '@xala-technologies/foundation';

// Register custom health checks
registerHealthCheck('database', async () => {
  const isHealthy = await checkDatabaseConnection();
  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    details: { connectionPool: 'active' },
  };
});

// Run compliance health checks
const complianceHealth = await runHealthCheck('norwegian-compliance');
const overallHealth = await getOverallHealth();
```

## Comprehensive Testing

### Test Coverage Achievement

The foundation package features **78 comprehensive user story tests** across all 9 modules:

| Module            | Tests | Focus Areas                                | Norwegian Compliance         |
| ----------------- | ----- | ------------------------------------------ | ---------------------------- |
| config-loader     | 7     | Municipality configuration, NSM compliance | ✅ Trondheim/Oslo setup      |
| feature-toggle    | 8     | Gradual rollouts, municipal targeting      | ✅ Bergen/Oslo features      |
| logger            | 9     | Security audit trails, GDPR compliance     | ✅ Classification logging    |
| error-handler     | 9     | Compliance errors, user-friendly messaging | ✅ NSM error handling        |
| i18n-core         | 10    | Norwegian Nynorsk, accessibility           | ✅ Bergen Nynorsk support    |
| metrics-sdk       | 9     | Operations monitoring, compliance tracking | ✅ Security event metrics    |
| healthcheck       | 9     | Infrastructure monitoring, standards       | ✅ Compliance validation     |
| event-core        | 9     | Citizen registration, security events      | ✅ Classified event handling |
| saga-orchestrator | 8     | Workflow management, document processing   | ✅ HEMMELIG workflows        |

### Quality Metrics

✅ **100% Test Pass Rate** - All 78 tests pass successfully
✅ **Zero TypeScript Errors** - Complete type safety validation
✅ **Norwegian Compliance** - NSM, GDPR, DigDir standards validated
✅ **Real Municipality Data** - Oslo (0301), Bergen (4601), Trondheim (5001)
✅ **Production Scenarios** - From simple development to complex government workflows
✅ **Security Classifications** - All NSM levels tested with proper access control

### Test Examples

Real-world scenarios tested include:

- **Oslo Kommune citizen onboarding** with digital identity creation
- **Bergen Kommune Norwegian Nynorsk** interface requirements
- **Trondheim Kommune database configuration** with security settings
- **Security officer HEMMELIG document** processing with AES-256-GCM
- **Operations team emergency feature** disabling across municipalities
- **GDPR compliance officer audit** trail verification and reporting

## Documentation

### Comprehensive Documentation Structure

```
docs/
├── README.md                           # Project overview and quick start
├── architecture/                       # System design and patterns
│   ├── foundation-overview.md          # Architectural decisions and patterns
│   ├── module-structure.md             # Module organization
│   └── event-driven-design.md          # Event system architecture
├── testing/                           # Testing strategies and coverage
│   ├── testing-strategy.md            # Testing approaches
│   └── user-story-tests.md            # All 78 user story tests documented
├── implementation/                     # Development workflows
│   ├── development-workflow.md         # Complete development guide
│   └── migration-strategy.md          # Version migration guidance
└── modules/                          # Module-specific documentation
    ├── config-loader/README.md        # Configuration management guide
    ├── feature-toggle/README.md       # Feature flag management
    ├── logger/README.md               # Logging and audit documentation
    └── [documentation for all 9 modules]
```

### Key Documentation Highlights

- **[Architecture Overview](docs/architecture/foundation-overview.md)** - Complete architectural patterns and Norwegian compliance design
- **[User Story Tests](docs/testing/user-story-tests.md)** - All 78 tests with real Norwegian scenarios
- **[Development Workflow](docs/implementation/development-workflow.md)** - TypeScript best practices and Norwegian standards
- **[Module Documentation](docs/modules/README.md)** - Detailed API references and examples for each module
  - [Config Loader](docs/modules/config-loader/README.md)
  - [Error Handler](docs/modules/error-handler/README.md)
  - [Event System](docs/modules/event-core/README.md)
  - [Feature Toggle](docs/modules/feature-toggle/README.md)
  - [Health Check](docs/modules/healthcheck/README.md)
  - [Internationalization](docs/modules/i18n-core/README.md)
  - [Logger](docs/modules/logger/README.md)
  - [Metrics SDK](docs/modules/metrics-sdk/README.md)
  - [Saga Orchestrator](docs/modules/saga-orchestrator/README.md)

## Development Commands

```bash
# Install dependencies
pnpm install

# Run all validations (lint, type-check, test)
pnpm run validate

# Build the package
pnpm run build

# Run comprehensive test suite
pnpm test

# Run user story tests specifically
pnpm test --testPathPattern=stories

# Development with hot reloading
pnpm run dev

# Test with coverage reporting
pnpm run test:coverage

# Lint and auto-fix
pnpm run lint:fix
```

## Publishing to GitHub Packages

This package is published to GitHub Packages. For authentication:

### Option 1: .env File (for scripts)

```bash
cp .env.example .env
# Add your GitHub Personal Access Token to .env:
# NODE_AUTH_TOKEN=your_github_personal_access_token
```

### Option 2: .npmrc File (for npm/pnpm commands)

```bash
echo "@xala-technologies:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> .npmrc
```

**Token Requirements:**

- GitHub Personal Access Token with `packages:write` and `repo` permissions
- Token must have access to the Xala-Technologies organization

### Publishing Commands

```bash
# Test publish (dry run)
./scripts/publish.sh --dry-run

# Publish to GitHub Packages
./scripts/publish.sh
```

## Norwegian Government Use Cases

### Municipality Integration

- **Oslo Kommune (0301)** - Citizen registration, payment processing, service monitoring
- **Bergen Kommune (4601)** - Norwegian Nynorsk interfaces, cultural services
- **Trondheim Kommune (5001)** - Database configuration, municipal service integration

### Security Compliance Officers

- NSM security event monitoring with proper classification
- GDPR audit trail verification and compliance reporting
- DigDir standard conformance validation and certification

### Government Developers

- Rapid development with Norwegian compliance built-in
- Type-safe APIs with comprehensive error handling
- Real-world tested patterns for government applications

## Requirements

- **Node.js**: 18.0.0 or higher
- **pnpm**: 8.0.0 or higher
- **TypeScript**: 5.0.0 or higher

## Contributing

This package follows enterprise development standards for Norwegian government applications:

- SOLID principles with modular architecture
- Comprehensive testing with user story validation
- Norwegian compliance by design
- Security-first development practices
- Clear documentation and examples

See [Contributing Guide](docs/contributing.md) for detailed guidelines.

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Support

For issues related to Norwegian compliance requirements or technical implementation:

1. Check [Troubleshooting Guide](docs/troubleshooting.md)
2. Review [Module Documentation](docs/README.md) for specific module APIs
3. Create an issue in the repository with detailed information

**Government Compliance Support**: This package is designed for Norwegian government applications and includes built-in support for NSM, GDPR, and DigDir requirements.
