# Data Services Package Implementation Checklist

## 📋 Package Overview

**Role**: Data Access & Storage Abstraction  
**Dependencies**: ONLY @xala-technologies/foundation  
**Story Points**: 16 points  
**Status**: 📋 PLANNED

### Core Responsibilities

- Database adapters (PostgreSQL, Redis, MongoDB)
- Data access patterns and repositories
- Caching strategies and implementations
- Data validation and schemas
- Norwegian data compliance (GDPR, NSM classification)
- Event-driven data change notifications
- Query optimization and performance monitoring

## 🏗️ Event-Based Architecture

### Data Events System

```typescript
import { EventBus } from '@xala-technologies/foundation';

// Data services publish data change events
EventBus.publish('data.entity.created', {
  entityType: 'User',
  entityId: 'user-123',
  tenantId: 'tenant-abc',
  classification: 'BEGRENSET',
  metadata: {
    createdBy: 'admin-456',
    timestamp: new Date(),
    compliance: { gdprApplicable: true },
  },
});

// Other services subscribe to data events
EventBus.subscribe('data.entity.updated', async event => {
  // Trigger cache invalidation
  await cacheService.invalidate(event.entityType, event.entityId);
  // Log for audit trail
  await auditLogger.logDataModification(event);
  // Notify business services
  await businessEventBus.publish(`${event.entityType}.updated`, event);
});
```

### Database Connection Management

```typescript
import { ServiceRegistry, ConfigService } from '@xala-technologies/foundation';

// Register database capabilities
ServiceRegistry.register('database', {
  name: 'DatabaseService',
  version: '1.0.0',
  endpoints: ['query', 'transaction', 'migrate'],
  compliance: 'NSM_BASIC',
  capabilities: ['postgresql', 'redis', 'mongodb'],
});

// Event-driven connection health monitoring
EventBus.subscribe('database.connection.lost', async event => {
  await logger.error('Database connection lost', { database: event.database });
  await ServiceRegistry.markUnhealthy('database');
  await notificationService.alertOpsTeam(event);
});
```

## ✅ Implementation Tasks

### Phase 1: Foundation Integration (4 points)

- [ ] **Update package.json dependencies** (1 point)
  - Remove all dependencies except foundation
  - Update imports to use foundation services
  - Configure build scripts and TypeScript
  - Add Norwegian compliance metadata

- [ ] **Implement base service structure** (2 points)
  - Create BaseDataService extending foundation ServiceLifecycle
  - Implement Norwegian compliance validation
  - Add NSM data classification support
  - Create GDPR-compliant data handling

- [ ] **Set up event integration** (1 point)
  - Subscribe to foundation event bus
  - Implement data change event publishing
  - Add compliance event logging
  - Create error handling events

### Phase 2: Database Abstraction Layer (5 points)

- [ ] **PostgreSQL adapter implementation** (2 points)
  - Create connection management with foundation config
  - Implement query builder with NSM classification
  - Add GDPR-compliant data operations
  - Create transaction management
  - File: `src/modules/database/postgresql/postgresql.adapter.ts`

- [ ] **Redis caching adapter** (2 points)
  - Implement cache operations with TTL management
  - Add NSM classification-aware caching
  - Create GDPR-compliant cache expiration
  - Implement distributed cache patterns
  - File: `src/modules/cache/redis/redis.adapter.ts`

- [ ] **MongoDB document adapter** (1 point)
  - Create document operations with classification
  - Implement schema validation
  - Add compliance metadata handling
  - Create aggregation pipeline support
  - File: `src/modules/database/mongodb/mongodb.adapter.ts`

### Phase 3: Data Access Patterns (4 points)

- [ ] **Repository pattern implementation** (2 points)
  - Create generic repository interfaces
  - Implement Norwegian entity repositories
  - Add compliance validation in repositories
  - Create event-driven repository operations

- [ ] **Query builder system** (1 point)
  - Implement type-safe query construction
  - Add NSM classification filtering
  - Create GDPR-compliant query operations
  - Add performance monitoring

- [ ] **Schema validation** (1 point)
  - Implement Zod schema validation
  - Add Norwegian field validation (personnummer, etc.)
  - Create compliance schema decorators
  - Add schema migration support

### Phase 4: Caching & Performance (3 points)

- [ ] **Multi-level caching strategy** (2 points)
  - Implement L1 (memory) and L2 (Redis) caching
  - Add cache invalidation events
  - Create compliance-aware cache policies
  - Implement cache warming strategies

- [ ] **Performance monitoring** (1 point)
  - Add query performance tracking
  - Implement slow query detection
  - Create performance event publishing
  - Add Norwegian compliance metrics

## 🇳🇴 Norwegian Compliance Requirements

### NSM Data Classification

- [ ] **Classified Data Handling** (MANDATORY)

  ```typescript
  interface ClassifiedEntity {
    id: string;
    classification: NSMClassification;
    data: Record<string, any>;
    metadata: {
      classifiedBy: string;
      classificationDate: Date;
      handlingInstructions: string[];
    };
  }

  // All database operations must respect classification
  async function saveEntity(entity: ClassifiedEntity): Promise<void> {
    await validateClassificationRights(entity.classification, currentUser);
    await auditLogger.logDataAccess('WRITE', entity.classification);
    await database.save(entity);
  }
  ```

### GDPR Data Protection

- [ ] **Data Minimization** (MANDATORY)
  ```typescript
  interface GDPRRepository<T> {
    // Only collect necessary data
    create(data: MinimalRequired<T>): Promise<T>;
    // Automatic data expiration
    findWithRetention(id: string): Promise<T | null>;
    // Right to erasure
    anonymize(id: string): Promise<void>;
    // Data portability
    export(userId: string): Promise<PortableData>;
  }
  ```

### Data Residency

- [ ] **Norwegian Data Storage** (MANDATORY)
  ```typescript
  interface DataResidencyConfig {
    region: 'norway-east' | 'norway-west';
    crossBorderTransfer: boolean;
    adequacyDecision: boolean;
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
  }
  ```

## 🧪 Testing Requirements

### Unit Tests (MANDATORY - 85% coverage)

- [ ] **Database Adapter Tests**
  - Test connection management
  - Test query execution
  - Test transaction handling
  - Test error recovery

- [ ] **Repository Tests**
  - Test CRUD operations
  - Test Norwegian field validation
  - Test compliance filtering
  - Test event publishing

- [ ] **Caching Tests**
  - Test cache operations
  - Test invalidation strategies
  - Test compliance policies
  - Test performance metrics

- [ ] **Schema Validation Tests**
  - Test Norwegian specific validations
  - Test compliance schema decorators
  - Test migration processes
  - Test error handling

### Integration Tests

- [ ] **Database Integration**
  - Test with real PostgreSQL instance
  - Test with real Redis instance
  - Test cross-database transactions
  - Test compliance scenarios

- [ ] **Event Integration**
  - Test event publishing on data changes
  - Test event subscription handling
  - Test error event processing
  - Test compliance event logging

### Performance Tests

- [ ] **Query Performance**
  - Test query execution times
  - Test concurrent operations
  - Test cache hit rates
  - Test Norwegian data scenarios

## 📁 File Structure

```
packages-v2/data-services/
├── package.json (foundation only)
├── src/
│   ├── index.ts
│   └── modules/
│       ├── index.ts
│       ├── database/
│       │   ├── index.ts
│       │   ├── interfaces/
│       │   │   ├── database.interface.ts
│       │   │   └── repository.interface.ts
│       │   ├── postgresql/
│       │   │   ├── postgresql.adapter.ts
│       │   │   ├── postgresql.repository.ts
│       │   │   └── postgresql.config.ts
│       │   ├── mongodb/
│       │   │   ├── mongodb.adapter.ts
│       │   │   └── mongodb.repository.ts
│       │   └── base/
│       │       ├── base.repository.ts
│       │       └── base.adapter.ts
│       ├── cache/
│       │   ├── index.ts
│       │   ├── interfaces/
│       │   │   └── cache.interface.ts
│       │   ├── redis/
│       │   │   ├── redis.adapter.ts
│       │   │   └── redis.config.ts
│       │   ├── memory/
│       │   │   └── memory.cache.ts
│       │   └── strategies/
│       │       ├── multi-level.strategy.ts
│       │       └── compliance.strategy.ts
│       ├── validation/
│       │   ├── index.ts
│       │   ├── schemas/
│       │   │   ├── norwegian.schemas.ts
│       │   │   └── compliance.schemas.ts
│       │   └── validators/
│       │       ├── norwegian.validator.ts
│       │       └── gdpr.validator.ts
│       ├── query/
│       │   ├── index.ts
│       │   ├── builder/
│       │   │   ├── sql.builder.ts
│       │   │   └── nosql.builder.ts
│       │   └── optimization/
│       │       ├── performance.monitor.ts
│       │       └── query.optimizer.ts
│       └── events/
│           ├── index.ts
│           ├── data.events.ts
│           └── compliance.events.ts
├── tests/
├── docs/
└── config/
```

## 🚀 Usage Examples

### Basic Data Operations

```typescript
import { DataServices } from '@xala-technologies/data-services';
import { Logger, ConfigService } from '@xala-technologies/foundation';

// Initialize data services with foundation
const config = ConfigService.getInstance();
const logger = Logger.createLogger('data-services');
const dataServices = new DataServices(config, logger);

// Norwegian-compliant user repository
const userRepo = dataServices.getRepository('User');

// Create user with NSM classification
const user = await userRepo.create({
  navn: 'Ola Nordmann',
  personnummer: '12345678901',
  epost: 'ola@example.no',
  classification: 'BEGRENSET',
  gdprConsent: true,
});

// Query with compliance filtering
const users = await userRepo.findByTenant(tenantId, {
  classification: 'ÅPEN',
  includePersonalData: false,
});
```

### Event-Driven Data Operations

```typescript
import { EventBus } from '@xala-technologies/foundation';

// Subscribe to business events
EventBus.subscribe('user.registration.requested', async event => {
  // Validate Norwegian personal data
  const validation = await norwegianValidator.validatePersonnummer(event.data.personnummer);

  if (validation.isValid) {
    // Create user with proper classification
    const user = await userRepo.create({
      ...event.data,
      classification: 'BEGRENSET',
      source: 'registration',
    });

    // Publish success event
    EventBus.publish('user.created', {
      userId: user.id,
      classification: user.classification,
      compliance: { gdpr: true, nsm: true },
    });
  } else {
    // Publish validation error
    EventBus.publish('user.validation.failed', {
      errors: validation.errors,
      data: event.data,
    });
  }
});
```

### Norwegian Compliance Operations

```typescript
import { NSMClassifier, GDPRProcessor } from '@xala-technologies/data-services';

// NSM-compliant data handling
const classifiedData = await NSMClassifier.classifyAndStore({
  data: sensitiveDocument,
  classification: 'KONFIDENSIELT',
  handlingInstructions: ['NO_FOREIGN_ACCESS', 'ENCRYPT_AT_REST'],
  retentionPeriod: 'P7Y',
});

// GDPR-compliant data processing
const gdprResult = await GDPRProcessor.processPersonalData({
  data: personalInfo,
  legalBasis: 'consent',
  purpose: 'service_provision',
  retentionPeriod: 'P2Y',
  dataSubject: userId,
});

// Automatic data anonymization
await GDPRProcessor.scheduleAnonymization(userId, {
  retentionExpired: true,
  dataSubjectRequest: false,
});
```

## 🎯 Success Criteria

Data Services package is complete when:

- [ ] Only depends on foundation package
- [ ] All database adapters implemented and tested
- [ ] Event-driven data change notifications working
- [ ] Norwegian compliance validation integrated
- [ ] NSM data classification enforced
- [ ] GDPR data protection implemented
- [ ] 85%+ test coverage achieved
- [ ] Performance monitoring operational
- [ ] Cache invalidation events working
- [ ] Repository patterns support Norwegian entities

## 📈 Next Steps

After data-services completion:

1. Update business-services to use data-services via events
2. Implement norwegian-services with foundation-only dependencies
3. Create web-services API layer using data-services
4. Ensure all services communicate via event bus only
