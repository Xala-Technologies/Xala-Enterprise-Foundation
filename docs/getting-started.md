# Getting Started with @xala-technologies/foundation

This guide walks you through setting up and using the foundation package in your Norwegian government-compliant application. The foundation package is designed to handle the heavy lifting of compliance, security, and infrastructure concerns so you can focus on business logic.

## Prerequisites

Before you begin, ensure your development environment meets these requirements:

- Node.js version 18.0.0 or higher
- pnpm version 8.0.0 or higher (npm and yarn are not supported)
- TypeScript knowledge (the package is written in TypeScript)
- Basic understanding of event-driven architecture
- Familiarity with Norwegian compliance requirements (NSM, GDPR, DigDir)

## Installation

### Step 1: Install the Package

```bash
pnpm add @xala-technologies/foundation
```

### Step 2: Install TypeScript Support (if not already configured)

```bash
pnpm add -D typescript @types/node
```

### Step 3: Configure TypeScript

Create or update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Basic Setup

### Initialize Configuration

Create a configuration file for your application:

```typescript
// src/config/app-config.ts
import { ConfigService, defaultNorwegianCompliance } from '@xala-technologies/foundation';

export const appConfig = new ConfigService({
  environment: process.env.NODE_ENV || 'development',
  norwegianCompliance: {
    ...defaultNorwegianCompliance,
    nsm: {
      ...defaultNorwegianCompliance.nsm,
      securityClassification: 'BEGRENSET', // Adjust based on your needs
    },
  },
});
```

### Initialize Logging

Set up structured logging with compliance support:

```typescript
// src/services/logging.ts
import { logger } from '@xala-technologies/foundation';

// Configure logger for your application
logger.info('Application initializing', {
  version: process.env.npm_package_version,
  environment: process.env.NODE_ENV,
  compliance: {
    nsmEnabled: true,
    gdprEnabled: true,
  },
});

export { logger };
```

### Initialize Event Bus

Set up the event bus for decoupled communication:

```typescript
// src/services/event-service.ts
import { EventBus } from '@xala-technologies/foundation';

export const eventBus = EventBus.getInstance();

// Set up global error handling for events
eventBus.onError((error, event) => {
  logger.error('Event processing failed', {
    error: error.message,
    eventId: event.eventId,
    eventType: event.eventType,
  });
});
```

## Your First Application

Let's build a simple citizen portal that demonstrates key foundation features:

### Step 1: Create the Main Application

```typescript
// src/app.ts
import { logger, EventBus, NorwegianComplianceEvents } from '@xala-technologies/foundation';
import { appConfig } from './config/app-config';

class CitizenPortal {
  private eventBus: EventBus;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupEventHandlers();
  }

  async start() {
    logger.info('Starting Citizen Portal', {
      environment: appConfig.getEnvironment(),
      compliance: appConfig.getNorwegianComplianceConfig(),
    });

    // Register the service
    await this.registerService();

    logger.info('Citizen Portal started successfully');
  }

  private setupEventHandlers() {
    // Handle citizen login events
    this.eventBus.subscribe('citizen.login.*', async event => {
      logger.audit({
        action: 'LOGIN',
        entityType: 'citizen',
        userId: event.data.citizenId,
        compliance: {
          securityClassification: 'BEGRENSET',
          gdprBasis: 'public_task',
          personalDataIncluded: true,
        },
      });
    });

    // Handle data access events
    this.eventBus.subscribe('data.access.*', async event => {
      // Create GDPR compliance event
      const gdprEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
        'data.personal.accessed',
        event.data,
        ['personal_data', 'contact_data'],
        'public_task'
      );

      await this.eventBus.publish(gdprEvent);
    });
  }

  private async registerService() {
    const { ServiceRegistry } = await import('@xala-technologies/foundation');
    const registry = ServiceRegistry.getInstance();

    await registry.register({
      name: 'citizen-portal',
      version: '1.0.0',
      endpoints: ['http://localhost:3000/api'],
      healthCheck: 'http://localhost:3000/health',
      compliance: {
        nsmClassification: 'BEGRENSET',
        gdprCompliant: true,
        digdirCompliant: true,
      },
    });
  }

  async handleCitizenLogin(citizenId: string, authMethod: string) {
    // Create authentication event
    const authEvent = NorwegianComplianceEvents.createIdPortenAuthenticationEvent(
      citizenId,
      'Level4',
      'SUCCESS'
    );

    await this.eventBus.publish(authEvent);

    logger.info('Citizen logged in', {
      citizenId,
      authMethod,
      classification: 'BEGRENSET',
    });
  }
}

export default CitizenPortal;
```

### Step 2: Create Environment Configuration

```typescript
// src/config/environment.ts
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
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
});

export const env = environmentSchema.parse(process.env);
```

### Step 3: Create the Entry Point

```typescript
// src/index.ts
import CitizenPortal from './app';
import { logger } from '@xala-technologies/foundation';

async function main() {
  try {
    const app = new CitizenPortal();
    await app.start();

    // Simulate a citizen login
    await app.handleCitizenLogin('12345678901', 'ID_PORTEN');
  } catch (error) {
    logger.error('Application failed to start', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

main();
```

## Testing Your Setup

### Step 1: Create a Test File

```typescript
// src/__tests__/foundation.test.ts
import { EventBus, logger, NorwegianComplianceEvents } from '@xala-technologies/foundation';

describe('Foundation Package Integration', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = EventBus.getInstance();
  });

  test('should create and publish NSM compliance event', async () => {
    const event = NorwegianComplianceEvents.createNSMClassificationEvent(
      'test.event',
      { testData: 'example' },
      'BEGRENSET',
      ['test_handling']
    );

    expect(event.compliance.classification).toBe('BEGRENSET');
    expect(event.compliance.nsm.authorityReporting).toBe(true);

    // Should not throw when publishing
    await expect(eventBus.publish(event)).resolves.not.toThrow();
  });

  test('should log with compliance metadata', () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

    logger.info('Test message', {
      testData: 'example',
      classification: 'BEGRENSET',
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
```

### Step 2: Run Tests

```bash
pnpm test
```

## Next Steps

Now that you have a basic setup running, explore these advanced features:

1. **Service Discovery**: Set up service registration and discovery for microservices
2. **Advanced Logging**: Implement structured logging with correlation IDs
3. **Security**: Add encryption for sensitive data
4. **Norwegian Formatting**: Use the formatting utilities for addresses and numbers
5. **Health Monitoring**: Implement health checks for your services

## Common Issues

### Module Import Errors

If you encounter import errors, ensure you're importing from the correct paths:

```typescript
// Correct
import { EventBus, logger } from '@xala-technologies/foundation';

// Incorrect
import { EventBus } from '@xala-technologies/foundation/dist/modules/events';
```

### TypeScript Compilation Issues

Make sure your `tsconfig.json` includes the proper module resolution:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

### Event Bus Subscription Issues

Event patterns use glob-style matching. Ensure your patterns are correct:

```typescript
// Matches: citizen.login.success, citizen.login.failure
eventBus.subscribe('citizen.login.*', handler);

// Matches: citizen.login.success only
eventBus.subscribe('citizen.login.success', handler);
```

This getting started guide covers the essential setup. For more detailed information about specific modules and advanced use cases, refer to the module-specific documentation in the [docs/modules/](modules/README.md) directory.
