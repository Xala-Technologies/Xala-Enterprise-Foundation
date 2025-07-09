# Contributing Guide

This guide outlines how to contribute to the foundation package. We welcome contributions that enhance Norwegian government compliance, improve security, or add valuable functionality for government applications.

## Code of Conduct

This project serves Norwegian government applications and must maintain the highest standards of professionalism, security, and compliance. All contributors are expected to:

- Prioritize security and compliance in all contributions
- Write clean, well-documented, and tested code
- Follow Norwegian government coding standards where applicable
- Respect the sensitivity of government application requirements
- Maintain confidentiality regarding any sensitive information

## Getting Started

### Prerequisites

Ensure you have the development environment properly set up:

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
- Git with proper configuration
- TypeScript knowledge (required)
- Understanding of Norwegian compliance requirements (preferred)

### Development Setup

1. **Fork and Clone the Repository**

```bash
# Fork the repository on GitHub first
git clone https://github.com/your-username/foundation.git
cd foundation

# Add upstream remote
git remote add upstream https://github.com/xala-technologies/foundation.git
```

2. **Install Dependencies**

```bash
# Install using pnpm (required)
pnpm install

# Verify installation
pnpm run build
pnpm run test
```

3. **Development Environment**

```bash
# Start development mode
pnpm run dev

# Run tests in watch mode
pnpm run test:watch

# Run linting
pnpm run lint
```

## Development Workflow

### Branch Management

We use a structured branching strategy appropriate for government software:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features or enhancements
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes
- `compliance/*` - Compliance-related changes

### Creating a Feature Branch

```bash
# Update your local repository
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... code, test, document ...

# Commit with descriptive messages
git commit -m "Add Norwegian formatter for postal codes

- Implement validation for Norwegian postal code format
- Add comprehensive test coverage
- Update documentation with usage examples
- Ensure GDPR compliance for address formatting"
```

### Commit Message Standards

Use descriptive commit messages that explain the business value:

```
Type: Brief summary (50 chars max)

- Detailed explanation of what changed
- Why the change was necessary
- Any compliance or security implications
- Breaking changes (if any)

Closes #issue-number
```

**Types:**

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions or modifications
- `chore:` Maintenance tasks
- `security:` Security-related changes
- `compliance:` Norwegian compliance updates

## Contribution Areas

### High Priority Areas

1. **Norwegian Compliance Enhancements**
   - NSM security classification improvements
   - GDPR feature additions
   - DigDir standard implementations
   - Audit trail enhancements

2. **Security Improvements**
   - Encryption algorithm updates
   - Access control enhancements
   - Vulnerability fixes
   - Security testing additions

3. **Performance Optimizations**
   - Event system performance
   - Memory usage improvements
   - Database query optimizations
   - Load testing and benchmarks

### Module-Specific Contributions

#### Events Module

```typescript
// Example: Adding a new compliance event type
export class NorwegianComplianceEvents {
  // Add new event factory function
  static createDataRetentionEvent(
    entityType: string,
    entityId: string,
    retentionPeriod: string,
    scheduledDeletion: Date
  ): ComplianceEvent {
    return {
      eventId: `retention_${Date.now()}`,
      eventType: 'compliance.data.retention.scheduled',
      timestamp: new Date(),
      compliance: {
        classification: 'BEGRENSET',
        gdprApplicable: true,
        personalDataIncluded: true,
        auditRequired: true,
        retentionPeriod: retentionPeriod,
        legalBasis: 'legal_obligation',
      },
      data: {
        entityType,
        entityId,
        scheduledDeletion: scheduledDeletion.toISOString(),
        retentionPolicy: retentionPeriod,
      },
      norwegian: {
        locale: 'nb',
        governmentLevel: 'LOCAL',
        serviceArea: 'DATA_RETENTION',
      },
    };
  }
}
```

#### Security Module

```typescript
// Example: Adding new encryption method
export class EncryptionService {
  async encryptWithHardwareSecurityModule(
    data: string,
    classification: NSMSecurityClassification
  ): Promise<string> {
    // Ensure this meets NSM requirements for hardware security
    if (classification === 'HEMMELIG') {
      // Use HSM for highest classification
      return this.hsmEncrypt(data);
    }

    // Fall back to software encryption for lower classifications
    return this.softwareEncrypt(data);
  }
}
```

#### Utilities Module

```typescript
// Example: Adding Norwegian business validation
export class NorwegianValidators {
  static validateOrganizationNumber(orgNumber: string): boolean {
    // Implement Brønnøysundregistrene validation
    if (!/^\d{9}$/.test(orgNumber)) return false;

    // Mod 11 checksum validation for Norwegian org numbers
    const weights = [3, 2, 7, 6, 5, 4, 3, 2];
    const digits = orgNumber.split('').map(Number);

    const sum = digits.slice(0, 8).reduce((acc, digit, i) => acc + digit * weights[i], 0);

    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;

    return checkDigit === digits[8];
  }
}
```

## Testing Requirements

All contributions must include comprehensive tests. We maintain high test coverage to ensure reliability in government applications.

### Testing Standards

1. **Unit Tests** - Test individual functions and classes
2. **Integration Tests** - Test module interactions
3. **Compliance Tests** - Verify Norwegian compliance features
4. **Security Tests** - Validate security measures
5. **Performance Tests** - Ensure acceptable performance

### Test Structure

```typescript
// src/modules/utils/__tests__/norwegian-validators.test.ts
import { NorwegianValidators } from '../norwegian-validators';

describe('NorwegianValidators', () => {
  describe('validateOrganizationNumber', () => {
    test('should validate correct organization numbers', () => {
      // Test with known valid org numbers
      expect(NorwegianValidators.validateOrganizationNumber('123456785')).toBe(true);
      expect(NorwegianValidators.validateOrganizationNumber('987654321')).toBe(true);
    });

    test('should reject invalid organization numbers', () => {
      expect(NorwegianValidators.validateOrganizationNumber('123456789')).toBe(false);
      expect(NorwegianValidators.validateOrganizationNumber('12345678')).toBe(false);
      expect(NorwegianValidators.validateOrganizationNumber('abcdefghi')).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(NorwegianValidators.validateOrganizationNumber('')).toBe(false);
      expect(NorwegianValidators.validateOrganizationNumber(null as any)).toBe(false);
      expect(NorwegianValidators.validateOrganizationNumber(undefined as any)).toBe(false);
    });
  });
});
```

### Compliance Testing

```typescript
// src/__tests__/compliance/gdpr-compliance.test.ts
import { NorwegianComplianceEvents, EventBus } from '../../../';

describe('GDPR Compliance', () => {
  test('should generate complete audit trail for data processing', async () => {
    const eventBus = EventBus.getInstance();
    const auditEvents: any[] = [];

    // Capture audit events
    eventBus.subscribe('*.gdpr.*', event => {
      auditEvents.push(event);
    });

    // Create GDPR data processing event
    const gdprEvent = NorwegianComplianceEvents.createGDPRDataProcessingEvent(
      'test.data.processing',
      { citizenId: '12345678901' },
      ['personal_data'],
      'public_task'
    );

    await eventBus.publish(gdprEvent);

    // Verify compliance metadata
    expect(gdprEvent.compliance.gdprApplicable).toBe(true);
    expect(gdprEvent.compliance.legalBasis).toBe('public_task');
    expect(gdprEvent.compliance.auditRequired).toBe(true);
    expect(auditEvents).toHaveLength(1);
  });
});
```

### Performance Testing

```typescript
// src/__tests__/performance/event-bus.benchmark.test.ts
import { EventBus } from '../../../';

describe('EventBus Performance', () => {
  test('should handle high-volume event publishing', async () => {
    const eventBus = EventBus.getInstance();
    const eventCount = 10000;
    const startTime = Date.now();

    // Publish many events
    const promises = Array.from({ length: eventCount }, (_, i) =>
      eventBus.publish({
        eventId: `perf_test_${i}`,
        eventType: 'performance.test',
        timestamp: new Date(),
        data: { index: i },
      })
    );

    await Promise.all(promises);

    const duration = Date.now() - startTime;
    const eventsPerSecond = eventCount / (duration / 1000);

    // Should handle at least 1000 events per second
    expect(eventsPerSecond).toBeGreaterThan(1000);
  });
});
```

## Documentation Requirements

### Code Documentation

All public APIs must include comprehensive JSDoc comments:

````typescript
/**
 * Validates Norwegian organization numbers according to Brønnøysundregistrene standards.
 *
 * Organization numbers in Norway are 9-digit numbers with a mod-11 checksum.
 * This function validates both the format and the checksum.
 *
 * @param orgNumber - The organization number to validate (9 digits)
 * @returns True if the organization number is valid according to Norwegian standards
 *
 * @example
 * ```typescript
 * // Valid organization number
 * const isValid = NorwegianValidators.validateOrganizationNumber('123456785');
 * console.log(isValid); // true
 *
 * // Invalid organization number
 * const isInvalid = NorwegianValidators.validateOrganizationNumber('123456789');
 * console.log(isInvalid); // false
 * ```
 *
 * @see {@link https://www.brreg.no/om-oss/oppgavene-vare/alle-registrene-vare/om-enhetsregisteret/organisasjonsnummeret/}
 * @since 2.1.0
 */
export static validateOrganizationNumber(orgNumber: string): boolean {
  // Implementation...
}
````

### Module Documentation

When adding new modules, create comprehensive documentation:

```markdown
# New Module Documentation

## Overview

Brief description of the module's purpose and how it fits into the foundation package.

## Norwegian Compliance

Explanation of how the module supports Norwegian government requirements.

## API Reference

Detailed API documentation with examples.

## Integration Examples

Real-world usage examples showing integration patterns.

## Security Considerations

Security implications and best practices.
```

## Security Considerations

### Security Review Process

All contributions undergo security review:

1. **Automated Security Scanning** - GitHub security advisories and dependency checks
2. **Code Review** - Manual review by security-conscious maintainers
3. **Compliance Review** - Norwegian compliance expert review
4. **Penetration Testing** - For significant security changes

### Security Guidelines

```typescript
// Example: Secure coding practices

// ✅ Good: Input validation and sanitization
export function processUserInput(input: string): string {
  // Validate input format
  if (!input || input.length > 1000) {
    throw new Error('Invalid input length');
  }

  // Sanitize input
  const sanitized = input.replace(/[<>\"']/g, '');

  // Additional validation
  if (!/^[a-zA-Z0-9\s\-\.]+$/.test(sanitized)) {
    throw new Error('Invalid characters in input');
  }

  return sanitized;
}

// ❌ Bad: No input validation
export function processUserInputBad(input: string): string {
  return input; // Dangerous: no validation
}
```

### Secrets Management

```typescript
// ✅ Good: Proper secrets handling
const encryptionKey = process.env.ENCRYPTION_KEY;
if (!encryptionKey) {
  throw new Error('ENCRYPTION_KEY environment variable required');
}

// ❌ Bad: Hardcoded secrets
const encryptionKey = 'hardcoded-secret-key'; // Never do this
```

## Pull Request Process

### Before Submitting

1. **Run Full Test Suite**

```bash
pnpm run validate  # Runs lint, type-check, and test
```

2. **Update Documentation**

```bash
# Update relevant documentation
# Add examples for new features
# Update CHANGELOG.md
```

3. **Compliance Check**

```bash
# Verify Norwegian compliance features work
pnpm run test:compliance
```

### Pull Request Template

When creating a pull request, include:

```markdown
## Description

Brief description of changes and motivation.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Security improvement
- [ ] Norwegian compliance enhancement

## Norwegian Compliance Impact

Describe how this change affects Norwegian government compliance requirements.

## Security Considerations

Any security implications of this change.

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Compliance tests pass
- [ ] Manual testing completed

## Documentation

- [ ] Code comments updated
- [ ] README updated (if applicable)
- [ ] API documentation updated
- [ ] Examples added/updated

## Breaking Changes

List any breaking changes and migration steps required.

## Checklist

- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have added necessary documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. **Automated Checks** - CI/CD pipeline runs tests and linting
2. **Security Review** - Security-focused code review
3. **Compliance Review** - Norwegian compliance verification
4. **Technical Review** - Code quality and architecture review
5. **Final Approval** - Maintainer approval required

## Coding Standards

### TypeScript Standards

```typescript
// Use strict type definitions
interface NorwegianAddress {
  readonly streetAddress: string;
  readonly postalCode: string; // Norwegian postal codes are 4 digits
  readonly city: string;
  readonly municipality: string;
  readonly county?: string;
}

// Use proper error handling
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Use meaningful function names
function validateNorwegianPostalCode(postalCode: string): boolean {
  return /^\d{4}$/.test(postalCode);
}
```

### File Organization

```
src/modules/[module-name]/
├── index.ts                 // Module exports
├── types.ts                 // Type definitions
├── [feature].service.ts     // Service implementations
├── [feature].validator.ts   // Validation functions
├── __tests__/               // Test files
│   ├── [feature].test.ts
│   └── integration/
└── docs/                    // Module documentation
    └── README.md
```

### Import Standards

```typescript
// Group imports logically
import { createHash } from 'crypto';
import { promises as fs } from 'fs';

import { EventBus, logger } from '@xala-technologies/foundation';

import { validateInput } from '../utils/validation';
import { NorwegianCompliance } from './types';
```

## Release Process

### Version Numbering

We follow semantic versioning with Norwegian government considerations:

- **Major** (x.0.0) - Breaking changes or major compliance updates
- **Minor** (x.y.0) - New features, compliance enhancements
- **Patch** (x.y.z) - Bug fixes, security patches

### Release Checklist

1. **Pre-Release Testing**
   - [ ] Full test suite passes
   - [ ] Performance benchmarks meet requirements
   - [ ] Security scan completed
   - [ ] Compliance verification completed

2. **Documentation Updates**
   - [ ] CHANGELOG.md updated
   - [ ] README.md updated
   - [ ] API documentation updated
   - [ ] Migration guide updated (for breaking changes)

3. **Release Preparation**
   - [ ] Version bumped in package.json
   - [ ] Git tag created
   - [ ] Release notes prepared

## Community Guidelines

### Communication

- Use GitHub issues for bug reports and feature requests
- Use GitHub discussions for questions and general discussion
- Be respectful and professional in all communications
- Provide detailed information when reporting issues

### Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes for significant contributions
- GitHub repository contributor metrics

Thank you for contributing to the foundation package. Your contributions help make Norwegian government applications more secure, compliant, and maintainable.
