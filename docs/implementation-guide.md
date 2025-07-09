# Implementation Guide

This guide provides step-by-step instructions for implementing the foundation package in Norwegian government applications. It covers architecture planning, integration patterns, and production deployment considerations.

## Project Planning

### Architecture Assessment

Before implementing the foundation package, assess your project requirements:

#### 1. Compliance Requirements Assessment

```typescript
// Create a compliance requirements matrix
interface ComplianceRequirements {
  nsm: {
    classificationLevel: NSMSecurityClassification;
    auditingRequired: boolean;
    crossBorderRestrictions: boolean;
  };
  gdpr: {
    personalDataProcessing: boolean;
    consentManagement: boolean;
    dataSubjectRights: boolean;
  };
  digdir: {
    serviceRegistration: boolean;
    accessibilityLevel: 'WCAG_2_1_AA' | 'WCAG_2_2_AA';
    norwegianLanguageRequirement: boolean;
  };
}

// Example assessment for a municipal service
const municipalServiceRequirements: ComplianceRequirements = {
  nsm: {
    classificationLevel: 'BEGRENSET',
    auditingRequired: true,
    crossBorderRestrictions: true,
  },
  gdpr: {
    personalDataProcessing: true,
    consentManagement: false, // Public sector - legal basis
    dataSubjectRights: true,
  },
  digdir: {
    serviceRegistration: true,
    accessibilityLevel: 'WCAG_2_2_AA',
    norwegianLanguageRequirement: true,
  },
};
```

#### 2. System Architecture Planning

Define your system's hub-and-spoke architecture:

```typescript
// Define service boundaries and communication patterns
interface SystemArchitecture {
  services: ServiceDefinition[];
  communicationPatterns: CommunicationPattern[];
  dataFlows: DataFlow[];
  complianceBoundaries: ComplianceBoundary[];
}

interface ServiceDefinition {
  name: string;
  type: 'web' | 'api' | 'background' | 'data';
  nsmClassification: NSMSecurityClassification;
  personalDataHandling: boolean;
  eventPatterns: string[];
}

// Example municipal architecture
const municipalArchitecture: SystemArchitecture = {
  services: [
    {
      name: 'citizen-portal',
      type: 'web',
      nsmClassification: 'BEGRENSET',
      personalDataHandling: true,
      eventPatterns: ['citizen.*', 'service.*'],
    },
    {
      name: 'case-management',
      type: 'api',
      nsmClassification: 'BEGRENSET',
      personalDataHandling: true,
      eventPatterns: ['case.*', 'decision.*'],
    },
    {
      name: 'document-archive',
      type: 'data',
      nsmClassification: 'KONFIDENSIELT',
      personalDataHandling: true,
      eventPatterns: ['document.*', 'archive.*'],
    },
  ],
  // Additional configuration...
};
```

## Implementation Phases

### Phase 1: Foundation Setup

#### Step 1: Project Initialization

```bash
# Create new project or navigate to existing project
mkdir norwegian-government-app
cd norwegian-government-app

# Initialize with pnpm
pnpm init

# Add foundation package
pnpm add @xala-technologies/foundation

# Add development dependencies
pnpm add -D typescript @types/node jest ts-jest eslint
```

#### Step 2: TypeScript Configuration

Create `tsconfig.json` with Norwegian government compliance in mind:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### Step 3: Environment Configuration

Create environment configuration with Norwegian compliance defaults:

```typescript
// src/config/environment.ts
import { z } from 'zod';

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  // Service configuration
  SERVICE_NAME: z.string().default('norwegian-service'),
  SERVICE_VERSION: z.string().default('1.0.0'),
  PORT: z.coerce.number().default(3000),

  // Norwegian compliance
  NSM_CLASSIFICATION: z
    .enum(['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'])
    .default('BEGRENSET'),
  GDPR_ENABLED: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  AUDIT_LOGGING: z
    .string()
    .transform(val => val === 'true')
    .default('true'),

  // Security
  ENCRYPTION_KEY: z.string().min(32),
  SESSION_SECRET: z.string().min(32),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_SSL: z
    .string()
    .transform(val => val === 'true')
    .default('true'),

  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),

  // External services
  ID_PORTEN_CLIENT_ID: z.string().optional(),
  ID_PORTEN_CLIENT_SECRET: z.string().optional(),
  ALTINN_API_KEY: z.string().optional(),
});

export const env = environmentSchema.parse(process.env);
export type Environment = z.infer<typeof environmentSchema>;
```

#### Step 4: Foundation Service Initialization

```typescript
// src/services/foundation.service.ts
import {
  ConfigService,
  EventBus,
  ServiceRegistry,
  logger,
  defaultNorwegianCompliance,
} from '@xala-technologies/foundation';
import { env } from '../config/environment';

export class FoundationService {
  private static instance: FoundationService;
  private configService: ConfigService;
  private eventBus: EventBus;
  private serviceRegistry: ServiceRegistry;

  private constructor() {
    this.initializeFoundation();
  }

  static getInstance(): FoundationService {
    if (!FoundationService.instance) {
      FoundationService.instance = new FoundationService();
    }
    return FoundationService.instance;
  }

  private initializeFoundation() {
    // Initialize configuration with Norwegian compliance
    this.configService = new ConfigService({
      environment: env.NODE_ENV,
      norwegianCompliance: {
        ...defaultNorwegianCompliance,
        nsm: {
          ...defaultNorwegianCompliance.nsm,
          securityClassification: env.NSM_CLASSIFICATION,
          auditLogging: env.AUDIT_LOGGING,
        },
        gdpr: {
          ...defaultNorwegianCompliance.gdpr,
          dataMinimization: true,
          consentManagement: env.NODE_ENV === 'production',
          auditLogging: env.AUDIT_LOGGING,
        },
      },
    });

    // Initialize event bus
    this.eventBus = EventBus.getInstance();
    this.setupEventHandlers();

    // Initialize service registry
    this.serviceRegistry = ServiceRegistry.getInstance();

    logger.info('Foundation services initialized', {
      serviceName: env.SERVICE_NAME,
      environment: env.NODE_ENV,
      nsmClassification: env.NSM_CLASSIFICATION,
      gdprEnabled: env.GDPR_ENABLED,
      classification: env.NSM_CLASSIFICATION,
    });
  }

  private setupEventHandlers() {
    // Global error handling
    this.eventBus.onError((error, event) => {
      logger.error('Event processing failed', {
        error: error.message,
        eventId: event.eventId,
        eventType: event.eventType,
        stack: error.stack,
      });
    });

    // Compliance monitoring
    this.eventBus.subscribe('*.compliance.*', async event => {
      logger.audit({
        action: 'COMPLIANCE_EVENT',
        entityType: 'event',
        entityId: event.eventId,
        compliance: {
          securityClassification: env.NSM_CLASSIFICATION,
          gdprBasis: 'public_task',
        },
        metadata: {
          eventType: event.eventType,
          complianceContext: event.data,
        },
      });
    });
  }

  async registerService() {
    await this.serviceRegistry.register({
      name: env.SERVICE_NAME,
      version: env.SERVICE_VERSION,
      endpoints: [`http://localhost:${env.PORT}/api`],
      healthCheck: `http://localhost:${env.PORT}/health`,
      compliance: {
        nsmClassification: env.NSM_CLASSIFICATION,
        gdprCompliant: env.GDPR_ENABLED,
        digdirRegistered: env.NODE_ENV === 'production',
      },
      metadata: {
        environment: env.NODE_ENV,
        capabilities: ['citizen_services', 'norwegian_compliance', 'audit_logging'],
      },
    });

    logger.info('Service registered', {
      serviceName: env.SERVICE_NAME,
      classification: env.NSM_CLASSIFICATION,
    });
  }

  getConfigService(): ConfigService {
    return this.configService;
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getServiceRegistry(): ServiceRegistry {
    return this.serviceRegistry;
  }
}
```

### Phase 2: Core Implementation

#### Step 1: Application Bootstrap

```typescript
// src/app.ts
import { FoundationService } from './services/foundation.service';
import { logger } from '@xala-technologies/foundation';
import { env } from './config/environment';

export class Application {
  private foundation: FoundationService;

  constructor() {
    this.foundation = FoundationService.getInstance();
  }

  async start() {
    try {
      // Register service with discovery
      await this.foundation.registerService();

      // Initialize application modules
      await this.initializeModules();

      // Start health monitoring
      await this.startHealthMonitoring();

      logger.info('Application started successfully', {
        serviceName: env.SERVICE_NAME,
        version: env.SERVICE_VERSION,
        port: env.PORT,
        classification: env.NSM_CLASSIFICATION,
      });
    } catch (error) {
      logger.error('Application startup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      process.exit(1);
    }
  }

  private async initializeModules() {
    // Initialize your application-specific modules here
    // Example: database connections, external service clients, etc.
  }

  private async startHealthMonitoring() {
    const serviceRegistry = this.foundation.getServiceRegistry();
    await serviceRegistry.startHealthMonitoring({
      checkInterval: 30000,
      timeout: 5000,
      retryAttempts: 3,
      onHealthChange: (service, status) => {
        logger.info('Service health changed', {
          serviceName: service.name,
          previousStatus: status.previous,
          currentStatus: status.current,
          classification: env.NSM_CLASSIFICATION,
        });
      },
    });
  }

  async stop() {
    logger.info('Application shutting down', {
      serviceName: env.SERVICE_NAME,
    });

    // Graceful shutdown logic here
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  const app = new Application();
  await app.stop();
});

process.on('SIGINT', async () => {
  const app = new Application();
  await app.stop();
});
```

#### Step 2: Business Logic Integration

```typescript
// src/services/citizen.service.ts
import {
  EventBus,
  NorwegianComplianceEvents,
  logger,
  EncryptionService,
} from '@xala-technologies/foundation';
import { env } from '../config/environment';

export class CitizenService {
  private eventBus: EventBus;
  private encryption: EncryptionService;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.encryption = EncryptionService.getInstance();
  }

  async getCitizenData(citizenId: string, requestedBy: string, purpose: string) {
    // Validate access permissions
    await this.validateAccess(requestedBy, purpose);

    // Create GDPR data processing event
    const gdprEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
      'citizen.data.accessed',
      {
        citizenId,
        requestedBy,
        purpose,
        accessTimestamp: new Date(),
      },
      ['personal_data', 'contact_data'],
      'public_task'
    );

    await this.eventBus.publish(gdprEvent);

    // Retrieve and encrypt sensitive data
    const citizenData = await this.retrieveCitizenData(citizenId);

    // Log the access for audit
    logger.audit({
      action: 'READ',
      entityType: 'citizen_data',
      entityId: citizenId,
      userId: requestedBy,
      compliance: {
        securityClassification: env.NSM_CLASSIFICATION,
        gdprBasis: 'public_task',
        personalDataIncluded: true,
      },
      metadata: {
        purpose,
        dataCategories: ['personal_data', 'contact_data'],
      },
    });

    return this.sanitizeDataForPurpose(citizenData, purpose);
  }

  async updateCitizenData(citizenId: string, updates: any, updatedBy: string) {
    // Validate update permissions
    await this.validateUpdateAccess(updatedBy);

    // Encrypt sensitive updates
    const encryptedUpdates = await this.encryption.encrypt(
      JSON.stringify(updates),
      env.ENCRYPTION_KEY,
      env.NSM_CLASSIFICATION
    );

    // Create update event
    const updateEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
      'citizen.data.updated',
      {
        citizenId,
        updatedBy,
        updateCategories: Object.keys(updates),
        updateTimestamp: new Date(),
      },
      this.getDataCategories(updates),
      'public_task'
    );

    await this.eventBus.publish(updateEvent);

    // Perform update
    const result = await this.performUpdate(citizenId, encryptedUpdates);

    // Log the update
    logger.audit({
      action: 'UPDATE',
      entityType: 'citizen_data',
      entityId: citizenId,
      userId: updatedBy,
      compliance: {
        securityClassification: env.NSM_CLASSIFICATION,
        gdprBasis: 'public_task',
        personalDataIncluded: true,
      },
      metadata: {
        updateCategories: Object.keys(updates),
        changeCount: Object.keys(updates).length,
      },
    });

    return result;
  }

  private async validateAccess(userId: string, purpose: string): Promise<void> {
    // Implement access control logic
    // Throw error if access denied
  }

  private async validateUpdateAccess(userId: string): Promise<void> {
    // Implement update access control logic
  }

  private async retrieveCitizenData(citizenId: string): Promise<any> {
    // Implement data retrieval logic
    return {};
  }

  private sanitizeDataForPurpose(data: any, purpose: string): any {
    // Implement data minimization based on purpose
    return data;
  }

  private async performUpdate(citizenId: string, encryptedUpdates: string): Promise<any> {
    // Implement update logic
    return {};
  }

  private getDataCategories(updates: any): string[] {
    // Determine GDPR data categories based on update fields
    return ['personal_data'];
  }
}
```

### Phase 3: API Layer Implementation

#### Step 1: Express.js Integration

```typescript
// src/api/server.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { EventBus, NorwegianComplianceEvents, logger } from '@xala-technologies/foundation';
import { env } from '../config/environment';
import { citizenRoutes } from './routes/citizen.routes';
import { healthRoutes } from './routes/health.routes';

export class APIServer {
  private app: express.Application;
  private eventBus: EventBus;

  constructor() {
    this.app = express();
    this.eventBus = EventBus.getInstance();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware() {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        },
      })
    );

    // CORS for Norwegian government domains
    this.app.use(
      cors({
        origin: (origin, callback) => {
          const allowedOrigins = [/\.kommune\.no$/, /\.regjeringen\.no$/, /\.norge\.no$/];

          if (!origin || allowedOrigins.some(pattern => pattern.test(origin))) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
      })
    );

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;

        logger.info('HTTP Request', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          classification: env.NSM_CLASSIFICATION,
        });
      });

      next();
    });
  }

  private setupRoutes() {
    this.app.use('/api/health', healthRoutes);
    this.app.use('/api/citizens', citizenRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Resource not found',
        message: 'The requested resource was not found on this server',
      });
    });
  }

  private setupErrorHandling() {
    this.app.use(
      (error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        logger.error('API Error', {
          error: error.message,
          stack: error.stack,
          method: req.method,
          url: req.url,
          classification: env.NSM_CLASSIFICATION,
        });

        // Create error event for monitoring
        this.eventBus.publish({
          eventId: `error_${Date.now()}`,
          eventType: 'api.error.occurred',
          timestamp: new Date(),
          data: {
            error: error.message,
            method: req.method,
            url: req.url,
            statusCode: 500,
          },
        });

        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
      }
    );
  }

  start(): void {
    this.app.listen(env.PORT, () => {
      logger.info('API Server started', {
        port: env.PORT,
        environment: env.NODE_ENV,
        serviceName: env.SERVICE_NAME,
        classification: env.NSM_CLASSIFICATION,
      });
    });
  }

  getApp(): express.Application {
    return this.app;
  }
}
```

#### Step 2: Route Implementation

```typescript
// src/api/routes/citizen.routes.ts
import { Router, Request, Response } from 'express';
import { CitizenService } from '../../services/citizen.service';
import { logger } from '@xala-technologies/foundation';
import { authenticateUser, validatePermissions } from '../middleware/auth';

export const citizenRoutes = Router();
const citizenService = new CitizenService();

// Get citizen data
citizenRoutes.get(
  '/:citizenId',
  authenticateUser,
  validatePermissions(['read_citizen_data']),
  async (req: Request, res: Response) => {
    try {
      const { citizenId } = req.params;
      const { purpose } = req.query;
      const requestedBy = req.user.id;

      if (!purpose) {
        return res.status(400).json({
          error: 'Purpose required',
          message: 'Data processing purpose must be specified for GDPR compliance',
        });
      }

      const citizenData = await citizenService.getCitizenData(
        citizenId,
        requestedBy,
        purpose as string
      );

      res.json({
        data: citizenData,
        metadata: {
          accessedAt: new Date().toISOString(),
          purpose: purpose,
          dataCategories: ['personal_data', 'contact_data'],
        },
      });
    } catch (error) {
      logger.error('Failed to retrieve citizen data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        citizenId: req.params.citizenId,
        requestedBy: req.user?.id,
      });

      res.status(500).json({
        error: 'Failed to retrieve citizen data',
      });
    }
  }
);

// Update citizen data
citizenRoutes.put(
  '/:citizenId',
  authenticateUser,
  validatePermissions(['update_citizen_data']),
  async (req: Request, res: Response) => {
    try {
      const { citizenId } = req.params;
      const updates = req.body;
      const updatedBy = req.user.id;

      const result = await citizenService.updateCitizenData(citizenId, updates, updatedBy);

      res.json({
        success: true,
        data: result,
        metadata: {
          updatedAt: new Date().toISOString(),
          updatedBy: updatedBy,
        },
      });
    } catch (error) {
      logger.error('Failed to update citizen data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        citizenId: req.params.citizenId,
        updatedBy: req.user?.id,
      });

      res.status(500).json({
        error: 'Failed to update citizen data',
      });
    }
  }
);
```

### Phase 4: Production Deployment

#### Step 1: Environment Configuration

```bash
# .env.production
NODE_ENV=production
SERVICE_NAME=municipal-citizen-portal
SERVICE_VERSION=2.0.0
PORT=3000

# Norwegian Compliance
NSM_CLASSIFICATION=BEGRENSET
GDPR_ENABLED=true
AUDIT_LOGGING=true

# Security
ENCRYPTION_KEY=your-32-character-encryption-key-here
SESSION_SECRET=your-32-character-session-secret-here

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_SSL=true

# Logging
LOG_LEVEL=info

# External Services
ID_PORTEN_CLIENT_ID=your-id-porten-client-id
ID_PORTEN_CLIENT_SECRET=your-id-porten-client-secret
ALTINN_API_KEY=your-altinn-api-key
```

#### Step 2: Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S foundation -u 1001

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R foundation:nodejs /app

USER foundation

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/index.js"]
```

#### Step 3: Monitoring and Observability

```typescript
// src/monitoring/metrics.service.ts
import { EventBus, logger } from '@xala-technologies/foundation';
import { env } from '../config/environment';

export class MetricsService {
  private eventBus: EventBus;
  private metrics: Map<string, number> = new Map();

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupMetricsCollection();
    this.startMetricsReporting();
  }

  private setupMetricsCollection() {
    // Track API requests
    this.eventBus.subscribe('api.*', event => {
      this.incrementMetric('api_requests_total');
      this.incrementMetric(`api_requests_${event.eventType}`);
    });

    // Track compliance events
    this.eventBus.subscribe('*.compliance.*', event => {
      this.incrementMetric('compliance_events_total');
      this.incrementMetric(`compliance_${event.compliance?.classification || 'unknown'}`);
    });

    // Track errors
    this.eventBus.subscribe('*.error.*', event => {
      this.incrementMetric('errors_total');
    });
  }

  private incrementMetric(name: string): void {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + 1);
  }

  private startMetricsReporting(): void {
    setInterval(() => {
      const metricsSnapshot = Object.fromEntries(this.metrics);

      logger.info('Metrics report', {
        serviceName: env.SERVICE_NAME,
        metrics: metricsSnapshot,
        timestamp: new Date().toISOString(),
        classification: env.NSM_CLASSIFICATION,
      });

      // Reset counters for next interval
      this.metrics.clear();
    }, 60000); // Report every minute
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}
```

## Testing Implementation

### Unit Testing

```typescript
// src/__tests__/citizen.service.test.ts
import { CitizenService } from '../services/citizen.service';
import { EventBus, logger } from '@xala-technologies/foundation';

// Mock the foundation modules
jest.mock('@xala-technologies/foundation', () => ({
  EventBus: {
    getInstance: jest.fn(() => ({
      publish: jest.fn(),
      subscribe: jest.fn(),
    })),
  },
  logger: {
    audit: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
  EncryptionService: {
    getInstance: jest.fn(() => ({
      encrypt: jest.fn().mockResolvedValue('encrypted-data'),
    })),
  },
  NorwegianComplianceEvents: {
    createGDPRDataProcessingEvent: jest.fn().mockReturnValue({
      eventId: 'test-event',
      eventType: 'test.event',
      timestamp: new Date(),
      data: {},
    }),
  },
}));

describe('CitizenService', () => {
  let citizenService: CitizenService;

  beforeEach(() => {
    citizenService = new CitizenService();
    jest.clearAllMocks();
  });

  test('should handle citizen data access with compliance', async () => {
    const citizenId = '12345678901';
    const requestedBy = 'official123';
    const purpose = 'welfare_assessment';

    // Mock the private methods (in real implementation, these would be properly mocked)
    jest.spyOn(citizenService as any, 'validateAccess').mockResolvedValue(undefined);
    jest.spyOn(citizenService as any, 'retrieveCitizenData').mockResolvedValue({
      name: 'Test Citizen',
      address: 'Test Address',
    });
    jest.spyOn(citizenService as any, 'sanitizeDataForPurpose').mockReturnValue({
      name: 'Test Citizen',
    });

    const result = await citizenService.getCitizenData(citizenId, requestedBy, purpose);

    expect(result).toBeDefined();
    expect(logger.audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'read',
        entityType: 'citizen_data',
        entityId: citizenId,
        userId: requestedBy,
      })
    );
  });
});
```

### Integration Testing

```typescript
// src/__tests__/integration/api.integration.test.ts
import request from 'supertest';
import { APIServer } from '../api/server';

describe('API Integration Tests', () => {
  let apiServer: APIServer;
  let app: any;

  beforeAll(() => {
    apiServer = new APIServer();
    app = apiServer.getApp();
  });

  test('should handle health check', async () => {
    const response = await request(app).get('/api/health').expect(200);

    expect(response.body.status).toBe('healthy');
  });

  test('should require authentication for citizen data', async () => {
    await request(app).get('/api/citizens/12345678901').expect(401);
  });

  test('should validate GDPR purpose parameter', async () => {
    const response = await request(app)
      .get('/api/citizens/12345678901')
      .set('Authorization', 'Bearer valid-token')
      .expect(400);

    expect(response.body.message).toContain('purpose');
  });
});
```

This implementation guide provides a comprehensive foundation for building Norwegian government-compliant applications using the foundation package. Each phase builds upon the previous one, ensuring proper separation of concerns and compliance with Norwegian regulatory requirements.
