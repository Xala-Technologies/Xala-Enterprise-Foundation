# healthcheck

Service health monitoring with Norwegian compliance checks and comprehensive system diagnostics.

## Features

- **Comprehensive health checks** - Application, database, external services, and infrastructure
- **Norwegian compliance monitoring** - NSM, GDPR, and DigDir compliance status
- **Dependency monitoring** - Track health of all service dependencies
- **Custom health checks** - Business-specific health validation
- **Automated alerting** - Proactive notification of health issues
- **Health dashboards** - Real-time health status visualization

## Usage

### Basic Health Checks

```typescript
import {
  getHealthManager,
  registerHealthCheck,
  runHealthCheck,
  getOverallHealth,
} from '@xala-technologies/foundation/healthcheck';

const healthManager = getHealthManager();

// Register a simple health check
registerHealthCheck({
  name: 'database_connection',
  check: async () => {
    const isConnected = await checkDatabaseConnection();
    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      message: isConnected ? 'Database connected' : 'Database connection failed',
      metadata: { host: 'db.example.com', port: 5432 },
    };
  },
  interval: 30000, // Check every 30 seconds
  timeout: 5000, // 5 second timeout
  critical: true, // Mark as critical component
});

// Run a specific health check
const dbHealth = await runHealthCheck('database_connection');
console.log('Database health:', dbHealth.status);

// Get overall system health
const overallHealth = await getOverallHealth();
console.log('System status:', overallHealth.status);
```

### Norwegian Compliance Health Checks

```typescript
import {
  registerNSMComplianceCheck,
  registerGDPRComplianceCheck,
  registerDigDirComplianceCheck,
} from '@xala-technologies/foundation/healthcheck';

// NSM security compliance check
registerNSMComplianceCheck({
  name: 'security_classification_compliance',
  check: async () => {
    const compliance = await validateNSMCompliance();
    return {
      status: compliance.isCompliant ? 'healthy' : 'unhealthy',
      message: compliance.message,
      nsmClassification: 'KONFIDENSIELT',
      metadata: {
        classificationsChecked: compliance.checkedItems,
        violations: compliance.violations,
      },
    };
  },
});

// GDPR compliance monitoring
registerGDPRComplianceCheck({
  name: 'personal_data_protection',
  check: async () => {
    const gdprStatus = await checkGDPRCompliance();
    return {
      status: gdprStatus.isCompliant ? 'healthy' : 'degraded',
      message: `GDPR compliance: ${gdprStatus.score}%`,
      metadata: {
        dataProcessingRecords: gdprStatus.records,
        consentStatus: gdprStatus.consent,
        retentionCompliance: gdprStatus.retention,
      },
    };
  },
});

// DigDir interoperability check
registerDigDirComplianceCheck({
  name: 'government_interoperability',
  check: async () => {
    const digdirStatus = await checkDigDirStandards();
    return {
      status: digdirStatus.isCompliant ? 'healthy' : 'degraded',
      message: 'DigDir interoperability standards compliance',
      metadata: {
        standards: digdirStatus.standards,
        apiCompatibility: digdirStatus.apis,
        accessibilityLevel: digdirStatus.accessibility,
      },
    };
  },
});
```

### System Component Health Checks

```typescript
// Database health monitoring
registerHealthCheck({
  name: 'postgresql_primary',
  check: async () => {
    const start = Date.now();
    try {
      await db.query('SELECT 1');
      const duration = Date.now() - start;

      return {
        status: duration < 1000 ? 'healthy' : 'degraded',
        message: `Database query completed in ${duration}ms`,
        duration,
        metadata: {
          queryTime: duration,
          connectionPool: await db.getPoolStatus(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Database error: ${error.message}`,
        duration: Date.now() - start,
        metadata: { error: error.message },
      };
    }
  },
  interval: 15000,
  timeout: 10000,
  critical: true,
});

// External service health
registerHealthCheck({
  name: 'altinn_integration',
  check: async () => {
    try {
      const response = await fetch('https://api.altinn.no/health');
      return {
        status: response.ok ? 'healthy' : 'degraded',
        message: `Altinn API responded with ${response.status}`,
        metadata: {
          status: response.status,
          responseTime: response.headers.get('x-response-time'),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Altinn API unreachable: ${error.message}`,
        metadata: { error: error.message },
      };
    }
  },
  interval: 60000,
  timeout: 30000,
  critical: false,
});
```

### Custom Business Health Checks

```typescript
// Municipality service health
registerHealthCheck({
  name: 'citizen_portal_services',
  check: async () => {
    const services = ['passport', 'tax_filing', 'building_permits'];
    const healthResults = await Promise.all(services.map(service => checkServiceHealth(service)));

    const unhealthyServices = healthResults.filter(r => r.status !== 'healthy');
    const status =
      unhealthyServices.length === 0
        ? 'healthy'
        : unhealthyServices.length < services.length
          ? 'degraded'
          : 'unhealthy';

    return {
      status,
      message: `${services.length - unhealthyServices.length}/${services.length} services healthy`,
      metadata: {
        services: healthResults,
        unhealthyCount: unhealthyServices.length,
      },
    };
  },
  interval: 45000,
  timeout: 15000,
  critical: true,
});
```

## Health Check Results

### Status Levels

- **healthy** - Component is functioning normally
- **degraded** - Component has minor issues but is operational
- **unhealthy** - Component has critical issues or is non-functional

### Result Structure

```typescript
interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  duration: number;
  message?: string;
  metadata?: Record<string, any>;
  nsmClassification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
}
```

## Health Monitoring Dashboard

```typescript
const healthDashboard = {
  overview: {
    systemStatus: 'healthy',
    totalChecks: 12,
    healthyChecks: 10,
    degradedChecks: 2,
    unhealthyChecks: 0,
    lastUpdate: new Date(),
  },
  categories: {
    infrastructure: ['database', 'cache', 'storage'],
    external_services: ['altinn', 'id_porten', 'digdir'],
    compliance: ['nsm_security', 'gdpr_protection', 'accessibility'],
    business_services: ['citizen_portal', 'document_service', 'payment_service'],
  },
  alerts: [
    {
      severity: 'warning',
      component: 'cache_service',
      message: 'Redis connection pool at 85% capacity',
      timestamp: new Date(),
    },
  ],
};
```

## Norwegian Government Compliance

### NSM Security Health

- **Classification compliance** - Verify data classification handling
- **Security control effectiveness** - Monitor security measure status
- **Incident response readiness** - Test emergency response capabilities

### GDPR Data Protection Health

- **Consent management** - Verify consent collection and processing
- **Data retention** - Monitor retention policy compliance
- **Access rights** - Check data subject access request handling

### DigDir Interoperability Health

- **API compatibility** - Test government service API compliance
- **Data format standards** - Verify data exchange format compliance
- **Accessibility compliance** - Monitor WCAG 2.1 AA adherence

## Alerting and Notifications

```typescript
const alertingConfig = {
  channels: {
    email: ['ops-team@municipality.no', 'on-call@municipality.no'],
    slack: '#alerts-production',
    sms: ['+4712345678'], // On-call phone
    webhook: 'https://monitoring.municipality.no/webhook',
  },
  rules: [
    {
      condition: 'status === "unhealthy" && critical === true',
      severity: 'critical',
      channels: ['email', 'sms', 'slack'],
      escalation: {
        after: 300000, // 5 minutes
        channels: ['sms'], // Escalate to SMS
      },
    },
    {
      condition: 'status === "degraded"',
      severity: 'warning',
      channels: ['email', 'slack'],
    },
  ],
};
```

## Integration with Monitoring Systems

- **Prometheus** - Export health metrics for monitoring
- **Grafana** - Health status dashboards and visualization
- **Azure Monitor** - Cloud-native health monitoring
- **PagerDuty** - Incident management and on-call rotation
- **Custom integrations** - Webhook support for any monitoring system
