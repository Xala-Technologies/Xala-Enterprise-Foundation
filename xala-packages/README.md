# Xala Enterprise Package Ecosystem

This directory contains all 11 packages in the Xala Enterprise ecosystem, each providing Norwegian government-compliant functionality for different aspects of enterprise application development.

## Packages Overview

### Authentication & Security
- **@xala-technologies/authentication** - Multi-modal authentication with Norwegian government integration
- **@xala-technologies/security-compliance** - Automated Norwegian compliance and security enforcement

### Business Logic & Services
- **@xala-technologies/business-services** - Domain-agnostic business logic patterns and workflows
- **@xala-technologies/platform-services** - Infrastructure concerns and external system integrations
- **@xala-technologies/norwegian-services** - Norwegian government API integrations

### Data & Documents
- **@xala-technologies/data-services** - Multi-database support with Norwegian data governance
- **@xala-technologies/document-services** - Document management with Norwegian archival standards

### Development & Quality
- **@xala-technologies/ui-system** - Enterprise-grade component library with Norwegian compliance
- **@xala-technologies/test-infrastructure** - Comprehensive testing framework with compliance validation
- **@xala-technologies/api-scaffolding** - Automated API generation from domain models
- **@xala-technologies/monitoring-services** - Comprehensive observability and performance monitoring

## Norwegian Compliance Features

All packages include:
- 🇳🇴 **NSM Security Classifications** (ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG)
- 🛡️ **GDPR Compliance** with automatic data protection
- 🏛️ **DigDir Standards** for government interoperability
- ♿ **WCAG 2.2 AA Accessibility** compliance
- 🌐 **Multi-language Support** (Bokmål, Nynorsk, English)

## Development Workflow

```bash
# Install dependencies in all packages
find . -name "package.json" -not -path "*/node_modules/*" -execdir pnpm install \;

# Run tests across all packages
find . -name "package.json" -not -path "*/node_modules/*" -execdir pnpm test \;

# Run Norwegian compliance validation
find . -name "package.json" -not -path "*/node_modules/*" -execdir pnpm run compliance:full \;

# Build all packages
find . -name "package.json" -not -path "*/node_modules/*" -execdir pnpm build \;
```

## Architecture

Each package follows the same architectural patterns:
- **Multi-platform support** (web, mobile, desktop, API)
- **Modular design** with dependency injection
- **Event-driven architecture** with typed events
- **Comprehensive testing** with compliance validation
- **Norwegian government integration** ready

## Getting Started

1. Choose a package directory
2. Read the package-specific README.md
3. Follow the setup instructions
4. Implement your business logic
5. Run compliance validation
6. Deploy with confidence

---

**Xala Technologies** - Building the future of Norwegian digital government solutions
