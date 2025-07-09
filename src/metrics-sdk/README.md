# metrics-sdk

Application monitoring and metrics collection with Norwegian compliance and performance tracking.

## Features

- **Comprehensive metrics** - Counters, gauges, histograms, and timers
- **Norwegian compliance** - NSM-classified metrics and GDPR-aware data collection
- **Performance monitoring** - Application, database, and service performance tracking
- **Custom metrics** - Business-specific metrics and KPIs
- **Export capabilities** - Integration with monitoring systems (Prometheus, Grafana)
- **Real-time dashboards** - Live monitoring and alerting capabilities

## Usage

### Basic Metrics Collection

```typescript
import {
  getMetricsCollector,
  incrementCounter,
  setGauge,
  recordHistogram,
  startTimer,
  endTimer,
} from '@xala-technologies/foundation/metrics-sdk';

const metrics = getMetricsCollector();

// Counter metrics (things that increment)
incrementCounter('user_logins_total', { municipality: '0301' });
incrementCounter('api_requests_total', { endpoint: '/citizens', method: 'GET' });

// Gauge metrics (current values)
setGauge('active_users_current', 42);
setGauge('database_connections_active', 15);

// Histogram metrics (distribution of values)
recordHistogram('request_duration_seconds', 0.245);
recordHistogram('database_query_duration_ms', 125);

// Timer metrics (measure duration)
const timer = startTimer('operation_duration');
// ... perform operation ...
endTimer(timer, 'user_data_processing');
```

### Norwegian Government Metrics

```typescript
import {
  recordMunicipalityMetric,
  recordNSMClassifiedMetric,
  recordGDPRMetric,
} from '@xala-technologies/foundation/metrics-sdk';

// Municipality-specific metrics
recordMunicipalityMetric('service_usage', {
  municipality: '0301', // Oslo
  service: 'citizen_portal',
  value: 1,
  metadata: { user_type: 'resident' },
});

// NSM classified metrics
recordNSMClassifiedMetric('security_events', {
  classification: 'KONFIDENSIELT',
  event_type: 'data_access',
  department: 'IT-sikkerhet',
  value: 1,
});

// GDPR compliance metrics
recordGDPRMetric('personal_data_processing', {
  lawful_basis: 'public_task',
  data_category: 'identification_data',
  processing_purpose: 'service_delivery',
  retention_period: '7_years',
});
```

### Performance Monitoring

```typescript
import {
  monitorDatabasePerformance,
  monitorAPIPerformance,
  monitorSystemHealth,
} from '@xala-technologies/foundation/metrics-sdk';

// Database performance monitoring
const dbMonitor = monitorDatabasePerformance({
  connectionPoolSize: true,
  queryPerformance: true,
  slowQueryThreshold: 1000, // ms
});

// API endpoint monitoring
const apiMonitor = monitorAPIPerformance({
  responseTime: true,
  errorRate: true,
  throughput: true,
  statusCodes: true,
});

// System health monitoring
const systemMonitor = monitorSystemHealth({
  cpuUsage: true,
  memoryUsage: true,
  diskSpace: true,
  networkLatency: true,
});
```

### Custom Business Metrics

```typescript
import { createCustomMetric, MetricType } from '@xala-technologies/foundation/metrics-sdk';

// Create business-specific metrics
const citizenServiceMetric = createCustomMetric({
  name: 'citizen_service_completion_rate',
  type: MetricType.GAUGE,
  description: 'Percentage of citizen services completed successfully',
  labels: ['municipality', 'service_type', 'channel'],
  nsmClassification: 'ÅPEN',
});

// Record business metric
citizenServiceMetric.set(95.5, {
  municipality: '0301',
  service_type: 'passport_application',
  channel: 'digital',
});
```

## Metric Types

### Counters

- **Purpose** - Count events or occurrences (always increasing)
- **Examples** - User logins, API requests, errors, completed transactions
- **Norwegian use cases** - Citizen service requests, document submissions

### Gauges

- **Purpose** - Current state or level (can increase/decrease)
- **Examples** - Active connections, queue length, CPU usage
- **Norwegian use cases** - Active citizen sessions, pending applications

### Histograms

- **Purpose** - Distribution of values over time
- **Examples** - Request duration, response sizes, processing times
- **Norwegian use cases** - Service processing times, document sizes

### Timers

- **Purpose** - Measure operation duration
- **Examples** - Database queries, API calls, batch processing
- **Norwegian use cases** - Citizen service response times, data processing

## Norwegian Compliance Features

### NSM Security Classifications

```typescript
// Record classified metrics with proper handling
recordNSMClassifiedMetric('sensitive_operations', {
  classification: 'KONFIDENSIELT',
  value: 1,
  metadata: { operation_type: 'security_audit' },
});
```

### GDPR Data Protection

```typescript
// GDPR-compliant personal data metrics
recordGDPRMetric('personal_data_access', {
  lawful_basis: 'consent',
  data_subject_category: 'citizen',
  processing_purpose: 'service_delivery',
});
```

### Municipality Analytics

```typescript
// Per-municipality performance tracking
recordMunicipalityMetric('digital_service_adoption', {
  municipality: '0301',
  service: 'digital_tax_filing',
  adoption_rate: 87.3,
});
```

## Dashboard Configuration

```typescript
const dashboardConfig = {
  refreshInterval: 30000, // 30 seconds
  panels: [
    {
      title: 'Citizen Service Performance',
      metrics: ['citizen_service_completion_rate', 'service_response_time'],
      timeRange: '24h',
    },
    {
      title: 'System Health',
      metrics: ['cpu_usage', 'memory_usage', 'active_connections'],
      timeRange: '1h',
    },
    {
      title: 'Municipality Usage',
      metrics: ['municipality_service_usage'],
      groupBy: 'municipality',
      timeRange: '7d',
    },
  ],
};
```

## Alerting Rules

```typescript
const alertRules = [
  {
    name: 'High Error Rate',
    condition: 'error_rate > 5%',
    severity: 'warning',
    notification: ['operations-team@municipality.no'],
  },
  {
    name: 'Service Unavailable',
    condition: 'service_availability < 99%',
    severity: 'critical',
    notification: ['on-call@municipality.no', 'sms:+4712345678'],
  },
];
```

## Integration with Monitoring Systems

- **Prometheus** - Native Prometheus metrics export
- **Grafana** - Pre-built Norwegian government dashboards
- **DataDog** - APM and infrastructure monitoring
- **Azure Monitor** - Cloud-native monitoring for Azure deployments
- **Custom exports** - JSON, CSV, and custom format exports

## Norwegian Government Standards

- **DigDir Compliance** - Metrics following Norwegian digitalization standards
- **NSM Guidelines** - Security metrics classification and handling
- **GDPR Requirements** - Privacy-compliant data collection and retention
- **Accessibility Reporting** - WCAG 2.1 AA compliance metrics
