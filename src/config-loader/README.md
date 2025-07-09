# config-loader

Provides centralized configuration loading for all Xala apps and packages with Norwegian government compliance support.

## Features

- **Environment-based configuration** - Development, staging, production settings
- **Norwegian compliance** - NSM, GDPR, and DigDir standards
- **Security configuration** - Encryption, authentication, and security policies
- **Database configuration** - Connection settings and SSL management
- **Logging configuration** - Structured logging with audit trails

## Usage

```typescript
import {
  loadConfig,
  getNorwegianComplianceConfig,
} from '@xala-technologies/foundation/config-loader';

// Load complete configuration
const config = loadConfig({
  environment: 'production',
  enableNorwegianCompliance: true,
});

// Load only Norwegian compliance settings
const complianceConfig = getNorwegianComplianceConfig();
```

## Configuration Options

- `environment` - Runtime environment (development, staging, production)
- `configPath` - Custom configuration file path
- `enableNorwegianCompliance` - Enable Norwegian government compliance features

## Norwegian Compliance

This module automatically configures:

- **NSM security classifications** (ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG)
- **GDPR data protection** settings and retention policies
- **DigDir interoperability** standards and data formats
