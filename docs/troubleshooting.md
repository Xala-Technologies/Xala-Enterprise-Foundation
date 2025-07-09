# Troubleshooting Guide

This guide addresses common issues you might encounter when working with the foundation package and provides practical solutions based on real-world experience.

## Installation Issues

### pnpm Not Recognized

**Problem**: Command `pnpm` is not found when trying to install the package.

**Solution**: Install pnpm globally:

```bash
npm install -g pnpm
# or
curl -fsSL https://get.pnpm.io/install.sh | sh
```

**Root Cause**: The foundation package requires pnpm for proper package management and workspace handling.

### Version Compatibility Issues

**Problem**: Getting peer dependency warnings or compatibility errors.

**Symptoms**:

```
WARN deprecated eslint@8.57.1
```

**Solution**: These are warning messages, not errors. The package functions correctly with these deprecation warnings. To suppress them, add to your `.npmrc`:

```
audit-level=moderate
fund=false
```

**Prevention**: Always use the exact Node.js and pnpm versions specified in the package requirements.

### GitHub Packages Authentication

**Problem**: Cannot install or publish packages due to authentication errors.

**⚠️ Security Warning**: Never commit your `.npmrc` or `.env` files containing tokens to the repository. These files are already in `.gitignore` for security.

**Setup Authentication**:

1. **For Package Installation** - Create `.npmrc` file:

```bash
cp .npmrc.example .npmrc
# Edit .npmrc and replace 'your_github_personal_access_token_here' with your actual token
```

2. **For Scripts and Publishing** - Create `.env` file:

```bash
cp .env.example .env
# Edit .env and add: NODE_AUTH_TOKEN=your_github_token
```

3. **Get GitHub Personal Access Token**:
   - Visit [GitHub Settings > Tokens](https://github.com/settings/tokens)
   - Create a token with `packages:write` and `repo` permissions
   - Copy the token (starts with `ghp_`)

**Verification**:

```bash
# Test authentication
pnpm whoami --registry=https://npm.pkg.github.com
```

**Common Authentication Errors**:

- `401 Unauthorized` - Token is missing or invalid
- `403 Forbidden` - Token lacks required permissions
- `404 Not Found` - Package scope or registry URL is incorrect

## TypeScript Configuration Issues

### Module Resolution Errors

**Problem**: TypeScript cannot resolve imports from the foundation package.

**Symptoms**:

```
TS2307: Cannot find module '@xala-technologies/foundation' or its corresponding type declarations.
```

**Solution**: Ensure your `tsconfig.json` includes proper module resolution:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true
  }
}
```

**Alternative Solution**: If the issue persists, try explicit import syntax:

```typescript
import * as Foundation from '@xala-technologies/foundation';
const { EventBus, logger } = Foundation;
```

### Type Declaration Issues

**Problem**: Getting type errors when using foundation components.

**Symptoms**:

```
TS2339: Property 'audit' does not exist on type 'Logger'
```

**Solution**: Ensure you're importing the correct types:

```typescript
import { logger, type ILogger } from '@xala-technologies/foundation';
```

**Root Cause**: The foundation package exports both runtime components and their type definitions. Always import types explicitly when needed.

## Event Bus Issues

### Events Not Being Received

**Problem**: Subscribed event handlers are not being called.

**Debugging Steps**:

1. Check event pattern matching:

```typescript
// This will NOT match 'user.login.success'
eventBus.subscribe('user.login', handler);

// This WILL match 'user.login.success'
eventBus.subscribe('user.login.*', handler);
```

2. Verify event bus instance:

```typescript
// Make sure you're using the singleton
const eventBus = EventBus.getInstance();
```

3. Add debug logging:

```typescript
eventBus.subscribe('*', event => {
  console.log('Debug: Received event', event.eventType);
});
```

**Common Cause**: Pattern matching issues or multiple event bus instances.

### Memory Leaks in Event Subscriptions

**Problem**: Application memory usage grows over time.

**Solution**: Always unsubscribe from events when components are destroyed:

```typescript
class MyService {
  private unsubscribe: (() => void)[] = [];

  constructor() {
    this.unsubscribe.push(eventBus.subscribe('user.*', this.handleUserEvent.bind(this)));
  }

  destroy() {
    this.unsubscribe.forEach(unsub => unsub());
    this.unsubscribe = [];
  }
}
```

## Configuration Issues

### Environment Variable Loading

**Problem**: Configuration values are not being loaded from environment variables.

**Debugging**:

1. Check environment variable naming:

```typescript
// The package looks for specific variable names
NSM_CLASSIFICATION = BEGRENSET;
GDPR_ENABLED = true;
AUDIT_LOGGING = true;
```

2. Verify environment loading order:

```typescript
// Load environment variables before importing config
import 'dotenv/config';
import { ConfigService } from '@xala-technologies/foundation';
```

**Solution**: Use explicit configuration when environment variables are not available:

```typescript
const config = new ConfigService({
  environment: 'production',
  norwegianCompliance: {
    nsm: {
      securityClassification: 'BEGRENSET',
      auditLogging: true,
    },
  },
});
```

### Configuration Validation Errors

**Problem**: Getting validation errors during configuration setup.

**Symptoms**:

```
Error: Invalid NSM security classification: INVALID_LEVEL
```

**Solution**: Use only valid NSM classifications:

```typescript
// Valid classifications
'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';

// Example
const config = {
  nsm: {
    securityClassification: 'BEGRENSET', // This is valid
  },
};
```

## Logging Issues

### Logs Not Appearing

**Problem**: Logger calls are not producing any output.

**Debugging Steps**:

1. Check log level configuration:

```typescript
import { logger } from '@xala-technologies/foundation';

// Verify current log level
console.log('Current log level:', logger.level);

// Force log level for debugging
logger.level = 'debug';
```

2. Check for proper logger initialization:

```typescript
// Ensure logger is imported before first use
import { logger } from '@xala-technologies/foundation';

// Not from a nested import
// import { logger } from '@xala-technologies/foundation/dist/modules/logger';
```

**Solution**: Use explicit log level configuration:

```typescript
process.env.LOG_LEVEL = 'debug';
import { logger } from '@xala-technologies/foundation';
```

### Audit Logging Not Working

**Problem**: Audit logs are not being generated for compliance events.

**Verification**:

```typescript
// Test audit logging directly
logger.audit({
  action: 'TEST',
  entityType: 'test_entity',
  userId: 'test_user',
  compliance: {
    securityClassification: 'BEGRENSET',
    gdprBasis: 'public_task',
  },
});
```

**Common Issue**: Missing compliance metadata:

```typescript
// Incorrect - missing required compliance fields
logger.audit({
  action: 'READ',
  entityType: 'data',
});

// Correct - includes all required compliance fields
logger.audit({
  action: 'READ',
  entityType: 'data',
  userId: 'user123',
  compliance: {
    securityClassification: 'BEGRENSET',
    gdprBasis: 'public_task',
    personalDataIncluded: true,
  },
});
```

## Security and Encryption Issues

### Encryption Failures

**Problem**: Data encryption operations are failing.

**Symptoms**:

```
Error: Unsupported encryption algorithm: AES-128
```

**Solution**: Use supported encryption algorithms:

```typescript
import { EncryptionService } from '@xala-technologies/foundation';

const encryption = EncryptionService.getInstance();

// Supported algorithms
const encrypted = await encryption.encrypt(
  data,
  key,
  'BEGRENSET', // NSM classification
  {
    algorithm: 'AES-256-GCM', // Use supported algorithm
  }
);
```

### Key Management Issues

**Problem**: Encryption keys are not being handled securely.

**Best Practices**:

```typescript
// Don't hardcode keys
const BAD_KEY = 'my-secret-key';

// Use environment variables
const GOOD_KEY = process.env.ENCRYPTION_KEY;

// Use key derivation for additional security
const derivedKey = await encryption.deriveKey(baseKey, salt);
```

## Performance Issues

### Slow Event Processing

**Problem**: Event handlers are taking too long to process.

**Diagnosis**:

```typescript
eventBus.subscribe('slow.event.*', async event => {
  const start = Date.now();

  try {
    await processEvent(event);
  } finally {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn('Slow event processing', {
        eventType: event.eventType,
        duration,
      });
    }
  }
});
```

**Solutions**:

1. Use asynchronous processing for heavy operations:

```typescript
eventBus.subscribe('heavy.processing.*', async event => {
  // Queue heavy work instead of blocking
  await queueBackgroundJob(event.data);
});
```

2. Implement event batching:

```typescript
const eventBatch = [];
eventBus.subscribe('batch.event.*', event => {
  eventBatch.push(event);
  if (eventBatch.length >= 10) {
    processBatch(eventBatch.splice(0));
  }
});
```

### Memory Usage Issues

**Problem**: Application memory usage is higher than expected.

**Monitoring**:

```typescript
// Add memory monitoring
setInterval(() => {
  const usage = process.memoryUsage();
  if (usage.heapUsed > 100 * 1024 * 1024) {
    // 100MB
    logger.warn('High memory usage detected', {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    });
  }
}, 30000);
```

**Common Causes**:

- Event handler memory leaks
- Large objects in event data
- Circular references in logged objects

## Norwegian Compliance Issues

### NSM Classification Validation

**Problem**: Getting NSM validation errors in production.

**Common Mistakes**:

```typescript
// Wrong - using English classification
classification: 'RESTRICTED';

// Correct - using Norwegian NSM classification
classification: 'BEGRENSET';
```

**Validation Check**:

```typescript
import { isValidNSMClassification } from '@xala-technologies/foundation';

const classification = 'BEGRENSET';
if (!isValidNSMClassification(classification)) {
  throw new Error(`Invalid NSM classification: ${classification}`);
}
```

### GDPR Compliance Validation

**Problem**: GDPR events are not being processed correctly.

**Required Fields Check**:

```typescript
const gdprEvent = {
  personalDataIncluded: true,
  gdprApplicable: true,
  legalBasis: 'public_task', // Must be valid GDPR basis
  auditRequired: true,
  retentionPeriod: 'P7Y', // ISO 8601 duration format
};
```

**Valid Legal Bases**:

- `consent`
- `contract`
- `legal_obligation`
- `vital_interests`
- `public_task`
- `legitimate_interests`

## Production Deployment Issues

### Missing Dependencies

**Problem**: Application fails to start in production with missing dependency errors.

**Solution**: Ensure production build includes all dependencies:

```bash
# Build for production
pnpm run build

# Verify dist directory contains all needed files
ls -la dist/

# Check for missing dependencies
pnpm install --production
```

### Environment Configuration

**Problem**: Different behavior between development and production environments.

**Environment Checklist**:

```bash
# Required environment variables for production
NODE_ENV=production
LOG_LEVEL=info
NSM_CLASSIFICATION=BEGRENSET
GDPR_ENABLED=true
AUDIT_LOGGING=true
```

### Health Check Failures

**Problem**: Health checks are failing in production.

**Debug Health Checks**:

```typescript
import { ServiceRegistry } from '@xala-technologies/foundation';

const registry = ServiceRegistry.getInstance();

// Add detailed health check
const healthStatus = await registry.getHealthStatus();
console.log('Health status:', healthStatus);
```

## Getting Additional Help

### Enable Debug Logging

For any issue, start by enabling comprehensive logging:

```typescript
process.env.LOG_LEVEL = 'debug';
process.env.FOUNDATION_DEBUG = 'true';
```

### Minimal Reproduction

When reporting issues, create a minimal reproduction:

```typescript
import { EventBus, logger } from '@xala-technologies/foundation';

// Minimal code that demonstrates the issue
const eventBus = EventBus.getInstance();
eventBus.subscribe('test.*', event => {
  logger.info('Event received', { eventType: event.eventType });
});

eventBus.publish({
  eventId: 'test-1',
  eventType: 'test.example',
  timestamp: new Date(),
  data: { test: true },
});
```

### System Information

When seeking help, include:

- Node.js version (`node --version`)
- pnpm version (`pnpm --version`)
- Foundation package version
- Operating system
- Error messages with full stack traces
- Environment configuration (without sensitive data)

This troubleshooting guide covers the most common issues encountered in production environments. For issues not covered here, refer to the GitHub repository issues or create a new issue with detailed reproduction steps.
