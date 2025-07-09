# Web Services Package Implementation Checklist

## 📋 Package Overview

**Role**: API Gateway & HTTP Services Layer  
**Dependencies**: ONLY @xala-technologies/foundation  
**Story Points**: 14 points  
**Status**: 📋 PLANNED

### Core Responsibilities

- RESTful API endpoints and GraphQL services
- HTTP request/response handling and validation
- API authentication and authorization
- Rate limiting and API security
- Norwegian API standards compliance
- Multi-tenant API isolation
- Event-driven API orchestration
- Government API interoperability

## 🏗️ Event-Based Architecture

### API Gateway Events

```typescript
import { EventBus } from '@xala-technologies/foundation';

// API request processing through events
EventBus.publish('api.request.received', {
  requestId: 'req-123',
  endpoint: '/api/v1/citizens',
  method: 'POST',
  tenantId: 'trondheim-kommune',
  userId: 'user-456',
  classification: 'BEGRENSET',
  compliance: {
    nsmRequired: true,
    gdprApplicable: true,
    digdirCompliant: true,
  },
});

// API orchestration without direct service dependencies
EventBus.subscribe('business.workflow.completed', async event => {
  // Transform business events to API responses
  const apiResponse = await apiTransformer.transformBusinessEventToResponse({
    workflowId: event.workflowId,
    result: event.result,
    classification: event.classification,
  });

  // Send real-time API updates
  EventBus.publish('api.response.ready', {
    requestId: event.correlationId,
    response: apiResponse,
    statusCode: 200,
    headers: {
      'X-Norwegian-Compliance': 'NSM-BASIC',
      'X-GDPR-Compliant': 'true',
    },
  });
});

// Norwegian government API compliance
EventBus.subscribe('government.service.called', async event => {
  // Log government API usage for compliance
  await apiAuditLogger.logGovernmentAPIUsage({
    apiEndpoint: event.endpoint,
    govService: event.serviceName,
    citizenId: event.personnummer,
    classification: 'KONFIDENSIELT',
    complianceFramework: 'DIGDIR',
  });
});
```

### API Security & Rate Limiting

```typescript
import { ServiceRegistry } from '@xala-technologies/foundation';

// Register API gateway capabilities
ServiceRegistry.register('api-gateway', {
  name: 'WebServicesAPIGateway',
  version: '1.0.0',
  endpoints: ['rest-api', 'graphql-api', 'websocket-api', 'government-api', 'municipal-api'],
  compliance: 'NSM_HIGH',
  capabilities: [
    'authentication',
    'authorization',
    'rate-limiting',
    'request-validation',
    'response-transformation',
    'norwegian-compliance',
  ],
  certifications: ['DIGDIR_APPROVED', 'NSM_CERTIFIED'],
});

// Event-driven rate limiting and security
EventBus.subscribe('api.rate.limit.exceeded', async event => {
  await securityLogger.logRateLimitViolation({
    clientId: event.clientId,
    endpoint: event.endpoint,
    requestCount: event.requestCount,
    timeWindow: event.timeWindow,
    classification: 'ÅPEN',
  });

  // Temporarily block abusive clients
  EventBus.publish('api.client.blocked', {
    clientId: event.clientId,
    reason: 'rate_limit_exceeded',
    duration: 'PT15M', // 15 minutes
    severity: 'MEDIUM',
  });
});
```

## ✅ Implementation Tasks

### Phase 1: Foundation Integration & API Framework (4 points)

- [ ] **Update package dependencies** (1 point)
  - Remove all dependencies except foundation and essential HTTP libraries
  - Update imports to use foundation services only
  - Configure Norwegian API compliance metadata
  - Set up government-grade API security

- [ ] **Implement API service base architecture** (2 points)
  - Create BaseAPIService extending foundation ServiceLifecycle
  - Implement Norwegian API standards compliance
  - Add multi-tenant API isolation
  - Create event-driven API request handling

- [ ] **Set up API event integration** (1 point)
  - Subscribe to foundation event bus for all API events
  - Implement API request/response event publishing
  - Add API audit logging for Norwegian compliance
  - Create API error handling events

### Phase 2: RESTful API Implementation (4 points)

- [ ] **REST API framework setup** (2 points)
  - Implement Express.js or Fastify with foundation integration
  - Create OpenAPI 3.0 specification generator
  - Add Norwegian API documentation standards
  - Implement API versioning strategy
  - File: `src/modules/rest/rest-api.service.ts`

- [ ] **API endpoint implementation** (2 points)
  - Create citizen management API endpoints
  - Implement municipal service APIs
  - Add Norwegian government integration endpoints
  - Create multi-tenant API routing
  - File: `src/modules/rest/endpoints/`

### Phase 3: API Security & Compliance (3 points)

- [ ] **Authentication & authorization middleware** (2 points)
  - Implement JWT token validation
  - Add Norwegian ID-porten integration
  - Create role-based access control
  - Implement API key management
  - File: `src/modules/security/auth.middleware.ts`

- [ ] **Norwegian API compliance middleware** (1 point)
  - Implement NSM security headers
  - Add GDPR compliance headers
  - Create DigDir API standards validation
  - Implement government audit logging
  - File: `src/modules/compliance/norwegian-api.middleware.ts`

### Phase 4: Advanced API Features (3 points)

- [ ] **GraphQL API implementation** (1 point)
  - Create GraphQL schema for Norwegian entities
  - Implement resolver functions with event integration
  - Add GraphQL security and compliance
  - Create real-time subscriptions
  - File: `src/modules/graphql/graphql.service.ts`

- [ ] **WebSocket real-time API** (1 point)
  - Implement WebSocket server with foundation integration
  - Create real-time municipal service updates
  - Add Norwegian compliance for real-time data
  - Implement connection authentication
  - File: `src/modules/websocket/websocket.service.ts`

- [ ] **API monitoring & analytics** (1 point)
  - Implement API performance monitoring
  - Add Norwegian compliance metrics
  - Create API usage analytics
  - Implement health check endpoints
  - File: `src/modules/monitoring/api-monitoring.service.ts`

## 🇳🇴 Norwegian API Compliance Requirements

### DigDir API Standards

- [ ] **Government API Interoperability** (MANDATORY)

  ```typescript
  interface DigDirAPICompliance {
    apiVersion: string;
    openApiSpecification: string; // OpenAPI 3.0
    authentication: 'ID_PORTEN' | 'MASKINPORTEN' | 'API_KEY';
    serviceRegistration: {
      serviceCode: string;
      serviceEdition: string;
      catalogUrl: string;
    };
    interoperability: {
      level: 'basic' | 'substantial' | 'high';
      semanticStandards: string[];
      technicalStandards: string[];
    };
    accessibility: {
      wcagCompliance: 'WCAG_2_2_AA';
      universalDesign: boolean;
      multiLanguageSupport: ('nb' | 'nn' | 'en')[];
    };
  }

  // All government APIs must be registered with DigDir
  async function registerAPIWithDigDir(api: APIDefinition): Promise<void> {
    await digdirRegistry.registerService({
      apiDefinition: api,
      complianceLevel: 'SUBSTANTIAL',
      securityLevel: 'NSM_BASIC',
    });
  }
  ```

### NSM API Security

- [ ] **API Security Classifications** (MANDATORY)

  ```typescript
  interface NSMAPISecurityHeaders {
    'X-NSM-Classification': NSMClassification;
    'X-Security-Level': 'BASIC' | 'SUBSTANTIAL' | 'HIGH';
    'X-Audit-Required': 'true' | 'false';
    'X-Encryption-Required': 'true' | 'false';
    'X-Access-Restrictions': string[];
  }

  // All API responses must include NSM security headers
  function addNSMSecurityHeaders(
    response: APIResponse,
    classification: NSMClassification
  ): APIResponse {
    response.headers = {
      ...response.headers,
      'X-NSM-Classification': classification,
      'X-Security-Level': getNSMSecurityLevel(classification),
      'X-Audit-Required': classification !== 'ÅPEN' ? 'true' : 'false',
    };
    return response;
  }
  ```

### GDPR API Compliance

- [ ] **Personal Data API Protection** (MANDATORY)

  ```typescript
  interface GDPRAPIHeaders {
    'X-GDPR-Applicable': 'true' | 'false';
    'X-Data-Categories': string[];
    'X-Legal-Basis': 'consent' | 'contract' | 'public_task';
    'X-Retention-Period': string; // ISO 8601 duration
    'X-Data-Subject-Rights': string[];
  }

  interface PersonalDataAPIEndpoint {
    endpoint: string;
    method: HTTPMethod;
    personalDataFields: string[];
    legalBasis: GDPRLegalBasis;
    retentionPeriod: string;
    dataSubjectRights: DataSubjectRight[];
    minimizationApplied: boolean;
  }
  ```

## 🧪 Testing Requirements

### Unit Tests (MANDATORY - 85% coverage)

- [ ] **API Endpoint Tests**
  - Test all REST API endpoints
  - Test GraphQL resolvers
  - Test WebSocket connections
  - Test Norwegian compliance validation

- [ ] **Security Middleware Tests**
  - Test authentication flows
  - Test authorization checks
  - Test rate limiting
  - Test Norwegian security headers

- [ ] **API Validation Tests**
  - Test request validation
  - Test response formatting
  - Test error handling
  - Test Norwegian field validation

- [ ] **Compliance Tests**
  - Test NSM security classification
  - Test GDPR data protection
  - Test DigDir API standards
  - Test government API integration

### Integration Tests

- [ ] **Event-Driven API Integration**
  - Test complete API workflows via events
  - Test cross-service API coordination
  - Test Norwegian government API integration
  - Test real-time API updates

- [ ] **Government API Integration**
  - Test ID-porten authentication
  - Test Altinn authorization
  - Test government service APIs
  - Test compliance event flows

### Performance Tests

- [ ] **API Performance**
  - Test API response times
  - Test concurrent request handling
  - Test rate limiting effectiveness
  - Test Norwegian compliance overhead

## 📁 File Structure

```
packages-v2/web-services/
├── package.json (foundation + minimal HTTP deps)
├── src/
│   ├── index.ts
│   └── modules/
│       ├── index.ts
│       ├── rest/
│       │   ├── index.ts
│       │   ├── interfaces/
│       │   │   ├── rest-api.interface.ts
│       │   │   └── endpoint.interface.ts
│       │   ├── services/
│       │   │   ├── rest-api.service.ts
│       │   │   ├── router.service.ts
│       │   │   └── openapi.service.ts
│       │   ├── endpoints/
│       │   │   ├── citizens/
│       │   │   │   ├── citizens.controller.ts
│       │   │   │   └── citizens.routes.ts
│       │   │   ├── organizations/
│       │   │   │   ├── organizations.controller.ts
│       │   │   │   └── organizations.routes.ts
│       │   │   ├── services/
│       │   │   │   ├── municipal-services.controller.ts
│       │   │   │   └── municipal-services.routes.ts
│       │   │   └── government/
│       │   │       ├── government-api.controller.ts
│       │   │       └── government-api.routes.ts
│       │   ├── middleware/
│       │   │   ├── validation.middleware.ts
│       │   │   ├── response.middleware.ts
│       │   │   └── error.middleware.ts
│       │   └── types/
│       │       ├── rest.types.ts
│       │       └── endpoint.types.ts
│       ├── graphql/
│       │   ├── index.ts
│       │   ├── interfaces/
│       │   │   └── graphql.interface.ts
│       │   ├── services/
│       │   │   ├── graphql.service.ts
│       │   │   └── schema.service.ts
│       │   ├── resolvers/
│       │   │   ├── citizen.resolver.ts
│       │   │   ├── organization.resolver.ts
│       │   │   └── service.resolver.ts
│       │   ├── schemas/
│       │   │   ├── citizen.schema.ts
│       │   │   ├── organization.schema.ts
│       │   │   └── service.schema.ts
│       │   └── types/
│       │       └── graphql.types.ts
│       ├── websocket/
│       │   ├── index.ts
│       │   ├── interfaces/
│       │   │   └── websocket.interface.ts
│       │   ├── services/
│       │   │   ├── websocket.service.ts
│       │   │   └── connection.service.ts
│       │   ├── handlers/
│       │   │   ├── realtime.handler.ts
│       │   │   └── notification.handler.ts
│       │   └── types/
│       │       └── websocket.types.ts
│       ├── security/
│       │   ├── index.ts
│       │   ├── interfaces/
│       │   │   ├── auth.interface.ts
│       │   │   └── security.interface.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── rate-limit.middleware.ts
│       │   │   └── security-headers.middleware.ts
│       │   ├── services/
│       │   │   ├── jwt.service.ts
│       │   │   ├── api-key.service.ts
│       │   │   └── rbac.service.ts
│       │   └── types/
│       │       ├── auth.types.ts
│       │       └── security.types.ts
│       ├── compliance/
│       │   ├── index.ts
│       │   ├── middleware/
│       │   │   ├── norwegian-api.middleware.ts
│       │   │   ├── nsm-headers.middleware.ts
│       │   │   └── gdpr-headers.middleware.ts
│       │   ├── services/
│       │   │   ├── digdir-compliance.service.ts
│       │   │   ├── api-audit.service.ts
│       │   │   └── government-integration.service.ts
│       │   └── types/
│       │       ├── compliance.types.ts
│       │       └── audit.types.ts
│       ├── monitoring/
│       │   ├── index.ts
│       │   ├── services/
│       │   │   ├── api-monitoring.service.ts
│       │   │   ├── health-check.service.ts
│       │   │   └── metrics.service.ts
│       │   └── types/
│       │       └── monitoring.types.ts
│       └── events/
│           ├── index.ts
│           ├── api.events.ts
│           ├── security.events.ts
│           └── compliance.events.ts
├── tests/
├── docs/
├── config/
└── openapi/ (API specifications)
```

## 🚀 Usage Examples

### RESTful API with Norwegian Compliance

```typescript
import { WebServicesAPI } from '@xala-technologies/web-services';
import { EventBus, Logger } from '@xala-technologies/foundation';

const api = new WebServicesAPI();

// Norwegian citizen API endpoint
api.post(
  '/api/v1/borgere',
  {
    authentication: 'ID_PORTEN',
    authorization: ['CITIZEN_MANAGEMENT'],
    validation: 'norwegian_citizen_schema',
    compliance: {
      nsm: 'BEGRENSET',
      gdpr: true,
      digdir: 'SUBSTANTIAL',
    },
  },
  async (request, response) => {
    // Event-driven processing (no direct service calls)
    EventBus.publish('api.citizen.create.requested', {
      requestId: request.id,
      citizenData: request.body,
      requesterPersonnummer: request.user.personnummer,
      classification: 'BEGRENSET',
    });

    // Wait for business processing via events
    const result = await EventBus.waitForEvent(
      'business.citizen.created',
      { correlationId: request.id },
      { timeout: 30000 }
    );

    response.json({
      success: true,
      citizen: result.citizen,
      complianceHeaders: {
        'X-NSM-Classification': 'BEGRENSET',
        'X-GDPR-Compliant': 'true',
        'X-DigDir-Level': 'SUBSTANTIAL',
      },
    });
  }
);
```

### GraphQL Norwegian Municipal Services

```typescript
import { GraphQLAPI } from '@xala-technologies/web-services';

const graphqlAPI = new GraphQLAPI();

// Norwegian municipal service GraphQL schema
const typeDefs = `
  type Borger {
    personnummer: String!
    navn: String!
    adresse: NorskAdresse!
    kommune: Kommune!
    tjenester: [KommunalTjeneste!]!
  }
  
  type Kommune {
    kommunenummer: String!
    navn: String!
    fylke: String!
    kontaktinfo: Kontaktinfo!
  }
  
  type KommunalTjeneste {
    tjenestekode: String!
    navn: String!
    beskrivelse: String!
    status: TjenesteStatus!
    søknadsfrist: Date
  }
  
  type Query {
    borger(personnummer: String!): Borger
    kommunaleTjenester(kommunenummer: String!): [KommunalTjeneste!]!
  }
`;

// Event-driven GraphQL resolvers
const resolvers = {
  Query: {
    borger: async (_, { personnummer }, context) => {
      // Trigger data retrieval via events
      EventBus.publish('api.citizen.lookup.requested', {
        personnummer,
        requesterId: context.user.id,
        classification: 'BEGRENSET',
      });

      return await EventBus.waitForEvent('data.citizen.retrieved', {
        personnummer,
      });
    },
  },
};
```

### Norwegian Government API Integration

```typescript
import { GovernmentAPIService } from '@xala-technologies/web-services';

const govAPI = new GovernmentAPIService();

// ID-porten callback endpoint
govAPI.get(
  '/api/auth/idporten/callback',
  {
    compliance: {
      nsm: 'KONFIDENSIELT',
      digdir: 'HIGH',
    },
  },
  async (request, response) => {
    // Process ID-porten authentication via events
    EventBus.publish('government.idporten.callback.received', {
      code: request.query.code,
      state: request.query.state,
      sessionId: request.sessionID,
      classification: 'KONFIDENSIELT',
    });

    const authResult = await EventBus.waitForEvent('norwegian.citizen.authenticated', {
      sessionId: request.sessionID,
    });

    if (authResult.success) {
      response.redirect('/dashboard');
    } else {
      response.status(401).json({
        error: 'Authentication failed',
        complianceNote: 'Failed authentication logged per NSM requirements',
      });
    }
  }
);

// Altinn business authorization endpoint
govAPI.get(
  '/api/auth/altinn/authorize/:orgnr',
  {
    authentication: 'ID_PORTEN',
    compliance: {
      nsm: 'BEGRENSET',
      gdpr: true,
    },
  },
  async (request, response) => {
    EventBus.publish('government.altinn.authorization.requested', {
      personnummer: request.user.personnummer,
      organizationNumber: request.params.orgnr,
      requestedRoles: request.query.roles,
      classification: 'BEGRENSET',
    });

    const authResult = await EventBus.waitForEvent('altinn.authorization.completed', {
      personnummer: request.user.personnummer,
      organizationNumber: request.params.orgnr,
    });

    response.json({
      authorized: authResult.granted,
      roles: authResult.roles,
      complianceHeaders: {
        'X-NSM-Classification': 'BEGRENSET',
        'X-Altinn-Validated': 'true',
      },
    });
  }
);
```

## 🎯 Success Criteria

Web Services package is complete when:

- [ ] Only depends on foundation package (+ minimal HTTP libraries)
- [ ] RESTful API endpoints fully implemented
- [ ] GraphQL API operational with Norwegian schema
- [ ] WebSocket real-time services working
- [ ] Event-driven API orchestration functional
- [ ] Norwegian API compliance validated (NSM, GDPR, DigDir)
- [ ] Government API integration complete
- [ ] Multi-tenant API isolation working
- [ ] 85%+ test coverage achieved
- [ ] API monitoring and analytics operational

## 📈 Next Steps

After web-services completion:

1. Integrate with ui-system for frontend API consumption
2. Connect with monitoring-services for API performance tracking
3. Link with authentication package for unified auth flows
4. Ensure all API events flow to audit and compliance systems
5. Test complete citizen and municipal API user journeys
