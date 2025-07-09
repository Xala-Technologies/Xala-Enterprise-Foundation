# Foundation Architecture Overview

## Introduction

The Foundation Package implements a modular, event-driven architecture specifically designed for Norwegian government applications. The architecture balances flexibility, security, and compliance requirements while maintaining clean separation of concerns and enabling scalable enterprise deployments.

## Architectural Principles

### 1. Hub-and-Spoke Pattern

The foundation follows a hub-and-spoke architectural pattern where:

- **Hub**: Core foundation services (config, logger, events)
- **Spokes**: Specialized modules (feature-toggle, metrics, healthcheck, etc.)
- **Benefits**: Clear dependency management, independent module evolution, simplified testing

### 2. Norwegian Compliance by Design

Every architectural decision considers Norwegian government requirements:

- **NSM Security Classifications**: Built-in support for ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG
- **GDPR Compliance**: Personal data processing with audit trails and retention policies
- **DigDir Standards**: Interoperability, accessibility (WCAG 2.2 AA), Norwegian language support

### 3. Event-Driven Architecture

- **Loose Coupling**: Modules communicate through events rather than direct dependencies
- **Scalability**: Easy to add new modules without modifying existing ones
- **Audit Trail**: All significant actions generate auditable events
- **Compliance**: Events carry classification metadata for proper handling

## Core Modules Architecture

### Configuration Layer (config-loader)

```
ConfigLoader
├── EnvironmentProvider
├── SecretManager (NSM-compliant)
├── ComplianceValidator
└── CacheManager
```

**Design Decisions**:

- Environment-specific configuration with secure secret management
- Built-in validation for Norwegian compliance requirements
- Caching layer for performance with security considerations
- Support for municipality-specific configurations

### Logging System (logger)

```
LoggerService
├── PinoOutputProvider (structured logging)
├── ContextProcessor (correlation IDs)
├── ComplianceFormatter (NSM classification)
└── AuditTrailManager (GDPR compliance)
```

**Design Decisions**:

- Structured JSON logging for government audit requirements
- Context correlation for distributed systems tracing
- Classification-aware formatting for security compliance
- Automatic audit trail generation for sensitive operations

### Event System (event-core)

```
EventCore
├── EventBus (pub/sub messaging)
├── EventStore (audit persistence)
├── ComplianceEventProcessor
└── SecurityClassificationManager
```

**Design Decisions**:

- Pub/sub pattern for loose coupling between modules
- Event store for compliance audit trails and event sourcing
- Classification metadata on all events for proper security handling
- Encryption support for KONFIDENSIELT and HEMMELIG events

### Feature Management (feature-toggle)

```
FeatureToggle
├── FeatureEvaluator
├── TargetingEngine (municipal/user)
├── ComplianceGate
└── AuditLogger
```

**Design Decisions**:

- Gradual rollout capabilities for risk management
- Municipality-specific targeting for local government needs
- Compliance gates to prevent unauthorized feature access
- Comprehensive audit logging for feature usage tracking

## Security Architecture

### NSM Classification Handling

```
SecurityClassification
├── ÅPEN (Public)
├── BEGRENSET (Restricted)
├── KONFIDENSIELT (Confidential)
└── HEMMELIG (Secret)
```

**Security Controls**:

- **Access Control**: Role-based permissions for each classification level
- **Encryption**: AES-256-GCM for KONFIDENSIELT and HEMMELIG data
- **Audit Requirements**: Enhanced logging for classified information
- **Network Security**: TLS 1.3 minimum for all classified data transmission

### GDPR Compliance Architecture

```
GDPRCompliance
├── DataSubjectManager
├── ConsentManager
├── RetentionPolicyEngine
└── DataProcessingRecorder
```

**Privacy Controls**:

- **Legal Basis Tracking**: Documentation of processing justification
- **Consent Management**: Granular consent with withdrawal capabilities
- **Data Minimization**: Automatic PII detection and classification
- **Right to Erasure**: Systematic data deletion capabilities

## Module Interaction Patterns

### 1. Configuration-First Pattern

All modules receive configuration through the config-loader:

```typescript
// Module initialization pattern
const moduleConfig = await configLoader.getModuleConfig('feature-toggle');
const featureToggle = new FeatureToggleService(moduleConfig);
```

### 2. Event-Driven Communication

Modules communicate through events rather than direct calls:

```typescript
// Event publication pattern
await eventCore.publish('citizen.registered', {
  citizenId: 'NO-12345678901',
  municipality: '0301', // Oslo
  classification: 'KONFIDENSIELT',
});
```

### 3. Compliance-Aware Operations

All operations carry compliance metadata:

```typescript
// Compliance context pattern
const context = {
  userId: 'user-123',
  municipalityCode: '0301',
  classification: 'BEGRENSET',
  legalBasis: 'public_task',
};
```

## Deployment Architecture

### Local Development

```
Foundation Package
├── In-Memory Event Store
├── File-based Configuration
├── Console Logging
└── Mock External Services
```

### Municipal Deployment

```
Municipal Environment
├── PostgreSQL Event Store
├── Azure Key Vault Configuration
├── Structured JSON Logging
└── DigDir Service Integration
```

### National Deployment

```
National Environment
├── Distributed Event Store
├── HSM-backed Secret Management
├── SIEM Integration
└── Multi-Municipal Routing
```

## Performance Considerations

### Scalability Patterns

- **Horizontal Scaling**: Stateless module design enables load balancing
- **Event Batching**: Bulk event processing for high-throughput scenarios
- **Caching Strategy**: Multi-layer caching with security-aware TTLs
- **Resource Pooling**: Connection pooling for database and external services

### Monitoring Integration

- **Health Checks**: Comprehensive health monitoring for all modules
- **Metrics Collection**: Performance and business metrics with privacy protection
- **Alert Management**: Classification-aware alerting for security incidents
- **Compliance Reporting**: Automated generation of compliance status reports

## Technology Stack Rationale

### TypeScript

- **Type Safety**: Compile-time validation reduces runtime errors
- **Norwegian Standards**: Strong typing supports DigDir interoperability requirements
- **Developer Experience**: Enhanced IDE support and code quality
- **Enterprise Adoption**: Widespread use in Norwegian government projects

### Pino Logging

- **Performance**: High-performance structured logging for government scale
- **JSON Format**: Machine-readable logs for compliance automation
- **Security**: Built-in sanitization for sensitive data handling
- **Ecosystem**: Rich ecosystem for log processing and analysis

### Event-Driven Design

- **Compliance**: Natural audit trail generation through events
- **Scalability**: Horizontal scaling through message queuing
- **Resilience**: Fault tolerance through event replay capabilities
- **Integration**: Easy integration with external government systems

## Future Architecture Evolution

### Phase 1: Core Stabilization

- Comprehensive integration testing across all modules
- Performance optimization based on real-world usage patterns
- Security audit and penetration testing for government certification

### Phase 2: Advanced Features

- Event sourcing implementation for complete audit trails
- Multi-tenancy support for shared municipal services
- Advanced analytics and ML integration for predictive compliance

### Phase 3: Ecosystem Integration

- Native DigDir service integration
- Altinn and ID-porten authentication adapters
- Real-time compliance monitoring and automated reporting

## Architectural Decision Records

### ADR-001: Event-Driven Architecture Choice

**Decision**: Implement event-driven architecture for module communication
**Rationale**: Government applications require comprehensive audit trails and loose coupling for system evolution
**Consequences**: Increased complexity but improved compliance and scalability

### ADR-002: TypeScript for Implementation

**Decision**: Use TypeScript for all module implementations
**Rationale**: Type safety reduces errors in government-critical applications and supports DigDir interoperability standards
**Consequences**: Additional build complexity but improved code quality and maintainability

### ADR-003: Modular Package Design

**Decision**: Implement as a single package with multiple modules rather than separate packages
**Rationale**: Simplifies dependency management and ensures consistent compliance implementations
**Consequences**: Larger package size but reduced integration complexity

### ADR-004: NSM Classification Integration

**Decision**: Build security classifications into the core architecture
**Rationale**: Norwegian government applications must handle classified information according to NSM standards
**Consequences**: Additional complexity but enables government deployment certification
