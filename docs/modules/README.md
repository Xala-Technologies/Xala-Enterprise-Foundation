# Foundation Modules Documentation

This directory contains detailed documentation for all foundation modules. Each module provides enterprise-grade functionality with full Norwegian government compliance support.

## Core Modules

### Configuration & Setup

- **[Config Loader](config-loader/README.md)** - Environment configuration and validation with NSM compliance
- **[Feature Toggle](feature-toggle/README.md)** - Feature flag management for controlled deployments

### Event System

- **[Event Core](event-core/README.md)** - Core event management infrastructure
- **[Event Publisher](event-publisher/README.md)** - Event publishing with audit trails
- **[Event Subscriber](event-subscriber/README.md)** - Event subscription and handling
- **[Events Overview](events.md)** - Complete event system documentation

### Monitoring & Observability

- **[Logger](logger/README.md)** - Structured logging with Norwegian compliance
- **[Metrics SDK](metrics-sdk/README.md)** - Performance monitoring and analytics
- **[Health Check](healthcheck/README.md)** - Application health monitoring

### Enterprise Features

- **[Error Handler](error-handler/README.md)** - Centralized error management
- **[Saga Orchestrator](saga-orchestrator/README.md)** - Distributed transaction management
- **[Internationalization](i18n-core/README.md)** - Multi-language support with Norwegian standards

## Norwegian Compliance Features

All modules implement:

- **NSM Security Classifications** (ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG)
- **GDPR Data Protection** with legal basis tracking
- **Audit Logging** for government transparency requirements
- **Accessibility Standards** (WCAG 2.2 AA compliance)

## Quick Start

```typescript
import { initializeFoundation } from '@xala/foundation';

// Initialize with Norwegian compliance
const foundation = await initializeFoundation({
  environment: 'production',
  enableNorwegianCompliance: true,
  compliance: {
    nsmClassification: 'BEGRENSET',
    gdprEnabled: true,
  },
});
```

## Platform Support

- **Web Applications** - React, Vue, Angular support
- **Mobile Applications** - React Native, Expo support
- **Desktop Applications** - Electron support
- **API Services** - Node.js, Express, Fastify support

## Architecture

```
Foundation
├── Core Modules (config, events, logging)
├── Platform Adapters (web, mobile, desktop, api)
├── Norwegian Compliance (NSM, GDPR, DigDir)
└── Enterprise Features (monitoring, orchestration)
```

## Getting Help

- **[Implementation Guide](../implementation-guide.md)** - Step-by-step setup
- **[Troubleshooting Guide](../troubleshooting.md)** - Common issues and solutions
- **[Migration Guide](../migration-guide.md)** - Upgrading from previous versions
- **[Contributing Guide](../contributing.md)** - Development and contribution guidelines

All modules are designed for enterprise Norwegian government applications with full compliance support and professional documentation.
