# Development Workflow

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
- TypeScript 5.0.0 or higher
- Git with proper Norwegian government compliance configuration

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/xala-technologies/foundation.git
cd foundation

# Install dependencies
pnpm install

# Verify installation
pnpm run validate
```

### Development Environment Configuration

```bash
# Type checking
pnpm run type-check

# Linting with auto-fix
pnpm run lint:fix

# Build the package
pnpm run build

# Run tests
pnpm run test

# Watch mode for development
pnpm run build:watch
pnpm run test:watch
```

## Code Organization

### Module Structure

Each module follows a consistent structure:

```
src/module-name/
├── index.ts                 # Public API exports
├── interfaces/             # TypeScript interfaces
│   └── module.interface.ts
├── services/              # Core business logic
│   └── module.service.ts
├── types/                 # Type definitions
│   └── module.types.ts
├── providers/             # Implementation providers
│   └── module.provider.ts
├── __tests__/             # Test files
│   ├── module.service.test.ts
│   └── module.stories.test.ts
└── README.md              # Module documentation
```

### File Naming Conventions

- **Services**: `*.service.ts` for core business logic
- **Interfaces**: `*.interface.ts` for TypeScript interfaces
- **Types**: `*.types.ts` for type definitions
- **Providers**: `*.provider.ts` for implementation providers
- **Tests**: `*.test.ts` for unit tests, `*.stories.test.ts` for user story tests
- **Factories**: `*.factory.ts` for object creation patterns

## Development Standards

### TypeScript Best Practices

```typescript
// Use strict typing
interface NorwegianMunicipalityConfig {
  readonly municipalityCode: string; // e.g., "0301" for Oslo
  readonly name: string;
  readonly region: string;
  readonly classification: NSMClassification;
}

// Use readonly for immutable data
type NSMClassification = 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';

// Use generic types appropriately
interface ServiceResponse<T> {
  data: T;
  metadata: ComplianceMetadata;
  auditTrail: AuditEntry[];
}
```

### Norwegian Compliance Patterns

```typescript
// Always include compliance metadata
interface ComplianceContext {
  classification: NSMClassification;
  legalBasis: GDPRLegalBasis;
  municipalityCode?: string;
  userId: string;
  timestamp: Date;
}

// Security classification handling
class SecureDataProcessor {
  async processData(data: unknown, context: ComplianceContext): Promise<ProcessedData> {
    // Validate classification
    this.validateClassification(context.classification);

    // Apply encryption if required
    if (this.requiresEncryption(context.classification)) {
      data = await this.encryptData(data, context);
    }

    // Generate audit trail
    await this.auditLogger.log('data.processed', context);

    return this.process(data);
  }
}
```

### Error Handling Patterns

```typescript
// Norwegian compliance error handling
class ComplianceError extends Error {
  constructor(
    message: string,
    public readonly classification: NSMClassification,
    public readonly errorCode: string,
    public readonly context: ComplianceContext
  ) {
    super(message);
    this.name = 'ComplianceError';
  }
}

// Usage pattern
try {
  await processClassifiedData(data, context);
} catch (error) {
  if (error instanceof ComplianceError) {
    await this.handleComplianceError(error);
  }
  throw error;
}
```

## Testing Workflow

### Test-Driven Development

1. **Write User Story Test**: Start with real-world scenario
2. **Implement Interface**: Define the public API
3. **Write Unit Tests**: Cover implementation details
4. **Implement Service**: Build the actual functionality
5. **Validate Compliance**: Ensure Norwegian standards compliance

### User Story Test Pattern

```typescript
describe('User Story: Norwegian Municipality Configuration', () => {
  it('should configure Trondheim Kommune database with proper security settings', async () => {
    // Given: A developer setting up Trondheim Kommune database
    const municipalityCode = '5001'; // Trondheim
    const configRequest = {
      environment: 'production',
      municipality: municipalityCode,
      requiredCompliance: ['NSM', 'GDPR', 'DigDir'],
    };

    // When: Loading municipality-specific configuration
    const config = await configLoader.loadMunicipalityConfig(configRequest);

    // Then: Correct database credentials and regional settings applied
    expect(config.database.host).toBe('trondheim-kommune-db.norway.gov');
    expect(config.database.ssl).toBe(true);
    expect(config.compliance.nsmClassification).toBe('BEGRENSET');
    expect(config.locale).toBe('nb-NO');
    expect(config.municipality.code).toBe('5001');
    expect(config.municipality.name).toBe('Trondheim Kommune');
  });
});
```

### Unit Test Pattern

```typescript
describe('ConfigLoaderService', () => {
  let service: ConfigLoaderService;
  let mockValidator: jest.Mocked<ComplianceValidator>;

  beforeEach(() => {
    mockValidator = createMockComplianceValidator();
    service = new ConfigLoaderService(mockValidator);
  });

  it('should validate NSM classification requirements', async () => {
    const config = { classification: 'KONFIDENSIELT' as NSMClassification };

    await service.validateConfiguration(config);

    expect(mockValidator.validateNSMClassification).toHaveBeenCalledWith('KONFIDENSIELT');
  });
});
```

## Code Quality Standards

### ESLint Configuration

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Code Review Checklist

- [ ] **Norwegian Compliance**: NSM classification handling, GDPR compliance, DigDir standards
- [ ] **Type Safety**: Proper TypeScript typing, no `any` types
- [ ] **Security**: Classification-aware processing, audit trail generation
- [ ] **Testing**: User story tests and unit tests with good coverage
- [ ] **Documentation**: Clear comments and API documentation
- [ ] **Performance**: Efficient algorithms and proper caching
- [ ] **Error Handling**: Comprehensive error scenarios and compliance errors

## Git Workflow

### Branch Naming Convention

```
feature/module-name-description
bugfix/issue-description
hotfix/critical-issue-description
compliance/security-update-description
```

### Commit Message Format

```
type(scope): description

feat(config-loader): add municipality-specific database configuration
fix(logger): resolve classification metadata handling issue
docs(testing): add comprehensive user story documentation
compliance(security): update NSM classification validation
```

### Pre-commit Validation

```bash
# Automated pre-commit checks
pnpm run lint
pnpm run type-check
pnpm run test
pnpm run build
```

## Production Deployment

### Build Process

```bash
# Clean previous build
pnpm run clean

# Validate code quality
pnpm run validate

# Build for production
pnpm run build

# Verify build integrity
node dist/index.js --version
```

### Environment Configuration

```typescript
// Production environment settings
const productionConfig = {
  logging: {
    level: 'info',
    format: 'json',
    auditTrail: true,
  },
  security: {
    classification: 'BEGRENSET',
    encryption: 'AES-256-GCM',
    auditRequired: true,
  },
  compliance: {
    nsm: true,
    gdpr: true,
    digdir: true,
  },
};
```

### Security Validation

```bash
# Security scanning
npm audit --production

# TypeScript security check
pnpm run type-check

# Compliance validation
pnpm run test:compliance
```

## Documentation Standards

### API Documentation

````typescript
/**
 * Loads configuration for a specific Norwegian municipality
 *
 * @param municipalityCode - Norwegian municipality code (e.g., "0301" for Oslo)
 * @param options - Configuration options including compliance requirements
 * @returns Promise resolving to municipality-specific configuration
 *
 * @example
 * ```typescript
 * const config = await configLoader.loadMunicipalityConfig('0301', {
 *   environment: 'production',
 *   compliance: ['NSM', 'GDPR']
 * });
 * ```
 *
 * @throws {ComplianceError} When municipality code is invalid or compliance requirements cannot be met
 */
async loadMunicipalityConfig(
  municipalityCode: string,
  options: ConfigurationOptions
): Promise<MunicipalityConfiguration>
````

### README Structure

Each module README should include:

1. **Purpose**: What the module does and why it exists
2. **Norwegian Compliance**: How it supports Norwegian government requirements
3. **API Reference**: Public interfaces and methods
4. **Examples**: Real-world usage scenarios
5. **Configuration**: Setup and configuration options
6. **Security**: Classification handling and security considerations

## Performance Guidelines

### Optimization Patterns

```typescript
// Efficient caching with security awareness
class SecureCache {
  private cache = new Map<string, CacheEntry>();

  async get<T>(key: string, classification: NSMClassification): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Validate access permissions based on classification
    if (!this.canAccess(entry.classification, classification)) {
      return null;
    }

    // Check TTL based on classification sensitivity
    const ttl = this.getTTLForClassification(classification);
    if (Date.now() - entry.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }
}
```

### Memory Management

- Use WeakMap for temporary references
- Implement proper cleanup in event listeners
- Avoid memory leaks in long-running processes
- Monitor memory usage in production environments

## Monitoring and Debugging

### Production Debugging

```typescript
// Structured logging for production debugging
logger.info('Municipality configuration loaded', {
  municipalityCode: '0301',
  classification: 'BEGRENSET',
  correlationId: request.correlationId,
  timestamp: new Date().toISOString(),
  duration: performance.now() - startTime,
});
```

### Health Monitoring

```typescript
// Health check implementation
export class FoundationHealthCheck implements HealthCheck {
  async check(): Promise<HealthCheckResult> {
    const results = await Promise.all([
      this.checkConfigLoader(),
      this.checkEventCore(),
      this.checkLogger(),
      this.checkCompliance(),
    ]);

    return {
      status: results.every(r => r.healthy) ? 'healthy' : 'unhealthy',
      checks: results,
      timestamp: new Date().toISOString(),
    };
  }
}
```

## Troubleshooting

### Common Issues

#### TypeScript Compilation Errors

```bash
# Clear TypeScript cache
rm -rf dist/
pnpm run clean
pnpm run build
```

#### Test Failures

```bash
# Run specific test file
pnpm test -- --testPathPattern=config-loader

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

#### Compliance Validation Issues

```bash
# Validate Norwegian compliance requirements
pnpm run test -- --testPathPattern=compliance

# Check security classifications
pnpm run validate:security
```

### Debug Configuration

```typescript
// Development debug configuration
const debugConfig = {
  logging: {
    level: 'debug',
    includeStack: true,
    correlationId: true,
  },
  testing: {
    mockExternalServices: true,
    useTestData: true,
  },
};
```

## Contributing Guidelines

### Pull Request Process

1. **Feature Branch**: Create from main branch
2. **Implementation**: Follow coding standards and patterns
3. **Testing**: Add user story tests and unit tests
4. **Documentation**: Update relevant documentation
5. **Review**: Submit for code review with compliance checklist
6. **Validation**: Ensure all CI/CD checks pass

### Code Review Focus Areas

- **Norwegian Compliance**: Proper handling of classifications and GDPR requirements
- **Security**: Audit trail generation and access control
- **Performance**: Efficient algorithms and resource usage
- **Maintainability**: Clear code structure and documentation
- **Testing**: Comprehensive test coverage and realistic scenarios

This development workflow ensures that all code contributions maintain the high quality and Norwegian compliance standards required for government applications.
