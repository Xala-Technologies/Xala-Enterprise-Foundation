# Healthcheck Module

The Healthcheck module provides comprehensive service health monitoring with Norwegian compliance validation and infrastructure monitoring.

## Overview

This module enables robust health monitoring for Norwegian government applications with built-in compliance checking, infrastructure monitoring, and service status validation.

## Key Features

- **Service Health Monitoring**: Real-time application and service status
- **Compliance Validation**: NSM and GDPR compliance health checks
- **Infrastructure Monitoring**: Database, cache, and external service monitoring
- **Municipal Health**: Municipality-specific service monitoring
- **Alert Integration**: Automated alerting for health issues

## Basic Usage

### Simple Health Check

```typescript
import { runHealthCheck, getOverallHealth } from '@xala-technologies/foundation';

// Check overall application health
const health = await getOverallHealth();
console.log(health.status); // 'healthy' | 'unhealthy' | 'degraded'

// Run specific health check
const dbHealth = await runHealthCheck('database');
console.log(dbHealth.status);
```

### Custom Health Checks

```typescript
import { registerHealthCheck } from '@xala-technologies/foundation';

// Register custom health check
registerHealthCheck('payment-gateway', async () => {
  const isHealthy = await checkPaymentGateway();
  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    details: { lastResponse: '200ms' },
  };
});
```

## API Reference

### Core Functions

#### `runHealthCheck(name)`

Runs a specific health check by name.

#### `getOverallHealth()`

Gets comprehensive health status for all services.

#### `registerHealthCheck(name, checkFunction)`

Registers a custom health check function.

## Testing

```bash
# Run healthcheck tests
pnpm test healthcheck
```

## Related Documentation

- [Configuration](../config-loader/README.md)
- [Norwegian Compliance](../../compliance/norwegian-compliance.md)
