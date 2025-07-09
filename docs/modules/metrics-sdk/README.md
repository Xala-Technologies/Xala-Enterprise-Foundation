# Metrics SDK Module

The Metrics SDK module provides comprehensive application monitoring with Norwegian compliance, performance tracking, and security event monitoring.

## Overview

This module enables detailed application monitoring for Norwegian government systems with built-in compliance tracking, performance metrics, and security event monitoring.

## Key Features

- **Performance Monitoring**: Application response times and resource usage
- **Security Metrics**: NSM security event tracking and classification
- **Compliance Tracking**: GDPR and DigDir compliance monitoring
- **Municipal Metrics**: Municipality-specific performance tracking
- **Real-time Monitoring**: Live performance and security monitoring

## Basic Usage

### Basic Metrics Collection

```typescript
import { getMetricsCollector } from '@xala-technologies/foundation';

const metrics = getMetricsCollector();

// Record performance metric
metrics.recordPerformance('api.citizen.lookup', 150); // 150ms response time

// Record security event
metrics.recordSecurityEvent('login.success', {
  municipality: '0301',
  userRole: 'municipal_employee',
});

// Record compliance event
metrics.recordComplianceEvent('gdpr.data_processed', {
  legalBasis: 'public_task',
  municipality: '0301',
});
```

### Performance Monitoring

```typescript
import { MetricsCollector } from '@xala-technologies/foundation';

const collector = new MetricsCollector();

// Measure operation timing
const timer = collector.startTimer('database.query');
await performDatabaseQuery();
timer.end(); // Automatically records timing

// Record custom metrics
collector.recordGauge('memory.usage', 85.5); // 85.5% memory usage
collector.recordCounter('api.requests', 1); // Increment API request counter
```

## API Reference

### Core Functions

#### `getMetricsCollector()`

Gets the global metrics collector instance.

#### `recordPerformance(operation, duration)`

Records performance timing for operations.

#### `recordSecurityEvent(event, metadata)`

Records security-related events with classification.

#### `getMetrics(timeRange?)`

Retrieves collected metrics for analysis.

### MetricsCollector Class

```typescript
import { MetricsCollector } from '@xala-technologies/foundation';

const collector = new MetricsCollector({
  municipality: '0301',
  compliance: {
    nsm: true,
    gdpr: true,
    audit: true,
  },
});
```

## Norwegian Government Examples

### Oslo Kommune Performance Monitoring

```typescript
const osloMetrics = new MetricsCollector({ municipality: '0301' });

// Monitor citizen service performance
osloMetrics.recordPerformance('citizen.registration', 2500);
osloMetrics.recordCounter('services.completed', 1);

// Track security events
osloMetrics.recordSecurityEvent('document.access', {
  classification: 'KONFIDENSIELT',
  userId: 'officer_123',
});
```

## Testing

```bash
# Run metrics SDK tests
pnpm test metrics-sdk

# Run performance tests
pnpm test --testNamePattern="performance"
```

## Related Documentation

- [Logger](../logger/README.md)
- [Norwegian Compliance](../../compliance/norwegian-compliance.md)
