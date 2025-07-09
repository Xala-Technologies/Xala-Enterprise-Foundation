# Testing Guide

This guide provides comprehensive information about testing the Foundation Package, including our user story test suite, Norwegian compliance validation, and testing best practices.

## Overview

The Foundation Package features a comprehensive test suite with **33 real-world user story tests** that validate actual scenarios encountered in Norwegian government applications. Our testing approach ensures both technical functionality and regulatory compliance.

## Test Suite Architecture

### Test Categories

#### 1. User Story Tests (`*.stories.test.ts`)

Real-world scenario testing covering complete user workflows from different perspectives:

- **Norwegian Municipality Staff** - Municipal database configuration, local government requirements
- **Application Developers** - Local development setup, debugging workflows, API integration
- **Operations Teams** - Emergency procedures, system monitoring, feature management
- **Compliance Officers** - Audit requirements, security classifications, regulatory reporting
- **Support Engineers** - Production troubleshooting, error investigation, user assistance
- **International Clients** - Simplified deployments without Norwegian government dependencies

#### 2. Unit Tests (`*.test.ts`)

Module-level testing focusing on individual component functionality:

- Function-level validation
- Error boundary testing
- Edge case coverage
- Performance validation

#### 3. Integration Tests

Cross-module interaction testing:

- Event system integration
- Configuration loading chains
- Logging and audit trail coordination
- Security classification enforcement

## User Story Test Suite

### Module Coverage

#### Config-loader Module (7 tests)

Tests covering configuration management scenarios:

```typescript
// Norwegian Municipality Story
it('should securely load database config for Trondheim Kommune', () => {
  // Validates municipal database configuration with NSM compliance
});

// Developer Story
it('should provide sensible defaults for local development', () => {
  // Tests local development environment setup
});

// System Admin Story
it('should handle production configuration for maintenance scenarios', () => {
  // Validates production environment configuration
});

// Security Team Story
it('should validate NSM compliance configuration', () => {
  // Tests security classification and audit requirements
});

// International Client Story
it('should support simplified non-Norwegian configuration', () => {
  // Tests international deployment without Norwegian services
});
```

#### Feature-toggle Module (8 tests)

Tests covering feature flag management:

```typescript
// Product Manager Story
it('should gradually roll out new booking calendar to 25% of users', () => {
  // Tests gradual feature rollout with consistent user targeting
});

// Emergency Response Story
it('should immediately disable problematic feature across all users', () => {
  // Tests emergency feature disable with audit trails
});

// Municipality Admin Story
it('should enable premium features for specific organizations', () => {
  // Tests organization-based feature targeting
});

// Beta Tester Story
it('should provide early access to experimental features for beta users', () => {
  // Tests beta user program management
});

// Operations Story
it('should manage features across different environments and contexts', () => {
  // Tests environment-specific feature management
});
```

#### Logger Module (9 tests)

Tests covering comprehensive logging scenarios:

```typescript
// Security Auditor Story
it('should log complete audit trail for sensitive operations', () => {
  // Tests compliance audit logging with NSM classification
});

// Support Engineer Story
it('should provide detailed context for production debugging', () => {
  // Tests error logging with correlation IDs and context
});

// Performance Analyst Story
it('should track operation performance metrics', () => {
  // Tests performance logging and metrics collection
});

// GDPR Compliance Story
it('should track personal data access with retention policies', () => {
  // Tests GDPR-compliant logging with legal basis tracking
});

// Norwegian Municipality Story
it('should support NSM security classification logging', () => {
  // Tests classified logging for Norwegian government use
});
```

#### Error-handler Module (9 tests)

Tests covering error management scenarios:

```typescript
// User Story
it('should provide helpful error handling for booking conflicts', () => {
  // Tests user-friendly error messages and resolution guidance
});

// System Admin Story
it('should immediately alert admin for critical failures', () => {
  // Tests critical error alerting and escalation
});

// Developer Story
it('should provide detailed context for API integration failures', () => {
  // Tests developer debugging information and error context
});

// Compliance Team Story
it('should categorize errors for compliance reporting', () => {
  // Tests error categorization for audit and compliance purposes
});

// Customer Support Story
it('should provide comprehensive error tracking and statistics', () => {
  // Tests error analytics and support workflows
});
```

## Norwegian Compliance Testing

### NSM Security Classifications

Our tests validate proper handling of Norwegian Security Authority classifications:

```typescript
// Test NSM classification enforcement
expect(complianceConfig.nsm.securityClassification).toBe('KONFIDENSIELT');
expect(securityReport?.context.nsmClassification).toBe('HEMMELIG');

// Test access control based on classification
expect(featureToggle.isEnabled('classified_feature', userWithClearance)).toBe(true);
expect(featureToggle.isEnabled('classified_feature', userWithoutClearance)).toBe(false);
```

**Classifications Tested:**

- **ÅPEN** - Open information, no special handling required
- **BEGRENSET** - Restricted information, access control required
- **KONFIDENSIELT** - Confidential information, security clearance required
- **HEMMELIG** - Secret information, highest level clearance required

### GDPR Compliance Testing

Tests validate proper personal data handling:

```typescript
// Test GDPR audit trail creation
expect(auditTrail).toMatchObject({
  gdprBasis: 'contract',
  personalDataIncluded: true,
  legalJustification: 'Folketrygdloven § 21-12',
  retentionPeriod: 'P7Y',
});
```

**GDPR Features Tested:**

- Legal basis tracking for data processing
- Personal data identification and flagging
- Audit trail generation for compliance reporting
- Data retention period management
- Cross-border transfer validation

### DigDir Standards Testing

Tests validate compliance with Norwegian Digitalization Agency requirements:

```typescript
// Test DigDir interoperability standards
expect(complianceConfig.digdir.interoperabilityStandards).toBe(true);
expect(complianceConfig.digdir.accessibilityLevel).toBe('AA');
```

**DigDir Standards Tested:**

- Service registration compliance
- API documentation standards
- Accessibility compliance (WCAG 2.2 AA)
- Norwegian language support
- Interoperability requirements

## Running Tests

### Basic Test Commands

```bash
# Run all tests
pnpm run test

# Run user story tests specifically
pnpm run test --testPathPattern=stories

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:watch

# Run comprehensive validation
pnpm run validate
```

### Advanced Test Commands

```bash
# Run tests for specific module
pnpm run test config-loader

# Run tests with specific pattern
pnpm run test --testNamePattern="Norwegian Municipality"

# Run tests with detailed output
pnpm run test --verbose

# Run tests and update snapshots
pnpm run test --updateSnapshot
```

### Package Health Audit

```bash
# Run comprehensive package audit
./scripts/audit.sh

# Audit specific category
./scripts/audit.sh --category="testing"
```

## Test Development Guidelines

### Writing User Story Tests

When adding new user story tests, follow this structure:

```typescript
describe('Module User Stories', () => {
  // User Story Pattern: Role + Goal + Context
  it('Role Story: should achieve goal in specific context', () => {
    // Given: Setup the scenario with realistic data
    const context = {
      userId: 'realistic_user_id',
      operation: 'specific_operation',
      municipality: 'oslo', // Use real Norwegian municipality codes
    };

    // When: Execute the functionality being tested
    const result = moduleFunction(context);

    // Then: Validate both functionality and compliance
    expect(result).toMatchObject({
      // Functional assertions
      success: true,
      data: expect.any(Object),

      // Compliance assertions
      auditTrail: expect.objectContaining({
        nsmClassification: expect.any(String),
        gdprCompliant: true,
      }),
    });
  });
});
```

### Norwegian Compliance Test Patterns

#### NSM Classification Testing

```typescript
// Test security classification enforcement
expect(classifiedOperation).toRequireSecurityClearance('KONFIDENSIELT');
expect(auditLog.nsmClassification).toBe('BEGRENSET');
```

#### GDPR Compliance Testing

```typescript
// Test personal data handling
expect(personalDataOperation).toHaveGDPRBasis('public_task');
expect(auditTrail.personalDataIncluded).toBe(true);
expect(retentionPolicy).toBe('P7Y'); // 7 years ISO 8601
```

#### DigDir Standards Testing

```typescript
// Test accessibility and interoperability
expect(serviceRegistration).toMeetDigDirStandards();
expect(apiDocumentation).toHaveAccessibilityLevel('AA');
```

## Test Data Management

### Realistic Test Data

Use realistic Norwegian data in tests:

```typescript
// Norwegian municipality codes
const municipalityCodes = {
  oslo: '0301',
  bergen: '4601',
  trondheim: '5001',
  stavanger: '1103',
};

// Norwegian personal identifiers (test data only)
const testPersonnummer = '12345678901';

// Norwegian addresses
const testAddress = {
  street: 'Storgata',
  houseNumber: '15',
  postalCode: '0184',
  city: 'Oslo',
};
```

### Security Test Data

For security testing, use appropriate test classifications:

```typescript
// NSM test classifications
const testClassifications = {
  public: 'ÅPEN',
  restricted: 'BEGRENSET',
  confidential: 'KONFIDENSIELT',
  secret: 'HEMMELIG',
};

// GDPR test scenarios
const gdprTestCases = {
  consent: { basis: 'consent', dataTypes: ['email', 'name'] },
  contract: { basis: 'contract', dataTypes: ['address', 'phone'] },
  publicTask: { basis: 'public_task', dataTypes: ['personnummer'] },
};
```

## Continuous Integration

### GitHub Actions Integration

Our CI pipeline includes comprehensive testing:

```yaml
# .github/workflows/test.yml
- name: Run User Story Tests
  run: pnpm run test --testPathPattern=stories

- name: Run Compliance Tests
  run: pnpm run test --testPathPattern=compliance

- name: Generate Coverage Report
  run: pnpm run test:coverage

- name: Run Package Audit
  run: ./scripts/audit.sh
```

### Quality Gates

Tests must pass these quality gates:

- **100% user story test coverage** - All core scenarios tested
- **Norwegian compliance validation** - NSM, GDPR, DigDir requirements met
- **TypeScript compilation** - Zero compilation errors
- **ESLint validation** - Code quality standards met
- **Package audit** - Security and dependency validation

## Troubleshooting Tests

### Common Test Issues

#### Mock Setup Issues

```typescript
// Ensure proper mock cleanup
afterEach(() => {
  jest.clearAllMocks();
  // Restore console methods
  mockConsole.log.mockRestore();
  mockConsole.warn.mockRestore();
  mockConsole.error.mockRestore();
});
```

#### Async Test Issues

```typescript
// Use proper async/await patterns
it('should handle async operations', async () => {
  const result = await asyncOperation();
  expect(result).toBeDefined();
});
```

#### Environment Variable Issues

```typescript
// Store and restore environment variables
beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});
```

### Test Debugging

Enable detailed test output:

```bash
# Run tests with debugging information
DEBUG=foundation:* pnpm run test

# Run specific test with console output
pnpm run test --testNamePattern="specific test" --verbose
```

## Best Practices

### Test Organization

- Group tests by user role and scenario
- Use descriptive test names that explain the business value
- Include both happy path and error scenarios
- Test Norwegian compliance features comprehensively

### Test Quality

- Validate both functional and compliance requirements
- Use realistic Norwegian data (municipality codes, addresses)
- Test error handling and edge cases
- Ensure tests are deterministic and reliable

### Performance

- Keep tests fast and focused
- Use proper test isolation
- Mock external dependencies appropriately
- Run tests in parallel when possible

### Documentation

- Document test scenarios and their business value
- Explain Norwegian compliance requirements being tested
- Provide examples of test data and expected outcomes
- Keep test documentation updated with code changes

## Integration with Development Workflow

### Pre-commit Testing

```bash
# Run quick validation before commit
pnpm run validate

# Run user story tests for changed modules
pnpm run test --onlyChanged
```

### Code Review Guidelines

- Ensure new features include user story tests
- Validate Norwegian compliance test coverage
- Review test data for realism and appropriateness
- Check test documentation and comments

### Release Testing

```bash
# Run full test suite before release
pnpm run test
pnpm run test:coverage
./scripts/audit.sh
pnpm run build
```

This comprehensive testing approach ensures the Foundation Package meets the highest standards for Norwegian government applications while providing excellent developer experience and reliable functionality.
