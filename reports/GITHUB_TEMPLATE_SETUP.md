# Xala Enterprise Package Template - GitHub Setup Guide

## Overview

This guide explains how to set up and use the GitHub template repository for creating all 11 packages in the Xala Enterprise ecosystem. The template ensures consistency, Norwegian compliance, and quality standards across all packages.

## Setting Up the Template Repository

### Step 1: Create the Template Repository

1. **Create a new repository** on GitHub:

   ```
   Repository name: xala-enterprise-package-template
   Description: Template for creating Norwegian-compliant enterprise packages in the Xala ecosystem
   Visibility: Private (or Public if desired)
   ✅ Template repository: CHECKED
   ```

2. **Clone the foundation repository** (this current repo):

   ```bash
   git clone https://github.com/Xala-Technologies/foundation.git
   cd foundation
   ```

3. **Copy template files** to the new template repository:

   ```bash
   # Create and clone the template repository
   git clone https://github.com/Xala-Technologies/xala-enterprise-package-template.git
   cd xala-enterprise-package-template

   # Copy all template files from foundation repo
   cp -r ../foundation/.github ./
   cp -r ../foundation/template/* ./
   cp ../foundation/xala-package-skeleton.md ./
   cp ../foundation/GITHUB_TEMPLATE_SETUP.md ./

   # Copy configuration files (with template variables)
   cp ../foundation/tsconfig.json ./
   cp ../foundation/tsconfig.build.json ./
   cp ../foundation/rollup.config.js ./
   cp ../foundation/jest.config.cjs ./
   cp ../foundation/.eslintrc.cjs ./
   cp ../foundation/.prettierrc.js ./
   cp ../foundation/commitlint.config.cjs ./
   cp ../foundation/.lintstagedrc.cjs ./
   cp ../foundation/.gitignore ./
   cp ../foundation/.npmignore ./
   ```

### Step 2: Template-ize Configuration Files

Update the copied configuration files to use template variables:

#### rollup.config.js

```javascript
// Replace package-specific banner with template variable
banner: '/* @xala-technologies/{{PACKAGE_NAME}} v2.0.0 - Core Package */',
```

#### .github/workflows/ci.yml

```yaml
# Update workflow name to use template variable
name: '{{PACKAGE_DISPLAY_NAME}} - Continuous Integration'
```

### Step 3: Create Template Directory Structure

```bash
# Create required directories
mkdir -p src
mkdir -p platforms/{web,mobile,desktop,api}
mkdir -p tests/{compliance,integration,performance,platforms}
mkdir -p docs/{compliance,guides,examples}
mkdir -p tools/cli
mkdir -p scripts
mkdir -p examples/{basic-usage,tutorials}

# Create placeholder files to maintain directory structure
touch src/.gitkeep
touch platforms/web/.gitkeep
touch platforms/mobile/.gitkeep
touch platforms/desktop/.gitkeep
touch platforms/api/.gitkeep
touch tests/compliance/.gitkeep
touch tests/integration/.gitkeep
touch tests/performance/.gitkeep
touch docs/compliance/.gitkeep
touch tools/cli/.gitkeep
touch examples/basic-usage/.gitkeep
```

### Step 4: Commit and Push Template

```bash
git add .
git commit -m "feat: initial template setup for Xala Enterprise packages

- Template configuration for Norwegian-compliant packages
- Multi-platform support (web, mobile, desktop, API)
- Comprehensive CI/CD workflows
- NSM security classifications
- GDPR compliance features
- DigDir standards compliance"

git push origin main
```

### Step 5: Configure Template Settings

1. Go to repository **Settings** → **General**
2. Under **Features**, check **Template repository**
3. Under **Template repository**, add:
   - **Description**: "Template for creating Norwegian-compliant enterprise packages"
   - **Include all branches**: ✅ Checked
   - **Preview link**: Add documentation URL if available

## Using the Template

### Creating a New Package

1. **Use the template** on GitHub:
   - Go to `https://github.com/Xala-Technologies/xala-enterprise-package-template`
   - Click **"Use this template"** → **"Create a new repository"**

2. **Configure the new repository**:

   ```
   Repository name: Xala-Enterprise-[PackageName]
   Description: [Package description]
   Visibility: Private/Public
   ```

3. **Clone and setup**:

   ```bash
   git clone https://github.com/Xala-Technologies/Xala-Enterprise-[PackageName].git
   cd Xala-Enterprise-[PackageName]

   # Run the setup script
   node scripts/setup-template.js
   ```

4. **Follow the interactive setup**:

   ```
   📦 Package name: authentication
   🏷️ Package display name: Authentication
   📝 Package description: Norwegian government-compliant authentication with ID-porten, BankID, and Feide integration for municipal and enterprise applications
   🏢 GitHub organization: Xala-Technologies
   🔒 NSM Security Classification: BEGRENSET
   ```

5. **Complete the setup**:

   ```bash
   # Install dependencies
   pnpm install

   # Verify setup
   pnpm run typecheck
   pnpm run lint
   pnpm run compliance:quick

   # Initial commit
   git add .
   git commit -m "feat: initialize authentication package from template"
   git push origin main
   ```

## Package List for Creation

Create these 11 packages using the template:

### 1. @xala-technologies/authentication

```bash
Package name: authentication
Display name: Authentication
Description: Multi-modal authentication with Norwegian government integration including ID-porten, BankID, and Feide for secure citizen and employee access
NSM Classification: KONFIDENSIELT
```

### 2. @xala-technologies/business-services

```bash
Package name: business-services
Display name: Business Services
Description: Domain-agnostic business logic patterns and workflows with Norwegian municipal process automation and approval systems
NSM Classification: BEGRENSET
```

### 3. @xala-technologies/platform-services

```bash
Package name: platform-services
Display name: Platform Services
Description: Infrastructure concerns and external system integrations with Norwegian cloud providers and government APIs
NSM Classification: BEGRENSET
```

### 4. @xala-technologies/monitoring-services

```bash
Package name: monitoring-services
Display name: Monitoring Services
Description: Comprehensive observability and performance monitoring with Norwegian KPI dashboards and NSM incident response automation
NSM Classification: BEGRENSET
```

### 5. @xala-technologies/security-compliance

```bash
Package name: security-compliance
Display name: Security Compliance
Description: Automated Norwegian compliance and security enforcement with NSM classifications, GDPR automation, and vulnerability management
NSM Classification: KONFIDENSIELT
```

### 6. @xala-technologies/norwegian-services

```bash
Package name: norwegian-services
Display name: Norwegian Services
Description: Norwegian government API integrations including Altinn, Enhetsregisteret, Folkeregisteret, and municipal system connectors
NSM Classification: BEGRENSET
```

### 7. @xala-technologies/data-services

```bash
Package name: data-services
Display name: Data Services
Description: Multi-database support with Norwegian data governance, GDPR compliance, and automatic data classification and protection
NSM Classification: KONFIDENSIELT
```

### 8. @xala-technologies/document-services

```bash
Package name: document-services
Display name: Document Services
Description: Document management with Norwegian archival standards, Noark 5 compliance, and electronic signature integration
NSM Classification: BEGRENSET
```

### 9. @xala-technologies/ui-system

```bash
Package name: ui-system
Display name: UI System
Description: Enterprise-grade component library with Norwegian compliance, WCAG 2.2 AA accessibility, and multi-language support
NSM Classification: ÅPEN
```

### 10. @xala-technologies/test-infrastructure

```bash
Package name: test-infrastructure
Display name: Test Infrastructure
Description: Comprehensive testing framework with Norwegian compliance validation, accessibility testing, and municipal workflow simulation
NSM Classification: ÅPEN
```

### 11. @xala-technologies/api-scaffolding

```bash
Package name: api-scaffolding
Display name: API Scaffolding
Description: Automated API generation from domain models with Norwegian compliance, OpenAPI documentation, and government integration patterns
NSM Classification: BEGRENSET
```

## Template Maintenance

### Updating the Template

When you need to update the template (e.g., dependency updates, new compliance requirements):

1. **Update the template repository**:

   ```bash
   cd xala-enterprise-package-template
   # Make changes to template files
   git add .
   git commit -m "feat: update template with new compliance requirements"
   git push origin main
   ```

2. **Update existing packages**:

   ```bash
   # For each package repository
   cd Xala-Enterprise-[PackageName]

   # Pull template changes manually or use automated sync
   # Update package.json, CI/CD workflows, etc.

   git add .
   git commit -m "chore: sync with latest template"
   git push origin main
   ```

### Automated Template Sync

Consider setting up GitHub Actions to automatically sync template changes:

```yaml
# .github/workflows/template-sync.yml
name: Template Sync
on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync with template
        uses: AndreasAugustin/actions-template-sync@v0.7.3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          source_repo_path: Xala-Technologies/xala-enterprise-package-template
```

## Quality Gates

Each package created from the template must pass these quality gates:

### 1. Initial Setup Validation

- ✅ All template variables replaced correctly
- ✅ TypeScript compilation successful
- ✅ ESLint passes with zero warnings
- ✅ Norwegian compliance validation passes

### 2. Development Standards

- ✅ 95%+ test coverage
- ✅ All CI/CD workflows pass
- ✅ Bundle size within limits
- ✅ Norwegian compliance features implemented

### 3. Production Readiness

- ✅ Security scan passes
- ✅ Accessibility validation (WCAG 2.2 AA)
- ✅ Performance benchmarks met
- ✅ Documentation complete

## Support and Troubleshooting

### Common Issues

1. **Template variables not replaced**:

   ```bash
   # Re-run the setup script
   node scripts/setup-template.js
   ```

2. **TypeScript compilation errors**:

   ```bash
   # Check for missing types
   pnpm add -D @types/node @types/jest
   ```

3. **Norwegian compliance validation fails**:
   ```bash
   # Run detailed compliance check
   pnpm run compliance:full
   ```

### Getting Help

- 📧 Template Issues: Create issue in template repository
- 📖 Documentation: Check `xala-package-skeleton.md`
- 🇳🇴 Norwegian Compliance: Review compliance documentation
- 🛠️ Technical Support: Contact Xala Technologies team

## Conclusion

This template repository provides a robust foundation for creating consistent, Norwegian-compliant packages across the entire Xala Enterprise ecosystem. By following this setup guide, you ensure that all packages maintain the same high standards for quality, security, and compliance while accelerating development velocity.

The template handles the complex configuration patterns, Norwegian compliance requirements, and multi-platform optimizations automatically, allowing developers to focus on implementing package-specific functionality rather than infrastructure concerns.
