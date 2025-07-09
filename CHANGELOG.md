# Changelog

All notable changes to the @xala-technologies/foundation package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2024-01-22

### Comprehensive User Story Test Suite Implementation

This release introduces a major testing milestone with **33 comprehensive user story tests** that validate real-world scenarios for Norwegian government-compliant applications.

#### 🧪 Testing Achievements

**Added**

- **33 real-world user story tests** covering all major foundation modules
- **Norwegian compliance testing** for NSM, GDPR, and DigDir standards
- **Municipality-specific test scenarios** (Oslo, Bergen, Trondheim use cases)
- **International deployment testing** for simplified non-Norwegian configurations
- **Comprehensive audit script** (`scripts/audit.sh`) with 7 audit categories
- **Complete module documentation** - README.md files for all 11 modules
- **Prettier code formatting** configuration and integration

#### 📊 Test Coverage by Module

- **Config-loader (7 tests)** - Norwegian municipality configuration, developer environments, production settings, compliance validation, international deployment
- **Feature-toggle (8 tests)** - Gradual rollouts, emergency disables, organization targeting, beta access, Norwegian municipality features, compliance access control
- **Logger (9 tests)** - Security audit trails, production debugging, performance tracking, GDPR compliance, NSM classification, contextual logging
- **Error-handler (9 tests)** - User-friendly error handling, admin alerts, developer debugging, compliance categorization, support analytics

#### 🇳🇴 Norwegian Government Compliance Validation

- **NSM Security Classifications** - Validates ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG handling with proper access control
- **GDPR Audit Trails** - Tests personal data processing with legal basis tracking and retention policies
- **DigDir Standards** - Verifies interoperability and accessibility compliance requirements
- **Municipality targeting** - Norwegian municipality codes (Oslo 0301, Bergen 4601, Trondheim 5001) properly supported
- **Security clearance validation** - Classified features properly restrict access based on user clearance

#### 🌐 Real-World Scenarios Tested

- **Trondheim Kommune** database configuration for facility booking system
- **Operations team** emergency feature disabling with proper audit trails
- **Security auditor** compliance requirements for sensitive data access
- **Support engineer** production debugging with comprehensive error context
- **Beta tester** early access programs with proper targeting
- **International clients** simplified configuration without Norwegian government integrations

#### 🔧 Quality Assurance Results

- ✅ **All 33 tests pass successfully** with comprehensive assertions
- ✅ **Full TypeScript compilation** with zero errors
- ✅ **Norwegian compliance features validated** across all modules
- ✅ **Perfect audit score** - 11/11 modules documented with comprehensive READMEs
- ✅ **Code formatting standardized** with Prettier integration

#### 🛠️ Development Experience Improvements

- **Enhanced testing commands** - `pnpm run test --testPathPattern=stories` for user story tests
- **Comprehensive package audit** - `./scripts/audit.sh` validates package health
- **Improved documentation** - Module READMEs with Norwegian compliance features and usage examples
- **Professional code formatting** - Prettier configuration ensuring consistent code style

This release establishes the foundation package as production-ready for Norwegian government applications with comprehensive test coverage that validates both technical functionality and regulatory compliance requirements.

## [2.0.0] - 2024-01-20

### Major Release - Complete Modular Architecture

This is a major release that transforms the foundation package into a comprehensive hub for event-driven Norwegian government-compliant architecture.

### What's Changed

#### 🏗️ Architecture Overhaul

- **Complete modular restructuring** - All functionality moved to `src/modules/` for better organization
- **Event-driven architecture** - New EventBus and ServiceRegistry for decoupled communication
- **Hub-and-spoke pattern** - Foundation package now serves as the central hub for all services
- **Improved TypeScript support** - Enhanced type definitions and better IDE integration

#### 🇳🇴 Norwegian Compliance Features

- **NSM security classifications** - Full support for ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG
- **GDPR compliance events** - Automated data processing and privacy compliance tracking
- **DigDir standards** - Implementation of Norwegian Digitalization Agency requirements
- **Norwegian formatting utilities** - Currency, date, and address formatting for Norwegian standards

#### 🔐 Security Enhancements

- **Encryption service** - AES-256-GCM encryption with NSM classification awareness
- **Audit logging** - Comprehensive audit trails for government compliance
- **Security validation** - Norwegian-specific validation functions and helpers
- **Tamper-proof logging** - Integrity protection for audit logs

#### 📦 Module System

- **Config module** - Environment-specific configuration management
- **Events module** - Event-driven communication infrastructure
- **Logger module** - Professional logging with Norwegian compliance features
- **Security module** - Encryption and security utilities
- **Types module** - Comprehensive TypeScript definitions
- **Utils module** - Norwegian-specific utility functions

#### 🛠️ Development Tools

- **GitHub Actions workflows** - CI/CD pipeline with security and compliance checks
- **Release management** - Automated versioning and publishing to GitHub Packages
- **Local scripts** - Professional release and publishing scripts
- **Comprehensive testing** - Unit tests, integration tests, and compliance validation

#### 📚 Documentation

- **Complete documentation suite** - Getting started, implementation guides, troubleshooting
- **Norwegian compliance guide** - Detailed compliance implementation instructions
- **Migration guide** - Step-by-step migration from 1.x to 2.0
- **Use cases documentation** - Real-world implementation examples
- **Security policy** - Comprehensive security and incident response procedures

### Added

#### Core Features

- EventBus singleton for type-safe event management
- ServiceRegistry for automatic service discovery and health monitoring
- EncryptionService with AES-256-GCM and RSA-4096 support
- Norwegian compliance event factories
- Comprehensive audit logging system
- Configuration management with environment validation
- Professional logger with structured output

#### Norwegian Compliance

- NSM security classification validation and events
- GDPR data processing compliance tracking
- DigDir standards implementation
- Norwegian formatting utilities (currency, dates, addresses)
- Compliance metadata tracking and reporting
- Government-specific validation functions

#### Development Infrastructure

- GitHub Actions CI/CD pipeline
- Security scanning with CodeQL and dependency auditing
- License compliance checking for government use
- Performance benchmarking and validation
- Automated publishing to GitHub Packages
- Local release and version management scripts

#### Documentation

- Complete API documentation
- Norwegian compliance implementation guide
- Migration guide from 1.x versions
- Troubleshooting documentation
- Real-world use case examples
- Security policy and incident response procedures

### Changed

#### Breaking Changes

- **Package structure** - All modules moved to `src/modules/` directory
- **Import paths** - All imports now use module-based paths
- **Configuration format** - New structured configuration system
- **Event system** - New event-driven architecture replaces direct service calls
- **TypeScript definitions** - Enhanced type system with better compliance support

#### API Changes

- Logger initialization now uses factory pattern
- Configuration services use new modular structure
- Event publishing requires EventBus registration
- Encryption methods use new service pattern
- Norwegian validators moved to government module

#### Dependencies

- Updated to pnpm package management
- Added pino for professional logging
- Enhanced TypeScript configuration
- Updated development dependencies for better tooling

### Deprecated

#### Legacy Features

- Direct service instantiation (use factories instead)
- Old configuration format (migrate to new structured format)
- Manual event handling (use EventBus for type safety)
- Legacy logging interface (use new Logger service)

### Removed

#### Duplicate Functionality

- Redundant validation functions consolidated
- Duplicate Norwegian compliance checking
- Legacy configuration interfaces
- Outdated type definitions
- Manual service registration patterns

### Fixed

#### Security Issues

- Enhanced encryption key management
- Improved audit log integrity protection
- Better error handling for compliance failures
- Secure configuration loading
- Validated dependency security

#### Performance Improvements

- Optimized event publishing performance
- Reduced bundle size through modular architecture
- Improved TypeScript compilation speed
- Better memory management for long-running services
- Enhanced service discovery caching

#### Norwegian Compliance

- Accurate NSM classification validation
- Proper GDPR event generation
- Correct DigDir standards implementation
- Fixed Norwegian formatting edge cases
- Improved compliance metadata accuracy

### Security

#### Compliance Standards

- **NSM compliance** - Full implementation of Norwegian security classifications
- **GDPR compliance** - Automated data processing and privacy controls
- **DigDir standards** - Norwegian government digitalization requirements
- **ISO 27001** - Information security management framework
- **NIST framework** - Cybersecurity risk management

#### Security Features

- AES-256-GCM encryption for sensitive data
- RSA-4096 for secure key exchange
- PBKDF2 password hashing
- Tamper-proof audit logging
- Secure configuration management
- Dependency vulnerability scanning

### Norwegian Compliance

This release maintains full compliance with:

- **NSM (Norwegian National Security Authority)** security classifications
- **GDPR (General Data Protection Regulation)** data protection requirements
- **DigDir (Norwegian Digitalization Agency)** digital service standards
- **Personvernforordningen** (Norwegian privacy regulation)
- **Arkivloven** (Norwegian archival law) for data retention

### Installation

```bash
pnpm add @xala-technologies/foundation@2.0.0
```

### Migration from 1.x

See the [Migration Guide](docs/migration-guide.md) for detailed instructions on upgrading from 1.x versions.

### Documentation

- [Getting Started](docs/getting-started.md)
- [Implementation Guide](docs/implementation-guide.md)
- [Norwegian Compliance](docs/compliance/norwegian-compliance.md)
- [API Documentation](docs/README.md)

### Contributors

This release was made possible by the dedicated work of the Xala Technologies team, with special focus on Norwegian government compliance requirements and security standards.

---

## [1.x.x] - Previous Versions

Previous versions provided basic foundation functionality. See individual release notes for details.

### Note on Version History

This changelog represents the complete rewrite and modernization of the foundation package for version 2.0.0. Earlier versions provided basic infrastructure but lacked the comprehensive Norwegian compliance features and modular architecture introduced in this release.
