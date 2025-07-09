# Config Loader Module

## Overview

The Config Loader module provides centralized configuration management for Norwegian government-compliant applications. It handles environment-specific configuration, municipality-specific settings, and NSM security classification requirements while ensuring GDPR compliance and DigDir interoperability standards.

## Purpose

This module solves the challenge of managing complex configuration requirements for Norwegian government applications by providing:

- **Environment-specific configuration** with secure defaults
- **Municipality-specific settings** for Norwegian kommune systems
- **NSM security classification** validation and enforcement
- **GDPR compliance** configuration with audit trail support
- **Secure secret management** with encryption and access control
- **Configuration caching** with security-aware TTL settings

## Norwegian Compliance Features

### NSM Security Classifications

```typescript
interface NSMClassificationConfig {
  classification: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
  encryptionRequired: boolean;
  auditLevel: 'STANDARD' | 'ENHANCED' | 'COMPREHENSIVE';
  accessControl: string[];
}
```

### GDPR Configuration

```typescript
interface GDPRConfig {
  dataProcessingLegalBasis: GDPRLegalBasis;
  retentionPeriod: number; // in days
  automaticDeletion: boolean;
  consentRequired: boolean;
  auditTrailRequired: boolean;
}
```

### DigDir Interoperability

```typescript
interface DigDirConfig {
  accessibility: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    screenReaderSupport: boolean;
    keyboardNavigation: boolean;
  };
  interoperability: {
    standardsCompliance: string[];
    dataFormats: string[];
    apiVersioning: boolean;
  };
}
```

## API Reference

### ConfigLoaderService

The main service class for configuration management:

```typescript
class ConfigLoaderService {
  async loadMunicipalityConfig(
    municipalityCode: string,
    options?: ConfigurationOptions
  ): Promise<MunicipalityConfiguration>;

  async loadEnvironmentConfig(environment: Environment): Promise<EnvironmentConfiguration>;

  async validateConfiguration(config: Configuration): Promise<ValidationResult>;

  async getSecretValue(secretKey: string, classification: NSMClassification): Promise<string>;
}
```

### Municipality Configuration

```typescript
interface MunicipalityConfiguration {
  municipality: {
    code: string; // e.g., "0301" for Oslo
    name: string; // e.g., "Oslo Kommune"
    region: string; // e.g., "Oslo"
  };
  database: {
    host: string;
    port: number;
    ssl: boolean;
    credentials: SecureCredentials;
  };
  compliance: {
    nsmClassification: NSMClassification;
    gdprSettings: GDPRConfig;
    digdirCompliance: DigDirConfig;
  };
  locale: string; // e.g., "nb-NO"
}
```

## Examples

### Basic Municipality Configuration

```typescript
import { ConfigLoaderService } from '@xala-technologies/foundation';

const configLoader = new ConfigLoaderService();

// Load Oslo Kommune configuration
const osloConfig = await configLoader.loadMunicipalityConfig('0301', {
  environment: 'production',
  requiredCompliance: ['NSM', 'GDPR', 'DigDir'],
});

console.log(osloConfig.municipality.name); // "Oslo Kommune"
console.log(osloConfig.compliance.nsmClassification); // "BEGRENSET"
```

### Environment-Specific Configuration

```typescript
// Load development environment configuration
const devConfig = await configLoader.loadEnvironmentConfig('development');

// Load production environment configuration
const prodConfig = await configLoader.loadEnvironmentConfig('production');

// Configuration automatically includes Norwegian compliance defaults
console.log(devConfig.compliance.gdpr.auditTrailRequired); // true
console.log(prodConfig.security.encryptionEnabled); // true
```

### Secure Secret Management

```typescript
// Load classified secrets with proper access control
const dbPassword = await configLoader.getSecretValue('database.password', 'KONFIDENSIELT');

// Audit trail automatically generated for secret access
const apiKey = await configLoader.getSecretValue('external.api.key', 'BEGRENSET');
```

### Configuration Validation

```typescript
const validationResult = await configLoader.validateConfiguration({
  municipality: { code: '0301' },
  classification: 'KONFIDENSIELT',
  environment: 'production',
});

if (!validationResult.isValid) {
  console.error('Configuration validation failed:', validationResult.errors);
}
```

## Configuration Options

### ConfigurationOptions Interface

```typescript
interface ConfigurationOptions {
  environment?: Environment;
  requiredCompliance?: ComplianceStandard[];
  cacheEnabled?: boolean;
  validateOnLoad?: boolean;
  auditTrail?: boolean;
}

type Environment = 'development' | 'test' | 'production';
type ComplianceStandard = 'NSM' | 'GDPR' | 'DigDir';
```

### Default Configuration

```typescript
const defaultOptions: ConfigurationOptions = {
  environment: 'development',
  requiredCompliance: ['NSM', 'GDPR', 'DigDir'],
  cacheEnabled: true,
  validateOnLoad: true,
  auditTrail: true,
};
```

## Security Considerations

### Classification-Aware Processing

The config loader automatically applies appropriate security measures based on NSM classifications:

- **ÅPEN**: Standard processing with basic audit logging
- **BEGRENSET**: Enhanced access control with detailed audit trail
- **KONFIDENSIELT**: Encryption at rest and in transit, comprehensive audit
- **HEMMELIG**: AES-256-GCM encryption, strict access control, full audit trail

### Secure Secret Storage

```typescript
// Secrets are automatically encrypted based on classification
const secretConfig = {
  key: 'database.password',
  value: 'sensitive-password',
  classification: 'KONFIDENSIELT',
  rotationPolicy: {
    interval: '90d',
    automatic: true,
  },
};
```

### Access Control

```typescript
// Role-based access control for configuration
const accessControl = {
  roles: ['developer', 'operations', 'security-officer'],
  permissions: {
    ÅPEN: ['developer', 'operations', 'security-officer'],
    BEGRENSET: ['operations', 'security-officer'],
    KONFIDENSIELT: ['security-officer'],
    HEMMELIG: ['security-officer'],
  },
};
```

## Caching Strategy

### Security-Aware Caching

```typescript
interface CacheSettings {
  ttl: {
    ÅPEN: 3600; // 1 hour
    BEGRENSET: 1800; // 30 minutes
    KONFIDENSIELT: 300; // 5 minutes
    HEMMELIG: 60; // 1 minute
  };
  encryption: {
    ÅPEN: false;
    BEGRENSET: false;
    KONFIDENSIELT: true;
    HEMMELIG: true;
  };
}
```

### Cache Invalidation

```typescript
// Automatic cache invalidation based on security events
configLoader.on('securityEvent', event => {
  if (event.type === 'classification-change') {
    configLoader.invalidateCache(event.affectedConfigs);
  }
});
```

## Error Handling

### Configuration Errors

```typescript
try {
  const config = await configLoader.loadMunicipalityConfig('invalid-code');
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error('Configuration error:', error.message);
    console.error('Error code:', error.code);
    console.error('Classification:', error.classification);
  }
}
```

### Compliance Validation Errors

```typescript
class ComplianceValidationError extends ConfigurationError {
  constructor(
    message: string,
    public readonly violatedStandards: ComplianceStandard[],
    public readonly requiredActions: string[]
  ) {
    super(message, 'COMPLIANCE_VIOLATION');
  }
}
```

## Testing

### User Story Tests

The module includes comprehensive user story tests covering:

1. **Municipality Database Configuration**: Trondheim Kommune database setup
2. **Environment Defaults**: Secure defaults for new developers
3. **Production Maintenance**: Configuration updates during maintenance
4. **NSM Compliance Validation**: Security classification validation
5. **International Deployment**: Non-Norwegian environment configuration
6. **Development Environment Setup**: Automated development configuration
7. **Configuration Caching**: Performance optimization with security

### Unit Tests

```typescript
describe('ConfigLoaderService', () => {
  it('should validate municipality codes', async () => {
    const result = await configLoader.validateMunicipalityCode('0301');
    expect(result.isValid).toBe(true);
    expect(result.municipality.name).toBe('Oslo Kommune');
  });

  it('should enforce NSM classification requirements', async () => {
    const config = await configLoader.loadClassifiedConfig('HEMMELIG');
    expect(config.encryption.algorithm).toBe('AES-256-GCM');
    expect(config.auditTrail.level).toBe('COMPREHENSIVE');
  });
});
```

## Performance Considerations

### Optimization Patterns

- **Connection Pooling**: Efficient database connection management
- **Lazy Loading**: Configuration loaded only when needed
- **Batch Operations**: Multiple configuration requests processed together
- **Memory Management**: Automatic cleanup of expired cache entries

### Monitoring

```typescript
// Performance metrics collection
const metrics = await configLoader.getPerformanceMetrics();
console.log('Cache hit rate:', metrics.cacheHitRate);
console.log('Average load time:', metrics.averageLoadTime);
console.log('Memory usage:', metrics.memoryUsage);
```

## Integration

### Event System Integration

```typescript
// Configuration changes generate events
configLoader.on('configurationChanged', event => {
  console.log('Configuration updated:', event.key);
  console.log('Municipality:', event.municipalityCode);
  console.log('Classification:', event.classification);
});
```

### Logger Integration

```typescript
// Automatic audit logging for configuration access
const logger = new LoggerService();
configLoader.setLogger(logger);

// All configuration access automatically logged with:
// - User ID
// - Municipality code
// - Classification level
// - Timestamp
// - Action performed
```

## Troubleshooting

### Common Issues

#### Invalid Municipality Code

```
Error: Invalid municipality code '1234'
Solution: Use valid Norwegian municipality codes (e.g., '0301' for Oslo)
```

#### Classification Mismatch

```
Error: Insufficient permissions for KONFIDENSIELT classification
Solution: Ensure user has appropriate security clearance
```

#### Environment Configuration Missing

```
Error: Environment configuration not found for 'staging'
Solution: Create staging environment configuration or use 'development'/'production'
```

### Debug Mode

```typescript
// Enable debug mode for detailed logging
const configLoader = new ConfigLoaderService({
  debug: true,
  logLevel: 'debug',
});

// Additional debugging information will be logged
```

## Migration Guide

### From Version 1.x to 2.x

```typescript
// Old API (v1.x)
const config = await getConfig('oslo');

// New API (v2.x)
const config = await configLoader.loadMunicipalityConfig('0301');
```

### Configuration File Updates

```typescript
// Old format
{
  "municipality": "oslo",
  "security": "high"
}

// New format
{
  "municipality": {
    "code": "0301",
    "name": "Oslo Kommune"
  },
  "compliance": {
    "nsmClassification": "BEGRENSET"
  }
}
```

This config-loader module provides the foundation for secure, compliant configuration management in Norwegian government applications while maintaining excellent developer experience and performance.
