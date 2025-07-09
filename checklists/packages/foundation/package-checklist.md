# Foundation Package Implementation Checklist

## 📋 Package Overview

**Role**: Central Hub - Single Source of Truth for All Packages  
**Dependencies**: ZERO external dependencies (pure foundation)  
**Story Points**: 21 points  
**Status**: 🔄 IN PROGRESS

### Core Responsibilities

- Configuration management across all services
- Structured logging with Norwegian compliance
- Complete TypeScript type definitions for entire system
- Localization system (Norwegian + international)
- Compliance utilities (NSM, GDPR, DigDir)
- Security utilities and validation
- Event bus for inter-service communication
- Service registry for service discovery
- Common utilities and helper functions

## 🏗️ Event-Based Architecture

### Event Bus System

```typescript
// Foundation provides event communication hub
import { EventBus } from '@xala-technologies/foundation';

// Services publish domain events
EventBus.publish('user.created', {
  userId: '123',
  tenantId: 'abc',
  classification: 'BEGRENSET',
  compliance: { nsm: true, gdpr: true },
});

// Services subscribe to relevant events
EventBus.subscribe('user.created', async event => {
  // Norwegian compliance audit logging
  await auditLogger.logUserCreation(event);
  // Notify other services
  await notificationService.sendWelcomeEmail(event.userId);
});
```

### Service Registry Pattern

```typescript
// Foundation manages service discovery
import { ServiceRegistry } from '@xala-technologies/foundation';

// Services register capabilities
ServiceRegistry.register('email', {
  name: 'EmailService',
  version: '1.0.0',
  endpoints: ['send', 'validate', 'template'],
  compliance: 'NSM_BASIC',
});

// Services discover and use other services
const emailService = ServiceRegistry.get('email');
await emailService.send(message);
```

## ✅ Implementation Tasks

### Phase 1: Core Foundation Structure (8 points)

- [ ] **Create package.json with zero dependencies** (1 point)
  - Set up workspace protocol structure
  - Configure build scripts for TypeScript compilation
  - Set up Jest testing configuration
  - Add Norwegian compliance metadata

- [ ] **Implement module structure** (2 points)
  - Create src/modules/ directory structure
  - Set up index.ts exports for each module
  - Implement module barrel exports
  - Configure TypeScript path mapping

- [ ] **Set up configuration module** (2 points)
  - Copy clean config interfaces from v1
  - Implement centralized configuration service
  - Add Norwegian compliance configuration
  - Create environment-specific configs

- [ ] **Set up logger module** (2 points)
  - Copy clean logger interfaces from v1
  - Implement NSM-compliant structured logging
  - Add GDPR audit trail support
  - Create security event logging

- [ ] **Set up types module** (1 point)
  - Copy clean foundation interfaces from v1
  - Organize types by domain modules
  - Create interface-per-file structure
  - Implement proper dependency hierarchy

### Phase 2: Event System Implementation (6 points)

- [ ] **Implement event bus core** (3 points)
  - Create type-safe event publishing system
  - Implement event subscription management
  - Add event middleware for compliance logging
  - Create dead letter queue for failed events
  - File: `src/modules/events/event-bus.ts`

- [ ] **Create service registry** (2 points)
  - Implement service discovery mechanism
  - Add service health monitoring
  - Create service capability registration
  - Add Norwegian compliance validation
  - File: `src/modules/events/service-registry.ts`

- [ ] **Define compliance events** (1 point)
  - Create NSM audit events
  - Define GDPR data access events
  - Add DigDir compliance events
  - Create security violation events
  - File: `src/modules/events/compliance-events.ts`

### Phase 3: Localization Migration (4 points)

- [ ] **Move localization from ui-system** (2 points)
  - Copy Norwegian cultural services
  - Implement multi-language support
  - Create government-grade Norwegian formatting
  - Add cultural validation utilities

- [ ] **Create Norwegian utilities** (2 points)
  - Implement personnummer validation
  - Add organization number validation
  - Create Norwegian address formatting
  - Add postal code validation

### Phase 4: Compliance & Security (3 points)

- [ ] **Move compliance from security-compliance** (2 points)
  - Copy NSM classification utilities
  - Move GDPR compliance validation
  - Add DigDir architectural compliance
  - Create compliance metadata management

- [ ] **Implement security utilities** (1 point)
  - Create encryption/decryption utilities
  - Add input validation helpers
  - Implement authentication interfaces
  - Create security classification helpers

## 🇳🇴 Norwegian Compliance Requirements

### NSM (National Security Authority)

- [ ] **Data Classification** (MANDATORY)

  ```typescript
  export type NSMClassification = 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';

  interface ClassifiedData {
    classification: NSMClassification;
    handlingInstructions: string[];
    declassificationDate?: Date;
  }
  ```

- [ ] **Audit Logging** (MANDATORY)
  ```typescript
  // All data access must be logged
  auditLogger.logDataAccess({
    userId: 'user123',
    resourceId: 'doc456',
    classification: 'KONFIDENSIELT',
    action: 'READ',
    timestamp: new Date(),
    outcome: 'SUCCESS',
  });
  ```

### GDPR Compliance

- [ ] **Data Subject Rights** (MANDATORY)
  ```typescript
  interface GDPRMetadata {
    containsPersonalData: boolean;
    legalBasis: 'consent' | 'contract' | 'legal_obligation';
    retentionPeriod: string;
    dataSubjectRights: string[];
  }
  ```

### DigDir Standards

- [ ] **Service Registration** (MANDATORY)
  ```typescript
  interface DigDirCompliance {
    serviceCode: string;
    serviceEdition: string;
    interoperabilityLevel: 'basic' | 'substantial' | 'high';
    accessibilityCompliance: 'WCAG_2_2_AA';
  }
  ```

## 🧪 Testing Requirements

### Unit Tests (MANDATORY - 90% coverage)

- [ ] **Configuration Service Tests**
  - Test environment variable loading
  - Test configuration validation
  - Test Norwegian compliance settings
  - Test security configuration

- [ ] **Logger Tests**
  - Test all log levels
  - Test security event logging
  - Test audit trail generation
  - Test GDPR compliance logging

- [ ] **Event Bus Tests**
  - Test event publishing
  - Test event subscription
  - Test event middleware
  - Test dead letter queue

- [ ] **Service Registry Tests**
  - Test service registration
  - Test service discovery
  - Test health monitoring
  - Test compliance validation

### Integration Tests

- [ ] **Event Flow Tests**
  - Test complete event workflows
  - Test inter-service communication
  - Test compliance event handling
  - Test error recovery

- [ ] **Norwegian Validation Tests**
  - Test personnummer validation
  - Test organization number validation
  - Test address formatting
  - Test cultural adaptations

## 📁 File Structure

```
packages-v2/foundation/
├── package.json (ZERO dependencies)
├── src/
│   ├── index.ts (main exports)
│   └── modules/
│       ├── index.ts (module exports)
│       ├── config/
│       │   ├── index.ts
│       │   ├── interfaces/
│       │   └── services/
│       ├── logger/
│       │   ├── index.ts
│       │   ├── interfaces/
│       │   └── services/
│       ├── types/
│       │   ├── index.ts
│       │   └── interfaces/
│       ├── events/
│       │   ├── index.ts
│       │   ├── event-bus.ts
│       │   ├── service-registry.ts
│       │   ├── compliance-events.ts
│       │   └── types.ts
│       ├── localization/
│       │   ├── index.ts
│       │   ├── norwegian/
│       │   ├── services/
│       │   └── types/
│       ├── compliance/
│       │   ├── index.ts
│       │   ├── nsm/
│       │   ├── gdpr/
│       │   └── digdir/
│       ├── security/
│       │   ├── index.ts
│       │   ├── encryption/
│       │   ├── validation/
│       │   └── interfaces/
│       └── utils/
│           ├── index.ts
│           ├── formatters/
│           ├── validators/
│           └── helpers/
├── tests/
├── docs/
└── config/
```

## 🚀 Usage Examples

### Basic Foundation Usage

```typescript
import {
  ConfigService,
  Logger,
  EventBus,
  ServiceRegistry,
  NorwegianValidator,
} from '@xala-technologies/foundation';

// Initialize foundation services
const config = ConfigService.getInstance();
const logger = Logger.createLogger('my-service');
const validator = new NorwegianValidator();

// Use event-driven communication
EventBus.publish('data.processed', {
  dataId: '123',
  classification: 'BEGRENSET',
  compliance: config.getNorwegianConfig(),
});

// Register service capabilities
ServiceRegistry.register('data-processor', {
  name: 'DataProcessingService',
  version: '1.0.0',
  endpoints: ['process', 'validate', 'export'],
  compliance: 'NSM_BASIC',
});
```

### Norwegian Compliance Usage

```typescript
import { NSMClassifier, GDPRValidator } from '@xala-technologies/foundation';

// Classify data according to NSM standards
const classification = NSMClassifier.classify(data);
if (classification === 'KONFIDENSIELT') {
  // Apply strict handling procedures
  await AuditLogger.logDataAccess('KONFIDENSIELT', userId);
}

// Validate GDPR compliance
const gdprResult = GDPRValidator.validateDataProcessing({
  legalBasis: 'consent',
  dataCategories: ['personal', 'contact'],
  retentionPeriod: 'P2Y',
});
```

## 🎯 Success Criteria

Foundation package is complete when:

- [ ] Zero external dependencies in package.json
- [ ] All modules properly exported and documented
- [ ] Event bus enables inter-service communication
- [ ] Service registry enables service discovery
- [ ] Norwegian compliance utilities are functional
- [ ] 90%+ test coverage achieved
- [ ] All other packages can depend solely on foundation
- [ ] Event-driven architecture is fully operational
- [ ] NSM, GDPR, and DigDir compliance is enforced

## 📈 Next Steps

After foundation completion:

1. Update data-services to use foundation-only dependencies
2. Migrate norwegian-services to event-driven architecture
3. Refactor business-services to use foundation utilities
4. Update remaining packages following hub-spoke pattern
